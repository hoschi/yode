import React from 'react'
import * as palette from 'material-ui/styles/colors'
import { subtleLabelStyle } from './styles'

const NodeEditorStateLabels = ({error, hasConnectedError}) => {
    let errorMessage,
        errorType
    const labelStyle = {
        paddingLeft: 4,
        paddingRight: 4,
        borderRadius: 4
    }
    const errorTypeLabelStyle = Object.assign({}, labelStyle, subtleLabelStyle, {
        backgroundColor: palette.deepOrange200
    })
    const errorMessageStyle = Object.assign({}, labelStyle, {
        backgroundColor: palette.deepOrange200
    })

    if (error) {
        errorMessage = error.message
        errorType = 'unparsable'
    } else if (hasConnectedError) {
        errorType = 'connected error'
        errorMessageStyle.display = 'none'

        errorTypeLabelStyle.backgroundColor = palette.amber200
    } else {
        // hide, no error
        errorTypeLabelStyle.display = 'none'
        errorMessageStyle.display = 'none'
    }

    return <span> <span style={ errorTypeLabelStyle }>{ errorType }</span>
           { ' ' } <span style={ errorMessageStyle }>{ errorMessage }</span> </span>
}
export default NodeEditorStateLabels
