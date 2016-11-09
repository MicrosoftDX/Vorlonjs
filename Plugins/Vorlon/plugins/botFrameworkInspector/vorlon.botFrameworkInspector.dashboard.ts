module VORLON {
    export class BotFrameworkInspectorDashboard extends DashboardPlugin {
        constructor() {
            super("botFrameworkInspector", "control.html", "control.css");
            this._ready = false;
            this._id = "BOTFRAMEWORKINSPECTOR";
        }

        private _containerDiv: HTMLElement;
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = Tools.QuerySelectorById(div, "botFrameworkInspector");
                this._ready = true;
            })
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject:any):void {
            this._containerDiv.textContent = receivedObject;
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new BotFrameworkInspectorDashboard());
} 