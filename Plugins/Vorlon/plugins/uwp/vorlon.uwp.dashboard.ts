declare var SmoothieChart : any;
declare var TimeSeries : any;

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
            if (!this._diskMonitor)
                this._diskMonitor = new DiskMonitorControl(this._diskpanel);
            if (!this._networkMonitor)
                this._networkMonitor = new NetworkMonitorControl(this._networkpanel);
            if (!this._powerMonitor)
                this._powerMonitor = new PowerMonitorControl(this._powerpanel);
        }

        public renderStatus(status: IUWPStatus) {
            if (!status.winRTAvailable) {
                this.showNoWinRT();
                return;
            } else {
                this.hideNoWinRT();
            }

            var date = new Date(<any>status.statusDate);
            this.checkBtnState(status.isRunning);
            this.initControls();
            this._memoryMonitor.setData(date, status.memory, status.phone ? status.phone.memory : null);
            this._cpuMonitor.setData(date, status.cpu);
            this._diskMonitor.setData(date, status.disk);
            this._networkMonitor.setData(date, status.network);
            this._powerMonitor.setData(date, status.power);
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

    function formatTime(time : number){
        if (time < 1000)
            return (time << 0) + " ms";
        
        time = time / 1000;
        if (time < 60){
            return (time << 0) + ' s';
        }
        var min = (time / 60);
        var sec = time % 60;
        
        if (min < 60)
            return (min << 0) + 'min';
            
        var hours = min / 60; 
        return (hours << 0) + 'h' + (min - hours*60) + 'min';
    }
    
    function formatBytes(bytes : number){
        var current = bytes;
        
        if (current < 1024)
            return current + ' bytes';
            
        current = current / 1024;
        if (current < 1024)
            return (current << 0) + ' ko';
        
        current = current / 1024;
        if (current < 1024)
            return (current << 0) + ' Mo';
            
        current = current / 1024;
        return (current << 0) + ' Go';
    }

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
        canvas : HTMLCanvasElement;
        smoothie : any;
        lineWorkset : any;
        linePeakWorkset : any;
        
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
                <canvas id="memoryrealtime" width="360" height="100"></canvas>`;

            this.workingSet = <HTMLElement>this.element.querySelector(".workingSet");
            this.canvas = <HTMLCanvasElement>this.element.querySelector("#memoryrealtime");
            this.smoothie = new SmoothieChart({ millisPerPixel : 200 });
            this.smoothie.streamTo(this.canvas);
            this.lineWorkset = new TimeSeries();
            //this.linePeakWorkset = new TimeSeries();
            this.smoothie.addTimeSeries(this.lineWorkset);
            //this.smoothie.addTimeSeries(this.linePeakWorkset);
        }

        setData(date : Date, memory: IUWPMemoryStatus, phone: IUWPPhoneMemoryStatus) {
            if (!memory) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }
            var workset = ((memory.workingSet / (1024 * 1024)) << 0);
            //var peakworkset = ((memory.peakWorkingSet / (1024 * 1024)) << 0);
            this.workingSet.textContent =  formatBytes(memory.workingSet);
            this.lineWorkset.append(date, workset);
            //this.linePeakWorkset.append(date, peakworkset);
        }
    }

    export class CpuMonitorControl {
        lastDate : Date;
        lastUserTime : number;
        element: HTMLElement;
        userTime: HTMLElement;
        percent: HTMLElement;
        canvas : HTMLCanvasElement;
        smoothie : any;
        lineUser : any;
        
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
                ${entry("percent", "percent")}                
                <canvas id="userrealtime" width="360" height="100"></canvas>`;
            this.canvas = <HTMLCanvasElement>this.element.querySelector("#userrealtime");
            this.smoothie = new SmoothieChart({ millisPerPixel : 200 });
            this.smoothie.streamTo(this.canvas);
            this.lineUser = new TimeSeries();
            this.smoothie.addTimeSeries(this.lineUser);
            this.userTime = <HTMLElement>this.element.querySelector(".userTime");
            this.percent = <HTMLElement>this.element.querySelector(".percent");
        }

        setData(date : Date, cpu: IUWPCpuStatus) {
            if (!cpu) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }

            this.userTime.textContent = cpu.user + " ms";
            if (this.lastDate){
                var difDate = <any>date - <any>this.lastDate;
                var difUserTime = cpu.user - this.lastUserTime;
                var percent = (100 * difUserTime / difDate).toFixed(2);
                this.percent.textContent = percent + " %";
                this.lineUser.append(date, percent);
            }
            this.lastDate = date;
            this.lastUserTime = cpu.user;
        }
    }

    export class DiskMonitorControl {
        element: HTMLElement;
        read: HTMLElement;
        write: HTMLElement;
        canvasRead : HTMLCanvasElement;
        smoothieRead : any;
        lineRead: any;
        canvasWrite : HTMLCanvasElement;
        smoothieWrite : any;
        lineWrite: any;
        lastDate : Date;
        lastRead : number;
        lastWrite : number;
        
        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
            var entry = (title, identifier) => {
                return `<div class="labelval"><div class="label">${title}</div><div class="val ${identifier}"></div></div>`
            }

            this.element.innerHTML =
                `<h1>Disk</h1>
                ${entry("read bytes", "bytesRead")}                                 
                <canvas id="readrealtime" width="360" height="60"></canvas>
                ${entry("write bytes", "bytesWritten")}    
                <canvas id="writerealtime" width="360" height="60"></canvas>`;

            this.canvasRead = <HTMLCanvasElement>this.element.querySelector("#readrealtime");
            this.smoothieRead = new SmoothieChart({ millisPerPixel : 200 });
            this.smoothieRead.streamTo(this.canvasRead);
            this.lineRead= new TimeSeries();
            this.smoothieRead.addTimeSeries(this.lineRead);
            
            this.canvasWrite = <HTMLCanvasElement>this.element.querySelector("#writerealtime");
            this.smoothieWrite = new SmoothieChart({ millisPerPixel : 200 });
            this.smoothieWrite.streamTo(this.canvasWrite);
            this.lineWrite= new TimeSeries();
            this.smoothieWrite.addTimeSeries(this.lineWrite);
            
            this.read = <HTMLElement>this.element.querySelector(".bytesRead");
            this.write = <HTMLElement>this.element.querySelector(".bytesWritten");
        }

        setData(date : Date, disk: IUWPDiskStatus) {
            if (!disk) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }

            this.read.textContent = formatBytes(disk.bytesRead);
            this.write.textContent = formatBytes(disk.bytesWritten);
            if (this.lastDate){
                var datedif = <any>date - <any>this.lastDate;
                var readDif = disk.bytesRead - this.lastRead;
                var read = (readDif / datedif).toFixed(2);
                var writeDif = disk.bytesWritten - this.lastWrite;
                var write = (writeDif / datedif).toFixed(2);
                this.lineRead.append(date, read);
                this.lineWrite.append(date, write);
            }
            this.lastDate = date;
            this.lastRead = disk.bytesRead;
            this.lastWrite = disk.bytesWritten;
        }
    }

    export class NetworkMonitorControl {
        element: HTMLElement;
        ianaInterfaceType:HTMLElement;
        signal:HTMLElement;
        
        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
            var entry = (title, identifier) => {
                return `<div class="labelval"><div class="label">${title}</div><div class="val ${identifier}"></div></div>`
            }

            this.element.innerHTML =
                `${entry("network type", "ianaInterfaceType")}                          
                ${entry("signal", "signal")}    
                `;
                
            this.ianaInterfaceType = <HTMLElement>this.element.querySelector(".ianaInterfaceType");
            this.signal = <HTMLElement>this.element.querySelector(".signal");
        }
        
        setData(date : Date, network: IUWPNetworkStatus) {
            if (!network) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }
            
            var networkType = "unknown (" + network.ianaInterfaceType + ")";
            if (network.ianaInterfaceType == 243 || network.ianaInterfaceType == 244){
                networkType = "3G or 4G";
            } else if (network.ianaInterfaceType == 71){
                networkType = "Wifi";
            } else if (network.ianaInterfaceType == 6){
                networkType = "LAN";
            }
            
            this.ianaInterfaceType.textContent = networkType;
            this.signal.textContent = (network.signal || "") + "";
        }
    }

    export class PowerMonitorControl {
        element: HTMLElement;
        power: HTMLElement;

        constructor(element: HTMLElement) {
            this.element = element;
            this.render();
        }

        render() {
            var entry = (title, identifier) => {
                return `<div class="labelval"><div class="label">${title}</div><div class="val ${identifier}"></div></div>`
            }

            this.element.innerHTML =
                `${entry("power", "power")}    
                `;
                
            this.power = <HTMLElement>this.element.querySelector(".power");
        }
        
        setData(date : Date, power: IUWPPowerStatus) {
            if (!power) {
                this.element.style.display = "none";
                return;
            } else {
                this.element.style.display = "";
            }
            
            //this.power.textContent = power.remainingChargePercent  + '% (' + formatTime(power.remainingDischargeTime) + ')';
            this.power.textContent = power.remainingChargePercent  + '%';
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
        
        setData(date : Date, power: IUWPEnergyStatus) {
        }
    }
}
