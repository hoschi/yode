import stampit from '@stamp/it';
import R from 'ramda'
import File from './File'

function initInputFile (inputFile) {
    const {id, text} = inputFile;
    let file = File.create();
    file.init({
        id,
        unformattedText: text
    })
    return file;
}

let FileManager = stampit().deepProps({
    storage: undefined
}).methods({
    init(inputFiles = []) {
        let files = inputFiles.map(initInputFile)
        this.storage = R.zipObj(files.map(R.prop('id')), files)
    },
    addFile(inputFile) {
        let file = initInputFile(inputFile)
        this.storage[file.id] = file;
    }
})

export default FileManager
