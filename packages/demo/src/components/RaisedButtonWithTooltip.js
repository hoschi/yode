import React from 'react'
import RaisedButton from 'material-ui/RaisedButton'
import Tooltip from 'material-ui/internal/Tooltip'

class RaisedButtonWithTooltip extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showTooltip: false
        }
    }

    showTooltip = () => {
        this.setState({
            tooltipShown: true
        })
    };

    hideTooltip = () => {
        this.setState({
            tooltipShown: false
        })
    };

    render() {
        const {tooltip, ...buttonProps} = this.props
        return <RaisedButton {...buttonProps} onMouseEnter={ this.showTooltip } onMouseLeave={ this.hideTooltip }>
                   <Tooltip label={ tooltip } show={ this.state.tooltipShown } verticalPosition='top' style={ tooltipStyle } />
               </RaisedButton>
    }
}

export default RaisedButtonWithTooltip

let tooltipStyle = {
    boxSizing: 'border-box',
    fontSize: '16px',
    marginTop: -8
}
