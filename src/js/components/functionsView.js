const FunctionsView = (React) => {
    return ({ast}) => {
        return <div>
                   this should list all functions:
                   <br/>
                   { JSON.stringify(ast) }
               </div>
    }
}

export default FunctionsView
