declare module VORLON {
    interface VorlonMessageMetadata {
        pluginID: string;
        side: RuntimeSide;
        sessionId: string;
        clientId: string;
        listenClientId: string;
    }
    interface VorlonMessage {
        metadata: VorlonMessageMetadata;
        command?: string;
        data?: any;
    }
    class ClientMessenger {
        private _socket;
        private _isConnected;
        private _sessionId;
        private _clientId;
        private _listenClientId;
        private _serverUrl;
        onRealtimeMessageReceived: (message: VorlonMessage) => void;
        onHeloReceived: (id: string) => void;
        onIdentifyReceived: (id: string) => void;
        onRemoveClient: (id: any) => void;
        onAddClient: (id: any) => void;
        onStopListenReceived: () => void;
        onRefreshClients: () => void;
        onReload: (id: string) => void;
        onError: (err: Error) => void;
        isConnected: boolean;
        clientId: string;
        socketId: string;
        constructor(side: RuntimeSide, serverUrl: string, sessionId: string, clientId: string, listenClientId: string);
        stopListening(): void;
        sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType?: string, command?: string): void;
        sendMonitoringMessage(pluginID: string, message: string): void;
        getMonitoringMessage(pluginID: string, onMonitoringMessage: (messages: string[]) => any, from?: string, to?: string): any;
    }
}
