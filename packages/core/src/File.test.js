let mockedId = 0
jest.mock('./customIdGenerator', () => {
    return {
        getNextId: () => ++mockedId
    }
})

import * as R from 'ramda'
import * as snip from './testCodeSnippets'
import File from './File'

beforeEach(() => {
    mockedId = 0
})

test('init - with valid text', function () {
    let unformattedText = snip.jsxComponentAndTest
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    expect(s.id).toBe('myFile0')
    expect(s.text).toBe(unformattedText)
    expect(s.unformattedText).toBe(unformattedText)
    expect(s.functions).toHaveLength(4)
    expect(R.keys(s.functionsMap)).toEqual(['1', '2', '3', '4'])
    expect(s.functionsTreeRoot.isRoot).toBe(true)
    expect(s.functionsTreeRoot.children).toHaveLength(2)
    expect(s.syntaxError).toBeUndefined()
    expect(s.hasConnectedError).toBeUndefined()
})

test('init - with "unformatted" code', function () {
    let unformattedText = snip.recastFormat
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    expect(s.functions).toHaveLength(1)
    expect(s.functions[0].text).toBe(snip.recastFormat_formatted)
})

test('init - with syntax error', function () {
    let unformattedText = snip.jsxComponentAndTest_withError
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    expect(s.hasConnectedError).toBe(true)
    expect(s.syntaxError.toString()).toBe('SyntaxError: Unterminated string constant (9:15)')

    expect(s.id).toBe('myFile0')
    expect(s.text).toBe(unformattedText)
    expect(s.unformattedText).toBe(unformattedText)
    expect(s.functions).toHaveLength(0)
    expect(R.keys(s.functionsMap)).toHaveLength(0)
    expect(s.functionsTreeRoot.isRoot).toBe(true)
    expect(s.functionsTreeRoot.children).toHaveLength(0)
})

test('updateFunctionAst - nested function', function () {
    let unformattedText = snip.jsxComponentAndTest
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    let oldFunction = s.functions[3]
    expect(oldFunction.text).toBe(`
function getTestName(a, b) {
    return a + b + name;
}
        `.trim())

    let newText = `
function getTestName(a, b) {
    return a + b + name+'mytest';
}
        `.trim()
    let result = s.updateFunctionAst(newText, oldFunction)
    expect(result.node.customId).toBe(oldFunction.customId)
    expect(result.node.text).toBe(newText)
    expect(result.node.unformattedText).toBe(newText)
    expect(result.node.syntaxError).toBeUndefined()
    expect(result.removedFunctions).toBeUndefined()
    expect(result.nodesToUpdate).toHaveLength(2)
    expect(result).toMatchSnapshot()
    expect(s.text).toBe(snip.jsxComponentAndTest_changedInnerMostFunction)

    newText = `
function getTestName(a, b) {
    return a + b + name + 'mytest' + 'another;
}
        `.trim()
    oldFunction = s.functions[3]
    result = s.updateFunctionAst(newText, oldFunction)
    // error is saved in node
    expect(result.node.syntaxError.toString()).toBe('SyntaxError: Unterminated string constant (2:37)')
    // AST text is still the old one
    expect(result.node.text).toBe(oldFunction.text)
    // unformatted text is that from editor
    expect(result.node.unformattedText).toBe(newText)
    // only update changed function to show error, AST not updated so connected functions not updated
    expect(result.nodesToUpdate).toHaveLength(1)
    // not files has error, node has error
    expect(s.syntaxError).toBeUndefined()
    // file is in connected error state though
    expect(s.hasConnectedError).toBe(true)

    expect(result.node.customId).toBe(oldFunction.customId)
    expect(result.node.unformattedText).toBe(newText)
    expect(result.removedFunctions).toBeUndefined()
    expect(result).toMatchSnapshot()

    // fixing the syntax error brings us to the state before the error
    newText = `
function getTestName(a, b) {
    return a + b + name + 'mytest' + 'another';
}
        `.trim()
    oldFunction = s.functions[3]
    result = s.updateFunctionAst(newText, oldFunction)
    expect(result.node.customId).toBe(oldFunction.customId)
    expect(result.node.text).toBe(newText)
    expect(result.node.unformattedText).toBe(newText)
    expect(result.node.syntaxError).toBeUndefined()
    expect(result.removedFunctions).toBeUndefined()
    expect(result.nodesToUpdate).toHaveLength(2)
    expect(s.hasConnectedError).toBe(false)
    expect(result).toMatchSnapshot()
})

test('updateFunctionAst - function with children', function () {
    let unformattedText = snip.jsxComponentAndTest
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    let oldFunction = s.functions[1]
    expect(oldFunction.text).toBe(`
() => {
    let name = 'Walter';

    it('displays name', () => {
        function getTestName(a, b) {
            return a + b + name;
        }

        let myName = getTestName('I', 'Am', name);
        expect(<HelloComponent name={myName} />).contain('Hello IAmWalter!')
    })

    // function not recognized because not of a supported type
    it("doesn't work without name", function () {
        let myName = undefined;
        expect(<HelloComponent name={myName} />).contain('Hello !')
    });
}
`.trim())

    let newText = `
() => {
    let name = 'Walterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr'

    it('displays name', () => {
        function getTestName(a, b) {
            return a + b + name;
        }

        let myName = getTestName('I', 'Am', name);
        expect(<HelloComponent name={myName} />).contain('Hello IAmWalter!')
    })

    // function not recognized because not of a supported type
    it("doesn't work without name", function () {
        let myName = undefined;
        expect(<HelloComponent name={myName} />).contain('Hello !')
    });
}
`.trim()
    let result = s.updateFunctionAst(newText, oldFunction)
    expect(result.node.customId).toBe(oldFunction.customId)
    expect(result.node.text).toBe(newText)
    expect(result.node.unformattedText).toBe(newText)
    expect(result.node.syntaxError).toBeUndefined()
    expect(result.removedFunctions).toBeUndefined()
    expect(result.nodesToUpdate).toHaveLength(2)
    expect(result).toMatchSnapshot()
    expect(s.text).toBe(snip.jsxComponentAndTest_changedOuterFunction)

    newText = `
() => {
    let name = 'Walterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr' + 'foo

    it('displays name', () => {
        function getTestName(a, b) {
            return a + b + name;
        }

        let myName = getTestName('I', 'Am', name);
        expect(<HelloComponent name={myName} />).contain('Hello IAmWalter!')
    })

    // function not recognized because not of a supported type
    it("doesn't work without name", function () {
        let myName = undefined;
        expect(<HelloComponent name={myName} />).contain('Hello !')
    });
}
`.trim()
    oldFunction = s.functions[1]
    result = s.updateFunctionAst(newText, oldFunction)
    // error is saved in node
    expect(result.node.syntaxError.toString()).toBe('SyntaxError: Unterminated string constant (2:68)')
    // AST text is still the old one
    expect(result.node.text).toBe(oldFunction.text)
    // unformatted text is that from editor
    expect(result.node.unformattedText).toBe(newText)
    // only update changed function to show error, AST not updated so connected functions not updated
    expect(result.nodesToUpdate).toHaveLength(1)
    // not files has error, node has error
    expect(s.syntaxError).toBeUndefined()
    // file is in connected error state though
    expect(s.hasConnectedError).toBe(true)

    expect(result.node.customId).toBe(oldFunction.customId)
    expect(result.node.unformattedText).toBe(newText)
    expect(result.removedFunctions).toBeUndefined()
    expect(result).toMatchSnapshot()

    // fixing the syntax error brings us to the state before the error
    newText = `
() => {
    let name = 'Walterrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr' + 'foo';

    it('displays name', () => {
        function getTestName(a, b) {
            return a + b + name;
        }

        let myName = getTestName('I', 'Am', name);
        expect(<HelloComponent name={myName} />).contain('Hello IAmWalter!')
    })

    // function not recognized because not of a supported type
    it("doesn't work without name", function () {
        let myName = undefined;
        expect(<HelloComponent name={myName} />).contain('Hello !')
    });
}
`.trim()
    oldFunction = s.functions[1]
    result = s.updateFunctionAst(newText, oldFunction)
    expect(result.node.customId).toBe(oldFunction.customId)
    expect(result.node.text).toBe(newText)
    expect(result.node.unformattedText).toBe(newText)
    expect(result.node.syntaxError).toBeUndefined()
    expect(result.removedFunctions).toBeUndefined()
    expect(result.nodesToUpdate).toHaveLength(2)
    expect(s.hasConnectedError).toBe(false)
    expect(result).toMatchSnapshot()
})

test('updateFileAst - edit file outside function', function () {
    let unformattedText = snip.nestedFunctions
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    let newText = `
let myVar = 'some string EDITED HERE'
function myFunc (a) {
    function innerFunc () {
        return 'hello'
    }
    return a + innerFunc()
}
        `.trim()
    let result = s.updateFileAst(newText)
    expect(result.removedFunctions).toBeUndefined()
    expect(s).toMatchSnapshot()
})

test('updateFileAst - edit with syntax error', function () {
    let unformattedText = snip.nestedFunctions
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    let newText = `
let myVar = 'some string NO CLOSING QUOTE
function myFunc (a) {
    function innerFunc () {
        return 'hello'
    }
    return a + innerFunc()
}
        `.trim()
    let result = s.updateFileAst(newText)
    expect(result).toBeUndefined()
    expect(s.hasConnectedError).toBe(true)
    expect(s.syntaxError.toString()).toBe('SyntaxError: Unterminated string constant (1:12)')

    expect(s).toMatchSnapshot()
})

test('updateFileAst - edit outer function in file', function () {
    let unformattedText = snip.nestedFunctions
    let s = File.create()
    s.init({
        id: 'myFile0',
        unformattedText
    })

    let newText = `
let myVar = 'some string'
function myFunc (a) {
    function innerFunc () {
        return 'hello'
    }
    return a + innerFunc() + 'foooooooooo'
}
        `.trim()
    let result = s.updateFileAst(newText)
    expect(result.removedFunctions).toBeUndefined()
    expect(s.functionsMap["1"].text).toEqual(`
function myFunc(a) {
    function innerFunc () {
        return 'hello'
    }
    return a + innerFunc() + 'foooooooooo'
}
    `.trim())
    expect(s).toMatchSnapshot()
})
