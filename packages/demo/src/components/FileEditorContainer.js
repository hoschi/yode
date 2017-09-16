import { connect } from 'react-redux'
import R from 'ramda';
import FileEditor from './FileEditor'
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
    onClose: closeEditor
};

export default connect(makeMapStateToProps, mapDispatchToProps)(FileEditor)
