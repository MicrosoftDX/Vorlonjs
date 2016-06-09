module VORLON {
    export class ScreenShotClient extends ClientPlugin {

        constructor() {
            super("screenshot");
            this._ready = true;
        }

        public getID(): string {
            return "SCREEN";
        }

        public refresh(): void {

        }

        public startClientSide(): void {

        }

        public onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void {
            if (receivedObject.message == 'screen') {
                console.log('here');
                this.sendToDashboard({url: location.href, message: 'screen'});
            }
        }
    }

    Core.RegisterClientPlugin(new ScreenShotClient());
}
