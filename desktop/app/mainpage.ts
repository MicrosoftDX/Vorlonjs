var os = require('os');
var ipc = require('ipc');
var $ = <JQueryStatic>require('jquery');
var app = require('remote').require('app');
var jetpack = require('fs-jetpack').cwd(app.getAppPath());
var shell = require('shell');

import config = require("./vorlon.config");
import {HomePanel} from './screens/home/app.home';
import {ConsolePanel} from './screens/console/app.console';
import {SettingsPanel} from './screens/settings/app.settings';
import {InfoPanel} from './screens/info/app.info';

var userDataPath = app.getPath('userData');
var homepanel = null, consolepanel = null, settingspanel = null, infopanel = null;
console.log(jetpack.read('package.json', 'json'));

// window.env contains data from config/env_XXX.json file.
var envName = "DEV";

interface Window {
    env : any;
} 

var env = (<any>window).env;
if (env) {
    envName = env.name;
}

document.addEventListener('DOMContentLoaded', function () {
    var panelHome = document.getElementById("panelHome");
    loadPanelContent("./screens/home/app.home.html", panelHome, function(){
        console.log("panel home loaded");
        homepanel = new HomePanel(panelHome);
        
    }).then(function(){    
        var panelConsole = document.getElementById("panelConsole");
        return loadPanelContent("./screens/console/app.console.html", panelConsole, function(){
            console.log("panel console loaded");
            consolepanel = new ConsolePanel(panelConsole);
            
        });
    }).then(function(){
        ipc.send('getVorlonStatus');
    }).then(function(){    
        var panelConfig = document.getElementById("panelConfig");
        return loadPanelContent("./screens/settings/app.settings.html", panelConfig, function(){
            console.log("panel console loaded");
            settingspanel = new SettingsPanel(panelConfig);
        });
    }).then(function(){
        var panelInfo = document.getElementById("panelInfo");
        loadPanelContent("./screens/info/app.info.html", panelInfo, function(){
            console.log("panel console loaded");
            infopanel = new InfoPanel(panelInfo);
        });
    });
    
    $("#menubar").on("click", ".icon", function(arg){
        $("#menubar .icon.selected").removeClass("selected");
        $(".panel.selected").removeClass("selected");
        var panel = $(this).attr("targetpanel");
        $(this).addClass("selected");
        $("#"+ panel).addClass("selected");
    });
    
    var cfg = config.getConfig(userDataPath);
    $(".vorlonscriptsample").text("http://" + os.hostname() + ":" + cfg.port + "/vorlon.js");
});

function loadPanelContent(url, panelElement, callback) {
    return $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
            //console.log(data);
            panelElement.innerHTML = data;
            callback(panelElement);
        },
    });
}
