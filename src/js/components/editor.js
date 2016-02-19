require('codemirror/mode/javascript/javascript')
require('codemirror/lib/codemirror.css')
import CodeMirror from 'codemirror'

import reactStamp from 'react-stamp'

const Editor = (React) => {
    return reactStamp(React).compose({
        shouldComponentUpdate() {
            return false
        },

        componentDidMount() {
            this._CMHandlers = []
            let config = {
                value: this.props.content,
                highlight: true,
                readOnly: false,
                mode: 'javascript',
                lineNumbers: true
            }

            this.codeMirror = CodeMirror(
                this.refs.container,
                config
            )

            if (this.props.onContentChange) {
                this._onContentChange()

                this._bindCMHandler('changes', () => {
                    clearTimeout(this._updateTimer)
                    this._updateTimer = setTimeout(this._onContentChange.bind(this), 50)
                })
            }
            /*
             *this._bindCMHandler('cursorActivity', () => {
             *    clearTimeout(this._updateTimer)
             *    this._updateTimer = setTimeout(this._onActivity.bind(this), 100)
             *})
             */
        },

        componentWillUnmount() {
            this._unbindHandlers()
            this.refs.container.removeChild(this.refs.container.children[0])
            this.codeMirror = null
        },

        componentWillReceiveProps(nextProps) {
            if (nextProps.content !== this.props.content) {
                this.codeMirror.setValue(nextProps.content)
            }
        },

        _bindCMHandler(event, handler) {
            this._CMHandlers.push(event, handler)
            this.codeMirror.on(event, handler)
        },

        _unbindHandlers() {
            let cmHandlers = this._CMHandlers
            for (let i = 0; i < cmHandlers.length; i += 2) {
                this.codeMirror.off(cmHandlers[i], cmHandlers[i + 1])
            }
        },

        _onContentChange() {
            let doc = this.codeMirror.getDoc()
            this.props.onContentChange({
                value: doc.getValue(),
                cursor: doc.indexFromPos(doc.getCursor())
            })
        },

        render() {
            const style = {
                height: '100%',
                width: '100%'
            }
            return <div style={ style }>
                       <div className='editor' ref='container' style={ style }></div>
                   </div>
        }
    })
}

export default Editor
