var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
const fileUpload = require('express-fileupload');
var apiRouter = require('./routes/awb');
var apiRouterLog = require('./routes/log');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
  createParentPath: true
}));

app.use(express.static(path.join(__dirname, 'dist/awb-ui')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use('/api', apiRouter);
app.use('/api', apiRouterLog);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/awb-ui/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/awb-ui/index.html'))
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500).send(err.status);
});
// module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, (req, res)=>{
    console.log(`API is running on ${PORT}`);
});
