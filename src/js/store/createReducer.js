export default function createReducer (initialState, actionObject) {
    return function (state = initialState, action) {
        let actionFunction = actionObject[action.type]
        if (actionFunction) {
            return actionFunction(state, action)
        } else {
            return state
        }
    }
}
