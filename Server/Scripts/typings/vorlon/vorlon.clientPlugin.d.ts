declare module VORLON {
    class ClientPlugin extends BasePlugin {
        ClientCommands: any;
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
