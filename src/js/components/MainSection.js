import React from 'react';
import EditorSectionContainer from './EditorSectionContainer'

const MainSection = () => {
    return <div style={ mainContainerStyle }>
               <EditorSectionContainer/>
           </div>
}

export default MainSection;

let mainContainerStyle = {
    padding: 24
}
