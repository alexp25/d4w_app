angular.module("app").factory('socket', function($rootScope) {
  var socket;
  return {
    connect: function() {
      // var url = "ws://localhost:8000";
      // var url = "ws://" + window.location.hostname + ":8000";
      //  var url = "ws://" + window.location.hostname +':'+ window.location.port;
      var url = "ws://" + window.location.hostname + ":8086";
      console.log(url);
      socket = io.connect(url);
    },
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
});
