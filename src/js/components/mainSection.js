import editor from './editor'
import functionsView from './functionsView'
import { connect } from 'react-redux'
import { formatCode, updateFileContent } from '../store/fileStorage'

const MainSection = (React) => {
    const FunctionsView = functionsView(React)
    const Editor = editor(React)

    let selectState = ({fileStorage}) => {
        return {
            fileStorage
        }
    }

    return connect(selectState)(({fileStorage, dispatch}) => {
        let width = 500
        let height = 900
        let styleBase = {
            position: 'absolute',
            height: height,
            width: width,
            top: 40,
            left: 0
        }

        let styleRight = Object.assign({}, styleBase, {
            left: width + 20
        })

        let styleLeft = Object.assign({}, styleBase, {
            top: styleBase.top + 18
        })

        let editorContainerStyle = {
            border: '1px solid black',
            marginBottom: 10
        }

        let editors = fileStorage.map((file) => {
            const {unformattedContent, id} = file
            let onContentChange = ({value}) => {
                if (value === unformattedContent) {
                    // content was changed by store
                    return
                }
                dispatch(updateFileContent({
                    file: file,
                    newContent: value
                }))
            }
            return <div key={ id } style={ editorContainerStyle }>
                       <Editor content={ unformattedContent } onContentChange={ onContentChange } />
                   </div>
        })

        return <div>
                   <div>
                       <button onClick={ () => dispatch(formatCode()) }>format code</button>
                   </div>
                   <div style={ styleLeft }>
                       { editors }
                   </div>
                   <div style={ styleRight }>
                       <FunctionsView />
                   </div>
               </div>
    })
}

export default MainSection
