ipipalApp.factory('Business', function($resource) {

  return $resource('https://restcountries.eu/rest/v1/all', {id: '@id'});


});

