import stampit from '@stamp/it'
import deepEquals from 'deep-equal'
import R from 'ramda'
import profiler from './profiler'
import File from './File'
import FunctionBuffer from './FunctionBuffer'
import { getMetaData } from './astBackedEditing'

let BufferManager = stampit().deepProps({
    files: undefined,
    functionBuffers: undefined,
    editorApi: undefined,
    options: {
        /**
         * If true we do a string equality check to prevent pushing useless
         * updates to editor when buffer text changed. This can happen
         * wen user edits text, but through Recasts formatting their are small
         * changes, e.g. removed new line at top of file. Disable this check
         * when the underlying editor does this by itself already and in the
         * editor `buffer.updateText(allTextInFile)` is faster than JS string
         * equality when `allTextInFile` contains the same as rendered buffer.
         */
        guardFileUpdateWithDirtyCheck: true
    }
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
            let metaData = {
                ...getMetaData(node),
                hasConnectedError: file.hasConnectedError
            }
            // buffer doesn't exist yet, create it
            let newBufferId = this.editorApi.createFunctionBuffer(node.unformattedText, metaData)
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
    isFile(bufferId) {
        if (R.isNil(this.files[bufferId])) {
            return false
        } else {
            return true
        }
    },
    changeFunctionBufferText(file, node) {
        let bufferId = this.getBufferIdForFunctionId(node.customId)
        if (R.isNil(bufferId)) {
            // doesn't exist in editor
            return
        }
        if (!file.hasConnectedError) {
            this.editorApi.changeBufferText(bufferId, node.text)
        }
    },
    changeFunctionMetaData(file, oldFileErrorState, oldFunctionsMetaData, node) {
        let bufferId = this.getBufferIdForFunctionId(node.customId)
        if (R.isNil(bufferId)) {
            // doesn't exist in editor
            return
        }
        let currentMetaData = getMetaData(node)
        if (!deepEquals(currentMetaData, oldFunctionsMetaData[node.customId]) || oldFileErrorState !== file.hasConnectedError) {
            this.editorApi.changeMetaData(bufferId, {
                hasConnectedError: file.hasConnectedError,
                syntaxError: node.syntaxError,
                title: node.customId
            })
        }
    },
    initInputFile (inputFile) {
        const {id, text} = inputFile
        let file = File.create()
        file.init({
            id,
            unformattedText: text
        })
        this.editorApi.changeMetaData(file.id, file.getMetaData())
        return file
    },
    ////////////////////////////////////////////////////////////////////////////////
    // public API
    ////////////////////////////////////////////////////////////////////////////////
    init(editorApi, inputFiles = []) {
        this.editorApi = editorApi
        let files = inputFiles.map(this.initInputFile, this)
        this.files = R.zipObj(files.map(R.prop('id')), files)

        this.functionBuffers = {}
    },
    addFile(inputFile) {
        let file = this.initInputFile(inputFile)
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

        if (!file || !node) {
            // can't find file or node for unmanaged buffer
            return
        }

        if (!node.parentFunction) {
            // has no parent, nothing to swap with
            return
        }

        let parentNode = node.parentFunction

        if (parentNode.isRoot) {
            this.editorApi.swapBufferEditors(bufferId, file.id)
        } else {
            let parentBufferId = this.createFunctionBufferIfNeeded(file, parentNode)
            this.editorApi.swapBufferEditors(bufferId, parentBufferId)
        }

    },
    updateBufferAst(bufferId, newText) {
        const {node, file} = this.getFileAndNodeForBufferId(bufferId)

        if (!file || !node) {
            // can't find file or node for unmanaged buffer
        }

        let oldFileMetaData = file.getMetaData()
        let oldFunctionsMetaData = R.map(getMetaData, file.functionsMap)

        let changeFunctionBufferText = this.changeFunctionBufferText.bind(this, file)
        let changeFunctionMetaData = this.changeFunctionMetaData.bind(this, file, oldFileMetaData.hasConnectedError, oldFunctionsMetaData)

        if (this.isFile(bufferId)) {
            file.updateFileAst(newText)
            file.functions.forEach(changeFunctionBufferText)
            if (!file.hasConnectedError) {
                // files has no error, so recast has put text into `text` property
                if (this.options.guardFileUpdateWithDirtyCheck) {
                    // send update only when generated text from recast (text) differs from editor text (unformatted)
                    if (file.text !== file.unformattedText) {
                        this.editorApi.changeBufferText(file.id, file.text)
                    }
                } else {
                    // send always
                    this.editorApi.changeBufferText(file.id, file.text)
                }
            }
        } else {
            let {nodesToUpdate, node:newNode} = file.updateFunctionAst(newText, node)
            if (this.options.guardFileUpdateWithDirtyCheck) {
                // check if need to update current edited node also
                if (newNode.text !== newNode.unformattedText) {
                    // was formatted by Recast, update current node and others
                    [newNode, ...nodesToUpdate].forEach(changeFunctionBufferText)
                } else {
                    // only update other nodes
                    nodesToUpdate.forEach(changeFunctionBufferText)
                }
            } else {
                // without gard, send always all nodes
                [newNode, ...nodesToUpdate].forEach(changeFunctionBufferText)
            }
            this.editorApi.changeBufferText(file.id, file.text)
        }

        if (!deepEquals(oldFileMetaData, file.getMetaData())) {
            this.editorApi.changeMetaData(file.id, file.getMetaData())
        }
        file.functions.forEach(changeFunctionMetaData)
    }
})

export default BufferManager
