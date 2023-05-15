'use strict';

module.exports = exec;
const Package = require('@zhuzhichao-cli-dev/package')
const log = require('@zhuzhichao-cli-dev/log')
const SETTINGS = {
  'init': '@zhuzhichao-cli-dev/init'
}
function exec() {
  const targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  const cmdObj = arguments[arguments.length-1]
  const cmdName = cmdObj.name()
  log.verbose('targetPath',targetPath)
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'
  const pkg = new Package({
    targetPath,
    packageName,
    packageVersion
  })
  console.log(pkg)
}
