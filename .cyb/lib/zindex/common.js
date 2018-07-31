/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const fs = require('fs')
const path = require('path')

const common = {
  /*
   * 复制目录中的所有文件包括子目录
   * @param{ String } 需要复制的目录
   * @param{ String } 复制到指定的目录
   */
  copy(src, dist) {
    // 读取目录中的所有文件/目录
    let files = fs.readdirSync(src)

    files.map((file) => {
      let _src = path.join(src, file)
      let _dist = path.join(dist, file)
      let readable
      let writable

      let stat = fs.statSync(_src)

      // 判断是否为文件
      if (stat.isFile()) {
        // 创建读取流
        readable = fs.createReadStream(_src)
        // 创建写入流
        writable = fs.createWriteStream(_dist)
        // 通过管道来传输流
        readable.pipe(writable)
      }
      // 如果是目录则递归调用自身
      else if (stat.isDirectory()) {
        common.exists(_src, _dist, common.copy)
      }
    })
  },

  /**
   * 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
   */
  exists(src, dist, callback) {
    const distDir = fs.existsSync(dist)

    if (distDir) {
      callback(src, dist)
    } else {
      fs.mkdirSync(dist)
      callback(src, dist)
    }
  },
}

module.exports = common
