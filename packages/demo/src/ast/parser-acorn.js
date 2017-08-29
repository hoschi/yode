import * as acorn from 'acorn'
import estraverse from '../../../lib/estraverse'
import escodegen from 'escodegen'

let parser = {
    estraverse,
    parse(text) {
        return acorn.parse(text, {
            ecmaVersion: 6,
            sourceType: 'module',
            locations: true
        });
    },
    print(ast) {
        return escodegen.generate(ast);
    }
}

export default parser;
