import stampit from '@stamp/it';

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
        this.unformattedText = unformattedText
    }
})

export default File
