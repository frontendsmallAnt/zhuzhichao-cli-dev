'use strict';

const { isObject } = require('@zhuzhichao-cli-dev/utils')
const path = require('path')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const pathExists = require('path-exists').sync
const fse = require('fs-extra')
const { getDefaultRegistry, getNpmLatestVersion } = require('get-npm-info')
const formatPath = require('@zhuzhichao-cli-dev/format-path')
class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类参数不能为空')
    }

    if (!isObject(options)) {
      throw new Error('Package类的options参数必须为对象')
    }

    //package路径
    this.targetPath = options.targetPath
    this.storeDir = options.storeDir
    this.packageName = options.packageName
    this.packageVersion = options.packageVersion
    if(this.packageName.indexOf('/') !== -1){
      this.packageSplit = this.packageName.split('/')[0]
    }else{
      this.packageSplit = this.packageName
    }
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare() {
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir)
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  //判断pkg是否存在
  async exists() {
    //判断文件处于缓存还是
    if (this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  //安装package
  async install() {
    await this.prepare()
    npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [{
        name: this.packageName,
        version: this.packageVersion
      }]
    })
  }

  //更新package
  async update() {
    await this.prepare()
    const newVersion = await getNpmLatestVersion(this.packageName)
    //查询最新版本号对应的路径是否存在
    const latestFilePath = this.getSpecificFilePath(newVersion)
    //如果不存在，下载最新版本
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [{
          name: this.packageName,
          version: newVersion
        }]
      })
      this.packageVersion = newVersion
    }


  }

  //获取文件入口的路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      //1获取package.json所在根目录
      const dir = pkgDir(targetPath)
      if (dir) {
        //2读取package.json
        const pkgFile = require(path.resolve(dir, 'package.json'))
        //3寻找main/lib
        if (pkgFile && pkgFile.main) {
          //4路径兼容
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
    }
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath)
    } else {
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package;
