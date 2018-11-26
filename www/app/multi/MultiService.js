appContext.factory("MultiService", ['$http','$q','$cordovaSQLite', function($http,$q,$cordovaSQLite) {

    var getEventList = function(act) {

        var getEventRequest = {
            method: 'GET',
            url: "https://www.buzcard.com/EventParticipants.aspx?request=eventslist&act=" + act,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'

            },
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            transformResponse: function(data) {
                var x2js = new X2JS();
                var json = x2js.xml_str2json(data);
                return json;
            },

        }
        return $http(getEventRequest)
    }

    var createMultiTable = function(db) {
        var deffered = $q.defer();
        var createQuery = 'CREATE TABLE  IF NOT EXISTS  Multi (' +
            'id integer primary key UNIQUE ,' +
            ' name text  )';
        $cordovaSQLite.execute(db, createQuery).then(function(value) {
            deffered.resolve();

        }, function(reason) {
            deffered.reject()
        });

        return deffered.promise;
    }

    var emptyMultiTable = function(db) {
        var deffered = $q.defer();
        var createQuery = 'DELETE  FROM Multi';

        $cordovaSQLite.execute(db, createQuery).then(function(value) {
            deffered.resolve();

        }, function(reason) {
            deffered.reject()
        });

        return deffered.promise;
    }

    var insert = function(db, eventName) {
        var deffered = $q.defer();
        var createQuery = 'INSERT INTO Multi (name) VALUES (?)';

        $cordovaSQLite.execute(db, createQuery, [eventName]).then(function(value) {
            deffered.resolve();

        }, function(reason) {
            deffered.reject()
        });

        return deffered.promise;
    }

    var insertBulk = function(db, eventArray) {
        var deferred = $q.defer();

        var insertQuery = "INSERT INTO Multi " +
        " SELECT '" + 1  + "' AS 'id', '" +
          eventArray[0]+"' AS 'name' ";

      for (var i =1; i < eventArray.length; i++) {
        var j = 1+i;
        insertQuery = insertQuery + "  UNION SELECT '"
            + j + "','"
            +eventArray[i]+"'";
      }
        $cordovaSQLite.execute(db, insertQuery).then(function(result) {

            deferred.resolve(result);

        }, function(reason) {
            deferred.reject(reason);
        });
        return deferred.promise;
    }

    var findAll = function(db) {
        var deffered = $q.defer();
        var createQuery = 'select * from Multi';

        $cordovaSQLite.execute(db, createQuery).then(function(rs) {
            deffered.resolve(rs);

        }, function(reason) {
            deffered.reject()
        });

        return deffered.promise;
    }
    return {
        getEventList: getEventList,
        createMultiTable: createMultiTable,
        emptyMultiTable: emptyMultiTable,
        insert: insert,
        insertBulk: insertBulk,
        findAll: findAll
    }
}])
