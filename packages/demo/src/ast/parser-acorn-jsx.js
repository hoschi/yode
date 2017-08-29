import * as acornBase from 'acorn'
import inject from 'acorn-jsx/inject'
import estraverse from '../../../lib/estraverse'
import escodegen from 'escodegen'

let acorn = inject(acornBase)

let parser = {
    estraverse,
    parse(text) {
        return acorn.parse(text, {
            plugins: {
                jsx: true
            },
            ecmaVersion: 6,
            sourceType: 'module',
            locations: true
        });
    },
    print(ast) {
        // TODO not working, escodegen can't generate JSX tags
        return escodegen.generate(ast);
    }
}

export default parser;
