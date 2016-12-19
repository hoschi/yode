import React from 'react';
import FileEditor from './FileEditor'
import R from 'ramda';

const FileEditorsPane = ({files, style, onFileTextChange, onFileActivity, focusedFileEditor}) => {
    let items = files.map((file) => {
        let isFocused = R.equals(file.id, focusedFileEditor)
        return <FileEditor style={ editorStyle } file={ file } key={ file.id } onFileTextChange={ onFileTextChange } onFileActivity={ onFileActivity }
                   isFocused={ isFocused } />
    })
    return <div style={ style }>
               <h2>Files</h2>
               { items }
           </div>
}

export default FileEditorsPane

let editorStyle = {
    marginBottom: 24
}
