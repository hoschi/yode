import R from 'ramda'
import Profiler from '../Profiler'
import fileStorage from './fileStorage'
import parser from '../ast/parser-recast';
import { getFunctionByText } from '../ast/functionHelper';

export const CURSOR_POSITION_IN_FILE_EDITOR_CHANGED = 'CURSOR_POSITION_IN_FILE_EDITOR_CHANGED '
export const cursorPositionInFileEditorChanged = ({cursor, fileId}) => {
    return {
        type: CURSOR_POSITION_IN_FILE_EDITOR_CHANGED,
        cursor,
        fileId
    }
}

export const CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED = 'CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED '
export const cursorPositionInFunctionEditorChanged = ({cursor, node}) => {
    return {
        type: CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED,
        cursor,
        node
    }
}

export const CLOSE_FUNCTION_EDITOR = 'CLOSE_FUNCTION_EDITOR '
export const closeFunctionEditor = ({id}) => {
    return {
        type: CLOSE_FUNCTION_EDITOR,
        id
    }
}

export const SWAP_WITH_PARENT_FUNCTION = 'SWAP_WITH_PARENT_FUNCTION '
export const swapWithParentFunction = ({id}) => {
    return {
        type: SWAP_WITH_PARENT_FUNCTION,
        id
    }
}

export const OPEN_FUNCTION_EDITOR_UNDER_CURSOR = 'OPEN_FUNCTION_EDITOR_UNDER_CURSOR '
export const openFunctionEditorUnderCursor = () => {
    return {
        type: OPEN_FUNCTION_EDITOR_UNDER_CURSOR
    }
}

let setProp = R.curry((prop, value, obj) => R.set(R.lensProp(prop), value, obj));

function getFileAndNodeForFunctionId (state, id) {
    for (let i = 0; i < state.fileStorage.length; i++) {
        let file = state.fileStorage[i];
        for (let j = 0; j < file.functions.length; j++) {
            let func = file.functions[j];
            if (func.customId === id) {
                return {
                    file,
                    node: func
                }
            }
        }
    }
}

function getFileAndNodeForFocusedEditor (state) {
    if (state.focusedFunctionEditor !== undefined) {
        return getFileAndNodeForFunctionId(state, state.focusedFunctionEditor)
    } else if (state.focusedFileEditor !== undefined) {
        for (let i = 0; i < state.fileStorage.length; i++) {
            let file = state.fileStorage[i];
            if (file.id === state.focusedFileEditor) {
                return {
                    file,
                    node: file.ast
                }
            }
        }
    }

    return {
        file: undefined,
        node: undefined
    }
}

function getInnerMostFunctionNode (editorFunction, cursor) {
    let ast,
        foundNode
    try {
        ast = parser.parse(editorFunction.unformattedText)
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

let cursorIsInNode = (cursor, node) => cursor > node.start && cursor < node.end

let actionObject = {
    [CURSOR_POSITION_IN_FILE_EDITOR_CHANGED]: (state, action) => {
        const {cursor, fileId} = action
        return R.pipe(
            setProp('focusedFunctionEditor', undefined),
            setProp('focusedFileEditor', fileId),
            setProp('cursor', cursor)
        )(state)
    },
    [CURSOR_POSITION_IN_FUNCTION_EDITOR_CHANGED]: (state, action) => {
        const {node, cursor} = action
        return R.pipe(
            setProp('focusedFunctionEditor', node.customId),
            setProp('focusedFileEditor', undefined),
            setProp('cursor', cursor)
        )(state)
    },
    [CLOSE_FUNCTION_EDITOR]: (state, action) => {
        const {id} = action;
        return R.pipe(
            (state) => {
                if (state.focusedFunctionEditor === id) {
                    // closed editor was focused, reset
                    return setProp('focusedFunctionEditor', undefined, state)
                }
                return state
            },
            setProp('functionEditorIds', R.filter((openFnId) => openFnId !== id, state.functionEditorIds))
        )(state);

    },
    [SWAP_WITH_PARENT_FUNCTION]: (state, action) => {
        const {id} = action;
        let {node} = getFileAndNodeForFunctionId(state, id);
        if (!node.parentFunction || node.parentFunction.isRoot) {
            // has no parent, or parent is the root. so, nothing to swap with
            return state;
        }
        // remove parent, we insert it at another position later
        let editorIdsWithoutParent = R.filter((openFnId) => openFnId !== node.parentFunction.customId, state.functionEditorIds)
        // get current position from updated list
        let currentPosition = editorIdsWithoutParent.indexOf(id)
        // remove current editor
        let editorIdsWithoutCurrentEditor = R.filter((openFnId) => openFnId !== id, editorIdsWithoutParent)
        return R.pipe(
            (state) => {
                if (state.focusedFunctionEditor === id) {
                    // closed editor was focused, reset
                    return setProp('focusedFunctionEditor', undefined, state)
                }
                return state
            },
            // add parent editor at position of child editor
            setProp('functionEditorIds', R.insert(currentPosition, node.parentFunction.customId, editorIdsWithoutCurrentEditor))
        )(state);

    },
    [OPEN_FUNCTION_EDITOR_UNDER_CURSOR]: (state) => {
        let stop = Profiler.start('- open function editor for function under cursor')
        let {file, node} = getFileAndNodeForFocusedEditor(state);
        if (!file || !node) {
            // can't find file or node for (perhaps not) focused editor
            stop()
            return state
        }
        let innerFunctionNode = getInnerMostFunctionNode(node, state.cursor)
        if (!innerFunctionNode) {
            // can't find inner most function node, perhaps because code is not parsable
            stop()
            return state;
        }
        let innerFunctionText = parser.print(innerFunctionNode);
        let foundFunction = getFunctionByText(innerFunctionText, file.functions);
        if (foundFunction.customId === node.customId) {
            // inner most function is the same function as the editor already focused, nothing to do
            stop()
            return state;
        } else if (foundFunction !== undefined) {
            // open editor
            stop()
            return setProp('functionEditorIds', R.uniq([foundFunction.customId].concat(state.functionEditorIds)), state);
        } else {
            // nothing found
            stop()
            return state;
        }
    }
}

let initialState = {
    focusedFunctionEditor: undefined,
    focusedFileEditor: undefined,
    functionEditorIds: [2],
    cursor: undefined,
    fileStorage: fileStorage()
}

let reducer = (state = initialState, action) => {
    let actionFunction = actionObject[action.type]
    if (actionFunction) {
        return actionFunction(state, action)
    } else {
        return {
            ...state,
            fileStorage: fileStorage(state.fileStorage, action)
        }
    }
}

export default reducer;
