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
                Core.Messenger.sendRealtimeMessage(this.getID(), data, RuntimeSide.Client, "message", command);
            }
        }
        
        public trace(message:string):void {
            console.log(message);
        }

        public refresh(): void {
            console.error("Please override plugin.refresh()");
        }
        
        public _loadNewScriptAsync(scriptName: string, callback: () => void, waitForDOMContentLoaded?: boolean) {
            callback();
            // NOTHING ELSE NEEDED IN EXTENSION VERSION
        }
    }
}
