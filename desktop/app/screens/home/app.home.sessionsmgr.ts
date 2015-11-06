var os = require('os');
var ipc = require('ipc');
var $ = <JQueryStatic>require('jquery');
var app = require('remote').require('app');
var shell = require('shell');
import config = require("../../vorlon.config");
var userDataPath = app.getPath('userData');


export class SessionsManager {
	sessions: any;
	txtAddSession: HTMLInputElement;
	btnAddSession: HTMLElement;
	btnRefreshSessions: HTMLElement;
	sessionsList: HTMLElement;
	sessionconfigpanel: HTMLElement;
	btnSaveConfig: HTMLElement;
	btnCloseConfig: HTMLElement;
	btnRemoveConfig: HTMLElement;
	currentSessionCallback : (success:boolean) => void;
	currentSessionConfig : any;
	currentSessionId : string;
	
	constructor(element) {
		var mgr = this;
		this.sessions = {};
		

		this.txtAddSession = <HTMLInputElement>element.querySelector('#txtnewsession');
		this.btnAddSession = <HTMLElement>element.querySelector('#btnAddSession');
		this.sessionsList = <HTMLElement>element.querySelector('#sessionslist');
		this.sessionconfigpanel = <HTMLElement>element.querySelector('#sessionconfigpanel');
		this.btnSaveConfig = <HTMLElement>element.querySelector('#btnSaveConfig');
		this.btnCloseConfig = <HTMLElement>element.querySelector('#btnCloseConfig');
		this.btnRemoveConfig = <HTMLElement>element.querySelector('#btnRemoveConfig');

		ipc.on("session.init", function(args) {
			console.log("init sessions", args);
			mgr.sessionsList.innerHTML = '';
			mgr.sessions = {};
			var sessions = [];
			var sessionsKeys = {}
			args.forEach(function(session) {
				sessions.push(session);
				sessionsKeys[session.sessionId] = true;
			});

			var storedsessions = config.getSessions(userDataPath);
			for (var n in storedsessions) {
				if (!sessionsKeys[n]) {
					sessions.push({
						sessionId: n,
						nbClients: -1
					});
				}
			}

			sessions.sort(function(a, b) {
				return a.sessionId.localeCompare(b.sessionId);
			});

			sessions.forEach(function(session) {
				mgr.addSession(session);
				mgr.updateSession(session);
			});
		});

		ipc.on("session.added", function(args) {
			mgr.addSession(args);
			mgr.updateSession(args);
		});

		ipc.on("session.removed", function(args) {
			mgr.removeSession(args);
		});

		ipc.on("session.updated", function(args) {
			mgr.updateSession(args);
		});

		mgr.refresh();

		this.btnCloseConfig.onclick = function() {
			mgr.closeConfig(false);
		}

		this.btnSaveConfig.onclick = function() {
			mgr.saveConfig();
		}

		this.btnRemoveConfig.onclick = function() {
			mgr.removeConfig();
		}
		
		this.btnRefreshSessions = <HTMLElement>element.querySelector('#btnRefreshSessions');
        this.btnRefreshSessions.onclick = function() {
            mgr.refresh();
        }

		this.btnAddSession.onclick = function() {
			var sessionid = mgr.txtAddSession.value;
			if (sessionid && sessionid.length > 2) {
				var session = {
					sessionId: sessionid,
					nbClients: -1
				};
				mgr.sessions[sessionid] = session;
				mgr.showConfig(session);
				mgr.currentSessionCallback = function(success) {
					if (!success) {
						delete mgr.sessions[sessionid];
					}

					mgr.refresh();
				}
			}
		}
	}

	refresh() {
		this.sessionsList.innerHTML = "";
		ipc.send("getVorlonSessions");
	}

	addSession(session) {
		
		var mgr = this;
		var existing = mgr.sessions[session.sessionId];
		if (existing) {
			return;
		}

		var elt = document.createElement("DIV");
		elt.className = "session-item";
		elt.innerHTML = '<div class="status status-down"></div><div class="title">' + session.sessionId + '</div><div class="clientcount"></div>' +
		'<div class="opendashboard dripicon dripicon-export"></div>' +
		'<div class="opensettings dripicon dripicon-gear"></div>';
		//'<div class="bloatsession dripicon dripicon-trash"></div>';
	
		mgr.sessionsList.appendChild(elt);
		mgr.sessions[session.sessionId] = {
			element: elt,
			session: session
		};

		var opendashboard = <HTMLElement>elt.querySelector('.opendashboard');
		opendashboard.onclick = function() {
			ipc.send("opendashboard", { sessionid: session.sessionId });
		}

		var openconfig = <HTMLElement>elt.querySelector('.opensettings');
		openconfig.onclick = function() {
			mgr.showConfig(mgr.sessions[session.sessionId].session);
		}
	}

	removeSession(session) {
		var mgr = this;
		var existingsession = mgr.sessions[session.sessionId];
		if (existingsession) {
			existingsession.session.nbClients = -1;
		}
		mgr.updateSession(existingsession.session);
	}

	updateSession(session) {
		var mgr = this;
		var existingsession = mgr.sessions[session.sessionId];
		if (!existingsession) {
			mgr.addSession(existingsession);
		}
		existingsession.session = session;
		var clientCountElt = existingsession.element.querySelector('.clientcount');
		var statusElt = existingsession.element.querySelector('.status');
		console.log(session.nbClients + " clients for " + session.sessionId)
		if (session.nbClients >= 0) {
			clientCountElt.innerText = (session.nbClients + 1);
			clientCountElt.style.display = '';
			statusElt.classList.remove('status-down');
			statusElt.classList.add('status-up');
		} else {
			clientCountElt.style.display = 'none';
			statusElt.classList.add('status-down');
			statusElt.classList.remove('status-up');
		}
	}

	showConfig(session) {
		var mgr = this;
		mgr.sessionconfigpanel.classList.remove('away');
		$('.sessionname', mgr.sessionconfigpanel).text(session.sessionId);
		var pluginscontainer = <HTMLElement>mgr.sessionconfigpanel.querySelector('#sessionsplugins');
		pluginscontainer.innerHTML = '';

		var pluginsConfig = config.getSessionConfig(userDataPath, session.sessionId);
	
		// pluginsConfig.plugins.sort(function (a, b) {
		// 	return a.name.localeCompare(b.name);
		// });
	
		mgr.currentSessionConfig = pluginsConfig;
		mgr.currentSessionId = session.sessionId;

		var includeSocketIO = <HTMLInputElement>mgr.sessionconfigpanel.querySelector('#includeSocketIO');
		includeSocketIO.checked = pluginsConfig.includeSocketIO;
		includeSocketIO.onchange = function() {
			pluginsConfig.includeSocketIO = includeSocketIO.checked;
		};

		pluginsConfig.plugins.forEach(function(plugin) {
			var e = document.createElement('DIV');
			e.className = "plugin-config";

			e.innerHTML = '<input type="checkbox" id="' + plugin.id + '" ' + (plugin.enabled ? "checked" : "") + ' /><label for="' + plugin.id + '">' + plugin.name + '</div>';
			var input = <HTMLInputElement>e.querySelector("input");
			input.onchange = function() {
				plugin.enabled = input.checked;
			};
			pluginscontainer.appendChild(e);
		});
	}

	closeConfig(success) {
		var mgr = this;
		mgr.sessionconfigpanel.classList.add('away');
		if (mgr.currentSessionCallback) {
			mgr.currentSessionCallback(success);
		}
		mgr.currentSessionConfig = null;
		mgr.currentSessionId = null;
		mgr.currentSessionCallback = null;
	}


	saveConfig() {
		var mgr = this;
		console.log(mgr.currentSessionConfig);
		mgr.sessions[mgr.currentSessionId].fromConfig = true;
		config.saveSessionConfig(userDataPath, mgr.currentSessionId, mgr.currentSessionConfig);
		mgr.closeConfig(true);
		ipc.send("updateSession", { sessionid: mgr.currentSessionId });
	}

	removeConfig() {
		var mgr = this;
		if (confirm("Do you really want to remove configuration for " + mgr.currentSessionId)) {
			mgr.sessions[mgr.currentSessionId].fromConfig = false;
			config.removeSessionConfig(userDataPath, mgr.currentSessionId);
			mgr.closeConfig(false);
			ipc.send("updateSession", { sessionid: mgr.currentSessionId });
			mgr.refresh();
		}
	}
}