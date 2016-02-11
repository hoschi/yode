import React, { Component } from 'react'
import mainSection from './mainSection'

// needs to be a real react component to make hot reloading work
class App extends Component {
    render() {
        const MainSection = mainSection(React)
        return <div>
                   <MainSection />
               </div>
    }
}

export default App
