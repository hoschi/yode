import stampit from '@stamp/it'
import deepEquals from 'deep-equal'
import * as R from 'ramda'
import profiler from './profiler'
import File from './File'
import FunctionBuffer from './FunctionBuffer'
import { getMetaData } from './astBackedEditing'

function areTextsEqual (unformattedParam, formattedParam) {
    let unformatted = unformattedParam ? R.trim(unformattedParam) : undefined
    let formatted = formattedParam ? R.trim(formattedParam) : undefined

    return unformatted === formatted
}

let BufferManager = stampit().deepProps({
    files: undefined,
    functionBuffers: undefined,
    editorApi: undefined,
    options: {
        /**
         * If true we do a string equality check to prevent pushing useless
         * updates to editor when buffer text changed. This can happen
         * wen user edits text, but through Recasts formatting their are small
         * changes, e.g. removed whitespace at top/end of file. Disable this check
         * when the underlying editor does this by itself already and in the
         * editor `buffer.updateText(allTextInFile)` is faster than JS string
         * equality when `allTextInFile` contains the same as rendered buffer.
         *
         * This flag also enables a manual "format" action issued by the user,
         * if the auto formatting is undesired by the user. In that case the
         * flag should be set to `false`. Editor itself must than check if
         * text given from Yode is not the same as in the corresponding buffer
         * and give the user an action to "format" the text.
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
                ...currentMetaData,
                hasConnectedError: file.hasConnectedError
            })
        }
    },
    deleteBufferByNode(node) {
        let bufferId = this.getBufferIdForFunctionId(node.customId)
        if (!R.isNil(bufferId)) {
            this.editorApi.deleteBuffer(bufferId)
        }
        delete this.functionBuffers[node.customId]
    },
    initInputFile(inputFile) {
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
    /**
     * Init state when editor is ready.
     *
     * @param {Object} editorApi instance to use to communicate with editor
     * @param {Object[]} inputFiles which are already open, e.g. from session
     *   loading logic or command line args
     * @param {String} inputFiles[].id of the file
     * @param {String} inputFiles[].text content of the file
     */
    init(editorApi, inputFiles = []) {
        this.editorApi = editorApi
        let files = inputFiles.map(this.initInputFile, this)
        this.files = R.zipObj(files.map(R.prop('id')), files)

        this.functionBuffers = {}
    },
    /**
     * Add a file not known to Yode yet.
     *
     * E.g. when session loading of editor is over and the user starts
     * interacting with it and opens a file from disk.
     *
     * @param {String} id of the file
     * @param {String} text content of the file
     */
    addFile(inputFile) {
        let file = this.initInputFile(inputFile)
        this.files[file.id] = file
    },
    /**
     * Remove a buffer from state.
     *
     * When a buffer gets removed from editors state and inmemory representation of that vanishes.
     * E.g. a file is closed and any (e.g. not saved changes) state is removed from memory. When
     * user opens that file again it shows the content as it is on disk.
     *
     * @param {String} id of buffer/file
     */
    deleteBuffer(id) {
        if (this.functionBuffers[id]) {
            delete this.functionBuffers[id]
        } else if (this.files[id]) {
            const file = this.files[id]
            // delete all function buffers from editor and our state
            file.functions.forEach(this.deleteBufferByNode, this)
            // delete file
            delete this.files[id]
        }
    },
    /**
     * Open function buffer of the function "under" cursor.
     *
     * This method tries to find the function around the cursor position. If it can't find a function,
     * nothing will happen. If function found has no buffer, one will be
     * created. If function buffer isn't visible, it will be opened.
     *
     * @param {String} bufferId of buffer to search in
     * @param {Object} cursor position in this buffer. Character count from
     *   start of the buffer, which starts at zero.
     */
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
    /**
     * Swap function buffer with its parent function/file.
     *
     * This methods look at the parent function (if available) and uses the editor API to replace the current
     * buffer editor with the editor of the parent. This way the user can broaden his current view. If the
     * parent function has no buffer state, it will be created. If there is no parent function, but the current
     * buffer is a function buffer, the file buffer will be opened instead.
     *
     * @param {String} bufferId of child buffer
     */
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
    /**
     * After buffer text changed this method updates Yodes internal state with this new information.
     *
     * This is a noop if the buffer is not managed by Yode, e.g. because the file type is something other than
     * JavaScript. If the underlying parser can't parse the buffer, meta data is updated accordingly.
     * If the underlying parser changed the text by formatting the input text the edit will be informed.
     * The option `guardFileUpdateWithDirtyCheck` can modify this logic. All buffers which have have state in
     * editor are changed accordingly. Functions which were changed, but editor has no state, only Yodes state
     * gets updated and no updates are pushed to editor.
     *
     * @param {String} bufferId of changed buffer
     * @param {String} newText of this buffer
     */
    updateBufferAst(bufferId, newText) {
        let removedFunctions
        const {node, file} = this.getFileAndNodeForBufferId(bufferId)

        if (!file || !node) {
            // can't find file or node for unmanaged buffer
        }

        let oldFileMetaData = file.getMetaData()
        let oldFunctionsMetaData = R.map(getMetaData, file.functionsMap)

        let changeFunctionBufferText = this.changeFunctionBufferText.bind(this, file)
        let changeFunctionMetaData = this.changeFunctionMetaData.bind(this, file, oldFileMetaData.hasConnectedError, oldFunctionsMetaData)

        if (this.isFile(bufferId)) {
            const updateInfo = file.updateFileAst(newText)
            removedFunctions = updateInfo.removedFunctions
            file.functions.forEach(changeFunctionBufferText)
            if (!file.hasConnectedError) {
                // files has no error, so recast has put text into `text` property
                if (this.options.guardFileUpdateWithDirtyCheck) {
                    // send update only when generated text from recast (text) differs from editor text (unformatted)
                    if (!areTextsEqual(file.unformattedText, file.text)) {
                        this.editorApi.changeBufferText(file.id, file.text)
                    }
                } else {
                    // send always
                    this.editorApi.changeBufferText(file.id, file.text)
                }
            }
        } else {
            const updateInfo = file.updateFunctionAst(newText, node)
            let {nodesToUpdate, node:newNode} = updateInfo
            removedFunctions = updateInfo.removedFunctions
            if (this.options.guardFileUpdateWithDirtyCheck) {
                // check if need to update current edited node also
                if (!areTextsEqual(newNode.unformattedText, newNode.text)) {
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

        if (removedFunctions) {
            removedFunctions.forEach(this.deleteBufferByNode, this)
        }
    }
})

export default BufferManager
