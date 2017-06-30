import { connect } from 'react-redux'
import R from 'ramda';
import FunctionEditor from './FunctionEditor'
import { updateFunctionText, createSelectFileOfFunction } from 'store/fileStorage'
import { cursorPositionInFunctionEditorChanged, closeFunctionEditor, swapWithParentFunction, selectFocusedFunctionEditor } from 'store/editorReducer'

let makeMapStateToProps = () => (state, ownProps) => {
    let focusedFunctionEditor = selectFocusedFunctionEditor(state)
    let selectFileOfFunction = createSelectFileOfFunction()
    return {
        isFocused: R.equals(ownProps.functionNode.customId, focusedFunctionEditor),
        hasConnectedError: R.propOr(undefined, 'hasConnectedError', selectFileOfFunction(state, ownProps))
    }
}

let mapDispatchToProps = {
    onFunctionTextChange: updateFunctionText,
    onFunctionActivity: cursorPositionInFunctionEditorChanged,
    onClose: closeFunctionEditor,
    onSwapWithParent: swapWithParentFunction
};

export default connect(makeMapStateToProps, mapDispatchToProps)(FunctionEditor)
