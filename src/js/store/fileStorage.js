import createReducer from './createReducer'

const initialState = [{
    content: 'my code goes here'
}]

let fileStorage = {}

export default createReducer(initialState, fileStorage)
