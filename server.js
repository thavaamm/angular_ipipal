/**
 * Main application file
 */
try{
'use strict';
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var fs = require("fs");


var app = express();
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next){
    next();
});


var server = require('http').createServer(app);
require('./routes')(app);

  app.use('/',function(req,res,next){

fs.readFile("index.html", function(err, data){

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(data);
  res.end();
});    
    console.log(req.url) 
//    next();
  })


//global.appRoot = path.resolve(__dirname);
// Start server
server.listen(3000, '', function () {
  console.log('Express server listening on %d, in %s mode', 3000, app.get('env'));
});

// Expose app
exports = module.exports = app;
}catch(e){
console.log(e);
}



