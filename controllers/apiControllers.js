var ToDos =  require('../models/toDoModel');
var userLogin = require('../models/userLoginModel');
var bodyParser = require('body-parser');
var session = require('express-session');

module.exports = function(app){
    app.set('view engine','ejs');
    app.use(session({
        cookie:{maxAge: 6000000},
        secret:'ilovemyfamily'
    }));
    var bodyparserJSON = bodyParser.json();
    var urlEncoded = bodyParser.urlencoded({extended:true});
    var Security_Questions=['Where were you born?','What is your Mothers maiden name?','What is the name of your first school?',
        'Where did you first meet your spouse?','What was the make of your first car?'];

    // Main Login Screen
    app.get('/',function(req,res){
        res.render('login',{status:' '});
    });

    // Function to generate a unique array  of random questions

    function generateSecQuestion(cb){
        var question_limit = 3;
        var Sec_Q_len = Security_Questions.length;
        var numArr =[];
        var forgotPasswrdQ =[];
        for(var j =0; j<Sec_Q_len; j++){
            numArr.push(Security_Questions[j]);
        }
        for (var i =0; i< question_limit;i++){
            var index = Math.floor(Math.random() * numArr.length);
            var choiceNum =numArr[index];
            forgotPasswrdQ.push(choiceNum);
            numArr.splice(index,1);
        }
        cb (forgotPasswrdQ);
    }

// Creating a new password for the existing user.
    app.post('/forgotpassword', function(req,res){

        generateSecQuestion(function(forgotPasswrdQ){
            var forgotPwdQ = forgotPasswrdQ;
            res.render('forgotpassword',{sec_Questions:forgotPwdQ,usernameStatus:''});
        })
    });

// Checking if the username and security questions and answers match
    app.post('/generateNewPassword',urlEncoded,function(req,res){
        var sess = req.session;
        var sec_a = req.body.sec_Ans;
        var sec_Q = req.body.secQ;
        var sec_Q_pg =sec_Q.split(',');
        sess.username = req.body.username;
        var cnt = 0;
        Question_n_answer_arr(sec_Q_pg,sec_a, function(Q_n_A){
            userLogin.find({username:sess.username}, function(err,userInfo){
                if(!err){
                    if(userInfo && userInfo.length){
                        var q_n_a_coll = userInfo[0].Security_questions;
                        Q_n_A.forEach((Q_n_A_pg) =>{
                            for(var i =0;i<q_n_a_coll.length;i++){
                                if (Q_n_A_pg.Question === q_n_a_coll[i].Question && Q_n_A_pg.Answer === q_n_a_coll[i].Answer){
                                    cnt = cnt +1;
                                }
                            }
                        })
                        if( cnt ==3){
                            res.render('resetPassword',{username: sess.username})
                        }
                        else
                        {
                            generateSecQuestion(function(forgotPasswrdQ){
                                var forgotPwdQ = forgotPasswrdQ;
                                res.render('forgotpassword',{sec_Questions:forgotPwdQ,usernameStatus:'Wrong Answer'});
                            })
                        }
                    }
                    else {
                        generateSecQuestion(function(forgotPasswrdQ){
                            var forgotPwdQ = forgotPasswrdQ;
                            res.render('forgotpassword',{sec_Questions:forgotPwdQ,usernameStatus:'Invalid Username ' + sess.username});
                        })
                    }
                }
                else
                    throw err;
            })
        })
    })

    // updating the new password for the user who forgot password
    app.post('/updatePassword', urlEncoded,(req,res) => {

        var usernme = req.body.username;
        var new_password = req.body.newPasswrd;
        var confirm_password = req.body.confirmPasswrd;

        if (new_password === confirm_password){
            userLogin.update({username:req.body.username},
                {password:new_password},
                function(err,data) {
                    if (!err) {
                        var todoitems = [];
                        ToDos.find({user: usernme}, (err, TodoArr) => {
                            if (!err) {
                                TodoArr.forEach(function (newTodo) {
                                    todoitems.push(newTodo.todo);
                                })
                                res.render('displayTodo',{username:usernme,todoitems:todoitems,createNewStatus:'',getFullTodoList:''}) ;
                            }
                            else
                                throw err;
                        });
                    }
                    else
                        throw err;
                })
        }
        else{
            res.render('resetPassword',{username: usernme})
        }
    })

    // Rendering the sign up page that allows new users to be created
    app.post('/signup', function(req,res){
        res.render('signup',{SecQuestions: Security_Questions,createNewUserStatus: " "});
    })

    //Function to Create a question and answer array
    function Question_n_answer_arr(sec_q, sec_a, cb){
        sec_Questions = sec_q;
        sec_answers=sec_a;
        var Q_n_A = [];

        var cnt =0;
        sec_Questions.forEach(question =>{
            var Q_n_A_Obj = {};
            Q_n_A_Obj.Question =question ;
            Q_n_A_Obj.Answer = sec_answers[cnt];
            Q_n_A.push(Q_n_A_Obj);
            cnt = cnt+ 1;
        });
        cb(Q_n_A);
    }
    // Creating a new user with the req.body that is received from sign up page

    app.post('/createNewUSer',urlEncoded,function(req,res){
       var  sec_Questions = req.body.Security_Questions,
            sec_answers=req.body.secAns;

        Question_n_answer_arr(sec_Questions,sec_answers,function(Question_Answer){

            // Inserting the New User info in the user login collection
            userLogin.find({username:req.body.username},  (err,user) =>{
                if(!err){
                    if(user && user.length){
                        res.render("signup", {createNewUserStatus: 'User already exists',SecQuestions: sec_Questions})
                    }
                    else{
                        var newUSer = new userLogin({
                            username:req.body.username,
                            password:req.body.password,
                            Security_questions:Question_Answer
                        });

                        newUSer.save((err,data) =>{
                            if (err) throw err;
                            else{
                                res.render('displayTodo',{username:data.username,todoitems:[],createNewStatus:'',getFullTodoList:''});
                            }
                        });
                    }
                }
                else
                    throw err;
            });
        })
    });

    //Validating the usrname and password and dispalying the todo list for the username and password
    app.post('/login',urlEncoded,(req,res)=>{
        var username = req.body.username, password = req.body.password;
        if( username && password){
            userLogin.find({username:username}, (err,userinfo) =>{
                if (!err){
                    if(userinfo && userinfo.length){
                        if (userinfo[0].password == password && password) {
                            var todoitems=[];
                            ToDos.find({user:username},(err, userToDo) => {
                                if(!err){
                                        if(userToDo && userToDo.length){
                                            userToDo.forEach(function(Todo){
                                                todoitems.push(Todo.todo);
                                            });
                                        }
                                        res.render('displayTodo',{username:username,todoitems:todoitems,createNewStatus:'',getFullTodoList:''}) ;
                                    }
                                else
                                    throw err;
                                })
                            }
                        else
                            res.render('login',{status:'Invalid Password!!!!'});
                    }
                    else
                        res.render('login',{status:'Invalid Username!!!!'});
                }
                else
                    throw err;
            })
        }
        else
            res.render('login', {status:'Empty Username and Password'});
    })

    //Create a new Todo
    app.post('/createNew',urlEncoded,(req,res) => {

        var username_local = req.body.req_username;
        var createNewToDo = req.body.createNewtodo;
        var todoitems = [];
        var todoCount = 0, createNewStatus='';

        ToDos.find({user: username_local}, (err,newTodoArr)=>{
            if(!err){
                newTodoArr.forEach(function(newTodo){
                    if(newTodo.todo === createNewToDo){
                        createNewStatus = 'Todo Already Exists';
                        todoCount = todoCount + 1;
                    }
                    todoitems.push(newTodo.todo);
                });
            }
            else
                throw err;

            if (todoCount == 0){
                var newTodo = new ToDos({
                    user:username_local,
                    todo:createNewToDo,
                    isDone: false
                });
                newTodo.save((err,data) => {
                    if(err) throw err;
                });
                todoitems.push(createNewToDo);
            }
            res.render('displayTodo',{username:username_local,todoitems:todoitems,createNewStatus:createNewStatus,getFullTodoList:''}) ;
        })

        /* var username_local = req.body.req_username;
        var createNewToDo = req.body.createNewtodo;
        var todoitems = [];
        var existingTodo =false, createNewStatus='';

        ToDos.find({user: username_local}, (err,newTodoArr)=> {
            if (!err) {
                newTodoArr.forEach(function (newTodo) {
                    if (newTodo.todo === createNewToDo) {
                        createNewStatus = 'Todo Already Exists';
                        existingTodo = true;
                        res.send({"success":"Todo already exists!!", "status":302})
                    }
                });
            }
            else
                throw err;

            if (!existingTodo) {
                var newTodo = new ToDos({
                    user: username_local,
                    todo: createNewToDo,
                    isDone: false
                });
                newTodo.save((err, data) => {
                    if (err) throw err;
                });
            }
        })
        res.send({"success": "New Todo Updated","status":200})*/
    })

    //Done with the todo
    app.post('/updateTodo',urlEncoded, (req,res) =>{

    })

    // Remove the todo
    app.post('/deleteTodo',urlEncoded,(req,res)=> {
        var username_local = req.body.req_username;
        var todo_local= req.body.req_todo;
        var todoitems = [],createnewStatus='';

        ToDos.remove({user:username_local, todo:todo_local},  (err) =>{
             if(!err){
                 ToDos.find({user:username_local},(err,ToDoArr)=>{
                     if(!err){
                         if(ToDoArr && ToDoArr.length){
                             ToDoArr.forEach( (todolist) =>{
                                 todoitems.push(todolist.todo);
                             })
                         }
                         else{
                             createnewStatus:'No Todos Available!! Plz create new';
                         }
                         res.render('displayTodo',{username:username_local,todoitems:todoitems,createNewStatus:createnewStatus,getFullTodoList:''}) ;
                     }
                     else throw err;
                 })
             }
             else throw err;
        })
    })

    //Search for the existing Todo
    app.post('/SearchToDo', urlEncoded, (req,res) =>{
        var searchToDo = req.body.searchtodo,
            searchUser = req.body.search_username,
            todoitems =[],
            createNewStatus = '';

        ToDos.find({user:searchUser, todo:searchToDo},(err,todo) => {
            if(!err){
                if(todo && todo.length){
                    todo.forEach((searchTod) =>{
                        todoitems.push(searchTod.todo);
                    })
                }
                else{
                    createNewStatus:'Todo not found';
                }
                res.render('displayTodo',{username:searchUser,todoitems:todoitems,createNewStatus:createNewStatus,getFullTodoList:'Get all the ToDo'}) ;
            }
            else
                throw err;
        })
        })

    //get the full todo list after a search
    app.post('/getFullTodo',urlEncoded,(req,res) =>{
        user_search = req.body.req_username;
        var todoitems = [];
        ToDos.find({user:user_search}, (err,todoarr)=>{
            if(!err){
                if(todoarr && todoarr.length){
                    todoarr.forEach((todo) =>{
                        todoitems.push(todo.todo);
                    })
                }
                res.render('displayTodo',{username:user_search  ,todoitems:todoitems,createNewStatus:'',getFullTodoList:' '}) ;
            }
            else
                throw err;
        })
    })

    // Logging out
    app.post('/Logout',(req,res)=>{

        req.session.destroy((err)=>{
            if(!err){
                res.render('login',{status:' '});
            }
            else
                throw err;
        })

    });
}
