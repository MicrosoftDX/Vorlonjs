declare module VORLON {
    class Plugin {
        htmlFragmentUrl: any;
        cssStyleSheetUrl: any;
        loadingDirectory: string;
        name: any;
        _ready: boolean;
        protected _id: string;
        private _debug;
        _type: PluginType;
        trace: (msg) => void;
        private traceLog;
        private traceNoop;
        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string);
        Type: PluginType;
        debug: boolean;
        getID(): string;
        isReady(): boolean;
        startClientSide(): void;
        startDashboardSide(div: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        sendToClient(data: any, incrementVisualIndicator?: boolean): void;
        sendToDashboard(data: any, incrementVisualIndicator?: boolean): void;
        refresh(): void;
        _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void;
        _loadNewScriptAsync(scriptName: string, callback: () => void): void;
        private _stripContent(content);
    }
}
