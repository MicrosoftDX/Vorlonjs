declare module VORLON {
    class Core {
        static _plugins: Plugin[];
        static _messenger: ClientMessenger;
        static _sessionID: string;
        static _listenClientId: string;
        static _side: RuntimeSide;
        static _RetryTimeout: number;
        static Messenger: ClientMessenger;
        static Plugins: Array<Plugin>;
        static RegisterPlugin(plugin: Plugin): void;
        static Start(serverUrl?: string, sessionId?: string, listenClientId?: string, divMapper?: (string) => HTMLDivElement): void;
        private static _OnStopListenReceived();
        private static _OnIdentifyReceived(message);
        private static _OnError(err);
        private static _OnIdentificationReceived(id);
        private static _RetrySendingRealtimeMessage(plugin, receivedObject);
        private static _Dispatch(pluginID, receivedObject);
    }
}
