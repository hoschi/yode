import React from 'react'
import EditorCard, { subtleLabelStyle } from './EditorCard'
import NodeEditorStateLabels from './NodeEditorStateLabels'

const FileEditor = ({file, onFileTextChange, onFileActivity, style}) => {
    const {unformattedText, id, path, syntaxError} = file

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
    let editorProps = {
        error: syntaxError,
        text: unformattedText,
        onTextChange: onEditorTextChange,
        onActivity: onEditorActivity
    }
    let header = <div>
                     <span style={ subtleLabelStyle }>  path:  </span>
                     { ' ' }
                     { path }
                     { ' ' }
                     <NodeEditorStateLabels node={ file } />
                 </div>
    return <EditorCard style={ style } header={ header } editorProps={ editorProps } />
}

FileEditor.propTypes = {
    file: React.PropTypes.object.isRequired,
    onFileTextChange: React.PropTypes.func.isRequired,
    onFileActivity: React.PropTypes.func.isRequired
}

export default FileEditor
