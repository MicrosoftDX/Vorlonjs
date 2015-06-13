declare module VORLON {
    class NgInspector extends Plugin {
        _cache: any[];
        constructor();
        getID(): string;
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        startDashboardSide(div?: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
