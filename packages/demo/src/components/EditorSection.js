import React from 'react'
import R from 'ramda'
import ReactGridLayoutOrig, { WidthProvider } from 'react-grid-layout'
import FunctionEditorContainer from './FunctionEditorContainer'
import FileEditorContainer from './FileEditorContainer'
import EditorGridItemContainer from './EditorGridItemContainer'
import { editorLayoutCols, editorHeaderClsName } from 'consts'

let ReactGridLayout = WidthProvider(ReactGridLayoutOrig)

let registeredEditorTypes = {
    FileEditorContainer,
    FunctionEditorContainer
}

let createBufferEditor = (buffer) => {
    let EditorType = registeredEditorTypes[buffer.editorType] || FileEditorContainer;
    return <div key={ buffer.id }>
               <div>
                   <EditorGridItemContainer itemId={ buffer.id }>
                       <EditorType buffer={ buffer } />
                   </EditorGridItemContainer>
               </div>
           </div>
}

const EditorSection = ({buffers, layout, onLayoutChanged}) => {
    let bufferEls = R.values(buffers).map(createBufferEditor)

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
               { bufferEls }
           </ReactGridLayout>
}

export default EditorSection
