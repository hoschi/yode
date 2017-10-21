export default [
    {
        path: 'actions.js',
        text: `// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/actions/index.js
import * as types from '../constants/ActionTypes'

export const addTodo = (text) => ({
  type: types.ADD_TODO,
  text
})
export const deleteTodo = id => ({
  type: types.DELETE_TODO,
  id
})
export const editTodo = (id, text) => ({
  type: types.EDIT_TODO,
  id,
  text
})
export const completeTodo = id => ({
  type: types.COMPLETE_TODO,
  id
})
export const completeAll = () => ({
  type: types.COMPLETE_ALL
})
export const clearCompleted = () => ({
  type: types.CLEAR_COMPLETED
})
`
    },

    {
        path: 'actions.spec.js',
        text: `// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/actions/index.spec.js
import * as types from '../constants/ActionTypes'
import * as actions from './index'

describe('todo actions', () => {
  it('addTodo should create ADD_TODO action', () => {
    expect(actions.addTodo('Use Redux')).toEqual({
      type: types.ADD_TODO,
      text: 'Use Redux'
    })
  })

  it('deleteTodo should create DELETE_TODO action', () => {
    expect(actions.deleteTodo(1)).toEqual({
      type: types.DELETE_TODO,
      id: 1
    })
  })

  it('editTodo should create EDIT_TODO action', () => {
    expect(actions.editTodo(1, 'Use Redux everywhere')).toEqual({
      type: types.EDIT_TODO,
      id: 1,
      text: 'Use Redux everywhere'
    })
  })

  it('completeTodo should create COMPLETE_TODO action', () => {
    expect(actions.completeTodo(1)).toEqual({
      type: types.COMPLETE_TODO,
      id: 1
    })
  })

  it('completeAll should create COMPLETE_ALL action', () => {
    expect(actions.completeAll()).toEqual({
      type: types.COMPLETE_ALL
    })
  })

  it('clearCompleted should create CLEAR_COMPLETED action', () => {
    expect(actions.clearCompleted()).toEqual({
      type: types.CLEAR_COMPLETED
    })
  })
})
`
    },

    {
        path: 'Header.js',
        text: `// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/components/Header.js
// modified to use arrow functions instead of class syntax
import React, { PropTypes, Component } from 'react'
import TodoTextInput from './TodoTextInput'

export default ({addTodo}) => {
  let handleSave = (text) => {
    if (text.length !== 0) {
      addTodo(text)
    }
  }

  return (
    <header className="header">
      <h1>todos</h1>
      <TodoTextInput newTodo
                     onSave={handleSave}
                     placeholder="What needs to be done?" />
    </header>
  )
};
`
    },

    {
        path: 'Header.spec.js',
        text: `// copied from https://github.com/reactjs/redux/blob/d5d1572cba55942d571b4b52cd12e5045142b9ff/examples/todomvc/src/components/Header.spec.js
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Header from './Header'
import TodoTextInput from './TodoTextInput'

const setup = () => {
  const props = {
    addTodo: jest.fn()
  }

  const renderer = TestUtils.createRenderer()
  renderer.render(<Header {...props} />)
  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output,
    renderer: renderer
  }
}

describe('components', () => {
  describe('Header', () => {
    it('should render correctly', () => {
      const { output } = setup()

      expect(output.type).toBe('header')
      expect(output.props.className).toBe('header')

      const [ h1, input ] = output.props.children

      expect(h1.type).toBe('h1')
      expect(h1.props.children).toBe('todos')

      expect(input.type).toBe(TodoTextInput)
      expect(input.props.newTodo).toBe(true)
      expect(input.props.placeholder).toBe('What needs to be done?')
    })

    it('should call addTodo if length of text is greater than 0', () => {
      const { output, props } = setup()
      const input = output.props.children[1]
      input.props.onSave('')
      expect(props.addTodo).not.toBeCalled()
      input.props.onSave('Use Redux')
      expect(props.addTodo).toBeCalled()
    })
  })
})
`
    }

]
