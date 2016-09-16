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

export const CLOSE_FUNCTION_EDITOR = 'CLOSE_FUNCTION_EDITOR '
export const closeFunctionEditor = ({id}) => {
    return {
        type: CLOSE_FUNCTION_EDITOR,
        id
    }
}

let setProp = R.curry((prop, value, obj) => R.set(R.lensProp(prop), value, obj));

let actionObject = {
    [CURSOR_POSITION_IN_FILE_EDITOR_CHANGED]: setProp('focusedFunctionEditor', undefined),
    [CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED]: (state, action) => {
        const {node} = action
        return setProp('focusedFunctionEditor', node.customId, state)
    },
    [CLOSE_FUNCTION_EDITOR]: (state, action) => {
        const {id} = action;
        return setProp('functionEditorIds', R.filter((openFnId) => openFnId !== id, state.functionEditorIds), state);
    }
}

let initialState = {
    focusedFunctionEditor: undefined,
    functionEditorIds: [3, 2],
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
