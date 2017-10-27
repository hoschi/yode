import React from 'react'
import R from 'ramda'
import ReactGridLayoutOrig, { WidthProvider } from 'react-grid-layout'
import BufferEditorContainer from './BufferEditorContainer'
import EditorGridItemContainer from './EditorGridItemContainer'
import { editorLayoutCols, editorHeaderClsName, functionEditorType, fileEditorType } from 'consts'

let ReactGridLayout = WidthProvider(ReactGridLayoutOrig)

let createBufferEditor = (buffer) => {
    let EditorType = BufferEditorContainer
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
