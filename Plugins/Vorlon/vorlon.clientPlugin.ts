module VORLON {
    declare var vorlonBaseURL: string;

    export class ClientPlugin extends BasePlugin  {
        public ClientCommands: any;

        constructor(name: string) {
            super(name);
        }

        public startClientSide(): void { }
        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void { }

        
        public sendToDashboard(data: any){
            if (Core.Messenger)
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message");
        }
        
        public sendCommandToDashboard(command: string, data: any = null) {
            if (Core.Messenger) {
                this.trace(this.getID() + ' send command to dashboard ' + command);
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", command);
            }
        }

        public refresh(): void {
            console.error("Please override plugin.refresh()");
        }
        
        public _loadNewScriptAsync(scriptName: string, callback: () => void, waitForDOMContentLoaded?: boolean) {
            var basedUrl = "";
            if(this.loadingDirectory.indexOf('http') === 0){
                basedUrl = this.loadingDirectory + "/" + this.name + "/";
            }
            else{
                basedUrl = vorlonBaseURL + "/" + this.loadingDirectory + "/" + this.name + "/";
            }
            function loadScript() {
                var scriptToLoad = document.createElement("script");
                scriptToLoad.setAttribute("src", basedUrl + scriptName);
                scriptToLoad.onload = callback;
                var first = document.getElementsByTagName('script')[0];
                first.parentNode.insertBefore(scriptToLoad, first);
            }
            if (!waitForDOMContentLoaded) {
                loadScript();
            }
            else {
                document.addEventListener("onload", () => {
                      loadScript();  
                })
            }
        }
    }
}
