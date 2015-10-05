module VORLON {
    export interface IDOMRule{
		id: string;
		title : string;
		nodeTypes : string[];
		check : (node, rulecheck, analyse, htmlcontent) => void;
		prepare? : (rulecheck, analyse, htmlcontent) => void;
		endcheck? : (rulecheck, analyse, htmlcontent) => void;
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
