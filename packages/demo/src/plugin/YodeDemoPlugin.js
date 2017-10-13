import R from 'ramda'
import Core from 'core'
import { selectAllFiles, ADD_FILE_TO_STORAGE, DELETE_BUFFER, SWAP_WITH_PARENT_FUNCTION, selectFocusedEditorId, selectCursor } from 'store/editorReducer'
import {OPEN_FUNCTION_EDITOR_UNDER_CURSOR} from './yodeActions.js'
import emitter from './emitter'

const core = Core.create();

const handlers = {
    [ADD_FILE_TO_STORAGE]: ({action}) => {
        const {path, text} = action;
        core.addFile({
            id: path,
            text
        })
    },
    [OPEN_FUNCTION_EDITOR_UNDER_CURSOR]: ({state}) => {
        let cursor = selectCursor(state)
        let focusedEditorId = selectFocusedEditorId(state)

        if (R.isNil(cursor) || R.isNil(focusedEditorId)) {
            // nothing to do
            return
        }

        core.openFunctionUnderCursor(focusedEditorId, cursor)
    },
    [DELETE_BUFFER]:({action}) => {
        core.deleteBuffer(action.id)
    },
    [SWAP_WITH_PARENT_FUNCTION]: ({action}) => {
        core.swapWithParentFunction(action.id)
    },
}

let initPlugin = (initialState, editorApi) => {
    let files = selectAllFiles(initialState)
    core.init(editorApi, files)
    console.log('core initialized', core)
    R.mapObjIndexed((handler, eventName) => emitter.on(eventName, handler), handlers)

    emitter.on('*', (eventName, ev) => {
        if (!R.has(eventName, handlers)) {
            // not handled by plugin
            return;
        }
        console.log(eventName, ev, core)
    })
}

export default initPlugin
