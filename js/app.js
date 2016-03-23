'use strict';
var ipipalApp = angular.module('mobizzApp', ['ngResource','ngRoute']);
ipipalApp.config(function($routeProvider) {

  $routeProvider.
      when('/', {
        controller: 'ItemController',
        templateUrl: 'views/itemview.html'
      });
});
