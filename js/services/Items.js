ipipalApp.factory('Items', function($resource) {

  return $resource('js/items.json', {id: '@id'});


});

