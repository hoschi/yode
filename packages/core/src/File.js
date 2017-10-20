import stampit from '@stamp/it'
import profiler from './profiler'
import { parseCode, getFunctionsFromAst, getAllContainerNodesRecursive, getAllChildrenNodesRecursive, printAst, addTextToNode, replaceNodeInAst, getNodeForFirstFoundType, isNodeDirty, getInnerMostFunctionNode } from './astBackedEditing'
import { getFunctionByText } from 'ast/compareFunctions'

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
                node.text = printAst(node)
                // and use this as editor text, so we don't start with "dirty" editors
                node.unformattedText = node.text
            })
            this.functions = functions
            this.functionsTreeRoot = functionsTreeRoot
            // set text in node
            this.ast.text = this.ast.unformattedText = this.text
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
    },
    updateFileAst(newText) {
        let stop = profiler.start('- file text update')
        let {error: syntaxError, ast} = parseCode(newText)
        if (syntaxError) {
            // broken code, wait for working code
            this.syntaxError = syntaxError
            this.unformattedText = newText
            this.hasConnectedError = true
            stop()
            return
        }
        this.syntaxError = undefined
        // error of the whole this is now gone, because this is the only editor which can be edited and change the error state
        this.hasConnectedError = false

        this.ast = ast
        this.text = printAst(ast)
        // add unformatted text for editor
        this.unformattedText = newText
        this.ast.text = newText
        this.ast.unformattedText = newText

        let {functions, functionsTreeRoot} = getFunctionsFromAst(this.ast, this.id, this.functions)
        this.functions = functions
        this.functionsTreeRoot = functionsTreeRoot
        stop()
    },
    updateFunctionAst(newText, oldFunction) {
        let newFunction

        let stop = profiler.start('- text update')
        let {error: syntaxError, ast} = parseCode(newText)
        if (syntaxError) {
            // broken code, wait for working code
            this.functions = this.functions.map(f => {
                if (f.customId === oldFunction.customId) {
                    // set new state for editor
                    return {
                        ...f,
                        syntaxError,
                        unformattedText: newText
                    }
                }
                return f
            })
            this.hasConnectedError = true
            stop()
            return
        }

        // error of this file is gone
        oldFunction.syntaxError = undefined
        // error of the whole file is now gone, because this is the only editor which can be edited and change the error state
        this.hasConnectedError = false

        // ast parsing wraps text in other nodes, because it parses it
        // standalone and out of context of original text
        newFunction = getNodeForFirstFoundType(oldFunction.type, ast)
        if (!newFunction) {
            // not found, uh oh?!
            throw new Error('old node type not found')
        }

        // add formatted text for function node comparision
        addTextToNode(newFunction)
        // add unformatted text for editor
        newFunction.unformattedText = newText
        // save old id, because it is still the same function
        newFunction.customId = oldFunction.customId

        // replace ast of old function, with ast generated from newText, in file ast
        this.ast = replaceNodeInAst(newFunction, this.ast)

        // update file text with merged ast
        let fileText = printAst(this.ast)

        // update text if possible
        if (!isNodeDirty(this)) {
            // in sync, update
            this.text = fileText
            this.unformattedText = fileText
            this.ast.text = fileText
            this.ast.unformattedText = fileText
        }

        // get functions to compare, current changed one can't be matched
        let functionsToCompare = this.functions.filter(f => newFunction.customId !== f.customId)
        // update functions and port props from already known functions
        let {functions, functionsTreeRoot} = getFunctionsFromAst(this.ast, this.id, functionsToCompare)
        this.functions = functions
        this.functionsTreeRoot = functionsTreeRoot

        // collect function nodes to update by walking up the linked list of
        // containing functions. This list is no up to date after running
        // getFunctionsFromAst
        let containerNodesToUpdate = getAllContainerNodesRecursive(newFunction.parentFunction)
        let childrenNodesToUpdate = getAllChildrenNodesRecursive(newFunction.children)
        let nodesToUpdate = containerNodesToUpdate.concat(childrenNodesToUpdate)

        stop()
        return nodesToUpdate
    },
    findFunctionAroundCursor(node, cursor) {
        let innerFunctionNode = getInnerMostFunctionNode(node, cursor)
        if (!innerFunctionNode) {
            // can't find inner most function node, perhaps because code is not parsable
            return
        }
        let innerFunctionText = printAst(innerFunctionNode)
        let foundFunction = getFunctionByText(innerFunctionText, this.functions)
        return foundFunction
    }
})

export default File
