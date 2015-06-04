module VORLON {
    import Socket = SocketIO.Socket;
    declare var io;
    

    export class ClientMessenger {
        private _socket: Socket;
        private _isConnected = false;
        private _sessionId: string;
        private _clientId: string;
        private _listenClientId: string;
        private _serverUrl: string;
        private _waitingEvents: number;

        public onRealtimeMessageReceived: (pluginID: string, receivedObject: any) => void;
        public onHeloReceived: (id: string) => void;
        public onIdentifyReceived: (id: string) => void;
        public onWaitingEventsReceived: (id: string, waitingevents: number) => void;
        public onStopListenReceived: () => void;
        public onRefreshClients: () => void;        

        public onError: (err: Error) => void;

        public get isConnected(): boolean {
            return this._isConnected;
        }

        public set clientId(value: string) {
            this._clientId = value;
        }

        public get socketId(): string {
            return this._socket.id;
        }

        constructor(side: RuntimeSide, serverUrl: string, sessionId: string, clientId: string, listenClientId: string) {
            this._isConnected = false;
            this._sessionId = sessionId;
            this._clientId = clientId;
            Core._listenClientId = listenClientId;
            this._serverUrl = serverUrl;
            this._waitingEvents = 0;

            switch (side) {
                case RuntimeSide.Client:
                    this._socket = io.connect(serverUrl);
                    this._isConnected = true;
                    break;
                case RuntimeSide.Dashboard:
                    this._socket = io.connect(serverUrl + "/dashboard");
                    this._isConnected = true;
                    break;
            }

            if (this.isConnected) {
                var manager = io.Manager(serverUrl);
                manager.on('connect_error',(err) => {
                    if (this.onError) {
                        this.onError(err);
                    }
                });

                this._socket.on('message', message => {
                    var receivedObject = JSON.parse(message);
                    var pluginID = receivedObject._pluginID;

                    delete receivedObject._pluginID;

                    if (this.onRealtimeMessageReceived) {
                        this.onRealtimeMessageReceived(pluginID, receivedObject);
                    }
                });

                this._socket.on('helo', message => {
                    Core._listenClientId = message;
                    if (this.onHeloReceived) {
                        this.onHeloReceived(message);
                    }
                });

                this._socket.on('identify', message => {
                    if (this.onIdentifyReceived) {
                        this.onIdentifyReceived(message);
                    }
                });

                this._socket.on('stoplisten',() => {
                    if (this.onStopListenReceived) {
                        this.onStopListenReceived();
                    }
                });

                this._socket.on('waitingevents', message => {
                    if (this.onWaitingEventsReceived) {
                        var receivedObject = JSON.parse(message);
                        this.onWaitingEventsReceived(receivedObject._clientId, receivedObject._waitingEvents);
                    }
                });

                this._socket.on('refreshclients',() => {
                    if (this.onRefreshClients) {
                        this.onRefreshClients();
                    }
                });
            }
        }

        public sendWaitingEvents(pluginID: string, waitingevents: number): void {
            var objectToSend: any = {};
            objectToSend._pluginID = pluginID;
            objectToSend._side = RuntimeSide.Client;
            objectToSend._sessionId = this._sessionId;
            objectToSend._clientId = this._clientId;
            objectToSend._listenClientId = Core._listenClientId;
            objectToSend._waitingEvents = waitingevents;

            if (this.isConnected) {
                var message = JSON.stringify(objectToSend);
                this._socket.emit("waitingevents", message);
            }
        }

        public sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType = "message", incrementVisualIndicator = false): void {
            objectToSend._pluginID = pluginID;
            objectToSend._side = side;
            objectToSend._sessionId = this._sessionId;
            objectToSend._clientId = this._clientId;
            objectToSend._listenClientId = Core._listenClientId;

            if (!this.isConnected) {
                // Directly raise response locally
                if (this.onRealtimeMessageReceived) {
                    this.onRealtimeMessageReceived(pluginID, objectToSend);
                }
                return;
            } else {
                if (Core._listenClientId === "" && messageType === "message") {
                    if (incrementVisualIndicator) {
                        this._waitingEvents++;
                        this.sendWaitingEvents(pluginID, this._waitingEvents);
                    }
                } else {
                    var message = JSON.stringify(objectToSend);
                    this._socket.emit(messageType, message);

                    this._waitingEvents = 0;
                    this.sendWaitingEvents(pluginID, 0);
                }
            }
        }

        public sendMonitoringMessage(pluginID: string, message: string): void {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                    }
                }
            }

            xhr.open("POST", this._serverUrl + "api/push");
            xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
            var data = JSON.stringify({ "_idsession": this._sessionId, "id": pluginID, "message": message });
            //xhr.setRequestHeader("Content-length", data.length.toString());
            xhr.send(data);
        }

        public getMonitoringMessage(pluginID: string, onMonitoringMessage: (messages: string[]) => any, from = "-20", to = "-1"): any {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (onMonitoringMessage)
                            onMonitoringMessage(<string[]>JSON.parse(xhr.responseText));
                    } else {
                        if (onMonitoringMessage)
                            onMonitoringMessage(null);
                    }
                } else {
                    if (onMonitoringMessage)
                        onMonitoringMessage(null);
                }
            };

            xhr.open("GET", this._serverUrl + "api/range/" + this._sessionId + "/" + pluginID + "/" + from + "/" + to);
            xhr.send();

        }
    }
}
