/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 通过ssh方式部署上线代码
 * ---------------------------------
 */

const fs = require('fs')
const path = require('path')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const through2 = require('through2')
const Client = require('ssh2').Client
const async = require('async')
const vfs = require('vinyl-fs')
const config = require('./lib/fezconfig')

const uploader = (sftp, sftpConfig) => {

  return through2.obj(function(file, enc, cb) {

    const stats = fs.statSync(file.path)

    if (stats.isDirectory() && (stats.isDirectory() !== '.' || stats.isDirectory() !== '..')) {
      sftp.mkdir(path.join(sftpConfig.remotePath, file.relative), { mode: '0755' }, function(err) {
        if (!err) {
          fancyLog(chalk.yellow(`创建目录：${file.relative}`))
        }
        cb()
      })
    } else {
      let readStream = fs.createReadStream(file.path)
      let writeStream = sftp.createWriteStream(path.join(sftpConfig.remotePath, file.relative))

      writeStream.on('close', function() {
        fancyLog(chalk.green(`成功上传：${file.relative}`))
        cb()
      })

      readStream.pipe(writeStream)
    }
  })
}

module.exports = () => {
  fancyLog(chalk.magenta('Start sftp...'))

  function sftpUpload() {
    const sftpConfig = Object.assign({}, config.sftp)
    const distPath = config.sftp.includeHtml ? `${config.paths.dist.dir}/**/*` : [`${config.paths.dist.dir}/**/*`, `!${config.paths.dist.dir}/**/*.html`]

    const connSettings = {
      host: sftpConfig.host,
      port: sftpConfig.port, // Normal is 22 port
      username: sftpConfig.user,
      password: sftpConfig.password
      // You can use a key file too, read the ssh2 documentation
    }

    const conn = new Client()

    conn.on('ready', function() {
      conn.sftp(function(err, sftp) {
        if (!err) {
          vfs.src(distPath)
            .pipe(uploader(sftp, sftpConfig))
            .on('data', function(data) {
              // console.log(data)
            })
            .on('end', function() {
              conn.end()
              // conn.close()
              fancyLog(chalk.magenta('sftp succeed.'))
            })
        }
      })
    })

    conn.connect(connSettings)
  }

  sftpUpload()
}
