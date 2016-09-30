import React from 'react';
import FileEditor from './FileEditor'

const FileEditorsPane = ({files, style, onFileTextChange, onFileActivity}) => {
    let items = files.map((file) => {
        return <FileEditor style={ editorStyle } file={ file } key={ file.id } onFileTextChange={ onFileTextChange } onFileActivity={ onFileActivity }
               />
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
