module VORLON {
    export interface IDOMRule{
		id: string;
		title : string;
		nodeTypes : string[];
		check : any;
		endcheck? : any;
		generalRule? : boolean;
		description?: string;
	}
	
	export interface ICSSRule{
		id: string;
		title : string;
		check : any;
		endcheck? : any;
		description?: string;
	}
	
	export interface IScriptRule{
		id: string;
		title : string;
		check : any;
		endcheck? : any;
		description?: string;
	}		
}
