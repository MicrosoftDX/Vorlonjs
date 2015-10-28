import express = require("express");
import winston = require("winston");
import http = require("http");

//Vorlon
import iwsc = require("./vorlon.IWebServerComponent");
import tools = require("./vorlon.tools");
import vorloncontext = require("../config/vorlon.servercontext"); 

var winstonDisplay = require("winston-logs-display");

export module VORLON {
    export class WinstonLogger implements iwsc.VORLON.IWebServerComponent {
		private logConfig: vorloncontext.VORLON.ILogConfig;
		private _log: winston.LoggerInstance;
        
		constructor(context : vorloncontext.VORLON.IVorlonServerContext) {
			this.logConfig = context.logConfig;
			
			//LOGS      
            winston.cli();
            this._log = new winston.Logger(<any>{
                levels: {
                    info: 0,
                    warn: 1,
                    error: 2,
                    verbose: 3,
                    api: 4,
                    dashboard: 5,
                    plugin: 6
                },
                transports: [
                    new winston.transports.File(<any>{ filename: this.logConfig.vorlonLogFile, level: this.logConfig.level})
                ],
                exceptionHandlers: [
                    new winston.transports.File(<any>{ filename: this.logConfig.exceptionsLogFile, timestamp: true, maxsize: 1000000 })
                ],
                exitOnError: false
            });
            context.logger = this._log;

            if (this.logConfig.enableConsole) {
                this._log.add(winston.transports.Console, <any>{
                        level: this.logConfig.level,
                        handleExceptions: true,
                        json: false,
                        timestamp: function() {
                            var date:Date = new Date();
                            return date.getFullYear() + "-" + 
                            date.getMonth() + "-" +
                            date.getDate() + " " +
                            date.getHours() + ":" + 
                            date.getMinutes() + ":" +
                            date.getSeconds();
                        },
                        colorize: true
                    });
            }

            winston.addColors({
                info: 'green',
                warn: 'cyan',
                error: 'red',
                verbose: 'blue',
                api: 'gray',
                dashboard: 'pink',
                plugin: 'yellow'
            });

            this._log.cli();
		}
		
		public addRoutes(app: express.Express, passport: any): void {
             //DisplayLogs
            winstonDisplay(app, this._log);
		}
		
		public start(httpServer: http.Server): void {
		}
	}
}