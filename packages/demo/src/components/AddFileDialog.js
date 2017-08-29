import React from 'react'
import R from 'ramda'
import RaisedButton from 'material-ui/RaisedButton'
import FlatButton from 'material-ui/FlatButton'
import Dialog from 'material-ui/Dialog'
import TextField from 'material-ui/TextField'

let fieldRequieredMessage = 'this field is required'

const AddFileDialog = ({isOpen, setDialogIsOpen, content, fileName, onContentChange, onFileNameChange, reset, allFiles, addFile}) => {
    let fileNameErrorMessage,
        contentErrorMessage

    let closeAndReset = () => {
        setDialogIsOpen(false)
        reset()
    }

    let addClick = () => {
        addFile(fileName, content)
        closeAndReset()
    }

    if (!content) {
        contentErrorMessage = fieldRequieredMessage
    }

    if (!fileName) {
        fileNameErrorMessage = fieldRequieredMessage
    } else if (allFiles.map(R.prop('path')).some(R.equals(fileName))) {
        fileNameErrorMessage = `file with name '${fileName}' already exists`
    }
    let isAddButtonDisabled = !!(fileNameErrorMessage || contentErrorMessage)

    let openDialogButtonProps = {
        label: 'add file',
        style: buttonStyle,
        onTouchTap: () => setDialogIsOpen(true)
    }
    let actions = [
        <FlatButton label='cancel' onTouchTap={ closeAndReset } />,
        <FlatButton label='add' primary={ true } disabled={ isAddButtonDisabled } onTouchTap={ addClick } />
    ]
    let dialog = <Dialog title='Add File' actions={ actions } modal={ true } open={ isOpen }>
                     <TextField floatingLabelText='file name' value={ fileName } onChange={ (ev, newValue) => onFileNameChange(newValue) } errorText={ fileNameErrorMessage } />
                     <TextField floatingLabelText='content' rows={ 4 } rowsMax={ 15 } multiLine={ true } fullWidth={ true } value={ content }
                         onChange={ (ev, newValue) => onContentChange(newValue) } errorText={ contentErrorMessage } />
                 </Dialog>
    return <span><RaisedButton {...openDialogButtonProps}/>{ dialog }</span>
}

export default AddFileDialog

let buttonStyle = {
    marginRight: 10
}
