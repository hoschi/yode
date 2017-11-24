const R = require('ramda')
const types = require("ast-types")
const serializeChildren = require("./serializeChildren")
const n = types.namedTypes

let printLoc = ({line, column}) => `${line}:${column}`
let getTextFields = R.ifElse(
    ({text, unformattedText}) => text === unformattedText,
    R.always(['text']),
    R.always(['text', 'unformattedText'])
)

module.exports = {
    test(val) {
        return val && n.Node.check(val)
    },
    print(val, serialize, indent) {
        let name = `${val.type} ${printLoc(val.loc.start)}-${printLoc(val.loc.end)}`
        let additionalInfo = R.pick([
            'customId',
            'fileId',
            'syntaxError',
        ], val)

        let texts = R.pipe(
            R.pick(getTextFields(val)),
            R.map(R.pipe(indent, R.trim))
        )(val)
        return name + serialize({
            ...additionalInfo,
            ...texts,
            children:serializeChildren(val.children, serialize)
        }).replace(/^Object/, '')
    },
}
