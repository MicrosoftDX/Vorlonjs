declare module VORLON {
    class DOMExplorer extends Plugin {
        private _previousSelectedNode;
        private _internalId;
        constructor();
        getID(): string;
        private _getAppliedStyles(node);
        private _packageNode(node);
        private _packageDOM(root, packagedObject);
        private _packageAndSendDOM();
        startClientSide(): void;
        private _getElementByInternalId(internalId, node);
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        refresh(): void;
        private _containerDiv;
        private _treeDiv;
        private _styleView;
        private _dashboardDiv;
        startDashboardSide(div?: HTMLDivElement): void;
        private _makeEditable(element);
        private _generateClickableValue(label, value, internalId);
        private _generateStyle(property, value, internalId, editableLabel?);
        private _generateStyles(styles, internalId);
        private _appendSpan(parent, className, value);
        private _generateColorfullLink(link, receivedObject);
        private _generateColorfullClosingLink(link, receivedObject);
        private _generateButton(parentNode, text, className, onClick);
        private _generateTreeNode(parentNode, receivedObject, first?);
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
    }
}
