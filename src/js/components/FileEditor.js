import React from 'react'
import EditorPaper, { subtleLabelStyle } from './EditorPaper'
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
    return <EditorPaper style={ style } header={ header } editorProps={ editorProps } />
}

FileEditor.propTypes = {
    file: React.PropTypes.object.isRequired,
    onFileTextChange: React.PropTypes.func.isRequired,
    onFileActivity: React.PropTypes.func.isRequired
}

export default FileEditor
