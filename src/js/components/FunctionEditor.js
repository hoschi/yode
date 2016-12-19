import React from 'react'
import IconButton from 'material-ui/IconButton';
import IconClose from 'material-ui/svg-icons/navigation/close';
import IconUp from 'material-ui/svg-icons/navigation/arrow-upward';
import EditorPaper, { subtleLabelStyle } from './EditorPaper'
import NodeEditorStateLabels from './NodeEditorStateLabels'

const FunctionEditor = ({functionNode, onFunctionTextChange, onFunctionActivity, onClose, onSwapWithParent, style}) => {
    const {syntaxError, unformattedText, customId} = functionNode;
    const onEditorTextChange = ({value}) => {
        if (value === unformattedText) {
            // text was changed by setting reformatted text
            return
        }
        onFunctionTextChange({
            oldFunction: functionNode,
            newText: value
        })
    }
    let onEditorActivity = (cursor) => onFunctionActivity({
        cursor,
        node: functionNode
    })
    let onCloseClick = () => {
        onClose({
            id: customId
        })
    }
    let onSwapWithParentClick = () => {
        onSwapWithParent({
            id: customId
        })
    }

    let editorProps = {
        error: syntaxError,
        text: unformattedText,
        onTextChange: onEditorTextChange,
        onActivity: onEditorActivity
    }
    let tooltipPosition = 'top-center'

    let header = <div style={ headerContainerStyle }>
                     <div style={ textAndLabelContainerStyle }>
                         <span style={ subtleLabelStyle }>  id:  </span>
                         { ' ' }
                         { customId }
                         { ' ' }
                         <NodeEditorStateLabels node={ functionNode } />
                     </div>
                     <IconButton tooltip="swap with parent function editor" onTouchTap={ onSwapWithParentClick } style={ swapWithParentButtonStyle } tooltipPosition={ tooltipPosition } iconStyle={ iconStyle }>
                         <IconUp />
                     </IconButton>
                     <IconButton tooltip="close editor" onTouchTap={ onCloseClick } style={ closeButtonStyle } tooltipPosition={ tooltipPosition } iconStyle={ iconStyle }>
                         <IconClose />
                     </IconButton>
                 </div>
    return <EditorPaper style={ style } header={ header } editorProps={ editorProps } />
}

export default FunctionEditor

let headerContainerStyle = {
    display: 'flex'
}

let textAndLabelContainerStyle = {
    flexGrow: 2
}

let iconButtonStyle = {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 1,
    padding: 0,
    width: 19,
    height: 19
}

let iconStyle = {
    width: iconButtonStyle.width,
    height: iconButtonStyle.height
}

let closeButtonStyle = Object.assign({}, iconButtonStyle);

let swapWithParentButtonStyle = Object.assign({}, iconButtonStyle, {
    marginRight: 8
})
