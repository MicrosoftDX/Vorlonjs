declare module VORLON {
    class ObjectExplorer extends Plugin {
        private _selectedObjProperty;
        private _previousSelectedNode;
        private _currentPropertyPath;
        private _timeoutId;
        constructor();
        getID(): string;
        private _getProperty(propertyPath);
        private getObjDescriptor(object, pathTokens, scanChild?);
        private _packageAndSendObjectProperty();
        private _markForRefresh();
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        refresh(): void;
        private _containerDiv;
        private _searchBoxInput;
        private _searchBtn;
        private _treeDiv;
        private _objectContentView;
        private _dashboardDiv;
        startDashboardSide(div?: HTMLDivElement): void;
        private _queryObjectContent(objectPath);
        private _makeEditable(element);
        private _generateClickableValue(label, value, internalId);
        private _generateSelectedPropertyDescription(selectedProperty);
        private _appendSpan(parent, className, value);
        private _generateColorfullLink(link, receivedObject);
        private _generateColorfullClosingLink(link, receivedObject);
        private _generateButton(parentNode, text, className, onClick);
        private _generateTreeNode(parentNode, receivedObject, first?);
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
