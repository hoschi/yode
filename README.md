# Prototype

Edit functions directly and save them back to their original place.

# Dev Setup

* estraverse included by hand, because of [broken webpack import](https://github.com/estools/estraverse/issues/50 )
* remove `require(package.json)` line in `node_modules/escodegen/escodegen.js`
