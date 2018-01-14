const R = require('ramda')

let serializeChildrenRecursive = (children) => {
    if (R.isNil(children) || R.isEmpty(children)) {
        return children
    }

    return children.map((child) => {
        return {
            customId: child.customId,
            children: serializeChildrenRecursive(child.children)
        }
    });
}

module.exports = (val, serialize) => {
    return serialize(serializeChildrenRecursive(val))
        .replace(/Object {/g, '{')
        .replace(/Array \[/g, '[')
        .replace(/"/g, '')
        .replace(/\n/g, '\n    ')
}
