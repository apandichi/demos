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

  window.document.addEventListener('deviceready', function() {
    db = $cordovaSQLite.openDB({ name: "mydb", bgType: 1 });
  }, false);
  

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
    var query = "CREATE TABLE IF NOT EXISTS version_history(versionNumber INTEGER PRIMARY KEY NOT NULL, migratedAt DATE)";
    var promise = $cordovaSQLite.execute(db, query, [])
    .then(function() {
      var versionNumber = 0;
      return versionNumber;
    });
    return promise;
  };

  this.migrate = function() {
    

    var initialSteps = [
      createVersionHistoryTable,
      selectCurrentVersion
    ];

    var version1 = {
      versionNumber: 1,
      queries: [
        "CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY NOT NULL, firstname VARCHAR(100), lastname VARCHAR(100))",
        "CREATE TABLE IF NOT EXISTS pet(id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(100))"
      ]
    };

    var version2 = {
      versionNumber: 2,
      queries: [
        "ALTER TABLE person ADD address VARCHAR(100)",
        "ALTER TABLE pet ADD ownerId INTEGER"
      ]
    };

    var versions = [
      version1,
      version2
    ];

    var migrationSteps = versions.map(function(version) {
      return function(currentVersion) {
        if (currentVersion >= version.versionNumber)
          return $q.when(currentVersion);

        var promise = executeInChain(version.queries).then(function() {
          LoggingService.log("Version "+version.versionNumber+" migration executed");
          return version.versionNumber;
        })
        .then(storeVersionInHistoryTable);

        return promise;
      };
    });

    var steps = initialSteps.concat(migrationSteps);
    steps.reduce(function(current, next) {
      return current.then(next);
    }, $q.when())
    .then(function() {
      LoggingService.log("All migrations executed");
    })
    .catch(function(error) {
      LoggingService.log("Error: " + JSON.stringify(error));
    });

  };
  
  this.insertPerson = function(firstname, lastname, address) {
    var query = "INSERT INTO person (firstname, lastname, address) VALUES (?, ?, ?)";
    var args = [firstname, lastname, address]
    var promise = $cordovaSQLite.execute(db, query, args)
      .then(function(result) {
        return result.insertId;
      });
    return promise;
  };
  
  this.selectPerson = function(id) {
    var query = "SELECT * FROM person WHERE id = ?";
    var promise = $cordovaSQLite.execute(db, query, [id])
      .then(function(result) {
        var person = result.rows.item(0);
        return person;
      });
    return promise;
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
