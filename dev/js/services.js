angular.module('thoughtdrop.services', [])

.factory('CachePublicMessages', function($http, $cordovaGeolocation, $state, $location, MapObject) {
  

  var goMap = function(){
    $state.go('map');
    MapObject.runMap();
  }
  var goMap2 = function(){
    $state.go('map2');
  }

  var cacheMessages = function(route, data, sortMessagesBy, callback) {
    sendData(route, data)
      .then(function (resp) {
        //cache all public messages messages within 100m of user
        if (sortMessagesBy === 'new') {
          factory.newMessages = resp.data;
          console.log('Caching ' + resp.data.length + " " + sortMessagesBy + '-public messages within 100m of '+ JSON.stringify(data) + ' from db on FACTORY:', resp.data);

          if (callback) {
            callback();
          }
        } else if (sortMessagesBy === 'top') {
          factory.topMessages = resp.data;
          console.log('Caching ' + resp.data.length + " " + sortMessagesBy + '-public messages within 100m of '+ JSON.stringify(data) + ' from db on FACTORY:', resp.data);

          if (callback) {
            callback();
          }
        }
      });
  };

  var getPosition1 = function() {
    //returns a promise that will be used to resolve/ do work on the user's GPS position
    return $cordovaGeolocation.getCurrentPosition();
  };

  var getPosition2 = function() {
    //returns a promise that will be used to resolve/ do work on the user's GPS position
    return $cordovaGeolocation.getCurrentPosition();
  };

  var findNearby = function(route, sortMessagesBy, callback) {
    if (sortMessagesBy === 'new') {
      getPosition1()
      .then(function(position) {
        var coordinates = {};
        coordinates.lat = position.coords.latitude;
        coordinates.long = position.coords.longitude;
        cacheMessages(route, coordinates, sortMessagesBy, callback);
      });
    } else if (sortMessagesBy === 'top') {
      getPosition2()
      .then(function(position) {
        var coordinates = {};
        coordinates.lat = position.coords.latitude;
        coordinates.long = position.coords.longitude;
        cacheMessages(route, coordinates, sortMessagesBy, callback);
      });
    }
  };

  var sendData = function(route) {
    var data = Array.prototype.slice.call(arguments, 1);
    var route = route || "";
    //returns a promise that will be used to resolve/ do work on the data returned by the server
    return $http({
      method: 'POST',
      url:  //base
      '/api/messages/' + route,
      data: JSON.stringify(data)
  });
 };

 var factory = {
   newMessages: 'apple',
   topMessages: 'orange',
   cacheMessages: cacheMessages,
   getPosition1: getPosition1,
   getPosition2: getPosition2,
   findNearby: findNearby,
   sendData: sendData,
       goMap: goMap,
    goMap2: goMap2
 };

return factory;

})

.factory('Vote', function($http, CachePublicMessages){

  //Keeps track of which buttons should be locked
  var upVoteButtonLock = {};
  var downVoteButtonLock = {};

  var incrementCacheVote = function(message) {
    CachePublicMessages.newMessages.forEach(function(cacheMessage) {
      if (cacheMessage._id === message._id) {
        cacheMessage.votes++;
      }
    });

    CachePublicMessages.topMessages.forEach(function(cacheMessage) {
      if (cacheMessage._id === message._id) {
        cacheMessage.votes++;
      }
    });
  };

  var decrementCacheVote = function(message) {
    CachePublicMessages.newMessages.forEach(function(cacheMessage) {
      if (cacheMessage._id === message._id) {
        cacheMessage.votes--;
      }
    });

    CachePublicMessages.topMessages.forEach(function(cacheMessage) {
      if (cacheMessage._id === message._id) {
        cacheMessage.votes--;
      }
    });
  };

  var handleVote = function(message, className) {
    //If upvoting
    if (className === 'upVote') {
        //If this message is not an upVoteButtonLock property or the button is not locked
        if (!upVoteButtonLock[message._id] ) {
        //Lock upvote button by setting upVoteButtonLock[message._id] to True

        upVoteButtonLock[message._id] = true; 
        //Increment vote in DOM and Top/New Cache and send incremented vote to server
        console.log('////////New messages BEFORE upvote', CachePublicMessages.newMessages);
        console.log('////////Top messages BEFORE upvote', CachePublicMessages.topMessages);
        //incrementVote(message);
        incrementCacheVote(message);
        console.log('////////New messages AFTER upvote', CachePublicMessages.newMessages);
        console.log('////////Top messages AFTER upvote', CachePublicMessages.topMessages);
        //Unlock downvote button by setting downVoteButtonLock[message._id] to False  
        downVoteButtonLock[message._id] = false;

        } else if (upVoteButtonLock[message._id] === true) { //Otherwise, if upVoteButtonLock[message._id] is True
        //Unlock downvote button by setting downVoteButtonLock[message._id] to False
        downVoteButtonLock[message._id] = false;
        }
    //If downvoting
    } else if (className === 'downVote') {
        //If downVoteButtonLock[message._id] exists OR is False
        if (!downVoteButtonLock[message._id] ) {
        //Lock downvote button by setting downVoteButtonLock[message._id] to True
        downVoteButtonLock[message._id] = true;

        //Decrement vote in DOM and Top/New Cache and send decremented vote to server
        //decrementVote(message);
        decrementCacheVote(message);
        //Unlock upvote button by setting upVoteButtonLock[message._id] to False  
        upVoteButtonLock[message._id] = false;

        } else if (upVoteButtonLock[message._id] === true) { //Otherwise, if upVoteButtonLock[message._id] is True
        //Unlock downvote button by setting downVoteButtonLock[message._id] to False
        downVoteButtonLock[message._id] = false;
        }
    }
  };

  // var incrementVote = function(message) {    
  //     //Increment vote count in the DOM
  //     message.votes++;
  //     console.log('upVOTING and changing vote to: ' + message.votes);
  //     //send incremented count along with messageID to server
  //     sendData('updatevote', message._id, message.votes);
  //     console.log('Sending vote of: ' + message.votes + ' to server!');
  // }; 

  // var decrementVote = function(message) {
  //     //Decrement vote count in the DOM
  //     message.votes--;
  //     console.log('downVOTING and changing vote to: ' + message.votes);
  //     //send decremented count along with messageID to server
  //     sendData('updatevote', message._id, message.votes);
  //     console.log('Sending vote of: ' + message.votes + ' to server!');
  // };

  var sendData = function(route) {
    var data = Array.prototype.slice.call(arguments, 1);
    var route = route || "";
    //returns a promise that will be used to resolve/ do work on the data returned by the server
    return $http({
      method: 'POST',
      url:  //base
      '/api/messages/' + route,
      data: JSON.stringify(data)
    });
  };

  return {
    upVoteButtonLock: upVoteButtonLock,
    downVoteButtonLock: downVoteButtonLock,
    handleVote: handleVote,
    sendData: sendData
  };
})

.factory('MessageDetail', function(CachePublicMessages){
  var get = function(messageid) {

    for (var i = 0; i < CachePublicMessages.newMessages.length; i++) {
        console.log('should be number twice: ' + Number(messageid));
      if (CachePublicMessages.newMessages[i]._id === (Number(messageid))) {
        return CachePublicMessages.newMessages[i];
      }
    };

    return null;

  };

  return {
    get: get
  };

})

.factory('Facebook', function($http, $localStorage){

  var dataStorage = {};

  var keepInfo = function(data) {
    dataStorage.userData = data;
    console.log('FB factory keepInfo triggered: ', JSON.stringify(dataStorage.userData));
  };

  var storeUser = function(data) {
    console.log('storeUser triggered: ', JSON.stringify(data));
    console.log('data Storage123: ' + JSON.stringify(dataStorage));
    dataStorage.userData.phoneNumber = data.phoneNumber;
    console.log('final data before sending to db: ', JSON.stringify(dataStorage.userData));
    $localStorage.userInfo = dataStorage.userData;
    console.log('userINFO IN LOCAL STORAGE ' + JSON.stringify($localStorage.userInfo));

    return $http({
      method: 'POST',
      url: //base
      '/api/auth/id',
      data: JSON.stringify(dataStorage.userData)
    })
    .then(function(resp) {
      console.log('Server resp to func call to storeUser: ', resp);
    });
  };

  return {
    storeUser: storeUser,
    keepInfo: keepInfo
  };
})


.factory('Messages', function($http, $cordovaCamera, CachePublicMessages){
  var globalImage = {};

  var returnGlobal = function() {
    return globalImage;
  };

  var sendMessage = function(message, image, callback) {
    //if there is an image, do a put request to the signed url to upload the image
    if (image) {
      return $http({
        method: 'PUT',
        url: globalImage.signedUrl, //change to image.signedUrl?
        data: globalImage.src, //change to image.src?
        headers: {
          'Content-Type': 'image/jpeg'
        },
      })
      .then(function(resp) {
        console.log('image saved successfully!');
        //since image sent successfully, set message.id to equal image.id for convenience
        message.id = image.id;
        message.shortUrl = image.shortUrl;
        return $http({
          method: 'POST',
          url:  //base
          '/api/messages/savemessage',
          data: JSON.stringify(message)
        });
      })
      .then(function(resp) {
        console.log('message saved successfully!');
        globalImage = {};
        //call to DB to get top and new streams, then cache them
        CachePublicMessages.cacheMessages('nearby', message.coordinates, 'new', callback);
        CachePublicMessages.cacheMessages('nearby', message.coordinates, 'top', callback);
        })
      .catch(function(err) {
        console.log('there was an error in save image: ' + err);
      });
    } else {
      //if thre isn't an image, just send the message as is
      return $http({
        method: 'POST',
        url:  //base
        '/api/messages/savemessage',
        data: JSON.stringify(message)
      })
      .then(function(resp) {
        console.log('message saved successfully!');
        CachePublicMessages.cacheMessages('nearby', message.coordinates, 'new', callback);
        CachePublicMessages.cacheMessages('nearby', message.coordinates, 'top', callback);
      })
      .catch(function(err) {
        console.log('there was an error in save message: ' + err);
      });
    }
  };

  var storeImage = function() {
    console.log('store image activated');
    var options = {
      destinationType : 0,
      sourceType : 1,
      allowEdit : true,
      encodingType: 0,
      quality: 30,
      targetWidth: 320,
      targetHeight: 320,
    };

    $cordovaCamera.getPicture(options)
    .then(function(imageData) {
      globalImage.src = 'data:image/jpeg;base64,' + imageData;
      globalImage.id = Math.floor(Math.random()*100000000);
      console.log('globalImage src: ' + globalImage.src);
      console.log('globalImage id: ' + globalImage.id);
      return $http({
        method: 'PUT',
        url: //base
        '/api/messages/getsignedurl',
        data: JSON.stringify(globalImage)
      })
      .then(function(resp) {
        globalImage.shortUrl = resp.data.shortUrl;
        globalImage.signedUrl = resp.data.signedUrl;
        console.log('successfully got response URL!');
        console.log('globalimage short img url: ' + globalImage.shortUrl);
        console.log('globalimage signed img url: ' + globalImage.signedUrl);
      });
    });
  };

  return {
    sendMessage: sendMessage,
    storeImage: storeImage,
    returnGlobal: returnGlobal
  };
})

.factory('MapObject', function(Private, Geolocation){
  var global_lat, global_lon;
  var cityCircle;
  var coverage;
  // renders google map
  function initialize () {
    var map_canvas = document.getElementById('map-canvas');
    var myLatlng = new google.maps.LatLng(global_lat, global_lon);
    map_options = {
      center: myLatlng,
      zoom: 16, 
      mapTypeId: google.maps.MapTypeId.ROADMAP, 
      panControl: false,
      streetViewControl: false,
      zoomControl: false,
      mapTypeControl: false
    }

    var map = new google.maps.Map(map_canvas, map_options)

  //************** SEARCH BAR FUNCTIONALITY ****************//
    var input = (document.getElementById('pac-input'));
    var clearButton = (document.getElementById('clearButton'));
    // var input2 = (document.getElementById('subButton'));
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(clearButton);
    var searchBox = new google.maps.places.SearchBox(
      /** @type {HTMLInputElement} */(input));
    // var autocomplete = new google.maps.places.Autocomplete(input);
    //autocomplete.bindTo('bounds', map);

    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var position = searchBox.getPlaces()[0].geometry.location;// d & k 
      var newPoint = new google.maps.LatLng(position.lat(), position.lng());
      console.log(newPoint);
      map.setCenter(newPoint);
    });

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = map.getBounds();
      searchBox.setBounds(bounds);
    });

    // brokedown panBy function. 
    // function offsetCenter(latlng,offsetx,offsety) {
    //   // latlng is the apparent centre-point
    //   // offsetx is the distance you want that point to move to the right, in pixels
    //   // offsety is the distance you want that point to move upwards, in pixels
    //   // offset can be negative
    //   // offsetx and offsety are both optional
    //   var scale = Math.pow(2, map.getZoom());
    //   var nw = new google.maps.LatLng(
    //       map.getBounds().getNorthEast().lat(),
    //       map.getBounds().getSouthWest().lng()
    //   );
    //   var worldCoordinateCenter = map.getProjection().fromLatLngToPoint(latlng);
    //   var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0)
    //   var worldCoordinateNewCenter = new google.maps.Point(
    //       worldCoordinateCenter.x - pixelOffset.x,
    //       worldCoordinateCenter.y + pixelOffset.y
    //   );
    //   var newCenter = map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
    //   return newCenter;
    // }// offsetCenter

    // convert LNG/LAT into distance
    function measure(lat1, lon1, lat2, lon2){  // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
    }

    function getMeters(){
      var center = map.getCenter();
      console.log("got here");
      var offCenter = offsetCenter(map.getCenter(), 53, 0);
      var distance = measure(center.lat(), center.lng(), offCenter.lat(), offCenter.lng());
      console.log('center: ' + center, 'offCenter: ' + offCenter + 'distance: '+ distance);
      return Math.round(distance);
    }


    var clearText = function(){
      document.getElementById('pac-input').value = '';
    }

    // meters are captures from getMeters and rounded
    var meterArr = { 
      0: 6365453,
      1: 3256359,
      2: 1636567,
      3: 819308,
      4: 409782,
      5: 204907,
      6: 102455,
      7: 51228,
      8: 25614,
      9: 12807,
      10: 6403,
      11: 3202,
      12: 1601,
      13: 800,
      14: 400,
      15: 200,
      16: 100,
      17: 50,
      18: 25,
      19: 13,
      20: 6,
      21: 3
    };
    // var coverage = 100;
    // google.maps.event.addListener(map, 'zoom_changed', function(){
    //   var coverage = meterArr[map.getZoom()];
    //   var apply();
    // });

    var submit = function(){
      Private.saveMessage(map.getCenter());
    }
    
  }//initialized

  // Google GeoCoder. Returns a physical address from latt and lng. 
  // Quotas: 5 per second and 2500 per day 
  function codeLatLng (latt, Lon, cb) {
    var lat = latt;
    var lng = Lon;
    var latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({'latLng': latlng}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          marker = new google.maps.Marker({
            position: latlng,
            map: map
          });
          markersObj[lat+', '+lng] = marker;
          // infowindow.setContent(results[1].formatted_address);
          // infowindow.open(map, marker);
          setBounds();  

          cb(results[1].formatted_address);
        } else {
          alert('No results found');
        }
      } else {
        alert('Geocoder failed due to: ' + status);
      }
    });
  }

  var runMap = function() {
    if(!!Geolocation.lastPosition){
      var coordinates = Geolocation.lastPosition.coords;
      global_lat = coordinates.latitude;
      global_lon = coordinates.longitude;
      initialize();
    } else {
        Geolocation.getPosition().then(function(position){
          var coordinates = position.coords;
          global_lat = coordinates.latitude;
          global_lon = coordinates.longitude;
          initialize();
        });  
    }
  }

  return {
    initialize: initialize, 
    runMap: runMap
  };
});


