import R from 'ramda'
import createReducer from './createReducer'
import { editorLayoutCols } from '../constants'
import { setProp, setPath } from 'helper'
import demoFiles from './demoFiles'

function createFileFromText ({path, text}) {
    return {
        id: path,
        // FIXME can we do it this way? Can we save meta data from core into editor or must even FileEditor a special UI in Oni?
        metaData: {},
        path,
        text
    }
}

export const EDITORS_LAYOUT_CHANGED = 'EDITORS_LAYOUT_CHANGED'
export const editorsLayoutChanged = ({layout}) => {
    return {
        type: EDITORS_LAYOUT_CHANGED,
        layout
    }
}

export const EDITOR_HEIGHT_CHANGED = 'EDITOR_HEIGHT_CHANGED'
export const editorHeightChanged = ({itemId, height}) => {
    return {
        type: EDITOR_HEIGHT_CHANGED,
        itemId,
        height
    }
}

export const ADD_FILE_TO_STORAGE = 'ADD_FILE_TO_STORAGE'
export const addFileToStorage = (path, text) => ({
    type: ADD_FILE_TO_STORAGE,
    path,
    text
})

export const OPEN_EDITOR_BY_ID = 'OPEN_EDITOR_BY_ID'
export const openEditorById = ({id}) => {
    return {
        type: OPEN_EDITOR_BY_ID,
        id
    }
}

export const CURSOR_POSITION_CHANGED = 'CURSOR_POSITION_CHANGED '
export const cursorPositionChanged = ({cursor, buffer}) => {
    return {
        type: CURSOR_POSITION_CHANGED,
        cursor,
        buffer
    }
}

export const CLOSE_EDITOR = 'CLOSE_EDITOR'
export const closeEditor = ({id}) => {
    return {
        type: CLOSE_EDITOR,
        id
    }
}

export const BUFFER_TEXT_CHANGED = 'BUFFER_TEXT_CHANGED'
export const bufferTextChanged = ({buffer, newText}) => {
    return {
        type: BUFFER_TEXT_CHANGED,
        buffer,
        newText
    }
}

export let selectNoEditorIsFocused = (state) => R.isNil(state.editor.focusedEditorId)
export let selectFocusedEditorId = R.path(['editor', 'focusedEditorId'])
export let selectEditorsLayout = R.path(['editor', 'editorsLayout'])
export let selectAllFiles = R.pipe(
    R.path(['editor', 'buffers']),
    R.values,
    R.filter(R.has('path'))
)
export let selectFilesWithOpenState = (state) => {
    let files = selectAllFiles(state)
    return files.map((buffer) => {
        return {
            isOpen: state.editor.visibleEditorIds.includes(buffer.id),
            file: buffer
        }
    })
}
export let selectVisibleBuffers = (state) => {
    return R.pick(state.editor.visibleEditorIds, state.editor.buffers)
}

let defaultGridItemProps = {
    h: 1,
    w: editorLayoutCols / 2,
    x: 0,
    y: 0
}

function getInitialLayout (state) {
    let itemIds = state.visibleEditorIds
    return itemIds.map((id, i) => ({
        i: id.toString(),
        ...defaultGridItemProps,
        x: i % 2 === 0 ? 0 : editorLayoutCols / 2,
        y: i % 2
    }))
}

let shiftGridItem = R.curry((matcher, item) => {
    if (matcher(item)) {
        return {
            ...item,
            // shift current one a little bit down to make space for new editor
            y: 5
        }
    } else {
        return item;
    }
})

const fileBuffers = demoFiles.map(createFileFromText)
let initialState = {
    focusedEditorId: undefined,
    visibleEditorIds: ['actions.js'],
    // when a buffer object has a prop 'path' it is a file
    buffers: R.zipObj(fileBuffers.map(R.prop('id')), fileBuffers),
    cursor: undefined
}
initialState.editorsLayout = getInitialLayout(initialState)

let reducerFunctions = {
    [EDITORS_LAYOUT_CHANGED]: (state, {layout}) => {
        return {
            ...state,
            editorsLayout: layout
        }
    },
    [EDITOR_HEIGHT_CHANGED]: (state, {itemId, height}) => {
        let layout = state.editorsLayout;
        let newLayout = layout.map((item) => {
            if (item.i !== itemId) {
                return item;
            }

            let itemHeight = height + 28;
            return {
                ...item,
                h: itemHeight,
                minH: itemHeight,
                maxH: itemHeight
            }
        })
        return {
            ...state,
            editorsLayout: newLayout
        }
    },
    [ADD_FILE_TO_STORAGE]: (state, {path, text}) => {
        return {
            ...state,
            buffers: state.buffers.concat([createFileFromText({
                path,
                text
            })])
        }
    },
    [OPEN_EDITOR_BY_ID]: (state, action) => {
        const {id} = action;
        let newLayout = R.map(shiftGridItem(R.allPass([
            R.propEq('x', 0),
            R.propEq('y', 0)
        ])), state.editorsLayout)
        return {
            ...state,
            visibleEditorIds: R.append(id, state.visibleEditorIds),
            editorsLayout: R.append({
                ...defaultGridItemProps,
                i: id
            }, newLayout)
        }
    },
    [CLOSE_EDITOR]: (state, action) => {
        const {id} = action;
        return R.pipe(
            (state) => {
                if (state.focusedEditorId === id) {
                    // closed editor was focused, reset
                    return setProp('focusedEditorId', undefined, state)
                }
                return state
            },
            setProp('visibleEditorIds', R.filter(R.complement(R.equals(id)), state.visibleEditorIds))
        )(state);
    },
    [CURSOR_POSITION_CHANGED]: (state, action) => {
        const {cursor, buffer} = action
        return R.pipe(
            setProp('focusedEditorId', buffer.id),
            setProp('cursor', cursor)
        )(state)
    },
    [BUFFER_TEXT_CHANGED]: (state, action) => {
        const {buffer, newText} = action;
        return setPath(['buffers', buffer.id, 'text'], newText, state)
    }
}

let reducer = createReducer(initialState, reducerFunctions)
export default reducer;
