module VORLON {
    declare var $: any;
    class NgExplorerPlugin extends Plugin {

        constructor() {
            super("ngExplorer", "control.html", "control.css");
            this._ready = true;
            console.log('Started ngExplorer');
        }

        public getID(): string {
            return "NGEXPLORER";
        }

        public refresh(): void {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
        }

        // Client side
        public startClientSide(): void {

        }

        // Handle messages from the dashboard, on the client
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            Core.Messenger.sendRealtimeMessage(this.getID(), {}, RuntimeSide.Client, "message", true);
        }


        // Dashboard side
        private _containerDiv: HTMLElement;
        private _scopesView: HTMLElement;
        private _scopeDetailsView: HTMLElement;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = filledDiv;

                this._scopesView = Tools.QuerySelectorById(filledDiv, "scopes-view");
                this._scopeDetailsView = Tools.QuerySelectorById(filledDiv, "scope-details-view");

                $('.ng-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
            })
        }

        // When we get a message from the client, just show it
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {

        }
    }

    Core.RegisterPlugin(new NgExplorerPlugin());
}
