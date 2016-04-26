var express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    session = require('express-session'),

    //Models
    User = require('./models/user'),
    bodyParser = require ('body-parser'),

    //app init
    app = express();


//Mongoose Init
mongoose.connect('mongodb://localhost/auth_demo');

//Paths
//============================================
var paths =  {
  home: 'home',
  secret: 'secret',
  register: 'register'
};
//============================================

//Express Settings
//============================================
// app.use(require('express-session')({
//   secret: 'Nigga Was good',
//   resave: false,
//   saveUninitialized: false
// }));

app.use(bodyParser.urlencoded({extended:true}));
//express-session
app.use(session({
  secret: 'Nigga was good', //Anystring, this secret will be used to encode and decode the user's session
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

//============================================

//Passport Settings
//============================================

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //we are creating a new LocalStrategy using the User.authenticate method that is
                                                      //coming from passportLocal Mongoose in our users Model
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============================================


// Routes
//============================================
app.get('/', function(req,res){
  res.render(paths.home);
});


app.get('/secret',isLoggedIn, function(req,res){ //Whenever a request comes in to /secret run the isLoggedIn function then continue on with the req,res callback function block.
  res.render(paths.secret);
});
//============================================

//Auth Routes
//============================================
//shows the signup form
app.get('/register', function(req,res){
  res.render(paths.register);
});

//handling user signup
app.post('/register', function(req,res){
  User.register(new User({username: req.body.username}), req.body.password, function(err, user) { //Registers a new user
    if(err){ // if eror redirect back to the register form
      console.log(err);
      return res.render('register');
    }
    passport.authenticate('local')(req,res, function(){ //here we choose a strategy strategy can be defined as authentication methods such as fb login, twitter login, and etc. // if success redirect to the secret page
      res.redirect('/secret');
    });
  });
});

//Login Routes
//render login form
app.get('/login', function(req, res){
  res.render('login');
});

//login logic
//passport.authenticate middleware, middleware - some code that runs before a final route callback , middlewares can be stack until it reaches the final handler at the end.

app.post('/login', passport.authenticate('local',{ // passport.authenticate checks the credentials
                                                   // then it will compare the password the user type in the input to the hash version in the database. then redirects to whether it's a success or failure.
  successRedirect: '/secret',
  failureRedirect: '/login'

}), function(req,res){

});


app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
});

function isLoggedIn(req, res, next) { //req refers to the request object, res refers to the response object, next refers to the next thing that needs to be called.
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

app.listen(3000, function (){
  console.log('Server Started');
});
