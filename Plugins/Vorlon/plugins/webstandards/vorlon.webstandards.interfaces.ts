module VORLON {
    export interface IDOMRule{
		id: string;
		title : string;
		nodeTypes : string[];
		check : any;
		generalRule? : boolean;
		description?: string;
	}
	
	export interface ICSSRule{
		id: string;
		title : string;
		check : any;
		description?: string;
	}
	
	export interface DataResult {
		lineNumber: number;
		file: string;
		testName: string;		
	}
	
	export interface ResultCSSPrefixe {
		prefixesMissing: Array<any>;
		selector: string;
	}
}
