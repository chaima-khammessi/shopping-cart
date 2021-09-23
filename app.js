var createError = require('http-errors');
var express = require('express');
var Handlebars = require('handlebars')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongosse = require('mongoose');
const expressHbs = require('express-handlebars')
var {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


// view engine setup
const app = express()
mongosse.connect('mongodb://localhost/Shopping-cart',{useNewUrlParser : true},(error)=>{
  if(error){
    console.log(error);
  }
  else{
    console.log('connectiong to DB...');

  }
})

require('./config/passport')
app.engine('.hbs', expressHbs({defaultLayout:'layout', extname:'.hbs' , 
handlebars: allowInsecurePrototypeAccess(Handlebars) , helpers:{
  add :function(value){
    return value + 1;
  },
  chechQuantity : function(value){
    if(value<=1){
      return true;
    }else{
      return false;
    }
  }
} 
}))
app.set('view engine',  '.hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret : 'Shopping-cart_?@!',
  saveUninitialized : false ,
  resave : true ,

}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
