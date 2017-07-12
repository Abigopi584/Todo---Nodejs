var mongoose = require('mongoose');
var config = require('./config');

var mongoUri =  `mongodb://${config.username}:${config.password}@ds011943.mlab.com:11943/node-to-do`;

var toDoConnection = mongoose.connect(mongoUri);

module.exports = toDoConnection;


