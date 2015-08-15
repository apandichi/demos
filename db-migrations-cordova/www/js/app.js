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

.service('DatabaseService', function($ionicPlatform, $cordovaSQLite, LoggingService, $q) {
  var db;

  var version1 = function() {
    var queries = [
      "CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY NOT NULL, firstname VARCHAR(100), lastname VARCHAR(100))",
      "CREATE TABLE IF NOT EXISTS pet(id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(100))"
    ];

    var promise = queries.reduce(function(previous, query) {
				LoggingService.log("chaining " + query);
				return previous.then(function() {
				 	LoggingService.log("executing " + query);
					return $cordovaSQLite.execute(db, query, [])
						.then(function(result) {
							LoggingService.log(" done " + JSON.stringify(query));
							return $q.when(query);
						});
				});
			}, $q.when())
			.then(function() {
				LoggingService.log("Version 1 migration executed");
			})
      .catch(function(error) {
        LoggingService.log("Error: " + JSON.stringify(error));
      });

    return promise;
  };

  this.migrate = function() {
    db = $cordovaSQLite.openDB({ name: "my.db", bgType: 1 });

    var versionsToMigrate = [
      version1
    ];

    versionsToMigrate.reduce(function(current, next) {
			return current.then(next);
		}, $q.when())
		.then(function() {
			LoggingService.log("All migrations executed");
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
