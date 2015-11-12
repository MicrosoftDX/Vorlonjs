var os = require('os');
var ipc = require('ipc');
var $ = <JQueryStatic>require('jquery');
var app = require('remote').require('app');
var shell = require('shell');
var path = require("path");
var jetpack = require('fs-jetpack');

export class InfoPanel {
	versions : { app: string, electron:string, vorlon: string };
	
	constructor(element) {		
		this.versions = jetpack.cwd(__dirname).read('../../versions.json', 'json');
		var electronversion = app.getVersion();
		console.log(electronversion);
		if (this.versions){
			$('.appversion',element).text(this.versions.app);
			$('.vorlonversion',element).text(this.versions.vorlon);
			$('.electronversion',element).text(this.versions.electron);
		}else{
			console.warn("versions file not found " + __dirname)
		}
	}
}