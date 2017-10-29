export const OPEN_FUNCTION_EDITOR_UNDER_CURSOR = 'OPEN_FUNCTION_EDITOR_UNDER_CURSOR '
export const openFunctionEditorUnderCursor = () => {
    return {
        type: OPEN_FUNCTION_EDITOR_UNDER_CURSOR
    }
}

export const SWAP_WITH_PARENT_FUNCTION = 'SWAP_WITH_PARENT_FUNCTION '
export const swapWithParentFunction = ({id}) => {
    return {
        type: SWAP_WITH_PARENT_FUNCTION,
        id
    }
}
