declare module VORLON {
    class BasePlugin {
        name: string;
        _ready: boolean;
        protected _id: string;
        protected _debug: boolean;
        _type: PluginType;
        trace: (msg) => void;
        protected traceLog: (msg: any) => void;
        protected traceNoop: (msg: any) => void;
        loadingDirectory: string;
        constructor(name: string);
        Type: PluginType;
        debug: boolean;
        getID(): string;
        isReady(): boolean;
    }
}
