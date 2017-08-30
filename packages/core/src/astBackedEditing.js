import profiler from './profiler'
import parser from 'ast/parser-recast-jsx';
import { getFunctionIndexByText } from 'ast/compareFunctions'

let id = 1

let {estraverse} = parser;
function parse (...args) {
    //let stop = profiler.start('parse', true);
    let r = parser.parse.apply(parser, args);
    //stop();
    return r;
}

export function printAst (...args) {
    //let stop = profiler.start('--- printAst', true);
    let r = parser.printAst.apply(parser, args);
    //stop();
    return r;
}

function addTextToNode (ast) {
    ast.text = printAst(ast)
}

function isEditorDirty (node) {
    return node.text !== node.unformattedText
}

let cursorIsInNode = (cursor, node) => cursor > node.start && cursor < node.end

export function parseCode (text) {
    let stop = profiler.start('-- code to ast')
    let ast
    try {
        ast = parse(text)
    } /* eslint-disable */ catch ( error ) /* eslint-enable */ {
        console.log(error)
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

    let parentFunc;
    let currentFunc = {
        children: [],
        isRoot: true
    };
    let functionsTreeRoot = currentFunc;

    let addNodeToParent = (node) => {
        parentFunc = currentFunc;
        if (parentFunc) {
            if (parentFunc.children) {
                parentFunc.children.push(node);
            } else {
                parentFunc.children = [node];
            }
        }
        currentFunc = node;
        node.parentFunction = parentFunc;
    }

    let leaveFunctionNode = () => {
        currentFunc = parentFunc;
        if (currentFunc) {
            parentFunc = currentFunc.parentFunction;
        } else {
            parentFunc = undefined;
        }
    }

    estraverse.traverse(ast, {
        enter(node) {
            // code generated from FunctionExpression are not parseable again, skip for now
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                addNodeToParent(node);
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
                        // restore dirty editor state if needed
                        if (isEditorDirty(foundFunction)) {
                            node.unformattedText = foundFunction.unformattedText
                            node.syntaxError = foundFunction.syntaxError
                        }
                        // remove function we found
                        functionsToCompareLeft.splice(foundFunctionIndex, 1)
                    } else {
                        node.customId = id++
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
        console.log('REMOVED FUNCTIONS', functionsToCompareLeft.length, functionsToCompareLeft)
        functionsToCompareLeft.forEach(function (node) {
            console.log('++', node.text)
        })
    }

    stop()
    return {
        functions,
        functionsTreeRoot
    }
}

export function getInnerMostFunctionNode (sourceNode, cursor) {
    let ast,
        foundNode
    try {
        ast = parser.parse(sourceNode.unformattedText)
    } /* eslint-disable */ catch ( error ) /* eslint-enable */ {
        console.log(error)
        return;
    }
    parser.estraverse.traverse(ast, {
        leave(node) {
            // code generated from FunctionExpression are not parseable again, skip for now
            if (node.type === 'FunctionDeclaration' || node.type === 'ArrowFunctionExpression') {
                if (cursorIsInNode(cursor, node)) {
                    foundNode = node;
                    this.break()
                }
            }
        }
    })
    return foundNode;
}
