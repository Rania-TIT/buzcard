appContext.factory('autoCompleteDomaines',['$http', '$cordovaSQLite','ContactsService', function($http,$cordovaSQLite,ContactsService){
	/**
	 * 
	 */
	var getNomdeDomaines = function(callBack, callBackError){
		 $http.get('domaines.json', {}).
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
	var createDomaines = function(db, callBack){
		 var createQuery = 'CREATE TABLE IF NOT EXISTS domaines ('+
		    'domaine text, Qte number)';
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
	 var emptyDomainesTable = function(db,callBack){
		    
		    var query ="DELETE FROM domaines";
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
	var insertDomaines = function(db, counter, prenomArray, callBack){
		
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
		 	var insertQuery = "INSERT INTO domaines " + " SELECT '" + prenomArray[j].FIELD1
  			+ "' AS 'domaine', '"+prenomArray[j].FIELD2+"' AS 'Qte' ";

  	for (var j =j+1; j < n; j++) {

  		insertQuery = insertQuery + "  UNION SELECT '"
  				+ prenomArray[j].FIELD1 + "','"
  				+ prenomArray[j].FIELD2 +"' ";
  	}
  	try {
  		
  		$cordovaSQLite.execute(db, insertQuery).then(
  				function(value) {
  					if (prenomArray.length > n) {
  						return insertDomaines(db, ++counter,
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
	
	var searchDomaine = function(str,db, callBack){
		  var query ="select Distinct LOWER(domaine) As Domaine from domaines where Domaine like '"+str+"%' ORDER BY Domaine ASC LIMIT 50";
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
	var selectDomaine = function(db,callBack){
		 var query ="select Distinct LOWER(domaine) As Domaine from domaines  ORDER BY Domaine ASC LIMIT 50";
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
	}
	var checkIfExistDomaine = function(db,res,counter,callBack){
		var domaine = res.rows.item(counter).domaine;
		
		  var query ="select Distinct LOWER(domaine) As Domaine from domaines where Domaine ='"+domaine+"'";
          $cordovaSQLite.execute(db, query).then(function(result) {
        	  
        	if(result.rows.length>0){
        		if(parseInt(counter) == res.rows.length-1){
        			callBack();
        		}else{
        			counter = parseInt(counter)+1;
        		checkIfExistDomaine(db,res, counter,callBack);
        		}
        	}else{
        		insertSingleDomaine(db, domaine,function(){
        			if(parseInt(counter) ==res.rows.length-1){
            			callBack();
            		}else{
            			counter = parseInt(counter)+1;
        			checkIfExistDomaine(db,res,counter ,callBack);
            		}
        		});
        	}
        	  
        	
          }, function(reason){
            // console.log(reason);
            return 1;
          }, function(value){
        	  return 1;
            
          });   
	};
	
	var insertDomaineContact = function(db, callBack){
		ContactsService.SelectDomaineName(db,function(result){
			
			if(result.rows.length>0){
				checkIfExistDomaine(db,result,0,function(){
					callBack();
					});	
			}else{
				callBack();
			}
				
			
		});
	};
	var insertSingleDomaine = function(db, newDomaine,callBack){
		
		var insertQuery = 'INSERT INTO domaines (domaine, Qte) VALUES ("'+newDomaine+'", 1)';
	    try {
//	       console.warn(insertQuery);
	      $cordovaSQLite.execute(db, insertQuery).then(function(value) {
	        
	        return callBack();
	      }, function(reason) {
	      	console.log(reason);
	      }, function(value) {
	        
	      });
	      return 0;
	    } catch (e) {
	       console.log(e);
	      return 1;
	    }
	};
	var AddnewDomaine = function(db, newDomaineD, callBack){
		  var query ="select Distinct LOWER(domaine) As Domaine from domaines where Domaine ='"+newDomaineD+"'";
          $cordovaSQLite.execute(db, query).then(function(result) {
        	if(result.rows.length>0){
        			callBack();
        	}else{
        		insertSingleDomaine(db, newDomaineD,function(){
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
	
	  /**
     * the factory returns
     */
  return {
	  getNomdeDomaines : getNomdeDomaines,
	  createDomaines : createDomaines,
	  emptyDomainesTable :emptyDomainesTable,
	  insertDomaines: insertDomaines,
	  searchDomaine: searchDomaine,
	  selectDomaine:selectDomaine,
	  checkIfExistDomaine:checkIfExistDomaine,
	  insertDomaineContact:insertDomaineContact,
	  insertSingleDomaine:insertSingleDomaine,
	  AddnewDomaine:AddnewDomaine,
  };
	 
}]);