import { connect } from 'react-redux'
import R from 'ramda';
import FunctionEditor from './FunctionEditor'
import { selectFocusedEditorId } from 'store/editorReducer'
import { createNotImplementedActionCreator } from 'helper'

// FIXME move to "DemoYodePlugin"
let makeMapStateToProps = () => (state, ownProps) => {
    let focusedEditorId = selectFocusedEditorId(state)
    return {
        isFocused: R.equals(ownProps.buffer.id, focusedEditorId),
        // FIXME get connected error state
        hasConnectedError: false,
    //hasConnectedError: R.propOr(undefined, 'hasConnectedError', selectFileOfFunction(state, ownProps))
    }
}

// FIXME check what is the same as file editor and put it in EditorContainer
let mapDispatchToProps = {
    onFunctionTextChange: createNotImplementedActionCreator('function: text changed'),
    onFunctionActivity: createNotImplementedActionCreator('function: cursor changed'),
    onSwapWithParent: createNotImplementedActionCreator('function: swap with parent')
};

export default connect(makeMapStateToProps, mapDispatchToProps)(FunctionEditor)
