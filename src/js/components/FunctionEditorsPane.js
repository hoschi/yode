import React from 'react';
import FunctionEditorContainer from './FunctionEditorContainer'

const FunctionEditorsPane = ({functions, style}) => {
    let items = functions.map((functionNode) => {
        let props = {
            key: functionNode.customId,
            style: editorStyle,
            functionNode
        }
        return <FunctionEditorContainer {...props} />
    })
    return <div style={ style }>
               <h2>Functions</h2>
               { items }
           </div>
}

export default FunctionEditorsPane

let editorStyle = {
    marginBottom: 24
}
