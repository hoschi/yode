# Overview

The demo webapp acts as a kind of reference implementation for how to integrate yode into an existing editor.
So everytime you read "demo" you can replace that by "your editor you want to integrate yode into" in your mind.
All needed to implement the logic to communicate with yode is located in
[plugins directory](../packages/demo/src/plugin):

* [YodeDemoPlugin](../packages/demo/src/plugin/YodeDemoPlugin.js)
    * `initPlugin` connects the demo app and Yode
    * `R.mapObjIndexed((handler, eventName) => emitter.on(eventName, handler), handlers)`
      "Demo → Yode" information flow direction is done here with a simple event emitter,
      which listens for some of the demo Redux actions (editor events) and calls Yode (`core`)
      methods to update its internal state accordingly
    * `core.init(editorApi, files)`
      in turn does the other direction "Yode → Demo" by giving Yode access to
      demo through the API implementation `editorApi`
    * it uses the API Yode gives you to interact with it, listed below
* [EditorApi](../packages/demo/src/plugin/EditorApi.js)
    * this is the implementation of the API Yode uses to talk to the editor
    * an integration logic must implement these methods so Yode can call them
    * to inform the editor that changes need to be applied (e.g. `changeBufferText`) or query current
      editor state (e.g. `isBufferVisible`)
* UI enhancements
    * this is probably not needed in your editor e.g. when it has already a place to show syntax errors or
      you want to handle user interaction without visual elements
    * the files used to show the meta data special for yode and trigger actions are implemented in
        * [BufferEditor](../packages/demo/src/plugin/BufferEditor.js)
        * [BufferEditorContainer](./packages/demo/src/plugin/BufferEditorContainer.js)
    * which actions you want to support is up to you, you can start without supporting e.g. "swap with parent"
* [Yode API](../packages/core/src/BufferManager.js )
    * this is implements the Yode API
    * for configuration at instanciation check the `options` property documentation
    * for methods see the block below "public API"

# Meta Data

* `syntaxError` {Object}
    * this is the syntax error given when the underlying parser can't parse the code
    * if your editor shows this already you don't need to use it
    * it indicates that the file/node doesn't send updates anymore, till the error is fixed
    * this editor needs to be editable so the user can fix the error
* `hasConnectedError` {Boolean}
    * indicates that this or another node/file has an error which
    * for every editable editor which has this flag set to `true` should switched to "read only" mode,
      if `syntaxError` isn't defined
    * this means also bulk edit things e.g. search/replace for all buffers managed by the editor at the moment
