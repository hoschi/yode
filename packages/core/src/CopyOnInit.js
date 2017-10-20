import R from 'ramda'
import stampit from '@stamp/it'

let CopyOnInit = stampit().methods({
    init(params) {
        R.mapObjIndexed((value, key) => {
            this[key] = value
        }, params)
    }
})

export default CopyOnInit
