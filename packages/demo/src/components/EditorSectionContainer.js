import { connect } from 'react-redux'
import EditorSection from './EditorSection'
import { selectEditorsLayout, selectVisibleBuffers, editorsLayoutChanged } from 'store/editorReducer'

let mapStateToProps = (state) => {
    return {
        buffers: selectVisibleBuffers(state),
        layout: selectEditorsLayout(state)
    }
}

let mapDispatchToProps = {
    onLayoutChanged: editorsLayoutChanged
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorSection)
