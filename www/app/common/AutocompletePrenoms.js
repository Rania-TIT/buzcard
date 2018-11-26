appContext.factory('AutoCompleteService',['$http', '$cordovaSQLite','ContactsService', function($http,$cordovaSQLite,ContactsService){
	/**
	 *
	 */
	var getPrenoms = function(callBack, callBackError){
		 $http.get('prenom.json', {}).
	     success(function(responseData, status) {

	       callBack(responseData);


	     }).
	     error(function(data, status, headers, config) {
	         // console.log("error");
	         callBackError();
	     });
	};
	/**
	 *
	 */
	var createPrenom = function(db, callBack){
		 var createQuery = 'CREATE TABLE IF NOT EXISTS prenoms ('+
		    'name text)';
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
	 *
	 */
	 var emptyPrenomTable = function(db,callBack){

		    var query ="DELETE FROM prenoms";
		    $cordovaSQLite.execute(db, query).then(function(value) {
		      return callBack();
		    }, function(reason){
		      // console.log(reason);
		    }, function(value){

		    });
		  };
	/**
	 *
	 */
	var insertPrenoms = function(db, counter, prenomArray, callBack){

		  	if(counter==0 ){

		  		var n=200;

		  		var j=0;
		  	}
		  	else {
		  		var n = counter * 200;
		  		if(n < parseInt(prenomArray.length-200)){
		  		   var n = n+200;
		  			var j = counter *200;
		  		}
		  		else{
		  			var n = prenomArray.length;
			  		var j = counter *200;
		  		}

		  	}
		 	var insertQuery = "INSERT INTO prenoms " + " SELECT '" + prenomArray[j].domaine
  			+ "' AS 'name' ";

  	for (var j =j+1; j < n; j++) {

  		insertQuery = insertQuery + "  UNION SELECT '"
  				+ prenomArray[j].domaine + "' ";
  	}
  	try {

  		$cordovaSQLite.execute(db, insertQuery).then(
  				function(value) {
  					if (prenomArray.length > n) {
  						return insertPrenoms(db, ++counter,
  								prenomArray, callBack);
  					} else {
  						return callBack();
  					}

  				}, function(reason) {

  					// console.warn(insertQuery);
  					// console.log(reason);
  				}, function(value) {

  				});

  		return 0;
  	} catch (e) {
  		// console.log(e);
  		return 1;
  	}
	};


	var searchName = function(db, str, callBack){
		  var query ="select Distinct LOWER(name) As Domaine from prenoms where Domaine like '"+str+"%@%' ORDER BY  Domaine ASC LIMIT 50";
          $cordovaSQLite.execute(db, query).then(function(result) {
					//	if(result.rows.length > 0){
								var domaines =[];
								for (var int = 0; int < result.rows.length; int++) {

								var domaine = {domaine: result.rows.item(int).Domaine };


								domaines.push(domaine);

								}
								return callBack(domaines);
//							}else{
//								searchNameSansEmail(db, str,function(nameSansEmail){
//									return callBack(nameSansEmail);
//								});
//							}


          }, function(reason){
            // console.log(reason);
            return 1;
          }, function(value){
        	  return 1;

          });
	};
	var searchNameSansEmail = function(db, str, callBack){
		  var query ="select Distinct LOWER(name) As Domaine from prenoms where Domaine like '"+str+"%' ORDER BY  Domaine ASC LIMIT 50";
          $cordovaSQLite.execute(db, query).then(function(result) {

								var domaines =[];
								for (var int = 0; int < result.rows.length; int++) {

								var domaine = {domaine: result.rows.item(int).Domaine };


								domaines.push(domaine);

								}
								return callBack(domaines);



          }, function(reason){
            // console.log(reason);
            return 1;
          }, function(value){
        	  return 1;

          });
	};

	var InsertEmailsContacts = function(db,res,counter,callBack){
		
		if(counter==0 ){

			if(res.rows.length < 200)
		  		var n=res.rows.length;
		  		else
		  		var n=200;

		  		var j=0;
	  	}
	  	else {
	  		var n = counter * 200;
	  		if(n < parseInt(res.rows.length-200)){
	  		   var n = n+200;
	  			var j = counter *200;
	  		}
	  		else{
	  			var n = res.rows.length;
		  		var j = counter *200;
	  		}

	  	}
	 	var insertQuery = "INSERT INTO prenoms " + " SELECT '" + res.rows.item(j).email
			+ "' AS 'name' ";

	for (var j =j+1; j < n; j++) {

		insertQuery = insertQuery + "  UNION SELECT '"
				+ res.rows.item(j).email + "' ";
	}
	try {

		$cordovaSQLite.execute(db, insertQuery).then(
				function(value) {
					if (res.rows.length > n) {
						return InsertEmailsContacts(db,res, ++counter,callBack);
					} else {
						return callBack();
					}

				}, function(reason) {

					// console.warn(insertQuery);
					// console.log(reason);
				}, function(value) {

				});

		return 0;
	} catch (e) {
		// console.log(e);
		return 1;
	}

	};
	
	var checkIfExistPrenom = function(db,name ,callBack){
		//var name = res.rows.item(counter).email;
		
				  var query ="select Distinct LOWER(name) As Name from prenoms where Name ='"+name+"'";
		          $cordovaSQLite.execute(db, query).then(function(result) {
		
		        	if(result.rows.length>0){
		        		
		        			callBack();
		        		
		        	}else{
		        		insertSinglePrenom(db, name,function(){
		        		
		            			callBack();
		            		
		        		});
		        	}
		
		
		          }, function(reason){
		            // console.log(reason);
		            return 1;
		          }, function(value){
		        	  return 1;
		
		          });
	};

	var insertEmailsContact = function(db, callBack){
		ContactsService.SelectEmailsName(db,function(result){

			if(result.rows.length>0){
				InsertEmailsContacts(db,result,0,function(){
					callBack();
					});
			}else{
				callBack();
			}


		});
	};
	var insertSinglePrenom = function(db, newName,callBack){

		var insertQuery = 'INSERT INTO prenoms  VALUES ("'+newName+'")';
	    try {
//

	    	console.warn(insertQuery);
	      $cordovaSQLite.execute(db, insertQuery).then(function(value) {

	        return callBack();
	      }, function(reason) {

	      }, function(value) {

	      });
	      return 0;
	    } catch (e) {
	       console.log(e);
	      return 1;
	    }
	};

	  /**
     * the factory returns
     */
  return {
	  getPrenoms : getPrenoms,
	  createPrenom : createPrenom,
	  emptyPrenomTable :emptyPrenomTable,
	  insertPrenoms: insertPrenoms,
	  searchName: searchName,
	  checkIfExistPrenom:checkIfExistPrenom,
	  insertEmailsContact:insertEmailsContact,
	  insertSinglePrenom:insertSinglePrenom,
	  InsertEmailsContacts:InsertEmailsContacts
  };

}]);
