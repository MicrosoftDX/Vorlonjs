'use strict';

var path = require("path");
var jetpack = require('fs-jetpack');
var vorlonConfigFile = 'vorlonconfig.json';
var sessionConfigsStoreFile = 'vorlonsessions.json';
import vorlonConfig = require("./vorlon/config/vorlon.servercontext");

var vorlonOriginalConfig = jetpack.cwd(path.join(__dirname, "vorlon")).read('config.json', 'json');

export interface ISessionsConfig {
    
}

export interface ISessionConfig {
    includeSocketIO: boolean;
    plugins : vorlonConfig.VORLON.IPluginConfig[]
}

export function getConfig(configpath : string) {
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(vorlonConfigFile, 'json');
    if (!config)
        config = JSON.parse(JSON.stringify(vorlonOriginalConfig));
      
    return config;
}

export function saveConfig(path : string, config) {
    var userDataDir = jetpack.cwd(path);    
    userDataDir.write(vorlonConfigFile, config, { atomic: true });
};

export function resetConfig(path : string){
    var userDataDir = jetpack.cwd(path);
    userDataDir.write(vorlonConfigFile, vorlonOriginalConfig, { atomic: true });
}

export function availablePlugins() : ISessionConfig{
    return JSON.parse(JSON.stringify({ includeSocketIO : vorlonOriginalConfig.includeSocketIO, plugins : vorlonOriginalConfig.plugins }));
}

export function getSessions(configpath : string) : ISessionsConfig{
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(sessionConfigsStoreFile, 'json') || {};
          
    return config;
}


export function getSessionConfig(configpath : string, sessionid : string) : ISessionConfig {
    var defaultConfig = JSON.parse(JSON.stringify({ includeSocketIO : vorlonOriginalConfig.includeSocketIO, plugins : vorlonOriginalConfig.plugins }));
    
    var userDataDir = jetpack.cwd(configpath);
    var config = userDataDir.read(sessionConfigsStoreFile, 'json');
    
    if (!config || !config[sessionid])
        return defaultConfig
    
    var sessionConfig = <ISessionConfig>config[sessionid];
    
    var retainedplugins = [];
    //merge default & stored config to ensure plugins availability
    var refplugins:vorlonConfig.VORLON.IPluginConfig[] = vorlonOriginalConfig.plugins;
    refplugins.forEach(function(plugin){
        var configured = sessionConfig.plugins.filter((p) =>{
            return p.id == plugin.id;
        })[0];
        
        if (!configured){
            retainedplugins.push(plugin);
        }else{
            retainedplugins.push(configured);
        }
    });
    sessionConfig.plugins=retainedplugins;
          
    return sessionConfig;
}

export function saveSessionConfig(path : string, sessionid : string, config: ISessionConfig) {
    var userDataDir = jetpack.cwd(path);  
    var storedconfig = userDataDir.read(sessionConfigsStoreFile, 'json') || {};
    storedconfig[sessionid] = config
      
    userDataDir.write(sessionConfigsStoreFile, storedconfig, { atomic: true });
};

export function removeSessionConfig(path : string, sessionid : string) {
    var userDataDir = jetpack.cwd(path);  
    var storedconfig = userDataDir.read(sessionConfigsStoreFile, 'json') || {};
    delete storedconfig[sessionid];
      
    userDataDir.write(sessionConfigsStoreFile, storedconfig, { atomic: true });
};