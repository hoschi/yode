import React from 'react'
import RaisedButtonWithTooltip from './RaisedButtonWithTooltip'
import OpenFileMenuContainer from './OpenFileMenuContainer'
import AddFileDialogContainer from './AddFileDialogContainer'
import core, {otherTest} from 'yode-core'
import api from 'yode-core/src/api'

const Controls = ({onFormatClick/*, onOpenFunctionEditorUnderCursorClick, openFunctionEditorDisabled*/}) => {
    let formatButtonProps = {
        label: 'format code',
        style: {
            ...buttonStyle,
            // just for playing around with AST + formatter instead of CST
            display: 'none'
        },
        tooltip: 'Recast formats code mostly as you type it',
        onTouchTap: onFormatClick
    }
    /*
     *let openFunctionEditorButtonProps = {
     *    label: 'open function editor',
     *    style: buttonStyle,
     *    onTouchTap: onOpenFunctionEditorUnderCursorClick,
     *    disabled: openFunctionEditorDisabled,
     *    tooltip: 'opens function editor for function under cursor in focused editor'
     *}
     */
    // FIXME replace with above when module tests finished
    let openFunctionEditorButtonProps = {
        label: 'my test button',
        style: buttonStyle,
        onTouchTap: () => {
            core('foo');
            otherTest({
                bar:'baaaaaaaar'
            })
            api.magic();
        },
        tooltip: 'do it'
    }
    return <div style={ containerStyle }>
               <RaisedButtonWithTooltip {...openFunctionEditorButtonProps} />
               <OpenFileMenuContainer />
               <AddFileDialogContainer />
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
