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
            
            try{
                var sessionConfig = <ctx.VORLON.ISessionPlugins>configuration.sessions[sessionid];
            }
            catch(e){
                if (!sessionConfig || !sessionConfig.plugins || !sessionConfig.plugins.length) {
                    sessionConfig = {
                        includeSocketIO: configuration.includeSocketIO || true,
                        plugins: <ctx.VORLON.IPluginConfig[]>configuration.plugins
                    };
                }
            }
                
            if (callback)
                callback(null, sessionConfig);
        }
        
        setPluginState(pluginid:string, callback:(error) => void) {
            var configurationFile: string = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);
            
            for (var i = 0; i < configuration.plugins.length; i++) {
                if (configuration.plugins[i].id == pluginid) {
                    configuration.plugins[i].enabled = !configuration.plugins[i].enabled;
                    fs.writeFileSync(path.join(__dirname, "../config.json"), JSON.stringify(configuration, null, 4) ,"utf8");
                    return callback(null);
                }
            }
            
            return callback(true);
        }
        
        setPluginName(pluginid:string, name:string, callback:(error) => void) {
            var configurationFile: string = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);
            
            if(!name) {
                return callback(true);
            }
            
            for (var i = 0; i < configuration.plugins.length; i++) {
                if (configuration.plugins[i].id == pluginid) {
                    configuration.plugins[i].name = name;
                    fs.writeFileSync(path.join(__dirname, "../config.json"), JSON.stringify(configuration, null, 4) ,"utf8");
                    return callback(null);
                }
            }
            
            return callback(true);
        }
    }
}