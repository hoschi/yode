let mockedId = 0
jest.mock('./customIdGenerator', () => {
    return {
        getNextId:() => ++mockedId
    }
})

import parser from 'ast/parser-recast-jsx'
import * as R from 'ramda'
import * as snip from './testCodeSnippets'
import * as s from './astBackedEditing'

beforeEach(() => {
    mockedId = 0
})

test('getFunctionsFromAst - without functions', function () {
    let ast = parser.parse(snip.letOnly)
    let result = s.getFunctionsFromAst(ast, 'myFile.js')

    expect(result.removedFunctions).toBeUndefined()
    expect(result.functions).toHaveLength(0)
    expect(result.functionsTreeRoot.children).toHaveLength(0)
    expect(result.functionsTreeRoot.isRoot).toBe(true)
})

test('getFunctionsFromAst - doesn\'t collect object functions', () => {
    let ast = parser.parse(snip.jsxClassesAndObjects)
    let result = s.getFunctionsFromAst(ast, 'myFile.js')

    expect(result.removedFunctions).toBeUndefined()
    expect(result.functions).toHaveLength(1)
    expect(result.functionsTreeRoot.children).toHaveLength(1)
    expect(result.functionsTreeRoot.isRoot).toBe(true)

    expect(result).toMatchSnapshot()
})

test('getFunctionsFromAst - collects functions flat and tree', () => {
    let ast = parser.parse(snip.jsxComponentAndTest)
    let result = s.getFunctionsFromAst(ast, 'myFile.js')

    expect(result.removedFunctions).toBeUndefined()
    expect(result.functions).toHaveLength(4)
    expect(result.functionsTreeRoot.children).toHaveLength(2)
    expect(result.functionsTreeRoot.isRoot).toBe(true)

    expect(result).toMatchSnapshot()
})

test('getFunctionsFromAst - removed one function on file level', () => {
    let ast, result
    ast = parser.parse(snip.nestedFunctions)
    result = s.getFunctionsFromAst(ast, 'myFile.js')
    expect(result.removedFunctions).toBeUndefined()
    expect(result.functions).toHaveLength(2)
    let oldFunctions = result.functions
    expect(result.functionsTreeRoot.children).toHaveLength(1)
    expect(result.functionsTreeRoot.isRoot).toBe(true)
    expect(result).toMatchSnapshot()

    ast = parser.parse(snip.nestedFunctions_removedOneFunc)
    result = s.getFunctionsFromAst(ast, 'myFile.js', oldFunctions)
    expect(result.removedFunctions).toHaveLength(1)
    expect(result.functions).toHaveLength(1)
    expect(result.functionsTreeRoot.children).toHaveLength(1)
    expect(result.functionsTreeRoot.isRoot).toBe(true)
    expect(result).toMatchSnapshot()
})

test('getFunctionsFromAst - remove more/nested functions on file level', () => {
    let ast, result

    ast = parser.parse(snip.jsxComponentAndTest)
    result = s.getFunctionsFromAst(ast, 'myFile.js')
    expect(result.removedFunctions).toBeUndefined()
    expect(result.functions).toHaveLength(4)
    let oldFunctions = result.functions
    expect(result.functionsTreeRoot.children).toHaveLength(2)
    expect(result.functionsTreeRoot.isRoot).toBe(true)
    expect(result).toMatchSnapshot()

    ast = parser.parse(snip.jsxComponentAndTest_removedFuncs)
    result = s.getFunctionsFromAst(ast, 'myFile.js', oldFunctions)
    expect(result.removedFunctions).toHaveLength(3)
    expect(result.functions).toHaveLength(1)
    expect(result.functionsTreeRoot.children).toHaveLength(1)
    expect(result.functionsTreeRoot.isRoot).toBe(true)
    expect(result).toMatchSnapshot()
})

test('getFunctionsFromAst - rerun keeps ids', () => {
    let simplifyNodes = R.map(R.pick(['customId', 'text']))
    let ast = parser.parse(snip.jsxComponentAndTest)
    let firstRun = s.getFunctionsFromAst(ast, 'myFile.js')

    expect(firstRun.removedFunctions).toBeUndefined()
    expect(firstRun.functions).toHaveLength(4)
    expect(firstRun.functionsTreeRoot.children).toHaveLength(2)
    expect(firstRun.functionsTreeRoot.isRoot).toBe(true)
    let firstRunFunctionsSimple = simplifyNodes(firstRun.functions)

    let additionalRun
    additionalRun = s.getFunctionsFromAst(ast, 'myFile.js', firstRun.functions)

    expect(additionalRun.removedFunctions).toBeUndefined()
    expect(additionalRun.functions).toHaveLength(4)
    expect(additionalRun.functionsTreeRoot.children).toHaveLength(2)
    expect(additionalRun.functionsTreeRoot.isRoot).toBe(true)
    expect(simplifyNodes(additionalRun.functions)).toEqual(firstRunFunctionsSimple)

    // no error when not all functions in ast are there to compare
    additionalRun = s.getFunctionsFromAst(ast, 'myFile.js', [firstRun.functions[0]])

    expect(additionalRun.removedFunctions).toBeUndefined()
    expect(additionalRun.functions).toHaveLength(4)
    expect(additionalRun.functionsTreeRoot.children).toHaveLength(2)
    expect(additionalRun.functionsTreeRoot.isRoot).toBe(true)
    expect(simplifyNodes(additionalRun.functions)).toEqual(firstRunFunctionsSimple)

    // even works without functions to compare, but can't track removed functions
    additionalRun = s.getFunctionsFromAst(ast, 'myFile.js')

    expect(additionalRun.removedFunctions).toBeUndefined()
    expect(additionalRun.functions).toHaveLength(4)
    expect(additionalRun.functionsTreeRoot.children).toHaveLength(2)
    expect(additionalRun.functionsTreeRoot.isRoot).toBe(true)
    expect(simplifyNodes(additionalRun.functions)).toEqual(firstRunFunctionsSimple)
})

