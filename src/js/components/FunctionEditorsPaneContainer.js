import { connect } from 'react-redux'
import FunctionEditorsPane from './FunctionEditorsPane'
import { updateFunctionText, selectFunctions } from 'store/fileStorage'
import { cursorPositionInFunctionEditorChanged, closeFunctionEditor, swapWithParentFunction, selectFocusedFunctionEditor } from 'store/editorReducer'

let mapStateToProps = (state) => {
    return {
        functions: selectFunctions(state),
        focusedFunctionEditor: selectFocusedFunctionEditor(state)
    }
}

let mapDispatchToProps = {
    onFunctionTextChange: updateFunctionText,
    onFunctionActivity: cursorPositionInFunctionEditorChanged,
    onClose: closeFunctionEditor,
    onSwapWithParent: swapWithParentFunction
};

export default connect(mapStateToProps, mapDispatchToProps)(FunctionEditorsPane)
