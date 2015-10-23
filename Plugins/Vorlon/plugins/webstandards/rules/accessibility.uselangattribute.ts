module VORLON.WebStandards.Rules.DOM {
    
    export var useLangAttribute = <IDOMRule>{
        id: "accessibility.use-lang-attribute",
        title: "add lang attr on HTML tag",
        description : "lang attribute on HTML tag helps people finding out if they will understand content without having to get deep into it",
        nodeTypes: ["html"],
                
        check: function(node: Element, rulecheck: any, analyzeSummary: any, htmlString: string) {
            var min = htmlString.toLowerCase();
            var start = min.indexOf("<html");
            var end = min.indexOf(">", start);
            var htmltag = min.substr(start, end-start);
            if (!(htmltag.indexOf(' lang=') >= 0)){
                rulecheck.failed = true;
            }
        }
    }
   
}
