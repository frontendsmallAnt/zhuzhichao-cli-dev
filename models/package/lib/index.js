'use strict';
const { isObject } = require('@zhuzhichao-cli-dev/utils') 
const pkgDir = require('pkg-dir').sync
const path = require('path')
const formatPath = require('@zhuzhichao-cli-dev/format-path')
class Package{
  constructor(options){
    if(!options){
      throw new Error('Package类参数不能为空')
    }

    if(!isObject(options)){
      throw new Error('package类的options参数必须为对象')
    }

    //package路径
    this.targetPath = options.targetPath
    this.storePath = options.storePath
    this.packageName = options.packageName
    this.packageVersion = options.packageVersion

  }

  //判断pkg是否存在
  exists(){

  }

  //安装package
  install(){

  }

  //更新package
  update(){

  }

  //获取文件入口的路径
  getRootFile(){
    //获取package.json所在根目录
    const dir = pkgDir(this.targetPath)
    if(dir){
      //读取package.json
      const pkgFile = require(path.resolve(dir,'package.json'))
      //寻找main/lib
      if(pkgFile && pkgFile.main){
        return formatPath(path.resolve(dir,pkgFile.main))
      }
    }
    return null
  }
}

module.exports = Package;
