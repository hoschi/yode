import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import * as palette from 'material-ui/styles/colors';
import mainSection from './mainSection'
import Shell from './Shell'

const theme = getMuiTheme({
    palette: {
        primary1Color: palette.indigo500,
        accent1Color: palette.cyan500,
    },
});

// needs to be a real react component to make hot reloading work
class App extends Component {
    render() {
        const MainSection = mainSection(React)
        return <MuiThemeProvider muiTheme={theme}>
                   <Shell>
                       <MainSection />
                   </Shell>
               </MuiThemeProvider>
    }
}

export default App
