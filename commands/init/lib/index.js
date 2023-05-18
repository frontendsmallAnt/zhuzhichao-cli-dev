'use strict';

const Command = require('@zhuzhichao-cli-dev/command')
class InitCommand extends Command {
  constructor(){
    
  }

}

function init(projectName,cmdObj) {
  return new InitCommand()
}

module.exports.InitCommand = InitCommand;

module.exports = init
