require('babel-register')({
  babelrc: false,
  presets: ['env']
})
const path = require('path')
const proxy = require('http-proxy-middleware')
const assert = require('assert')
const fs = require('fs')
const babel = require("babel-core");

const configFile = path.join(process.cwd(), 'cyb.config.mock.js');

function getConfig() {
  if (fs.existsSync(configFile)) {
    return require(configFile).default || require(configFile);
  } else {
    return {};
  }
}

function parseKey(key) {
  let method = 'get';
  let path = key;

  if (key.indexOf(' ') > -1) {
    const splited = key.split(' ');
    method = splited[0].toLowerCase();
    path = splited[1];
  }

  return { method, path };
}

function mockHandler(method, path, value) {
  return function mockHandler(...args) {
    const res = args[1];
    if (typeof value === 'function') {
      value(...args);
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(value));
    }
  };
}

let mockMiddleware = []

function mockMiddle(devServer) {
  const config = getConfig();

  Object.keys(config).forEach(key => {
    const keyParsed = parseKey(key);
    if (typeof config[key] === 'string') {

      mockMiddleware.push({
        route: keyParsed.path,
        handle: function(req, res, next) {
          res.writeHeader(200, { 'Content-Type': 'text/html' })
          res.write(config[key])
          res.end()
        }
      })
    } else {
      mockMiddleware.push({
        route: keyParsed.path,
        handle: mockHandler(keyParsed.method, keyParsed.path, config[key])
      })
    }
  });
  // console.log(mockMiddleware)
  return mockMiddleware
}

module.exports = mockMiddle
