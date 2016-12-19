import React from 'react';
import FunctionEditor from './FunctionEditor'

const FunctionEditorsPane = ({functions, style, onFunctionTextChange, onFunctionActivity, onClose, onSwapWithParent}) => {
    let items = functions.map((functionNode) => {
        let props = {
            style: editorStyle,
            functionNode: functionNode,
            key: functionNode.customId,
            onFunctionTextChange,
            onFunctionActivity,
            onClose,
            onSwapWithParent
        }
        return <FunctionEditor {...props} />
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