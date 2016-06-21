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
        private _requests: any

        public startDashboardSide(div: HTMLDivElement = null): void {
            this.sendToClient('express');
            this._requests = [];
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
            var _this = this;
            $('.plugin-express .open-menu').click(function() {
                $('.plugin-express .open-menu').removeClass('active-menu');
                $('.plugin-express #searchlist').val('');
                $('.plugin-express .explorer-menu').hide();
                $('.plugin-express #' + $(this).data('menu')).show();
                $('.plugin-express .new-entry').fadeOut();
                $(this).addClass('active-menu');
            });
            
            $('#requestClear').click(function() {
                $('#express-request .routes-list').empty(); 
            });
            
            $('#express-request .routes-list').on('click', 'li', function() {
                var obj = _this._requests[$(this).data('requestid')].headers;
                var str = JSON.stringify(obj, undefined, 4);
                $('.header-req-din').html(_this.syntaxHighlight(str));
                $('#headers-req').css('height', '100%');
                $('#headers-req div').css('padding', '15px');
            });
            
            $('#headers-req .fa-times').click(function() {
                $('#headers-req').css('height', '0%');
                $('#headers-req div').css('padding', '0px');
            });
        }

        public syntaxHighlight(json: any): any {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
          if (receivedObject.type == 'express') {
              if (!receivedObject.data) {
                  //NO VORLON
              } else {
                  $('#no_vorlon').fadeOut();
                  this.sendToClient('express_route');
                  this.sendToClient('express_request');
                  this.sendToClient('express_locals');                  
              }     
          } else if (receivedObject.type == 'express_route') {
              var routes = receivedObject.data;
              for (var r = 0, len = routes.length; r < len; r++) {
                  var methods = routes[r].methods;
                  var method = (Object.keys(methods)[0] == 'checkout') ? 'any' : Object.keys(methods)[0];
                  $('#express-routes .routes-list').append('<li><span class="method method-' + method + '">' + method + '</span>' + routes[r].path + '</li>');
              }
              $("#routeFilter").on("keyup", function() {
                var srchTerm = $(this).val(),
                    $rows = $("#express-routes .routes-list").children("li");
                if (srchTerm.length > 0 && srchTerm != 'any') {
                    $rows.stop().hide();
                    $("#express-routes .routes-list").find("li:contains('" + srchTerm + "')").stop().show();
                } else {
                    $rows.stop().show();
                }
              });
              $("#methodFilter").on("change", function() {
                var srchTerm = $(this).val(),
                    $rows = $("#express-routes .routes-list").children("li");
                if (srchTerm.length > 0 && srchTerm != 'any') {
                    $rows.stop().hide();
                    $("#express-routes .routes-list").find("li:contains('" + srchTerm + "')").stop().show();
                } else {
                    $rows.stop().show();
                }
              });
          } else if (receivedObject.type == 'express_request') {
            var timeNow = new Date();
            var hours   = timeNow.getHours();
            var minutes = timeNow.getMinutes();
            var seconds = timeNow.getSeconds();
            var timeString = "" + ((hours > 12) ? hours - 12 : hours);
            timeString  += ((minutes < 10) ? ":0" : ":") + minutes;
            timeString  += ((seconds < 10) ? ":0" : ":") + seconds;
            timeString  += (hours >= 12) ? " P.M." : " A.M.";
              $('#express-request .routes-list').prepend('<li data-requestid="' + this._requests.length + '"><span class="method method-' + receivedObject.data.method.toLowerCase() + '">' + receivedObject.data.method + '</span><span class="code-res code-' + receivedObject.data.code + '">' + receivedObject.data.code + '</span> ' + receivedObject.data.url + ' <span class="hour_request">' + timeString + '</span><span class="headers_request"><a href="#">+ headers</a></span></li>');
              this._requests.push(receivedObject.data);
          } else if (receivedObject.type == 'express_locals') {
              $('#express-locals pre').html(this.syntaxHighlight(receivedObject.data));
          }
        }
    }

    Core.RegisterDashboardPlugin(new ExpressDashboard());
}
