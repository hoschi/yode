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
        let functions = fileStorage[0].functions.concat(fileStorage[1].functions)
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
            left: width + 20
        })

        let editorContainerStyle = {
            border: '1px solid black',
            marginBottom: 10
        }

        let editors = fileStorage.map(({content}, i) => <div key={ i } style={ editorContainerStyle }>
                                                            <Editor content={ content } />
                                                        </div>)

        return <div>
                   <div style={ styleBase }>
                       { editors }
                   </div>
                   <div style={ styleRight }>
                       <FunctionsView functions={ functions } />
                   </div>
               </div>
    })
}

export default MainSection
