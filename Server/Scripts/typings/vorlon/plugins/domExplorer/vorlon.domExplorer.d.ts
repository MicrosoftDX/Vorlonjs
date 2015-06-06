declare module VORLON {
    class DOMExplorer extends Plugin {
        private _previousSelectedNode;
        private _internalId;
        private _lastElementSelectedClientSide;
        private _newAppliedStyles;
        private _lastContentState;
        private _lastReceivedObject;
        private _clikedNodeID;
        constructor();
        getID(): string;
        private _getAppliedStyles(node);
        private _packageNode(node);
        private _packageDOM(root, packagedObject, withChildsNodes?);
        private _packageAndSendDOM(element?);
        private _markForRefresh();
        startClientSide(): void;
        private _getElementByInternalId(internalId, node);
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        refresh(): void;
        refreshbyId(internaID: any): void;
        private _containerDiv;
        private _treeDiv;
        private _styleView;
        private _dashboardDiv;
        private _refreshButton;
        startDashboardSide(div?: HTMLDivElement): void;
        private _makeEditable(element);
        private _generateClickableValue(label, value, internalId);
        private _generateStyle(property, value, internalId, editableLabel?);
        private _generateStyles(styles, internalId);
        private _appendSpan(parent, className, value);
        private _generateColorfullLink(link, receivedObject);
        private _generateColorfullClosingLink(link, receivedObject);
        private _generateButton(parentNode, text, className, attribute?);
        private _spaceCheck;
        private _generateTreeNode(parentNode, receivedObject, first?);
        private _insertReceivedObject(receivedObject, root);
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
