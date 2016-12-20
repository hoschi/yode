import { connect } from 'react-redux'
import OpenFileMenu from './OpenFileMenu'
import { setIsOpenFileMenuOpen, selectIsOpenFileMenuOpen } from 'store/fileManagement'
import { selectFilesWithOpenState } from 'store/fileStorage'
import { openFileEditorById } from 'store/editorReducer'

let mapStateToProps = (state) => {
    return {
        isMenuOpen: selectIsOpenFileMenuOpen(state),
        filesWithOpenState: selectFilesWithOpenState(state)
    }
}

let mapDispatchToProps = {
    setMenuIsOpen: setIsOpenFileMenuOpen,
    openFileEditorById
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenFileMenu);
