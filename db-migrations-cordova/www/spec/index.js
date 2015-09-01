/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
describe('app', function() {

  describe("DatabaseService", function() {

    beforeAll(function() {	  
	  // replace sqlitePlugin with websql
      device = {};
      window.sqlitePlugin = {};
      window.sqlitePlugin.openDatabase = function() {
        return openDatabase('mydb', '1.0', 'myDatabase', 10000000);
      };
      
      var done = function() {
        // console.log('done');
      };

      var error = function(tx, err) {
        // console.log('error: ' + err.message);
      };

      var processQuery = function(db, queries, dbname) {
        db.transaction( function (tx){
          for (var idx = 0; idx < queries.length; idx++) {
            tx.executeSql(queries[idx], [], done, error);
          }
        });
      };

      $.ajax({
		url: 'https://cdn.rawgit.com/apandichi/demos/eaf2109abc17f90f6cad8340e0b491eca90aa766/db-migrations-cordova/www/spec/db-schema.sql',
		type: 'get',
		async: false,
		success: function(response) {
          var db = openDatabase('mydb', '1.0', 'myDatabase', 10000000);
          processQuery(db, response.split(';\n'), 'myDatabase');
        },
        error: function(response) {
          console.log("error!", JSON.stringify(response));
        }
	  });
    });

    var DatabaseService;

    beforeEach(function() {        
      angular.mock.module("starter");
	  angular.mock.module(function ($provide) {
	    $provide.value('$q', Q);
	  });
		
      inject(function(_DatabaseService_) {
        DatabaseService = _DatabaseService_;
        helper.trigger(window.document, 'deviceready');
      });
    });

    it("should save person into the database", function() {
      runs(function() {
        return DatabaseService.insertPerson("Jon", "Arbuckle", "Somewhere in the US")
        .then(function (insertId) {
			return DatabaseService.selectPerson(insertId)
		});
      }, function(result) {
        expect(result.firstname).toBe("Jon");
        expect(result.lastname).toBe("Arbuckle");
        expect(result.address).toBe("Somewhere in the US");
      });
      
    });

  });
  

});
