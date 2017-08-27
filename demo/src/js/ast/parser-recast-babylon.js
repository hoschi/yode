import recast from 'recast';
import * as babylon from 'babylon'
//import estraverse from '../../../lib/estraverse'
import traverse from 'babel-traverse'

let parser = {
    // doesn't work with current code because traverse and replace API doesn't match estraverse
    estraverse: traverse,
    parse(text) {
        let result = babylon.parse(text, {
            sourceType: 'module',
            allowImportExportEverywhere: false,
            allowReturnOutsideFunction: false,
            plugins: ["*", "jsx", "flow"]
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
