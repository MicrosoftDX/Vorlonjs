module VORLON {

    declare var $: any;

    export class NodejsDashboard extends DashboardPlugin {

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("nodejs", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "NODEJS";
        }

        // This code will run on the dashboard //////////////////////

        // Start dashboard code
        // uses _insertHtmlContentAsync to insert the control.html content
        // into the dashboard
        private _inputField: HTMLInputElement
        private _outputDiv: HTMLElement

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this.toogleMenu();
                this.sendToClient('modules');
                this.sendToClient('routes');
                this.sendToClient('memory');
            })
        }

        public toogleMenu(): void {
            $('.open-menu').click(function() {
                $('.open-menu').removeClass('active-menu');
                $('#searchlist').val('');
                $('.explorer-menu').hide();
                $('#' + $(this).data('menu')).show();
                $('.new-entry').fadeOut();
                $(this).addClass('active-menu');
            });                 
        }
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type == 'modules') {
                for (var i = 0, len = receivedObject.data.length; i < len; i++) {
                    $('#modules ul').append('<li>'+ receivedObject.data[i] +'</li>');
                }
            }
            if (receivedObject.type == 'routes') {
                for (var i = 0, len = receivedObject.data.length; i < len; i++) {
                    $('#routes ul').append('<li>'+ JSON.stringify(receivedObject.data[i]) +'</li>');
                }
            }
            if (receivedObject.type == 'memory') {
                $('#memory').append(JSON.stringify(receivedObject.data));
            }
        }
    }

    Core.RegisterDashboardPlugin(new NodejsDashboard());
}
