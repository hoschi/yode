import { connect } from 'react-redux'
import Controls from './Controls'
import { createNotImplementedActionCreator } from 'helper'
import { selectNoEditorIsFocused } from 'store/editorReducer'

let mapStateToProps = (state) => {
    return {
        openFunctionEditorDisabled: selectNoEditorIsFocused(state)
    }
}

let mapDispatchToProps = {
    onFormatClick: createNotImplementedActionCreator('format code'),
    onOpenFunctionEditorUnderCursorClick: createNotImplementedActionCreator('open function editor under cursor')
};

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
