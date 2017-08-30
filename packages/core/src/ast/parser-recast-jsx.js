import recast from 'recast';
import * as acornBase from 'acorn'
import inject from 'acorn-jsx/inject'
import jsxKeys from 'estraverse-fb/keys';
import estraverseOrig from 'lib/estraverse'

let acorn = inject(acornBase)

let acornParser = {
    parse(text, options) {
        let baseOptions = {
            plugins: {
                jsx: true
            }
        };
        let mergedOptions = Object.assign({}, options, baseOptions);
        return acorn.parse(text, mergedOptions);
    }
}

let parser = {
    estraverse: {
        ...estraverseOrig,
        traverse(ast, options) {
            return estraverseOrig.traverse(ast, {
                ...options,
                keys: jsxKeys
            });
        },
        replace(ast, options) {
            return estraverseOrig.replace(ast, {
                ...options,
                keys: jsxKeys
            });
        }
    },
    parse(text) {
        let result = recast.parse(text, {
            parser: acornParser
        });
        if (result) {
            return result.program;
        }
        return result;
    },
    print(ast) {
        return recast.print(ast).code;
    }
}

export default parser;
