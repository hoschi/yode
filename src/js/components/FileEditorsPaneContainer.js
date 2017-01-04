import { connect } from 'react-redux'
import FileEditorsPane from './FileEditorsPane'
import { selectOpenFiles } from 'store/fileStorage'

let mapStateToProps = (state) => {
    return {
        files: selectOpenFiles(state)
    }
}

export default connect(mapStateToProps)(FileEditorsPane)
