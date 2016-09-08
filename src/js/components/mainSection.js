import editor from './editor'
import nodeEditorStateLabels from './nodeEditorStateLabels'
import functionsView from './functionsView'
import { connect } from 'react-redux'
import { formatCode, updateFileText, cursorPositionInFileEditorChanged } from '../store/fileStorage'

const MainSection = (React) => {
    const FunctionsView = functionsView(React)
    const Editor = editor(React)
    const NodeEditorStateLabels = nodeEditorStateLabels(React)

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

        let styleLeft = Object.assign({}, styleBase, {
            left: 8
        })

        let styleRight = Object.assign({}, styleBase, {
            left: width + 20 + styleLeft.left
        })

        let editorContainerStyle = {
            marginBottom: 10
        }

        const editorStyle = {
            border: '1px solid black'
        }

        let editors = fileStorage.map((file) => {
            const {unformattedText, id} = file
            let onTextChange = ({value}) => {
                if (value === unformattedText) {
                    // text was changed by store
                    return
                }
                dispatch(updateFileText({
                    file: file,
                    newText: value
                }))
            }
            let onActivity = (cursor) => dispatch(cursorPositionInFileEditorChanged({
                cursor,
                fileId: file.id
            }))
            return <div key={ id } style={ editorContainerStyle }>
                       <div>path:
                           { ' ' }
                           { file.path }
                           { ' ' }
                           <NodeEditorStateLabels node={ file } />
                       </div>
                       <Editor editorStyle={ editorStyle } error={ file.syntaxError } text={ unformattedText } onTextChange={ onTextChange } onActivity={ onActivity }
                       />
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
