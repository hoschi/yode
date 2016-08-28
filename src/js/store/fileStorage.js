import createReducer from './createReducer'
import Profiler from '../Profiler'
import {parse, print, estraverse} from '../ast/parser-recast';
import * as difflib from 'difflib'
import R from 'ramda'

let id = 1

function isEditorDirty (node) {
    return node.text !== node.unformattedText
}

function addTextToNode (ast) {
    ast.text = print(ast)
}

function getClosestMatchIndex (searchTerm, possibilities) {
    let matcher = new difflib.SequenceMatcher()
    matcher.setSeq2(searchTerm)
    let cutoff = 0.6
    let results = []

    // check identity match first, ratio compution takes time
    let identityMatchIndex = possibilities.findIndex(text => text === searchTerm)
    if (identityMatchIndex >= 0) {
        return identityMatchIndex
    }

    // search for close match
    possibilities.forEach(function (testText, i) {
        matcher.setSeq1(testText)
        if (matcher.realQuickRatio() >= cutoff &&
            matcher.quickRatio() >= cutoff) {
            let score = matcher.ratio()
            if (score >= cutoff) {
                results.push({
                    text: testText,
                    index: i,
                    score: score
                })
            }
        }
    })

    if (results.length <= 0) {
        console.log('no match found', searchTerm, possibilities)
        // nothing found
        return -1
    }

    // sortBy prop ascending and reverse to have descending sorted results by score
    let sorted = R.sortBy(R.prop('score'), results).reverse()
    let bestMatch = R.head(sorted)
    console.log('match found', searchTerm, bestMatch.score, sorted)
    return bestMatch.index
}

function parseCode (text) {
    let stop = Profiler.start('code to ast')
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
    let stop = Profiler.start('ast to functions')
    let functions = []
    let functionsToCompareLeft

    if (functionsToCompare) {
        functionsToCompareLeft = [].concat(functionsToCompare)
    }

    estraverse.traverse(ast, {
        enter(node, parent) {
            if (node.type === 'JSXElement') {
                // unknown to estraverse
                return estraverse.VisitorOption.Skip
            }

            // code generated from FunctionExpression are not parseable again, skip for now
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
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
                    // contain a function which was changed. Could be skipped when
                    // `node.text` is already there and we can make sure this node
                    // contains no other function.
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
                        foundFunctionIndex = getClosestMatchIndex(node.text, functionsToCompareLeft.map(f => f.text))
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
                functions.push(node)
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

    // sort descending by text length
    functions = functions.sort((a, b) => (a.end - a.start) - (b.end - b.start))
    stop()
    return functions
}

function createNewStateWithFile (oldState, file) {
    // update state identity, so change is triggered in redux
    return oldState.map(f => {
        if (f.id === file.id) {
            return file
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
    let {ast} = parseCode(text)
    if (ast) {
        file.text = print(ast)
        // refresh ast from formatted code
        let {ast: astFormatted} = parseCode(file.text)
        file.ast = astFormatted
        file.functions = getFunctionsFromAst(file.ast, file.id)
    } else {
        file.text = text
        file.functions = []
    }

    file.unformattedText = file.text

    return file
}

const initialState = [
    createFileFromText('foo/b.js', 'export default function test (pA, pB) { return pA+pB } '),

    createFileFromText('foo/a.js', `
import editor from './editor'
import functionsView from './functionsView'
import { connect } from 'react-redux'

const MainSection = (React) => {
    const FunctionsView = functionsView(React)
    const Editor = editor(React)

    let selectState = ({fileStorage}) => {
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

    function functionWithName () {
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
        return 'no jsx because of escodegen'
    })
}

export default MainSection
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

let fileStorage = {
    [FORMAT_CODE]: (state) => {
        return state.map(file => {
            // format functions
            file.functions = file.functions.map(f => {
                f.unformattedText = f.text
                return f
            })

            if (isEditorDirty(file)) {
                // generate formatted text
                file.text = print(file.ast)
                // set unformatted text to new text
                file.unformattedText = file.text
            }
            return file
        })
    },

    [FUNCTION_TEXT_UPDATED]: (state, action) => {
        const {newText, oldFunction} = action
        let newState, newFunction

        let stop = Profiler.start('--text update')
        let file = state.find(file => file.id === oldFunction.fileId)
        let {error: syntaxError, ast} = parseCode(newText)
        if (syntaxError) {
            // broken code, wait for working code
            file.functions = file.functions.map(f => {
                if (f.customId === oldFunction.customId) {
                    // set new state for editor
                    f.syntaxError = syntaxError
                    f.unformattedText = newText
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

        // replace new ast in file
        file.ast = estraverse.replace(file.ast, {
            enter(node, parent) {
                if (node.type === 'JSXElement') {
                    // unknown to estraverse
                    return this.skip()
                }

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
        }

        // get functions to compare, current changed one can be matched
        let functionsToCompare = file.functions.filter(f => newFunction.customId !== f.customId)
        // update functions and port props from already known functions
        file.functions = getFunctionsFromAst(file.ast, file.id, functionsToCompare)

        newState = createNewStateWithFile(state, file)
        stop()
        return newState
    },

    [FILE_TEXT_UPDATED]: (state, action) => {
        const {newText, file} = action
        let newState

        let stop = Profiler.start('--file text update')
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
        // add unformatted text for editor
        file.unformattedText = newText

        file.functions = getFunctionsFromAst(file.ast, file.id, file.functions)
        newState = createNewStateWithFile(state, file)
        stop()
        return newState
    }
}

export default createReducer(initialState, fileStorage)
