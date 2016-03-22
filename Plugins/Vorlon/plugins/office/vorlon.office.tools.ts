var $: any;
module VORLON {

    export class OfficeTools {

        public static IsOutlook() {
            var parentTreeCategory = "window.Office.context.mailbox";

            return (document.getElementById(parentTreeCategory) !== null && document.getElementById(parentTreeCategory) !== undefined)
        }




        public static AddTreeFunction(treeCategory: string, functionName: string): FluentDOM {

            if (document.getElementById(treeCategory) === null || document.getElementById(treeCategory) === undefined) {
                return;
            }
            var fullpathName = treeCategory + "." + functionName;
            var category = document.getElementById(treeCategory).querySelector('.expand-content');
            var zone = new FluentDOM('DIV', 'obj-func', category);
            var func = zone.createChild("SPAN", "func-name").text(functionName);

            return func;
        }

        private static _ClearPropertiesAndResults() {
            // var propertiesDiv = <HTMLDivElement>document.querySelector('#office-results');

            // if (propertiesDiv !== undefined && propertiesDiv !== null) {
            //     while (propertiesDiv.hasChildNodes()) {
            //         propertiesDiv.removeChild(propertiesDiv.lastChild);
            //     }

            // }

            var propertiesDiv = <HTMLDivElement>document.querySelector('#office-properties');

            if (propertiesDiv !== undefined && propertiesDiv !== null) {
                while (propertiesDiv.hasChildNodes()) {
                    propertiesDiv.removeChild(propertiesDiv.lastChild);
                }
            }
        }

        public static GetOfficeType(sets: any) {

            if (sets == "Outlook") {
                return { officeType: "Outlook", version: "", background: "#0173C7" }
            }

            if (sets.wordapi) {
                return { officeType: "Word", version: sets.wordapi, background: "#2A579A" }
            }
            if (sets.excelapi) {
                return { officeType: "Excel", version: sets.excelapi, background: "#227447" }
            }
            if (!sets.excelapi && !sets.wordapi) {
                return { officeType: "PowerPoint", version: sets.pdf, background: "#B7472A" }
            }
            if (sets.project) {
                return { officeType: "Project", version: sets.projectapi, background: "#2E7237" }
            }

            return { officeType: "Office", version: '1.0', background: "#0173C7" }

        }

        public static ShowFunctionResult(r: any) {
            var propertiesDiv = document.querySelector('#office-properties');
            var titleDive = <HTMLDivElement>document.querySelector('#office-properties-title');
            titleDive.innerHTML = "Result";

            if (propertiesDiv !== undefined && propertiesDiv !== null) {
                while (propertiesDiv.hasChildNodes()) {
                    propertiesDiv.removeChild(propertiesDiv.lastChild);
                }
            }
            var zone = new VORLON.FluentDOM('DIV', 'office-results-values', propertiesDiv);

            zone.append('pre', 'results', container => {
                if (r.value !== undefined && r.value !== null)
                    r.value = JSON.parse(r.value);

                var jsonValue = JSON.stringify(r.value, undefined, 4);

                container.html(OfficeTools.FormatJson(jsonValue));
            });
        }


        public static FormatJson(json) {
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }


        public static ShowFunction(fullpathName: string, callbackClick: () => void, options?: HTMLElement[]) {
            VORLON.OfficeTools._ClearPropertiesAndResults();

            var propertiesDiv = <HTMLDivElement>document.querySelector('#office-properties');
            var titleDive = <HTMLDivElement>document.querySelector('#office-properties-title');
            titleDive.innerHTML = "Function";

            var zone = new FluentDOM('DIV', 'office-properties-values', propertiesDiv);

            zone.append('div', 'fullpath', container => {
                container.createChild("SPAN", "function-name").text('Function');
                container.createChild("SPAN", "function-value").text(fullpathName);
            });

            if (options !== undefined && options.length > 0) {
                for (var i in options) {
                    var option = options[i];

                    zone.append('div', 'options', container => {
                        container.createChild("SPAN", "function-name").text(option.attributes.getNamedItem('tag').value);
                        container.element.appendChild(option);
                    });
                }

            }

            zone.append('div', 'invoker', container => {
                var btn = new FluentDOM("INPUT", 'function-invoker', container.element);
                btn.attr('type', 'button');
                btn.attr('value', 'invoke');
                btn.attr('id', fullpathName);
                btn.click(callbackClick);
            });
        }

        public static ShowProperty(prop: any) {

            VORLON.OfficeTools._ClearPropertiesAndResults();

            var propertiesDiv = <HTMLDivElement>document.querySelector('#office-properties');
            var titleDive = <HTMLDivElement>document.querySelector('#office-properties-title');
            titleDive.innerHTML = "Property";

            var zone = new FluentDOM('DIV', 'office-properties-values', propertiesDiv);

            zone.append('div', 'prop-fullpath', container => {
                container.createChild("SPAN", "name").text('Name');
                container.createChild("SPAN", "value").text(prop.fullpath);
            });

            zone.append('div', 'prop-name', container => {
                container.createChild("SPAN", "name").text('Type');
                container.createChild("SPAN", "value").text(prop.type);
            });

            zone.append('div', 'prop-type', container => {
                container.createChild("SPAN", "name").text('Value');
                container.createChild("SPAN", "value").text(prop.value);
            });

        }

        public static AddZone(parentTreeCategory: string, category: string) {


            if (document.getElementById(parentTreeCategory) === null || document.getElementById(parentTreeCategory) === undefined) {
                return;
            }

            if (document.getElementById(parentTreeCategory + "." + category) !== null && document.getElementById(parentTreeCategory + "." + category) !== undefined) {
                return;
            }

            var itemBody = document.getElementById(parentTreeCategory).children[1];

            // root of all
            var elt = new FluentDOM('DIV', 'objdescriptor', itemBody);

            // Create the div for the current path
            elt.append('DIV', 'expandable expanded', (zone) => {
                var btn: FluentDOM;
                zone.attr("id", parentTreeCategory + "." + category);

                // create the div containing both sigle (+ or -) and the label
                zone.append('DIV', 'expand', container => {
                    btn = container.createChild("SPAN", "expand-btn").text("-")
                    btn.click((arg) => {
                        arg.stopPropagation();
                        Tools.ToggleClass(zone.element, "expanded", (expanded) => {
                            expanded ? btn.text("-") : btn.text("+");
                        });
                    });
                    container.createChild("SPAN", "expand-label").text(category);

                });

                zone.append("DIV", "expand-content", (category) => {

                });

            });

        }


        public static CreateTextArea(name: string, label: string, value?: string): HTMLTextAreaElement {
            var formData = document.createElement('textarea');
            formData.setAttribute("rows", "4");
            formData.setAttribute("cols", "40");
            formData.setAttribute("name", name);
            formData.setAttribute("id", name);
            if (value)
                formData.value = value;
            formData.setAttribute("tag", label + ": ");

            return formData
        }

        public static CreateTextBlock(name: string, label: string, value?: string): HTMLInputElement {

            var inputText = document.createElement('input');
            inputText.setAttribute("type", "text");
            inputText.setAttribute("name", name + ".coercionType");
            inputText.setAttribute("id", name + ".coercionType ");

            if (value !== undefined) {
                inputText.value = value;
            }

            inputText.setAttribute("tag", label + " : ");

            return inputText;
        }
    }
}