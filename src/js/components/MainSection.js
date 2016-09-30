import React from 'react';
import ControlsContainer from './ControlsContainer'
import FileEditorsPaneContainer from './FileEditorsPaneContainer'
import FunctionEditorsPaneContainer from './FunctionEditorsPaneContainer'

const MainSection = () => {
    return <div style={ mainContainerStyle }>
               <ControlsContainer />
               <div style={ paneContainerStyle }>
                   <FileEditorsPaneContainer style={ leftPaneStyle } />
                   <FunctionEditorsPaneContainer style={ rightPaneStyle } />
               </div>
           </div>
}

export default MainSection;

let mainContainerStyle = {
    padding: 24
}

let paneContainerStyle = {
    position: 'relative'
}

let paneBaseStyle = {
    position: 'absolute',
    height: 900,
    width: 500,
    top: 0,
    left: 0
}

let leftPaneStyle = Object.assign({}, paneBaseStyle)

let rightPaneStyle = Object.assign({}, paneBaseStyle, {
    left: paneBaseStyle.width + 24 + leftPaneStyle.left
})
