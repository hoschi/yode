import React from 'react';
import AppBar from 'material-ui/AppBar'

const Shell = ({children}) => {
    return <div>
               <AppBar title="NFBE Prototype" showMenuIconButton={ false } />
               { children }
           </div>
}

export default Shell
