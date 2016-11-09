module VORLON {
    export class BotFrameworkInspectorClient extends ClientPlugin {
        constructor() {
            super("botFrameworkInspector");
            //this.debug = true;
            this._ready = true;
        }

        public getID(): string {
            return "BOTFRAMEWORKINSPECTOR";
        }

        public sendClientData(): void {
            this.sendToDashboard("Yo bitcheeeeeeezzZZZZ!");            
        }

        public refresh(): void {
            this.sendClientData();
        }
    }

    //Register the plugin with vorlon core 
    Core.RegisterClientPlugin(new BotFrameworkInspectorClient());
} 