import profiler from './profiler'
import logger from './logger'
import * as R from 'ramda'
import parser from 'ast/parser-recast-jsx'
import { getFunctionIndexByText } from 'ast/compareFunctions'
import {getNextId}from'./customIdGenerator'

let {estraverse} = parser
function parse (...args) {
    //let stop = profiler.start('parse', true);
    let r = parser.parse.apply(parser, args)
    //stop();
    return r
}

export function printAst (...args) {
    //let stop = profiler.start('--- printAst', true);
    let r = parser.printAst.apply(parser, args)
    //stop();
    return r
}

export let getMetaData = (node) => ({
    ...R.pick(['hasConnectedError', 'syntaxError'], node),
    title: 'node-' + node.customId
})

export function addTextToNode (ast) {
    ast.text = printAst(ast)
}

export function getNodeForFirstFoundType (type, ast) {
    let found
    estraverse.traverse(ast, {
        // search for node with same type as old function and save that one instead
        enter(node) {
            if (node.type === type) {
                found = node
                this.break()
            }
        }
    })
    return found
}

export function replaceNodeInAst (replacementNode, ast) {
    let modifiedAst = estraverse.replace(ast, {
        enter(node) {
            if (node.customId === replacementNode.customId) {
                return replacementNode
            }
        }
    })
    return modifiedAst
}

export function getAllContainerNodesRecursive (node, collected = []) {
    if (!node || node.isRoot) {
        return collected
    }
    return getAllContainerNodesRecursive(node.parentFunction, collected.concat([node]))
}

export function getAllChildrenNodesRecursive (nodes, collected = []) {
    if (R.isEmpty(nodes)) {
        return collected
    }

    return R.concat(
        nodes,
        R.chain((node) => {
            return getAllChildrenNodesRecursive(node.children, nodes.children)
        }, nodes)
    )
}

let cursorIsInNode = (cursor, node) => cursor > node.start && cursor < node.end

export function parseCode (text) {
    let stop = profiler.start('-- code to ast')
    let ast
    try {
        ast = parse(text)
    } /* eslint-disable */ catch ( error ) /* eslint-enable */ {
        logger.log(error)
        stop()
        return {
            error
        }
    }
    stop()
    return {
        ast
    }
}

export function getFunctionsFromAst (ast, fileId, functionsToCompare) {
    let stop = profiler.start('-- ast to functions')
    let functions = []
    let functionsToCompareLeft

    if (functionsToCompare) {
        functionsToCompareLeft = [].concat(functionsToCompare)
    }

    let parentFunc
    let currentFunc = {
        children: [],
        isRoot: true
    }
    let functionsTreeRoot = currentFunc

    let addNodeToParent = (node) => {
        parentFunc = currentFunc
        parentFunc.children.push(node)

        currentFunc = node
        // set empty children, in case this node has children from previous runs, which get now collected again
        currentFunc.children = []
        node.parentFunction = parentFunc
    }

    let leaveFunctionNode = () => {
        currentFunc = parentFunc
        parentFunc = currentFunc.parentFunction
    }

    estraverse.traverse(ast, {
        enter(node) {
            // code generated from FunctionExpression are not parseable again, skip for now
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                addNodeToParent(node)
                if (node.unformattedText === node.text) {
                    // update both, because this can't disturb user input.
                    // Editor text and generated text are in sync. This is
                    // important when node.text changed from outside. E.g. when
                    // changing an inner function of this function node. In
                    // this case the generated text is not the text which is in
                    // the editor, because the ast changed, not the editor.
                    //
                    // TODO this can be removed when we track function containment, then we can replace the changed function AST in all containers not only file AST
                    addTextToNode(node)
                    node.unformattedText = node.text
                } else {
                    // always regenerate text for node, because this node could
                    // contain a function which was changed.
                    //
                    // TODO Could be skipped when `node.text` is already there
                    // and we can make sure this node contains no other
                    // function.
                    addTextToNode(node)
                }

                // AST nodes can't have syntax error, only unformatted code can
                node.syntaxError = undefined

                if (!node.unformattedText) {
                    // set unformatted (starting) text to node in case this is first run
                    node.unformattedText = node.text
                }

                // update or assign custom id
                if (node.customId) {
                    if (functionsToCompareLeft) {
                        // remove from compare list, we know this function by id
                        let currentFunctionIndex = functionsToCompareLeft.findIndex(f => f.customId === node.customId)
                        if (currentFunctionIndex >= 0) {
                            functionsToCompareLeft.splice(currentFunctionIndex, 1)
                        }
                    }
                } else {
                    // check if we previously known that function already
                    let foundFunctionIndex
                    if (functionsToCompareLeft) {
                        foundFunctionIndex = getFunctionIndexByText(node.text, functionsToCompareLeft)
                    }
                    if (foundFunctionIndex >= 0) {
                        let foundFunction = functionsToCompareLeft[foundFunctionIndex]
                        node.customId = foundFunction.customId
                        // remove function we found
                        functionsToCompareLeft.splice(foundFunctionIndex, 1)
                    } else {
                        node.customId = getNextId()
                    }
                }
                node.fileId = fileId
                // create new object to change identity, so redux subscriptions work as expected
                functions.push({
                    ...node
                })
            }
        },
        leave(node) {
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                leaveFunctionNode(node)
            }
        }
    })

    // do some info logging
    if (functionsToCompareLeft && functionsToCompareLeft.length > 0) {
        logger.log('REMOVED FUNCTIONS', functionsToCompareLeft.length, functionsToCompareLeft)
        functionsToCompareLeft.forEach(function (node) {
            logger.log('++', node.text)
        })
    }

    if (functionsToCompareLeft && functionsToCompareLeft.length <= 0) {
        functionsToCompareLeft = undefined
    }

    stop()
    return {
        functions,
        functionsTreeRoot,
        removedFunctions:functionsToCompareLeft
    }
}

export function getInnerMostFunctionNode (sourceNode, cursor) {
    let ast,
        foundNode
    try {
        ast = parser.parse(sourceNode.unformattedText)
    } /* eslint-disable */ catch ( error ) /* eslint-enable */ {
        logger.log(error)
        return
    }
    parser.estraverse.traverse(ast, {
        leave(node) {
            // code generated from FunctionExpression are not parseable again, skip for now
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                if (cursorIsInNode(cursor, node)) {
                    foundNode = node
                    this.break()
                }
            }
        }
    })
    return foundNode
}
