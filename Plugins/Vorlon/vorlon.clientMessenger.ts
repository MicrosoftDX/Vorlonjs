module VORLON {
    import Socket = SocketIO.Socket;
    declare var io;
    
    export interface VorlonMessageMetadata {
        pluginID : string;
        side : RuntimeSide;
        sessionId : string;
        clientId: string;    
        listenClientId: string;
    }

    export interface VorlonMessage {
        metadata: VorlonMessageMetadata;
        command?: string;
        data? : any
    }

    export class ClientMessenger {
        private _socket: Socket;
        private _isConnected = false;
        private _sessionId: string;
        private _clientId: string;
        private _listenClientId: string;
        private _serverUrl: string;

        public onRealtimeMessageReceived: (message: VorlonMessage) => void;
        public onHeloReceived: (id: string) => void;
        public onIdentifyReceived: (id: string) => void;
        public onStopListenReceived: () => void;
        public onRefreshClients: () => void;
        public onReload: (id: string) => void;
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
                    var received = <VorlonMessage>JSON.parse(message);

                    if (this.onRealtimeMessageReceived) {
                        this.onRealtimeMessageReceived(received);
                    }
                });

                this._socket.on('helo', message => {
                    //console.log('messenger helo', message);
                    Core._listenClientId = message;
                    if (this.onHeloReceived) {
                        this.onHeloReceived(message);
                    }
                });

                this._socket.on('identify', message => {
                    //console.log('messenger identify', message);
                    if (this.onIdentifyReceived) {
                        this.onIdentifyReceived(message);
                    }
                });

                this._socket.on('stoplisten',() => {
                    if (this.onStopListenReceived) {
                        this.onStopListenReceived();
                    }
                });

                this._socket.on('refreshclients',() => {
                    //console.log('messenger refreshclients');
                    if (this.onRefreshClients) {
                        this.onRefreshClients();
                    }
                });

                this._socket.on('reload', message => {
                    //console.log('messenger reloadclient', message);
                    Core._listenClientId = message;
                    if (this.onReload) {
                        this.onReload(message);
                    }
                });
            }
        }

        public sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType = "message", command?:string): void {
            var message: VorlonMessage = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    sessionId: this._sessionId,
                    clientId: this._clientId,
                    listenClientId: Core._listenClientId
                },
                data: objectToSend
            };

            if (command)
                message.command = command;

            if (!this.isConnected) {
                // Directly raise response locally
                if (this.onRealtimeMessageReceived) {
                    this.onRealtimeMessageReceived(message);
                }
                return;
            } else {
                if (Core._listenClientId !== "" || messageType !== "message") {
                    var strmessage = JSON.stringify(message);
                    this._socket.emit(messageType, strmessage);
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
