import stampit from '@stamp/it';
import {createBuffer, openEditorById, selectVisibleBuffers, swapBufferEditors, changeBufferText, changeMetaData} from 'store/editorReducer'
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
    swapBufferEditors(oldId, newId) {
        this.dispatch(swapBufferEditors({oldId, newId}))
    },
    changeBufferText(id, newText) {
        this.dispatch(changeBufferText({id, newText}))
    },
    changeMetaData(id, newMetaData) {
        this.dispatch(changeMetaData({id, newMetaData}))
    }
})

export default EditorApi
