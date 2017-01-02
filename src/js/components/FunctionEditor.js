import React from 'react'
import IconUp from 'material-ui/svg-icons/navigation/arrow-upward';
import EditorPaper from './EditorPaper'
import EditorHeader, { closeIconConfig } from './EditorHeader'

const FunctionEditor = ({functionNode, onFunctionTextChange, onFunctionActivity, onClose, onSwapWithParent, isFocused, style}) => {
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

    let headerProps = {
        titlePrefix: 'id:',
        title: customId,
        node: functionNode,
        iconConfigs: [
            {
                tooltip: 'swap with parent function editor',
                onTouchTap: onSwapWithParentClick,
                Icon: IconUp
            },
            {
                ...closeIconConfig,
                onTouchTap: onCloseClick
            }
        ]
    }
    let header = <EditorHeader {...headerProps} />
    return <EditorPaper style={ style } header={ header } editorProps={ editorProps } isFocused={ isFocused } />
}

export default FunctionEditor
