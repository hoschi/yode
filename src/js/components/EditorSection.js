import React from 'react'
import FunctionEditorContainer from './FunctionEditorContainer'
import FileEditorContainer from './FileEditorContainer'

let createFunctionEditor = (functionNode) => (
    <FunctionEditorContainer key={ functionNode.customId } functionNode={ functionNode } />
)
let createFileEditor = (file) => <FileEditorContainer file={ file } key={ file.id } />

const EditorSection = ({files, functions}) => {
    // FIXME use layout instead of div
    let functionEls = functions.map(createFunctionEditor)
    let fileEls = files.map(createFileEditor)

    return <div>
               { fileEls }
               { functionEls }
           </div>
}

export default EditorSection
