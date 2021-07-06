var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// const { Sequelize } = require('sequelize');
// const sequelize = new Sequelize ({
//   dialect: 'sqlite',
//   storage: 'library.db'
// });

let db = require('./models').sequelize;
// const { Books } = db.models;

(async () => {
  try {
    await db.authenticate();
    console.log('Connection to the database successful!');
  } catch (error) {
    console.log('Error connecting to the database: ', error);
  }
})();

(async () => {
  try {
    await db.sync();
    console.log('Synced!')
  }
  catch (error) {
    console.log('Sync error!')
  }
})();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
