import React from 'react';
import FileEditorContainer from './FileEditorContainer'

const FileEditorsPane = ({files, style}) => {
    let items = files.map((file) => {
        return <FileEditorContainer style={ editorStyle } file={ file } key={ file.id } />
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
