/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const async = require('async')
const path = require('path')
const del = require('del')
const Metalsmith = require('metalsmith')
const rename = require('metalsmith-rename')
const Handlebars = require('handlebars')
const render = require('consolidate').handlebars.render
const ora = require('ora')
const chalk = require('chalk')
const spawn = require('child_process').spawn

// register handlebars helper
Handlebars.registerHelper('if_eq', function(a, b, opts) {
  return a === b ?
    opts.fn(this) :
    opts.inverse(this)
})

Handlebars.registerHelper('if_contain', function(a, b, opts) {
  return (a = a || []).includes(b) ?
    opts.fn(this) :
    opts.inverse(this)
})

/**
 * Spawns a child process and runs the specified command
 * By default, runs in the CWD and inherits stdio
 * Options are the same as node's child_process.spawn
 * @param {string} cmd
 * @param {array<string>} args
 * @param {object} options
 */
const runCommand = (cmd, args, options) => {
  return new Promise((resolve, reject) => {
    const spwan = spawn(
      cmd,
      args,
      Object.assign({
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: true,
        },
        options
      )
    )
    spwan.on('error', function(err) {
      console.log(err)
      reject(err)
    });
    spwan.on('exit', () => {
      resolve()
    })
  })
}

/**
 * Template in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */
const renderTemplateFiles = () => {
  return (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metalsmithMetadata = metalsmith.metadata()
    async.each(keys, (file, next) => {
      // skipping files with skipInterpolation option

      const str = files[file].contents.toString()
      // do not attempt to render files that do not have mustaches
      if (!/{{([^{}]+)}}/g.test(str)) {
        return next()
      }
      render(str, metalsmithMetadata, (err, res) => {
        if (err) {
          err.message = `[${file}] ${err.message}`
          return next(err)
        }
        files[file].contents = new Buffer(res)
        next()
      })
    }, done)
  }
}

/**
 * filters in place plugin.
 *
 * @param {Object} files
 * @param {Metalsmith} metalsmith
 * @param {Function} done
 */
const metalsmithFilters = () => {
  return (files, metalsmith, done) => {
    const metalsmithMetadata = metalsmith.metadata()
    const fileNames = Object.keys(files)
    for (let item of metalsmithMetadata.delateFiles) {
      item = item.replace(/\//g, path.sep) //兼容window
      fileNames.forEach(file => {
        if (file.indexOf(item) > -1) {
          delete files[file]
        }
      })
    }
    done()
  }
}

const filterFiles = (prompt, filters) => {
  const evaluate = (exp, data) => {
    /* eslint-disable no-new-func */
    const fn = new Function('data', 'with (data) { return ' + exp + '}')
    try {
      return fn(data)
    } catch (e) {
      console.error(chalk.red('Error when evaluating filter condition: ' + exp))
    }
  }

  let filesTemp = []

  Object.keys(filters).forEach(glob => {
    if (!evaluate(filters[glob], prompt)) {
      filesTemp.push(glob)
    }
  })

  return filesTemp
}

module.exports = (prompt, tempPath) => {
  const delateFiles = []
  const spinner = ora('Create porject...').start()
  const projectPath = path.join(process.cwd(), prompt.projectName)
  const metalsmith = Metalsmith(path.join(tempPath, 'template'))

  Object.assign(metalsmith.metadata(), {
    name: prompt.projectName,
    lint: prompt.lint,
    pagetype: 'project',
    style: prompt.style,
    lintConfig: prompt.lintConfig,
    userModel: prompt.userModel,
    modelConfig: prompt.modelConfig,
    delateFiles: filterFiles(prompt, require(path.join(tempPath, './config')).filters)
  })

  metalsmith
    .use(renderTemplateFiles())
    .use(metalsmithFilters())

  metalsmith
    .use(
      rename([
        [/\.scss$/, `.${prompt.style}`]
      ])
    )

  metalsmith.clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(projectPath)
    .build((err, files) => {
      spinner.stop()
      if (err) {
        console.log(err)
      } else {
        del(`${projectPath}/**/.gitkeep`)
        if (prompt.autoInstall) {
          runCommand(prompt.autoInstall, ['install'], {
              cwd: projectPath
            })
            .then(() => {
              spinner.succeed(`成功创建项目:${prompt.projectName}`)
            })
        } else {
          spinner.succeed(`成功创建项目:${prompt.projectName}`)
        }
      }

    })
}
