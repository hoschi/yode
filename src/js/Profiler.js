export default {
    start(label, hideStartLabel) {
        if (!hideStartLabel) {
            console.debug(label + ': start profile')
        }
        console.time(label)
        return function () {
            console.timeEnd(label)
        }
    }
}
