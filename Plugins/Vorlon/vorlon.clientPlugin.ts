module VORLON {
    export class ClientPlugin extends BasePlugin  {
        public ClientCommands: any;

        constructor(name: string) {
            super(name);
        }

        public get Type(): PluginType {
            return this._type;
        }
        
        public get debug(): boolean {
            return this._debug;
        }
        
        public set debug(val: boolean) {
            this._debug = val;
            if (val){
                this.trace = this.traceLog;
            }else{
                this.trace = this.traceNoop;
            }
        }

        public getID(): string {
            return this._id;
        }

        public isReady() {
            return this._ready;
        }

        public startClientSide(): void { }
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void { }

        
        public sendToDashboard(data: any, incrementVisualIndicator: boolean = false){
            if (Core.Messenger)
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", incrementVisualIndicator);
        }
        
        public sendCommandToDashboard(command: string, data: any = null, incrementVisualIndicator: boolean = false) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to dashboard ' + command);
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", incrementVisualIndicator, command);
            }
        }

        public refresh(): void {
            console.error("Please override plugin.refresh()");
        }
        
        public _loadNewScriptAsync(scriptName: string, callback: () => void) {
            var basedUrl = "";
            if(this.loadingDirectory.indexOf('http') === 0){
                basedUrl = this.loadingDirectory + "/" + this.name + "/";
            }
            else{
                basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            }
            var scriptToLoad = document.createElement("script");
            scriptToLoad.setAttribute("src", basedUrl + scriptName);
            scriptToLoad.onload = callback;
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(scriptToLoad, first);
        }
    }
}
