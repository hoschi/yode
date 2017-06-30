import R from 'ramda'
import Profiler from '../Profiler'
import fileStorage from './fileStorage'
//import parser from '../ast/parser-recast';
import parser from '../ast/parser-recast-jsx';
import { getFunctionByText } from '../ast/functionHelper';
import { editorLayoutCols } from '../constants'

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

export const OPEN_FILE_EDITOR_BY_ID = 'OPEN_FILE_EDITOR_BY_ID'
export const openFileEditorById = ({id}) => {
    return {
        type: OPEN_FILE_EDITOR_BY_ID,
        id
    }
}

export const CLOSE_FILE_EDITOR = 'CLOSE_FILE_EDITOR '
export const closeFileEditor = ({id}) => {
    return {
        type: CLOSE_FILE_EDITOR,
        id
    }
}

export const EDITORS_LAYOUT_CHANGED = 'EDITORS_LAYOUT_CHANGED'
export const editorsLayoutChanged = ({layout}) => {
    return {
        type: EDITORS_LAYOUT_CHANGED,
        layout
    }
}

export const EDITOR_HEIGHT_CHANGED = 'EDITOR_HEIGHT_CHANGED'
export const editorHeightChanged = ({itemId, height}) => {
    return {
        type: EDITOR_HEIGHT_CHANGED,
        itemId,
        height
    }
}

export let selectNoEditorIsFocused = (state) => R.isNil(state.editor.focusedFunctionEditor) && R.isNil(state.editor.focusedFileEditor)
export let selectFocusedFunctionEditor = R.path(['editor', 'focusedFunctionEditor'])
export let selectFocusedFileEditor = R.path(['editor', 'focusedFileEditor'])
export let selectFileEditorIds = R.path(['editor', 'fileEditorIds'])
export let selectEditorsLayout = R.path(['editor', 'editorsLayout'])

let setProp = R.curry((prop, value, obj) => R.set(R.lensProp(prop), value, obj))

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

let defaultGridItemProps = {
    h: 1,
    w: editorLayoutCols / 2,
    x: 0,
    y: 0
}

function getInitialLayout (state) {
    let itemIds = state.fileEditorIds.concat(state.functionEditorIds);
    return itemIds.map((id, i) => ({
        i: id.toString(),
        ...defaultGridItemProps,
        x: i % 2 === 0 ? 0 : editorLayoutCols / 2,
        y: i % 2
    }))
}

let shiftGridItem = R.curry((matcher, item) => {
    if (matcher(item)) {
        return {
            ...item,
            // shift current one a little bit down to make space for new editor
            y: 5
        }
    } else {
        return item;
    }
})

let initialState = {
    focusedFunctionEditor: undefined,
    focusedFileEditor: undefined,
    functionEditorIds: [20, 17],
    fileEditorIds: ['Header.js', 'Header.spec.js'],
    cursor: undefined,
    fileStorage: fileStorage()
}
initialState.editorsLayout = getInitialLayout(initialState)

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
    [OPEN_FILE_EDITOR_BY_ID]: (state, action) => {
        const {id} = action;
        let newLayout = R.map(shiftGridItem(R.allPass([
            R.propEq('x', 0),
            R.propEq('y', 0)
        ])), state.editorsLayout)
        return {
            ...state,
            fileEditorIds: R.append(id, state.fileEditorIds),
            editorsLayout: R.append({
                ...defaultGridItemProps,
                i: id
            }, newLayout)
        }
    },
    [CLOSE_FILE_EDITOR]: (state, action) => {
        const {id} = action;
        return R.pipe(
            (state) => {
                if (state.focusedFileEditor === id) {
                    // closed editor was focused, reset
                    return setProp('focusedFileEditor', undefined, state)
                }
                return state
            },
            setProp('fileEditorIds', R.filter((openFileId) => openFileId !== id, state.fileEditorIds))
        )(state);
    },
    [SWAP_WITH_PARENT_FUNCTION]: (state, action) => {
        let parentLayoutItem,
            parentLayoutItemId,
            layoutWithoutParent
        const {id} = action;
        let {node} = getFileAndNodeForFunctionId(state, id);

        if (!node.parentFunction) {
            // has no parent. so, nothing to swap with
            return state;
        }

        if (node.parentFunction.isRoot) {
            // swap with file editor
            parentLayoutItemId = node.fileId;
            // append file editor
            state = setProp('fileEditorIds', R.uniq(R.append(node.fileId, state.fileEditorIds)), state)
        } else {
            // swap with parent function editor
            parentLayoutItemId = node.parentFunction.customId.toString()
            // append parent function editor
            state = setProp('functionEditorIds', R.uniq(R.append(node.parentFunction.customId, state.functionEditorIds)), state)
        }

        // remove parent, we insert it at another position later
        let parentPosition = R.findIndex(R.propEq('i', parentLayoutItemId), state.editorsLayout)
        if (parentPosition >= 0) {
            parentLayoutItem = state.editorsLayout[parentPosition]
            layoutWithoutParent = R.remove(parentPosition, 1, state.editorsLayout)
        } else {
            layoutWithoutParent = state.editorsLayout
        }
        // get current position from updated list
        let currentPosition = R.findIndex(R.propEq('i', id.toString()), layoutWithoutParent)
        let currentLayoutItem = layoutWithoutParent[currentPosition];
        // remove current editor
        let layoutWithoutCurrentEditor = R.filter(({i}) => i !== id, layoutWithoutParent)
        // create new item with merged properties
        let newLayoutItem = {
            ...currentLayoutItem,
            i: parentLayoutItemId
        }
        if (parentLayoutItem) {
            // copy height, because this is not calculated again when item is moved
            newLayoutItem = R.merge(newLayoutItem, R.pick([
                'h',
                'minH',
                'maxH'
            ], parentLayoutItem))
        }

        if (state.focusedFunctionEditor === id) {
            // closed editor was focused, reset
            state = setProp('focusedFunctionEditor', undefined, state)
        }

        // remove current function editor
        state = setProp('functionEditorIds', R.filter((openFnId) => openFnId !== id, state.functionEditorIds), state)

        // modify layout with to fix positioning
        state = setProp('editorsLayout', R.insert(currentPosition, newLayoutItem, layoutWithoutCurrentEditor), state)
        return state
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

            return R.pipe(
                (state) => {
                    let newLayout = R.map(shiftGridItem(R.allPass([
                        R.propEq('x', editorLayoutCols / 2),
                        R.propEq('y', 0)
                    ])), state.editorsLayout)
                    return {
                        ...state,
                        editorsLayout: R.append({
                            ...defaultGridItemProps,
                            x: editorLayoutCols / 2,
                            i: foundFunction.customId.toString()
                        }, newLayout)
                    }
                },
                setProp('functionEditorIds', R.uniq([foundFunction.customId].concat(state.functionEditorIds)))
            )(state)
        } else {
            // nothing found
            stop()
            return state;
        }
    },
    [EDITORS_LAYOUT_CHANGED]: (state, {layout}) => {
        return {
            ...state,
            editorsLayout: layout
        }
    },
    [EDITOR_HEIGHT_CHANGED]: (state, {itemId, height}) => {
        let layout = state.editorsLayout;
        let newLayout = layout.map((item) => {
            if (item.i !== itemId) {
                return item;
            }

            let itemHeight = height + 28;
            return {
                ...item,
                h: itemHeight,
                minH: itemHeight,
                maxH: itemHeight
            }
        })
        return {
            ...state,
            editorsLayout: newLayout
        }
    }
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
