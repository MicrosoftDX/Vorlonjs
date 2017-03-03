var VORLON;
(function (VORLON) {
    var _Core = (function () {
        function _Core() {
            this._clientPlugins = new Array();
            this._dashboardPlugins = new Array();
        }
        Object.defineProperty(_Core.prototype, "Messenger", {
            get: function () {
                return VORLON.Core._messenger;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "ClientPlugins", {
            get: function () {
                return VORLON.Core._clientPlugins;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "DashboardPlugins", {
            get: function () {
                return VORLON.Core._dashboardPlugins;
            },
            enumerable: true,
            configurable: true
        });
        _Core.prototype.RegisterClientPlugin = function (plugin) {
            VORLON.Core._clientPlugins.push(plugin);
        };
        _Core.prototype.RegisterDashboardPlugin = function (plugin) {
            VORLON.Core._dashboardPlugins.push(plugin);
        };
        _Core.prototype.StartClientSide = function () {
            VORLON.Core._side = VORLON.RuntimeSide.Client;
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            // Launch plugins
            for (var index = 0; index < VORLON.Core._clientPlugins.length; index++) {
                var plugin = VORLON.Core._clientPlugins[index];
                plugin.startClientSide();
            }
        };
        _Core.prototype.StartDashboardSide = function (tabid, divMapper) {
            VORLON.Core._side = VORLON.RuntimeSide.Dashboard;
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side, tabid);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            // Launch plugins
            for (var index = 0; index < VORLON.Core._dashboardPlugins.length; index++) {
                var plugin = VORLON.Core._dashboardPlugins[index];
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
            VORLON.Core.Messenger.sendRealtimeMessage("ALL_PLUGINS", {}, VORLON.RuntimeSide.Dashboard, "refresh");
        };
        _Core.prototype._Dispatch = function (message) {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }
            if (message.metadata.pluginID == 'ALL_PLUGINS') {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        };
        _Core.prototype._DispatchPluginMessage = function (plugin, message) {
            if (message.metadata.side === VORLON.RuntimeSide.Client) {
                VORLON.Core._DispatchFromClientPluginMessage(plugin, message);
            }
            else {
                if (message.metadata.messageType === "refresh") {
                    plugin.refresh();
                }
                else {
                    VORLON.Core._DispatchFromDashboardPluginMessage(plugin, message);
                }
            }
        };
        _Core.prototype._DispatchFromClientPluginMessage = function (plugin, message) {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        };
        _Core.prototype._DispatchFromDashboardPluginMessage = function (plugin, message) {
            if (message.command && plugin.ClientCommands) {
                var command = plugin.ClientCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromDashboardSide(message.data);
        };
        return _Core;
    })();
    VORLON._Core = _Core;
    VORLON.Core = new _Core();
})(VORLON || (VORLON = {}));
