import { combineReducers } from 'redux'
import editor from './editorReducer'
import fileManagement from './fileManagement'

export default combineReducers({
    editor,
    fileManagement
})
