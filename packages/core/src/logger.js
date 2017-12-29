import * as R from 'ramda'

let noop = () => {
}

let shouldLog = true
if (process.env.YODE_LOGGER_DISABLED) {
    shouldLog = false
}

let levels = ['log', 'debug', 'error']

let logger = R.pipe(
    R.pickAll(levels),
    R.map(R.pipe(
        R.ifElse(R.isNil, R.always(noop), R.identity),
        R.bind(R.__, console),
        R.ifElse(R.always(shouldLog), R.identity, R.always(noop))
    ))
)(console || {})

export default  logger

