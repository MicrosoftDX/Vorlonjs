## 0.0.16

- Plugins
	- Object explorer was revamped for better integration
	- New device plugin: Know your numbers!
	- New (Q)Unit test plugin
	- Wappalyzer plugin (3rd party)
	- DOM Explorer: display all html nodes (head and body, instead of body only) in domExplorer, improve UI of search, update css 
- Core
	- --version now return the current version
	- Custom log path and log level

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
