import React from 'react';
import muiThemeConfig from 'muiThemeConfig';
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import ControlsContainer from './ControlsContainer'

const Shell = ({children}) => {
    return <div>
               <Paper style={ style.pinnedArea } zDepth={ 2 }>
                   <AppBar title="NFBE Prototype" showMenuIconButton={ false } zDepth={ 0 } />
                   <ControlsContainer />
               </Paper>
               <div style={ style.mainArea }>
                   { children }
               </div>
           </div>
}

export default Shell

let style;
{
    let pinnedAreaHeight = 148;
    style = {
        pinnedArea: {
            position: 'fixed',
            top: 0,
            width: '100%',
            backgroundColor: muiThemeConfig.palette.primary1Color,
            zIndex: 5
        },
        mainArea: {
            marginTop: pinnedAreaHeight
        }
    }
}
