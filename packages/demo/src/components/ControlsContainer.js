import { connect } from 'react-redux'
import Controls from './Controls'
import { createNotImplementedActionCreator } from 'helper'
import { selectNoEditorIsFocused } from 'store/editorReducer'
import { openFunctionEditorUnderCursor } from 'plugin/yodeActions'

let mapStateToProps = (state) => {
    return {
        openFunctionEditorDisabled: selectNoEditorIsFocused(state)
    }
}

let mapDispatchToProps = {
    onFormatClick: createNotImplementedActionCreator('format code'),
    onOpenFunctionEditorUnderCursorClick: openFunctionEditorUnderCursor
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls)
