module VORLON {
    
    export enum ScopeType { NgRepeat, RootScope, Controller, Directive };
    export enum PropertyType { Array, Object, Number, String, Boolean, Null };
    export enum MessageType { ReloadWithDebugInfo };
    
    export interface Scope {
        $id: number;
        $parentId: number;
        $children: Scope[];
        $functions: string[];
        $type: ScopeType;
        $name: string;
    }
}