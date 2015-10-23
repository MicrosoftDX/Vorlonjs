interface Element {
    __vorlon: any;
}
interface HTMLElement {
    __vorlon: any;
}

module VORLON {
    export interface PackagedNode {
        id: string;
        type: string;
        name: string;
        classes: string;
        content: string;
        isEmpty: boolean;
        attributes: Array<any>;
        styles?: any;
        internalId: string;
        hasChildNodes: boolean;
        rootHTML: any;
        children: Array<any>;
        highlightElementID?: string;
    }
}
