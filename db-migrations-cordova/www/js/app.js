// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

.service('DatabaseService', function($ionicPlatform, $cordovaSQLite) {
  this.migrate = function() {
    var db = $cordovaSQLite.openDB({ name: "my.db", bgType: 1 });
    var query = "CREATE TABLE IF NOT EXISTS person(id INTEGER PRIMARY KEY NOT NULL, firstname VARCHAR(100), lastname VARCHAR(100))";
    console.log("will run query " + query);
    $cordovaSQLite.execute(db, query, []).then(function(res) {
      console.log("created");
    }, function (err) {
      console.error(JSON.stringify(err));
    });
  };
  return this;
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
