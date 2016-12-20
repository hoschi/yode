import createReducer from './createReducer'
import R from 'ramda'

export const SET_IS_OPEN_FILE_MENU_OPEN = 'SET_IS_OPEN_FILE_MENU_OPEN'
export let setIsOpenFileMenuOpen = (value) => ({
    type: SET_IS_OPEN_FILE_MENU_OPEN,
    value
})

export let selectIsOpenFileMenuOpen = R.path(['fileManagement', 'isOpenFileMenuOpen']);

let initialState = {
    isOpenFileMenuOpen: false
}

let reducerFunctions = {
    [SET_IS_OPEN_FILE_MENU_OPEN]: (state, action) => ({
        ...state,
        isOpenFileMenuOpen: action.value
    })
}

let fileManagement = createReducer(initialState, reducerFunctions)
export default fileManagement
