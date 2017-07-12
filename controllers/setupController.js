var ToDos = require('../models/toDoModel');
var userLogin = require('../models/userLoginModel');

module.exports = function(app){
    // initial seeding of data
    app.get('/todolist',function(req,res) {
        // initail seeding of collection ToDO
        var initialToDoList = [
            {
                user: 'Abirami',
                todo: 'learn Nodejs',
                isDone: false
            },
            {
                user: 'Abirami',
                todo: 'shakthi classes',
                isDone: false
            },
            {
                user: 'BKrish',
                todo: 'cleaning and cooking',
                isDone: false
            },
            {
                user: 'BKrish',
                todo: 'nethra tasks',
                isDone: false
            }];
        if (ToDos.length > 0){
            ToDos.remove().exec();
            ToDos.create(initialToDoList, function (err, result) {
                res.send(JSON.stringify(result));
            });
        }
    });
    app.get('/userLoginInfo',function(req,res){
        // initail seeding of collection userLogin
        var userLoginList = [{
            username:'AbiGopi',
            password:'Shakthi30',
            Security_questions:[{
                Question:'Where were you born?',
                Answer:'chennai'
            },{
                Question:'What is your Mothers maiden name?',
                Answer:'renu'
            },{
                Question:'What is the name of your first school?',
                Answer:'holy cross'
            },{
                Question:'Where did you first meet your spouse?',
                Answer:'airport'
            },{
                Question:'What was the make of your first car?',
                Answer:'avalon'
            }]
        },
            {
                username:'BKrish',
                password:'Nethra28',
                Security_questions:[{
                    Question:'Where were you born?',
                    Answer:'chennai'
                },{
                    Question:'What is your Mothers maiden name?',
                    Answer:'kani'
                },{
                    Question:'What is the name of your first school?',
                    Answer:'holy cross'
                },{
                    Question:'Where did you first meet your spouse?',
                    Answer:'airport'
                },{
                    Question:'What was the make of your first car?',
                    Answer:'chevy'
                }]
            }];

        if (userLogin.length >0){
            userLogin.remove().exec();
            userLogin.create(userLoginList, function (err, result) {
                res.send(JSON.stringify(result));
            });
        } ;

    });






}
