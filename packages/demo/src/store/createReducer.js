export default function createReducer (initialState, actionObject) {
    return function (state = initialState, action) {
        let actionFunction
        if (action && action.type) {
            actionFunction = actionObject[action.type]
        }
        if (actionFunction) {
            return actionFunction(state, action)
        } else {
            return state
        }
    }
}
