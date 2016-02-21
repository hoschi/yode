import createReducer from './createReducer'
import Profiler from '../Profiler'
import parser from '../ast/parser'
import estraverse from '../../../lib/estraverse'
import escodegen from 'escodegen'

let id = 0

function parseCode (text) {
    let stop = Profiler.start('code to ast')
    let ast = parser.parse(text, {
        plugins: {
            jsx: true
        },
        ecmaVersion: 6,
        sourceType: 'module',
        locations: true
    })
    stop()
    return ast
}

function getFunctionsFromAst (content, ast) {
    let stop = Profiler.start('ast to functions')
    let functions = []

    estraverse.traverse(ast, {
        enter(node, parent) {
            if (node.type === 'JSXElement') {
                // unknown to estraverse
                return estraverse.VisitorOption.Skip
            }

            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression' || node.type === 'FunctionExpression') {
                let length = node.end - node.start
                node.id = id++
                node.text = content.substr(node.start, length)
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
    file.content = escodegen.generate(parseCode(content))
    // refresh ast from formatted code
    file.ast = parseCode(file.content)
    file.functions = getFunctionsFromAst(file.content, file.ast)

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

    let assignedFunction = function (a, b) {
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

    createFileFromContent('foo/b.js', `export default function test (pA, pB) {
return pA+pB
}
`)

]

let fileStorage = {}

export default createReducer(initialState, fileStorage)
