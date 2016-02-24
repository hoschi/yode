import createReducer from './createReducer'
import Profiler from '../Profiler'
import parser from '../ast/parser'
import estraverse from '../../../lib/estraverse'
import escodegen from 'escodegen'
import * as difflib from 'difflib'
import R from 'ramda'

let id = 1

function addTextToNode (ast) {
    ast.text = escodegen.generate(ast)
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
        ast = parser.parse(text, {
            // plugins: {
            // jsx: true
            // },
            ecmaVersion: 6,
            sourceType: 'module',
            locations: true
        })
    } /* eslint-disable */ catch ( e ) /* eslint-enable */ {
        console.log(e)
        stop()
        return undefined
    }
    stop()
    return ast
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
                // always regenerate text for node, because this node could
                // contain a function which was changed. Could be skipped when
                // `node.text` is already there and we can make sure this node
                // contains no other function.
                addTextToNode(node)

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
                        if (foundFunction.text !== foundFunction.unformattedText) {
                            node.unformattedText = foundFunction.unformattedText
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

    // sort descending by content length
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

function createFileFromContent (path, content) {
    let file = {
        id: path,
        path
    }
    // create formatted code
    let ast = parseCode(content)
    if (ast) {
        file.content = escodegen.generate(ast)
        // refresh ast from formatted code
        file.ast = parseCode(file.content)
        file.functions = getFunctionsFromAst(file.ast, file.id)
    } else {
        file.content = content
        file.functions = []
    }

    file.unformattedContent = file.content

    return file
}

const initialState = [
    createFileFromContent('foo/b.js', 'export default function test (pA, pB) { return pA+pB } '),

    createFileFromContent('foo/a.js', `
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
        let fileContent = fileStorage[0].content
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

export const FUNCTION_CONTENT_UPDATED = 'FUNCTION_CONTENT_UPDATED '
export const updateFunctionContent = (params) => {
    return Object.assign({}, params, {
        type: FUNCTION_CONTENT_UPDATED
    })
}

export const FILE_CONTENT_UPDATED = 'FILE_CONTENT_UPDATED '
export const updateFileContent = (params) => {
    return Object.assign({}, params, {
        type: FILE_CONTENT_UPDATED
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

            if (file.content !== file.unformattedText) {
                // generate formatted text
                file.content = escodegen.generate(file.ast)
                // set unformatted text to new content
                file.unformattedContent = file.content
            }
            return file
        })
    },

    [FUNCTION_CONTENT_UPDATED]: (state, action) => {
        const {newContent, oldFunction} = action

        let stop = Profiler.start('--content update')
        let ast = parseCode(newContent)
        if (!ast) {
            stop()
            // broken code, wait for working code
            return state
        }
        let newFunction
        // ast parsing wraps content in other nodes, because it parses it standalone and out of context of original text
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
        newFunction.unformattedText = newContent
        // save old id, because it is still the same function
        newFunction.customId = oldFunction.customId

        let file = state.find(file => file.id === oldFunction.fileId)
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

        // update file content with merged ast
        let fileContent = escodegen.generate(file.ast)

        // update content if possible
        if (file.content === file.unformattedContent) {
            // in sync, update
            file.content = fileContent
            file.unformattedContent = fileContent
        }
        // TODO add ui to show unsynced state or solve problem of putting valid code in invalid file/outer function

        // get functions to compare, current changed one can be matched
        let functionsToCompare = file.functions.filter(f => newFunction.customId !== f.customId)
        // update functions and port props from already known functions
        file.functions = getFunctionsFromAst(file.ast, file.id, functionsToCompare)

        let newState = createNewStateWithFile(state, file)
        stop()
        return newState
    },

    [FILE_CONTENT_UPDATED]: (state, action) => {
        const {newContent, file} = action

        let stop = Profiler.start('--file content update')
        let ast = parseCode(newContent)
        if (!ast) {
            stop()
            // broken code, wait for working code
            return state
        }
        file.ast = ast
        // add unformatted text for editor
        file.unformattedContent = newContent

        file.functions = getFunctionsFromAst(file.ast, file.id, file.functions)
        let newState = createNewStateWithFile(state, file)
        stop()
        return newState
    }
}

export default createReducer(initialState, fileStorage)
