import R from 'ramda'
import fileStorage from './fileStorage'

export const CURSOR_POSITION_IN_FILE_EDITOR_CHANGED = 'CURSOR_POSITION_IN_FILE_EDITOR_CHANGED '
export const cursorPositionInFileEditorChanged = ({cursor, fileId}) => {
    return {
        type: CURSOR_POSITION_IN_FILE_EDITOR_CHANGED,
        cursor,
        fileId
    }
}

export const CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED = 'CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED '
export const cursorPositionInFunctionEditorChanged = ({cursor, node}) => {
    return {
        type: CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED,
        cursor,
        node
    }
}

let setProp = R.curry((prop, value, obj) => R.set(R.lensProp(prop), value, obj));

let actionObject = {
    [CURSOR_POSITION_IN_FILE_EDITOR_CHANGED]: setProp('focusedFunctionEditor', undefined),
    [CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED]: (state, action) => {
        const {node} = action
        return setProp('focusedFunctionEditor',node.customId, state)
    }
}

let initialState = {
    focusedFunctionEditor: undefined,
    functionEditorIds:[3],
    fileStorage: fileStorage()
}

let reducer = (state = initialState, action) => {
    let actionFunction = actionObject[action.type]
    if (actionFunction) {
        return actionFunction(state, action)
    } else {
        return {
            ...state,
            fileStorage: fileStorage(state.fileStorage, action)
        }
    }
}

export default reducer;
