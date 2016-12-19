import { connect } from 'react-redux'
import Editor from './Editor'
import {lostEditorFocus} from 'store/editorReducer'

let mapDispatchToProps = {
    onBlur: lostEditorFocus,
};

export default connect(undefined, mapDispatchToProps)(Editor)

