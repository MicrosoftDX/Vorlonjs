// ========== VORLON Setup
var vorlonWrapper = require("vorlon-node-wrapper");
vorlonWrapper.start("http://localhost:1337", "default", false);

// ========== Requiring
var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', function (session) {
    session.send("Slash, oh oh, savior of the universe!");

    session.userData.toto = "data1";
    session.privateConversationData.tata = "Yo";
    session.dialogData.titi = "ahahah";

    session.beginDialog("/hello");
});

bot.dialog('/hello', [function (session) {
    session.send("Hello World");
    session.userData.toto = "hey2";
    session.privateConversationData.tata = "Yo2";
    session.dialogData.titi = "ahahah2";
    builder.Prompts.text(session, "What do you want?");
    
},
function (session, args) {
    session.send("Ok!");
    session.userData.toto = "hey3";
    session.privateConversationData.tata = "Yo";
    session.dialogData.titi = "ahahah";
    session.beginDialog('/foo');
    session.beginDialog('/foo');
},
]);

bot.dialog('/foo', function (session) {
    session.endDialog("foo world");
});

bot.dialog('/foo2', function (session) {
    session.endDialogWithResult("foo world");
});