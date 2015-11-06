var os = require('os');
var ipc = require('ipc');
var $ = <JQueryStatic>require('jquery');
var app = require('remote').require('app');
var shell = require('shell');
var config = require("../../vorlon.config");
var SessionsManager = require("./app.home.sessionsmgr").SessionsManager;
var userDataPath = app.getPath('userData');

export class HomePanel {
    statusText: HTMLElement;
    btnStart: HTMLElement;
    btnStop: HTMLElement;
    
    constructor(element) {
        var panel = this;
        var sessionspanel = <HTMLElement>document.getElementById('sessionspanel');
        var sessionsManager = new SessionsManager(sessionspanel);

        var btnopendashboard = <HTMLElement>document.getElementById('btnopendashboard');
        var txtSessionId = <HTMLInputElement>document.getElementById('vorlonsessionid');
        txtSessionId.onkeypress = function(e) {
            var key = e.which ? e.which : e.keyCode;
            if (key == 13) {
                txtSessionId.blur();
                e.preventDefault();
                e.stopPropagation();
                btnopendashboard.focus();
                btnopendashboard.click();
            }
        };

        btnopendashboard.onclick = function() {
            var sessionid = txtSessionId.value;
            if (sessionid && sessionid.length) {
                console.log("send command opendashboard " + sessionid);
                ipc.send("opendashboard", { sessionid: sessionid });
            }
        };

        var txtProxyTarget = <HTMLInputElement>document.getElementById('vorlonproxytarget');
        var btnopenproxy = <HTMLElement>document.getElementById('btnopenproxy');
        txtProxyTarget.onkeypress = function(e) {
            var key = e.which ? e.which : e.keyCode;
            if (key == 13) {
                txtProxyTarget.blur();
                e.preventDefault();
                e.stopPropagation();
                btnopenproxy.focus();
                btnopenproxy.click();
            }
        };

        btnopenproxy.onclick = function() {
            var targeturl = txtProxyTarget.value;
            if (targeturl && targeturl.length) {
                if (!(targeturl.indexOf("http://") == 0 || targeturl.indexOf("https://") == 0)) {
                    txtProxyTarget.value = "http://" + targeturl;
                    targeturl = txtProxyTarget.value;
                }
                console.log("request data for proxying " + targeturl);
                getProxyData(targeturl, function(data) {
                    //console.log(data);
                    if (data) {
                        ipc.send("opendashboard", { sessionid: data.session });
                        setTimeout(function() {
                            shell.openExternal(data.url);
                        }, 500);
                    }
                });
            }
        };

        this.statusText = <HTMLElement>document.getElementById('vorlonServerStatus');

        this.btnStart = <HTMLElement>document.getElementById('btnStartServer');
        this.btnStart.onclick = function() {
            ipc.send("startVorlon");
        }

        this.btnStop = <HTMLElement>document.getElementById('btnStopServer');
        this.btnStop.onclick = function() {
            ipc.send("stopVorlon");
        }
        

        ipc.on("vorlonStatus", function(args) {
            var cfg = config.getConfig(userDataPath);
            console.log("receive status", args);
            if (panel.statusText) {
                if (args.running) {
                    panel.statusText.innerHTML = "VORLON server is running on port " + cfg.port;
                    panel.btnStart.style.display = "none";
                    panel.btnStop.style.display = "";
                } else {
                    panel.statusText.innerHTML = "VORLON server is NOT running";
                    panel.btnStart.style.display = "";
                    panel.btnStop.style.display = "none";
                }
            }
        });
    }
}


function getProxyData(targeturl, callback) {
    var cfg = config.getConfig(userDataPath);
    var callurl = "http://localhost:" + cfg.port + "/httpproxy/inject?url=" + encodeURIComponent(targeturl) + "&ts=" + new Date();

    $.ajax({
        type: "GET",
        url: callurl,
        success: function(data) {
            console.log('proxy targets');
            console.log(data);
            callback(JSON.parse(data));
        },
    });
}
