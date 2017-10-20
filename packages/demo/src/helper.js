import R from 'ramda'

export let createNotImplementedActionCreator = (msg) => () => {
    console.log('not implemented', msg)
    return {
        type: 'NOT_IMPLEMENTED',
        msg
    }
}

export let setProp = R.curry((prop, value, obj) => R.set(R.lensProp(prop), value, obj))
export let setPath = R.curry((path, value, obj) => R.set(R.lensPath(path), value, obj))
