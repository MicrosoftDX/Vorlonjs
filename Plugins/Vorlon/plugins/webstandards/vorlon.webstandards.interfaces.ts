module VORLON {
    export interface IDOMRule{
		id: string;
		title : string;
		nodeTypes : string[];
		prepare? : (rulecheck, analyse, htmlcontent) => void;
		check : (node, rulecheck, analyse, htmlcontent) => void;
		endcheck? : (rulecheck, analyse, htmlcontent) => void;
		generalRule? : boolean;
		description?: string;
	}
	
	export interface ICSSRule{
		id: string;
		title : string;
		prepare? : (rulecheck, analyseSummary) => void;
		check : (url: string, ast, rulecheck, analyseSummary) => void;
		endcheck? : (rulecheck, analyseSummary) => void;
		description?: string;
	}
	
	export interface IScriptRule{
		id: string;
		title : string;
		prepare? : (rulecheck: any, analyseSummary: any) => void;
		check : (url: string, javascriptContent: string, rulecheck: any, analyseSummary: any) => void;
		endcheck? : (rulecheck: any, analyseSummary: any) => void;
		description?: string;
	}		
}
