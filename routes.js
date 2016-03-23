/**
 * Main application routes
 */
'use strict';
var express = require('express');
var directory = require('serve-index');
module.exports = function(app) {
 
//Temporary usage of restful api. SHould be removed completely in end product.
//  app.use('/api/v1', require('./restful-api/routes'));
//TODO while integrating with oath, mobizzId is attached to query or body. This allows fallback to mobizzId as parameter.
// code block should be removed when oAuth integation is complete.
// Insert routes below
  //app.use('/api/v1/alerts', require('./api/v1/alert'));
//  app.use('/api/v1/locations', require('./api/v1/location'));

  
console.log(__dirname + '/bower_components/');
  app.use('/bower_components',express.static(__dirname + '/bower_components'));   
   app.use('/bower_components',express.static(__dirname + '/bower_components'));

  

};
