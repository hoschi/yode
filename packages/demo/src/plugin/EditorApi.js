import stampit from '@stamp/it';
import {createBuffer, openEditorById, selectVisibleBuffers} from 'store/editorReducer'
import {anonymousBufferPrefix, functionEditorType} from 'consts'

let id = 1;
function getNextBufferId () {
    return anonymousBufferPrefix + '-' + id++
}

let EditorApi = stampit().deepProps({
    dispatch: undefined,
    getState: undefined
}).methods({
    init({dispatch, getState}) {
        this.dispatch = dispatch;
        this.getState = getState
    },
    createFileBuffer(text) {
        let id = getNextBufferId();
        this.dispatch(createBuffer({ id, text}))
        return id
    },
    createFunctionBuffer(text) {
        let id = getNextBufferId();
        this.dispatch(createBuffer({ id, text, editorType:functionEditorType}))
        return id
    },
    openBuffer(id) {
        this.dispatch(openEditorById({ id }))
    },
    isBufferVisible(id) {
        let visibleBuffers = selectVisibleBuffers(this.getState())
        return !!visibleBuffers[id]
    },
})

export default EditorApi
