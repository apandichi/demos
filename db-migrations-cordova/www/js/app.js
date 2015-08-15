// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.service('LoggingService', function($rootScope) {
  this.log = function(message) {
      $rootScope.$broadcast('log', message);
  };
  return this;
})

.service('DatabaseService', function($ionicPlatform, $cordovaSQLite, LoggingService) {
  this.migrate = function() {
    var db = $cordovaSQLite.openDB({ name: "my.db", bgType: 1 });
    var query = "CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY NOT NULL, firstname VARCHAR(100), lastname VARCHAR(100))";
    LoggingService.log("will run query " + query);
    $cordovaSQLite.execute(db, query, []).then(function(res) {
      LoggingService.log("created");
    }, function (err) {
      console.error(JSON.stringify(err));
    });
  };
  return this;
})

.controller('LogController', function($scope) {
  $scope.messages = [];
  $scope.$on('log', function(event, data) {
    $scope.messages.push(data);
  });
})

.run(function($ionicPlatform, DatabaseService) {
  $ionicPlatform.ready(function() {
    DatabaseService.migrate();
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
