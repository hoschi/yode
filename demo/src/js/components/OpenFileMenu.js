import React from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

const OpenFileMenu = React.createClass({
    anchorEl: undefined,
    render() {
        const {isMenuOpen, setMenuIsOpen, filesWithOpenState, openEditorById} = this.props;

        let openButtonProps = {
            label: 'open file editor',
            style: buttonStyle,
            onTouchTap: (event) => {
                this.anchorEl = event.currentTarget
                setMenuIsOpen(true)
            }
        }

        let menuItems = filesWithOpenState.map(({isOpen, file}) => {
            let onTouchTap = () => openEditorById({
                id: file.id
            })
            let props = {
                key: file.id,
                disabled: isOpen,
                primaryText: file.path,
                onTouchTap
            }
            return <MenuItem {...props} />
        })

        let popoverProps = {
            open: isMenuOpen,
            anchorEl: this.anchorEl,
            anchorOrigin: {
                horizontal: 'left',
                vertical: 'bottom'
            },
            targetOrigin: {
                horizontal: 'left',
                vertical: 'top'
            },
            onRequestClose: () => setMenuIsOpen(false)
        }

        let popover = <Popover {...popoverProps}>
                          <Menu desktop={ true }>
                              { menuItems }
                          </Menu>
                      </Popover>
        return <span><RaisedButton {...openButtonProps}/>{ popover }</span>
    }
})

export default OpenFileMenu

let buttonStyle = {
    marginRight: 10
}
