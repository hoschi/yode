import React from 'react'
import * as palette from 'material-ui/styles/colors';
import Paper from 'material-ui/Paper';
import Editor from './Editor'

const EditorPaper = ({header, style, isFocused, editorProps}) => {
    let zDepth
    if (isFocused) {
        zDepth = 3
    } else {
        zDepth = 1
    }
    return <Paper zDepth={ zDepth } style={ Object.assign({}, style, paperStyle) }>
               <div style={ headerStyle }>
                   { header }
               </div>
               <div style={ editorContainerStyle }>
                   <Editor {...editorProps} />
               </div>
           </Paper>
}

export default EditorPaper

let paperStyle = {
    backgroundColor: palette.grey200
}
let headerStyle = {
    padding: 16
}

let editorContainerStyle = {
    marginRight: 1
}

export let subtleLabelStyle = {
    color: palette.grey700
}
