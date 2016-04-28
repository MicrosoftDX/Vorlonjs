declare module VORLON {
    class DashboardPlugin extends BasePlugin {
        htmlFragmentUrl: any;
        cssStyleSheetUrl: any;
        JavascriptSheetUrl: any;
        DashboardCommands: any;
        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl?: (string | string[]), JavascriptSheetUrl?: (string | string[]));
        startDashboardSide(div: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
        sendToClient(data: any): void;
        sendCommandToClient(command: string, data?: any): void;
        sendCommandToPluginClient(pluginId: string, command: string, data?: any): void;
        sendCommandToPluginDashboard(pluginId: string, command: string, data?: any): void;
        _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void;
        private _stripContent(content);
    }
}
