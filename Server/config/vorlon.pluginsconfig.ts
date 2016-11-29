import fs = require("fs");
import path = require("path");
import ctx = require("./vorlon.servercontext");
import config = require("./vorlon.configprovider");

export module VORLON {
    export class PluginsConfig {

        public constructor() {
        }

        getPluginsFor(sessionid:string, callback:(error, plugins:ctx.VORLON.ISessionPlugins) => void) {
            var configurationFile: string = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath(), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);

            try{
                var sessionConfig = <ctx.VORLON.ISessionPlugins>configuration.sessions[sessionid];
            }
            catch(e){
                if (!sessionConfig || !sessionConfig.plugins || !sessionConfig.plugins.length) {
                    sessionConfig = {
                        includeSocketIO: (configuration.includeSocketIO != undefined) ? configuration.includeSocketIO : true,
                        plugins: <ctx.VORLON.IPluginConfig[]>configuration.plugins
                    };
                }
            }

            if (callback)
                callback(null, sessionConfig);
        }

        setPluginState(pluginid:string, callback:(error) => void) {
            var configurationFile: string = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath(), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);

            for (var i = 0; i < configuration.plugins.length; i++) {
                if (configuration.plugins[i].id == pluginid) {
                    configuration.plugins[i].enabled = !configuration.plugins[i].enabled;
                    fs.writeFileSync(config.VORLON.ConfigProvider.getConfigPath(), JSON.stringify(configuration, null, 4) ,"utf8");
                    return callback(null);
                }
            }

            return callback('PluginID unknown');
        }

        setPluginName(pluginid:string, name:string, callback:(error) => void) {
            var configurationFile: string = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath(), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);

            if(!name) {
                return callback(true);
            }

            for (var i = 0; i < configuration.plugins.length; i++) {
                if (configuration.plugins[i].id == pluginid) {
                    configuration.plugins[i].name = name;
                    fs.writeFileSync(config.VORLON.ConfigProvider.getConfigPath(), JSON.stringify(configuration, null, 4) ,"utf8");
                    return callback(null);
                }
            }

            return callback('PluginID unknown');
        }

        setPluginPanel(pluginid:string, panel:string, callback:(error) => void) {
            var configurationFile: string = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath(), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);
            var panelPosible = ['top', 'bottom'];
            if(!panel) {
                return callback('Panel must be defined');
            }

            if (panelPosible.indexOf(panel) == -1) {
                return callback('Panel wrong value');
            }

            for (var i = 0; i < configuration.plugins.length; i++) {
                if (configuration.plugins[i].id == pluginid) {
                    configuration.plugins[i].panel = panel;
                    fs.writeFileSync(config.VORLON.ConfigProvider.getConfigPath(), JSON.stringify(configuration, null, 4) ,"utf8");
                    return callback(null);
                }
            }

            return callback('PluginID unknown');
        }

        setPluginsPosition(positions:any, callback:(error) => void) {
            var configurationFile: string = fs.readFileSync(config.VORLON.ConfigProvider.getConfigPath(), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);

            if(!positions) {
                return callback('Positions must be defined');
            }

            positions = JSON.parse(positions);
            var lookup = {};
            var plugins_reorganised = [];

            for (var i = 0; i < configuration.plugins.length; i++) {
                lookup[configuration.plugins[i].id] = configuration.plugins[i];
            }

            for (var i = 0; i < positions.length; i++) {
                plugins_reorganised.push(lookup[positions[i]]);
            }

            configuration.plugins = plugins_reorganised;

            fs.writeFileSync(config.VORLON.ConfigProvider.getConfigPath(), JSON.stringify(configuration, null, 4) ,"utf8");


            return callback('PluginID unknown');
        }
    }
}
