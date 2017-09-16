import { connect } from 'react-redux'
import R from 'ramda';
import FunctionEditor from './FunctionEditor'
import { createNotImplementedActionCreator } from 'helper'
import { selectFocusedEditorId, cursorPositionChanged, closeEditor, bufferTextChanged } from 'store/editorReducer'

let makeMapStateToProps = () => (state, ownProps) => {
    let focusedEditorId = selectFocusedEditorId(state)
    return {
        isFocused: R.equals(ownProps.buffer.id, focusedEditorId)
    }
}

let mapDispatchToProps = {
    onTextChanged: bufferTextChanged,
    onCursorActivity: cursorPositionChanged,
    onClose: closeEditor,
    onSwapWithParent: createNotImplementedActionCreator('function: swap with parent')
};

export default connect(makeMapStateToProps, mapDispatchToProps)(FunctionEditor)
