# Notes

* estraverse included by hand, because of [broken webpack import](https://github.com/estools/estraverse/issues/50 )

# Init

* `npm install`
* `lerna bootstrap`

# Run demo in development mode

In one terminal

* `cd packages/core`
* `npm run build -- -w`

In another terminal

* `cd packages/demo`
* `npm run serve-dev` starts the webpack server

# Run demo build

* `lerna run build` all static files are created now
* `lerna run serve-build` to spawn a simple webserver
* go to http://localhost:9032/yode

# Release

* `git checkout master`
* `git merge --no-ff develop`
* `git push`
* check travis build status
* `lerna publish`
* `github_changelog_generator`
* commit changelog and push
* draft release at [release page](https://github.com/hoschi/yode/releases ) with content from changelog
* `git checkout develop && git merge --no-ff master && git push`
