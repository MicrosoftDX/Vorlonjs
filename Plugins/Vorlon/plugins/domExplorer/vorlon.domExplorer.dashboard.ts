module VORLON {
    declare var $: any;

    export class DOMExplorerDashboard extends DashboardPlugin {
        private _lastReceivedObject = null;
        private _containerDiv: HTMLElement;
        public treeDiv: HTMLElement;
        public styleView: HTMLElement;
        private _computedsection: HTMLElement;
        private _dashboardDiv: HTMLDivElement;
        public refreshButton: Element;
        public inspectButton: Element;
        public clikedNodeID = null;
        public _selectedNode: DomExplorerNode;
        public _highlightedNode: string;
        public _rootNode: DomExplorerNode;
        private _autorefresh: boolean = false;
        public _innerHTMLView: HTMLTextAreaElement;
        private _margincontainer: HTMLElement;
        private _bordercontainer: HTMLElement;
        private _paddingcontainer: HTMLElement;
        private _sizecontainer: HTMLElement;
        public _editablemode: boolean = false;
        private _editableElement: HTMLElement;
        private _searchinput: HTMLInputElement;
        private _searchresults: HTMLInputElement;
        private _stylesEditor: DomExplorerPropertyEditor;
        private _lengthSearch;
        private _positionSearch;
        private _selectorSearch;
        private _clientHaveMutationObserver: boolean = false;

        constructor() {
            super("domExplorer", "control.html", "control.css");
            this._id = "DOM";
            this._ready = false;
        }

        public startDashboardSide(div: HTMLDivElement = null): void {
            this._dashboardDiv = div;
            this._insertHtmlContentAsync(this._dashboardDiv,(filledDiv: HTMLElement) => {
                this._containerDiv = filledDiv;
                this.treeDiv = Tools.QuerySelectorById(filledDiv, "treeView");
                this._innerHTMLView = <HTMLTextAreaElement> Tools.QuerySelectorById(filledDiv, "innerHTMLView");

                this._margincontainer = <HTMLTextAreaElement> Tools.QuerySelectorById(filledDiv, "margincontainer");
                this._bordercontainer = <HTMLTextAreaElement> Tools.QuerySelectorById(filledDiv, "bordercontainer");
                this._paddingcontainer = <HTMLTextAreaElement> Tools.QuerySelectorById(filledDiv, "paddingcontainer");
                this._sizecontainer = <HTMLTextAreaElement> Tools.QuerySelectorById(filledDiv, "sizecontainer");
                this._computedsection = <HTMLTextAreaElement> Tools.QuerySelectorById(filledDiv, "computedsection");

                this._searchinput = <HTMLInputElement> Tools.QuerySelectorById(filledDiv, "searchinput");
                this._searchresults = <HTMLInputElement> Tools.QuerySelectorById(filledDiv, "searchresults");
                this.styleView = Tools.QuerySelectorById(filledDiv, "styleView");
                var domSettings = new DomSettings(this);
                this.searchDOM();
                this.refreshButton = this._containerDiv.querySelector('x-action[event="refresh"]');
                this.inspectButton = this._containerDiv.querySelector('x-action[event="inspect"]');
                this._stylesEditor = new DomExplorerPropertyEditor(this);
                this._containerDiv.addEventListener('inspectFromClient',() => {
                    this.sendCommandToClient('inspect');
                });
                this._containerDiv.addEventListener('refresh', () => {
                    this.sendCommandToClient('refresh');
                });
                this._containerDiv.addEventListener('gethtml',() => {
                    this.sendCommandToClient('getInnerHTML', {
                        order: this._selectedNode.node.internalId
                    });
                });

                this._containerDiv.addEventListener('savehtml',() => {
                    this.clikedNodeID = this._selectedNode.node.internalId;
                    this.sendCommandToClient('saveinnerHTML', {
                        order: this._selectedNode.node.internalId,
                        innerhtml: this._innerHTMLView.value
                    });
                });
                this.treeDiv.addEventListener('click',(e: Event) => {
                    var button = <HTMLElement>e.target;
                    if (button.className.match('treeNodeButton')) {
                        button.hasAttribute('data-collapsed') ? button.removeAttribute('data-collapsed') : button.setAttribute('data-collapsed', '');
                    }
                });

                this.treeDiv.addEventListener('mouseenter',(e: Event) => {
                    var node = <any>e.target;
                    var parent = node.parentElement;
                    var isHeader = node.className.match('treeNodeHeader');
                    if (isHeader || parent.className.match('treeNodeClosingText')) {
                        if (isHeader) {
                            parent.setAttribute('data-hovered-tag', '');
                            var id = $(node).data('internalid');
                            if (id) {
                                this.hoverNode(id);
                            }
                        }
                        else {
                            parent.parentElement.setAttribute('data-hovered-tag', '');
                            var id = $(parent).data('internalid');
                            if (id) {
                                this.hoverNode(id);
                            }
                        }
                    }
                }, true);

                this.treeDiv.addEventListener('mouseleave',(e: Event) => {
                    var node = <HTMLElement>e.target;
                    if (node.className.match('treeNodeHeader') || node.parentElement.className.match('treeNodeClosingText')) {
                        var hovered = this.treeDiv.querySelector('[data-hovered-tag]');
                        if (hovered) hovered.removeAttribute('data-hovered-tag');
                        this.hoverNode(null, true);
                        // var id = $(node).data('internalid');
                        // if (id) {
                        //     this.hoverNode(id, true);
                        // }
                        // else {
                        //     var id = $(node.parentElement).data('internalid');
                        //     if (id) {
                        //         this.hoverNode(id, true);
                        //     }
                        // }
                    }

                }, true);

                $('.dom-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
                $("#accordion h3", this._containerDiv).click((elt) => {
                    $('.visible', elt.target.parentElement).removeClass('visible');
                    $('#' + elt.target.className, elt.target.parentElement).addClass('visible');
                    elt.target.classList.add('visible');
                    if (elt.target.className.indexOf("htmlsection") !== -1) {
                        this.sendCommandToClient('getInnerHTML', {
                            order: this._selectedNode.node.internalId
                        });
                    }
                    else if (elt.target.className.indexOf("layoutsection") !== -1) {
                        this.sendCommandToClient('getStyle', {
                            order: this._selectedNode.node.internalId
                        });
                    }
                    else if (elt.target.className.indexOf("computedsection") !== -1) {
                        this.sendCommandToClient('getComputedStyleById', {
                            order: this._selectedNode.node.internalId
                        });
                    }
                });
                this._ready = true;
                this.sendCommandToClient("getMutationObeserverAvailability");
            });
        }

        private searchDOM() {

            this._searchinput.addEventListener("keydown",(evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    evt.preventDefault();
                    this._searchresults.innerHTML = "";
                    this._searchresults.classList.remove('noresults');
                    this._searchresults.classList.remove('found');
                    this._selectorSearch = this._searchinput.value;
                    if (this._selectorSearch === this._searchinput.value) {
                        this.sendCommandToClient("searchDOMBySelector", { selector: this._searchinput.value, position: this._positionSearch });
                    }
                    else {
                        this._positionSearch = 0;
                        this.sendCommandToClient("searchDOMBySelector", { selector: this._searchinput.value });
                    }
                }
            });
        }

        public makeEditable(element: HTMLElement): void {
            if (element.contentEditable == "true") { return; }
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(element, 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            if (this._editableElement)
                this.undoEditable(this._editableElement);
            element.contentEditable = "true";
            this._editablemode = true;
            this._editableElement = element;
            Tools.AddClass(element, "editable");
            $(element).focus();
            $(element).closest(".treeNodeSelected").addClass("editableselection");
        }

        public undoEditable(element: HTMLElement): void {
            this._editablemode = false;
            element.contentEditable = "false";
            Tools.RemoveClass(element, "editable");
            $(element).closest(".treeNodeSelected").addClass("editableselection");
            this._editableElement = null;
        }

        public onRealtimeMessageReceivedFromClientSide(receivedObject: any): void {
            if (receivedObject.type === "contentchanged" && !this._editablemode && (!this._clientHaveMutationObserver || this._autorefresh == false)) {
                this.dirtyCheck();
            } else if (receivedObject.type === "contentchanged" && receivedObject.internalId !== null && this._clientHaveMutationObserver) {
                if (this._autorefresh)
                    this.sendCommandToClient('refreshNode', {
                        order: receivedObject.internalId
                    });
                else
                    this.dirtyCheck();
            }
        }

        public contentChanged() {
            this.refreshButton.setAttribute('changed', '');
        }
        public setInnerHTMLView(data: any) {
            this._innerHTMLView.value = data.innerHTML;
        }
        public setComputedStyle(data: Array<any>) {
            if (data && data.length) {
                data.forEach((item) => {
                    var root = new FluentDOM('div', 'styleWrap', this._computedsection);
                    root.append('span', 'styleLabel',(span) => {
                        span.text(item.name);
                    });
                    root.append('span', 'styleValue',(span) => {
                        span.text(item.value);
                    });
                });
            }
        }
        public setLayoutStyle(data: LayoutStyle) {
            this._margincontainer.parentElement.parentElement.classList.remove('hide');
            $('.top', this._margincontainer).html(data.margin.top);
            $('.bottom', this._margincontainer).html(data.margin.bottom);
            $('.left', this._margincontainer).html(data.margin.left);
            $('.right', this._margincontainer).html(data.margin.right);
            $('.top', this._bordercontainer).html(data.border.topWidth);
            $('.bottom', this._bordercontainer).html(data.border.bottomWidth);
            $('.left', this._bordercontainer).html(data.border.leftWidth);
            $('.right', this._bordercontainer).html(data.border.rightWidth);
            $('.top', this._paddingcontainer).html(data.padding.top);
            $('.bottom', this._paddingcontainer).html(data.padding.bottom);
            $('.left', this._paddingcontainer).html(data.padding.left);
            $('.right', this._paddingcontainer).html(data.padding.right);
            var w = data.size.width;
            if (w && w.indexOf('.') !== -1) {
                w = w.split('.')[0] + 'px';
            }
            var h = data.size.height;
            if (h && h.indexOf('.') !== -1) {
                h = h.split('.')[0] + 'px';
            }
            $(this._sizecontainer).html(w + " x " + h);
        }

        public searchDOMByResults(data: any) {
            this._lengthSearch = data.length;
            this._selectorSearch = data.selector;
            this._positionSearch = data.position;
            if (this._selectorSearch) {
                if (this._lengthSearch) {
                    this._searchresults.classList.remove('noresults');
                    this._searchresults.classList.add('found');
                    this._searchresults.setAttribute('content', this._positionSearch + "/" + this._lengthSearch);
                } else {
                    this._searchresults.classList.remove('found');
                    this._searchresults.classList.add('noresults');
                }
            }
            else {
                this._searchresults.classList.remove('noresults');
                this._searchresults.classList.remove('noresults');
            }
        }

        public mutationObeserverAvailability(data: any) {
            this._clientHaveMutationObserver = data.availability;
        }

        public initDashboard(root: PackagedNode) {
            this.refreshButton.removeAttribute('changed');
            this._lastReceivedObject = root;
            while (this.treeDiv.hasChildNodes()) {
                this.treeDiv.removeChild(this.treeDiv.lastChild);
            }
            if (this._rootNode)
                this._rootNode.dispose();
            if (this.treeDiv.parentElement) 
                this.treeDiv.parentElement.classList.add('active');
            this._rootNode = new DomExplorerNode(this, null, this.treeDiv, root);
        }

        public updateDashboard(node: PackagedNode) {
            if (this._rootNode) {
                this._rootNode.update(node);
            }
        }

        public setAutorefresh(value: boolean) {
            this._autorefresh = value;
        }

        public getContainerDiv(): HTMLElement {
            return this._containerDiv;
        }

        dirtyCheck() {
            this.refreshButton.setAttribute('changed', '');
            if (this._autorefresh) {
                this.sendCommandToClient('refresh');
            }
        }

        hoverNode(internalId: string, unselect: boolean = false) {
            this._highlightedNode = internalId;
            if (!internalId) {
                this.sendCommandToClient('unhighlight', {
                    order: null
                });
            }
            else if (unselect) {
                setTimeout(()=>{         
                    if (!this._highlightedNode){           
                        this.sendCommandToClient('unhighlight', {
                            order: internalId
                        });    
                    }
                }, 5);                
            }
            else {
                this.sendCommandToClient('highlight', {
                    order: internalId
                });
            }

        }

        select(selected: DomExplorerNode) {
            $("#accordion .stylessection ").trigger('click');
            this._margincontainer.parentElement.parentElement.classList.add('hide');
            if (this._selectedNode) {
                this._selectedNode.selected(false);
                this.sendCommandToClient('unselect', {
                    order: this._selectedNode.node.internalId
                });
            } else {
                this.sendCommandToClient('unselect', {
                    order: null
                });
            }

            if (selected) {
                this._selectedNode = selected;
                this._selectedNode.selected(true);
                this.sendCommandToClient('select', {
                    order: this._selectedNode.node.internalId
                });
                this._stylesEditor.generateStyles(selected.node, selected.node.internalId);
                //this._stylesEditor.generateStyles(selected.node, selected.node.internalId);
                this._innerHTMLView.value = "";
            } else {
                this._selectedNode = null;
            }
        }
        
        setNodeStyle(internalId: string, styles){
            if (this._selectedNode && this._selectedNode.node.internalId == internalId){
                this._stylesEditor.generateStyles(this._selectedNode.node, this._selectedNode.node.internalId, styles);
            }
        }
    }

    DOMExplorerDashboard.prototype.DashboardCommands = {
        init(root: PackagedNode) {
            var plugin = <DOMExplorerDashboard>this;
            plugin.initDashboard(root);
        },
        contentChanged() {

        },
        searchDOMByResults(data: any) {
            var plugin = <DOMExplorerDashboard>this;
            plugin.searchDOMByResults(data);

        },
        mutationObeserverAvailability(data: any) {
            var plugin = <DOMExplorerDashboard>this;
            plugin.mutationObeserverAvailability(data);
        },
        innerHTML(data: any) {
            var plugin = <DOMExplorerDashboard>this;
            plugin.setInnerHTMLView(data);
        },
        setLayoutStyle(data: any) {
            var plugin = <DOMExplorerDashboard>this;
            plugin.setLayoutStyle(data);
        },
        setComputedStyle(data: any) {
            var plugin = <DOMExplorerDashboard>this;
            plugin.setComputedStyle(data);
        },
        refreshNode(node: PackagedNode) {
            var plugin = <DOMExplorerDashboard>this;
            plugin.updateDashboard(node);
        },
        nodeStyle(data: any){
            console.log("dashboard receive node style", data);
            var plugin = <DOMExplorerDashboard>this;
            plugin.setNodeStyle(data.internalID, data.styles);
        }
    }

    export class DomExplorerNode {
        private static _spaceCheck = /[^\t\n\r ]/;
        public element: HTMLElement;
        public header: HTMLElement;
        public headerAttributes: HTMLElement;
        public node: PackagedNode;
        public contentContainer: HTMLElement;
        public attributes: DomExplorerNodeAttribute[] = [];
        public childs: DomExplorerNode[] = [];
        plugin: DOMExplorerDashboard;
        parent: DomExplorerNode;

        constructor(plugin: DOMExplorerDashboard, parent: DomExplorerNode, parentElt: HTMLElement, node: PackagedNode, oldNode?: DomExplorerNode) {
            this.parent = parent;
            this.node = node;
            this.plugin = plugin;
            if (oldNode) {
                this.parent = oldNode.parent;
                this.element = oldNode.element;
                this.element.innerHTML = "";
                this.render(parentElt, true);
            }
            else {
                this.render(parentElt);
            }
        }

        public dispose() {
            for (var i = 0, l = this.childs.length; i < l; i++) {
                this.childs[i].dispose();
            }

            this.plugin = null;
            this.parent = null;
            this.element = null;
            this.header = null;
            this.headerAttributes = null;
            this.contentContainer = null;
        }


        public update(node: PackagedNode) {
            this.plugin.refreshButton.removeAttribute('changed');
            var newNode = this.insertReceivedObject(node, this.plugin._rootNode);

            if (node.highlightElementID)
                this.openNode(node.highlightElementID);
        }
        private insertReceivedObject(receivedObject: PackagedNode, root: DomExplorerNode): DomExplorerNode {
            if ((root && root.node && root.node.internalId === this.plugin.clikedNodeID) || (this.plugin.clikedNodeID === null && root.node.internalId === receivedObject.internalId)) {
                this.plugin.clikedNodeID = null;
                var newNode: DomExplorerNode;
                if (root.parent === null) {
                    newNode = new DomExplorerNode(root.plugin, null, this.plugin.treeDiv, receivedObject, root);
                } else {
                    newNode = new DomExplorerNode(root.plugin, root.parent, root.parent.element, receivedObject, root);
                }
                root.childs = newNode.childs;
                root.node.hasChildNodes = false;
                return root;
            }
            else {
                if (root && root.childs && root.childs.length) {
                    for (var index = 0; index < root.childs.length; index++) {
                        var res = this.insertReceivedObject(receivedObject, root.childs[index])
                        if (res) {
                            root.childs.length[index] = res;
                            return root;
                        }
                    }
                }
            }
        }

        openNode(highlightElementID: string) {
            $('#plusbtn' + highlightElementID).trigger('click');
            $('.treeNodeSelected').removeClass('treeNodeSelected');
            var domnode = $('#domNode' + highlightElementID);
            if (domnode.length == 0) {
                return;
            }

            domnode.addClass('treeNodeSelected');
            var container = $(this.plugin.treeDiv);
            container.animate({ scrollTop: domnode.offset().top - container.offset().top + container.scrollTop() });
        }

        selected(selected: boolean) {
            if (selected) {
                $('.treeNodeSelected').removeClass('treeNodeSelected');
                Tools.AddClass(this.element, 'treeNodeSelected');
            } else {
                $('.treeNodeSelected').removeClass('treeNodeSelected');
            }
        }

        render(parent: HTMLElement, isUpdate: boolean = false) {
            if (this.node.name === "#comment") {
                this.renderCommentNode(parent, isUpdate);
            }
            else if (this.node.type == "3") {
                this.renderTextNode(parent, isUpdate);
            } else {
                this.renderDOMNode(parent, isUpdate);
            }
        }
        sendTextToClient() {
            this.plugin.sendCommandToClient('setElementValue', {
                value: this.element.innerHTML,
                order: this.parent.node.internalId
            });
            this.plugin.undoEditable(this.element);
        }
        renderCommentNode(parentElt: HTMLElement, isUpdate: boolean = false) {
            if (DomExplorerNode._spaceCheck.test(this.node.content)) {

                if (!isUpdate) {
                    var textNode = new FluentDOM('span', 'nodeTextContent nodeComment', parentElt);
                    this.element = textNode.element;
                    textNode.text(this.node.content.trim()).editable(false);
                }
                else {
                    this.element.innerHTML = "";
                }
            }
        }
        renderTextNode(parentElt: HTMLElement, isUpdate: boolean = false) {
            if (DomExplorerNode._spaceCheck.test(this.node.content)) {
                if (!isUpdate) {
                    var textNode = new FluentDOM('span', 'nodeTextContent', parentElt);
                    this.element = textNode.element;
                    textNode.text(this.node.content.trim())
                        .editable(false)
                        .blur(() => this.sendTextToClient())
                        .keydown((evt) => {
                        if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                            this.sendTextToClient();
                        }
                    }).click(() => {
                        this.plugin.makeEditable(this.element);
                    });
                }
                else {
                    this.element.innerHTML = "";
                }
            }
        }

        renderDOMNode(parentElt: HTMLElement, isUpdate: boolean = false) {
            parentElt.setAttribute('data-has-children', '');
            if (!isUpdate) {
                var root = new FluentDOM('DIV', 'domNode', parentElt);
                this.element = root.element;
            }
            else {
                this.element.innerHTML = "";
            }
            this.element.id = "domNode" + this.node.internalId;
            this.renderDOMNodeContent();
        }

        renderDOMNodeContent() {
            var root = FluentDOM.forElement(this.element);
            root.append('BUTTON', 'treeNodeButton',(nodeButton) => {
                nodeButton.element.id = "plusbtn" + this.node.internalId;
                if (this.node.hasChildNodes && (!this.node.children || this.node.children.length === 0)) {
                    Tools.AddClass(this.element, "collapsed");
                    nodeButton.attr("data-collapsed", "");
                } else {
                    Tools.RemoveClass(this.element, "collapsed");
                }
                nodeButton.attr('button-block', '');
                nodeButton.click(() => {
                    if (this.node.hasChildNodes && !nodeButton.element.className.match('loading')) {
                        Tools.AddClass(nodeButton.element, "loading");
                        this.plugin.clikedNodeID = this.node.internalId;
                        this.plugin.sendCommandToClient('refreshNode', {
                            order: this.node.internalId
                        });
                    }
                });
            });

            var that = this;
            var menu = (idtarget) => {
                $('.b-m-mpanel').remove();
                var option = {
                    width: 180, items: [
                        {
                            text: "Edit content as HTML", icon: "", alias: "1-1", action: () => {
                                that.parent.plugin.select(that);
                                that.parent.plugin.sendCommandToClient('getInnerHTML', {
                                    order: that.plugin._selectedNode.node.internalId
                                });
                                $("#accordion .htmlsection").trigger('click');
                            }
                        },
                        {
                            text: "Add attribute", alias: "1-3", icon: "", action: () => {
                                var attr = new DomExplorerNodeAttribute(that, "name", "value");
                                that.attributes.push(attr);
                            }
                        }
                    ]
                };
                $('.b-m-mpanel').remove();
                $(idtarget).contextmenu(option);

            }
            root.append("SPAN", "treeNodeHeader",(header) => {
                this.header = header.element;
                header.click(() => this.plugin.select(this));
                header.createChild("SPAN", "opentag").text('<');
                var nodename = header.createChild("SPAN", "nodeName");
                nodename.text(this.node.name);
                header.element.id = "treeNodeHeader-" + this.node.internalId;
                $(this.header).data("internalid", this.node.internalId);
                this.headerAttributes = header.createChild("SPAN", "attributes").element;
                this.node.attributes.forEach((attr) => {
                    this.addAttribute(attr[0], attr[1]);
                });
                header.createChild("SPAN", "closetag").text('>');

                nodename.element.addEventListener("contextmenu",(evt) => {
                    menu("#treeNodeHeader-" + that.node.internalId);
                });
            });
            if (this.node.isEmpty) {
                this.header.classList.add('emptynode');
            }
            else {
                root.append('DIV', 'nodeContentContainer',(container) => {
                    this.contentContainer = container.element;
                    if (this.node.hasChildNodes) {
                        this.contentContainer.id = "vorlon-" + this.node.internalId;
                    }

                    var nodes = this.node.children;
                    if (nodes && nodes.length) {
                        for (var index = 0; index < nodes.length; index++) {
                            var child = nodes[index];
                            if (child.nodeType != 3) {
                                var node = new DomExplorerNode(this.plugin, this, this.contentContainer, child);
                                this.childs.push(node);
                            }
                        }
                    }
                });
            }
            if (this.node.name) {
                if (this.node.name != "input" && this.node.name != "meta" && this.node.name != "link" && this.node.name != "img" && this.node.name != "br" && this.node.name != "hr") {
                    root.append("DIV", "treeNodeClosingText",(footer) => {
                        footer.createChild("SPAN", "openclosingtag").text('</');
                        footer.createChild("SPAN", "nodeName").text(this.node.name);
                        footer.createChild("SPAN", "closetag").text('>');
                        if (!footer.element.dataset)
                            footer.element.dataset = {};
                        $(footer.element).data("internalid", this.node.internalId);
                        footer.element.id = `treeNodeClosingText${ this.node.internalId}`;
                        footer.element.addEventListener("contextmenu",() => {
                            menu("#treeNodeClosingText" + this.node.internalId);
                        });
                    });
                }   
                else {
                   root.element.classList.add('notexpansible');                   
                   (<HTMLElement>  this.header.querySelector('.closetag')).innerHTML = "/>";
                }
            }
            // Main node

            // Tools
            if (this.node.id) {
                root.createChild("span", "treeNodeTools fa fa-terminal").click(() => {
                    this.plugin.sendCommandToPluginDashboard("CONSOLE", "setorder", {
                        order: this.node.id
                    });
                });
            }
        }

        addAttribute(name: string, value: string) {
            var attr = new DomExplorerNodeAttribute(this, name, value);
            this.attributes.push(attr);
        }
    }

    export class DomSettings {
        private _plugin: DOMExplorerDashboard;
        private _globalload: HTMLInputElement;
        private _autorefresh: HTMLInputElement;
        constructor(plugin: DOMExplorerDashboard) {
            this._plugin = plugin;
            this.setSettings(this._plugin.getContainerDiv());
        }

        private setSettings(filledDiv: HTMLElement) {
            this._globalload = <HTMLInputElement> Tools.QuerySelectorById(filledDiv, "globalload");
            this._autorefresh = <HTMLInputElement> Tools.QuerySelectorById(filledDiv, "autorefresh");
            this.loadSettings();
            this.refreshClient();
            $(this._autorefresh).change(() => {
                this.saveSettings();
            });
            $(this._globalload).change(() => {
                this.saveSettings();
            });
        }
        public refreshClient() {
            this._plugin.sendCommandToClient('setSettings', { globalload: this._globalload.checked, autoRefresh: this._autorefresh.checked });
        }
        private loadSettings() {
            var stringSettings = Tools.getLocalStorageValue("settings" + Core._sessionID);
            if (this._autorefresh && this._globalload && stringSettings) {
                var settings = JSON.parse(stringSettings);
                if (settings) {
                    $(this._globalload).switchButton({ checked: settings.globalload });
                    $(this._autorefresh).switchButton({ checked: settings.autorefresh });
                    if (settings.globalload)
                        this._plugin.sendCommandToClient('globalload', { value: true });
                    this._plugin.setAutorefresh(this._autorefresh.checked);
                    return;
                }
            }
            $(this._globalload).switchButton({ checked: false });
            $(this._autorefresh).switchButton({ checked: false });
            this._plugin.setAutorefresh(this._autorefresh.checked);
        }
        private saveSettings() {
            this.refreshClient();
            this._plugin.setAutorefresh(this._autorefresh.checked);
            Tools.setLocalStorageValue("settings" + Core._sessionID, JSON.stringify({
                "globalload": this._globalload.checked,
                "autorefresh": this._autorefresh.checked,
            }));
        }
    }

    export class DomExplorerNodeAttribute {
        public parent: DomExplorerNode;
        public element: HTMLElement;
        public name: string;
        public value: string;

        constructor(parent: DomExplorerNode, name: string, value: string) {
            this.parent = parent;
            this.name = name;
            this.value = value;
            this.render();
        }
        eventNode(nodeName, nodeValue, parentElementId: string) {
            var oldNodeName = nodeName.innerHTML;
            var that = this;
            var sendTextToClient = (attributeName, attributeValue, nodeEditable) => {
                this.parent.plugin.sendCommandToClient('attribute', {
                    attributeName: attributeName,
                    attributeOldName: oldNodeName,
                    attributeValue: attributeValue,
                    order: this.parent.node.internalId
                });

                if (!attributeName) { // delete attribute 
                    nodeName.parentElement.removeChild(nodeName);
                    nodeValue.parentElement.removeChild(nodeValue);
                }
                that.parent.plugin.undoEditable(nodeEditable);
            }
            var menu = () => {

                var option = {
                    width: 180, items: [
                        {
                            text: "Edit attribute name", icon: "", alias: "1-1", action: () => {
                                that.parent.plugin.makeEditable(nodeName);
                            }
                        },
                        {
                            text: "Edit attribute value", alias: "1-2", icon: "", action: () => {
                                that.parent.plugin.makeEditable(nodeValue);
                            }
                        },
                        {
                            text: "Edit content as HTML", alias: "1-3", icon: "", action: () => {
                                that.parent.plugin.select(that.parent);
                                that.parent.plugin.sendCommandToClient('getInnerHTML', {
                                    order: that.parent.plugin._selectedNode.node.internalId
                                });
                                $("#accordion .htmlsection").trigger('click');
                            }
                        },
                        {
                            text: "Add attribute", alias: "1-4", icon: "", action: () => {
                                that.parent.addAttribute("name", "value");
                            }
                        },
                        {
                            text: "Delete attribute", alias: "1-5", icon: "", action: () => {
                                sendTextToClient.bind(that)("", nodeValue.innerHTML, nodeValue);
                            }
                        }
                    ]
                };
                $('.b-m-mpanel').remove();
                $("#" + parentElementId).contextmenu(option);
            }
             
            nodeValue.addEventListener("contextmenu",() => {
                if (nodeValue.contentEditable != "true" && nodeName.contentEditable != "true")
                    menu.bind(this)("value");
            });
            nodeValue.addEventListener("click",(e) => {
                if(!this.uriCheck("click", nodeValue, e))
                    this.parent.plugin.makeEditable(nodeValue);
            });   
            nodeName.addEventListener("click",() => {
                this.parent.plugin.makeEditable(nodeName);
            });
            nodeName.addEventListener("contextmenu",() => {
                if (nodeValue.contentEditable != "true" && nodeName.contentEditable != "true")
                    menu.bind(this)("name");
            });
            nodeValue.addEventListener("blur",() => { 
                    sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeValue); 
            });
            nodeName.addEventListener("blur",() => {
                sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeName);
            });
            nodeName.addEventListener("keydown",(evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    evt.preventDefault();
                    sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeName);
                }
            });
            nodeValue.addEventListener("keydown",(evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    evt.preventDefault();
                    sendTextToClient.bind(this)(nodeName.innerHTML, nodeValue.innerHTML, nodeValue);
                }
            }); 
            nodeValue.addEventListener("mousemove",(e) => { 
                this.uriCheck("mousemove", nodeValue, e);
            });
            nodeValue.addEventListener("mouseout",(e) => {
                 $(nodeValue).removeClass("link-hovered"); 
            });  
        }
        
        uriCheck(triggerType: string, node, e) {
            if (e != null && e.ctrlKey) { 
                var urlPattern = /(\w+):\/*([^\/]+)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/i;
                if (urlPattern.test(node.innerText)) { 
                    switch(triggerType){
                        case "click": open(node.innerText); 
                        case "mousemove": $(node).addClass("link-hovered");
                        default: return true;
                    }  
                    return true;
                } 
            }
            else{ 
                $(node).removeClass("link-hovered"); 
            }   
            return false;
        }   

        render() {
            var node = new FluentDOM("SPAN", "nodeAttribute", this.parent.headerAttributes);
            this.element = node.element;
            var nodename = node.createChild("SPAN", "attr-name").html(this.name);
            node.element.id = VORLON.Tools.CreateGUID();
            node.createChild("SPAN").html("=\"");
            var nodevalue = node.createChild("SPAN", "attr-value").html(this.value);
            node.createChild("SPAN").html("\"");
            this.eventNode(nodename.element, nodevalue.element, node.element.id);
        }
    }

    export class DomExplorerPropertyEditor {
        //private parent: HTMLElement = null;
        public styles: Array<DomExplorerPropertyEditorItem> = [];
        public node: PackagedNode
        public plugin: DOMExplorerDashboard;
        private internalId: string;
        constructor(plugin: DOMExplorerDashboard) {
            this.plugin = plugin;
        }

        private _generateButton(parentNode: HTMLElement, text: string, className: string, attribute?: any) {
            var button = document.createElement("button");
            button.innerHTML = text;
            button.className = className;
            if (attribute)
                button.setAttribute(attribute.name, attribute.value);
            button.setAttribute('button-block', '');
            return parentNode.appendChild(button);
        }

        public generateStyles(node: PackagedNode, internalId: string, styles?:any): void {
            this.node = node;
            this.internalId = internalId;
            this.styles = [];
            while (this.plugin.styleView.hasChildNodes()) {
                this.plugin.styleView.removeChild(this.plugin.styleView.lastChild);
            }

            if (styles){
                // Current styles
                for (var index = 0; index < styles.length; index++) {
                    var style = styles[index];
                    var splits = style.split(":");
                    this.styles.push(new DomExplorerPropertyEditorItem(this, splits[0], splits[1], this.internalId));
                }
                // Append add style button
                this._generateButton(this.plugin.styleView, "+", "styleButton", null).addEventListener('click',(e) => {
                    new DomExplorerPropertyEditorItem(this, "property", "value", this.internalId, true);
                    this.plugin.styleView.appendChild(<HTMLElement>e.target);
                });
            }
        }

    }

    export class DomExplorerPropertyEditorItem {
        private parent: DomExplorerPropertyEditor;
        private name: string;
        private value: string;
        constructor(parent: DomExplorerPropertyEditor, name: string, value: string, internalId: string, editableLabel: boolean = false, generate: boolean = true) {
            this.parent = parent;
            this.name = name;
            this.value = value;
            if (generate)
                this._generateStyle(name, value, internalId, editableLabel);
        }
        private _generateStyle(property: string, value: string, internalId: string, editableLabel = false): void {
            var wrap = document.createElement("div");
            wrap.className = 'styleWrap';
            var label = document.createElement("div");
            label.innerHTML = property;
            label.className = "styleLabel";
            label.contentEditable = "false";
            var valueElement = this._generateClickableValue(label, value, internalId);
            wrap.appendChild(label);
            wrap.appendChild(valueElement);
            this.parent.plugin.styleView.appendChild(wrap);

            if (editableLabel) {
                label.addEventListener("blur",() => {
                    this.parent.plugin.undoEditable(label);
                });

                label.addEventListener("click",() => {
                    this.parent.plugin.makeEditable(label);
                });

                label.addEventListener("keydown",(evt) => {
                    if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                        this.parent.plugin.makeEditable(valueElement);
                        evt.preventDefault();
                    }
                });
            }
        }

        private _generateClickableValue(label: HTMLElement, value: string, internalId: string): HTMLElement {
            // Value
            var valueElement = document.createElement("div");
            valueElement.contentEditable = "false";
            valueElement.innerHTML = value || "&nbsp;";
            valueElement.className = "styleValue";
            valueElement.addEventListener("keydown",(evt) => {
                if (evt.keyCode === 13 || evt.keyCode === 9) { // Enter or tab
                    //Create the properties object of elements.
                    var propertyObject: any = {};
                    propertyObject.property = label.innerHTML.trim();
                    propertyObject.newValue = valueElement.innerHTML;
                    var propsArr = this.parent.styles;
                    //check if property exists in array
                    var found = false;
                    for (var index = 0; index < this.parent.styles.length; index++) {
                        var propObj = this.parent.styles[index];
                        if (propObj.name === propertyObject.property) {
                            this.parent.styles[index].value = propertyObject.newValue;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        this.parent.styles.push(new DomExplorerPropertyEditorItem(this.parent, propertyObject.property, propertyObject.newValue, internalId, false, false));
                    }
                    this.parent.node.styles = [];
                    for (var index = 0; index < this.parent.styles.length; index++) {
                        this.parent.node.styles.push(this.parent.styles[index].name + ":" + this.parent.styles[index].value);
                    }
                    this.parent.plugin.sendCommandToClient('style', {
                        property: label.innerHTML,
                        newValue: valueElement.innerHTML,
                        order: internalId
                    });
                    evt.preventDefault();
                    this.parent.plugin.undoEditable(valueElement);
                }
            });

            valueElement.addEventListener("blur",() => {
                this.parent.plugin.undoEditable(valueElement);
            });
            valueElement.addEventListener("click",() => {
                this.parent.plugin.makeEditable(valueElement);
            });
            return valueElement;
        }
    }

    export interface LayoutStyle {
        border: {
            rightWidth: string;
            leftWidth: string;
            topWidth: string;
            bottomWidth: string;
        };
        margin: {
            bottom: string;
            left: string;
            top: string;
            right: string;
        };
        padding: {
            bottom: string;
            left: string;
            top: string;
            right: string;
        };
        size: {
            width: string;
            height: string;
        }
    }
    // Register
    Core.RegisterDashboardPlugin(new DOMExplorerDashboard());
}

