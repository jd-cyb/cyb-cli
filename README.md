<p align="center">
  <a href="http://cyb.jd.com" target="_blank">
    <img width="200" src="./.cyb/lib/cyb-logo.svg">
  </a>
</p>

# 塞伯坦（Cybertron）- CYB
[CYB](http://cyb.jd.com) 是面向前端模块化工程的构建工具。主要目的是帮助开发者统一前端开发模式和项目开发结构，提高功能扩展和降低维护成本，自动化前端工作流，提高开发效率和开发质量。

## CYB核心特性

### 完美支持三大技术平台

CYB支持快速创建基于Vue、React、jQuery技术平台的项目，并且很容易与其它第三方框架库集成，借助ES6/ES7的行业标准，统一开发模式和项目开发结构，简化前端开发的工作流程，帮助我们在瞬息万变、浩瀚无边的技术选型中恣意的扬帆远航。

**Vue**

CYB 支持Vue单文件组件形式的高级开发模式，结合Vue渐进式的特性和强大的模板视图层，可以最小成本改造旧应用或快速创建各种类型的新项目，加之Vue生态系统的支持，可以快速开发复杂的高性能单页或多页WEB应用程序。

**React**

CYB 支持React组件化开发模式，结合JSX赋予开发者许多的编程能力，依托Facebook的各种工具和框架，可以开发更加庞大的大型应用程序，加之同时适用于web和原生体验的React Native，可以大幅提高研发效率和降低开发成本。

**jQuery**

CYB 支持使用ES6/ES7的标准特性开发jQuery项目，jQuery庞大生态圈的众多功能强大的插件依然能够帮助我们大幅的提高研发效率、开发高质量的WEB应用。CYB可以帮助我们步入新时代的同时，继续做一个优雅高效的“jQuery美男子”。

### 功能模块化

[CYB](http://fez.hestudy.com) 支持使用[ES6 Module](http://es6.ruanyifeng.com/#docs/module)来组织前端代码，支持使用ES5/ES6/ES7等标准特性开发项目，通过[Babel](http://babeljs.cn/)编译完美运行在浏览器中。可以整合如[Vue](https://cn.vuejs.org/)、[React](https://github.com/facebook/react)等MVVM框架实现[单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html)形式的高效开发体验。

> 模块化是一种处理复杂系统分解为更好的可管理模块的方式。每个模块完成一个特定的子功能，所有的模块再进行统一的拼装和加载，成为一个整体，完成整个系统所要求的功能。
> 有关模块化的更多知识请参考：【[https://github.com/fouber/blog](https://github.com/fouber/blog)】【[https://www.zhihu.com/question/37011441](https://www.zhihu.com/question/37011441)】

### 结构规范化

[CYB](http://fez.hestudy.com) 将复杂的系统划分为功能页面(或组件)，将复杂的页面(或组件)划分为若干个模块，并且都有统一的文件结构，大大提高项目的功能扩展能力，以及项目后续的迭代维护成本。

**统一项目开发结构**

````bash
.
├── cyb.config.js
├── package.json
└── src
    ├── static
    │   ├── fonts
    │   ├── images
    │   └── styles
    │       ├── page1.scss
    │       └── page2.scss
    └── views
        ├── page1
        │   ├── index.html
        │   ├── index.js
        │   ├── service.js
        │   └── module
        │         ├── mod1
        │         │    └── index.js
        │         └── mod2
        │              └── index.js
        ├── page2
        │   ├── index.html
        │   ├── index.js
        │   └── module
        │         ├── mod1
        │         │    ├── index.js
        │         │    └── service.js
        │         └── mod2
        │              └── index.js
        │              └── service.js
        └── public
            └── module

````

### 开发自动化

> CYB 集成了大量应用场景的前端工作流程和业界先进的解决方案，并且任何机械的重复性的工作都交给CYB自动化完成，极大的提高项目的研发效率。

- 自动化创建统一结构化项目、及统一结构化的项目页面。
- 自动化搭建本地研发环境，快速响应文件更改并自动刷新浏览器。
- 自动化在开发/测试过程中同步浏览器中滚动页面、点击等行为到其他浏览器和设备中。
- 自动化编译ES6/ES7或CommonJS标准的JS代码，并生成source map便于浏览器端调试。
- 自动化编译Sass/Less/Stylus => CSS文件。
- 自动化使用Autoprefixer添加CSS3的各种浏览器前缀。
- 自动化压缩JS、CSS、HTML等静态资源。
- 自动化深度无损压缩PNG/JPG/JPEG/GIF图片。
- 自动化提取/合并第三方框架库(vendor)、项目公共代码(common)
- 自动化根据配置自定义合并前端JS、CSS文件。
- 自动化注入编译后的JS、CSS文件到HTML页面。
- 自动化ESlint编码规范、代码检查及代码测试。
- 自动化生成所有静态资源MD5版本号。
- 自动化添加所有静态资源CDN地址。
- 自动化搭建用于测试上线代码的多终端测试环境。
- 自动化通过SFTP部署上线、或部署静态资源。
- 自动化通过Mock方式构建随机数据，模拟研发和上线的数据环境。
- 自动化SVG高清图片/图标解决方案。
- 自动化移动端REM等比适配解决方案。
- 自动化智能WebP解决方案。
- 自动化页面中使用特殊字体解决方案。

## CYB安装使用

- Mac系统推荐使用 [iterm2](http://iterm2.com/) 及 [oh my zsh](http://ohmyz.sh/)
- 类 Unix 系统，请打开任意终端输入命令执行。
- Windows 用户请先安装 [git](http://git-scm.com/)，然后在 [Git Bash](http://git-for-windows.github.io/) 下执行命令

### 安装

**1. 安装 Node 和 NPM**

- 详细过程参考官网 https://nodejs.org (中文网站 http://nodejs.cn/)
- Node >= 6.11.5，建议使用最新稳定版(LTS)。
- Ubuntu 用户使用 `apt-get` 安装 node 后，安装的程序名叫 `nodejs`，需要软链成 `node`。
- Windows 用户安装完成后需要在 CMD 下确认是否能执行 node 和 npm。

> CYB不能保证所有 window系统 下默认的 Nodejs 环境都能正常运行。可以尝试安装nodejs的[windows开发工具集](https://github.com/felixrieseberg/windows-build-tools)

**2. 全局安装 CYB-CLI**

任意目录执行

```bash
npm install cyb-cli -g
```

### 使用CYB工程框架

**1. 新建项目**

```bash
cyb init
```

根据提示输入项目目录名，比如：demo-cyb，完成选择其它配置项。

```bash
demo-cyb
├── cyb.config.js            /／ CYB功能配置文件
├── package.json             /／ 项目npm配置文件
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
            └── module        /／ 公共模块目录
```

> CYB会帮助我们创建统一的项目结构，并且支持自行规划详细的模块级别的目录结构。创建项目会默认创建`index`页面。

**2. 运行项目**

进入 `demo-cyb` 项目目录 执行

```bash
cyb dev
```

> CYB 会自动打开默认浏览器进入研发环境，项目任意文件的更改都会自动刷新浏览器，请尽情享用CYB为你带来的愉悦开发体验！

## 命令说明

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

## CYB升级

- **使用npm升级**

任意目录执行

```
npm update cyb-cli -g

```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2018, 商城前台产品研发部-CYB前端小组


