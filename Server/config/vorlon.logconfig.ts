import fs = require("fs");
import path = require("path");

export module VORLON {
    export class LogConfig {
        public vorlonLogFile: string;
        public exceptionsLogFile: string;
        public enableConsole: boolean;
        public level: string;

        public constructor() {
            var configurationFile: string = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var configurationString = configurationFile.toString().replace(/^\uFEFF/, '');
            var configuration = JSON.parse(configurationString);
            if (configuration.logs) {
                var logConfig = configuration.logs;
                var filePath = logConfig.filePath ? logConfig.filePath : path.join(__dirname, "../");
                var vorlonjsFile = logConfig.vorlonLogFileName ? logConfig.vorlonLogFileName : "vorlonjs.log";
                var exceptionFile = logConfig.exceptionsLogFileName ? logConfig.exceptionsLogFileName : "exceptions.log";

                this.vorlonLogFile = path.join(filePath, vorlonjsFile);
                this.exceptionsLogFile = path.join(filePath, exceptionFile);
                this.enableConsole = logConfig.enableConsole;
                this.level = logConfig.level ? logConfig.level : "info";
            }
            else {
                this.vorlonLogFile = path.join(__dirname, "../vorlonjs.log");
                this.exceptionsLogFile = path.join(__dirname, "../exceptions.log");
                this.enableConsole = true;
                this.level = "debug";
            }
        }
    }
}