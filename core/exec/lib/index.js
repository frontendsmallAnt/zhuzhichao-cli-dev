'use strict';
const Package = require('@zhuzhichao-cli-dev/package')
const log = require('@zhuzhichao-cli-dev/log')
const path = require('path')
const SETTINGS = {
  'init': '@zhuzhichao-cli-dev/init'
}
const CACHEDIR = 'dependencies'
async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = ''
  const cmdObj = arguments[arguments.length-1]
  const cmdName = cmdObj.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'
  let pkg
  if(!targetPath){
    targetPath = path.resolve(homePath,CACHEDIR)
    storeDir = path.resolve(targetPath,'node_modules')
    log.verbose('targetPath',targetPath)
    log.verbose('storeDir',storeDir)
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })
    const res = await pkg.exists()
    if(res){
      //更新package
      await pkg.update()
    }else{
      //安装package
      pkg.install()
    }
  }else{
   pkg = new Package({
      targetPath,
      packageName,
      packageVersion
    })
  }
  const rootFile = pkg.getRootFilePath()
  if(rootFile){
    require(rootFile).apply(null,arguments)
  }
  
}

module.exports = exec;
