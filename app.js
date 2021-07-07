var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

let db = require('./models').sequelize;

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

/**
 * Catches 404 errors outside of defined routes and forwards to the global
 * error handler
 */
app.use(function(req, res, next) {
  console.log('404 error handler called');
  const err = new Error();
    err.status = 404;
    err.message = "Looks like the page you reqested doesn't exist."
    next(err);
});

/**
 * Global error handler
 */
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (err) {
    console.log('Global error handler called', err);
  }
  if (err.status === 404) {
    res.status(404).render('page-not-found', { err, title:"Not Found" })
  } else {
    res.status(500).render('error', { err });
    console.log(err.message)
    console.log(err.status)
  }
});

module.exports = app;
