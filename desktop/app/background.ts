// This is main process of Electron, started as first thing when the Electron
// app starts, and running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

var app = require('app');
var ipc = require('ipc');

var childProcess = require('child_process');
var kill = require('tree-kill');
var path = require('path');

var BrowserWindow = require('browser-window');
var env = require('./scripts/env_config');
var devHelper = require('./scripts/dev_helper');
var windowStateKeeper = require('./scripts/window_state');



import vorlonhttpConfig = require("./vorlon/config/vorlon.httpconfig");
import vorlonServer = require("./vorlon/Scripts/vorlon.server");
import vorlonDashboard = require("./vorlon/Scripts/vorlon.dashboard");
import vorlonWebserver = require("./vorlon/Scripts/vorlon.webServer");
import vorlonHttpProxy = require("./vorlon/Scripts/vorlon.httpproxy.server");
import config = require("./vorlon.config");

var mainWindow;
var vorlonServerProcess = null;
var dashboardWindows = {};
var errors = [];
var messages = [];
var userDataPath = app.getPath('userData');
console.log("user data path : " + userDataPath);

// Preserver of the window size and position between app launches.
var mainWindowState = windowStateKeeper('main', {
    width: 800,
    height: 600
});

app.on('ready', function () {

    mainWindow = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height
    });

    if (mainWindowState.isMaximized) {
        mainWindow.maximize();
    }

    if (env && env.name === 'test') {
        mainWindow.loadUrl('file://' + __dirname + '/spec.html');
    } else {
        mainWindow.loadUrl('file://' + __dirname + '/mainpage.html');
    }

    if (!env || env.name !== 'production') {
        devHelper.setDevMenu();
        //mainWindow.openDevTools();
    }

    mainWindow.on('close', function () {
        mainWindowState.saveState(mainWindow);
        app.quit();
    });

    startVorlonProcess();
});

app.on('window-all-closed', function () {
    app.quit();
});

app.on('window-all-closed', function () {
    app.quit();
});

ipc.on("opendashboard", function (event, arg) {
    console.log("receive opendashboard for " + JSON.stringify(arg));
    if (arg && arg.sessionid) {
        openDashboardWindow(arg.sessionid);
    }
});

ipc.on("startVorlon", function (event, arg) {
    console.log("received startVorlon command");
    startVorlonProcess();
});

ipc.on("stopVorlon", function (event, arg) {
    console.log("received stopVorlon command");
    stopVorlonProcess();
});

ipc.on("getVorlonStatus", function (event, arg) {
    sendVorlonStatus(event, arg);
});

ipc.on("getVorlonSessions", function (event, arg) {
    if (vorlonServerProcess){
        vorlonServerProcess.send({ message: "getsessions" });
    }
});

ipc.on("updateSession", function (event, arg) {
    console.log("received updateSession", arg);
    var dashboardwindow = dashboardWindows[arg.sessionid];
    if (dashboardwindow){
        openDashboardWindow(arg.sessionid)
    }
});

function sendVorlonStatus(event?, arg?){
    var msg = {
        running : vorlonServerProcess != null,
        errors : errors,
        messages : messages
    };
    
    if (event){
        //console.log("sending status", msg);
        event.sender.send('vorlonStatus', msg);
    }else{
        //console.log("sending status to mainwindow", msg);
        mainWindow.send('vorlonStatus', msg);
    }
}

function sendLog(logs, sender?){
    var msg = {logs : logs};
    if (sender){
        sender.send('vorlonlog', msg);
    }else if (mainWindow) {
        mainWindow.send('vorlonlog', msg);
    }
}

function openDashboardWindow(sessionid) {
    sessionid = sessionid || 'default';
    
    var cfg = config.getConfig(userDataPath);
    var existing = dashboardWindows[sessionid];
    if (existing){
        existing.show();    
        existing.loadUrl('http://localhost:' + cfg.port + '/dashboard/' + sessionid);
        return ;
    }
    
    var dashboardwdw = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        "node-integration": false
    });
    
    
    console.log("create dashboard window for " + sessionid);
    //load empty page first to prevent bad window title
    dashboardwdw.loadUrl('file://' + __dirname + '/emptypage.html');
    setTimeout(function () {
        dashboardwdw.loadUrl('http://localhost:' + cfg.port + '/dashboard/' + sessionid);
        setTimeout(function () {
        dashboardwdw.setTitle("Vorlon.js - " + sessionid);
        },400);
    }, 100);

    dashboardWindows[sessionid] = dashboardwdw;
    dashboardwdw.on('close', function () {
        dashboardWindows[sessionid] = null;
    });
    
    dashboardwdw.webContents.on('did-fail-load', function(event, errorCode,  errorDescription, validateUrl){
        console.log("dashboard page error " + validateUrl + " " + errorCode + " " + errorDescription);
        dashboardwdw.loadUrl('file://' + __dirname + '/emptypage.html');
        
    });
}

function startVorlonProcess() {
    if (!vorlonServerProcess) {
        var scriptpath = path.join(__dirname, 'vorlon.js');
        console.log("starting silent " + scriptpath);
        var vorlon = childProcess.fork(scriptpath, [userDataPath], { silent: true });
        //var vorlon = childProcess.spawn('node', [scriptpath], {});
        errors = [];
        messages = [];
        
        vorlonServerProcess = vorlon;

        vorlon.on('message', function (m) {
            if (m.log){
                messages.push(m.log);
                if (m.level == "error"){
                    errors.push(m.log);
                }
                console.log.apply(null, m.log.args);
                sendLog([m.log]);
            } else if (m.session){
                console.log("session " + m.session.action, m.session.session);
                mainWindow.send("session." + m.session.action, m.session.session);
            }
            //console.log("message:", m);
        });

        vorlon.on('close', function (code, arg) {            
            console.log("VORLON CLOSED WITH CODE " + code, arg);
            stopVorlonProcess();
        });
        
        
        
        sendVorlonStatus();
    }
}

function stopVorlonProcess() {
    if (vorlonServerProcess) {
        kill(vorlonServerProcess.pid, 'SIGKILL', function () {
            vorlonServerProcess = null;
            sendVorlonStatus();
        });
    }
}
