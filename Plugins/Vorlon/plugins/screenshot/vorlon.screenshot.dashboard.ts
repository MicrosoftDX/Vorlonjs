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
            private _pageres: any

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._inputField = <HTMLInputElement>filledDiv.querySelector('.getScreen');
                this._pageres = require('./pageres');
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
                new this._pageres({delay: 2})
                	.src(receivedObject.url)
                	.dest('./screens')
                	.run()
                	.then(() => {
                    $('.screen-img').attr('src', 'toto').fadeIn();
                    $('.screen-wrapper').find('p').fadeIn();
                    $('.screen-wrapper').find('div').fadeOut();
                  });
            }
        }
    }

    Core.RegisterDashboardPlugin(new ScreenShotDashboard());
}
