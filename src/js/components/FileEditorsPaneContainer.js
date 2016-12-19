import { connect } from 'react-redux'
import FileEditorsPane from './FileEditorsPane'
import { updateFileText, selectFiles } from 'store/fileStorage'
import { cursorPositionInFileEditorChanged, selectFocusedFileEditor } from 'store/editorReducer'

let mapStateToProps = (state) => {
    return {
        files: selectFiles(state),
        focusedFileEditor: selectFocusedFileEditor(state)
    }
}

let mapDispatchToProps = {
    onFileTextChange: updateFileText,
    onFileActivity: cursorPositionInFileEditorChanged
};

export default connect(mapStateToProps, mapDispatchToProps)(FileEditorsPane)
