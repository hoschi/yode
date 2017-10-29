import React from 'react'
import IconUp from 'material-ui/svg-icons/navigation/arrow-upward'
import EditorPaper from 'components/EditorPaper'
import EditorHeader, { closeIconConfig } from 'components/EditorHeader'

const BufferEditor = ({buffer, onTextChanged, onCursorActivity, onSwapWithParent, onClose, style, isFocused}) => {
    const {id, text:bufferText, metaData} = buffer
    const {syntaxError, hasConnectedError} = metaData

    let onEditorTextChange = ({value}) => {
        if (value === bufferText) {
            // text was changed by store
            return
        }
        onTextChanged({
            buffer,
            newText: value
        })
    }
    let onEditorActivity = (cursor) => onCursorActivity({
        cursor,
        buffer
    })
    let onCloseClick = () => {
        onClose({
            id
        })
    }
    let onSwapWithParentClick = () => {
        onSwapWithParent({
            id
        })
    }

    let editorProps = {
        error: syntaxError,
        hasConnectedError,
        text: bufferText,
        onTextChange: onEditorTextChange,
        onActivity: onEditorActivity
    }

    let title = buffer.path || metaData.title
    let headerProps = {
        titlePrefix: 'buffer:',
        title,
        node: buffer,
        error: syntaxError,
        hasConnectedError,
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

export default BufferEditor
