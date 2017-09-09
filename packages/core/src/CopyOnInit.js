import stampit from '@stamp/it';
import {mutateObj} from 'helper'

let CopyOnInit = stampit().methods({
    init(params) {
        mutateObj(params, this)
    },
})

export default CopyOnInit

