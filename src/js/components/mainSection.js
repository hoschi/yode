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

    return connect(selectState)(({fileStorage}) => {
        let fileContent = fileStorage[0].content
        let ast = fileStorage[0].ast
        let functions = fileStorage[0].functions
        let width = 500
        let height = 900
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
                       <FunctionsView ast={ ast } functions={ functions } />
                   </div>
               </div>
    })
}

export default MainSection
