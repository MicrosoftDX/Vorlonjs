module VORLON {
    export interface IDOMRule{
		id: string;
		title : string;
		nodeTypes : string[];
		check : any;
		generalRule? : boolean
	}
}
