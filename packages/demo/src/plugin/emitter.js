import mitt from 'mitt'

const emitter = mitt()

export const emitterMiddleware = store => next => action => {
    let result = next(action)
    emitter.emit(action.type, {
        state: store.getState(),
        action
    })
    return result
}

export default emitter
