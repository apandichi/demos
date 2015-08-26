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

  var executeInChain = function(queries) {
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
		}, $q.when());
    return promise;
  };

  var selectCurrentVersion = function() {
		var query = "SELECT MAX(versionNumber) AS maxVersion FROM version_history";
		var promise = $cordovaSQLite.execute(db, query)
			.then(function(res) {
				var maxVersion = res.rows.item(0).maxVersion;
				LoggingService.log("Current version is " + maxVersion);
				return maxVersion;
			});
		return promise;
	};

  var storeVersionInHistoryTable = function(versionNumber) {
		var query = "INSERT INTO version_history (versionNumber, migratedAt) VALUES (?, ?)";
		var promise = $cordovaSQLite.execute(db, query, [versionNumber, new Date()])
			.then(function(res) {
				LoggingService.log("Stored version in history table: " + versionNumber);
				return versionNumber;
			});
		return promise;
	};

  var createVersionHistoryTable = function() {
    var versionNumber = 0;

    var queries = [
      "CREATE TABLE IF NOT EXISTS version_history(versionNumber INTEGER PRIMARY KEY NOT NULL, migratedAt DATE)"
    ];

    var promise = executeInChain(queries).then(function() {
      return versionNumber;
		});

    return promise;
  };

  var version1 = function(currentVersion) {
    var versionNumber = 1;
    if (currentVersion >= versionNumber)
				return $q.when(currentVersion);

    var queries = [
      "CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY NOT NULL, firstname VARCHAR(100), lastname VARCHAR(100))",
      "CREATE TABLE IF NOT EXISTS pet(id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(100))"
    ];


		var promise = executeInChain(queries).then(function() {
			LoggingService.log("Version 1 migration executed");
      return versionNumber;
		})
    .then(storeVersionInHistoryTable);

    return promise;
  };

  var version2 = function(currentVersion) {
    var versionNumber = 2;
    if (currentVersion >= versionNumber)
				return $q.when(currentVersion);

    var queries = [
      "ALTER TABLE person ADD address VARCHAR(100)",
      "ALTER TABLE pet ADD ownerId INTEGER"
    ];

    var promise = executeInChain(queries).then(function() {
			LoggingService.log("Version 2 migration executed");
      return versionNumber;
		})
    .then(storeVersionInHistoryTable);

    return promise;
  };

  this.migrate = function() {
    db = $cordovaSQLite.openDB({ name: "my.db", bgType: 1 });

    var versionsToMigrate = [
      createVersionHistoryTable,
      selectCurrentVersion,
      version1,
      version2
    ];

    versionsToMigrate.reduce(function(current, next) {
			return current.then(next);
		}, $q.when())
		.then(function() {
			LoggingService.log("All migrations executed");
    })
    .catch(function(error) {
      LoggingService.log("Error: " + JSON.stringify(error));
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
