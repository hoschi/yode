import * as R from 'ramda'
import createReducer from './createReducer'
import { EDITOR_LAYOUT_COLS } from 'consts'
import { setProp, setPath } from 'helper'
import demoFiles from './demoFiles'

function createBufferFromText (id, text) {
    return {
        id,
        metaData: {},
        text
    }
}

function createFileFromText (path, text) {
    return {
        ...createBufferFromText(path, text),
        path
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
export const addFileToStorage = ({path, text}) => ({
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

export const CHANGE_BUFFER_TEXT = 'CHANGE_BUFFER_TEXT'
export const changeBufferText = ({id, newText}) => {
    return {
        type: CHANGE_BUFFER_TEXT,
        id,
        newText
    }
}

export const CHANGE_META_DATA = 'CHANGE_META_DATA'
export const changeMetaData = ({id, newMetaData}) => {
    return {
        type: CHANGE_META_DATA,
        id,
        newMetaData
    }
}

export const CREATE_BUFFER = 'CREATE_BUFFER'
export const createBuffer = ({id, text}) => {
    return {
        type: CREATE_BUFFER,
        id,
        text
    }
}

// TODO action used in UI by #4
export const BUFFER_DELETED = 'BUFFER_DELETED'
export const bufferDeleted = ({buffer}) => {
    return {
        type: BUFFER_DELETED,
        buffer
    }
}

export const DELETE_BUFFER = 'DELETE_BUFFER'
export const deleteBuffer = ({id}) => {
    return {
        type: DELETE_BUFFER,
        id
    }
}

export const SWAP_BUFFER_EDITORS = 'SWAP_BUFFER_EDITORS'
export const swapBufferEditors = ({oldId, newId}) => {
    return {
        type: SWAP_BUFFER_EDITORS,
        oldId,
        newId
    }
}

export let selectNoEditorIsFocused = (state) => R.isNil(state.editor.focusedEditorId)
export let selectFocusedEditorId = R.path(['editor', 'focusedEditorId'])
export let selectEditorsLayout = R.path(['editor', 'editorsLayout'])
export let selectCursor = R.path(['editor', 'cursor'])
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
    w: EDITOR_LAYOUT_COLS / 2,
    //w: EDITOR_LAYOUT_COLS,
    x: 0,
    y: 0
}

function getInitialLayout (state) {
    let itemIds = state.visibleEditorIds
    return itemIds.map((id, i) => ({
        i: id.toString(),
        ...defaultGridItemProps,
        x: i % 2 === 0 ? 0 : EDITOR_LAYOUT_COLS / 2,
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
        return item
    }
})

const fileBuffers = demoFiles.map(({path, text}) => createFileFromText(path, text))
let initialState = {
    focusedEditorId: undefined,
    visibleEditorIds: ['Header.spec.js'],
    // when a buffer object has a prop 'path' it is a file
    buffers: R.zipObj(fileBuffers.map(R.prop('id')), fileBuffers),
    cursor: undefined
}
initialState.editorsLayout = getInitialLayout(initialState)

let resetFocusedEditorForId = R.curry((id, state) => {
    if (state.focusedEditorId === id) {
        // closed editor was focused, reset
        return setProp('focusedEditorId', undefined, state)
    }
    return state
})
let removeVisibleBufferById = R.curry((id, state) => {
    return setProp('visibleEditorIds', R.filter(R.complement(R.equals(id)), state.visibleEditorIds), state)
})

let gridItemInZeroRange = propName => (item) => item[propName] >= -1 && item[propName] <= 1

let reducerFunctions = {
    [EDITORS_LAYOUT_CHANGED]: (state, {layout}) => {
        return {
            ...state,
            editorsLayout: layout
        }
    },
    [EDITOR_HEIGHT_CHANGED]: (state, {itemId, height}) => {
        let layout = state.editorsLayout
        let newLayout = layout.map((item) => {
            if (item.i !== itemId) {
                return item
            }

            let itemHeight = height + 28
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
    [ADD_FILE_TO_STORAGE]: (state, action) => {
        const {path, text} = action
        return setProp('buffers', {
            ...state.buffers,
            [path]: createFileFromText(path, text)
        }, state)
    },
    [CREATE_BUFFER]: (state, action) => {
        const {id, text} = action
        return setProp('buffers', {
            ...state.buffers,
            [id]: {
                ...createBufferFromText(id, text)
            }
        }, state)
    },
    [OPEN_EDITOR_BY_ID]: (state, action) => {
        const {id} = action
        let newLayout = R.map(shiftGridItem(R.allPass([
            R.propEq('x', 0),
            gridItemInZeroRange('y')
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
        const {id} = action
        return R.pipe(
            // reset focus
            resetFocusedEditorForId(id),
            removeVisibleBufferById(id),
        )(state)
    },
    [DELETE_BUFFER]: (state, action) => {
        const {id} = action
        return R.pipe(
            // can't be visible nor focused
            removeVisibleBufferById(id),
            resetFocusedEditorForId(id),
            // delete buffer
            R.dissocPath(['buffers', id]),
        )(state)
    },
    [SWAP_BUFFER_EDITORS]: (state, action) => {
        const {oldId, newId} = action

        // remove new item when it is visible, we insert it at another position later
        let {item:existingNewItem, layout:layoutWithoutNewItem} = getLayoutWithoutItem(state.editorsLayout, newId)

        // remove old item, but remember position
        let {item:oldLayoutItem, layout:layoutCleared, position:oldItemPos} = getLayoutWithoutItem(layoutWithoutNewItem, oldId)

        // create new item with merged properties
        let newLayoutItem = {
            ...oldLayoutItem,
            i: newId
        }
        if (existingNewItem) {
            // copy height, because this is not calculated again when item is moved
            newLayoutItem = R.merge(newLayoutItem, R.pick([
                'h',
                'minH',
                'maxH'
            ], existingNewItem))
        }

        return R.evolve({
            focusedEditorId: R.ifElse(
                // closed editor focused?
                R.equals(oldId),
                // it was! reset focus
                R.always(undefined),
                R.identity
            ),
            visibleEditorIds: R.pipe(
                R.reject(R.equals(oldId)),
                R.append(newId)
            ),
            editorsLayout: R.always(R.insert(oldItemPos, newLayoutItem, layoutCleared))
        }, state)
    },
    [CURSOR_POSITION_CHANGED]: (state, action) => {
        const {cursor, buffer} = action
        return R.pipe(
            setProp('focusedEditorId', buffer.id),
            setProp('cursor', cursor)
        )(state)
    },
    [BUFFER_TEXT_CHANGED]: (state, action) => {
        const {buffer, newText} = action
        return setPath(['buffers', buffer.id, 'text'], newText, state)
    },
    [CHANGE_BUFFER_TEXT]: (state, action) => {
        const {id, newText} = action
        return setPath(['buffers', id, 'text'], newText, state)
    },
    [CHANGE_META_DATA]: (state, action) => {
        const {id, newMetaData} = action
        return setPath(['buffers', id, 'metaData'], newMetaData, state)
    }
}

let getLayoutWithoutItem = (layout, id) => {
    let layoutItem,
        layoutWithoutItem
    let position = R.findIndex(R.propEq('i', id), layout)
    if (position >= 0) {
        layoutItem = layout[position]
        layoutWithoutItem = R.remove(position, 1, layout)
    } else {
        layoutWithoutItem = layout
    }
    return {
        layout: layoutWithoutItem,
        item: layoutItem,
        position
    }
}

let reducer = createReducer(initialState, reducerFunctions)
export default reducer
