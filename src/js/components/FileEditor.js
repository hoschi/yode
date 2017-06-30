import React from 'react'
import EditorPaper from './EditorPaper'
import EditorHeader, { closeIconConfig } from './EditorHeader'

const FileEditor = ({file, onFileTextChange, onFileActivity, onClose, style, isFocused}) => {
    const {unformattedText, id, path, syntaxError, hasConnectedError} = file

    let onEditorTextChange = ({value}) => {
        if (value === unformattedText) {
            // text was changed by store
            return
        }
        onFileTextChange({
            file: file,
            newText: value
        })
    }
    let onEditorActivity = (cursor) => onFileActivity({
        cursor,
        fileId: id
    })
    let onCloseClick = () => {
        onClose({
            id
        })
    }
    let editorProps = {
        error: syntaxError,
        hasConnectedError,
        text: unformattedText,
        onTextChange: onEditorTextChange,
        onActivity: onEditorActivity
    }
    let headerProps = {
        titlePrefix: 'path:',
        title: path,
        node: file,
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
    file: React.PropTypes.object.isRequired,
    onFileTextChange: React.PropTypes.func.isRequired,
    onFileActivity: React.PropTypes.func.isRequired
}

export default FileEditor
