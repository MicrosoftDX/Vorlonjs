module VORLON {
    export class BotFrameworkInspectorDashboard extends DashboardPlugin {
        constructor() {
            super("botFrameworkInspector", "control.html", "control.css");
            this._ready = false;
            this._id = "BOTFRAMEWORKINSPECTOR";
        }

        private _lastReceivedBotInfo: BotInfo;
        private _containerDiv: HTMLElement;
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = Tools.QuerySelectorById(div, "botFrameworkInspector");
                this._ready = true;
                this.display();
            })
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject:any):void {
            this._lastReceivedBotInfo = receivedObject;
            this.display();
        }
        
        public display(){
            if(this._lastReceivedBotInfo){
                this._containerDiv.textContent = "";
                for(var i = 0; i < this._lastReceivedBotInfo.dialogDataList.length; i++){
                    this._containerDiv.textContent += "<br />" + this._lastReceivedBotInfo.dialogDataList[i].id;
                }
            }
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new BotFrameworkInspectorDashboard());
} 