import React from 'react';
require('codemirror/mode/javascript/javascript')
require('codemirror/lib/codemirror.css')
import CodeMirror from 'codemirror'

const Editor = React.createClass({
    shouldComponentUpdate() {
        return false
    },

    componentDidMount() {
        this._CMHandlers = []
        let config = {
            value: this.props.text,
            readOnly: false,
            mode: 'javascript',
            lineNumbers: true,
            theme: 'mui-light'
        }
        this.suspendEvents = false;

        this.codeMirror = CodeMirror(
            this.refs.container,
            config
        )

        if (this.props.onTextChange) {
            this._bindCMHandler('changes', () => {
                if (this.suspendEvents) {
                    return
                }
                clearTimeout(this._updateTimer)
                this._updateTimer = setTimeout(this._onTextChange, 100)
            })
        }

        if (this.props.onActivity) {
            this._bindCMHandler('cursorActivity', () => {
                if (this.suspendEvents) {
                    return
                }
                clearTimeout(this._updateTimer);
                this._updateTimer = setTimeout(this._onActivity, 100);
            });
        }
    },

    componentWillUnmount() {
        this._unbindHandlers()
        this.refs.container.removeChild(this.refs.container.children[0])
        this.codeMirror = null
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.text !== this.props.text) {
            // suspend events, so programmatically changed cursor position
            // doesn't get handles as an user action
            this.suspendEvents = true;
            let cursor = this.codeMirror.getDoc().getCursor()
            this.codeMirror.setValue(nextProps.text)
            this.codeMirror.getDoc().setCursor(cursor)
            this.suspendEvents = false;
        }
        this._setError(nextProps.error)
    },

    _getErrorLine(error) {
        if (error.loc && error.loc.line) {
            return error.loc.line
        } else if (error.lineNumber) {
            return error.lineNumber;
        }
        console.warning('no error line');
        return 0;
    },

    _setError(error) {
        if (!this.codeMirror) {
            return
        }

        let oldError = this.props.error
        if (oldError) {
            let lineNumber = this._getErrorLine(oldError)
            if (lineNumber) {
                this.codeMirror.removeLineClass(lineNumber - 1, 'text', 'errorMarker')
            }
        }

        if (error) {
            let lineNumber = this._getErrorLine(error)
            if (lineNumber) {
                this.codeMirror.addLineClass(lineNumber - 1, 'text', 'errorMarker')
            }
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

    _onTextChange() {
        let doc = this.codeMirror.getDoc()
        this.props.onTextChange({
            value: doc.getValue(),
            cursor: doc.indexFromPos(doc.getCursor())
        })
    },

    _onActivity() {
        let doc = this.codeMirror.getDoc()
        this.props.onActivity(doc.indexFromPos(doc.getCursor()))
    },

    render() {
        let containerStyle = {
            height: '100%',
            width: '100%'
        }
        const style = Object.assign({}, containerStyle, this.props.editorStyle)
        return <div style={ style }>
                   <div className='editor' ref='container' style={ containerStyle }></div>
               </div>
    }
})

export default Editor
