import { connect } from 'react-redux'
import Controls from './Controls'
import { formatCode } from 'store/fileStorage'
import { openFunctionEditorUnderCursor, selectNoEditorIsFocused } from 'store/editorReducer'

let mapStateToProps = (state) => {
    return {
        openFunctionEditorDisabled: selectNoEditorIsFocused(state)
    }
}

let mapDispatchToProps = {
    onFormatClick: formatCode,
    onOpenFunctionEditorUnderCursorClick: openFunctionEditorUnderCursor
};

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
