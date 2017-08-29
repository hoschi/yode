# Setup

* estraverse included by hand, because of [broken webpack import](https://github.com/estools/estraverse/issues/50 )
* remove `require(package.json)` line in `node_modules/escodegen/escodegen.js`
* demo packages includes core with webpack alias. This allows you to switch between branches easily, because it doesn't rely on global npm modules.

# Run demo locally

* `npm install`
* `npm run serve-dev` starts the webpack server

