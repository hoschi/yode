import { connect } from 'react-redux'
import EditorSection from './EditorSection'
import { selectOpenFiles, selectFunctions } from 'store/fileStorage'

let mapStateToProps = (state) => {
    return {
        files: selectOpenFiles(state),
        functions: selectFunctions(state)
    }
}

export default connect(mapStateToProps)(EditorSection)
