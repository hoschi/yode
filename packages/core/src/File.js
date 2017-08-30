import stampit from '@stamp/it';
import { parseCode, getFunctionsFromAst, printAst } from './astBackedEditing'

let File = stampit().deepProps({
    id: undefined,
    syntaxError: undefined,
    text: undefined,
    unformattedText: undefined,
    ast: undefined,
    hasConnectedError: undefined,
    functions: undefined,
    functionsTreeRoot: undefined
}).methods({
    init({id, unformattedText}) {
        this.id = id

        // create formatted code
        let {error: syntaxError, ast} = parseCode(unformattedText)
        if (ast) {
            this.text = printAst(ast)
            // refresh ast from formatted code
            let {ast: astFormatted} = parseCode(this.text)
            this.ast = astFormatted
            let {functions, functionsTreeRoot} = getFunctionsFromAst(this.ast, this.id)
            functions.forEach((node) => {
                // create text for each function at start, because recast can't
                // keep all formatting when parsing code snippets instead of code
                // in file
                node.text = printAst(node);
                // and use this as editor text, so we don't start with "dirty" editors
                node.unformattedText = node.text
            });
            this.functions = functions;
            this.functionsTreeRoot = functionsTreeRoot
            // set text in node
            this.ast.text = this.ast.unformattedText = this.text;
        } else {
            this.text = unformattedText
            this.functions = []
            this.functionsTreeRoot = {
                children: [],
                isRoot: true
            }
            this.syntaxError = syntaxError
            this.hasConnectedError = true
        }

        this.unformattedText = this.text
    }
})

export default File
