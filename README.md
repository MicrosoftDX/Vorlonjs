# Vorlon.JS

A new, open source, extensible, platform-agnostic tool for remotely debugging and testing your JavaScript. Powered by node.js and socket.io.

Understand all about Vorlon.js in 20 minutes watching this video : https://channel9.msdn.com/Shows/codechat/046

Learn more at [VorlonJS](http://vorlonjs.com) !

![Build Status](https://jcorioland.visualstudio.com/DefaultCollection/_apis/public/build/definitions/593f5499-db9b-4e0f-ba42-fdd5d655592a/2/badge)

Chat with us on slack (get a free invite clicking on the badge below)

[![Slack Status](https://slackinvorlon.azurewebsites.net/badge.svg)](https://slackinvorlon.azurewebsites.net/)

## Deploy on Azure  
 [![Deploy to Azure](http://azuredeploy.net/deploybutton.png)](https://azuredeploy.net/)  

## Easy setup

Install and run the Vorlon.JS server from npm:

```console
$ npm i -g vorlon
$ vorlon
With the server is running, open http://localhost:1337 in your browser to see the Vorlon.JS dashboard.
```

**You may notice errors from Python, node-gyp and socket.io. This is a known issue already reported to socket.io team. This is not a blocking issue though as socket.io still works well even with this error :)**

### Custom port

[Linux]
```sh
$ PORT=3000 vorlon
```
[Windows]
```sh
c:\>SET PORT=3000 && vorlon 
```
```sh
//Vorlon listening on port 3000
```

The last step is to enable Vorlon.JS by adding this to your app:

```html
<script src="http://localhost:1337/vorlon.js"></script>
```

## SSL Support

If you want to run the server with SSL support proceed as follows:

1. Install Vorlonjs following the steps in Easy Setup
2. Navigate to the installation folder
3. Modify JSON file for activation SSL support
4. In JSON file set to true 
5. If you want to replace our localhost certificate should only change the path of the files with the private key and certificate
6. Exit and save JSON file

## SSL Support on Azure

1. Navigate to the installation folder
2. Modify JSON file for activation SSLAzure support
3. In JSON file set to true
4. Exit and save JSON file
5. Navigate with https protole on your Azure WebSite

Sample of azure hosted config.json file 
```console

{
    "baseURL": "",
    "useSSLAzure": true,
    "useSSL": false,
    "SSLkey": "cert/server.key",
    ....
    ...
}
```
## Custom log file

By default Vorlon.JS application logs with debug level and files are stored in the installation folder.
If you want to customize logs, proceed as follows :

1. Navigate to the installation folder
2. Modify JSON file, add or edit the "logs" section :
 * enableConsole : enabled logging to the console,
 * level : allowed values : info, warn, error
 * filePath : folder where log files should be store
 * vorlonLogFileName : name of Vorlon.JS log file,
 * exceptionsLogFileName : name of the log files for exceptions
3. Exit and save JSON file	

```console
[Windows]
C:\>cd %HOMEPATH%\node_modules\vorlon
C:\Users\Username\node_modules\vorlon>notepad Server/config.json

## JSON FILE ##
{
    "useSSL": true,
    "SSLkey": "server/cert/server.key",
    "SSLcert": "server/cert/server.crt",
    "includeSocketIO": true,
    "plugins": [
        { "id": "CONSOLE", "name": "Interactive Console", "panel": "bottom", "foldername" : "interactiveConsole", "enabled": true},
        { "id": "DOM", "name": "Dom Explorer", "panel": "top", "foldername" : "domExplorer", "enabled": true },
        { "id": "MODERNIZR", "name": "Modernizr","panel": "bottom", "foldername" : "modernizrReport", "enabled": true },
        { "id" : "OBJEXPLORER", "name" : "Obj. Explorer","panel": "top", "foldername" : "objectExplorer", "enabled": true },
        { "id" : "XHRPANEL", "name" : "XHR","panel": "top", "foldername" : "xhrPanel", "enabled": true },
        { "id" : "NGINSPECTOR", "name" : "ngInspector","panel": "top", "foldername" : "ngInspector", "enabled": false  }
    ],
	"logs": {
		"level" : "info",
		"enableConsole" : true,
		"filePath" : "E:\\temp",
		"vorlonLogFileName": "vorlonjs.log",
		"exceptionsLogFileName":  "exceptions.log"
    }
}

C:\Users\Username\node_modules\vorlon>vorlon
Vorlon with SSL listening on port 1337

With the server is running, open https://localhost:1337 in your browser to see the Vorlon.JS dashboard.
```

The last step is to enable Vorlon.JS by adding this to your app:

```html
<script src="https://localhost:1337/vorlon.js"></script>
```

## Documentation

Read further documentation about Vorlon.JS, and writing your own plugins at [http://vorlonjs.com/documentation](http://vorlonjs.com/documentation).

## Developing on Vorlon.JS

If you wish to work on Vorlon.JS's server or core plugin code, you'll need to clone this directory and work in it.

Vorlon is written in typescript, which is compiled with gulp. There are two main directories:

* [/Server](./Server) contains the code for the vorlon server, and the dashboard code
 * [/Server/Scripts](./Server/Scripts) contains the server and dashboard code
 * [/Server/public](./Server/public) contains the dashboard files served by express web server
* [/Plugins](./Plugins) contains the code for vorlon core, and for the plugins
 *  [/Plugins/samples](./Plugins/samples) contains the sample client web page you can use to test your dashboard
 *  [/Plugins/Vorlon](./Plugins/Vorlon) contains the client infrastructure code
 *  [/Plugins/Vorlon/plugins](./Plugins/Vorlon/plugins) contains default plugins

### Compiling from source

There is a `gulpfile.js` in the root folder of the repository. It contains gulp tasks to compile typescript to javascript for the plugins and the server. In addition it ensures that the compiled plugin code is copied in to the right place in the `Server` directory.

To compile everything (plugins, then server) run this:

```
gulp
```

To compile only plugins run this :

```
gulp default-plugins
```

To compile only server run this :

```
gulp default-server
```

### Compiling

The simplest way to run Vorlon.JS is to run `npm start` from the root directory. This will run both gulpfiles to compile typescript and start the server.

### gulp watch

You can also run the gulp commands individually. This is useful if you wish to work on plugins in particular, as `gulp watch` will compile typescript for you automatically.

If you want to run `gulp` commands from command line, you will need to first install gulp globally on your system with:

```console
$ npm install -g gulp
```

You can now run `gulp watch` in the root directory to have gulp compile typescript to javascript automatically You can also run `gulp watch-plugins` or `gulp watch-server` to only watch and compile the plugins or the server.

#### Plugin test page

There is a demo webpage that includes the vorlon code that you can open to test the dashboard behaviour. It lives at [./Plugins/samples/index.html](./Plugins/samples/index.html). There is a gulptask in the `Plugins` gulpfile to host it, just run `gulp webserver`, and then navigate to [http://localhost:1338/index.html](http://localhost:1338/index.html) to view the page.

### Visual Studio users

For Visual Studio users, we provide an integrated solution through VorlonJS.sln. In order to interact with Node.js, you just need to install the NodeJS Tool for Visual Studio [plugin](https://nodejstools.codeplex.com/).
Once the plugin is installed, just open the solution and you'll be ready to develop for Vorlon.js

### Visual Studio Code users

Visual Studio **Code** is a completly new code editor which is cross-platforms, free and light as hell ! You can do node.js debugging, there is intelliSense and so on (more about this on [Code Website](http://code.visualstudio.com)).
There also is a task workflow integration and we prepared you a [file in the repo](https://github.com/MicrosoftDX/Vorlonjs/blob/dev/.vscode/tasks.json) which contains all for you to be able to hit the Ctrl+Shift+B to run the default task in the gulp file.

### Committing & Pull Requests

Once you've made a change, you can commit and submit a pull request to this repository. You will also need to electronically sign the Microsoft Contributor License Agreement ([CLA](https://cla.microsoft.com/)) if you wish for your changes to be merged.

When committing changes, ensure that compiled JavaScript files (those compiled from TypeScript) are not committed, only the original TypeScript files should be committed.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for more info on contributing to Vorlon.JS.

## License

Vorlon.JS is released under the MIT license. Please see [LICENSE](./LICENSE) for full details.
