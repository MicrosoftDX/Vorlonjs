module VORLON {
    export interface ObjExplorerPropertyDescriptor {
        name: string;
        type: string;
        value?: any;
    }

    export interface ObjExplorerFunctionDescriptor {
        name: string;
        args: string[];
    }
    
    export interface ObjExplorerObjDescriptor extends ObjExplorerPropertyDescriptor {
        proto?: ObjExplorerObjDescriptor;
        functions: Array<ObjExplorerFunctionDescriptor>;
        properties: Array<ObjExplorerPropertyDescriptor>;
        fullpath: string;
        contentFetched: boolean;
    }    
}
