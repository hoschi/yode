import React, { Component } from 'react'
import muiThemeConfig from 'muiThemeConfig';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MainSection from './MainSection'
import Shell from './Shell'

const theme = getMuiTheme(muiThemeConfig);

// needs to be a real react component to make hot reloading work
class App extends Component {
    render() {
        return <MuiThemeProvider muiTheme={ theme }>
                   <Shell>
                       <MainSection />
                   </Shell>
               </MuiThemeProvider>
    }
}

export default App
