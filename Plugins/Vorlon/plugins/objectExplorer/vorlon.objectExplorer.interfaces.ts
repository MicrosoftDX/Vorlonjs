module VORLON {
    export interface ObjExplorerPropertyDescriptor {
        name: string;
        type: string;
        fullpath: string;
        value?: any;
    }

    export interface ObjExplorerFunctionDescriptor {
        name: string;
        args: string[];
        fullpath: string;
    }
    
    export interface ObjExplorerObjDescriptor extends ObjExplorerPropertyDescriptor {
        proto?: ObjExplorerObjDescriptor;
        functions: Array<ObjExplorerFunctionDescriptor>;
        properties: Array<ObjExplorerPropertyDescriptor>;        
        contentFetched: boolean;
    }    
}
