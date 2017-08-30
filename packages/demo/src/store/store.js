import { createStore, compose, applyMiddleware } from 'redux'
import {emitterMiddleware} from 'plugin/emitter'
import initPlugin from 'plugin/YodeDemoPlugin'
import EditorApi from 'plugin/EditorApi'

const rootReducer = require('./rootReducer').default

let middlewares = [emitterMiddleware]

// setup modifiers for store creation
let modifiers = [applyMiddleware(...middlewares)]
if (window.devToolsExtension) {
    modifiers.push(window.devToolsExtension())
}
const finalCreateStore = compose.apply(this, modifiers)(createStore)

// create store from reducers bundled in root reducer
const store = finalCreateStore(rootReducer)

let editorApi = EditorApi.create()
editorApi.init(store.dispatch)
initPlugin(store.getState(), editorApi)

// enable hot module reloading for reducers
if (module.hot) {
    module.hot.accept('./rootReducer', () => {
        store.replaceReducer(require('./rootReducer').default)
    })
}

export default store
