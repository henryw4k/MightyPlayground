angular.module('thoughtdrop.mapController', [])

.controller('mapController', function($scope, $state, $log, Private, Geolocation, MapObject) {

  //radius logic 
  MapObject.runMap();

  $scope.submit = function(){
    $state.go('map2');
  }; 
  
 //$scope.runMap();
  // google.maps.event.addDomListener(window, 'load', $scope.runMap);
  // window.onload = $scope.runMap();
  });