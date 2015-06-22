module VORLON {
    export interface ObjPropertyDescriptor {
        type: string;
        name: string;
        fullpath: string;
        contentFetched: boolean;
        value?: any;
        content: Array<ObjPropertyDescriptor>;
    }    
}
