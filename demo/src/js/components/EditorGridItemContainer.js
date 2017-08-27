import { connect } from 'react-redux'
import GridItemAutoSized from './GridItemAutoSized'
import { editorHeightChanged } from 'store/editorReducer'

let mapDispatchToProps = {
    onHeightChanged: editorHeightChanged
}

export default connect(undefined, mapDispatchToProps)(GridItemAutoSized)
