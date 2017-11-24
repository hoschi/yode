import parser from 'ast/parser-recast-jsx'
import * as snip from './testCodeSnippets'
import * as s from './astBackedEditing'

test('printAst', () => {
    let text = snip.nestedFunctions
    let ast = parser.parse(text)
    expect(s.printAst(ast)).toBe(text)
})

test('getMetaData', () => {
    expect(s.getMetaData({
        customId: '5',
        foo: 'bar'
    })).toEqual({
        title: 'node-5'
    })

    expect(s.getMetaData({
        customId: '5',
        hasConnectedError: true,
        syntaxError: {
            message: 'uh oh'
        }
    })).toEqual({
        title: 'node-5',
        hasConnectedError: true,
        syntaxError: {
            message: 'uh oh'
        }
    })
})

test('addTextToNode', () => {
    let text = snip.nestedFunctions
    let ast = parser.parse(text)
    expect(ast.text).toBeUndefined()
    s.addTextToNode(ast)
    expect(ast.text).toBe(text)
})

test('getNodeForFirstFoundType', () => {
    let ast = parser.parse(snip.nestedFunctions)
    // this is not a valid type
    expect(s.getNodeForFirstFoundType('NotExistingFooType', ast)).toBeUndefined()
    // no class in this snip
    expect(s.getNodeForFirstFoundType('ClassBody', ast)).toBeUndefined()
    // finds first function node
    expect(s.getNodeForFirstFoundType('FunctionDeclaration', ast)).toMatchObject({
        type:'FunctionDeclaration',
        id:{
            type:'Identifier',
            name:'myFunc'
        }
    })
})
