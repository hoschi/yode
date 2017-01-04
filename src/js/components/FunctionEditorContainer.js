import { connect } from 'react-redux'
import R from 'ramda';
import FunctionEditor from './FunctionEditor'
import { updateFunctionText } from 'store/fileStorage'
import { cursorPositionInFunctionEditorChanged, closeFunctionEditor, swapWithParentFunction, selectFocusedFunctionEditor } from 'store/editorReducer'

let makeMapStateToProps = () => (state, ownProps) => {
    let focusedFunctionEditor = selectFocusedFunctionEditor(state)
    return {
        isFocused: R.equals(ownProps.functionNode.customId, focusedFunctionEditor)
    }
}

let mapDispatchToProps = {
    onFunctionTextChange: updateFunctionText,
    onFunctionActivity: cursorPositionInFunctionEditorChanged,
    onClose: closeFunctionEditor,
    onSwapWithParent: swapWithParentFunction
};

export default connect(makeMapStateToProps, mapDispatchToProps)(FunctionEditor)
