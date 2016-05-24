declare module VORLON {
    class Tools {
        static IsWindowAvailable: boolean;
        static QuerySelectorById(root: HTMLElement, id: string): HTMLElement;
        static SetImmediate(func: () => void): void;
        static setLocalStorageValue(key: string, data: string): void;
        static getLocalStorageValue(key: string): any;
        static Hook(rootObject: any, functionToHook: string, hookingFunction: (...optionalParams: any[]) => void): void;
        static HookProperty(rootObjectName: string, propertyToHook: string, callback: any): void;
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
        static forElement(element: HTMLElement): VORLON.FluentDOM;
        addClass(classname: string): FluentDOM;
        toggleClass(classname: string): FluentDOM;
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
        createChild(nodeType: string, className?: string): VORLON.FluentDOM;
        click(callback: (EventTarget) => void): FluentDOM;
        blur(callback: (EventTarget) => void): FluentDOM;
        keydown(callback: (EventTarget) => void): FluentDOM;
    }
}
