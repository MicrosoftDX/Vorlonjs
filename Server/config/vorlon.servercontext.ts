import httpConfig = require("./vorlon.httpconfig");
import baseUrlConfig = require("./vorlon.baseurlconfig");
import logConfig = require("./vorlon.logconfig");
import redisConfig = require("./vorlon.redisconfig");

export module VORLON {
	export interface IBaseURLConfig {
		baseURL: string;
		baseProxyURL : string;
	}
	
	export interface ILogger {
		debug : (...args) => void;
		info : (...args) => void;
		warn : (...args) => void;
		error : (...args) => void;
	}
	
	export interface IHttpConfig{
		useSSL: boolean;
        protocol: String;
        options;
		httpModule: any;
        port : number;
        proxyPort : number;
        enableWebproxy : boolean;
        vorlonServerURL : string;
        vorlonProxyURL : string;
        proxyEnvPort:boolean;
	}
	
	export interface ILogConfig {
		vorlonLogFile: string;
        exceptionsLogFile: string;
        enableConsole: boolean;
        level: string;
	}
	
	export interface IRedisConfig {
		fackredis: boolean;
        _redisPort : number;
        _redisMachine : string;
        _redisPassword : string;
	}
	
	export interface IVorlonServerContext {		
		baseURLConfig: IBaseURLConfig;
		httpConfig: IHttpConfig;
		logConfig: ILogConfig;
		redisConfig: IRedisConfig;
		logger : ILogger;
	}
	
	export class SimpleConsoleLogger implements ILogger {
		debug(){
			console.log.apply(null, arguments);
		}
		
		info(){
			console.info.apply(null, arguments);
		}
		
		warn(){
			console.warn.apply(null, arguments);
		}
		
		error(){
			console.error.apply(null, arguments);
		}
	}
	
	export class DefaultContext implements IVorlonServerContext {
		public baseURLConfig: IBaseURLConfig;
		public httpConfig: IHttpConfig;
		public logConfig: ILogConfig;
		public redisConfig: IRedisConfig;
		public logger : ILogger;
		
		constructor(){
			this.httpConfig = new httpConfig.VORLON.HttpConfig();
			this.baseURLConfig = new baseUrlConfig.VORLON.BaseURLConfig();
			this.logConfig = new logConfig.VORLON.LogConfig();
			this.redisConfig = new redisConfig.VORLON.RedisConfig();
		}
	}
}