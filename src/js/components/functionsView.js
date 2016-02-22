import editor from './editor'
import { connect } from 'react-redux'
import { updateFunctionContent } from '../store/fileStorage'

const FunctionsView = (React) => {
    const Editor = editor(React)
    let selectState = ({fileStorage}) => {
        let functions = fileStorage[1].functions.concat(fileStorage[0].functions)
        return {
            functions
        }
    }

    return connect(selectState)(({functions, dispatch}) => {
        let editorStyle = {
            border: '2px solid steelblue',
            marginBottom: 4
        }
        let texts = functions.map(function (node, i) {
            let onContentChange = ({value}) => {
                if (value === node.text) {
                    // content was changed by setting reformatted text
                    return
                }
                dispatch(updateFunctionContent({
                    oldFunction: node,
                    newContent: value
                }))
            }
            return <div key={ node.customId }>
                       <div>id:
                           { ' ' }
                           { node.customId }
                       </div>
                       <Editor editorStyle={ editorStyle } content={ node.text } onContentChange={ onContentChange } />
                   </div>
        })
        return <div>
                   { texts }
               </div>
    })
}

export default FunctionsView
