'use strict';

ipipalApp.controller('ItemController',
    function ItemController($scope, Item, $location) {


      var items = Item.get(showResult);

      function showResult(){

          console.log(items)
         // $scope.bizzes = allBizzess.organizations;  //ajax request to fetch data into $scope.data

      }




});
