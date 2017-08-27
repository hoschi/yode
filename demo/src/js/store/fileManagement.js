import createReducer from './createReducer'
import R from 'ramda'

export const SET_IS_OPEN_FILE_MENU_OPEN = 'SET_IS_OPEN_FILE_MENU_OPEN'
export let setIsOpenFileMenuOpen = (value) => ({
    type: SET_IS_OPEN_FILE_MENU_OPEN,
    value
})

export const SET_IS_OPEN_OF_ADD_DIALOG = 'SET_IS_OPEN_OF_ADD_DIALOG'
export let setIsOpenOfAddDialog = (value) => ({
    type: SET_IS_OPEN_OF_ADD_DIALOG,
    value
})

export const SET_CONTENT_OF_ADD_DIALOG = 'SET_CONTENT_OF_ADD_DIALOG'
export let setContentOfAddDialog = (content) => ({
    type: SET_CONTENT_OF_ADD_DIALOG,
    content
})

export const SET_FILE_NAME_OF_ADD_DIALOG = 'SET_FILE_NAME_OF_ADD_DIALOG'
export let setFileNameOfAddDialog = (fileName) => ({
    type: SET_FILE_NAME_OF_ADD_DIALOG,
    fileName
})

export const RESET_ADD_DIALOG = 'RESET_ADD_DIALOG'
export let resetAddDialog = () => ({
    type: RESET_ADD_DIALOG
})

export let selectIsOpenFileMenuOpen = R.path(['fileManagement', 'isOpenFileMenuOpen']);
export let selectIsOpenAddFileDialog = R.path(['fileManagement', 'addFile', 'isOpen']);
export let selectFileNameOfAddDialog = R.path(['fileManagement', 'addFile', 'fileName']);
export let selectContentOfAddDialog = R.path(['fileManagement', 'addFile', 'content']);

let initialState = {
    isOpenFileMenuOpen: false,
    addFile: {
        isOpen: false,
        fileName: '',
        content: ''
    }
}

let reducerFunctions = {
    [SET_IS_OPEN_FILE_MENU_OPEN]: (state, action) => ({
        ...state,
        isOpenFileMenuOpen: action.value
    }),
    [SET_IS_OPEN_OF_ADD_DIALOG]: (state, action) => R.assocPath(['addFile', 'isOpen'], action.value, state),
    [SET_CONTENT_OF_ADD_DIALOG]: (state, {content}) => R.assocPath(['addFile', 'content'], content, state),
    [SET_FILE_NAME_OF_ADD_DIALOG]: (state, {fileName}) => R.assocPath(['addFile', 'fileName'], fileName, state),
    [RESET_ADD_DIALOG]: (state) => ({
        ...state,
        addFile: {
            ...state.addFile,
            fileName: '',
            content: ''
        }
    })
}

let fileManagement = createReducer(initialState, reducerFunctions)
export default fileManagement
