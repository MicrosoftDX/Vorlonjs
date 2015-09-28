module VORLON {
    export interface INode {
		parent: INode;
		hasChildren: boolean;
		data: any;
		eltType: string;
	}
}
