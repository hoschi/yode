import { createStore, compose } from 'redux'

const rootReducer = require('./rootReducer').default

// setup modifiers for store creation
let modifiers = []
if (window.devToolsExtension) {
    modifiers.push(window.devToolsExtension())
}
const finalCreateStore = compose.apply(this, modifiers)(createStore)

// create store from reducers bundled in root reducer
const store = finalCreateStore(rootReducer)

// enable hot module reloading for reducers
if (module.hot) {
    module.hot.accept('./rootReducer', () => {
        store.replaceReducer(require('./rootReducer').default)
    })
}

export default store
