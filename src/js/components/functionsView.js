const FunctionsView = (React) => {
    return ({functions, ast}) => {
        return <div>
                   { JSON.stringify(functions) }
                   <br/>
                   <br/>
                   { JSON.stringify(ast) }
               </div>
    }
}

export default FunctionsView
