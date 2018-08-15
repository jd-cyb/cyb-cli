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
const isWin = /^win/.test(process.platform)

const uploader = (sftp, sftpConfig) => {

  return through2.obj(function(file, enc, cb) {

    const stats = fs.statSync(file.path)

    let writeStreamPath = path.join(sftpConfig.remotePath, file.relative)
    if (isWin) {
      writeStreamPath = writeStreamPath.replace(/\\/g, '/')
    }

    if (stats.isDirectory() && (stats.isDirectory() !== '.' || stats.isDirectory() !== '..')) {
      sftp.mkdir(writeStreamPath, { mode: '0755' }, function(err) {
        if (!err) {
          fancyLog(chalk.yellow(`创建目录：${file.relative}`))
        }
        cb()
      })
    } else {
      let readStream = fs.createReadStream(file.path)
      let writeStream = sftp.createWriteStream(writeStreamPath)

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
          sftp.stat(sftpConfig.remotePath, function(err, stats) {
            if (stats && stats.isDirectory()) {
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
            } else {
              fancyLog(chalk.red(`上传目录不存在`))
              fancyLog(chalk.red(`请在服务器上先创建目录：${sftpConfig.remotePath}`))
              conn.end()
            }
          })
        }
      })
    }).on('error', function(err) {
      if (err.errno === 'ENETUNREACH') {
        fancyLog(chalk.red('请检查网络是否连接正常。'))
      } else {
        fancyLog(chalk.red('请确认使用SSH可以正常联通服务器。'))
      }
    }).connect(connSettings)
  }

  sftpUpload()
}
