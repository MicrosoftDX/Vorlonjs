import httpConfig = require("./vorlon.httpconfig");
import baseUrlConfig = require("./vorlon.baseurlconfig");
import logConfig = require("./vorlon.logconfig");
import pluginsConfig = require("./vorlon.pluginsconfig");
import redisConfig = require("./vorlon.redisconfig");
import tools = require("../Scripts/vorlon.tools");

export module VORLON {
	export interface IBaseURLConfig {
		baseURL: string;
		baseProxyURL: string;
	}

	export interface ILogger {
		debug: (...args) => void;
		info: (...args) => void;
		warn: (...args) => void;
		error: (...args) => void;
	}

	export interface IHttpConfig {
		useSSL: boolean;
        protocol: String;
        options;
		httpModule: any;
        port: number;
        proxyPort: number;
        enableWebproxy: boolean;
        vorlonServerURL: string;
        vorlonProxyURL: string;
        proxyEnvPort: boolean;
	}

	export interface ILogConfig {
		vorlonLogFile: string;
        exceptionsLogFile: string;
        enableConsole: boolean;
        level: string;
	}

	export interface IRedisConfig {
		fackredis: boolean;
        _redisPort: number;
        _redisMachine: string;
        _redisPassword: string;
	}

	export interface IPluginConfig {
		id: string;
		name: string;
		panel: string;
		foldername: string;
		enabled: boolean;
	}

	export interface ISessionPlugins {
		includeSocketIO: boolean;
		plugins: IPluginConfig[];
	}

	export interface IPluginsProvider {
		getPluginsFor(sessionid: string, callback: (error, plugins: ISessionPlugins) => void);
	}

	export interface IVorlonServerContext {
		baseURLConfig: IBaseURLConfig;
		httpConfig: IHttpConfig;
		logConfig: ILogConfig;
		redisConfig: IRedisConfig;
		logger: ILogger;
		plugins: IPluginsProvider;
		sessions: SessionManager;
	}

	export class SimpleConsoleLogger implements ILogger {
		debug() {
			console.log.apply(null, arguments);
		}

		info() {
			console.info.apply(null, arguments);
		}

		warn() {
			console.warn.apply(null, arguments);
		}

		error() {
			console.error.apply(null, arguments);
		}
	}

	export class SessionManager {
        private sessions: Session[] = [];
		public logger: ILogger;
		public onsessionadded: (session) => void;
		public onsessionremoved: (session) => void;
		public onsessionupdated: (session) => void;

		add(sessionId: string, session: Session) {
			session.sessionId = sessionId;
			this.sessions[sessionId] = session;
			if (this.logger)
				this.logger.debug("session " + sessionId + " added");

			if (this.onsessionadded)
				this.onsessionadded(session);
		}

		get(sessionId: string): Session {
			return this.sessions[sessionId];
		}

		remove(sessionId: string) {
			var session = this.sessions[sessionId];
			if (this.logger)
				this.logger.debug("session " + sessionId + " removed");

			delete this.sessions[sessionId];
			if (this.onsessionremoved)
				this.onsessionremoved(session);
		}

		update(sessionId: string, session: Session) {
			this.sessions[sessionId] = session;

			if (this.logger)
				this.logger.debug("session " + sessionId + " update");

			var nbopened = 0;
			session.connectedClients.forEach((client) => {
				if (client.opened) {
					nbopened++;
				}
			});

			session.nbClients = nbopened;
			
			if (this.onsessionupdated)
				this.onsessionupdated(session);
		}

		all(): Session[] {
			var items = [];
			for (var n in this.sessions) {
				items.push(this.sessions[n]);
			}
			return items;
		}
    }

	export class Session {
		public sessionId: string = "";
        public currentClientId = "";
        public nbClients = -1;
        public connectedClients = new Array<Client>();
    }

    export class Client {
        public clientId: string;
        public displayId: number;
        public socket: SocketIO.Socket;
        public opened: boolean;
        public ua: string;
		public identity: string;

        public get data(): any {
            return {
				"clientid": this.clientId,
				"displayid": this.displayId,
				"ua": this.ua,
				"identity" : this.identity,
				"name": tools.VORLON.Tools.GetOperatingSystem(this.ua)
			};
        }

        constructor(clientId: string, ua: string, socket: SocketIO.Socket, displayId: number, opened: boolean = true) {
            this.clientId = clientId;
            this.ua = ua;
            this.socket = socket;
            this.displayId = displayId;
            this.opened = opened;
        }
    }

	export class DefaultContext implements IVorlonServerContext {
		public baseURLConfig: IBaseURLConfig;
		public httpConfig: IHttpConfig;
		public logConfig: ILogConfig;
		public redisConfig: IRedisConfig;
		public logger: ILogger;
		public sessions: SessionManager;
		public plugins: IPluginsProvider;

		constructor() {
			this.httpConfig = new httpConfig.VORLON.HttpConfig();
			this.baseURLConfig = new baseUrlConfig.VORLON.BaseURLConfig();
			this.logConfig = new logConfig.VORLON.LogConfig();
			this.redisConfig = new redisConfig.VORLON.RedisConfig();
			this.plugins = new pluginsConfig.VORLON.PluginsConfig();

			this.sessions = new SessionManager();
		}
	}
}