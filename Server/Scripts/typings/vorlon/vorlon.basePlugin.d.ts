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
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        sendToDashboard(data: any, incrementVisualIndicator?: boolean): void;
        sendCommandToDashboard(command: string, data?: any, incrementVisualIndicator?: boolean): void;
        refresh(): void;
        _loadNewScriptAsync(scriptName: string, callback: () => void): void;
    }
}
