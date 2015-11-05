var os = require('os');
var ipc = require('ipc');
var $ = <JQueryStatic>require('jquery');
var app = require('remote').require('app');

import config = require("../../vorlon.config");
var userDataPath = app.getPath('userData');

export class SettingsPanel {
	element: HTMLElement;
	vorlonPort: HTMLInputElement;
	vorlonProxyPort: HTMLInputElement;
	btnSaveConfig: HTMLElement;
	btnCancelConfig: HTMLElement;
	btnResetConfig: HTMLElement;
	vorlonscriptsample: HTMLElement;
	cfg : { port: string, proxyPort: string };
	
	constructor(element) {
		var panel = this;
		this.element = element;
		this.vorlonPort = <HTMLInputElement>element.querySelector("#vorlonPort");
		this.vorlonProxyPort = <HTMLInputElement>element.querySelector("#vorlonProxyPort");
		this.btnSaveConfig = <HTMLElement>element.querySelector("#btnSaveConfig");
		this.btnCancelConfig = <HTMLElement>element.querySelector("#btnCancelConfig");
		this.btnResetConfig = <HTMLElement>element.querySelector("#btnResetConfig");
		this.vorlonscriptsample = <HTMLElement>element.querySelector("#vorlonscriptsample");

		this.loadConfig();

		this.btnResetConfig.onclick = function() {
			ipc.send("stopVorlon");

			config.resetConfig(userDataPath);

			setTimeout(function() {
				ipc.send("startVorlon");
				panel.configChanged();
			}, 1000);
		}

		this.btnSaveConfig.onclick = function() {
			ipc.send("stopVorlon");

			panel.cfg.port = panel.vorlonPort.value;
			panel.cfg.proxyPort = panel.vorlonProxyPort.value;

			config.saveConfig(userDataPath, panel.cfg);
			setTimeout(function() {
				ipc.send("startVorlon");
				panel.configChanged();
			}, 1000);
		}

		this.btnCancelConfig.onclick = function() {
			panel.loadConfig();
		}
	}

	configChanged() {
		ipc.send("configChanged");
		this.loadConfig();
	}

	loadConfig() {
		console.log("load config from " + userDataPath);
		this.cfg = config.getConfig(userDataPath);

		this.vorlonPort.value = this.cfg.port;
		this.vorlonProxyPort.value = this.cfg.proxyPort;

		$(".vorlonscriptsample").text("http://" + os.hostname() + ":" + this.cfg.port + "/vorlon.js");
	}

}
