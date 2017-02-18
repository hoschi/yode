# NFBE - Non File Based Editing

Edit AST Nodes instead of files for more focus and context.

> TODO short description was NFBE does, what's the goal

## Demo

> TODO link to hosted demo

## Features

> TODO bullet list, see notes of demo
> TODO implications (see notes of demo again) probably under its own heading

## Workflow

> TODO probably best done as video
> TODO search content to in open souce projects, like TodoMVC

* datei editor öffnen
* eine function öffnen die noch eine Kind function hat
* eine fucntion öffnen die keine kind function hat
* file editor schließen
* editoren so anordnen das es sinn macht
* jetzt ist man focusiert auf das was man braucht, sieht aber auch das sich die "outer" function live updated

## Screenspace management

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
* some opperations e.g. Gread to discard changes since last (git) commit

This makes the split useless, because you aren't looking at what you want to see anymore.
You can close the split or manually reposition its content to show what you want to see.

NeoVim uses the tab/split model where you have tabs which contain splits.
Other editors e.g. Atom uses the split/tab model where you split the screen and in one split you can
have tabs. Latter model is even more useless, because now the size of your split must fit the size of
content showed in each tab.

NFBE solves a bunch of these problems by creating view containes which have
their size connected to their content.
This way you must not resize the view container you edit at the moment or other containers around.
When more view containers visible then screen space availible, you still need to position them
to view what is important to you at the very moment.
Even the current implementation of the prototype can be changed, so you can dip out of the
"size of function editor is size of content" model.

A first implementation of layout logic should help you with positioning by moving to top(/left)
what is most important for you. You just mark the editors which you want to focus and
layout logic shifts these windows to top, where all other go below of them.
After that this can be improved or the user can select different layout logics per tab.
[As layouts used in Xmonad to manage window position in different ways](https://wiki.haskell.org/Xmonad/Screenshots#Tiled_layouts  )

## Contribution

> TODO describe what contribution is wanted

## Roadmap

> TODO describe prototype: UI it is not here to stay
> TODO list milestones with short description: refactoring, Nyaovim implementation, split up code into lib so it can be used in other editors

## Additional docs

* [Integration Tests](./docs/integration-tests.md)
* [Development Environment](./docs/development.md)

## Known issues

> TODO problem with object methods
> TODO works but not super performant: search for matching functions by text diffing

