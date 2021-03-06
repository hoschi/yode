import stampit from '@stamp/it'
import { createBuffer, openEditorById, selectVisibleBuffers, swapBufferEditors, changeBufferText, changeMetaData, deleteBuffer } from 'store/editorReducer'
import { ANONYMOUS_BUFFER_PREFIX } from 'consts'

let id = 1
function getNextBufferId () {
    return ANONYMOUS_BUFFER_PREFIX + '-' + id++
}

let EditorApi = stampit().deepProps({
    dispatch: undefined,
    getState: undefined
}).methods({
    init({dispatch, getState}) {
        this.dispatch = dispatch
        this.getState = getState
    },
    createFunctionBuffer(text, metaData) {
        let id = getNextBufferId()
        this.dispatch(createBuffer({
            id,
            text
        }))
        this.dispatch(changeMetaData({
            id,
            newMetaData: metaData
        }))
        return id
    },
    openBuffer(id) {
        this.dispatch(openEditorById({
            id
        }))
    },
    isBufferVisible(id) {
        let visibleBuffers = selectVisibleBuffers(this.getState())
        return !!visibleBuffers[id]
    },
    swapBufferEditors(oldId, newId) {
        this.dispatch(swapBufferEditors({
            oldId,
            newId
        }))
    },
    changeBufferText(id, newText) {
        this.dispatch(changeBufferText({
            id,
            newText
        }))
    },
    changeMetaData(id, newMetaData) {
        this.dispatch(changeMetaData({
            id,
            newMetaData
        }))
    },
    deleteBuffer(id) {
        this.dispatch(deleteBuffer({
            id
        }))
    }
})

export default EditorApi
