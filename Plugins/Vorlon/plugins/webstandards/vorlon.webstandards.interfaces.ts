module VORLON {
    export interface IDOMRule {
		id: string;
		title: string;
		nodeTypes: string[];
		prepare?: (rulecheck, analyze, htmlcontent) => void;
		check: (node, rulecheck, analyze, htmlcontent) => void;
		endcheck?: (rulecheck, analyze, htmlcontent) => void;
		generalRule?: boolean;
		description?: string;
	}

	export interface ICSSRule {
		id: string;
		title: string;
		prepare?: (rulecheck, analyzeSummary) => void;
		check: (url: string, ast, rulecheck, analyzeSummary) => void;
		endcheck?: (rulecheck, analyzeSummary) => void;
		description?: string;
	}

	export interface IFileRule {
		id: string;
		title: string;
		check: (rulecheck: any, analyzeSummary: any) => void;
		description?: string;
	}
	export interface IScriptRule {
		id: string;
		title: string;
		prepare?: (rulecheck: any, analyzeSummary: any) => void;
		check: (url: string, javascriptContent: string, rulecheck: any, analyzeSummary: any) => void;
		endcheck?: (rulecheck: any, analyzeSummary: any) => void;
		description?: string;
	}
}
