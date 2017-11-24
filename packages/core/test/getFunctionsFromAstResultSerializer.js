const R = require('ramda')
const serializeChildren = require("./serializeChildren")

module.exports = {
    test(val) {
        return val && R.has('functions', val) && R.has('functionsTreeRoot', val)
    },
    print(val, serialize) {
        return serialize({
            ...R.omit(['functionsTreeRoot'], val),
            'functionsTreeRoot(shortened)':{
                ...R.omit(['children'], val.functionsTreeRoot),
                children:serializeChildren(val.functionsTreeRoot.children, serialize)
            }
        })
    },
}
