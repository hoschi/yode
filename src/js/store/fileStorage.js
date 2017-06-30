import createReducer from './createReducer'
import R from 'ramda'
import Profiler from '../Profiler'
// SWAP ALSO IN EDITOR REDUCER
//import parser from '../ast/parser-recast';
import parser from '../ast/parser-recast-jsx';
//import parser from '../ast/parser-recast-babylon';
//import parser from '../ast/parser-acorn';
//import parser from '../ast/parser-acorn-jsx';
import { getFunctionIndexByText } from '../ast/functionHelper';

let {estraverse} = parser;
function parse (...args) {
    //let stop = Profiler.start('parse', true);
    let r = parser.parse.apply(parser, args);
    //stop();
    return r;
}
function print (...args) {
    //let stop = Profiler.start('--- print', true);
    let r = parser.print.apply(parser, args);
    //stop();
    return r;
}

let id = 1

function isEditorDirty (node) {
    return node.text !== node.unformattedText
}

function addTextToNode (ast) {
    ast.text = print(ast)
}

function parseCode (text) {
    let stop = Profiler.start('-- code to ast')
    let ast
    try {
        ast = parse(text)
    } /* eslint-disable */ catch ( error ) /* eslint-enable */ {
        console.log(error)
        stop()
        return {
            error
        }
    }
    stop()
    return {
        ast
    }
}

function getFunctionsFromAst (ast, fileId, functionsToCompare) {
    let stop = Profiler.start('-- ast to functions')
    let functions = []
    let functionsToCompareLeft

    if (functionsToCompare) {
        functionsToCompareLeft = [].concat(functionsToCompare)
    }

    let parentFunc;
    let currentFunc = {
        children: [],
        isRoot: true
    };
    let functionsTreeRoot = currentFunc;

    let addNodeToParent = (node) => {
        parentFunc = currentFunc;
        if (parentFunc) {
            if (parentFunc.children) {
                parentFunc.children.push(node);
            } else {
                parentFunc.children = [node];
            }
        }
        currentFunc = node;
        node.parentFunction = parentFunc;
    }

    let leaveFunctionNode = () => {
        currentFunc = parentFunc;
        if (currentFunc) {
            parentFunc = currentFunc.parentFunction;
        } else {
            parentFunc = undefined;
        }
    }

    estraverse.traverse(ast, {
        enter(node) {
            // code generated from FunctionExpression are not parseable again, skip for now
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                addNodeToParent(node);
                if (node.unformattedText === node.text) {
                    // update both, because this can't disturb user input.
                    // Editor text and generated text are in sync. This is
                    // important when node.text changed from outside. E.g. when
                    // changing an inner function of this function node. In
                    // this case the generated text is not the text which is in
                    // the editor, because the ast changed, not the editor.
                    //
                    // TODO this can be removed when we track function containment, then we can replace the changed function AST in all containers not only file AST
                    addTextToNode(node)
                    node.unformattedText = node.text
                } else {
                    // always regenerate text for node, because this node could
                    // contain a function which was changed.
                    //
                    // TODO Could be skipped when `node.text` is already there
                    // and we can make sure this node contains no other
                    // function.
                    addTextToNode(node)
                }

                // AST nodes can't have syntax error, only unformatted code can
                node.syntaxError = undefined

                if (!node.unformattedText) {
                    // set unformatted (starting) text to node in case this is first run
                    node.unformattedText = node.text
                }

                // update or assign custom id
                if (node.customId) {
                    if (functionsToCompareLeft) {
                        // remove from compare list, we know this function by id
                        let currentFunctionIndex = functionsToCompareLeft.findIndex(f => f.customId === node.customId)
                        if (currentFunctionIndex >= 0) {
                            functionsToCompareLeft.splice(currentFunctionIndex, 1)
                        }
                    }
                } else {
                    // check if we previously known that function already
                    let foundFunctionIndex
                    if (functionsToCompareLeft) {
                        foundFunctionIndex = getFunctionIndexByText(node.text, functionsToCompareLeft)
                    }
                    if (foundFunctionIndex >= 0) {
                        let foundFunction = functionsToCompareLeft[foundFunctionIndex]
                        node.customId = foundFunction.customId
                        // restore dirty editor state if needed
                        if (isEditorDirty(foundFunction)) {
                            node.unformattedText = foundFunction.unformattedText
                            node.syntaxError = foundFunction.syntaxError
                        }
                        // remove function we found
                        functionsToCompareLeft.splice(foundFunctionIndex, 1)
                    } else {
                        node.customId = id++
                    }
                }
                node.fileId = fileId
                // create new object to change identity, so redux subscriptions work as expected
                functions.push({
                    ...node
                })
            }
        },
        leave(node) {
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                leaveFunctionNode(node)
            }
        }
    })

    // do some info logging
    if (functionsToCompareLeft && functionsToCompareLeft.length > 0) {
        console.log('REMOVED FUNCTIONS', functionsToCompareLeft.length, functionsToCompareLeft)
        functionsToCompareLeft.forEach(function (node) {
            console.log('++', node.text)
        })
    }

    stop()
    return {
        functions,
        functionsTreeRoot
    }
}

export let getFileOfFunction = (files, functionId) => files.find(file => file.id === functionId)

function createNewStateWithFile (oldState, file) {
    // update state identity, so change is triggered in redux
    return oldState.map(f => {
        if (f.id === file.id) {
            // create new object to change identity, so redux subscriptions work as expected
            return {
                ...file
            }
        } else {
            return f
        }
    })
}

function createFileFromText (path, text) {
    let file = {
        id: path,
        syntaxError: undefined,
        path
    }
    // create formatted code
    let {error: syntaxError, ast} = parseCode(text)
    if (ast) {
        file.text = print(ast)
        // refresh ast from formatted code
        let {ast: astFormatted} = parseCode(file.text)
        file.ast = astFormatted
        let {functions, functionsTreeRoot} = getFunctionsFromAst(file.ast, file.id)
        functions.forEach((node) => {
            // create text for each function at start, because recast can't
            // keep all formatting when parsing code snippets instead of code
            // in file
            node.text = print(node);
            // and use this as editor text, so we don't start with "dirty" editors
            node.unformattedText = node.text
        });
        file.functions = functions;
        file.functionsTreeRoot = functionsTreeRoot
        // set text in node
        file.ast.text = file.ast.unformattedText = file.text;
    } else {
        file.text = text
        file.functions = []
        file.functionsTreeRoot = {
            children: [],
            isRoot: true
        }
        file.syntaxError = syntaxError
        file.hasConnectedError = true
    }

    file.unformattedText = file.text

    return file
}

let getFileById = R.curry((files, searchId) => (
R.find(R.propEq('id', searchId), files)
))

export let selectAllFiles = (state) => state.editor.fileStorage

export let selectOpenFiles = (state) => {
    let allFiles = selectAllFiles(state)
    let openIds = state.editor.fileEditorIds
    let files = openIds.map(getFileById(allFiles))
    return files
}

export let selectFilesWithOpenState = (state) => {
    let files = selectAllFiles(state)
    let openIds = state.editor.fileEditorIds
    let isFileWithIdOpen = R.contains(R.__, openIds)
    return R.map((file) => ({
        isOpen: isFileWithIdOpen(file.id),
        file
    }), files)
}

let getFunctionById = R.curry((functions, searchId) => (
R.find(R.propEq('customId', searchId), functions)
))

export let selectFunctions = (state) => {
    let allFunctions = R.chain(R.prop('functions'), state.editor.fileStorage);
    let openIds = state.editor.functionEditorIds;
    let functions = openIds.map(getFunctionById(allFunctions))
    return functions
}

export let createSelectFileOfFunction = () => (state, {functionNode}) => {
    let files = selectAllFiles(state)
    return getFileById(files, functionNode.fileId)
}

const initialState = [
    createFileFromText('actions.js', `
// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/actions/index.js
import * as types from '../constants/ActionTypes'

export const addTodo = (text) => ({
  type: types.ADD_TODO,
  text
})
export const deleteTodo = id => ({
  type: types.DELETE_TODO,
  id
})
export const editTodo = (id, text) => ({
  type: types.EDIT_TODO,
  id,
  text
})
export const completeTodo = id => ({
  type: types.COMPLETE_TODO,
  id
})
export const completeAll = () => ({
  type: types.COMPLETE_ALL
})
export const clearCompleted = () => ({
  type: types.CLEAR_COMPLETED
})
`),

    createFileFromText('actions.spec.js', `
// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/actions/index.spec.js
import * as types from '../constants/ActionTypes'
import * as actions from './index'

describe('todo actions', () => {
  it('addTodo should create ADD_TODO action', () => {
    expect(actions.addTodo('Use Redux')).toEqual({
      type: types.ADD_TODO,
      text: 'Use Redux'
    })
  })

  it('deleteTodo should create DELETE_TODO action', () => {
    expect(actions.deleteTodo(1)).toEqual({
      type: types.DELETE_TODO,
      id: 1
    })
  })

  it('editTodo should create EDIT_TODO action', () => {
    expect(actions.editTodo(1, 'Use Redux everywhere')).toEqual({
      type: types.EDIT_TODO,
      id: 1,
      text: 'Use Redux everywhere'
    })
  })

  it('completeTodo should create COMPLETE_TODO action', () => {
    expect(actions.completeTodo(1)).toEqual({
      type: types.COMPLETE_TODO,
      id: 1
    })
  })

  it('completeAll should create COMPLETE_ALL action', () => {
    expect(actions.completeAll()).toEqual({
      type: types.COMPLETE_ALL
    })
  })

  it('clearCompleted should create CLEAR_COMPLETED action', () => {
    expect(actions.clearCompleted()).toEqual({
      type: types.CLEAR_COMPLETED
    })
  })
})
`),

    createFileFromText('Header.js', `
// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/components/Header.js
// modified to use arrow functions instead of class syntax
import React, { PropTypes, Component } from 'react'
import TodoTextInput from './TodoTextInput'

export default ({addTodo}) => {
  let handleSave = (text) => {
    if (text.length !== 0) {
      addTodo(text)
    }
  }

  return (
    <header className="header">
      <h1>todos</h1>
      <TodoTextInput newTodo
                     onSave={handleSave}
                     placeholder="What needs to be done?" />
    </header>
  )
};
`),

    createFileFromText('Header.spec.js', `
// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/components/Header.spec.js
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Header from './Header'
import TodoTextInput from './TodoTextInput'

const setup = () => {
  const props = {
    addTodo: jest.fn()
  }

  const renderer = TestUtils.createRenderer()
  renderer.render(<Header {...props} />)
  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output,
    renderer: renderer
  }
}

describe('components', () => {
  describe('Header', () => {
    it('should render correctly', () => {
      const { output } = setup()

      expect(output.type).toBe('header')
      expect(output.props.className).toBe('header')

      const [ h1, input ] = output.props.children

      expect(h1.type).toBe('h1')
      expect(h1.props.children).toBe('todos')

      expect(input.type).toBe(TodoTextInput)
      expect(input.props.newTodo).toBe(true)
      expect(input.props.placeholder).toBe('What needs to be done?')
    })

    it('should call addTodo if length of text is greater than 0', () => {
      const { output, props } = setup()
      const input = output.props.children[1]
      input.props.onSave('')
      expect(props.addTodo).not.toBeCalled()
      input.props.onSave('Use Redux')
      expect(props.addTodo).toBeCalled()
    })
  })
})
`)

]

export const FUNCTION_TEXT_UPDATED = 'FUNCTION_TEXT_UPDATED '
export const updateFunctionText = (params) => {
    return Object.assign({}, params, {
        type: FUNCTION_TEXT_UPDATED
    })
}

export const FILE_TEXT_UPDATED = 'FILE_TEXT_UPDATED '
export const updateFileText = (params) => {
    return Object.assign({}, params, {
        type: FILE_TEXT_UPDATED
    })
}

export const FORMAT_CODE = 'FORMAT_CODE '
export const formatCode = () => {
    return {
        type: FORMAT_CODE
    }
}

export const ADD_FILE_TO_STORAGE = 'ADD_FILE_TO_STORAGE'
export const addFileToStorage = (path, text) => ({
    type: ADD_FILE_TO_STORAGE,
    path,
    text
})

let fileStorage = {
    [FORMAT_CODE]: (state) => {
        return state.map(file => {
            // format functions
            file.functions = file.functions.map(f => {
                return {
                    ...f,
                    unformattedText: f.text
                }
            })

            if (isEditorDirty(file)) {
                return {
                    ...file,
                    // generate formatted text
                    text: print(file.ast),
                    // set unformatted text to new text
                    unformattedText: file.text
                }
            }
            return file
        })
    },

    [ADD_FILE_TO_STORAGE]: (state, {path, text}) => {
        return state.concat([createFileFromText(path, text)])
    },

    [FUNCTION_TEXT_UPDATED]: (state, action) => {
        const {newText, oldFunction} = action
        let newState,
            newFunction

        let stop = Profiler.start('- text update')
        let file = getFileOfFunction(state, oldFunction.fileId)
        let {error: syntaxError, ast} = parseCode(newText)
        if (syntaxError) {
            // broken code, wait for working code
            file.functions = file.functions.map(f => {
                if (f.customId === oldFunction.customId) {
                    // set new state for editor
                    return {
                        ...f,
                        syntaxError,
                        unformattedText: newText
                    }
                }
                return f
            })
            file.hasConnectedError = true;
            newState = createNewStateWithFile(state, file)
            stop()
            return newState
        }

        // error of this file is gone
        oldFunction.syntaxError = undefined
        // error of the whole file is now gone, because this is the only editor which can be edited and change the error state
        file.hasConnectedError = false;

        // ast parsing wraps text in other nodes, because it parses it standalone and out of context of original text
        estraverse.traverse(ast, {
            // search for node with same type as old function and save that one instead
            enter(node) {
                if (node.type === oldFunction.type) {
                    newFunction = node
                    this.break()
                }
            }
        })

        if (!newFunction) {
            // not found, uh oh?!
            throw new Error('old node type not found')
        }
        // add formatted text for function node comparision
        addTextToNode(newFunction)
        // add unformatted text for editor
        newFunction.unformattedText = newText
        // save old id, because it is still the same function
        newFunction.customId = oldFunction.customId

        // replace ast of old function, with ast generated from newText, in file ast
        file.ast = estraverse.replace(file.ast, {
            enter(node) {
                if (node.customId === newFunction.customId) {
                    return newFunction
                }
            }
        })

        // update file text with merged ast
        let fileText = print(file.ast)

        // update text if possible
        if (!isEditorDirty(file)) {
            // in sync, update
            file.text = fileText
            file.unformattedText = fileText
            file.ast.text = fileText
            file.ast.unformattedText = fileText
        }

        // get functions to compare, current changed one can't be matched
        let functionsToCompare = file.functions.filter(f => newFunction.customId !== f.customId)
        // update functions and port props from already known functions
        let {functions, functionsTreeRoot} = getFunctionsFromAst(file.ast, file.id, functionsToCompare)
        file.functions = functions;
        file.functionsTreeRoot = functionsTreeRoot

        newState = createNewStateWithFile(state, file)
        stop()
        return newState
    },

    [FILE_TEXT_UPDATED]: (state, action) => {
        const {newText, file} = action
        let newState

        let stop = Profiler.start('- file text update')
        let {error: syntaxError, ast} = parseCode(newText)
        if (syntaxError) {
            // broken code, wait for working code
            file.syntaxError = syntaxError
            file.unformattedText = newText
            file.hasConnectedError = true;
            newState = createNewStateWithFile(state, file)
            stop()
            return newState
        }
        file.syntaxError = undefined
        // error of the whole file is now gone, because this is the only editor which can be edited and change the error state
        file.hasConnectedError = false;

        file.ast = ast
        file.text = print(ast);
        // add unformatted text for editor
        file.unformattedText = newText
        file.ast.text = newText
        file.ast.unformattedText = newText

        let {functions, functionsTreeRoot} = getFunctionsFromAst(file.ast, file.id, file.functions)
        file.functions = functions;
        file.functionsTreeRoot = functionsTreeRoot
        newState = createNewStateWithFile(state, file)
        stop()
        return newState
    }
}

export default createReducer(initialState, fileStorage)
