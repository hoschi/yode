import React from 'react'
import * as palette from 'material-ui/styles/colors';

const NodeEditorStateLabels = ({node}) => {
    let errorMessage
    const labelStyle = {
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 4
    }
    const dirtyLabelStyle = Object.assign({}, labelStyle, {
        backgroundColor: palette.amber200
    })
    const errorLabelStyle = Object.assign({}, labelStyle, {
        backgroundColor: palette.deepOrange200
    })
    const errorMessageStyle = Object.assign({}, errorLabelStyle);

    if (node.text === node.unformattedText) {
        // hide, editor and ast generated text are the same
        dirtyLabelStyle.display = 'none'
    }

    if (node.syntaxError) {
        errorMessage = node.syntaxError.message
    } else {
        // hide, no error
        errorLabelStyle.display = 'none'
        errorMessageStyle.display = 'none'
    }

    return <span> <span style={ dirtyLabelStyle }>unformatted</span>
           { ' ' } <span style={ errorLabelStyle }>unparsable</span>
           { ' ' } <span style={ errorMessageStyle }>{ errorMessage }</span> </span>
}
export default NodeEditorStateLabels
