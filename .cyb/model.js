// const mkdirp = require('mkdirp')
// const path = require('path')
// const ora = require('ora')
// const download = require('download-git-repo')
// const fancyLog = require('fancy-log')
// const chalk = require('chalk')
// const inquirer = require('inquirer')
// const Handlebars = require('handlebars')
// const cons = require('consolidate')
// const fs = require('fs')
// const del = require('del')
// const merge = require('webpack-merge')

// // register handlebars helper
// Handlebars.registerHelper('if_eq', function(a, b, opts) {
//   return a === b ?
//     opts.fn(this) :
//     opts.inverse(this)
// })

// Handlebars.registerHelper('if_contain', function(a, b, opts) {
//   const arr = a || []
//   return arr.includes(b) ?
//     opts.fn(this) :
//     opts.inverse(this)
// })

// const parseJson = (objStr) => {
//   return new Function("return " + objStr)()
// }

// const mergeJson = (prjectFile, modelFile, modelConfig) => {
//   return new Promise((resolve, reject) => {
//     fs.readFile(prjectFile, 'utf8', (error, fsData) => {
//       if (error) {
//         throw new Error(error)
//       }
//       cons.handlebars(modelFile, modelConfig)
//         .then((content) => {
//           const fileContent = JSON.stringify(merge(parseJson(fsData), parseJson(content)), null, 2)
//           fs.writeFile(prjectFile, fileContent, (error) => {
//             if (error) {
//               throw new Error(error)
//             }
//             fancyLog(chalk.green(`成功配置：${prjectFile}`))
//             resolve()
//           })
//         })
//         .catch((error) => {
//           if (error) {
//             throw new Error(error)
//           }
//         })
//     })
//   })
// }

// const modelInit = (answers) => {
//   return new Promise((resolve, reject) => {

//     // const packagePrjectFile = path.join(process.cwd(), './package.json')
//     // const packageModelFile = path.join(process.cwd(), `fez-template-model/template/package.json`)
//     // const babelrcPrjectFile = path.join(process.cwd(), './.babelrc')
//     // const babelrcModelFile = path.join(process.cwd(), `fez-template-model/template/.babelrc`)

//     // mergeJson(packagePrjectFile, packageModelFile, { modelConfig: answers.model })
//     // mergeJson(babelrcPrjectFile, babelrcModelFile, { modelConfig: answers.model })

//     const fezConfigFile = path.join(process.cwd(), './fez.config.js')
//     const fezConfigModelFile = path.join(process.cwd(), 'fez-template-model/template/fez.config.js')

//     fs.readFile(fezConfigFile, 'utf8', (error, fsData) => {
//       if (error) {
//         throw new Error(error)
//       }
//       const matchReg = /(module.exports =|export default) {((\s|.)*)}/

//       const fezConfigContent = (`{${fsData.match(matchReg)[2]}}`).replace(/(\/\/.*\s+)|(\/\*[\s\S]*?\*\/\s+)/g, '')


//       console.log(fezConfigContent)

//       cons.handlebars(fezConfigModelFile, { modelConfig: answers.model })
//         .then((modelData) => {



//           const fezConfigModelContent = `{${modelData.match(matchReg)[2]}}`
//           console.log(fezConfigModelContent)


//           // const mergeContent = merge.smartStrategy(mergeString(fezConfigContent))(mergeString(fezConfigModelContent), {})

//           // console.log(JSON.parse(mergeString(fezConfigModelContent)))
//           // console.log(merge.multiple((fezConfigContent),fezConfigModelContent))

//           // let mergeTemp = []

//           // Object.keys(mergeContent).forEach(function(key) {
//           //   mergeTemp.push(mergeContent[key])
//           // });
//           // console.log(mergeTemp.join(''))
//           // console.log(fsData.replace(matchReg, (match, p1) => {
//           //   return `${p1} ${mergeTemp.join('')}`
//           // }))
//           // const fileContent = JSON.stringify(merge(parseJson(fsData), parseJson(content)), null, 2)
//           // fs.writeFile(prjectFile, fileContent, (error) => {
//           //   if (error) {
//           //     throw new Error(error)
//           //   }
//           //   fancyLog(chalk.green(`成功配置：${prjectFile}`))
//           //   resolve()
//           // })
//         })
//         .catch((error) => {
//           if (error) {
//             throw new Error(error)
//           }
//         })
//     })

//   })
// }

// module.exports = () => {

//   inquirer.prompt([{
//       type: 'checkbox',
//       name: 'model',
//       message: 'Select tech platform.',
//       choices: [{
//         name: 'jQuery',
//         checked: false,
//         value: 'jquery',
//         short: 'jQuery',
//       }, {
//         name: 'Vue',
//         checked: false,
//         value: 'vue',
//         short: 'Vue',
//       }, {
//         name: 'React',
//         checked: false,
//         value: 'react',
//         short: 'React',
//       }],
//     }])
//     .then(answers => {
//       // console.log(answers)
//       return modelInit(answers)
//       // const tempPath = path.join(process.cwd(), `${answers.pageName}-tmp`)

//       // const spinner = ora('Download template from github...').start()

//       // mkdirp(tempPath, function(err) {
//       //   if (!err)
//       //     download('furic-zhao/fez-template-init', tempPath, function(error) {
//       //       if (!error) {
//       //         modelInit(answers).then(() => {
//       //           del(tempPath)
//       //         })
//       //         spinner.stop()
//       //       } else {
//       //         spinner.fail('Failed to download.')
//       //       }
//       //     })
//       // })
//     })
//     .then(() => {

//     })
//     .catch((error) => {
//       if (error) {
//         throw new Error(error)
//       }
//     })
// }
