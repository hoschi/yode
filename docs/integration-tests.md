# Integration Tests

## editor management

* when the user clicks on the X icon of an editor
    * the editor closes
* when the user clicks in an editor
    * the editor gets a greater zDepth to lay above other editors

## "up" button, which swaps current (child )function editor with an editor of its parent function

* when the user clicks the button, and the editor has a parent function, but the parent function has no editor open
    * remove the current editor
    * at the place of the removed child editor, an editor of the parent function should spawn
* when the user clicks the button, and the editor has a parent function, and the parent function has an editor open
    * remove the current editor
    * parent function editor moves at the list position of the closed child editor
* when the user clicks the button, and the editor has no parent function
    * nothing happens

### "open function editor for function under cursor" button

* when placing the cursor in a function editor, where the cursor is not in a child function, and users clicks on button
    * nothing happens, because the editor for this function is already open
* when placing the cursor in a editor and the text of the editor is not parsable, and user clicks on button
    * nothing happens, because the we can't build the AST to search in, of unparsable text
* when placing the cursor in a function editor, where the cursor is in a child function, and users clicks on button
    * an function editor for this function gets created and placed on the top of function editors on the right side of the app
* when placing the cursor in a file editor, where the cursor is not in a child function, and users clicks on button
    * nothing happens, because the user can't spawn another file editor
* when placing the cursor in a file editor, where the cursor is in a child function, and users clicks on button
    * a function editor for this function gets created and placed on the top of function editors on the right side of the app
* when a function editor should be created, but the function has already a visible editor
    * nothing happens

