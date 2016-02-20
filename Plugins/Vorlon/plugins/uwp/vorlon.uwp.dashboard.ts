module VORLON {
    export class UWPDashboard extends DashboardPlugin {

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("uwp", "control.html", "control.css");
            this._ready = true;
            this.debug = true;
        }

        //Return unique id for your plugin
        public getID(): string {
            return "UWP";
        }

        public _startStopButton: HTMLButtonElement;
        public _startStopButtonState: HTMLElement;
        public _refreshButton: HTMLButtonElement;
        public _nowinrtpanel: HTMLElement;
        public _metadatapanel: HTMLElement;
        public _memorypanel: HTMLElement;
        public _cpupanel: HTMLElement;
        public _diskpanel: HTMLElement;
        public _networkpanel: HTMLElement;
        public _powerpanel: HTMLElement;
        public _energypanel: HTMLElement;
        running: boolean;
        _metadataDisplay: MetadataDisplayControl;
        _memoryMonitor: MemoryMonitorControl;
        _cpuMonitor: CpuMonitorControl;
        _networkMonitor: NetworkMonitorControl;
        _diskMonitor: DiskMonitorControl;
        _powerMonitor: PowerMonitorControl;
        _energyMonitor: EnergyMonitorControl;


        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._startStopButton = <HTMLButtonElement>filledDiv.querySelector('x-action[event="toggleState"]');
                this._startStopButtonState = <HTMLElement>filledDiv.querySelector('x-action[event="toggleState"]>i');

                this._refreshButton = <HTMLButtonElement>filledDiv.querySelector('x-action[event="btnrefresh"]');
                this._nowinrtpanel = <HTMLElement>filledDiv.querySelector("#nowinrt");
                this._metadatapanel = <HTMLElement>filledDiv.querySelector("#metadata");
                this._networkpanel = <HTMLElement>filledDiv.querySelector("#network");
                this._memorypanel = <HTMLElement>filledDiv.querySelector("#memory");
                this._cpupanel = <HTMLElement>filledDiv.querySelector("#cpu");
                this._diskpanel = <HTMLElement>filledDiv.querySelector("#disk");
                this._powerpanel = <HTMLElement>filledDiv.querySelector("#power");
                this._energypanel = <HTMLElement>filledDiv.querySelector("#energy");

                this._refreshButton.onclick = (arg) => {
                    this.sendCommandToClient('getMetadata');
                    this.sendCommandToClient('getStatus');
                }
                this.sendCommandToClient('getMetadata');

                this._startStopButton.addEventListener('click', (arg) => {
                    if (!this._startStopButtonState.classList.contains('fa-spin')) {
                        this._startStopButtonState.classList.remove('fa-play');
                        this._startStopButtonState.classList.remove('fa-stop');
                        this._startStopButtonState.classList.remove('no-anim');

                        this._startStopButtonState.classList.add('fa-spin');
                        this._startStopButtonState.classList.add('fa-spinner');
                        if (this.running) {
                            this.sendCommandToClient('stopMonitor');
                        } else {
                            this.sendCommandToClient('startMonitor', { interval: 5000 });
                        }
                    }
                });
            })
        }

        // When we get a message from the client, just show it
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            // var message = document.createElement('p');
            // message.textContent = receivedObject.message;
            // this._outputDiv.appendChild(message);
        }

        public showNoWinRT() {
            if (this._nowinrtpanel) {
                this._nowinrtpanel.style.display = "";
            }
        }

        public hideNoWinRT() {
            if (this._nowinrtpanel) {
                this._nowinrtpanel.style.display = "none";
            }
        }

        public checkBtnState(isRunning: boolean) {
            this.running = isRunning;
            
            if (isRunning) {
                this._startStopButtonState.classList.remove('fa-play');
                this._startStopButtonState.classList.remove('fa-spin');
                this._startStopButtonState.classList.remove('fa-spinner');

                this._startStopButtonState.classList.add('fa-stop');
                this._startStopButtonState.classList.add('no-anim');   
            }else{
                this._startStopButtonState.classList.remove('fa-stop');
                this._startStopButtonState.classList.remove('fa-spin');
                this._startStopButtonState.classList.remove('fa-spinner');

                this._startStopButtonState.classList.add('fa-play');
                this._startStopButtonState.classList.add('no-anim');    
            }
        }

        public renderMetadata(metadata: IUWPMetadata) {
            if (!metadata.winRTAvailable) {
                this.showNoWinRT();
                return;
            } else {
                this.hideNoWinRT();
            }

            this.checkBtnState(metadata.isRunning);

            if (!this._metadataDisplay) {
                this._metadataDisplay = new MetadataDisplayControl(this._metadatapanel);
            }
            this._metadataDisplay.setData(metadata);
        }

        public initControls() {
            if (!this._memoryMonitor)
                this._memoryMonitor = new MemoryMonitorControl(this._memorypanel);
            if (!this._cpuMonitor)
                this._cpuMonitor = new CpuMonitorControl(this._cpupanel);
        }

        public renderStatus(status: IUWPStatus) {
            if (!status.winRTAvailable) {
                this.showNoWinRT();
                return;
            } else {
                this.hideNoWinRT();
            }

            this.checkBtnState(status.isRunning);
            this.initControls();
            this._memoryMonitor.setData(status.memory, status.phone ? status.phone.memory : null);
            this._cpuMonitor.setData(status.cpu);
        }
    }

    UWPDashboard.prototype.DashboardCommands = {
        showStatus: function(data: any) {
            var plugin = <UWPDashboard>this;
            plugin.renderStatus(data);
        },
        showMetadata: function(data: any) {
            var plugin = <UWPDashboard>this;
            plugin.renderMetadata(data);
        }
    }

    Core.RegisterDashboardPlugin(new UWPDashboard());

    export class MetadataDisplayControl {
        element: HTMLElement;
        name: HTMLElement;
        language: HTMLElement;
        region: HTMLElement;
        deviceType: HTMLElement;
        appversion: HTMLElement;
        systemManufacturer: HTMLElement;
        systemProductName: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
            var entry = (title, identifier) => {
                return `<div class="labelval"><div class="label">${title}</div><div class="val ${identifier}"></div></div>`
            }
            this.element.innerHTML =
                `<h1>Client device</h1>
                ${entry("name", "name")}
                ${entry("app version", "appversion")}
                ${entry("language", "language")}
                ${entry("region", "region")}
                ${entry("deviceType", "deviceType")}
                ${entry("manufacturer", "systemManufacturer")}
                ${entry("product name", "systemProductName")}
                `;

            this.name = <HTMLElement>this.element.querySelector(".name");
            this.language = <HTMLElement>this.element.querySelector(".language");
            this.region = <HTMLElement>this.element.querySelector(".region");
            this.deviceType = <HTMLElement>this.element.querySelector(".deviceType");
            this.appversion = <HTMLElement>this.element.querySelector(".appversion");
            this.systemManufacturer = <HTMLElement>this.element.querySelector(".systemManufacturer");
            this.systemProductName = <HTMLElement>this.element.querySelector(".systemProductName");
        }

        setData(metadata: IUWPMetadata) {
            if (!metadata) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }

            if (this.name) {
                this.name.textContent = metadata.name;
                this.language.textContent = metadata.language;
                this.region.textContent = metadata.region;
                this.deviceType.textContent = metadata.deviceType;
                this.appversion.textContent = metadata.appversion.major + "." + metadata.appversion.minor + "." + metadata.appversion.build + "." + metadata.appversion.revision;
                this.systemManufacturer.textContent = metadata.systemManufacturer;
                this.systemProductName.textContent = metadata.systemProductName;
            }
        }
    }

    export class MemoryMonitorControl {
        element: HTMLElement;
        workingSet: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
            var entry = (title, identifier) => {
                return `<div class="labelval"><div class="label">${title}</div><div class="val ${identifier}"></div></div>`
            }

            this.element.innerHTML =
                `<h1>Memory</h1>
                ${entry("workingSet", "workingSet")}                
                `;

            this.workingSet = <HTMLElement>this.element.querySelector(".workingSet");
        }

        setData(memory: IUWPMemoryStatus, phone: IUWPPhoneMemoryStatus) {
            if (!memory) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }

            this.workingSet.textContent = ((memory.workingSet / (1024 * 1024)) << 0) + " Mo";
        }
    }

    export class CpuMonitorControl {
        element: HTMLElement;
        userTime: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
            var entry = (title, identifier) => {
                return `<div class="labelval"><div class="label">${title}</div><div class="val ${identifier}"></div></div>`
            }

            this.element.innerHTML =
                `<h1>CPU</h1>
                ${entry("user time", "userTime")}                
                `;

            this.userTime = <HTMLElement>this.element.querySelector(".userTime");
        }

        setData(cpu: IUWPCpuStatus) {
            if (!cpu) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }

            this.userTime.textContent = cpu.user + " ms";
        }
    }

    export class DiskMonitorControl {
        element: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
        }
    }

    export class NetworkMonitorControl {
        element: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
        }
    }

    export class PowerMonitorControl {
        element: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
        }
    }

    export class EnergyMonitorControl {
        element: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
        }
    }
}
