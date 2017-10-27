import { connect } from 'react-redux'
import R from 'ramda';
import BufferEditor from './BufferEditor'
import { selectFocusedEditorId, cursorPositionChanged, closeEditor, bufferTextChanged, swapWithParentFunction } from 'store/editorReducer'

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
    onSwapWithParent: swapWithParentFunction,
};

export default connect(makeMapStateToProps, mapDispatchToProps)(BufferEditor)
