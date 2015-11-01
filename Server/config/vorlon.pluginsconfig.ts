import fs = require("fs");
import path = require("path");
import ctx = require("./vorlon.servercontext");

export module VORLON {
    export class PluginsConfig {
        plugins : ctx.VORLON.ISessionPlugins;
        public includeSocketIO : boolean;
        public constructor() {
            var configurationFile: string = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);
            this.plugins = {
                includeSocketIO : configuration.includeSocketIO,
                plugins : <ctx.VORLON.IPluginConfig[]>configuration.plugins
            }
        }        
        
        getPluginsFor(sessionid:string, callback:(error, plugins:ctx.VORLON.ISessionPlugins) => void) {
            if (callback)
                callback(null, this.plugins);
        }
    }
}