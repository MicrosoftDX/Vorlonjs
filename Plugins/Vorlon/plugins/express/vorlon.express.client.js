var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var VORLON;
(function (VORLON) {
    var ExpressClient = (function (_super) {
        __extends(ExpressClient, _super);
        function ExpressClient() {
            _super.call(this, "express");
            this.hooked = false;
            this._ready = true;
            console.log('Started');
        }
        ExpressClient.prototype.getID = function () {
            return "NODEJS";
        };
        ExpressClient.prototype.refresh = function () {
        };
        ExpressClient.prototype.startClientSide = function () {
        };
        ExpressClient.prototype.setupExpressHook = function () {
            console.log('Hooking express');
            var expressSource;
            if (!VORLON.Tools.IsWindowAvailable) {
                if (!this._hookAlreadyDone) {
                    this._hookAlreadyDone = true;
                    var express = require('express');
                }
            }
            this.hooked = true;
        };
        ExpressClient.prototype._hookPrototype = function (that, expressSource) {
            if (!this._previousExpress) {
                this._previousExpress = expressSource.application.init;
            }
            expressSource.application.init = function () {
                console.log('IN EXPRESS !');
                return that._previousExpress.apply(this);
            };
        };
        ExpressClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            if (!VORLON.Tools.IsWindowAvailable) {
                if (receivedObject == 'express') {
                    this.sendToDashboard({ type: 'express', data: global.express_vorlonJS });
                }
                else if (receivedObject == 'locals') {
                }
                else if (receivedObject == 'sessions') {
                }
                else if (receivedObject == 'request') {
                }
            }
        };
        return ExpressClient;
    }(VORLON.ClientPlugin));
    VORLON.ExpressClient = ExpressClient;
    VORLON.Core.RegisterClientPlugin(new ExpressClient());
})(VORLON || (VORLON = {}));
