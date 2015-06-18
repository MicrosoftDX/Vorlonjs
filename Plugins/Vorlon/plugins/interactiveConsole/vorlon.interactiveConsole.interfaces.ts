module VORLON {

    export interface ObjectPropertyDescriptor {
        name: string;
        val: any;
    }

    export interface ObjectDescriptor {
        proto?: ObjectDescriptor;
        functions: Array<string>;
        properties: Array<ObjectPropertyDescriptor>;
    }
    
    export interface ConsoleEntry {
        type: any;
        messages: Array<any>;
    }
}