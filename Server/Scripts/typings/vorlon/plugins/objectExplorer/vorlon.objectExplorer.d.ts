declare module VORLON {
    interface ObjPropertyDescriptor {
        type: string;
        name: string;
        fullpath: string;
        contentFetched: boolean;
        value?: any;
        content: Array<ObjPropertyDescriptor>;
    }
    class ObjectExplorerPlugin extends Plugin {
        private _selectedObjProperty;
        private _previousSelectedNode;
        private _currentPropertyPath;
        private _timeoutId;
        constructor();
        getID(): string;
        private STRIP_COMMENTS;
        private ARGUMENT_NAMES;
        private rootProperty;
        private getFunctionArgumentNames(func);
        private _getProperty(propertyPath);
        private getObjDescriptor(object, pathTokens, scanChild?);
        private _packageAndSendObjectProperty(type, path?);
        private _markForRefresh();
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        refresh(): void;
        private _containerDiv;
        private _searchBoxInput;
        private _searchBtn;
        private _treeDiv;
        private _dashboardDiv;
        private _contentCallbacks;
        startDashboardSide(div?: HTMLDivElement): void;
        private _queryObjectContent(objectPath);
        private _makeEditable(element);
        private _appendSpan(parent, className, value);
        private _generateColorfullLink(link, receivedObject);
        private _generateColorfullClosingLink(link, receivedObject);
        private _generateButton(parentNode, text, className, onClick);
        private _generateTreeNode(parentNode, receivedObject, first?);
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
