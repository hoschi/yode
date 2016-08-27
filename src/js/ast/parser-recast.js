import recast from 'recast';
export function parse (text) {
    let result = recast.parse(text);
    if (result) {
        return result.program;
    }
    return result;
}

export function print (ast) {
    return recast.print(ast).code;
}
