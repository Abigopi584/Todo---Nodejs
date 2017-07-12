var mongoose = require('mongoose');
var toDoConnection = require('../config/toDoIndex');

var schema = mongoose.Schema;

var toDoSchema = new schema({
    user: String,
    todo : String,
    isDone: Boolean
});

var ToDos = toDoConnection.model('todo', toDoSchema);

module.exports = ToDos;

