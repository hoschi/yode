export default {
    start(label) {
        console.time(label)
        return function () {
            console.timeEnd(label)
        }
    }
}
