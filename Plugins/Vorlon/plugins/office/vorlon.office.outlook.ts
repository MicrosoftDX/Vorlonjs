///<reference path='vorlon.office.tools.ts' />
///<reference path='vorlon.office.interfaces.ts' />
///<reference path='../../vorlon.dashboardPlugin.ts' />

var $: any;
module VORLON {

    export class OfficeOutlook {

        private dashboardPlugin: DashboardPlugin;

        constructor(dashboardPlugin: DashboardPlugin) {
            this.dashboardPlugin = dashboardPlugin;
        }

        public execute() {


            OfficeTools.AddZone("window.Office.context.mailbox.item", "to");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "bcc");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "cc");

            OfficeTools.AddZone("window.Office.context.mailbox.item", "optionalAttendees");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "requiredAttendees");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "subject");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "body");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "start");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "end");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "location");
            OfficeTools.AddZone("window.Office.context.mailbox.item", "notificationMessages");
            OfficeTools.AddZone("window.Office.context", "roamingSettings");

            this.apis.forEach(api => {
                api().addTree();
            });
        }


        public apis: { (): OfficeFunction; }[] = [
            (): OfficeFunction  => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getSelectedDataAsync");
                fn.elements = [VORLON.OfficeTools.CreateTextBlock(fn.fullpathName + ".coerciontyp", "Coercion type", "text")];
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "setSelectedDataAsync");
                var data = VORLON.OfficeTools.CreateTextArea(fn.fullpathName + ".data", "Data", "Hello World");
                var coercionType = VORLON.OfficeTools.CreateTextBlock(fn.fullpathName + ".coerctionType", "Type", "text");
                fn.elements.push(data, coercionType);
                fn.getArgs = (): any => {
                    var args = [data.value, {
                        coercionType: coercionType.value === "" ? null : coercionType.value
                    }];
                    return args;
                };
                return fn;
            },
            (): OfficeFunction => {
                return (new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getRegExMatches"));
            },
            (): OfficeFunction => {
                return (new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getUserIdentityTokenAsync"));
            },
            (): OfficeFunction => {
                return (new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getCallbackTokenAsync"));
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getRegExMatchesByName");
                var getRegExMatchesByName = VORLON.OfficeTools.CreateTextBlock(fn.fullpathName + ".getRegExMatchesByName", "Time value", Date.now().toString());
                fn.elements.push(getRegExMatchesByName);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "displayReplyAllForm");
                var value = JSON.stringify({ 'htmlBody': 'hi' });
                var formData = VORLON.OfficeTools.CreateTextArea(fn.fullpathName + ".formData", "Xml value :", value);
                fn.elements.push(formData);

                fn.getArgs = (): any => {
                    var args = [{
                        value: formData.value,
                        type: 'Json'
                    }];
                    return args;
                }
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox", "makeEwsRequestAsync");
                var formData = VORLON.OfficeTools.CreateTextArea(fn.fullpathName + ".xmlValue", "Xml value :", "<?xml version=\"1.0\" encoding=\"utf-8\"?>");
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox", "convertToLocalClientTime");
                var timeValue = VORLON.OfficeTools.CreateTextBlock(fn.fullpathName + ".timeValue", "Time value :", Date.now().toString());
                fn.elements.push(timeValue);
                fn.getArgs = (): any => {
                    var args = [{
                        value: timeValue.value,
                        type: 'Datetime'
                    }];
                    return args;
                };
                return fn;

            },
            (): OfficeFunction => {
                return (new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getEntities"));
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.body", "setSelectedDataAsync");
                var formData = VORLON.OfficeTools.CreateTextArea(fn.fullpathName + ".formData", "Data")
                var getAsync = VORLON.OfficeTools.CreateTextBlock(fn.fullpathName + ".getAsync", "Coercion type", "text");
                fn.elements.push(formData, getAsync);
                fn.getArgs = (): any => {
                    var args = [formData.value, { coercionType: getAsync.value }];
                    return args;
                };
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.body", "setAsync");
                var formData = OfficeTools.CreateTextArea(fn.fullpathName + ".formData", "Data");
                var getAsync = OfficeTools.CreateTextBlock(fn.fullpathName + ".formData", "Coercion type", "text");
                fn.elements.push(formData, getAsync);
                fn.getArgs = (): any => {
                    var args = [formData.value, { coercionType: getAsync.value }];
                    return args;
                };
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.body", "prependAsync");
                var formData = OfficeTools.CreateTextArea(fn.fullpathName + ".formData", "Data");
                var getAsync = OfficeTools.CreateTextBlock(fn.fullpathName + ".formData", "Coercion type", "text");
                fn.elements.push(formData, getAsync);
                fn.getArgs = (): any => {
                    var args = [formData.value, { coercionType: getAsync.value }];
                    return args;
                };
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.body", "getTypeAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.body", "getAsync");
                var getAsync = OfficeTools.CreateTextBlock(fn.fullpathName + ".getAsync", "Coercion type", "text");
                fn.elements.push(getAsync);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getEntitiesByType");
                var entityType = OfficeTools.CreateTextBlock(fn.fullpathName + ".entityType", "Office.MailboxEnums.EntityType");
                fn.elements.push(entityType);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "getFilteredEntitiesByName");
                var entityType = OfficeTools.CreateTextBlock(fn.fullpathName + ".getFilteredEntitiesByName", "Entity name");
                fn.elements.push(entityType);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "saveAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "addFileAttachmentAsync");
                var uri = OfficeTools.CreateTextBlock(fn.fullpathName + ".uri", "Uri");
                var attachmentName = OfficeTools.CreateTextBlock(fn.fullpathName + ".apiVersion", "Attachment name");
                fn.elements.push(uri, attachmentName);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item", "removeAttachmentAsync");
                var id = OfficeTools.CreateTextBlock(fn.fullpathName + ".removeAttachmentAsync", "id");
                fn.elements.push(id);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.notificationMessages", "getAllAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.notificationMessages", "addAsync");
                var key = OfficeTools.CreateTextBlock(fn.fullpathName + ".notificationMessages.addAsync.key", "key");
                var jsonMessage = JSON.stringify({ type: "progressIndicator", message: "Processing the message ..." });
                var formData = OfficeTools.CreateTextArea(fn.fullpathName + ".notificationMessages.addAsync.json", "JSON message", jsonMessage);
                fn.getArgs = (): any => {
                    var args = [key.value,
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(key, formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.notificationMessages", "removeAsync");
                var id = OfficeTools.CreateTextBlock(fn.fullpathName + "notificationMessages.removeAsync", "key");
                fn.elements.push(id);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.notificationMessages", "replaceAsync");
                var key = OfficeTools.CreateTextBlock(fn.fullpathName + ".notificationMessages.replaceAsync.key", "key");
                var jsonMessage = JSON.stringify({ type: "informationalMessage", message: "The message was processed successfuly", icon: "iconid", persistent: false });
                var formData = OfficeTools.CreateTextArea(fn.fullpathName + ".notificationMessages.replaceAsync.json", "JSON message", jsonMessage);
                fn.getArgs = (): any => {
                    var args = [key.value,
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(key, formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.to", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.to", "addAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.to", "setAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.cc", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.cc", "addAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.cc", "setAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.bcc", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.bcc", "addAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.bcc", "setAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.requiredAttendees", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.requiredAttendees", "addAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.requiredAttendees", "setAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.optionalAttendees", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.optionalAttendees", "addAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.optionalAttendees", "setAsync");
                var newRecipients = [
                    {
                        "displayName": "Allie Bellew",
                        "emailAddress": "allieb@contoso.com"
                    },
                    {
                        "displayName": "Alex Darrow",
                        "emailAddress": "alexd@contoso.com"
                    }
                ];
                var recipientsMessage = JSON.stringify(newRecipients);

                var formData = OfficeTools.CreateTextArea(fn.fullpathName, "Recipients", recipientsMessage);
                fn.getArgs = (): any => {
                    var args = [
                        {
                            value: formData.value,
                            type: 'Json'
                        }];
                    return args;
                }
                fn.elements.push(formData);
                return fn;
            }, (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.roamingSettings", "get");
                var id = OfficeTools.CreateTextBlock(fn.fullpathName, "key");
                fn.elements.push(id);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.roamingSettings", "remove");
                var id = OfficeTools.CreateTextBlock(fn.fullpathName, "key");
                fn.elements.push(id);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.roamingSettings", "set");
                var id = OfficeTools.CreateTextBlock(fn.fullpathName, "key");
                var value = OfficeTools.CreateTextBlock(fn.fullpathName, "value");
                fn.elements.push(id, value);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.roamingSettings", "saveAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.subject", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.subject", "setAsync");
                var id = OfficeTools.CreateTextBlock(fn.fullpathName, "Subject");
                fn.elements.push(id);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.start", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.start", "setAsync");
                var timeValue = OfficeTools.CreateTextBlock(fn.fullpathName, "UTC Datetime");
                fn.getArgs = (): any => {
                    var args = [{
                        value: timeValue.value,
                        type: 'Datetime'
                    }];
                    return args;
                };
                fn.elements.push(timeValue);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.end", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.end", "setAsync");
                var timeValue = OfficeTools.CreateTextBlock(fn.fullpathName, "UTC Datetime");
                fn.getArgs = (): any => {
                    var args = [{
                        value: timeValue.value,
                        type: 'Datetime'
                    }];
                    return args;
                };
                fn.elements.push(timeValue);
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.location", "getAsync");
                return fn;
            },
            (): OfficeFunction => {
                var fn = new OfficeFunction(this.dashboardPlugin, "window.Office.context.mailbox.item.location", "setAsync");
                var id = OfficeTools.CreateTextBlock(fn.fullpathName, "Location");
                fn.elements.push(id);
                return fn;
            }

        ];


    }
}