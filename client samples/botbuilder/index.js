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
    session.beginDialog("/hello");
});

bot.dialog('/hello', [function (session) {
    session.send("Hello World");
    builder.Prompts.text(session, "What do you want?");
},
function (session, args) {
    session.send("Ok!");
    builder.Prompts.text(session, "Quoi d'autre?");
},
]);

bot.dialog('/coucou', function (session) {
    session.send("Coucou world");
});