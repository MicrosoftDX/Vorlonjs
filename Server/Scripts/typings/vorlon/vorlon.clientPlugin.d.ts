declare module VORLON {
    class ClientPlugin extends BasePlugin {
        ClientCommands: any;
        domReady: boolean;
        constructor(name: string);
        startClientSide(): void;
        whenDOMReady(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        sendToDashboard(data: any): void;
        sendCommandToDashboard(command: string, data?: any): void;
        refresh(): void;
        _loadNewScriptAsync(scriptName: string, callback: () => void, waitForDOMContentLoaded?: boolean): void;
    }
}
