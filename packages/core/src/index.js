// FIXME do something useful here
export let otherTest = (base) => {
    console.log({
        ...base,
        foo: 'bar'
    })
}

export default (arg) => {
    console.log('changed text', arg)
}
