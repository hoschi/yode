export let letOnly = `
let only = 'simple'
`.trim()

export let nestedFunctions = `
let myVar = 'some string'
function myFunc (a) {
    function innerFunc () {
        return 'hello'
    }
    return a + innerFunc()
}
`.trim()

export let nestedFunctions_removedOneFunc = `
let myVar = 'some string'
function myFunc (a) {
    return a
}
`.trim()

export let jsxComponentAndTest = `
import React from 'react'

let HelloComponent = ({name}) => {
    return <span>Hello&nbsp;{name}!</span>;
}

describe('HelloComponent', () => {
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
})
`.trim()

export let jsxComponentAndTest_removedFuncs = `
import React from 'react'

let HelloComponent = ({name}) => {
    return <span>Hello&nbsp;{name}!</span>;
}
`.trim()

export let jsxClassesAndObjects = `
import React from 'react'

let getText = (name) => 'Hello ' + name;

class Welcome extends React.Component {
  // ClassMethod, not supported
  render() {
    let text = getText(this.props.name)
    return <h1>{text}</h1>;
  }
}

let MyObject = {
  name:'test',
  // ObjectMethod, not supported
  render() {
    let text = getText(this.name)
    return <span>{text}</span>;
  }
}
`.trim()
