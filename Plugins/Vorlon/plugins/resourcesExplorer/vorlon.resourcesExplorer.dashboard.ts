module VORLON {
    
    declare var $: any;
    
    export class ResourcesExplorerDashboard extends DashboardPlugin {
        
        constructor() {
            super("resourcesExplorer", "control.html", "control.css", "control.js");
            this._ready = false;
            this._id = "RESOURCES";
            //this.debug = true;
        }

        private _containerLocalStorage: HTMLElement;
        private _containerSessionStorage: HTMLElement;
        private _containerCookies: HTMLElement;
        private _containerDiv: HTMLElement;
        
        
        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._containerDiv = filledDiv;
                this._containerLocalStorage = Tools.QuerySelectorById(div, "localStorageTable");
                this._containerSessionStorage = Tools.QuerySelectorById(div, "sessionStorageTable");
                this._containerCookies = Tools.QuerySelectorById(div, "cookiesTable");
                
                this.toogleMenu();
                this.splitPlugin();
                this.searchResource();
                this.buttonEvent();
                this.addResource();
                this.removeResource();
                this.updateResource();
                
                this._ready = true;                
            })
        }

        public splitPlugin(): void {
            $('.dom-explorer2-container').split({
                orientation: 'vertical',
                limit: 50,
                position: '70%'
            });
        }

        public searchResource(): void {
            $("#searchlist").keyup(function() {
                var value = this.value.toLowerCase();

                $(".table-resources").find("tr").each(function(index) {
                    if (!index || $(this).hasClass('trHead')) return;
                    var id = $(this).find("td").eq(1).text().toLowerCase();
                    $(this).toggle(id.indexOf(value) !== -1);
                });
            });
        }

        public addResource(): void {
            
            var _that = this;
            
            $('.new-entry-localstorage input').keypress(function(e) {
                if(e.which == 13) {
                    var key = $('.new-entry-localstorage').find('.new-key-localstorage');
                    var value = $('.new-entry-localstorage').find('.new-value-localstorage');
                    _that.sendCommandToClient('order', {
                        order: "localStorage.setItem('"+key.val()+"', '"+value.val()+"')"
                    });
                    key.val('');
                    value.val('');
                    _that.sendCommandToClient('refresh');
                    $('.new-entry').fadeOut();
                }
            });

            $('.new-entry-sessionstorage input').keypress(function(e) {
                if(e.which == 13) {
                    var key = $('.new-entry-sessionstorage').find('.new-key-sessionstorage');
                    var value = $('.new-entry-sessionstorage').find('.new-value-sessionstorage');
                    _that.sendCommandToClient('order', {
                        order: "sessionStorage.setItem('"+key.val()+"', '"+value.val()+"')"
                    });
                    key.val('');
                    value.val('');
                    _that.sendCommandToClient('refresh');
                    $('.new-entry').fadeOut();
                }
            });

            $('.new-entry-cookies input').keypress(function(e) {
                if(e.which == 13) {
                    var key = $('.new-entry-cookies').find('.new-key-cookies');
                    var value = $('.new-entry-cookies').find('.new-value-cookies');
                    _that.sendCommandToClient('order', {
                        order: "document.cookie='"+key.val()+"="+value.val()+"';"
                    });
                    key.val('');
                    value.val('');
                    _that.sendCommandToClient('refresh');
                    $('.new-entry').fadeOut();
                }
            });       
        }

        public removeResource(): void {
            
            var _that = this;
            
            $('#localStorageTable').on('click', '.actionClass', function() {
                var key = $(this).next('td').text();
                _that.sendCommandToClient('order', {
                    order: "localStorage.removeItem('"+key+"')"
                });
                $(this).parent().remove();
            });
            
            $('#sessionStorageTable').on('click', '.actionClass', function() {
                var key = $(this).next('td').text();
                _that.sendCommandToClient('order', {
                    order: "sessionStorage.removeItem('"+key+"')"
                });
                $(this).parent().remove();
            });
            
            $('#cookiesTable').on('click', '.actionClass', function() {
                var key = $(this).next('td').text();
                _that.sendCommandToClient('order', {
                    order: "document.cookie='"+key+"=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';"
                });
                $(this).parent().remove();
            });
        }

        public updateResource(): void {
            
            var _that = this;
            
            $('.table-resources-localStorage').on('change', function(evt, newValue) {
                if($(evt.target).hasClass('keyClass')) {
                    var key = $(evt.target).data('key');
                    _that.sendCommandToClient('order', {
                        order: "localStorage.setItem('"+newValue+"', localStorage.getItem('"+key+"')); localStorage.removeItem('"+key+"');"
                    });
                    $(evt.target).data('key', newValue);
                } else {
                    var key = $(evt.target).prev('td').text();
                    _that.sendCommandToClient('order', {
                        order: "localStorage.setItem('"+key+"', '"+newValue+"')"
                    });
                }
            });
            
            $('.table-resources-sessionStorage').on('change', function(evt, newValue) {
                if($(evt.target).hasClass('keyClass')) {
                    var key = $(evt.target).data('key');
                    _that.sendCommandToClient('order', {
                        order: "sessionStorage.setItem('"+newValue+"', sessionStorage.getItem('"+key+"')); sessionStorage.removeItem('"+key+"');"
                    });
                    $(evt.target).data('key', newValue);
                } else {
                    var key = $(evt.target).prev('td').text();
                    _that.sendCommandToClient('order', {
                        order: "sessionStorage.setItem('"+key+"', '"+newValue+"')"
                    });
                }
            });
            
            $('.table-resources-cookies').on('change', function(evt, newValue) {
                if($(evt.target).hasClass('keyClass')) {
                    var key = $(evt.target).data('key');
                    var value = $(evt.target).next('td').text();
                    _that.sendCommandToClient('order', {
                        order: "document.cookie='"+key+"=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';"
                    });
                    _that.sendCommandToClient('order', {
                        order: "document.cookie='"+newValue+"="+value+"';"
                    });
                    $(evt.target).data('key', newValue);
                } else {
                    var key = $(evt.target).prev('td').text();
                    _that.sendCommandToClient('order', {
                        order: "document.cookie='"+key+"=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';"
                    });
                    _that.sendCommandToClient('order', {
                        order: "document.cookie='"+key+"="+newValue+"';"
                    });
                }
            });
        }

        public buttonEvent(): void {
            $('.refresh').click(() => {
                this.sendCommandToClient('refresh');
            });
            
            $('.add-value').click(() => {
                if($('.new-entry').is(':visible')) {
                    $('.new-entry').fadeOut();
                } else {
                    $("#treeView2").animate({ scrollTop: $('#treeView2').height() }, 1000);
                    $('.new-entry').fadeIn();
                }
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

        public processEntries(receivedObject: any): void {
            if (!this._containerLocalStorage){
                console.warn("ResourcesExplorer dashboard receive client message but is not ready");
                return;
            }     
            
            this._containerLocalStorage.innerHTML = "";
            this._containerSessionStorage.innerHTML = "";
            this._containerCookies.innerHTML = "";
            
            if (!receivedObject)
                return;

            if (receivedObject.localStorageList) {
                for (var i = 0; i < receivedObject.localStorageList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');
                    var tdAction = document.createElement('td');                    
                    
                    tdKey.className += " keyClass";
                    tdKey.dataset['key'] = receivedObject.localStorageList[i].key;
                    
                    tdValue.className += " valueClass";
                    tdAction.className += " actionClass";                    
                    
                    tdKey.innerHTML = receivedObject.localStorageList[i].key;
                    tdValue.innerHTML = receivedObject.localStorageList[i].value;
                    tdAction.innerHTML = '<i class="fa fa-times"></i>';   

                    tr.appendChild(tdAction);                    
                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerLocalStorage.appendChild(tr);
                }
                $('.table-resources-localStorage').editableTableWidget({editor: $('<textarea>')});
            }

            if (receivedObject.cookiesList) {
                for (var i = 0; i < receivedObject.cookiesList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');
                    var tdAction = document.createElement('td');  

                    tdKey.className += " keyClass";
                    tdKey.dataset['key'] = receivedObject.cookiesList[i].key;
                    tdValue.className += " valueClass";
                    tdAction.className += " actionClass";   
                    
                    tdKey.innerHTML = receivedObject.cookiesList[i].key;
                    tdValue.innerHTML = receivedObject.cookiesList[i].value;
                    tdAction.innerHTML = '<i class="fa fa-times"></i>';   

                    tr.appendChild(tdAction);
                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerCookies.appendChild(tr);
                }
                $('.table-resources-cookies').editableTableWidget({editor: $('<textarea>')});
            }
            
            if (receivedObject.sessionStorageList) {
                for (var i = 0; i < receivedObject.sessionStorageList.length; i++) {
                    var tr = document.createElement('tr');
                    var tdKey = document.createElement('td');
                    var tdValue = document.createElement('td');
                    var tdAction = document.createElement('td');  

                    tdKey.className += " keyClass";
                    tdKey.dataset['key'] = receivedObject.sessionStorageList[i].key;
                    tdValue.className += " valueClass";
                    tdAction.className += " actionClass";   
                    
                    tdKey.innerHTML = receivedObject.sessionStorageList[i].key;
                    tdValue.innerHTML = receivedObject.sessionStorageList[i].value;
                    tdAction.innerHTML = '<i class="fa fa-times"></i>';   

                    tr.appendChild(tdAction);
                    tr.appendChild(tdKey);
                    tr.appendChild(tdValue);
                    this._containerSessionStorage.appendChild(tr);
                }
                 $('.table-resources-sessionStorage').editableTableWidget({editor: $('<textarea>')});
            }            
            
        }
    }

    ResourcesExplorerDashboard.prototype.DashboardCommands = {
        resourceitems: function(data: any) {
            var plugin = <ResourcesExplorerDashboard>this;
            plugin.processEntries(data);
        }
    };
    
    //Register the plugin with vorlon core 
    Core.RegisterDashboardPlugin(new ResourcesExplorerDashboard());
} 