var express = require('express');
var app = express();
var ejs = require('ejs');
var mongoose = require('mongoose');
var setUpController = require('./controllers/setupController');
var apiController = require('./controllers/apiControllers');
var PORT = process.env.PORT||8080;
app.set('view engine','ejs');
app.use('/assets', express.static(__dirname + '/public'));

setUpController(app);
apiController(app);

app.listen(PORT);


