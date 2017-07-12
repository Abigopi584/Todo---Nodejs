var mongoose = require('mongoose');
var config = require('./config');

var mongoURI =`mongodb://${config.username}:${config.password}@ds133378.mlab.com:33378/userdata`;

var userLoginConnection = mongoose.connect(mongoURI);

module.exports = userLoginConnection;
