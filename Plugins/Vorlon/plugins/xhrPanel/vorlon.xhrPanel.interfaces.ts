module VORLON {
    export interface NetworkEntry{
        id: string;
        url: string;
        status : number;
        statusText : string;
        method: string;
        responseType: string;
        responseHeaders : any;
        requestHeaders: any[];
        readyState: number;
    }
}
