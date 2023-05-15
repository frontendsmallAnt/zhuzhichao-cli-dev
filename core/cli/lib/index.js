'use strict';
module.exports = core;
const path = require('path')
const pkg = require('../package.json')
const commander = require('commander')
const log = require('@zhuzhichao-cli-dev/log')
const init = require('@zhuzhichao-cli-dev/init')
const exec = require('@zhuzhichao-cli-dev/exec')
const semver = require('semver')
const userhome = require('user-home')
const pathExists = require('path-exists').sync
const colors = require('colors')
const rootCheck = require('root-check')
const constant = require('./constant')
const program = new commander.Command()
async function core() {
  try {
    await prepare()
    //注册命令
    registerCommand()
  } catch (e) {
    log.error(e.message)
  }
}

function checkNodeVersion() {
  const currentVersion = process.version
  const lowestVersion = constant.LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`需要安装 v${lowestVersion} 以上版本的node.js`));
  }
}

function checkPkgVersion() {
  log.notice('cli', pkg.version)
}

function checkRoot() {
  rootCheck()
}

function checkUserHome() {
  if (!userhome || !pathExists(userhome)) {
    throw new Error(colors.red('当前用户文件主目录不存在'))
  }
}

async function prepare() {
  //检查版本号
  checkPkgVersion()
  //检查node版本
  checkNodeVersion()
  //检查root启动
  checkRoot()
  //检查用户主目录
  checkUserHome()
  //创建默认环境变量
  createDefaultConfig()
  //检查环境变量
  checkEnv()
  //检查是否需要更新版本号
  await checkGlobalUpdate()
}

function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userhome, '.env')
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    })
  }
}

//创建默认的环境变量参数
function createDefaultConfig() {
  const cliConfig = {
    home: userhome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userhome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userhome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

async function checkGlobalUpdate() {
  //拿到当前版本好
  const currentVersion = pkg.version
  const npmName = pkg.name
  const { getNpmSemverVersion } = require('@zhuzhichao-cli-dev/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新${npmName},当前版本${currentVersion},最新版本：${lastVersion}`))
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<commnad> [options]')
    .version(pkg.version)
    .option('-d,--debug', '是否开启调试模式', false)
    .option('-tp,--targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program
    .command('init [projectName]')
    .option('-f,--force', '是否强制初始化项目')
    .action(exec)

  program.on('option:debug', function (parameter) {
    if (parameter) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  })

  program.on('option:targetPath',function(parameter){
    process.env.CLI_TARGET_PATH = parameter
  })

  program.on('command:*', function (obj) {
    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log(colors.red('不存在命令' + obj[0]))
  })

  if (process.argv.length < 3) {
    program.outputHelp()
  } else {
    program.parse(process.argv)
  }
}