import React from 'react'
import RaisedButtonWithTooltip from './RaisedButtonWithTooltip'
import OpenFileMenuContainer from './OpenFileMenuContainer'

const Controls = ({onFormatClick, onOpenFunctionEditorUnderCursorClick, openFunctionEditorDisabled}) => {
    let formatButtonProps = {
        label: 'format code',
        style: buttonStyle,
        onTouchTap: onFormatClick,
        tooltip: 'Recast formats code mostly as you type it'
    }
    let openFunctionEditorButtonProps = {
        label: 'open function editor',
        style: buttonStyle,
        onTouchTap: onOpenFunctionEditorUnderCursorClick,
        disabled: openFunctionEditorDisabled,
        tooltip: 'opens function editor for function under cursor in focused editor'
    }
    return <div style={ containerStyle }>
               <RaisedButtonWithTooltip {...openFunctionEditorButtonProps} />
               <OpenFileMenuContainer />
               <RaisedButtonWithTooltip {...formatButtonProps} />
           </div>
}

export default Controls

let buttonStyle = {
    marginRight: 10
}

let containerStyle = {
    padding: 24,
    // needed space for tooltip
    paddingTop: 32
}
