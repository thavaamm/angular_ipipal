'use strict';
var ipipalApp = angular.module('ipipalApp', ['ngResource','ngRoute']);
ipipalApp.config(function($routeProvider,$locationProvider) {
/*
  $routeProvider.
      when('/', {
        controller: 'ItemController',
        templateUrl: 'views/itemview.html'
      });
*/

    $routeProvider.when('/', {
        templateUrl: 'views/itemview.html',
        controller: 'ItemController'
    }).otherwise({ redirectTo: '/'});

//    $locationProvider.html5Mode(true);

});
