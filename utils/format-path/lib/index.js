/*
 * @FilePath: /zhuzhichao-cli-dev/utils/format-path/lib/index.js
 * @Author: zhuzhichao
 * @Date: 2023-05-16 03:13:39
 * @LastEditors: zhuzhichao
 * @LastEditTime: 2023-05-16 10:06:32
 */
'use strict';
const path = require('path')
function formatPath(p) {
  if(p && typeof p === 'string'){
    const sep = path.sep
    if(sep === '/'){
      return p
    } else {
      return p.replace(/\\/g,'/')
    }
  }
  return p
}

module.exports = formatPath;
