import React from 'react'
import ReactGridLayoutOrig, { WidthProvider } from 'react-grid-layout'
import FunctionEditorContainer from './FunctionEditorContainer'
import FileEditorContainer from './FileEditorContainer'
import EditorGridItemContainer from './EditorGridItemContainer'
import { editorLayoutCols, editorHeaderClsName } from '../constants'

let ReactGridLayout = WidthProvider(ReactGridLayoutOrig)

let createFunctionEditor = (functionNode) => (
    <div key={ functionNode.customId }>
        <div>
            <EditorGridItemContainer itemId={ functionNode.customId.toString() }>
                <FunctionEditorContainer functionNode={ functionNode } />
            </EditorGridItemContainer>
        </div>
    </div>
)
let createFileEditor = (file) => (
    <div key={ file.id }>
        <div>
            <EditorGridItemContainer itemId={ file.id }>
                <FileEditorContainer file={ file } />
            </EditorGridItemContainer>
        </div>
    </div>
)

const EditorSection = ({files, functions, layout, onLayoutChanged}) => {
    let functionEls = functions.map(createFunctionEditor)
    let fileEls = files.map(createFileEditor)

    let gridProps = {
        cols: editorLayoutCols,
        draggableHandle: '.' + editorHeaderClsName,
        rowHeight: 1,
        isResizable: true,
        margin: [24, 0],
        containerPadding: [24, 24],
        autoSize: true,
        onLayoutChange: (layout) => onLayoutChanged({
            layout
        }),
        layout
    }

    return <ReactGridLayout {...gridProps}>
               { fileEls }
               { functionEls }
           </ReactGridLayout>
}

export default EditorSection
