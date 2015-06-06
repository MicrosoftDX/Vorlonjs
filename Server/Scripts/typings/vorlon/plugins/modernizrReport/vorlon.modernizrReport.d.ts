declare module VORLON {
    class FeatureSupported {
        featureName: string;
        isSupported: boolean;
        type: string;
    }
    class ModernizrReport extends Plugin {
        supportedFeatures: FeatureSupported[];
        constructor();
        getID(): string;
        startClientSide(): void;
        refresh(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        private _filterList;
        private _cssFeaturesListTable;
        private _htmlFeaturesListTable;
        private _miscFeaturesListTable;
        private _nonCoreFeaturesListTable;
        startDashboardSide(div?: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
