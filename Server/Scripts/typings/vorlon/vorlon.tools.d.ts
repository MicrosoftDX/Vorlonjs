declare module VORLON {
    class Tools {
        static SetImmediate(func: () => void): void;
        static Hook(rootObject: any, functionToHook: string, hookingFunction: (...optionalParams: any[]) => void): void;
        static CreateCookie(name: string, value: string, days: number): void;
        static ReadCookie(name: string): string;
        static CreateGUID(): string;
        static RemoveEmpties(arr: string[]): number;
        static AddClass(e: HTMLElement, name: string): HTMLElement;
        static RemoveClass(e: HTMLElement, name: string): HTMLElement;
    }
}
