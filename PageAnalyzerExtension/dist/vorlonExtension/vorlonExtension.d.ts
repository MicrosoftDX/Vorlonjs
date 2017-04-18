declare var dashboardTabId: number;

declare var qs: any;
declare var tabid: number;
declare var vorlonDashboard: VORLON.DashboardManager;

declare module VORLON {
    class DashboardManager {
        static ExtensionConfigUrl: string;
        static TargetTabid: number;
        static DisplayingTab: boolean;
        static TabList: any;
        static PluginsLoaded: boolean;
        constructor(tabId: any);
        static GetInternalTabObject(tab: browser.tabs.Tab): any;
        static GetTabs(): void;
        static AddTabToList(tab: any): void;
        static TabCount(): number;
        static loadPlugins(): void;
        static hideWaitingLogo(): void;
        static showWaitingLogo(): void;
        static divMapper(pluginId: number): HTMLDivElement;
        static addTab(tab: any): void;
        static removeTab(tab: any): void;
        static renameTab(tab: any): void;
        static removeInTabList(tab: any): void;
    }
}

interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}
declare class Promise<R> implements Thenable<R> {
    /**
     * If you call resolve in the body of the callback passed to the constructor,
     * your promise is fulfilled with result object passed to resolve.
     * If you call reject your promise is rejected with the object passed to reject.
     * For consistency and debugging (eg stack traces), obj should be an instanceof Error.
     * Any errors thrown in the constructor callback will be implicitly passed to reject().
     */
    constructor(callback: (resolve: (value?: R | Thenable<R>) => void, reject: (error?: any) => void) => void);
    /**
     * onFulfilled is called when/if "promise" resolves. onRejected is called when/if "promise" rejects.
     * Both are optional, if either/both are omitted the next onFulfilled/onRejected in the chain is called.
     * Both callbacks have a single parameter , the fulfillment value or rejection reason.
     * "then" returns a new promise equivalent to the value you return from onFulfilled/onRejected after being passed through Promise.resolve.
     * If an error is thrown in the callback, the returned promise rejects with that error.
     *
     * @param onFulfilled called when/if "promise" resolves
     * @param onRejected called when/if "promise" rejects
     */
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Promise<U>;
    /**
     * Sugar for promise.then(undefined, onRejected)
     *
     * @param onRejected called when/if "promise" rejects
     */
    catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;
}
declare module Promise {
    /**
     * Make a new promise from the thenable.
     * A thenable is promise-like in as far as it has a "then" method.
     */
    function resolve<R>(value?: R | Thenable<R>): Promise<R>;
    /**
     * Make a promise that rejects to obj. For consistency and debugging (eg stack traces), obj should be an instanceof Error
     */
    function reject(error: any): Promise<any>;
    /**
     * Make a promise that fulfills when every item in the array fulfills, and rejects if (and when) any item rejects.
     * the array passed to all can be a mixture of promise-like objects and other objects.
     * The fulfillment value is an array (in order) of fulfillment values. The rejection value is the first rejection value.
     */
    function all<R>(promises: (R | Thenable<R>)[]): Promise<R[]>;
    /**
     * Make a Promise that fulfills when any item fulfills, and rejects if any item rejects.
     */
    function race<R>(promises: (R | Thenable<R>)[]): Promise<R>;
}
declare module 'es6-promise' {
    var foo: typeof Promise;
    module rsvp {
        var Promise: typeof foo;
    }
    export = rsvp;
}

declare var cssjs: any;
declare module VORLON {
    class WebStandardsClient extends ClientPlugin {
        sendedHTML: string;
        private _doctype;
        private _currentAnalyze;
        private _refreshLoop;
        constructor();
        refresh(): void;
        startClientSide(): void;
        startNewAnalyze(data: any): void;
        checkLoadingState(): void;
        initialiseRuleSummary(rule: any, analyze: any): any;
        prepareAnalyze(analyze: any): void;
        endAnalyze(analyze: any): void;
        cancelAnalyse(id: string): void;
        analyzeDOM(document: HTMLDocument, htmlContent: string, analyze: any): void;
        analyzeDOMNode(node: Node, rules: any, analyze: any, htmlContent: string): void;
        applyDOMNodeRule(node: Node, rule: IDOMRule, analyze: any, htmlContent: string): void;
        analyzeCssDocument(url: any, content: any, analyze: any): void;
        analyzeFiles(analyze: any): void;
        analyzeJsDocument(url: any, content: any, analyze: any): void;
        getDocumentContent(data: {
            analyzeid: string;
            url: string;
        }, file: {
            content: string;
            loaded: boolean;
            status?: number;
            encoding?: string;
            contentLength?: number;
            error?: any;
        }, resultcallback: (url: string, file: {
            content: string;
            loaded: boolean;
        }) => void): void;
        xhrDocumentContent(data: {
            analyzeid: string;
            url: string;
        }, resultcallback: (url: string, content: string, status: number, contentlength?: number, encoding?: string, errors?: any) => void): void;
        getAbsolutePath(url: any): string;
    }
}

declare var cssjs: any;
declare module VORLON {
    class WebStandardsDashboard extends DashboardPlugin {
        constructor();
        private _startCheckButton;
        private _rootDiv;
        private _currentAnalyseId;
        private _analysePending;
        private _analyseResult;
        private _cancelMode;
        private _rulesPanel;
        private _ruleDetailPanel;
        private _switchToRun();
        private _switchToCancel();
        startDashboardSide(div?: HTMLDivElement): void;
        setAnalyseResult(result: any): void;
        analyseCanceled(id: string): void;
        checkLoadingState(): void;
    }
}

declare module VORLON {
    interface IRuleCheck {
        items?: IRuleCheck[];
        title?: string;
        description?: string;
        alert?: string;
        message?: string;
        content?: string;
        type?: string;
        failed?: boolean;
        data?: any;
        skipRootLevel?: boolean;
    }
    interface IRule {
        id: string;
        title: string;
        disabled?: boolean;
        description?: string;
        prepare?: (rulecheck: IRuleCheck, analyzeSummary) => void;
        endcheck?: (rulecheck: IRuleCheck, analyzeSummary) => void;
    }
    interface IDOMRule extends IRule {
        nodeTypes: string[];
        check: (node, rulecheck: IRuleCheck, analyze, htmlcontent) => void;
        generalRule?: boolean;
    }
    interface ICSSRule extends IRule {
        check: (url: string, ast, rulecheck, analyzeSummary) => void;
    }
    interface IFileRule extends IRule {
        check: (rulecheck: any, analyzeSummary: any) => void;
    }
    interface IScriptRule extends IRule {
        check: (url: string, javascriptContent: string, rulecheck: any, analyzeSummary: any) => void;
    }
}

declare module VORLON {
    class BasePlugin {
        name: string;
        _ready: boolean;
        protected _id: string;
        _type: PluginType;
        loadingDirectory: string;
        constructor(name: string);
        Type: PluginType;
        getID(): string;
        isReady(): boolean;
    }
}

declare module VORLON {
    interface VorlonMessageMetadata {
        pluginID: string;
        side: RuntimeSide;
        messageType: string;
    }
    interface VorlonMessage {
        metadata: VorlonMessageMetadata;
        command?: string;
        data?: any;
    }
    class ClientMessenger {
        private _targetTabId;
        onRealtimeMessageReceived: (message: VorlonMessage) => void;
        constructor(side: RuntimeSide, targetTabId?: number);
        sendRealtimeMessage(pluginID: string, objectToSend: any, side: RuntimeSide, messageType?: string, command?: string): void;
    }
}

declare module VORLON {
    class ClientPlugin extends BasePlugin {
        ClientCommands: any;
        constructor(name: string);
        startClientSide(): void;
        onRealtimeMessageReceivedFromDashboardSide(receivedObject: any): void;
        sendToDashboard(data: any): void;
        sendCommandToDashboard(command: string, data?: any): void;
        trace(message: string): void;
        refresh(): void;
        _loadNewScriptAsync(scriptName: string, callback: () => void, waitForDOMContentLoaded?: boolean): void;
    }
}

declare module VORLON {
}

declare module VORLON {
    class _Core {
        _clientPlugins: ClientPlugin[];
        _dashboardPlugins: DashboardPlugin[];
        _messenger: ClientMessenger;
        _side: RuntimeSide;
        Messenger: ClientMessenger;
        ClientPlugins: Array<ClientPlugin>;
        DashboardPlugins: Array<DashboardPlugin>;
        RegisterClientPlugin(plugin: ClientPlugin): void;
        RegisterDashboardPlugin(plugin: DashboardPlugin): void;
        StartClientSide(): void;
        StartDashboardSide(tabid: number, divMapper: (number) => HTMLDivElement): void;
        private _Dispatch(message);
        private _DispatchPluginMessage(plugin, message);
        private _DispatchFromClientPluginMessage(plugin, message);
        private _DispatchFromDashboardPluginMessage(plugin, message);
    }
    var Core: _Core;
}

declare module VORLON {
    class DashboardPlugin extends BasePlugin {
        htmlFragmentUrl: any;
        cssStyleSheetUrl: any;
        DashboardCommands: any;
        constructor(name: string, htmlFragmentUrl: string, cssStyleSheetUrl: string);
        startDashboardSide(div: HTMLDivElement): void;
        onRealtimeMessageReceivedFromClientSide(receivedObject: any): void;
        sendToClient(data: any): void;
        sendCommandToClient(command: string, data?: any): void;
        trace(message: string): void;
        _insertHtmlContentAsync(divContainer: HTMLDivElement, callback: (filledDiv: HTMLDivElement) => void): void;
        private _stripContent(content);
    }
}

declare module VORLON {
    enum RuntimeSide {
        Client = 0,
        Dashboard = 1,
        Both = 2,
    }
    enum PluginType {
        OneOne = 0,
        MulticastReceiveOnly = 1,
        Multicast = 2,
    }
}

declare module VORLON {
    class Tools {
        static QueryString(): {};
        static QuerySelectorById(root: HTMLElement, id: string): HTMLElement;
        static SetImmediate(func: () => void): void;
        static setLocalStorageValue(key: string, data: string): void;
        static getLocalStorageValue(key: string): any;
        static interceptAddEventListener(): void;
        static Hook(rootObject: any, functionToHook: string, hookingFunction: (...optionalParams: any[]) => void): void;
        static _callBackID: number;
        static HookProperty(rootObjectName: string, propertyToHook: string, callback: (stackData: any) => void): void;
        static getCallStack(skipped: any): any;
        static CreateCookie(name: string, value: string, days: number): void;
        static ReadCookie(name: string): string;
        static CreateGUID(): string;
        static RemoveEmpties(arr: string[]): number;
        static AddClass(e: HTMLElement, name: string): HTMLElement;
        static RemoveClass(e: HTMLElement, name: string): HTMLElement;
        static ToggleClass(e: HTMLElement, name: string, callback?: (hasClass: boolean) => void): void;
        static htmlToString(text: any): any;
    }
    class FluentDOM {
        element: HTMLElement;
        childs: Array<FluentDOM>;
        parent: FluentDOM;
        constructor(nodeType: string, className?: string, parentElt?: Element, parent?: FluentDOM);
        static forElement(element: HTMLElement): FluentDOM;
        addClass(classname: string): FluentDOM;
        toggleClass(classname: string): FluentDOM;
        hasClass(classname: string): boolean;
        className(classname: string): FluentDOM;
        opacity(opacity: string): FluentDOM;
        display(display: string): FluentDOM;
        hide(): FluentDOM;
        visibility(visibility: string): FluentDOM;
        text(text: string): FluentDOM;
        html(text: string): FluentDOM;
        attr(name: string, val: string): FluentDOM;
        editable(editable: boolean): FluentDOM;
        style(name: string, val: string): FluentDOM;
        appendTo(elt: Element): FluentDOM;
        append(nodeType: string, className?: string, callback?: (fdom: FluentDOM) => void): FluentDOM;
        createChild(nodeType: string, className?: string): FluentDOM;
        click(callback: (EventTarget) => void): FluentDOM;
        blur(callback: (EventTarget) => void): FluentDOM;
        keydown(callback: (EventTarget) => void): FluentDOM;
    }
}

declare var axe: any;
declare module VORLON.WebStandards.Rules.Accessibility {
    var aXeCheck: IRule;
}

declare module VORLON.WebStandards.Rules.DOM {
    var deviceIcons: IDOMRule;
}

declare module VORLON.WebStandards.Rules.CSS {
    var mobileMediaqueries: ICSSRule;
}
declare module VORLON.WebStandards.Rules.DOM {
    var mobileMediaqueries: IDOMRule;
}

declare module VORLON.WebStandards.Rules.DOM {
    var useViewport: IDOMRule;
}

declare module VORLON.WebStandards.Rules.Files {
    var filesBundle: IFileRule;
}

declare module VORLON.WebStandards.Rules.Files {
    var contentEncoding: IFileRule;
}

declare module VORLON.WebStandards.Rules.Files {
    var filesMinification: IFileRule;
}

declare module VORLON.WebStandards.Rules.DOM {
    var dontUsePlugins: IDOMRule;
}

declare module VORLON.WebStandards.Rules.DOM {
    var browserdetection: IDOMRule;
}

declare module VORLON.WebStandards.Rules.DOM {
    var browserinterop: IDOMRule;
}

declare module VORLON.WebStandards.Rules.DOM {
    var dontUseBrowserConditionalComment: IDOMRule;
}

declare module VORLON.WebStandards.Rules.CSS {
    var cssfallback: ICSSRule;
}

declare module VORLON.WebStandards.Rules.CSS {
    var cssprefixes: ICSSRule;
}

declare module VORLON.WebStandards.Rules.DOM {
    var modernDocType: IDOMRule;
}

declare module VORLON.WebStandards.Rules.JavaScript {
    var librariesVersions: IScriptRule;
}
