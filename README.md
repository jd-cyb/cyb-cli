<p align="center">
  <a href="http://cyb.jd.com" target="_blank">
    <img width="200" src="./.cyb/lib/cyb-logo.png">
  </a>
  <br>
  <br>
  <img src="https://img.shields.io/npm/v/cyb-cli.svg" alt="npm-version">
  <br>
  <br>
  <img src="https://img.shields.io/npm/dm/cyb-cli.svg" alt="download-num">
  <img src="https://img.shields.io/badge/node-%3E=6.11.5-brightgreen.svg" alt="node">
  <img src="https://img.shields.io/npm/l/cyb-cli.svg" alt="license">
  <img src="https://img.shields.io/badge/platform-MacOS%7CLinux%7CWindow-lightgrey.svg" alt="platform">
  <br>
</p>

<h1 align="center">塞伯坦（Cybertron）- CYB</h1>
塞伯坦（CYB）是面向前端模块化工程的构建工具。主要目的是帮助开发者统一前端开发模式和项目开发结构，提高功能扩展和降低维护成本，自动化前端工作流，提高开发效率和开发质量。

<h2 align="center">安装和使用</h2>

- Mac系统推荐使用 [iterm2](http://iterm2.com/) 及 [oh my zsh](http://ohmyz.sh/)。
- 类 Unix 系统，请打开任意终端输入命令执行。
- Windows 用户请先安装 [git](http://git-scm.com/)，然后在 [Git Bash](http://git-for-windows.github.io/) 下执行命令。

### 安装

**1. 安装 Node 和 NPM**

- 官网下载安装Node: [https://nodejs.org](https://nodejs.org)。
- 需要Node >= 6.11.5，建议使用最新稳定版(LTS)。
- Ubuntu 用户使用 `apt-get` 安装 node 后，安装的程序名叫 `nodejs`，需要软链成 `node`。
- Windows 用户安装完成后需要在 CMD 下确认是否能执行 node 和 npm。

> 设置 `npm config set loglevel=http` 可以查看npm包的下载和安装进度。

**2. 全局安装 CYB-CLI**

使用npm安装

```bash
npm install -g cyb-cli
```

使用yarn安装

```
yarn global add cyb-cli
```

> 某些window系统若不能正常安装CYB，请使用管理员身份先安装[windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)。

### 使用

**1. 新建项目**

```bash
cyb init
```

根据提示输入项目目录名，比如：demo-cyb，根据提示完成配置项。

```bash
demo-cyb
├── cyb.config.js            /／ CYB功能配置文件
├── package.json             /／ 项目npm配置文件
├── .babelrc                 /／ babel配置文件
├── .editorconfig            /／ 编码风格配置文件
├── .eslintrc.js             /／ eslint配置文件（可选）
├── webpack.config.js        /／ webpack配置文件（可选）
└── src                      /／ 源码目录
    ├── static               /／ 静态资源目录
    │   ├── fonts            /／ 字体目录
    │   ├── images           /／ 图片目录
    │   └── styles           /／ 样式目录
    │       └── index.scss   /／ 首页样式文件
    └── views                /／ 业务逻辑存放目录
        ├── index            /／ 首页目录
        │   ├── index.html   /／ 首页Html文件
        │   ├── index.js     /／ 首页业务逻辑脚本文件
        │   └── module       /／ 首页模块目录
        └── public           /／ 业务逻辑公共文件目录
            └── module       /／ 公共模块目录
```

> CYB会帮助我们创建统一的项目结构，并且支持自行规划详细的模块级别的目录结构。创建项目会默认创建`index`页面。

**2. 运行及开发项目**

进入 `demo-cyb` 项目目录 执行

```bash
cyb dev
```

> CYB 会自动打开默认浏览器进入研发环境，项目任意文件的更改都会自动更新浏览器页面，请尽情享用CYB为你带来高效、愉悦的开发体验！

<h2 align="center">命令说明</h2>

- **创建新项目**

```bash
cyb init
```

> 快速创建统一结构化项目，包括默认创建首页html模板、统一规划JS脚本、样式文件、图片/字体等静态资源的存放目录。创建项目时可以选择Vue、React、jQuery技术平台。

- **创建新页面**

```bash
cyb page
```

> 快速创建统一结构化页面，包括创建页面的html模板，对应的脚本文件和样式文件。支持传统的页面资源部署，或者一切皆模块的组件化部署，更加方便的开发多页面应用。

- **研发环境**

```bash
cyb dev
```

> 在本地构建Node开发服务器，脱离nginx、apache等后台服务的依赖，实时编译前端的各种资源，并且在开发过程中任何文件的更改，都会自动更新浏览器界面，实时查看修改效果。

- **生产发布**

```bash
cyb dist
```

> 编译和处理源码目录中的所有源文件，通过智能提取、合并压缩、添加CDN前缀、生成md5版本号等自动化流程，并将编译成功后的所有上线文件发布到dist目录。

- **本地测试dist目录**

```bash
cyb test
```

> 在本地构建Node测试服务器，读取dist目录中的代码，借助前后端分离的API请求模式，无需发布上线，即可在本地打开浏览器测试上线代码和所有业务逻辑。

- **打包压缩dist目录**

```bash
cyb zip
```

> 读取dist目录中所有的代码，在项目根目录下打包压缩成dist.zip文件，用于通过其它途径、或流程工具将代码发布到线上服务器，或发送给客户、领导、合作伙伴验收。

- **特殊字体解决方案**

```bash
cyb fontmin
```

> 根据设置的文本抽取大文件TTF的字体信息，转换为eot/woff/ttf等格式的网页字体，告别特殊字体做成图片的lower，帮助我们开发完美个性化的官方网站、活动专题等项目。

- **图片深度无损压缩解决方案**

```bash
cyb imagemin
```

> 对整站或单个图片深度无损压缩，整合业界前沿的程序算法，压缩率达50%以上，并且几乎看不出质量差别，极致的图片性能优化，帮助我们开发拥有极致用户体验的产品。

- **SSH上线部署或部署静态资源**

```bash
cyb sftp
```

> 快速部署上线代码，根据配置的SSH服务器信息，读取dist目录中的所有代码，通过SFTP快速发布代码到线上服务器或测试服务器，可以配置仅部署静态资源到CDN服务器。

<h2 align="center">升级</h2>

- **使用npm升级**

```
npm update -g cyb-cli
```

- **使用yarn升级**

```
yarn global upgrade cyb-cli
```

<h2 align="center">相关说明及使用文档</h2>

WIKI:[https://github.com/jd-cyb/cyb-cli/wiki](https://github.com/jd-cyb/cyb-cli/wiki)

<h2 align="center">License</h2>

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018, 京东商城-基础平台研发部-CYB前端小组


