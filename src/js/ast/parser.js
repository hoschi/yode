import * as acorn from 'acorn'
// TODO disable for now, with this plugin parsers gets in stalled state after some wrong code is parsed
// import inject from 'acorn-jsx/inject'

// export default inject(acorn)
export default acorn

export {default as  estraverse } from '../../../lib/estraverse'
