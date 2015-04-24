declare module VORLON {
    class InteractiveConsole extends Plugin {
        _cache: any[];
        constructor();
        getID(): string;
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        refresh(): void;
        private _containerDiv;
        private _interactiveInput;
        startDashboardSide(div?: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
