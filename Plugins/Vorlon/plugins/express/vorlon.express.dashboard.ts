module VORLON {

    declare var $: any;

    export class ExpressDashboard extends DashboardPlugin {

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("express", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }

        //Return unique id for your plugin
        public getID(): string {
            return "EXPRESS";
        }

        // This code will run on the dashboard //////////////////////

        // Start dashboard code
        // uses _insertHtmlContentAsync to insert the control.html content
        // into the dashboard
        private _inputField: HTMLInputElement
        private _outputDiv: HTMLElement
        private _express: any

        public startDashboardSide(div: HTMLDivElement = null): void {
            this.sendToClient('express');
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this.toogleMenu();
            })
        }

        public setRoutes(): void {
          console.log('6', this._express);
            this._express._router.stack.filter(r => r.route).map(r => {
              var route = '<p> ' + r.route.path + ' - [';
              for (var key in r.route.methods) {
                route += key + ' ';
              }
              route += '] </p>';
              $('#express-routes').append(route);
            });
        }

        public toogleMenu(): void {
            $('.plugin-express .open-menu').click(function() {
                $('.plugin-express .open-menu').removeClass('active-menu');
                $('.plugin-express #searchlist').val('');
                $('.plugin-express .explorer-menu').hide();
                $('.plugin-express #' + $(this).data('menu')).show();
                $('.plugin-express .new-entry').fadeOut();
                $(this).addClass('active-menu');
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
          console.log('3', receivedObject);
          if (receivedObject.type == 'express') {
              console.log('4');
              this._express = receivedObject.data;
              if (typeof this._express === 'undefined') {
                alert('EXPRESS IN NOT DEFINED (express_vorlonJS)');
              } else {
                console.log('5');
                this.setRoutes();
              }
          }
        }
    }

    Core.RegisterDashboardPlugin(new ExpressDashboard());
}
