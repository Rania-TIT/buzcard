appContext.factory("SynchroServices", [
    '$cordovaSQLite',
    '$http',
    '$rootScope','$cordovaGeolocation','BuzcardService',
    function($cordovaSQLite,$http,$rootScope,$cordovaGeolocation,BuzcardService) {

      /**
       * create request table
       */
      var createRequestTable = function(db, callBack) {
        var createQuery = 'CREATE TABLE IF NOT EXISTS request ('
                + 'id INTEGER PRIMARY KEY, ' + 'name text,object text)';
        // console.warn(createQuery);
        try {
          $cordovaSQLite.execute(db, createQuery).then(function(value) {
            return callBack();
          }, function(reason) {
            // console.log(reason);
          }, function(value) {

          });
          return 0;
        } catch (e) {
          // console.log(e);
          return 1;
        }
      };

      /**
       * insert into request table
       * BUZCARDEDIT   : profile
       * CONTACTEDIT   : id,Contact
       * CONTACTDELETE : id
       * BUZCARDSEND   : email, selectLang, checkFollower, dateRDV
       * RENAMEGROUP   : oldName, newName
       * BUZCARDPHOTO  : path
       * CONTACTPHOTO  : id, path
       * CONTACTCREATE : idTmp
       */
      var insertRequest = function(db,name,object,callBack){
        switch (name) {
          case "CONTACTPHOTO":
            if (object.id.toString().length >= 10) {
              return callBack(0);
            }
            break;
          case "CONTACTEDIT":
              if (object.id.toString().length >= 10 ) {
              return callBack(0);
            }
            break;
          case "CONTACTDELETE":
              if (object.id.toString().length >= 10) {
              return callBack(0);
            }
            break;

        }
        var insertQuery = "INSERT INTO request (name,object) VALUES ('"+name+"' ,'"+JSON.stringify(object)+"')";
        console.log("********+++++**********");
        console.warn(insertQuery);
        console.log("********----***********");
        try {
          // console.warn(insertQuery);
          $cordovaSQLite.execute(db, insertQuery).then(function(value) {
            $rootScope.emptyQueue = false;

            return callBack(value);
          }, function(reason) {
            // console.log(reason);
          }, function(value) {

          });
          return 0;
        } catch (e) {
          // console.log(e);
          return 1;
        }
      };

      /**
       * select all request from request table
       */
      var selectAllRequest = function(db, callBack){

        try {

          var query = 'SELECT * FROM request order by id ASC';
          // console.warn(query);
          $cordovaSQLite.execute(db, query).then(function(result) {
              if (result.rows.length > 0) {
                // $rootScope.emptyQueue = false;
                return callBack(result);
              }else {
                // $rootScope.emptyQueue = true;
                return callBack(result);
              }

            }, function(reason) {
              //TODO FIXME
              // console.log("error " + reason);
              return 1;
            });

        } catch (e) {
          // console.log(e);
          return 1;
        }
      };
      var selectBuzcardSend = function(db, callBack){
    	  try {
    	  var query = 'SELECT * FROM request where name="BUZCARDSEND"';
          console.warn(query);
          $cordovaSQLite.execute(db, query).then(function(result) {

              return callBack(result);
            }, function(reason) {
              //TODO FIXME
              // console.log("error " + reason);
              return 1;
            });

        } catch (e) {
          // console.log(e);
          return 1;
        }
      }
      var selectBuzcardSendById = function(db, idTmp, callBack){
    	  try {
    	  var query = 'SELECT * FROM request where name="BUZCARDSEND" and object like "%'+idTmp+'%"';
          console.warn(query);
          $cordovaSQLite.execute(db, query).then(function(result) {
        	  console.log(result.rows.length)
              return callBack(result);
            }, function(reason) {
              //TODO FIXME
               console.log("error " + JSON.stringify(reason));
              return 1;
            });

        } catch (e) {
           console.log(e);
          return 1;
        }
      }

      /**
       * remove entry from request table
       */
      var deleteRequest = function(db,id,callBack){

        var query = "DELETE FROM request where id ="+id;
        // console.warn(query);
        $cordovaSQLite.execute(db, query).then(function(value) {
            return callBack();
        }, function(reason) {
            // console.log(reason);
        }, function(value) {

        });
      };

      var getAddressFromCoordonates = function(lat,long, id, callBack){

    	  //*************
    	  var getAddressRequest = {
    		      method: 'GET',
    		      url: "https://maps.googleapis.com/maps/api/geocode/json?Key=AIzaSyBTkpUYgvc9A8FftkVNc8Avade1BY_VR3o&latlng="+lat+","+long+"&sensor=true/false",
    		    };
    		    $http(getAddressRequest).success(function(response, status, headers, config) {
    		    	 console.log(response);
    		    	 if ("OK" == response.status ) {

    		            	return callBack(response.results[0].formatted_address, id);

    		            }else if("OVER_QUERY_LIMIT" == response.status){
    		            	// console.log(response.status);
    		            	return callBack("", id);
    		            }else if("ZERO_RESULTS" == response.status){
		    		    	// console.log(response.status);
		    		    	return callBack("undefined", id);
		    		    }
    		            else {
    		            	// console.warn('Geocoder failed due to: ' + response.status);
    		            	return callBack("", id);

    		            }

    		    }).error(function(data, status, headers, config) {
    		    	return callBack("", id);

                });
    	  //*************
      };

      var getActToken = function(callBack){
        $.ajax({
  	          type : "GET",
  	          url : "https://www.buzcard.com/send.aspx",
  	          success : function(a, status, xhr) {
  	        	  // console.log(a);
  	            var action = $($.parseHTML(a)).filter("#form1").attr("action");
  	            // console.log(action);

  	            return callBack(action);
  	          },
  	          error : function(xhr, ajaxOptions, thrownError) {
  	        	  callBack("error");
  	          }
  	        });
          };

          /**
           * empty request table
           */
          var emptyRequestTable = function(db, callBack) {
            var emptyQuery = 'DELETE FROM request';
            try {
              $cordovaSQLite.execute(db, emptyQuery).then(function(value) {
                return callBack();
              }, function(reason) {
                // console.log(reason);
              }, function(value) {

              });
              return 0;
            } catch (e) {
              // console.log(e);
              return 1;
            }
          };

          var updateRequest = function(db,requestName,idTmp,idServeur,callBack){
            var searchQuery = "SELECT * FROM request where name='"+requestName+"'";
            $cordovaSQLite.execute(db, searchQuery).then(function(resultset){
              console.info(resultset);
              var found = false;
              if (resultset.rows.length > 0) {
                for (var i = 0; i < resultset.rows.length; i++) {
                  var content = JSON.parse(resultset.rows.item(i).object);
                  if (content.idTmp == idTmp) {
                    var found = true;
                    content.idTmp = idServeur;
                    var updateQuery = "UPDATE request set object ='"+JSON.stringify(content)+"' WHERE id ="+resultset.rows.item(i).id ;
                    console.info(updateQuery);
                    $cordovaSQLite.execute(db, updateQuery).then(function(rs){
                           return callBack(0);
                    },function(err){
                      console.error(err);
                      return callBack(1);
                     });
                  }
                  if (!found) {
                    console.info("request not found");
                    return callBack(0);
                  }
                }
              }else {
                return callBack(0);
              }
            },function(error){
              console.error(error);
              return callBack(1);
            });

          }


        var updateRequestById = function(db,requestId, content, callBack){
            var updateQuery = "UPDATE request set object ='"+JSON.stringify(content)+"' WHERE id ="+requestId ;
            console.info(updateQuery);
            $cordovaSQLite.execute(db, updateQuery).then(function(rs){
                return callBack(0);
            },function(err){
                console.error(err);
                return callBack(1);
            });

        }

        var getLocationMobile = function(type,callBack){
          var date = new Date().toISOString();
         	var lat  = 0;
          	var lng = 0;
          	  var posOptions = {
                  enableHighAccuracy: true
                };
          
          	   $cordovaGeolocation
          	    .getCurrentPosition(posOptions)
          	    .then(function (position) {

          	      lat  = position.coords.latitude;
          	      lng = position.coords.longitude;

          		        var latlng = {
          		            lat: parseFloat(lat),
          		            lng: parseFloat(lng)
          		        };
          		       console.log('Coordonnées GPS du position actuelle: '+lat+" : "+lng+" date: "+date+" type: "+type);

          		       if(latlng.lat != 0 && latlng.lng != 0){

          		        	SendLocation(latlng.lat,latlng.lng,type,date, function(){
          		        		callBack("ok");
          		        	} )
          		        }else{
          		        	callBack("No place");

          		        }


          		}, function(err) {

      			 console.warn("erreur get position");
      			 console.warn(err);


      			  		callBack("error location");



          		});
          	  
        };
        var SendLocation = function(latitude,longitude,type, date, callBack){

        	BuzcardService.getACT(function(act){
        		 var request = {
        			        method: 'POST',
        			        url: 'https://www.buzcard.com/RegisterUserApp.aspx?request=update',
        			      //  url: 'http://52.37.51.232/test.php',
        			        headers: {
        			          'Content-Type': 'application/x-www-form-urlencoded'
        			        },
        			        transformRequest: function(obj) {
        			          var str = [];
        			          for ( var p in obj)
        			            str.push(encodeURIComponent(p) + "="
        			                    + encodeURIComponent(obj[p]));
        			          return str.join("&");
        			        },
        			        transformResponse: function(data) {

        			        },
        			        data: {
        			        	act:act,
        			        	latitude:latitude,
        			        	longitude:longitude,
        			        	position:'',
        			        	type:type,
        			        	date : date

        			        },
//        			        timeout : 4000,
        			      };
        			      $http(request).success(function(data, status, headers, config) {
        			      // console.log(data);
        			       callBack();
        			      }).error(function(data, status, headers, config) {
        			        console.log(status);
        			        callBack();

        			      });

        	});
        }


      return {
        createRequestTable: createRequestTable,
        insertRequest : insertRequest ,
        selectAllRequest : selectAllRequest,
        deleteRequest: deleteRequest,
        getAddressFromCoordonates  : getAddressFromCoordonates,
        selectBuzcardSend:selectBuzcardSend,
        getActToken : getActToken,
        emptyRequestTable : emptyRequestTable,
        updateRequest : updateRequest,
        getLocationMobile:getLocationMobile,
        SendLocation:SendLocation,
        selectBuzcardSendById:selectBuzcardSendById,
        updateRequestById : updateRequestById

      };
    }]);
