ipipalApp.factory('Items', function($resource) {

//  return $resource('/js/item.json', {id: '@id'});
 return $resource('api/bizzlist.php', {bizzId: '@bizzId'});


});

