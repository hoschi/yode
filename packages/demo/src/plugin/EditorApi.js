import stampit from '@stamp/it';
import {createBuffer, openEditorById} from 'store/editorReducer'

let id = 1;
function getNextBufferId () {
    return 'genBufferId-' + id++
}

let EditorApi = stampit().deepProps({
    dispatch: undefined
}).methods({
    init(dispatch) {
        this.dispatch = dispatch;
    },
    createBuffer(text) {
        let id = getNextBufferId();
        this.dispatch(createBuffer({ id, text }))
        return id
    },
    openBuffer(id) {
        this.dispatch(openEditorById({ id }))
    }
})

export default EditorApi
