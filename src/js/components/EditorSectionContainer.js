import { connect } from 'react-redux'
import EditorSection from './EditorSection'
import { selectOpenFiles, selectFunctions } from 'store/fileStorage'
import { selectEditorsLayout, editorsLayoutChanged } from 'store/editorReducer'

let mapStateToProps = (state) => {
    return {
        files: selectOpenFiles(state),
        functions: selectFunctions(state),
        layout: selectEditorsLayout(state)
    }
}

let mapDispatchToProps = {
    onLayoutChanged: editorsLayoutChanged
}

export default connect(mapStateToProps, mapDispatchToProps)(EditorSection)
