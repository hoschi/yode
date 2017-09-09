import stampit from '@stamp/it';
import R from 'ramda'
import profiler from './profiler'
import File from './File'
import FunctionBuffer from './FunctionBuffer'

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
    files: undefined,
    functionBuffers: undefined,
    editorApi: undefined
}).methods({
    init(editorApi, inputFiles = []) {
        this.editorApi = editorApi
        let files = inputFiles.map(initInputFile)
        this.files = R.zipObj(files.map(R.prop('id')), files)

        this.functionBuffers = {}
    },
    addFile(inputFile) {
        let file = initInputFile(inputFile)
        this.files[file.id] = file;
    },
    removeFunctionBuffer(id) {
        delete this.functionBuffers[id]
    },
    getFileAndNodeForBufferId(bufferId) {
        let file,
            node
        if (this.functionBuffers[bufferId]) {
            let buffer = this.functionBuffers[bufferId]
            file = this.files[buffer.fileId]
            node = R.find(R.propEq('customId', buffer.customId), file.functions)
        } else {
            file = this.files[bufferId]
            node = file.ast;
        }
        return {
            file,
            node
        }
    },
    getBufferIdForFunctionId(customId) {
        let foundBuffer = R.find(R.propEq('customId', customId), R.values(this.functionBuffers)) || {}
        return foundBuffer.id
    },
    openFunctionUnderCursor(bufferId, cursor) {
        const stop = profiler.start('- open function editor for function under cursor')

        const {file, node} = this.getFileAndNodeForBufferId(bufferId)

        if (!file || !node) {
            // can't find file or node for (perhaps not) focused editor
            stop()
        }

        let foundFunction = file.findFunctionAroundCursor(node, cursor)

        if (!foundFunction) {
            // nothing found
            stop()
            return
        }

        if (foundFunction.customId === node.customId) {
            // inner most function is the same function as the editor already focused, nothing to do
            stop()
        } else {
            // Yode is done, tell editor to open found node
            stop()

            let existingBufferId = this.getBufferIdForFunctionId(foundFunction.customId)
            if (existingBufferId) {
                // buffer already exists, no need to create one
                if (!this.editorApi.isBufferVisible(existingBufferId)) {
                    this.editorApi.openBuffer(existingBufferId)
                }
            } else {
                let newBufferId = this.editorApi.createBuffer(foundFunction.unformattedText)
                let functionBuffer = FunctionBuffer.create()
                functionBuffer.init({
                    customId: foundFunction.customId,
                    fileId: file.id,
                    id: newBufferId
                })
                this.functionBuffers[newBufferId] = functionBuffer
                this.editorApi.openBuffer(newBufferId)
            }
        }
    }
})

export default FileManager
