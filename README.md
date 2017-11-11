# Yode - Focused Code Editing

[![npm version](https://badge.fury.io/js/yode.svg)](https://badge.fury.io/js/yode) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

| [HN](https://news.ycombinator.com/item?id=15105484 ) | [Echojs](http://www.echojs.com/news/23936 ) | [reddit](https://www.reddit.com/r/javascript/comments/6w5qfs/yode_focused_code_editing/ ) |

Edit smaller parts of a code base, so you can focus better on the important parts of a task.
You can edit functions of JavaScript code as deeper level of a file.
By focusing on functions of interest you can open an editor for each of it and
arrange them to serve as context of your work. This frees you from the clutter
of the rest of the file, containing this function.
Yode is designed as library, so it can be integrated in existing text editors
([NeoVim](https://neovim.io/ ),
[Atom](https://atom.io/ ), ...).

## Introduction Video

[![Yode Introduction Video](https://img.youtube.com/vi/3H8MqT2OgkA/0.jpg)](https://www.youtube.com/watch?v=3H8MqT2OgkA)

## Motivation

I love text editors and I am a Vim/NeoVim user for years now.
The power you get from a modal editor and such memoizable commands like `ciw`
(change inner word) is very usefull when writing code.
There are more editors out there, for every kind of person at least one.
So I don't want to write a new text editor, instead I want to give them even more power.

Code is saved in files and with your text editor of choice you edit them, fine.
They even help you by recognizing patterns (text objects) like words, lines,
paragraphs, blocks in brackets and so on, great.
For soucre code there is a version which is even more descriptive, called
[abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree ).
I want to bring this knowledge to text editors so they can make use of it.
For some ideas what could be done with this knowledge, just keep reading.
When reading a file into the text editor it should be converted to an AST and from then this is the source of truth.
This means when you change text of a node it gets converted back to an AST.
Every time the AST or some part of it changed, the whole AST of the
corresponding file gets written as text into the file, so the file is the
destination of truth.
This is important, because every other tool can still work with files and doesn't need to change anything.
It also means you can still use features of your text editor which work on
files like search/replace, removing files from disk and so on.

The smallest editable container in a text editor is a file.
But files contain a lot of code, they group some kind of stuff together so you don't get too much files.
This is a good thing, because you need an overview of your current code base.
When you tackle a task you search the files you need to edit and then the parts of them which you need to change.
At this point current text editors leave you a little bit alone when you want to
[organize these parts](#current-state-of-screenspace-management).
Yode gives you the possibillty to focus on smaller parts of code than "a file".
This prototype adds another level of changabillty, function nodes of the AST.
A function can have its own editor, which is just an instance of your text editor but editing not a whole file.
This way you can still use the features of your text editor, but in a more focused way.
By removing all other content of the file around the function of interest, you remove clutter.
By removing clutter, you get more screen space for other parts of code you are interessted in.
Editing AST nodes brings also another way to navigate.
Instead of switching between files you can now switch between nodes in the hierarchy the tree represents.
You can drill down deeper into a node when you are interessted in an even smaller part of the current code.
The other way around, you can walk up the tree to get a better overview when you lost track.

## Features

Features of library accessible through prototype UI:

* open function under cursor in own editor
* changes in function editor synced to file
* changes in file editor synced to open function editor
* state tracking for unparsable code
* move up in code hierarchy to expand current scope of editor
* new files can be created on the fly
* simple layout logic
    * open new function editor on right side so it doesn't bother left (main) side
    * editor can be sized horizontally to fine tune screen space occupied
    * vertical size of editor is given by content
    * editor can be closed when not needed anymore

## Demo

https://hoschi.github.io/yode/

Sourcemaps are included, check console for profile logs which can be used as debugging entry point.

## Current state of screenspace management

Splits are the current way to divide the editor screen into spaces which can show different parts.
These parts can be different files or different parts of a file.
A split has a (fragile) connection to the position it shows.
In NeoVim you can create a split and scroll the current line to the top of the split.
This position is mantained when you insert text above or below the current content of your split
in another tab/split, which is already usefull.
Unfortunately the position gets lost easily:

* changing the size of the split e.g. by maximize it
* add/remove a split which forces other splits to shrink/expand
* add more text in the split so the text you want to see extends the size of your split, they don't resize to content
* some opperations e.g. `Gread` to discard changes since last git commit

This makes the split useless, because you aren't looking at what you want to see anymore.
You can close the split or manually reposition its content to show what you want to see.

NeoVim uses the tab/split model where you have tabs which contain splits.
Other editors e.g. Atom uses the split/tab model where you split the screen and in one split you can
have tabs. Latter model is even more useless, because now the size of your split must fit the size of
content showed in each tab.

Yode solves a bunch of these problems by creating view containers which have
their size connected to their content.
This way you must not resize the view container you edit at the moment or other containers around.
When more view containers visible then screen space availible, you still need to position them
to view what is important to you at the very moment.
In addition the current implementation of the prototype could be changed, so you can dip out of the
"size of function editor is size of content" model, if you prefer this.

A first implementation of layout logic should help you with positioning by e.g. moving to top(/left)
what is most important for you. You just mark the editors which you want to focus and
layout logic shifts these windows to top, where all other go below of them.
After that this can be improved or the user can select different layout logics per tab.
[As layouts used in Xmonad to manage window position in different ways](https://wiki.haskell.org/Xmonad/Screenshots#Tiled_layouts  )

## Implications

The features of current state implicate additional ones for the mature version
of the library integrated in a real editor:

* save screen space
    * vertical because function editor is as big as content, no space wasted
    * horizontal for nested function, because indent level starts for each editor at zero
    * open function editor for interessting function to keep context
    * less scrolling, only one global scrollbar
* text editor (NeoVim, Atom, ...) features can now work on a range easily
    * search/replace
    * remove a whole function
    * relocate a whole function
    * ...
* functions are now an additional "context object"
    * as autocompletion uses identifiers to give the user context
    * function editors can be now used as context as well
    * go crazy with machine learning here → e.g.
        * show function editor for function under cursor automatically
        * show last edited functions if there is space for it
        * ...
* editors are focused now
    * the computer "knows" what one editor shows, because AST nodes has types e.g. "function" in prototypes case
    * editors are most of the time pretty small
    * both can be used to automatically layout editors instead of manual splitting panes
    * spawn editors for a logical group of code
        * current function and all its test functions
        * React dumb and smart component
        * used selectors and action creators of a smart component
        * ...
* make other AST nodes editable
    * proof of concept makes function nodes editable, this can be expanded to other node types
    * Objects, to get editors for e.g. configs
    * Arrays
    * ...
* use available AST for other things
    * add `import` statements automatically in file below last `import` already existing
    * add imported varible to already existing import
    * linting without the need to parse file (for speed)
    * probably snippets can work much better with AST
    * pretty all stuff IDEs do already
    * ...
* use type of AST nodes as text objects in editors
    * add new operations to work with them
    * "change current function call" which changes called function but not the parameters
    * "change function body" which puts cursor right into the curly brackets and deletes current body so you can start from scratch
    * ...
* hierarchy of function gets maintained
    * navigate in this tree, like "swap with parent" button
    * use as outline view

## Roadmap

This project is actively mantained and development.
It is a side project, so don't expect a full time working pace.

* [X] prototype
    * check if the problem can be solved with a reasonable performance
    * simple UI which mocks real editor (demo UI is not here to stay)
    * gather not obvious problems
* [X] [refactor prototype into library](https://github.com/hoschi/yode/issues/1 )
    * which can then be used to integrate in editor
    * separate logic for demo UI from core logic
    * separate parser from state logic where possible
* [ ] integrate into [Oni](https://github.com/extr0py/oni ) (NeoVim GUI)
    * build Oni plugin which glues Oni and Yode together
        * [see ticket at Oni repo](https://github.com/onivim/oni/issues/894 )
        * sends current buffer content
        * sends events like (cursor moved)
        * implements layouting logic as in prototype
        * ...
    * \o/ when this milestone is done, it should be usable for every day work \o/
        * start with small window management features
        * keep performance issues till they lead to problems
* [ ] search better solutions for known issues
* [ ] build server around lib so it can communicate with editor integration which can't execute JavaScript
    * one server instance should keep state (open files, functions, ...) regarding one editor instance
    * protocol can be easy (e.g. JSON RPC) at this state and swapped with some more complex/faster/... (e.g. MessagePack) later

## Name

"Yode" comes from the english word "node", because you edit (AST) nodes. I swapped the letter "n" with a "y". Y you ask? Y not! :sob:

## Additional docs

* [Development Environment](./docs/development.md )
* [How to integrate Yode into an editor](./docs/integration.md )
* [Integration Tests](./docs/integration-tests.md )
* development happens on [develop branch](https://github.com/hoschi/yode/tree/develop )

## Known issues

As this is a prototype, the list is not complete.

* big chunks of code changes
    * like cut & paste or git operations which make bigger changes than a user while writing in an editor
    * it is hard in this cases to identify the function (and its properties) reliable
* code duplication
    * like copy & paste of a function to duplicate the overall logic and change
      the details afterwards. Probably during a refactoring session.
    * duplicated function should not overtake the properties of the existing (copied) function
    * if the editor supports this, copy/paste events can handled separatly to change e.g. the function name of the duplicate before pasting it

## Contribution

Use the [issue tracker](https://github.com/hoschi/yode/issues ) for all kind of questions, bug
reports, etc. I'll tag it then as needed. As the project is fast moving at the
moment, ideas, general discussion and research about the problem space are also
a good way to contribute. I'll collect them and pick it up when it is
appropriate. As the current milestone is refactoring and the ideas for the
next one are pretty roughly described, contributing with code is at the moment
difficult. Please create a ticket, before submitting a pull request.

## Ressources

These projects helped me *a lot* when developing this :heart:

* [AST Explorer](https://astexplorer.net )
* [Acorn](https://github.com/ternjs/acorn )
* [Recast](https://github.com/benjamn/recast )
* [CodeMirror](https://codemirror.net/index.html )
