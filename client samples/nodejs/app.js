var vorlonWrapper = require("vorlon-node-wrapper");
var serverUrl = "http://localhost:1337";
var dashboardSession = "default";
var express = require('express');
var open = require("openurl");
var methodOverride = require('method-override');

vorlonWrapper.start(serverUrl, dashboardSession, false);

var app = express();
EXPRESS_VORLONJS = app;

app.set('view engine', 'ejs');
app.set('MY_APP_CONFIG', 'MY_APP_CONFIG');
app.use(methodOverride('_method'));

app.get('/', function(request, response) {
    response.render('index');
});

app.get('/api/bears', function(request, response) {
    response.send('GET	Get all the bears.');
});
	
app.post('/api/bears', function(request, response) {
    response.send('POST	Create a bear.');
});
	
app.get('/api/bears/:bear_id', function(request, response) {
    response.send('GET	Get a single bear.');
});
	
app.put('/api/bears/:bear_id', function(request, response) {
    response.send('PUT	Update a bear with new info.');
});
	
app.delete('/api/bears/:bear_id', function(request, response) {
    response.send('DELETE	Delete a bear.');
});

app.use(function(request, response, next){
  response.status(404);
  response.send('404');
});

app.listen(1995);

open.open("http://localhost:1995");