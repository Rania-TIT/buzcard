appContext.factory("LoginService", [
    '$http',
    '$cordovaSQLite',
    function($http, $cordovaSQLite) {

      /**
       * the login server call
       */
      var logout = function() {
        var logoutRequest = {
          url : "https://www.buzcard.com/identification.aspx?request=leave",
          method :"GET",
          timeout: 10000
        }
        return     $http(logoutRequest);
      };
        /**
         * the login server call
         */
        var doLogin = function(email, password) {

            // the request parameters
            var loginRequest = {
                method: 'POST',
                url: 'https://www.buzcard.com/identification_mobile.aspx?request=identification',
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
                timeout: 10000,
                data: {
                    email: email,
                    hash: password
                }
            };
            // the HTTP request
            return $http(loginRequest);
        };

        /**
         * activate account server call
         */
        var activateAccount = function(email) {
            // the activation parameters
            var activateRequest = {
                method: "POST",
                url: 'https://www.buzcard.com/identification.aspx?request=activation',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
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
//                timeout: 20000,
                data: {
                    email: email
                }
            };
            // the HTTP request
            return $http(activateRequest);
        };
    	
        var createAccount = function(email, password, confirmpassword, callBack){
        	var langue = navigator.language.substring(0,2).toUpperCase()+"_"+navigator.language.substring(0,2)
        	console.log(langue)
        	 var createRequest = {
                     method: "POST",
                     url: 'https://www.buzcard.com/AccountCreationApp.aspx?request=Creation',
                     headers: {
                         'Content-Type': 'application/x-www-form-urlencoded',
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
//                     timeout: 20000,
                     data: {
                         email: email,
                         hash:password,
                         name:"",
                         surname:"",
                         ULanguage: langue
                     }
                 };
                 // the HTTP request
                 return $http(createRequest);
                 
        };


        /**
         * create identifiant table
         */
        var createIdentifiantTable = function(db, callBack) {

            var CreateQuery = 'CREATE TABLE IF NOT EXISTS identifiant (' +
                'id INTEGER PRIMARY KEY, ' +
                'email text, password text,userId text)';
            $cordovaSQLite.execute(db, CreateQuery).then(
                function(value) {
                    return callBack();
                },
                function(reason) {
                    console.log(reason);
                },
                function(value) {

                });
        };
        /**
         * delete all records from identifiant table
         */
        var emptyIdentifiantTable = function(db, callBack) {

            var query = "DELETE FROM identifiant where id = 1";
            $cordovaSQLite.execute(db, query).then(function(value) {
                return callBack();
            }, function(reason) {
                console.log(reason);
            }, function(value) {

            });
        };

        /**
         * save the user credentials into the identifiant Table
         */
        var setCredentials = function(db, email, password,userId, callBack) {
            try {
                $cordovaSQLite.execute(db, " INSERT INTO identifiant (id, email, password,userId) VALUES (?,?,?,?) ", [1, email, password,userId]).then(function(value) {
                    return callBack();

                }, function(reason) {
                    console.log(reason);
                }, function(value) {

                });

                return 1;
            } catch (e) {
                console.log(e);
                return 1;
            }
        };

        /**
         * GET the user credentials into the USER Table
         */
        var selectCredentials = function(db, callBack) {
            try {
                $cordovaSQLite.execute(db, "SELECT name FROM sqlite_master WHERE type='table' AND name='identifiant'").then(function(results) {
                    if (results.rows.length > 0) {
                        $cordovaSQLite.execute(db, "SELECT * FROM identifiant WHERE id=1").then(function(res) {

                            return callBack(res);
                        }, function(reason) {
                            console.error(reason);
                            return 1;
                        });
                    } else {
              console.log('table nexiste pas');
               callBack(1);
                    }
                }, function(reason) {
                    console.error(reason);
                    return 1;
                });
            } catch (e) {
                console.log(e);
                return 1;
            }
        };
        var deleteCredentials = function(db, callBack) {

            try {
                $cordovaSQLite.execute(db, "DELETE FROM identifiant WHERE id=1").then(function(result) {
                	$cordovaSQLite.execute(db, "DELETE FROM request").then(function(rs) {
                        return callBack(result);
                    }, function(reason) {
                        console.error(reason);
                        return 1;
                    });

                }, function(reason) {
                    console.error(reason);
                    return 1;
                });

            } catch (e) {
                console.log(e);
                return 1;
            }
        };

        /**
         * the login server call
         */
        var doLoginDev = function(email, password) {

            // the request parameters
            var loginRequest = {
                method: 'POST',
                url: 'https://www.buzcard.com/identification_mobile.aspx?request=identification',
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
                timeout: 2000,
                data: {
                    email: email,
                    hash: password
                }
            };
            // the HTTP request
            return $http(loginRequest);
        };

        /**
         * the factory returns
         */
        return {
            doLogin: doLogin,
            activateAccount: activateAccount,
            emptyIdentifiantTable: emptyIdentifiantTable,
            setCredentials: setCredentials,
            selectCredentials: selectCredentials,
            createIdentifiantTable: createIdentifiantTable,
            deleteCredentials: deleteCredentials,
            logout: logout,
            doLoginDev:doLoginDev,
            createAccount:createAccount
        };

    }
]);
