declare module VORLON {
    class InteractiveConsole extends Plugin {
        _cache: any[];
        constructor();
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        refresh(): void;
        private _containerDiv;
        private _interactiveInput;
        private _commandIndex;
        private _commandHistory;
        startDashboardSide(div?: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
