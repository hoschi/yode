import React from 'react';
import muiThemeConfig from 'muiThemeConfig';
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import ControlsContainer from './ControlsContainer'
import githubMarkImg from 'file-loader!src/assets/GitHub-Mark.png';

const Shell = ({children}) => {
    return <div>
               <Paper style={ style.pinnedArea } zDepth={ 2 }>
                   <div style={ style.header }>
                       <AppBar title="NFBE Prototype" showMenuIconButton={ false } zDepth={ 0 } />
                       <a href="https://github.com/hoschi/nfbe" title="Github project page">
                           <img style={ style.githubImg } src={ githubMarkImg } alt="github mark" />
                       </a>
                   </div>
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
        },
        header: {
            display: 'flex'
        },
        githubImg: {
            height: 24,
            width: 24,
            margin: 20,
            marginRight: 24
        }
    }
}
