'use strict';

module.exports = {
  getNpmInfo,
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion
};

const axios = require('axios')
const urljoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName,registry) {
  if(!npmName){
    return null
  }

  const registryURl = registry || getDefaultRegistry()
  const apiUrl = urljoin(registryURl,npmName)
  console.log(apiUrl, 'fffff')
  return axios.get(apiUrl).then(res => {
    if(res.status == 200) {
      return res.data
    } else {
      return null
    }
  }).catch(err => {
    return Promise.reject(err)
  })
}

function getDefaultRegistry(isOriginal = false){
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmversions(npmName,registry) {
  const data = await getNpmInfo(npmName,registry)
  const versions = Object.keys(data.versions)
  if(versions){
    return versions
  } else {
    return []
  }
}

function getLatestVersions(currentversion,versions){
  return versions.filter(version => {
   return semver.satisfies(version,`^${currentversion}`)
  }).sort((a,b) => semver.gt(b,a))
}

async function getNpmSemverVersion(currentversion,npmName,registry){
  const versions = await getNpmversions(npmName,registry)
  const newVersions = getLatestVersions(currentversion,versions)
  if(newVersions && newVersions.length>0){
    return newVersions[0]
  }
}

async function getNpmLatestVersion(npmName,registry){
   const versions = await getNpmversions(npmName,registry)
   if(versions){
     return versions.sort((a,b) => semver.gt(b,a))[0]
   }
   return null
}
