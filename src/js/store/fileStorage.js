import createReducer from './createReducer'

const initialState = [{
    content: 'if (test) {return "foo"}\nconst foo = "bar"'
}]

let fileStorage = {}

export default createReducer(initialState, fileStorage)
