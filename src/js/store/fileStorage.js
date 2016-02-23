import createReducer from './createReducer'
import Profiler from '../Profiler'
import parser from '../ast/parser'
import estraverse from '../../../lib/estraverse'
import escodegen from 'escodegen'

let id = 1

function addTextToNode (ast) {
    ast.text = escodegen.generate(ast)
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

function getFunctionsFromAst (ast, functionsToCompare) {
    let stop = Profiler.start('ast to functions')
    let functions = []

    estraverse.traverse(ast, {
        enter(node, parent) {
            if (node.type === 'JSXElement') {
                // unknown to estraverse
                return estraverse.VisitorOption.Skip
            }

            // code generated from FunctionExpression are not parseable again, skip for now
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                // console.log(node, escodegen.generate(node))

                // always regenerate text for node, because this node could
                // contain a function which was changed. Could be skipped when
                // `node.text` is already there and we can make sure this node
                // contains no other function.
                addTextToNode(node)

                // update or assign custom id
                if (!node.customId) {
                    // check if we previously known that function already
                    let foundFunction
                    if (functionsToCompare) {
                        foundFunction = functionsToCompare.find(f => node.text === f.text)
                    }
                    if (foundFunction) {
                        node.customId = foundFunction.customId
                    } else {
                        node.customId = id++
                    }
                }
                functions.push(node)
            }
        }
    })
    // sort descending by content length
    functions = functions.sort((a, b) => (a.end - a.start) - (b.end - b.start))
    stop()
    return functions
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
        file.functions = getFunctionsFromAst(file.ast).map(f => {
            f.fileId = file.id
            return f
        })
    } else {
        file.content = content
        file.functions = []
    }

    return file
}

const initialState = [
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
`),

    createFileFromContent('foo/b.js', 'export default function test (pA, pB) { return pA+pB } ')

]

export const FUNCTION_CONTENT_UPDATED = 'FUNCTION_CONTENT_UPDATED '

export const updateFunctionContent = (params) => {
    return Object.assign({}, params, {
        type: FUNCTION_CONTENT_UPDATED
    })
}

let fileStorage = {
    [FUNCTION_CONTENT_UPDATED]: (state, action) => {
        const {newContent, oldFunction} = action

        let stop = Profiler.start('--content update')
        let ast = parseCode(newContent)
        if (!ast) {
            stop()
            // broken code, wait for working code
            return state
        }
        // ast parsing wraps content always in a "programm node"
        let newFunction
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
        addTextToNode(newFunction)
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
        file.content = escodegen.generate(file.ast)
        file.functions = getFunctionsFromAst(file.ast, file.functions).map(f => {
            f.fileId = file.id
            return f
        })

        // update state identity, so change is triggered in redux
        let newState = state.map(f => {
            if (f.id === file.id) {
                return file
            } else {
                return f
            }
        })
        stop()
        return newState
    }
}

export default createReducer(initialState, fileStorage)
