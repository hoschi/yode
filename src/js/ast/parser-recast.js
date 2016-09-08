import recast from 'recast';
import inject from 'acorn-jsx/inject'
import * as acornBase from 'acorn'
import estraverse from '../../../lib/estraverse'

let acorn = inject(acornBase)

let parser = {
    estraverse,
    parse(text) {
        let result = recast.parse(text, {
            parser: acorn
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


