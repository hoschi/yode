import { connect } from 'react-redux'
import AddFileDialog from './AddFileDialog'
import { setIsOpenOfAddDialog, setContentOfAddDialog, setFileNameOfAddDialog, resetAddDialog, selectIsOpenAddFileDialog, selectContentOfAddDialog, selectFileNameOfAddDialog } from 'store/fileManagement'
import { selectAllFiles, addFileToStorage } from 'store/fileStorage'

let mapStateToProps = (state) => {
    return {
        isOpen: selectIsOpenAddFileDialog(state),
        content: selectContentOfAddDialog(state),
        fileName: selectFileNameOfAddDialog(state),
        allFiles: selectAllFiles(state)
    }
}

let mapDispatchToProps = {
    setDialogIsOpen: setIsOpenOfAddDialog,
    onContentChange: setContentOfAddDialog,
    onFileNameChange: setFileNameOfAddDialog,
    reset: resetAddDialog,
    addFile: addFileToStorage
};

export default connect(mapStateToProps, mapDispatchToProps)(AddFileDialog);
