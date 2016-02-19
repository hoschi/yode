import createReducer from './createReducer'
import parser from '../parser'
import Profiler from '../Profiler'

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

function createFileFromContent (path, content) {
    return {
        id: path,
        path,
        content,
        ast: parseCode(content)
    }
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
        return <div>
                   <div style={ styleBase }>
                       <Editor content={ fileContent } />
                   </div>
                   <div style={ styleRight }>
                       <FunctionsView ast={ ast } />
                   </div>
               </div>
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
