var mongoose = require('mongoose');
var userLoginConnection = require('../config/userloginIndex');

var schema = mongoose.Schema;

var userLoginSchema = new schema({
    username:String,
    password:String,
    Security_questions:[{
        Question:String,
        Answer:String
    }]
});

var userLogin = userLoginConnection.model('userlogin',userLoginSchema);

module.exports = userLogin;