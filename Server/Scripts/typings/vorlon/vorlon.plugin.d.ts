declare module VORLON {
    class Plugin {
        htmlFragmentUrl: any;
        cssStyleSheetUrl: any;
        loadingDirectory: string;
        name: any;
        _ready: boolean;
        _type: PluginType;
        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string);
        Type: PluginType;
        getID(): string;
        isReady(): boolean;
        startClientSide(): void;
        startDashboardSide(div: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        refresh(): void;
        _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void;
        _loadNewScriptAsync(scriptName: string, callback: () => void): void;
        private _stripContent(content);
    }
}
