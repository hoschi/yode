import stampit from '@stamp/it';
import CopyOnInit from './CopyOnInit'

let FunctionBuffer = stampit().deepProps({
    customId: undefined,
    fileId: undefined
}).compose(CopyOnInit)

export default FunctionBuffer

