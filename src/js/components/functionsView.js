import editor from './editor'

const FunctionsView = (React) => {
    const Editor = editor(React)
    return ({functions, ast}) => {
        let editorStyle = {
            border: '2px solid steelblue',
            marginBottom: 4
        }
        let texts = functions.map(function (node, i) {
            return <div key={ i }>
                       <div>unique id:
                           { ' ' }
                           { node.id }
                       </div>
                       <Editor editorStyle={ editorStyle } content={ node.text } />
                   </div>
        })
        return <div>
                   { texts }
               </div>
    }
}

export default FunctionsView
