import stampit from '@stamp/it';
import R from 'ramda'
import profiler from './profiler'
import File from './File'

function initInputFile (inputFile) {
    const {id, text} = inputFile;
    let file = File.create();
    file.init({
        id,
        unformattedText: text
    })
    return file;
}

// FIXME this is a buffer manager as it also stores function buffers to match buffer id from editor to function and its file
let FileManager = stampit().deepProps({
    storage: undefined,
    editorApi: undefined
}).methods({
    init(editorApi, inputFiles = []) {
        this.editorApi = editorApi
        // FIXME process files first, then try to find other buffers in that files
        let files = inputFiles.map(initInputFile)
        this.storage = R.zipObj(files.map(R.prop('id')), files)
    },
    addFile(inputFile) {
        let file = initInputFile(inputFile)
        this.storage[file.id] = file;
    },
    openFunctionUnderCursor(bufferId, cursor) {
        let stop = profiler.start('- open function editor for function under cursor')
        let file = this.storage[bufferId]
        // FIXME this can be also function node, if bufferId represents function editor
        let node = file.ast;
        if (!file || !node) {
            // can't find file or node for (perhaps not) focused editor
            stop()
        }

        let foundFunction = file.findFunctionAroundCursor(node, cursor)
        if (foundFunction.customId === node.customId) {
            // inner most function is the same function as the editor already focused, nothing to do
            stop()
            // FIXME do it for function editors
            console.log('not implemented');
        } else if (foundFunction !== undefined) {
            // open editor
            stop()

            // FIXME check if buffer exists and focus it instead of creating it again
            let bufferId = this.editorApi.createBuffer(foundFunction.unformattedText)
            // FIXME add function editor to storage and also associate created function editor (buffer) with internal storage, we need this later when we want a function and bufferId stands for function editor
            this.editorApi.openBuffer(bufferId)
        } else {
            // nothing found
            stop()
        }
    }
})

export default FileManager
