import recast from 'recast';
import esprima from 'esprima-fb';
import jsxKeys from 'estraverse-fb/keys';
import estraverseOrig from '../../../lib/estraverse'

export let estraverse = {
    ...estraverseOrig,
    traverse(ast, options) {
        return estraverseOrig.traverse(ast, {
            ...options,
            keys:jsxKeys
        });
    },
    replace(ast, options) {
        return estraverseOrig.replace(ast, {
            ...options,
            keys:jsxKeys
        });
    }
};

export function parse (text) {
    let result = recast.parse(text, {
        parser: esprima
    });
    if (result) {
        return result.program;
    }
    return result;
}

export function print (ast) {
    return recast.print(ast).code;
}

