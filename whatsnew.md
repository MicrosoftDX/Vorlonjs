## 0.5.4
- Plugins
	- Bot Framework Inspector 
		- Fixes on UI
- Vorlon behind proxy
	- Fixing Socket.io when Vorlon.js is behind a proxy and BaseUrl is configured


## 0.5.0
- Plugins
	- Bot Framework Inspector 
		- Plugin creation
		- Helps you inspect and debug bot created in Node.js using Bot Builder (https://github.com/Microsoft/BotBuilder)
		- Features: Get dialogs list, See live dialog stacks and events, live graph showing path in the bot.
- Various fixes and improvements
	- Add support for listening with host 0.0.0.0 (https://github.com/kkeybbs)
	- Dashboard working correctly if baseUrl is set in config file  (https://github.com/mboelter)
	- Add missing baseURL inside templates and dashboard config (https://github.com/xiaodoudou)

## 0.4.0
- Plugins
	- Dom Timeline
		- New plugin to record history of dom changes
		- Article available here : https://meulta.com/en/?p=208
		- Credit : @FremyCompany
	- Configuration
		- You can now provide a --config flag at startup to use another config file
	- Various fixes and improvements
		- Various refactoring
		- Fixing version of socket.io to avoid security issues


## 0.3.0
- Plugins
	- Node.js sample:
		- New sample using Express with landing page and buttons to simulate express routes
	- Express.js plugin :
		- Displays information about an Express app connected to Vorlon.js
		- Routes and objects are available
		- A new entry appears each time a route is hit via a request
	- Node.js plugin :
		- Generic node.js debugging plugin
		- Displays env variables and their values
		- There is a graph connected to memory usage
		- List for modules required inside the app
	- Various fixes and improvements
		- Fix a bug that made safari remote debug impossible
		- Various refactoring
		- Fixing errors in gulp file
		- Accessibility improvements
		- Adding support for identify in node.js debugging
		- Fixed a bug that made express with static files crashes when debugging using vorlon
		- Fixed ssl support
	

## 0.2.2
- Plugins
	- Interactive Console :
		- Displays log in correct order
	- Office addin
		- Allows you to debug office addin (they are done using web tech) : http://i1.blogs.msdn.com/b/mim/archive/2016/02/18/vorlonjs-plugin-for-debugging-office-addin.aspx
	- UWP Plugin 
		- Allows you to debug Universal windows apps dev in JavaScript
	- Various fixes and improvements
		- Fix bug when activating authentication
		- Moved to Gulp 3.9.1
		- Added vorlon.js version on the bottom left of the dashboard
	- Azure deploy
		- Fix dependencies in AzureDeploy.json
	- General
		- Added a https link to download vorlon desktop on vorlonjs.io website
		- Added a build success badge on vorlon.js website
		

## 0.2.0

- Plugins
	- XhrPanel: changing hook to go over prototype for node.js implementation
	- Best practices: 
		- integration with aXe rules for accessibility : http://www.deque.com/products/aXe/
		- Moved all code to client side
	- Updated Modernizr plugin to support modernizr 3.0
	- Various bug fixes and improvements
		- Removed redis dependency
		- Moved to socket.io 1.4+
		- Tons of small fixes all around the place
    - DOM Explorer
        - Click on an absolute uri by holding the ctrl key will display its content into another tab. Hover is effective too.
- Core
	- Added node.js remote debug support. Now plugins can be flagged with nodeCompliant = true
- Dashboard
	- Stability improvements
- Vorlon Desktop   
	- First release of this new way to deploy vorlon without having to use NPM command line
	- Read mode here: http://vorlonjs.io/#vorlon-desktop
- General
	- Generation of source maps file to allow debugging using TypeScript files
	- Adding features around DevOps: http://blogs.technet.com/b/devops/archive/2016/01/12/vorlonjs-a-journey-to-devops-introducing-the-blog-post-series.aspx
	- One gulp to rule them all: You now only have to run gulp watch from the root folder to track and compile any change
	- Moved samples to /client samples. Added sample for node.js remote debugging

## 0.1.0

- Plugins
	- Object explorer was revamped for better integration
	- New device plugin: Know your numbers!
	- New (Q)Unit test plugin
	- Wappalyzer plugin (3rd party)
	- DOM Explorer: display all html nodes (head and body, instead of body only) in domExplorer, improve UI of search, update css, select DOM in client (target button)
	- Best practices: analyze your website to discover how you can improve your code
- Core
	- --version now return the current version
	- Custom log path and log level
	- Code revamping
	- Performances improvements
- Dashboard
	- Stability improvements
	- Reload button to refresh the client
- HTTP Proxy: inject vorlon.js javascript file without modifying the client you are testing
- General
	- Added server authentication
	- Single click to deploy on Azure

## 0.0.15

- Plugins
    - Plugins are now split into 2 files (client and dashboard)
	- New plugins: 
		- XHR Panel to track xhr calls
		- Network Monitor to render performances data
		- Resources Explorer to display local/session storage and cookies variables
		- ngInspector to analyze your Angular's scopes
	- Add envelope and commands for messages between dashboard and client
	- New control bar component available for plugins
	- Moving all CSS to LESS
	- Huge improvements for DOM Explorer
		- Loaded on demand
		- Direct inner text edit
		- Attributes display and edit
		- Hover coloration
		- Edit content as HTML
		- right click context menu on DOM node (with shortcuts to attribute, HTML edit, ...)
		- settings panel to define behavior
		- search nodes by CSS selectors
		- refresh through MutationObserver, if available in client browser
		- view layout info (margin, padding, size)
		- computed styles panel 
	- Improvements on console plugin
		- history for commands
		- support for logging objects and console.dir
		- filtering on console entries
		- support for window.onerror
	- Moving catalog.json to /server/config.json
	- Adding a '+' tab to go to the plugins documentation on the website
- Core
	- New option to remove socket.io from vorlon.js in catalog.json file
	- Simplified plugin description in catalog.json file
- Bugs
	- Fixing bug preventing tab between plugins
- Repo
	- Adding a plugins library for 3rd party plugins
