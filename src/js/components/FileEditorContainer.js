import { connect } from 'react-redux'
import R from 'ramda';
import FileEditor from './FileEditor'
import { updateFileText } from 'store/fileStorage'
import { cursorPositionInFileEditorChanged, selectFocusedFileEditor, closeFileEditor } from 'store/editorReducer'

let makeMapStateToProps = () => (state, ownProps) => {
    let focusedFileEditor = selectFocusedFileEditor(state)
    return {
        isFocused: R.equals(ownProps.file.id, focusedFileEditor)
    }
}

let mapDispatchToProps = {
    onFileTextChange: updateFileText,
    onFileActivity: cursorPositionInFileEditorChanged,
    onClose: closeFileEditor
};

export default connect(makeMapStateToProps, mapDispatchToProps)(FileEditor)
