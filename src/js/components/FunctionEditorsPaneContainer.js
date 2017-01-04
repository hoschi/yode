import { connect } from 'react-redux'
import FunctionEditorsPane from './FunctionEditorsPane'
import { selectFunctions } from 'store/fileStorage'

let mapStateToProps = (state) => {
    return {
        functions: selectFunctions(state)
    }
}

export default connect(mapStateToProps)(FunctionEditorsPane)
