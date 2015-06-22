declare module VORLON {
    interface VorlonMessageMetadata {
        pluginID: string;
        side: RuntimeSide;
        sessionId: string;
        clientId: string;
        listenClientId: string;
        waitingEvents?: number;
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
        private _waitingEvents;
        onRealtimeMessageReceived: (message: VorlonMessage) => void;
        onHeloReceived: (id: string) => void;
        onIdentifyReceived: (id: string) => void;
        onWaitingEventsReceived: (message: VorlonMessage) => void;
        onStopListenReceived: () => void;
        onRefreshClients: () => void;
        onError: (err: Error) => void;
        isConnected: boolean;
        clientId: string;
        socketId: string;
        constructor(side: RuntimeSide, serverUrl: string, sessionId: string, clientId: string, listenClientId: string);
        sendWaitingEvents(pluginID: string, waitingevents: number): void;
        sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType?: string, incrementVisualIndicator?: boolean, command?: string): void;
        sendMonitoringMessage(pluginID: string, message: string): void;
        getMonitoringMessage(pluginID: string, onMonitoringMessage: (messages: string[]) => any, from?: string, to?: string): any;
    }
}
