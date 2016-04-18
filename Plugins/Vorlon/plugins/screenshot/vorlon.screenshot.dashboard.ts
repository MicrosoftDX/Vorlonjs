module VORLON {
    export class ScreenShotDashboard extends DashboardPlugin {

        constructor() {
            super("screenshot", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }

        public getID(): string {
            return "SCREEN";
        }

        private _inputField: HTMLInputElement

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._inputField = <HTMLInputElement>filledDiv.querySelector('.getScreen');
                
                this._inputField.addEventListener("click", (evt) => {
                    $('.screen-wrapper').find('div').fadeIn();
                    this.sendToClient({
                        message: 'screen'
                    });
                });
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.message == 'screen') {
                console.log('hereree');
                $('.screen-img').attr('src', receivedObject.image).fadeIn();
                $('.screen-wrapper').find('p').fadeIn();
                $('.screen-wrapper').find('div').fadeOut();
            }
        }
    }

    Core.RegisterDashboardPlugin(new ScreenShotDashboard());
}
