import React from 'react'
import RaisedButtonWithTooltip from './RaisedButtonWithTooltip'

const Controls = ({onFormatClick, onOpenFunctionEditorUnderCursorClick, openFunctionEditorDisabled}) => {
    let formatButtonProps = {
        label: 'format code',
        style: buttonStyle,
        onTouchTap: onFormatClick,
        tooltip: 'Recast formats code mostly as you type it'
    }
    let openFunctionEditorButtonProps = {
        label: 'open function editor',
        primary: true,
        style: buttonStyle,
        onTouchTap: onOpenFunctionEditorUnderCursorClick,
        disabled: openFunctionEditorDisabled,
        tooltip: 'opens function editor for function under cursor in focused editor'
    }
    return <div style={ containerStyle }>
               <RaisedButtonWithTooltip {...openFunctionEditorButtonProps} />
               <RaisedButtonWithTooltip {...formatButtonProps} />
           </div>
}

export default Controls

let buttonStyle = {
    marginRight: 10
}

let containerStyle = {
    paddingTop: 24,
    // 24 gutter + space for tooltip
    paddingBottom: 24
}
