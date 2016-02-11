const Editor = (React) => {
    return ({content}) => {
        return <div>
                    this should be a code mirror editor, show text from store:
                    <br/>
                    <br/>
                    {content}
               </div>
    }
}

export default Editor
