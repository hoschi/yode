import R from 'ramda'
import Core from 'core'
import { selectAllFiles, ADD_FILE_TO_STORAGE } from 'store/editorReducer'
import emitter from './emitter'

//let withoutType = R.omit(['type'])

const core = Core.create();

const handlers = {
    [ADD_FILE_TO_STORAGE]: ({action}) => {
        const {path, text} = action;
        core.addFile({
            id: path,
            text
        })
        // FIXME set file text in demo
        // FIXME handle syntax error case
    }
}

let initPlugin = (initialState) => {
    let files = selectAllFiles(initialState)
    core.init(files)
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
