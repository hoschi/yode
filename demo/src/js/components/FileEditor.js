import React from 'react'
import EditorPaper from './EditorPaper'
import EditorHeader, { closeIconConfig } from './EditorHeader'

const FileEditor = ({buffer, onTextChanged, onFileActivity, onClose, style, isFocused}) => {
    const {id, path, text:bufferText, metaData} = buffer
    const {syntaxError, hasConnectedError} = metaData;

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
    let onEditorActivity = (cursor) => onFileActivity({
        cursor,
        buffer
    })
    let onCloseClick = () => {
        onClose({
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
    let headerProps = {
        titlePrefix: 'path:',
        title: path,
        node: buffer,
        hasConnectedError,
        iconConfigs: [
            {
                ...closeIconConfig,
                onTouchTap: onCloseClick
            }
        ]
    }
    let header = <EditorHeader {...headerProps} />
    return <EditorPaper style={ style } header={ header } editorProps={ editorProps } isFocused={ isFocused } />
}

FileEditor.propTypes = {
    buffer: React.PropTypes.object.isRequired,
    onTextChanged: React.PropTypes.func.isRequired,
    onFileActivity: React.PropTypes.func.isRequired
}

export default FileEditor
