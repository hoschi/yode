import { connect } from 'react-redux'
import Controls from './Controls'
import { selectNoEditorIsFocused } from 'store/editorReducer'
import { openFunctionEditorUnderCursor } from 'plugin/yodeActions'

let mapStateToProps = (state) => {
    return {
        openFunctionEditorDisabled: selectNoEditorIsFocused(state)
    }
}

let mapDispatchToProps = {
    onOpenFunctionEditorUnderCursorClick: openFunctionEditorUnderCursor
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls)
