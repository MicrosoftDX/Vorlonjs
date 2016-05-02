module VORLON {

    declare var $: any;

    export class NodejsDashboard extends DashboardPlugin {

        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        constructor() {
            //     name   ,  html for dash   css for dash
            super("nodejs", "control.html", ["control.css", "tree.css"], "chart.js");
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
        private _time: Number
        private _chart: any
        private __html: any
        private _ctx: HTMLCanvasElement
        private _chart_data: Object

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this.toogleMenu();
                
                this._time = 0;
                
                this._ctx = document.getElementById("memory-chart").getContext("2d");
                this._chart_data = {
                    labels: [],
                    datasets: [
                        {
                            label: "Heap Used (MB)",
                            fill: false,
                            lineTension: 0.1,
                            backgroundColor: "rgba(75,192,192,0.4)",
                            borderColor: "rgba(75,192,192,1)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(75,192,192,1)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 1,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "rgba(75,192,192,1)",
                            pointHoverBorderColor: "rgba(220,220,220,1)",
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                            data: [],
                        },
                        {
                            label: "Heap Total (MB)",
                            fill: false,
                            lineTension: 0.1,
                            backgroundColor: "rgba(142, 68, 173,0.4)",
                            borderColor: "rgba(142, 68, 173,1.0)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(142, 68, 173,1.0)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 1,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "rgba(142, 68, 173,1.0)",
                            pointHoverBorderColor: "rgba(155, 89, 182,1.0)",
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                            data: [],
                        },
                        {
                            label: "RSS (MB)",
                            fill: false,
                            lineTension: 0.1,
                            backgroundColor: "rgba(192, 57, 43,0.4)",
                            borderColor: "rgba(192, 57, 43,1.0)",
                            borderCapStyle: 'butt',
                            borderDash: [],
                            borderDashOffset: 0.0,
                            borderJoinStyle: 'miter',
                            pointBorderColor: "rgba(192, 57, 43,1.0)",
                            pointBackgroundColor: "#fff",
                            pointBorderWidth: 1,
                            pointHoverRadius: 5,
                            pointHoverBackgroundColor: "rgba(192, 57, 43,1.0)",
                            pointHoverBorderColor: "rgba(231, 76, 60,1.0)",
                            pointHoverBorderWidth: 2,
                            pointRadius: 1,
                            pointHitRadius: 10,
                            data: [],
                        }
                    ]
                };
                
                this._chart = false;
                this.__html = [];                
                
                this.sendToClient('infos');
                this.sendToClient('memory');
                this.sendToClient('modules');
            })
        }

        public chart(): void {
            Chart.defaults.global.responsive = true;
            Chart.defaults.global.maintainAspectRatio = false;
            Chart.defaults.global.animation.easing = 'linear';
            
            this._chart = new Chart.Line(this._ctx, {
                data: this._chart_data,
            });
        }

        public jstree(): void {
            $( '.tree li' ).each( function() {
                if( $( this ).find('ul').children( 'li' ).length > 0 ) {
                    $( this ).addClass( 'parent' );     
                }
            });
        
            $( '.tree li.parent > a' ).click( function( ) {
                $( this ).parent().toggleClass( 'active' );
                $( this ).parent().children( 'ul' ).slideToggle( 'fast' );
            });
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
        
        public renderTree(arr: any): void {
            var __that = this;
            __that.__html.push('<ul>');
            $.each(arr, function(i, val) {
                __that.__html.push('<li><a>' + val.text +'</a>');
                if (val.children) {
                    __that.renderTree(val.children)
                }
                __that.__html.push('</li>');
            });
            __that.__html.push('</ul>');
        }
        
        public buildTree(parts: any,treeNode: any): void {
            if(parts.length === 0)
            {
                return; 
            }

            for(var i = 0 ; i < treeNode.length; i++)
            {
                if(parts[0] == treeNode[i].text)
                {
                    this.buildTree(parts.splice(1,parts.length),treeNode[i].children);
                    return;
                }
            }

            var newNode = {'text': parts[0] ,'children':[]};
            treeNode.push(newNode);
            this.buildTree(parts.splice(1,parts.length),newNode.children);
        }
        
        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type == 'modules') {
                var list = receivedObject.data;
                var data = [];
                
                for(var i = 0; i < list.length; i++) {
                    list[i] = list[i].split("\\");
                    list[i].splice(0, 6);
                    this.buildTree(list[i], data);    
                }
                
                this.renderTree(data);
                $('#jstree').append(this.__html.join(''));
                this.jstree();
            }
            if (receivedObject.type == 'infos') {
                for (var k in receivedObject.data) {
                    $('.infos-' + k).append(receivedObject.data[k]);
                }
                var icon = '';
                switch (receivedObject.data['platform']) {
                    case 'linux':
                        icon = 'linux.png';
                        break;
                    case 'win32':
                        icon = 'windows.png';
                        break;
                    case 'win64':
                        icon = 'windows.png';
                        break;
                    case 'darwin':
                        icon = 'apple.png';
                        break;
                }
                
                $('.infos-platform img').attr('src', '/images/systems/' + icon);
            }
            if (receivedObject.type == 'memory') {
                if(!this._chart) {
                    this.chart();
                }
                if (this._time >= 70) {
                    this._chart.data.datasets[0].data.splice(0, 1);
                    this._chart.data.datasets[1].data.splice(0, 1);
                    this._chart.data.datasets[2].data.splice(0, 1);   
                    this._chart.data.labels.splice(0, 1);                 
                }
                
                this._chart.data.labels.push(this._time);
                
                this._chart.data.datasets[0].data.push(receivedObject.data['heapUsed']);  
                this._chart.data.datasets[1].data.push(receivedObject.data['heapTotal']);   
                this._chart.data.datasets[2].data.push(receivedObject.data['rss']);     
                               
                this._chart.update();   
                this._time += 5;
            }
        }
    }

    Core.RegisterDashboardPlugin(new NodejsDashboard());
}
