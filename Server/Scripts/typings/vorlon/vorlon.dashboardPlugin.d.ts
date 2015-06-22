declare module VORLON {
    class DashboardPlugin extends BasePlugin {
        htmlFragmentUrl: any;
        cssStyleSheetUrl: any;
        DashboardCommands: any;
        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string);
        startDashboardSide(div: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
        sendToClient(data: any): void;
        sendCommandToClient(command: string, data?: any, incrementVisualIndicator?: boolean): void;
        sendCommandToPluginClient(pluginId: string, command: string, data?: any, incrementVisualIndicator?: boolean): void;
        sendCommandToPluginDashboard(pluginId: string, command: string, data?: any, incrementVisualIndicator?: boolean): void;
        _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void;
        private _stripContent(content);
    }
}
