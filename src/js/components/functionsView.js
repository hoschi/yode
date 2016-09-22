import R from 'ramda';
import editor from './editor'
import nodeEditorStateLabels from './nodeEditorStateLabels'
import { connect } from 'react-redux'
import { updateFunctionText } from '../store/fileStorage'
import { cursorPositionInFunctionEditorChanged, closeFunctionEditor, swapWithParentFunction } from '../store/editorReducer'

let headerContainerStyle = {
    display: 'flex'
}

let textAndLabelContainerStyle = {
    flexGrow: 2
}

let closeButtonStyle = {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 1
}

let swapWithParentButtonStyle = {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 1,
    marginRight: 16
}

const FunctionsView = (React) => {
    const Editor = editor(React)
    const NodeEditorStateLabels = nodeEditorStateLabels(React)

    let selectState = (state) => {
        let allFunctions = state.editor.fileStorage[1].functions.concat(state.editor.fileStorage[0].functions)
        let openIds = state.editor.functionEditorIds;
        let createIdMatcher = (id) => R.propEq('customId', id);
        let functions = openIds.map(R.pipe(createIdMatcher, R.find(R.__, allFunctions)))
        return {
            functions
        }
    }

    return connect(selectState)(({functions, dispatch}) => {
        let editorStyle = {
            border: '2px solid steelblue',
            marginBottom: 4
        }
        let texts = functions.map(function (node) {
            const onTextChange = ({value}) => {
                if (value === node.unformattedText) {
                    // text was changed by setting reformatted text
                    return
                }
                dispatch(updateFunctionText({
                    oldFunction: node,
                    newText: value
                }))
            }
            let onActivity = (cursor) => dispatch(cursorPositionInFunctionEditorChanged({
                cursor,
                node
            }))
            let onClose = () => {
                dispatch(closeFunctionEditor({
                    id: node.customId
                }))
            }

            let onSwapWithParent = () => {
                dispatch(swapWithParentFunction({
                    id: node.customId
                }))
            }

            return <div key={ node.customId }>
                       <div style={ headerContainerStyle }>
                           <div style={ textAndLabelContainerStyle }>
                               id:
                               { ' ' }
                               { node.customId }
                               { ' ' }
                               <NodeEditorStateLabels node={ node } />
                           </div>
                           <div style={ swapWithParentButtonStyle } onClick={ onSwapWithParent }>up</div>
                           <div style={ closeButtonStyle } onClick={ onClose }>X</div>
                       </div>
                       <Editor editorStyle={ editorStyle } error={ node.syntaxError } text={ node.unformattedText } onTextChange={ onTextChange } onActivity={ onActivity }
                       />
                   </div>
        })
        return <div>
                   { texts }
               </div>
    })
}

export default FunctionsView
