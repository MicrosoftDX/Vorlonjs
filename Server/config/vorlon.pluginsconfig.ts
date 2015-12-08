import fs = require("fs");
import path = require("path");
import ctx = require("./vorlon.servercontext");

export module VORLON {
    export class PluginsConfig {
        
        public constructor() {
        }        
        
        getPluginsFor(sessionid:string, callback:(error, plugins:ctx.VORLON.ISessionPlugins) => void) {
            var configurationFile: string = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);
            
            var sessionConfig = <ctx.VORLON.ISessionPlugins>configuration.sessions[sessionid];
            
            if (!sessionConfig || !sessionConfig.plugins || !sessionConfig.plugins.length) {
                sessionConfig = {
                    includeSocketIO: configuration.includeSocketIO,
                    plugins: <ctx.VORLON.IPluginConfig[]>configuration.plugins
                };
            }
                
            if (callback)
                callback(null, sessionConfig);
        }
    }
}