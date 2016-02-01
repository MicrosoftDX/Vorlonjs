# Vorlon.JS

A new, open source, extensible, platform-agnostic tool for remotely debugging and testing your JavaScript. Powered by node.js and socket.io.

Understand all about Vorlon.js in 20 minutes watching this video : https://channel9.msdn.com/Shows/codechat/046

Learn more at [VorlonJS](http://vorlonjs.com).

## Vorlon.JS Node.js Wrapper

The current project makes it easy for you to debug Node.js processes using Vorlon.js.
Vorlon.js was first designed to debug web client app remotely. 
As Node.js is using JavaScript as its core language, we made it possible to use some of the Vorlon.js features in the context of a Node app.

## What is possible with this

You can remotely debug any of your node.js apps using plugins such as Object Explorer, XHR Panel and Interactive Console.
Note : Breakpoints and step by step debugging is not available yet

Full documentation available here : http://vorlonjs.io/documentation/#debugging-nodejs-applications

## How to use it 

First install it : 

``` 
npm install vorlon-node-wrapper
```

Then use it in your node app :

```
var vorlonWrapper = require("vorlon-node-wrapper");
var serverUrl = "http://localhost:1337";
var dashboardSession = "default";

//This will connect to your Vorlon.js instance (serverUrl) and download the Vorlon.node.js client file (Vorlon for node).
vorlonWrapper.start(serverUrl, dashboardSession, false);

// Your code
// ...
```