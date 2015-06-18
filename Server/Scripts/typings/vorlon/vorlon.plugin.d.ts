declare module VORLON {
    class Plugin {
        htmlFragmentUrl: any;
        cssStyleSheetUrl: any;
        loadingDirectory: string;
        name: any;
        _ready: boolean;
        protected _id: string;
        protected _debug: boolean;
        _type: PluginType;
        trace: (msg) => void;
        protected traceLog: (msg: any) => void;
        private traceNoop;
        ClientCommands: any;
        DashboardCommands: any;
        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string);
        Type: PluginType;
        debug: boolean;
        getID(): string;
        isReady(): boolean;
        startClientSide(): void;
        startDashboardSide(div: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        sendToClient(data: any): void;
        sendCommandToClient(command: string, data?: any, incrementVisualIndicator?: boolean): void;
        sendCommandToPluginClient(pluginId: string, command: string, data?: any, incrementVisualIndicator?: boolean): void;
        sendToDashboard(data: any, incrementVisualIndicator?: boolean): void;
        sendCommandToDashboard(command: string, data?: any, incrementVisualIndicator?: boolean): void;
        sendCommandToPluginDashboard(pluginId: string, command: string, data?: any, incrementVisualIndicator?: boolean): void;
        refresh(): void;
        _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void;
        _loadNewScriptAsync(scriptName: string, callback: () => void): void;
        private _stripContent(content);
    }
}
