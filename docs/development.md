# Notes

* estraverse included by hand, because of [broken webpack import](https://github.com/estools/estraverse/issues/50 )
* demo packages includes core with webpack alias. This allows you to switch between branches easily, because it doesn't rely on global npm modules.

# Init

* `npm install`
* `lerna exec -- npm install`

# Run demo in development mode

* `cd packages/demo`
* `npm run serve-dev` starts the webpack server

# Run demo build

* `lerna run build` all static files are created now
* `lerna run serve-build` to spawn a simple webserver
* go to 'http://localhost:9032/yode'

