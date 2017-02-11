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
    }

    file.unformattedText = file.text

    return file
}

let getFileById = R.curry((files, searchId) => (
R.find(R.propEq('id', searchId), files)
))

export let selectAllFiles = (state) => state.editor.fileStorage

export let selectOpenFiles = (state) => {
    let allFiles = state.editor.fileStorage
    let openIds = state.editor.fileEditorIds
    let files = openIds.map(getFileById(allFiles))
    return files
}

export let selectFilesWithOpenState = (state) => {
    let files = state.editor.fileStorage
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

const initialState = [
    createFileFromText('foo/Shell.js', `
import React from 'react';
import muiThemeConfig from 'muiThemeConfig';
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import ControlsContainer from './ControlsContainer'

const Shell = ({children}) => {
    return <div>
               <Paper style={ style.pinnedArea } zDepth={ 2 }>
                   <AppBar title="NFBE Prototype" showMenuIconButton={ false } zDepth={ 0 } />
                   <ControlsContainer />
               </Paper>
               <div style={ style.mainArea }>
                   { children }
               </div>
           </div>
}

export default Shell

let style;
{
    let pinnedAreaHeight = 148;
    style = {
        pinnedArea: {
            position: 'fixed',
            top: 0,
            width: '100%',
            backgroundColor: muiThemeConfig.palette.primary1Color,
            zIndex: 5
        },
        mainArea: {
            marginTop: pinnedAreaHeight
        }
    }
}
`),

    createFileFromText('foo/a.js', `
import editor from './editor'
import functionsView from './functionsView'
import { connect } from 'react-redux'

const MainSection = (React) => {
    const FunctionsView = functionsView(React)
    const Editor = editor(React)

    let selectState = ({fileStorage}) => {
        let innerOne = () => 'inner one'
        let innerTwo = () => 'inner two'
        return {
            fileStorage
        }
    }

    let assignedFunction = (a, b) => {
        if (a) {
            return 'a'
        } else {
            return 'b'
        }
    }

    function functionWithName() {
        return 'simple'
    }

    return connect(selectState)(({fileStorage}) => {
        let fileText = fileStorage[0].text
        let ast = fileStorage[0].ast
        let width = 500
        let height = 500
        let styleBase = {
            position: 'absolute',
            height: height,
            width: width,
            top: 0,
            left: 0
        }

        let styleRight = Object.assign({}, styleBase, {
            left: width
        })
    })
}

const SecondSection = () => {
  return 'cool jsx stuff here'
}

export default MainSection`)

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
            newState = createNewStateWithFile(state, file)
            stop()
            return newState
        }

        oldFunction.syntaxError = undefined
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
            newState = createNewStateWithFile(state, file)
            stop()
            return newState
        }
        file.syntaxError = undefined
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
