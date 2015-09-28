module VORLON {
    export class HTML {
        result = [];
        current;
        level = -1;
        arr = [];
        byTag = {};
        tagRE: RegExp = null;
        attrRE: RegExp = null;
        lookup;
    
        constructor() {
            this.tagRE = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
            
            this.attrRE = /([\w-]+)|['"]{1}([^'"]*)['"]{1}/g;
            this.lookup = (Object.create) ? Object.create(null) : {};
            this.lookup.area = true;
            this.lookup.base = true;
            this.lookup.br = true;
            this.lookup.col = true;
            this.lookup.embed = true;
            this.lookup.hr = true;
            this.lookup.img = true;
            this.lookup.input = true;
            this.lookup.keygen = true;
            this.lookup.link = true;
            this.lookup.menuitem = true;
            this.lookup.meta = true;
            this.lookup.param = true;
            this.lookup.source = true;
            this.lookup.track = true;
            this.lookup.wbr = true;
        }
        
        public parse(html: string) {
            html.replace(this.tagRE, (tag, index) => {
                
                var isOpen = tag.charAt(1) !== '/';
                var start = index + tag.length;
                var nextChar = html.charAt(start);
                var parent;
                
                if (isOpen) {
                    this.level++;
        
                    this.current = this.parseTag(tag);
        
                    if (!this.current.voidElement && nextChar && nextChar !== '<') {
                        this.current.children.push({
                            type: 'text',
                            content: html.slice(start, html.indexOf('<', start))
                        });
                    }
        
                    this.byTag[this.current.tagName] = this.current;
        
                    // if we're at root, push new base node
                    if (this.level === 0) {
                        this.result.push(this.current);
                    }
        
                    parent = this.arr[this.level - 1];
        
                    if (parent) {
                        parent.children.push(this.current);
                    }
        
                    this.arr[this.level] = this.current;
                }
                
                if (!isOpen || this.current.voidElement) {
                    this.level--;
                    if (nextChar !== '<' && nextChar) {
                        // trailing text node
                        this.arr[this.level].children.push({
                            type: 'text',
                            content: html.slice(start, html.indexOf('<', start))
                        });
                    }
                }
                return '';
            });
            return this.result;           
        }
        
        public parseTag(tag) {
            var i = 0;
            var key;
            var res = {
                type: 'tag',
                name: '',
                voidElement: false,
                attrs: {},
                children: []
            };
        
            tag.replace(this.attrRE, (match) => {
                if (i % 2) {
                    key = match;
                } else {
                    if (i === 0) {
                        if (this.lookup[match] || tag.charAt(tag.length - 2) === '/') {
                            res.voidElement = true;
                        }
                        res.name = match;
                    } else {
                        res.attrs[key] = match.replace(/['"]/g, '');
                    }
                }
                i++;
            });
        
            return res;
        }
    }
    
    export class WebStandardsDashboard extends DashboardPlugin {
        constructor() {
            //     name   ,  html for dash   css for dash
            super("webstandards", "control.html", "control.css");
            this._id = "WEBSTANDARDS";
            this.debug = true;
            this._ready = true;
            console.log('Started');
        }

        private _startCheckButton: HTMLButtonElement;
        private _rootDiv: HTMLElement;
        private _currentAnalyse = null;
        private _refreshloop: any;

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._insertHtmlContentAsync(div, (filledDiv) => {
                this._startCheckButton = <HTMLButtonElement>filledDiv.querySelector('#startCheck');
                this._rootDiv = <HTMLElement>filledDiv;

                // Send message to client when user types and hits return
                this._startCheckButton.addEventListener("click", (evt) => {
                    this._currentAnalyse = { processing: true };
                    this._rootDiv.classList.add("loading");
                    this.sendCommandToClient('startNewAnalyse');
                });

                this._refreshloop = setInterval(() => {
                    this.checkLoadingState();
                }, 3000);
            });
        }

        checkLoadingState() {
            if (!this._currentAnalyse || this._currentAnalyse.ended) {
                return;
            }

            if (this._currentAnalyse.processing) {

            } else {
                this._rootDiv.classList.remove("loading");
                this._currentAnalyse.ended = true;
            }
        }

        receiveHtmlContent(data: { html: string }) {
            if (!this._currentAnalyse) {
                this._currentAnalyse = { processing: true };
            }

            console.log('received html from client ', data.html);
            var fragment = document.implementation.createHTMLDocument("analyse");
            fragment.documentElement.innerHTML = data.html;
            var html = new HTML();
            var ast = html.parse(data.html);
            this._currentAnalyse.pendingLoad = 0;

            this._currentAnalyse.scripts = {};
            var scripts = fragment.querySelectorAll("script");
            for (var i = 0; i < scripts.length; i++) {
                var s = scripts[i];
                var src = s.attributes.getNamedItem("src");
                if (src) {
                    this._currentAnalyse.scripts[src.value] = { loaded: false, content: null };
                    console.log("found script " + src.value);
                    this.sendCommandToClient('fetchDocument', { url: src.value });
                    this._currentAnalyse.pendingLoad++;
                }
            }

            this._currentAnalyse.stylesheets = {};
            var stylesheets = fragment.querySelectorAll("link[rel=stylesheet]");
            for (var i = 0; i < stylesheets.length; i++) {
                var s = stylesheets[i];
                var href = s.attributes.getNamedItem("href");
                if (href) {
                    this._currentAnalyse.stylesheets[href.value] = { loaded: false, content: null };
                    console.log("found stylesheet " + href.value);
                    this.sendCommandToClient('fetchDocument', { url: href.value });
                    this._currentAnalyse.pendingLoad++;
                }
            }
        }

        receiveDocumentContent(data: { url: string, content: string, error?: string, status: number }) {
            console.log("document loaded " + data.url + " " + data.status);
            var item = null;
            if (this._currentAnalyse.stylesheets[data.url]) {
                item = this._currentAnalyse.stylesheets[data.url];
            }
            if (this._currentAnalyse.scripts[data.url]) {
                item = this._currentAnalyse.scripts[data.url];
            }

            if (item) {
                this._currentAnalyse.pendingLoad--;
                item.loaded = true;
                item.content = data.content;

                if (this._currentAnalyse.pendingLoad == 0) {
                    this._currentAnalyse.processing = false;
                }
            }
        }
    }

    WebStandardsDashboard.prototype.DashboardCommands = {
        htmlContent: function(data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveHtmlContent(data);
        },

        documentContent: function(data: any) {
            var plugin = <WebStandardsDashboard>this;
            plugin.receiveDocumentContent(data);
        }
    };

    //Register the plugin with vorlon core
    Core.RegisterDashboardPlugin(new WebStandardsDashboard());
}
