import stampit from '@stamp/it'
import R from 'ramda'
import profiler from './profiler'
import File from './File'
import FunctionBuffer from './FunctionBuffer'

function initInputFile (inputFile) {
    const {id, text} = inputFile
    let file = File.create()
    file.init({
        id,
        unformattedText: text
    })
    return file
}

let BufferManager = stampit().deepProps({
    files: undefined,
    functionBuffers: undefined,
    editorApi: undefined
}).methods({
    ////////////////////////////////////////////////////////////////////////////////
    // helpers
    ////////////////////////////////////////////////////////////////////////////////
    getFileAndNodeForBufferId(bufferId) {
        let file,
            node
        if (this.functionBuffers[bufferId]) {
            let buffer = this.functionBuffers[bufferId]
            file = this.files[buffer.fileId]
            node = R.find(R.propEq('customId', buffer.customId), file.functions)
        } else {
            file = this.files[bufferId]
            node = file.ast
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
    createFunctionBufferIfNeeded(file, node) {
        let existingBufferId = this.getBufferIdForFunctionId(node.customId)
        if (existingBufferId) {
            // buffer already exists, no need to create one
            return existingBufferId
        } else {
            // buffer doesn't exist yet, create it
            let newBufferId = this.editorApi.createFunctionBuffer(node.unformattedText)
            let functionBuffer = FunctionBuffer.create()
            functionBuffer.init({
                customId: node.customId,
                fileId: file.id,
                id: newBufferId
            })
            this.functionBuffers[newBufferId] = functionBuffer
            return newBufferId
        }
    },
    ////////////////////////////////////////////////////////////////////////////////
    // public API
    ////////////////////////////////////////////////////////////////////////////////
    init(editorApi, inputFiles = []) {
        this.editorApi = editorApi
        let files = inputFiles.map(initInputFile)
        this.files = R.zipObj(files.map(R.prop('id')), files)

        this.functionBuffers = {}
    },
    addFile(inputFile) {
        let file = initInputFile(inputFile)
        this.files[file.id] = file
    },
    deleteBuffer(id) {
        delete this.functionBuffers[id]
        delete this.files[id]
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

            let bufferIdToOpen = this.createFunctionBufferIfNeeded(file, foundFunction)
            if (!this.editorApi.isBufferVisible(bufferIdToOpen)) {
                // buffer not visible, open it
                this.editorApi.openBuffer(bufferIdToOpen)
            }
        }
    },
    swapWithParentFunction(bufferId) {
        const {node, file} = this.getFileAndNodeForBufferId(bufferId)

        if (!node || !node.parentFunction) {
            // has no parent, nothing to swap with
        }

        let parentNode = node.parentFunction

        if (parentNode.isRoot) {
            this.editorApi.swapBufferEditors(bufferId, file.id)
        } else {
            let parentBufferId = this.createFunctionBufferIfNeeded(file, parentNode)
            this.editorApi.swapBufferEditors(bufferId, parentBufferId)
        }

    }
})

export default BufferManager
