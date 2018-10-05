appContext.factory("ContactsService", ['$http','$cordovaSQLite','LoadingService','cameraService','$rootScope','$cordovaFile','LoginService','MenuService',
'$translate','$cordovaCalendar','$filter','$cordovaGeolocation','SynchroServices','$cordovaContacts','$ionicPlatform',
 function($http,$cordovaSQLite, LoadingService,cameraService,$rootScope,$cordovaFile,LoginService,MenuService,
   $translate,$cordovaCalendar,$filter,$cordovaGeolocation,SynchroServices,$cordovaContacts,$ionicPlatform) {



  /**
   * get contacts list from server
   */
  var getContacts = function(page) {


    // the request parameters
    var loginRequest = {
      method: 'POST',
      // we should use contact_mobile.aspx to get 600 contact per packet
      url: 'https://www.buzcard.com/contacts_mobile.aspx?request=contacts&lot=400',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      transformRequest: function(obj) {
        var str = [];
        for ( var p in obj)
          str.push(encodeURIComponent(p) + "="+ encodeURIComponent(obj[p]));
        return str.join("&");
      },
      transformResponse: function(data) {
        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        return json;
      },
      data: {
        sorting_order:"desc",
        sorting_criterion:"date",
        page:page
      },
//      timeout: 4000,
    };
    // the HTTP request
    return $http(loginRequest);
  };
  /**
   * get contactModifier from serveur
   */

  var getContactsEdited = function(page) {
	  var dateSynchronisation = MenuService.getLocalStorage("dateSynchronisation");
	//  alert(dateSynchronisation);
	  var url="";
	  if(dateSynchronisation !=false){
		url= 'https://www.buzcard.com/contacts_mobile.aspx?request=contacts&modificationdate='+dateSynchronisation ;
	  }else{
		url = 'https://www.buzcard.com/contacts_mobile.aspx?request=contacts';
	  }

    // the request parameters
    var loginRequest = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },transformRequest: function(obj) {
          var str = [];
          for ( var p in obj)
            str.push(encodeURIComponent(p) + "="+ encodeURIComponent(obj[p]));
          return str.join("&");
        },
      transformResponse: function(data) {
        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        return json;
      },
      data: {
          sorting_order:"desc",
          sorting_criterion:"date",
          page:page
        }
//      timeout: 4000,
    };

//   alert(url);
   //alert(JSON.stringify(loginRequest.data));
    // the HTTP request
    return $http(loginRequest);
  };

  /**
   *
   * get group list from server
   */
  var getGroup = function() {

    // the request parameters
    var getGroupRequest = {
      method: 'POST',
      url: 'https://www.buzcard.com/contacts_mobile.aspx?request=lists',
      transformResponse: function(data) {
        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        return json;

      },
//      timeout: 4000,
    };
    // the HTTP request
    return $http(getGroupRequest);
  };

  /**
   * create group table
   */
  var createGroupTable = function(db,callBack) {
    var createGroupeQuery = 'CREATE TABLE IF NOT EXISTS groupe ('+
    'id INTEGER PRIMARY KEY, '+
    'name text)';
    try {
        $cordovaSQLite.execute(db, createGroupeQuery).then(function(value) {
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
   * empty the group table
   */
  var emptyGroupTable = function(db,callBack){

    var query ="DELETE FROM groupe";
    $cordovaSQLite.execute(db, query).then(function(value) {
      return callBack();
    }, function(reason){
      // console.log(reason);
    }, function(value){

    });
  };
  /**
   * empty the contact table
   */
  var emptyContactTable = function(db,callBack){

    var query ="DELETE FROM contact";
    $cordovaSQLite.execute(db, query).then(function(value) {
      return callBack();
    }, function(reason){
    //  console.log(reason);
    }, function(value){
//console.log(value);
    });
  };

  /**
   * create contacts table
   */
  var createContactsTable = function(db,callBack){

    var createContactQuery = 'CREATE TABLE IF NOT EXISTS contact ('+
    'id INTEGER primary key, '+
    'rendez_vous integer, email text, date INTEGER, comment text, '+
    'last_name text, first_name text, phone_1 text, phone_2 text,company text, '+
    'list TEXT, status text,lastsendemail text,LanguageText text,firstsendemail text,  '+
    'photofilelocation text,alerteemailcreationdate text, modificationdate text, meeting_point text,latitude_meeting real,longitude_meeting real,synchro text,lastsendemailtimeStmp integer,domaine text, '+
    'emailaddress2 text, actu text, addressline1 text, addressline2 text, addressline3 text, postalcode text, city text, workphonenumber text, mobilephonenumber2 text, source text, fonction text, vcardprofil text, Filleul text, Link_CardOnline text )';

    try {
          $cordovaSQLite.execute(db, createContactQuery).then(function(value) {
          	return callBack();
          }, function(reason) {
             //console.log(reason);
          }, function(value) {

          });
          return 0;
        } catch (e) {

          // console.log(e);
          return 1;
        }
  };

  /**
   * insert into group table
   */
  var insertIntoGroupTable= function(db,groupName,callBack) {
    var insertQuery = 'INSERT INTO groupe (id,name) VALUES ((select Max(id) from groupe)+1 ,"'+addSlashes(groupName)+'")';
    try {
      // console.warn(insertQuery);
      $cordovaSQLite.execute(db, insertQuery).then(function(value) {

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
   * insert a single contatc into contacts
   */
  var insertIntoContactsTable = function(db,contact,callBack) {
	  var synchro='false';
	  // console.log("+++++ insertIntoContactsTable ++++++++");
    var insertQuery = 'INSERT INTO contact (id,rendez_vous, email, date, comment,' +
    'last_name, first_name, phone_1, phone_2, company, '+
    'list, status,lastsendemail, LanguageText,firstsendemail,photofilelocation,'+
    'alerteemailcreationdate, modificationdate, meeting_point,latitude_meeting,longitude_meeting,synchro,domaine,lastsendemailtimeStmp,'+
    'emailaddress2 , actu, addressline1, addressline2, addressline3, postalcode, city , workphonenumber , mobilephonenumber2 , source , fonction , vcardprofil, Filleul, Link_CardOnline  ) VALUES '+
    '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
   var domaine = contact.email.substring(contact.email.indexOf('@')+1, contact.email.length);
    try {
      var parameters = [contact.id,toTimeStamp(contact.rendez_vous),contact.email,contact.date,addSlashes(contact.comment),
                        addSlashes(contact.last_name),addSlashes(contact.first_name),addSlashes(contact.phone_1),addSlashes(contact.phone_2),
                        addSlashes(contact.company),addSlashes(contact.list),contact.status,contact.lastsendemail,contact.LanguageText,contact.firstsendemail,
                        contact.photofilelocation,contact.alerteemailcreationdate,contact.modificationdate,addSlashes(contact.meeting_point),contact.latitude_meeting,contact.longitude_meeting,synchro,domaine.trim(), toTimeStampLast(contact.lastsendemail),
                        addSlashes(contact.emailaddress2) , addSlashes(contact.actu), addSlashes(contact.addressline1), addSlashes(contact.addressline2), addSlashes(contact.addressline3), addSlashes(contact.postalcode), addSlashes(contact.city) , addSlashes(contact.workphonenumber) ,
                        addSlashes(contact.mobilephonenumber2) , addSlashes(contact.source) , addSlashes(contact.fonction) , contact.vcardprofil, contact.Filleul, contact.Link_CardOnline ];
      $cordovaSQLite.execute(db, insertQuery,parameters).then(function(value) {
        return callBack(0);

      }, function(reason) {
        console.error(reason);
        return callBack(1);

      }, function(value) {
        console.error(value);
        return callBack(1);

      });

    } catch (e) {
       console.log(e);
      return 1;
    }
  };
  /**
   * insert an array of contact into contacts
   */
  var insertBulkIntoContactsTable = function(db, counter, contactArray, callBack) {

	  var synchro='false';
	  if( contactArray instanceof Array ){


  	if(counter==0 ){
  		if(contactArray.length < 200)
  		var n=contactArray.length;
  		else
  		var n=200;

  		var j=0;
  	}
  	else if(counter==1 ){
  		if(contactArray.length < 400)
  	  		var n=contactArray.length;
  	  		else
  	  		var n=400;

  		var j=200;
  	}
  	else if(counter==2){
  		var j=400;
  		var n=contactArray.length;
  	}
//  	console.log('--------------------'+j);
//  	console.log(contactArray);
//  	console.log('+++++++++++++++++++'+n);
  	 var domaine = contactArray[j].email.substring(contactArray[j].email.indexOf('@')+1, contactArray[j].email.length);
  	var insertQuery = "INSERT INTO contact " + " SELECT '" + contactArray[j].id
  			+ "' AS 'id', '" + toTimeStamp(contactArray[j].rendez_vous)
  			+ "' AS 'rendez_vous','" + contactArray[j].email + "' AS 'email','"
  			+ contactArray[j].date + "' AS 'date','"
  			+ addSlashes(contactArray[j].comment) + "' AS 'comment', '"
  			+ addSlashes(contactArray[j].last_name) + "' AS 'last_name','"
  			+ addSlashes(contactArray[j].first_name) + "' AS 'first_name','"
  			+ addSlashes(contactArray[j].phone_1) + "' AS 'phone_1','"
  			+ addSlashes(contactArray[j].phone_2) + "' AS 'phone_2','"
  			+ addSlashes(contactArray[j].company) + "' AS 'company','"
  			+ addSlashes(contactArray[j].list) + "' AS 'list','"
  			+ contactArray[j].status + "' AS 'status','"
  			+ contactArray[j].lastsendemail + "' AS 'lastsendemail','"
  			+ contactArray[j].LanguageText + "' AS 'LanguageText', '"
  			+ contactArray[j].firstsendemail + "' AS 'firstsendemail', '"
  			+ contactArray[j].photofilelocation + "' AS 'photofilelocation', '"
  			+ contactArray[j].alerteemailcreationdate + "' AS 'alerteemailcreationdate', '"
  			+ contactArray[j].modificationdate + "' AS 'modificationdate', '"
			+ addSlashes(contactArray[j].meeting_point) + "' AS 'meeting_point', '"
			+ contactArray[j].latitude_meeting + "' AS 'latitude_meeting', '"
			+ contactArray[j].longitude_meeting + "' AS 'longitude_meeting', '"
			+ synchro+"' AS 'synchro', '"
			+ toTimeStampLast(contactArray[j].lastsendemail)+"' AS 'lastsendemailtimeStmp', '"
			+ domaine.trim()+"' AS 'domaine',  '"
			+ addSlashes(contactArray[j].emailaddress2) + "' AS 'emailaddress2', '"
  			+ addSlashes(contactArray[j].actu) + "' AS 'actu','"
  			+ addSlashes(contactArray[j].addressline1) + "' AS 'addressline1','"
  			+ addSlashes(contactArray[j].addressline2) + "' AS 'addressline2','"
  			+ addSlashes(contactArray[j].addressline3) + "' AS 'addressline3','"
  			+ addSlashes(contactArray[j].postalcode) + "' AS 'postalcode','"
  			+ addSlashes(contactArray[j].city) + "' AS 'city','"
  			+ addSlashes(contactArray[j].workphonenumber) + "' AS 'workphonenumber','"
  			+ addSlashes(contactArray[j].mobilephonenumber2) + "' AS 'mobilephonenumber2','"
  			+ addSlashes(contactArray[j].source) + "' AS 'source','"
  			+ addSlashes(contactArray[j].fonction) + "' AS 'fonction','"
  			+ addSlashes(contactArray[j].vcardprofil) + "' AS 'vcardprofil','"
  			+ addSlashes(contactArray[j].Filleul) + "' AS 'Filleul','"
  			+ addSlashes(contactArray[j].Link_CardOnline) + "' AS 'Link_CardOnline'";
  	for (var j =j+1; j < n; j++) {
  	 var domaine = contactArray[j].email.substring(contactArray[j].email.indexOf('@')+1, contactArray[j].email.length);
  		insertQuery = insertQuery + "  UNION SELECT '"
  				+ contactArray[j].id + "','"
  				+ toTimeStamp(contactArray[j].rendez_vous) + "', '"
  				+ contactArray[j].email + "','"
  				+ contactArray[j].date + "', '"
  				+ addSlashes(contactArray[j].comment) + "', '"
  				+ addSlashes(contactArray[j].last_name) + "', '"
  				+ addSlashes(contactArray[j].first_name) + "', '"
  				+ addSlashes(contactArray[j].phone_1) + "', '"
  				+ addSlashes(contactArray[j].phone_2) + "', '"
  				+ addSlashes(contactArray[j].company) + "', '"
  				+ addSlashes(contactArray[j].list) + "', '"
  				+ contactArray[j].status + "','"
  				+ contactArray[j].lastsendemail + "','"
  				+ contactArray[j].LanguageText + "','"
  				+ contactArray[j].firstsendemail + "' ,'"
  				+ contactArray[j].photofilelocation + "', '"
  				+ contactArray[j].alerteemailcreationdate + "', '"
  				+ contactArray[j].modificationdate + "', '"
  				+ addSlashes(contactArray[j].meeting_point) + "', '"
  				+ contactArray[j].latitude_meeting + "', '"
  				+ contactArray[j].longitude_meeting + "', '"
  				+synchro+ "','"
  				+toTimeStampLast(contactArray[j].lastsendemail) + "','"
  				+domaine.trim()+"','"
  				+ addSlashes(contactArray[j].emailaddress2) + "', '"
  	  			+ addSlashes(contactArray[j].actu) + "','"
  	  			+ addSlashes(contactArray[j].addressline1) + "' ,'"
  	  			+ addSlashes(contactArray[j].addressline2) + "' ,'"
  	  			+ addSlashes(contactArray[j].addressline3) + "' ,'"
  	  			+ addSlashes(contactArray[j].postalcode) + "' ,'"
  	  			+ addSlashes(contactArray[j].city) + "' , '"
  	  			+ addSlashes(contactArray[j].workphonenumber) + "','"
  	  			+ addSlashes(contactArray[j].mobilephonenumber2) + "' ,'"
  	  			+ addSlashes(contactArray[j].source) + "' ,'"
  	  			+ addSlashes(contactArray[j].fonction) + "' ,'"
  	  			+ addSlashes(contactArray[j].vcardprofil) + "' ,'"
  	  			+ addSlashes(contactArray[j].Filleul) + "' ,'"
  	  			+ addSlashes(contactArray[j].Link_CardOnline) + "'";
  	}
  	try {

  		$cordovaSQLite.execute(db, insertQuery).then(
  				function(value) {
  					if (contactArray.length > n) {
  						return insertBulkIntoContactsTable(db, ++counter,
  								contactArray, callBack);
  					} else {
  						return callBack();
  					}

  				}, function(reason) {

  			
  					 console.log(reason);
  				}, function(value) {

  				});

  		return 0;
  	} catch (e) {
  		 console.log(e);
  		return 1;
  	}
	  }else{
			 insertIntoContactsTable(db, contactArray, function(){
	  			return callBack();
	  		});
		  }
  };
  /**
   * select info contact by id-contact
   */
  var getContactbyId = function(db,id, callBack){
	  try {

	      var query = 'SELECT * FROM contact where status != "deleted" and id='+id;
	      $cordovaSQLite.execute(db, query).then(function(result) {

	          return callBack(result);
	        }, function(reason) {
	        	   console.log(JSON.stringify(reason));
	          return 1;
	        });

	    } catch (e) {
	       console.log(JSON.stringify(e));
	      return 1;
	    }
  	};
  /**
   * update info contact en local
   */
  var updateContactInfoDateModification = function(db, contact, callBack){

	  try{

		  var updateQuery = " UPDATE contact SET  "+
		  //TODO FIXME est ce que c'est bien un timestamp ?
		  "rendez_vous ='"+toTimeStamp(contact.rendez_vous)+"', " +
		  "first_name = '"+addSlashes(contact.first_name)+"', " +
		  "last_name  = '"+addSlashes(contact.last_name)+"', "+
		  "email = '"+contact.email+"', "+
		  "phone_1 ='"+contact.phone_1+"', "+
		  "phone_2 ='"+contact.phone_2+"', "+
		  "company ='"+addSlashes(contact.company)+"', "+
		  "list ='"+addSlashes(contact.list)+"', "+
		  "LanguageText='"+contact.LanguageText+"', "+
		  "lastsendemail='"+contact.lastsendemail+"', "+
		  "lastsendemailtimeStmp='"+toTimeStampLast(contact.lastsendemail)+"', "+
		  "alerteemailcreationdate='"+contact.alerteemailcreationdate+"', "+
		  "firstsendemail='"+contact.firstsendemail+"', "+
//		  "photofilelocation='"+contact.photofilelocation+"', "+
		  "comment ='"+addSlashes(contact.comment)+"',"+
		  "meeting_point ='"+addSlashes(contact.meeting_point)+"', "+
		  "emailaddress2 ='"+addSlashes(contact.emailaddress2)+"', "+
		  "actu ='"+addSlashes(contact.actu)+"', "+
		  "addressline1 ='"+addSlashes(contact.addressline1)+"', "+
		  "addressline2 ='"+addSlashes(contact.addressline2)+"', "+
		  "addressline3 ='"+addSlashes(contact.addressline3)+"', "+
		  "postalcode ='"+addSlashes(contact.postalcode)+"', "+
		  "city ='"+addSlashes(contact.city)+"', "+
		  "workphonenumber ='"+addSlashes(contact.workphonenumber)+"', "+
		  "mobilephonenumber2 ='"+addSlashes(contact.mobilephonenumber2)+"', "+
		  "source ='"+addSlashes(contact.source)+"', "+
		  "Link_CardOnline ='"+addSlashes(contact.Link_CardOnline)+"', "+
		  "fonction ='"+addSlashes(contact.fonction)+"', "+
		  "vcardprofil ='"+addSlashes(contact.vcardprofil)+"', "+
		  "Filleul ='"+addSlashes(contact.Filleul)+"', "+
		  "modificationdate ='"+contact.modificationdate+"'"+
		  "where id="+contact.id+"";
	  // console.warn(updateQuery);
	  $cordovaSQLite.execute(db, updateQuery).then(function(results){

	    	callBack();


      }, function(reason) {
          // console.log(reason);
          return 1;
      }, function(value) {

       // console.log(value);
       return 1;
      });

      return 0;
    } catch (e) {
      // console.log(e);
      return 1;
    }
  };
  /**
   * update info contact en local
   */
  var updateContactInfo = function(db, contact, callBack){
	  try{

		  var updateQuery = " UPDATE contact SET  "+
		  //TODO FIXME est ce que c'est bien un timestamp ?
		  "rendez_vous ='"+toTimeStamp(contact.rendez_vous)+"', " +
		  "first_name = '"+addSlashes(contact.first_name)+"', " +
		  "last_name  = '"+addSlashes(contact.last_name)+"', "+
		  "email = '"+contact.email+"', "+
		  "phone_1 ='"+contact.phone_1+"', "+
		  "phone_2 ='"+contact.phone_2+"', "+
		  "company ='"+addSlashes(contact.company)+"', "+
		  "list ='"+addSlashes(contact.list)+"', "+
		  "LanguageText='"+contact.LanguageText+"', "+
		  "lastsendemail='"+contact.lastsendemail+"', "+
		  "lastsendemailtimeStmp='"+toTimeStampLast(contact.lastsendemail)+"', "+
		  "alerteemailcreationdate='"+contact.alerteemailcreationdate+"', "+
		  "firstsendemail='"+contact.firstsendemail+"', "+
		 // "photofilelocation='"+contact.photofilelocation+"', "+
		  "comment ='"+addSlashes(contact.comment)+"',"+
		  "meeting_point ='"+addSlashes(contact.meeting_point)+"', "+
		  "emailaddress2 ='"+addSlashes(contact.emailaddress2)+"', "+
		  "actu ='"+addSlashes(contact.actu)+"', "+
		  "addressline1 ='"+addSlashes(contact.addressline1)+"', "+
		  "addressline2 ='"+addSlashes(contact.addressline2)+"', "+
		  "addressline3 ='"+addSlashes(contact.addressline3)+"', "+
		  "postalcode ='"+addSlashes(contact.postalcode)+"', "+
		  "city ='"+addSlashes(contact.city)+"', "+
		  "workphonenumber ='"+addSlashes(contact.workphonenumber)+"', "+
		  "mobilephonenumber2 ='"+addSlashes(contact.mobilephonenumber2)+"', "+
		  "source ='"+addSlashes(contact.source)+"', "+
		  "Link_CardOnline ='"+addSlashes(contact.Link_CardOnline)+"', "+
		  "fonction ='"+addSlashes(contact.fonction)+"', "+
		  "vcardprofil ='"+addSlashes(contact.vcardprofil)+"', "+
		  "Filleul ='"+addSlashes(contact.Filleul)+"', "+
		  "modificationdate ='"+contact.modificationdate+"'"+
		  "where id="+contact.id+"";
		  $cordovaSQLite.execute(db, updateQuery).then(function(results){

			  return callBack();


		  }, function(reason) {
			   console.log(reason);
			  return 1;
		  }, function(value) {

			   console.log(value);
			  return 1;
		  });

		  return 0;
	  } catch (e) {
		   console.log(e);
		  return 1;
	  }
  };


  /**
   * update info contact en local
   */
  var updateContactLocal = function(db, contact, callBack){
	  try{

		  var updateQuery = " UPDATE contact SET  "+
		  //TODO FIXME est ce que c'est bien un timestamp ?
		  "rendez_vous ='"+toTimeStamp(contact.rendez_vous)+"', " +
		  "date = '"+contact.date+"', " +
		  "LanguageText='"+contact.LanguageText+"', "+
		  "lastsendemail='"+contact.lastsendemail+"', "+
		  "lastsendemailtimeStmp='"+toTimeStampLast(contact.lastsendemail)+"', "+
		  "alerteemailcreationdate='"+contact.alerteemailcreationdate+"', "+
		  "firstsendemail='"+contact.firstsendemail+"'"+
		  "where id="+contact.id+"";
		  $cordovaSQLite.execute(db, updateQuery).then(function(results){

			  return callBack();


		  }, function(reason) {
			  console.log(reason);
			  return 1;
		  }, function(value) {

			   console.log(value);
			  return 1;
		  });

		  return 0;
	  } catch (e) {
		  console.log(e);
		  return 1;
	  }
  };

  /**
   *   update contact server
   */
  var updateContactServer = function(i,contactId, contact,callBack,errorCallBack){

     var length =0;
     for(j in contact){
       if(length == i)   key = j;
       length++;
     }
   // the send request parameters
    var request = {
      method: 'POST',
      url: 'https://www.buzcard.com/contacts_mobile.aspx?request=update',
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
        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        return json;
      },
      data: {
        contact_id:contactId,
        field : key,
        value : contact[key]
      },
//      timeout : 5000,
    };
    $http(request).success(function(data, status, headers, config) {
      if(i+1<length){
        i++;
        updateContactServer(i, contactId, contact,callBack,errorCallBack);
      }else{
        callBack(data);
      }
    }).error(function(data, status, headers, config) {
      errorCallBack(status);
    });
  };
  /**
   *  remove contact
   */
  var deleteContactServer = function(id,callBack,errorCallBack){

    // the send request parameters
    var request = {
            method: 'POST',
            url: 'https://www.buzcard.com/contacts_mobile.aspx?request=update',
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
              var x2js = new X2JS();
              var json = x2js.xml_str2json(data);
              return json;
            },
            data: {
              contact_id:id,
              field : "status",
              value : "deleted"
            },
//            timeout : 5000,
    };

    $http(request).success(function(data, status, headers, config) {
        callBack(data);
    }).error(function(data, status, headers, config) {
      errorCallBack(status);
    });
  };


  /**
   * delete contact by id en local
   */
  var deleteContactLocal = function(db, idContact, callBack){
	  try{

		  var deleteQuery = " UPDATE contact SET  "+
		  				"status = 'deleted' " +
		  				"where id="+idContact;
		  // console.log("Query "+deleteQuery);
		  $cordovaSQLite.execute(db, deleteQuery).then(function(results){
		    	 // console.log('success');
	    	  callBack();
	      }, function(reason) {
	          // console.log(reason);
	          return 1;
	      }, function(value) {

	       // console.log(value);
	       return 1;
	      });

	      return 0;
	    } catch (e) {
	      // console.log(e);
	      return 1;
	    }
	  };
  /**
   *  get contacts with limits and range
   */
  var selectContacts = function(db,page,callBack) {
    var selectQuery = "SELECT Distinct(email), * FROM contact WHERE status != 'deleted' and id NOT IN ( SELECT c.id from contact  c where c.email ='' and c.phone_1 ='' and c.phone_2 ='' and c.first_name ='' and c.last_name ='') ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));

    try {

      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        //alert(selectQuery);
        return callBack(value);
      }, function(reason) {
        console.log(reason);
      }, function(value) {
         console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   *  get followers with limits and range
   */
  var selectFollowers = function(db,page,callBack) {

    var selectQuery = "SELECT * FROM contact WHERE status = 'selected' and id NOT IN ( SELECT c.id from contact  c where c.email ='' and c.phone_1 ='' and c.phone_2 ='' and c.first_name ='' and c.last_name ='') ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        // console.warn(selectQuery);
        return callBack(value);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };

  /**
   *  get Non followers with limits and range
   */
  var selectNonFollowers = function(db,page,callBack) {
	   var first_name = ($translate.use() == "fr") ? 'Photo à traiter' : "Picture to be processed" ;
    var selectQuery = "SELECT * FROM contact WHERE status != 'selected' and status !='deleted'  and id NOT IN ( SELECT c.id from contact  c where c.email ='' and c.phone_1 ='' and c.phone_2 ='' and c.first_name IN ('', '"+first_name+"') and c.last_name ='' and c.photofilelocation ='img/photo_top_title.jpg')   ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END  DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));

    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        // console.warn(selectQuery);
        return callBack(value);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   *  get contact sans groupe with limits and range
   */
  var selectSansGroups = function(db,page,callBack) {
    var selectQuery = "SELECT * FROM contact WHERE list = '' and status !='deleted'  ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END  DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        // console.warn(selectQuery);
        return callBack(value);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * get the contacts count with the given status criteria
   */
  var getCountOfContactSansGroups = function(db,callBack) {
    var selectQuery = "SELECT count (*) FROM contact WHERE  status != 'deleted' and list ='' ";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
//        console.warn(result);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   *  get contact sans email with limits and range
   */
  var selectSansEmail = function(db,page,callBack) {
    var selectQuery = "SELECT * FROM contact WHERE email = '' and status !='deleted' ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        // console.warn(selectQuery);
        return callBack(value);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * get the contacts count with the given status criteria
   */
  var getCountOfContactSansEmail = function(db,callBack) {
    var selectQuery = "SELECT count (*) FROM contact WHERE  status != 'deleted' and email =''  ";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
//        console.warn(result);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };

  /**
   *  get contact list doublons probable with limits and range
   */
  var selectDoublonsProbables = function(db,page,callBack) {
    var selectQuery = "SELECT * FROM contact WHERE list = 'Doublons probables' and status !='deleted'  ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        // console.warn(selectQuery);
        return callBack(value);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * get the contacts count with the given status criteria
   */
  var getCountOfContactDoublonsProbables = function(db,callBack) {
    var selectQuery = "SELECT count (*) FROM contact WHERE  status != 'deleted' and list = 'Doublons probables' ";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
//        console.warn(result);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };

  /**
   *  get contact list Buzward with limits and range
   */
  var selectBuzwards = function(db,page,callBack) {
    var selectQuery = "SELECT * FROM contact WHERE list = 'Buzward' and status !='deleted' ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        // console.warn(selectQuery);
        return callBack(value);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * get the contacts count with the given status criteria
   */
  var getCountOfContactBuzwards = function(db,callBack) {
    var selectQuery = "SELECT count (*) FROM contact WHERE  status != 'deleted' and list = 'Buzward' ";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
//        console.warn(result);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };

  /**
   *  get contact list Buzward with limits and range
   */
  var selectFilleuls = function(db,page,callBack) {
    var selectQuery = "SELECT * FROM contact WHERE Filleul = '1' and status !='deleted'  ORDER BY CASE WHEN lastsendemailtimeStmp > 0 THEN lastsendemailtimeStmp ELSE date END DESC LIMIT 20 OFFSET "+parseInt(20*(page-1));
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(value) {
        // console.warn(selectQuery);
        return callBack(value);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * get the contacts count with the given status criteria
   */
  var getCountOfContactFilleuls = function(db,callBack) {
    var selectQuery = "SELECT count (*) FROM contact WHERE  status != 'deleted' and Filleul = '1' ";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
//        console.warn(result);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };

  /**
   * get the contacts count with the given status criteria
   */
  var getCountOfContact = function(db,callBack) {
    var selectQuery = "SELECT count (*) FROM contact WHERE  status = 'selected' OR status = 'not_selected' and id NOT IN ( SELECT c.id from contact  c where c.email ='' and c.phone_1 ='' and c.phone_2 ='' and c.first_name ='' and c.last_name ='') ";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
        //console.warn(result);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * get the all contacts count
   */
  var getCountOfAllContact = function(db,callBack) {
	  var selectQuery = "SELECT count (*) FROM contact WHERE status != 'deleted'";
	  try {
		  $cordovaSQLite.execute(db, selectQuery).then(function(result) {
			  // console.warn(selectQuery);
			  return callBack(result);
		  }, function(reason) {
			  // console.log(reason);
		  }, function(value) {
			  // console.warn(value);
		  });
	  } catch (e) {
		  // TODO: FIXME handle exception
		  return 0;
	  }
  };

  /**
   * get the contacts count with the given status criteria
   */
  var getCountOfFollowers = function(db,callBack) {
    var selectQuery = "SELECT count (*) FROM contact WHERE  status = 'selected' and id NOT IN ( SELECT c.id from contact  c where c.email ='' and c.phone_1 ='' and c.phone_2 =''  and c.first_name ='' and c.last_name ='')";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
        //console.warn(result);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };

  var getCountOfNonFollowers = function(db,callBack) {
	    var selectQuery = "SELECT count (*) FROM contact WHERE  status != 'selected' and status !='deleted'  ";
	    try {
	      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
	      //  console.warn(result);
	        return callBack(result);
	      }, function(reason) {
	        // console.log(reason);
	      }, function(value) {
	        // console.warn(value);
	      });
	    } catch (e) {
	      // TODO: FIXME handle exception
	      return 0;
	    }
	  };

  /**
   * get the Ã  recontacter
   */
  var selectRecontact = function(db,callBack){

    var selectQuery = "SELECT * FROM contact where status != 'deleted'  and id NOT IN ( SELECT c.id from contact  c where c.email ='' and c.phone_1 ='' and c.phone_2 =''  and c.first_name ='' and c.last_name ='') and  rendez_vous >= "+nowInTimeStamp()+" and rendez_vous <= "+weekEnd();
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
        // console.warn(selectQuery);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * select * from groupe
   */
  var selectAllGroup = function(db,callBack){
    var selectQuery = "SELECT * FROM groupe order by name COLLATE NOCASE";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
        // console.warn(selectQuery);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };

  /**
   * select contacts per group
   */
  var selectContactsByGroup = function(db,groupName,callBack) {
    var selectQuery = "SELECT * FROM contact where status != 'deleted' and list = '"+groupName+"' ";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
        // console.warn(selectQuery);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * search function
   */
  var searchContact = function(db,criteria,callBack) {
    var selectQuery = "SELECT * FROM contact WHERE ( email LIKE '%"+criteria+"%' OR last_name LIKE '%"+criteria+"%' OR first_name LIKE '%"+criteria+"%' OR comment LIKE '%"+criteria+"%' ) AND status!='deleted' and id NOT IN ( SELECT c.id from contact  c where c.email ='' and c.phone_1 ='' and c.phone_2 =''  and c.first_name ='' and c.last_name ='') ORDER by lastsendemailtimeStmp DESC LIMIT 50";
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
        // console.warn(selectQuery);
        return callBack(result);
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
  };
  /**
   * downloadPhotoContact
   */
  var downloadPhotoContact = function (id, callBack) {


          var idProfil = $rootScope.idProfil;
          // if (window.cordova){
          var isWindowsPhone = ionic.Platform.isWindowsPhone();

          if (window.cordova) {
              var path = "";
              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                  path = cordova.file.applicationStorageDirectory;
              }else if (isWindowsPhone) {
 	             path = "/";
              } else {
                  path = cordova.file.dataDirectory;
              }
              var PathFile = path;
              var nameFile = id+'_'+new Date().getTime()+'.jpg';
//              cameraService.checkExistFile('dir'+idProfil, id + '.jpg', function (url) {
//                  //file does not exist
//                  if (url == "img/photo_top_title.jpg") {
//
//                      cameraService.createPath('dir'+idProfil, function (PathFile) {
//                          var fileLocation = $rootScope.fileLocaltion;
//                          var url = "http://buzcard.fr/" + fileLocation + "contacts/" + id + "/imgThumbnail.jpg";
              var fileLocation = window.localStorage.getItem('idUser')// $rootScope.fileLocaltion;
              var url = "https://www.buzcard.com/upload/" + fileLocation + "/contacts/" + id + "/imgThumbnail.jpg";

                          cameraService.downloadFile(PathFile, id + '.jpg', url, function (urlImage) {
                        	  if(urlImage == "img/photo_top_title.jpg"){

                        		  callBack(urlImage);
                        	  }else{
                        		  callBack(urlImage + '?' + new Date().getTime());
                        	  }

                          });
                   //   });

//                  } else {
//                      // file exist
//                      callBack(url + '?' + new Date().getTime());
//                  }
//              });
          }else{

      		  callBack(urlImage);

          }
  };

  /**
   * remplir le tableau
   */
  var getAllContactsByGroup = function(db,$scope,n,callBack) {
    var selectNbPages = "SELECT count(*) as nbr FROM contact where status != 'deleted' and list !='' group by list order by list COLLATE NOCASE ";
    // console.error(selectNbPages);
    try {
      $cordovaSQLite.execute(db, selectNbPages).then(function(result) {
        // console.warn(selectNbPages);
        var count = 0;
    	for (var int = 0; int < result.rows.length  ; int++) {
    		$scope.groups[int].nbr = result.rows.item(int).nbr;
    	}
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }
    var selectQuery = "SELECT * FROM (SELECT * FROM contact contact where status != 'deleted' and list !='' ORDER BY  CASE WHEN last_name = '' THEN 2 ELSE 1 END, last_name ASC) order by list COLLATE NOCASE";
    // console.error(JSON.stringify( $scope.groups ));
    try {
      $cordovaSQLite.execute(db, selectQuery).then(function(result) {
        // console.warn(selectQuery);
        var count = 0;

    	for (var int = 0; int < result.rows.length ; int++) {
    		// console.log(count);
    		if( $scope.groups[count] && ($scope.groups[count].name == result.rows.item(int).list) ){
    			if( $scope.groups[count] && $scope.groups[count].items.length < 20 ){
    				var tmp= result.rows.item(int);
    				 if(tmp.photofilelocation  !="img/photo_top_title.jpg" ){
    	                    var fileName = tmp.photofilelocation.substr(tmp.photofilelocation.lastIndexOf('/')+1);
    	                    tmp.photofilelocation = $rootScope.path+fileName;
    				 }
    				$scope.groups[count].items.push(tmp);
    			}
    		}else{
    			if($scope.groups[count]){
        			count++;
        			if( $scope.groups[count] && $scope.groups[count].items.length < 20 ){
        				var tmp= result.rows.item(int);
        				 if(tmp.photofilelocation  !="img/photo_top_title.jpg" ){
     	                    var fileName = tmp.photofilelocation.substr(tmp.photofilelocation.lastIndexOf('/')+1);
     	                    tmp.photofilelocation = $rootScope.path+fileName;
     				 }
        				$scope.groups[count].items.push(tmp);
        			}
    			}else{
    				int = result.rows.length + 1;
    				//return false;
    			}
    		}
    	}
    	callBack();
      }, function(reason) {
        // console.log(reason);
      }, function(value) {
        // console.warn(value);
      });
    } catch (e) {
      // TODO: FIXME handle exception
      return 0;
    }

  };

  /**
   *  edit groupe name in db
   */
  var editGroup = function(db,oldName, newName, callBack){
    var query = "update groupe set name = '"+newName+"' where name='"+oldName+"'";
    $cordovaSQLite.execute(db, query).then(function(result) {
      // console.warn(query);
      return callBack(result);
    }, function(reason) {
      // console.log(reason);
    }, function(value) {
      // console.warn(value);
    });
  };

  /**
   *   update group on server
   */
  var updateGroupServer = function(oldName, newName,callBack,errorCallBack){

   // the send request parameters
    var request = {
      method: 'POST',
      url: 'https://www.buzcard.com/contacts_mobile.aspx?request=rename_list',
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
        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        return json;
      },
      data: {
        old_name:oldName,
        new_name : newName
      },
//      timeout : 5000,
    };

    $http(request).success(function(data, status, headers, config) {
       return callBack(data);
    }).error(function(data, status, headers, config) {
      return errorCallBack(status);
    });
  };

  /**
   *  edit contacts groupe name in db
   */
  var renameContactGroup = function(db,oldName, newName, callBack){
    var query = "update contact set list ='"+newName+"' where id IN (select id from contact where list='"+oldName+"')";
    $cordovaSQLite.execute(db, query).then(function(result) {
      // console.warn(query);
      return callBack(result);
    }, function(reason) {
      // console.log(reason);
    }, function(value) {
      // console.warn(value);
    });
  };


  /**
   *  select contact bu group name
   */
  var selectContactByGroupName = function(db,GroupName, callBack){
    var query = "select * from contact where list='"+GroupName+"' AND status !='deleted' Order by last_name ASC";
    $cordovaSQLite.execute(db, query).then(function(result) {
      // console.warn(query);
      return callBack(result);
    }, function(reason) {
      // console.log(reason);
    }, function(value) {
      // console.warn(value);
    });
  };
  /**
   *  delete group by name
   */
  var deleteGroupByName = function(db,GroupName, callBack){
    var query = "delete from groupe where name='"+GroupName+"'";
    $cordovaSQLite.execute(db, query).then(function(result) {
      // console.warn(query);
      return callBack(result);
    }, function(reason) {
      // console.log(reason);
    }, function(value) {
      // console.warn(value);
    });
  };

  /**
   * get credit de parrainnage
   */
  var getCreditParrainage = function(callBack){
    var credit =0;
    // the send request parameters
    var request = {
      method: 'GET',
      url: 'https://www.buzcard.com/contacts_mobile.aspx?request=contacts',
      transformResponse: function(data) {

    	  var x2js = new X2JS();
          var json = x2js.xml_str2json(data);
          // console.info(json);
          // console.info(json.contacts.credit);
          return json.contacts.credit;
      },

    };
    $http(request).success(function(data, status, headers, config) {
    	return callBack(data);
    });
  };

  /**
   * select contact by email
   */
  var selectContactbyEmail = function(db,email, callBack){
    try {

        var query = "SELECT * FROM contact where email='"+email+"' COLLATE NOCASE";
        // console.warn(query);
        $cordovaSQLite.execute(db, query).then(function(results) {

            return callBack(results);

          }, function(reason) {
            //TODO FIXME
            // console.log("error " + reason);
            return 1;
          });

      } catch (e) {
        // console.log(e);
        return 1;
      };
    };


    /**
     *
     */
    var updateContactIdByEmail = function(db,email,id,callBack){
        var updateQuery = "UPDATE contact SET id = "+id+" where email='"+email+"'";

      // console.warn(updateQuery);
      $cordovaSQLite.execute(db, updateQuery).then(function(result){
        return callBack();
      }, function (err) {
        // console.error(err);
      });

    };
/**
 *
 */
    var updateStatusEmailEmpty= function(db,callBack){
    	var queryUpdate ="update contact set status='cant_be_selected' where email=''";
    	  console.warn(queryUpdate);
          $cordovaSQLite.execute(db, queryUpdate).then(function(result){
            return callBack();
          }, function (err) {
             console.error(err);
          });
    }
    var updateContactIdById= function(db, idtmp, id, callBack){
    	 var updateQuery = "UPDATE contact SET id = "+id+" where id='"+idtmp+"'";

         console.warn(updateQuery);
         $cordovaSQLite.execute(db, updateQuery).then(function(result){
           return callBack();
         }, function (err) {
            console.error(err);
         });
    }

    /**
     *
     */
    var updateContactStatus = function(db,id,follower,callBack){
      var updateQuery ="";
      if (follower=="on") {
        updateQuery = "UPDATE contact SET status = 'selected' where id="+id;
      } else {
        updateQuery = "UPDATE contact SET status = 'cant_be_selected' where id="+id;
      }

       console.warn(updateQuery);
      $cordovaSQLite.execute(db, updateQuery).then(function(result){
        return callBack();
      });

    };
    /**
     *
     */
    var updateContactLastSendAndLanguageRdv = function(db,id,language,rdvTimeStamp, callBack){
    	var updateQuery ="UPDATE contact SET lastsendemail='"+toUsFormat(new Date())+"', lastsendemailtimeStmp='"+new Date()+"',  LanguageText='"+language +"' ,rendez_vous='"+rdvTimeStamp+"' where id ="+id;


    	// console.warn(updateQuery);
    	$cordovaSQLite.execute(db, updateQuery).then(function(result){
    		var query = "SELECT * FROM contact WHERE id ="+id;
    		$cordovaSQLite.execute(db, query).then(function(contact){
    		return callBack(contact);
    	});
    	});

    };

  /**
   * get Contact from server by email
   */
  var getContactFromServerByEmail = function(email,callBack,errorCallBack){
    // the request parameters
    var request = {
      method: 'POST',
      url: 'https://www.buzcard.com/contacts_mobile.aspx?request=contacts',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      transformRequest: function(obj) {
        var str = [];
        for ( var p in obj)
          str.push(encodeURIComponent(p) + "="+ encodeURIComponent(obj[p]));
        return str.join("&");
      },
      transformResponse: function(data) {
        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        return json;
      },
      data: {
        search:email,
        list:"",
        sorting_criterion:"date",
        sorting_order:"desc",
        page:1,
      },
    };
    $http(request).success(function(data, status, headers, config) {
    	if(typeof data.contacts.contact == "undefined")
    		return errorCallBack("NOCONTACT");
    	if(data.contacts.contact instanceof Array){
    		// console.log("array");
    		for (var int = 0; int < data.contacts.contact.length; int++) {
				if(data.contacts.contact[int].email==email)
					 return callBack(data.contacts.contact[int]);
			}
    	}

    	if (data.contacts.contact instanceof Object){
    		// console.log("object");
    		return callBack(data.contacts.contact);
    	}


    }).error(function(data, status, headers, config) {
      return errorCallBack(status);
    });
  };
  /**
   * return the weekend in timeStamp format
   */
  function weekEnd() {
    var today = new Date().getDate();
    var month = new Date().getMonth()+1;
    var year = new Date().getFullYear();
    var now = parseInt((new Date(month+"/"+today+"/"+year).getTime()-Date.UTC(1970,0,1))/1000);
    var diff = 6 - new Date().getDay();
    return now + 86400 *diff;
  };

  /**
   * return the now timeStamp
   */
  function nowInTimeStamp() {
    var today = new Date().getDate();
    var month = new Date().getMonth()+1;
    var year = new Date().getFullYear();
    var now = parseInt((new Date(month+"/"+today+"/"+year).getTime()-Date.UTC(1970,0,1))/1000);
    return now;
  };


	/**
	 * convert date to timeStamp
	 */
	function toTimeStamp(date) {
		try {
			var x="";
			if(date!=""){
				x= new Date(date).getTime()/1000;
			}

			// console.log('try'+x +'   '+date);
			return x;
		} catch (e) {
			// console.log(e);
			var x= new Date().getTime()/1000;
			// console.log('catch '+x);
			return x;
		}
	};

	function toTimeStampLast(date){
		try {

			var x=0;
			if(date!=""){
				x= new Date(date).getTime()/1000;
			}

			// console.log('try'+x +'   '+date);
			return x;
		} catch (e) {
			// console.log(e);
			var x=0;
			if(date!=""){
			var x= new Date().getTime()/1000;
			// console.log('catch '+x);
			}
			return x;
		}
	}

  var uploadPhotoContact = function (path, idContact,RID, sendvcard, callBack, errorCallBack) {
      var isWindowsPhone = ionic.Platform.isWindowsPhone();
            console.warn(path)
          var fileName = path.substr(path.lastIndexOf('/') + 1);
          var pathFile = path.substr(0, path.lastIndexOf('/') + 1);
          $cordovaFile.readAsArrayBuffer(pathFile, fileName).then(function (success) {
              // success

              var fd = new FormData();
              var image = new Uint8Array(success);
              fd.append('photo', new Blob([image], {
                  type: 'image/jpeg'
              }), fileName);
              console.info("******* upload contact photo ")
              console.warn(idContact);
            //  console.warn(RID);
            //  console.warn("https://www.buzcard.com/contacts_mobile.aspx?request=update_photo&type=portrait&contact_id="+idContact+"&RID="+RID);
              console.info("******* upload contact photo ")
              $http.post("https://www.buzcard.com/contacts_mobile.aspx?request=update_photo&type=portrait&contact_id="+idContact+"&RID="+RID+"&sendvcard="+sendvcard, fd, {
                  transformRequest: angular.identity,
                  headers: {
                      'Content-Type': undefined
                  },
                  transformResponse: function(data) {
                      var x2js = new X2JS();
                      var json = x2js.xml_str2json(data);
                      return json;
                  },
              })
                  .success(function (data, status, headers, config) {
					  if (data.answer){
                          if (data.answer.status == 0){
                              callBack();
                          }
                      }else{
                          errorCallBack();
					  }

                  })
                  .error(function (err) {
                     //  console.log('erreur '+JSON.stringify(err));
                      errorCallBack();
                  });


          }, function (error) {
              // error
        	 // console.log('erreur '+JSON.stringify(error));
              errorCallBack();
          });

	};

  /**
 * insert or update contact
 */
var insertOrUpdateContacts = function(db, i, total, contacts, callBack) {
  LoadingService.loading($translate.instant('LoadingSychrocontact')   +" "+ parseInt((i / total) * 100) + "%" );
    //appel recurssive
    if (i < parseInt(total)) {

        //ca ou il y a plusieurs contacts
        if (contacts instanceof Array) {
            getContactbyId(db, contacts[i].id, function(result) {
              // cas ou le contact déja exist
                if (result.rows.length > 0) {
                    var contactFromDB = result.rows.item(0);
                    //update
                    updateContactInfoDateModification(db, contacts[i], function() {

                        if (contacts[i].email == '') {
                            updateContactByField(db, "status", "cant_be_selected", contacts[i].id, function() {

                                        insertOrUpdateContacts(db, i + 1, total, contacts, callBack);


                            });
                        } else {
                            updateContactByField(db, "status", "selected", contacts[i].id, function() {

                                        insertOrUpdateContacts(db, i + 1, total, contacts, callBack);

                            });
                        }


                    });
                  // cas d'un nouveau contact
                } else {
                    insertIntoContactsTable(db, contacts[i], function() {

                        if (contacts[i].email == '') {
                            updateContactByField(db, "status", "cant_be_selected", contacts[i].id, function() {

                                        insertOrUpdateContacts(db, i + 1, total, contacts, callBack);

                            });
                        } else {
                            updateContactByField(db, "status", "selected", contacts[i].id, function() {

                                        insertOrUpdateContacts(db, i + 1, total, contacts, callBack);

                            });
                        }

                    });
                }
            });

        //ca ou il y a un seul contact
        } else {
            getContactbyId(db, contacts.id, function(result) {
                // contact existe déja
                if (result.rows.length > 0) {
                    var contactFromDB = result.rows.item(0);
                    //update
                    updateContactInfoDateModification(db, contacts, function() {
                        if (contacts.email == '') {
                            updateContactByField(db, "status", "cant_be_selected", contacts.id, function() {

                                        insertOrUpdateContacts(db, i + 1, total, contacts, callBack);

                            });
                        } else {
                            updateContactByField(db, "status", "selected", contacts.id, function() {

                                        insertOrUpdateContacts(db, i + 1, total, contacts, callBack);

                            });
                        }

                    });
                  // cas d'un nouveau contact (existe pas)
                } else {
                    //insert
                    insertIntoContactsTable(db, contacts, function() {
                        if (contacts.email == '') {
                            updateContactByField(db, "status", "cant_be_selected", contacts.id, function() {

                                        insertOrUpdateContacts(db, i + 1, total, contacts, callBack);

                            });
                        } else {
                            updateContactByField(db, "status", "selected", contacts.id, function() {

                                            insertOrUpdateContacts(db, i + 1, total, contacts, callBack);


                            });
                        }
                    });
                }
            });
        }

        //appel recurssive
    } else {
        return callBack();
    }
};
var UpdateRepertoire = function(db, i, total, contacts, callBack) {
    //appel recurssive
    if (i < parseInt(total)) {

        //ca ou il y a plusieurs contacts
        if (contacts instanceof Array) {
            getContactbyId(db, contacts[i].id, function(result) {
              // cas ou le contact déja exist
                if (result.rows.length > 0) {
                    var contactFromDB = result.rows.item(0);
                    //update
                   // updateContactInfoDateModification(db, contacts[i], function() {
                      //updateRappel
          if(contacts[i].rendez_vous != '')
                  createAgendaRDV(db, contacts[i], toTimeStamp(contacts[i].rendez_vous), function(result) {
                  });
                  //endupdateRappel
                                if (contacts[i].list.indexOf('Import') != -1) {
                                	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                                } else {
                                    saveOrUpdateContactTel(db, contacts[i], {
                                        email: contactFromDB.email,
                                        phone_1: contactFromDB.phone_1,
                                        phone_2:contactFromDB.phone_2
                                    }, function() {
                                    	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                                    },function(){
                                    	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                                    });
                                }
                }else{
                  if(contacts[i].rendez_vous != '')
                    createAgendaRDV(db, contacts[i], toTimeStamp(contacts[i].rendez_vous), function(result) {
                    });
                	 if (contacts[i].list.indexOf('Import') != -1) {
                     	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                     } else {
                         saveOrUpdateContactTel(db, contacts[i], {
                             email: contacts[i].email,
                             phone_1: contacts[i].phone_1,
                             phone_2:contacts[i].phone_2
                         }, function() {
                         	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                         },function(){
                         	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                         });
                     }
                }
            });

        //ca ou il y a un seul contact
        } else {
            getContactbyId(db, contacts.id, function(result) {
                // contact existe déja
                if (result.rows.length > 0) {
                    var contactFromDB = result.rows.item(0);
                    //update
                  if(contacts.rendez_vous != '')
                    createAgendaRDV(db, contacts, toTimeStamp(contacts.rendez_vous), function(result) {
                    });
                                if (contacts.list.indexOf('Import') != -1) {
                                	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                                } else {
                                    saveOrUpdateContactTel(db, contacts, {
                                        email: contactFromDB.email,
                                        phone_1: contactFromDB.phone_1,
                                        phone_2:contactFromDB.phone_2
                                    }, function() {
                                    	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                                    },function(){
                                    	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                                    });
                                }
                }else{
                  if(contacts.rendez_vous != '')
                    createAgendaRDV(db, contacts, toTimeStamp(contacts.rendez_vous), function(result) {
                    });
                	 if (contacts.list.indexOf('Import') != -1) {
                     	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                     } else {
                         saveOrUpdateContactTel(db, contacts, {
                             email: contacts.email,
                             phone_1: contacts.phone_1,
                             phone_2:contacts.phone_2
                         }, function() {
                         	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                         },function(){
                         	UpdateRepertoire(db, i + 1, total, contacts, callBack);
                         });
                     }
                }

            });
        }

        //appel recurssive
    } else {
        return callBack();
    }

}
	/**
	   * update info contact en local
	   */
	  var updateContactInfoNew = function(db, contact, callBack){

		  try{

		  var updateQuery = " UPDATE contact SET  "+
		          //TODO FIXME est ce que c'est bien un timestamp ?
		  				"rendez_vous ='"+toTimeStamp(contact.rendez_vous)+"'," +
		  				"lastsendemail ='"+contact.lastsendemail+"',"+
		  				"firstsendemail ='"+contact.firstsendemail+"',"+
		  				"status ='selected',"+
		  				"lastsendemailtimeStmp='"+toTimeStampLast(contact.lastsendemail)+"', "+
		  				"LanguageText ='"+contact.LanguageText+"' "+
		  				"where id="+contact.id+"";
		  $cordovaSQLite.execute(db, updateQuery).then(function(results){

		    	callBack();

	      }, function(reason) {
	           console.log(reason);
	          return 1;
	      }, function(value) {

	        console.log(value);
	       return 1;
	      });

	      return 0;
	    } catch (e) {
	       console.log(e);
	      return 1;
	    }
	  };


	    /**
	     * get all id contacts from table contacts
	     */
	   var getAllContactsId = function(db, callBack){
		   try {

			      var query = 'SELECT id FROM contact ';
			      // console.warn(query);
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
	   };

	   /**
	    * get Ids of contacts who has images
	    */
	   var getAllContactsIdWhoHasPhoto = function(db, callBack){
		   try {

			      var query = 'SELECT id FROM contact where photofilelocation !="" ';
			      // console.warn(query);
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
	   };

	   /**
	    * update contact photo
	    */
	   var updateContactPhoto = function(db, contactId,photoFileLocation, callBack){
		   try {

			   var query = 'update contact set photofilelocation ="'+photoFileLocation+'" where id='+contactId;
			   // console.warn(query);
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
	   };

	   /**
	    * set default image for contacts who havn't image
	    */
	   var setDefaultImage = function(db, callBack){
		   try {

			   var query = 'update contact set photofilelocation ="img/photo_top_title.jpg" where id IN(select id from contact where photofilelocation="")';
			   // console.warn(query);
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
	   };

	   var downloadSinglePhotoContact = function(id, i, callBack){

		   var idProfil = $rootScope.idProfil;
	          var isWindowsPhone = ionic.Platform.isWindowsPhone();

	          if (window.cordova) {
	              var path = "";
	              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
	                  path = cordova.file.applicationStorageDirectory;
	              }else if (isWindowsPhone) {
	             path = "/";
	              } else {
	                  path = cordova.file.dataDirectory;
	              }
	           var   PathFile = path;
	           var NameFile = id +'_'+new Date().getTime()+ '.jpg'
//	              cameraService.checkExistFile('dir'+idProfil, id + '.jpg', function (url) {
//	                  //file does not exist
//	            	// console.log('checkExistFile.... '+url);
//	                  if (url == "img/photo_top_title.jpg") {
//	                	  // console.log("flag 00 if......");
//	                      cameraService.createPath('dir'+idProfil, function (PathFile) {
//	                          var fileLocation = $rootScope.fileLocaltion;
//	                          var url = "http://buzcard.fr/" + fileLocation + "contacts/" + id + "/imgThumbnail.jpg";
//
	           var fileLocation = window.localStorage.getItem('idUser')// $rootScope.fileLocaltion;
               var url = "https://www.buzcard.com/upload/" + fileLocation + "/contacts/" + id + "/imgThumbnail.jpg";
	                          // console.log("PathFile........... "+PathFile);
	                          cameraService.downloadFile(PathFile,NameFile , url, function (urlImage) {
	                        	  callBack(urlImage ,i);
//	                        	  if(urlImage == "img/photo_top_title.jpg"){
//	                        		  // console.log("flag 11......");
//	                        		  callBack(urlImage,i);
//	                        	  }else{
//	                        		  // console.log("flag 22......");
//	                        		  if(isWindowsPhone){
//	                        			  callBack(urlImage,i);
//	                        		  }else{
//	                        			  callBack(urlImage ,i);
//	                        		  }
//
//	                        	  }

	                          });
//	                      });
//
//	                  } else {
//	                	  // console.log("flag x...... "+url);
//	                      // file exist
//	                	  if(isWindowsPhone){
//                			  callBack(url,i);
//                		  }else{
//                			  callBack(url+ '?' + new Date().getTime() ,i);
//                		  }
//	                  }
//	              });
	          }else{

	      		  return callBack("undeff",i);

	          }
	   };

	   /**
	    * download images for contacts who have photo
	    * we use it just at the syncho controller
	    * after the login process
	    */
	   var downloadAllPhotoContacts = function(db, callBack){
		   var contactArray =[];

		   $rootScope.pourcentage = "0%";
		   getAllContactsIdWhoHasPhoto(db, function(result){
			   setDefaultImage(db, function(){
			   for(var int=0; int < result.rows.length; int++){
				   contactArray[int] = result.rows.item(int).id;
			   }
			   recurssiveImg(db,0, contactArray,function(){

				   return callBack();
			   });
		    });
		   });//
	   };
	   /**
	    * download images for contacts who have photo
	    * we use it just at the syncho process in menu contoller
	    * when we click on synchronisation btn on Menu
	    */
	   var downloadPhotoContactsAtSynchro = function(db,contacts, callBack){
            var filtredContacts = [];
           // console.log(contacts);
            for (var i = 0; i < contacts.length; i++) {
              console.warn(contacts[i].photofilelocation)
              console.warn(typeof(contacts[i].photofilelocation))
              if (contacts[i].photofilelocation != "") {
                filtredContacts.push(contacts[i]) ;
              }else{
            	  updateContactByField(db, "photofilelocation", "img/photo_top_title.jpg", contacts[i].id, function() {

            	  });

              }
            }
  		   if (contacts instanceof Array){
  			   // console.info("contacts instanceof Array");
  			   // console.error(JSON.stringify(contacts));
  			   recurssiveImgForSynchro(db,0, filtredContacts,function(){

  				   return callBack();
  			   });
           }
           else if (contacts instanceof Object){
        	   // console.info("contacts instanceof Object");
        	   // console.error(JSON.stringify(contacts));
        	   downloadAndOverride(contacts.id,function(urlImg){
					updateContactPhoto(db, contacts.id, urlImg,function(){
						contacts.photofilelocation = urlImg;
						if(contacts.list.indexOf('Import') != -1){
							 return callBack();
						}else{
							saveOrUpdateContactTel(db, contacts,{email : contacts.email, phone_1 : contacts.phone_1, phone_2 :contacts.phone_2}, function(){
								 return callBack();
								},function(){
									return callBack();
								});
						}

					});
			   });
           }

	   };

	   /**
	    * recurssive call to download image for the given contact array
	    * @param contactArray : array containing contacts ids
	    *
	    */
	   function recurssiveImg(db,counter, contactArray,callBack){
		   if(contactArray.length > 0)
		   $rootScope.pourcentage =  parseInt(100 *(counter/contactArray.length)) + "%";
		   else
			   return callBack();
		   if( counter < contactArray.length){
			   downloadSinglePhotoContact(contactArray[counter],counter,function(urlImg,i){
					updateContactPhoto(db, contactArray[counter], urlImg,function(){

						recurssiveImg(db,++counter,contactArray,callBack);

					});
			   });
		   }else{
			   return callBack();
		   }
	   };

	   /**
	    * recurssive call to download image for the given contact array
	    * @param contactArray : array containing contacts
	    * this method is used when we click on synchro btn
	    */
	   function recurssiveImgForSynchro(db,counter, contactArray,callBack){
       var percentage = isNaN( parseInt((counter / contactArray.length) )) ?  0 : parseInt((counter / contactArray.length)) ;
       LoadingService.loading($translate.instant('LoadingSychrophoto')  +" "+ percentage + "%");
		   if( counter < contactArray.length){
			   downloadAndOverride(contactArray[counter].id,function(urlImg,i){
				   updateContactPhoto(db, contactArray[counter].id, urlImg,function(){
					//   alert("ok");
					   contactArray[counter].photofilelocation = urlImg;
					   if(contactArray[counter].list.indexOf('Import') != -1){
						   recurssiveImgForSynchro(db,++counter,contactArray,callBack);
					   }else{
						   saveOrUpdateContactTel(db, contactArray[counter],{email: contactArray[counter].email ,phone_1: contactArray[counter].phone_1, phone_2: contactArray[counter].phone_2 }, function(){
								 //  alert("synchron");
							   recurssiveImgForSynchro(db,++counter,contactArray,callBack);
							   },function(){
								   recurssiveImgForSynchro(db,++counter,contactArray,callBack);
							   });
					   }

				   });
			   });
		   }else{
			   return callBack();
		   }
	   };


	    /**
	     * convert us time format to french format
	     */
	    var USToFrenchFromat= function(dateUS){
	    	try {

	    		var array1 = dateUS.split("/");
		        var array2 = array1[2].split(" ");
		        var array3 = array2[1].split(":");
		        if (array1[1].length ==1 )
		        	array1[1] = "0"+array1[1];
		        if (array1[0].length ==1 )
		        	array1[0] = "0"+array1[0];
		        if (array3[0].length ==1 )
		        	array3[0] = "0"+array3[0];
		        return array1[1] +"/"+ array1[0] +"/"+array2[0]+" Ã  "+array3[0]+":"+array3[1];

			} catch (e) {
				return dateUS;
			}

	    }

	    /**
	     * timeStamp : premier date en timestamp en seconde
	     * dateUS : date in us format
	     */
	    var compareDate= function(timeStamp, dateUS){
	    	try {
	    	    if (dateUS == "" || dateUS == null) {
	    	        return 1;
	    	    } else {
	    	        var dx = new Date(timeStamp * 1000);
	    	        var d = new Date(dx.getFullYear(), dx.getMonth(), dx.getDate(), dx.getHours());
	    	        var array1 = dateUS.split("/");
	    	        // console.log(d);
	    	        var array2 = array1[2].split(" ");
	    	        var array3 = array2[1].split(":");
	    	        var dd = new Date(array2[0], array1[0] - 1, array1[1], array3[0]);
	    	        dd.setHours((dd.getHours() + 1));
	    	        // console.warn(dd);

	    	        if (d.getTime() == dd.getTime()) {
	    	            // console.log("the same");
	    	            return 0;
	    	        } else if (d.getTime() < dd.getTime()) {
	    	            // console.log("the second");
	    	            return 2;
	    	        } else {
	    	            // console.log("the first");
	    	            return 1;
	    	        }

	    	    }

	    	} catch (e) {
	    	    // console.log(e);
	    	    return 1;
	    	}
	    };

	    /**
	     * download and override contact image
	     */
	    var downloadAndOverride = function(id, callBack){
	    	var idProfil = $rootScope.idProfil;

	          var isWindowsPhone = ionic.Platform.isWindowsPhone();

	        	//c'est pas windows
	          if (window.cordova) {
	              var path = "";
	              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
	                  path = cordova.file.applicationStorageDirectory;
	              } else if (isWindowsPhone) {
	            	  path = "/";
	              }else {
	                  path = cordova.file.dataDirectory;
	              }
	              var PathFile = path;
	              var NameFile = id+'_'+new Date().getTime()+'.jpg';
	              //crÃ©er la repertoire et le fichier
	            //  cameraService.createPath('dir'+idProfil, function (PathFile) {
                      var fileLocation = window.localStorage.getItem('idUser')// $rootScope.fileLocaltion;
                      var url = "https://www.buzcard.com/upload/" + fileLocation + "/contacts/" + id + "/imgThumbnail.jpg";
                      // console.log("$$$ fileLocation : "+fileLocation);
                      // console.log("&$&$ url : "+url);
                      //telecharger le fichier
                      cameraService.downloadFile(PathFile, NameFile, url, function (urlImage) {

                    		  return callBack(urlImage);


                      });
              //    });
	          }else{

	      		  return callBack("undeff");
	          }

	    };

	    /**
	     * insert many groups in one request
	     */
	    var insertBulkGroupe = function(db,groupeArray,callBack){

	        // console.log(groupeArray);
	        var insertQuery = "INSERT INTO groupe SELECT '1' AS 'id', '"+ addSlashes(groupeArray[0]) + "' AS 'name'";


	        for (counter=1 ;counter< groupeArray.length; counter++) {
	          insertQuery = insertQuery +"  UNION SELECT '" + parseInt(counter+1) + "','"+ addSlashes(groupeArray[counter]) + "'";
	        }

	        try {

				   // console.warn(insertQuery);
				   $cordovaSQLite.execute(db, insertQuery).then(function(result) {

					   return callBack();
				   }, function(reason) {
					   //TODO FIXME
					   // console.log( reason);
					   return 1;
				   });

			   } catch (e) {
				   // console.log(e);
				   return 1;
			   }

	    };

	    /**
	     *
	     */
	    var updateContactModificationDate = function(db,id,modificationDate, callBack){
	        var updateQuery = "UPDATE contact SET modificationdate = '"+modificationDate+"' where id="+id;

	      // console.warn(updateQuery);
	      $cordovaSQLite.execute(db, updateQuery).then(function(result){
	        return callBack();
	      }, function (err) {
	        // console.error(err);
	      });

	    };


	      var getContactHaventAddress= function(db,callBack){
	    	  var notfound = $translate.instant('No-place');
	    	  var query = 'SELECT * FROM contact where meeting_point IN (" ","undefined","'+notfound+'") and latitude_meeting NOT IN (0,"") and longitude_meeting NOT IN (0,"") ';

	          $cordovaSQLite.execute(db, query).then(function(result) {

	              return callBack(result);
	            }, function(reason) {
	              //TODO FIXME
	              // console.log("error " + reason);
	              return 1;
	            });
	      };
	     /**
	      * update adress in contact where params idcontact
	      */
	      var updateAddress = function(db,contactId, address,callBack){
	    	  var updateQuery = " UPDATE contact SET  "+
	  				"meeting_point ='"+address+"' " +
	  				"where id="+contactId+"";
	    	  // console.warn(updateQuery);

	          $cordovaSQLite.execute(db, updateQuery).then(function(result) {

	              return callBack();
	            }, function(reason) {
	              //TODO FIXME
	              // console.log("error " + reason);
	              return callBack(1);
	            });
	      }
	    /**
	     * @param localContactDate : last synchro date
	     * @param contactLastModified : contact last modified date
	     *
	     * @return true if contactLastModified < localContactDate
	     *		   false if contactLastModified > localContactDate
	     */
	    var isUpToDate = function(localContactDate, contactLastModified){
	    	if(localContactDate=="" || contactLastModified==""){
	    		return true;
	    	}else{
	    		localDate = new Date(frenchToUsFormat(localContactDate)).getTime();
		    	contactDate = new Date(frenchToUsFormat(contactLastModified)).getTime();
		    	if(localDate >= contactDate  ){
		    		// console.log("localDate >= contactDate "+localDate+" || "+ contactDate);
		    		return true;
		    	}else{
		    		// console.log("localDate < contactDate "+localDate+" || "+ contactDate);
		    		return false;
		    	}
	    	}

	    };

	    /**
	     * update le status synchro dans la table contact
	     */
	   var UpdateSynchroStatusContact = function(db, id, synchro,callBack){
		   var updateQuery = "UPDATE contact SET synchro = '"+synchro+"' where id="+id;

		      // console.warn(updateQuery);
		      $cordovaSQLite.execute(db, updateQuery).then(function(result){
		        return callBack();
		      }, function (err) {
		        // console.error(err);
		      });

	   };
	   /**
	    * fonction recursive créer les evenement dans le calendrier
	   */
	   var createEventCalender = function(db,contacts, i, callBack){

		   var contactTemp = contacts.rows.item(i);
		   var comment = "";
		   var libele_nom = "";
		   //"Rappel Buzcard: recontacter "+contactTemp.email+", rencontré le "+$filter('toFrFormat')(contactTemp.alerteemailcreationdate) +"  "+ $filter('toTiret')(contactTemp.meeting_point) +". "

		   var comment = "";
		   var libele_nom =  ""; //"Rappel Buzcard: recontacter "+contact.email+", rencontré le "+$filter('toFrFormat')(contact.alerteemailcreationdate) +"  "+ $filter('toTiret')(contact.meeting_point) +". "

  		if(contactTemp.last_name != '' || contactTemp.first_name !='' || contactTemp.company !='' || contactTemp.phone_1 !='' || contactTemp.phone_2 !='' || contactTemp.email !=''){
  			comment = contactTemp.first_name + " " + contactTemp.last_name+" - "+contactTemp.company+" - "+contactTemp.email+" - "+contactTemp.phone_1+" Recontacté(e) le "+$filter('toFrFormat1')(contactTemp.alerteemailcreationdate) +" "+ $filter('toPlace')(contactTemp.meeting_point) +". ";

  			 libele_nom = "Rappel Buzcard: recontacter "+$filter('capitalize')(contactTemp.first_name) + " " + $filter('capitalize')(contactTemp.last_name)+", rencontré(e) le "+$filter('toFrFormat1')(contactTemp.alerteemailcreationdate) +".";
  			 //"+ $filter('toPlace')(contact.meeting_point) +". "

  		}else{
  			//comment = contact.first_name + " " + contact.last_name+" "+contact.company+"  "+contact.email+" "+contact.phone_1;
  			 libele_nom = "Rappel Buzcard: recontacter "+contactTemp.email+", rencontré(e) le "+$filter('toFrFormat1')(contactTemp.alerteemailcreationdate) +".";
  			 		//  "+ $filter('toPlace')(contact.meeting_point) +". "

  		}


      		//if(contactTemp.meeting_point != "" )
      				//libele_location = contactTemp.meeting_point;
      		//else
      			libele_location = "";



      	//verifie l'existance de l'evenement dans le calendrier
      	$cordovaCalendar.findEvent({
      	    title: libele_nom,
      	    location: libele_location,
      	    notes: comment,
      	    startDate: new Date(new Date(contactTemp.rendez_vous * 1000).getFullYear(), new Date(contactTemp.rendez_vous * 1000).getMonth(), new Date(contactTemp.rendez_vous * 1000).getDate(), 8, 30, 0, 0, 0),
      	    endDate: new Date(new Date(contactTemp.rendez_vous * 1000).getFullYear(), new Date(contactTemp.rendez_vous * 1000).getMonth(), new Date(contactTemp.rendez_vous * 1000).getDate(), 9, 30, 0, 0, 0)
      	  }).then(function (result) {

      	    if(result ==""){ // si l'event n'existe pas

		      	    $cordovaCalendar.createEvent({
		      	    title: libele_nom,
		      	    location: libele_location,
		      	    notes: comment,
		      	    startDate:new Date(new Date(contactTemp.rendez_vous * 1000).getFullYear(), new Date(contactTemp.rendez_vous * 1000).getMonth(), new Date(contactTemp.rendez_vous * 1000).getDate(), 8, 30, 0, 0, 0),
		      	    endDate: new Date(new Date(contactTemp.rendez_vous * 1000).getFullYear(), new Date(contactTemp.rendez_vous * 1000).getMonth(), new Date(contactTemp.rendez_vous * 1000).getDate(), 9, 30, 0, 0, 0)
		      	  }).then(function (result) {
		      		  		// success
		      		  	UpdateSynchroStatusContact(db, contactTemp.id, 'true', function(){

		      		  		if(contacts.rows.length -1>i){
		      		  			i++;
		      		  			createEventCalender(db,contacts, i, callBack);
		      		  		}else{
		      		  			callBack();
		      		  		}
		      		  	});

		      	  		}, function (err) {
		      	  			// error
		      	  			// console.log('erreur'+JSON.stringify(err));
		      	  		});

      	    }else{
      	    	UpdateSynchroStatusContact(db, contactTemp.id, 'true', function(){
      	    		if(contacts.rows.length -1>i){
      	    			i++;
      	    			createEventCalender(db,contacts, i, callBack);
      	    		}else{
      	    			callBack();
      	    		}
      	    	});
      	  }
      	  }, function (err) {
      		  // console.log('erreur'+JSON.stringify(err));
      	  });


	};
	/**
	 * creation de rdv du contact et suppression de ancien rdv
	 */

	var createAgendaRDV = function(db, contact, oldRDV , callBack){

		cordova.plugins.diagnostic.requestCalendarAuthorization(function(status){
			   if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
			       console.log(contact);

        var comment = "";
		   var libele_nom =  ""; //"Rappel Buzcard: recontacter "+contact.email+", rencontré le "+$filter('toFrFormat')(contact.alerteemailcreationdate) +"  "+ $filter('toTiret')(contact.meeting_point) +". "

  		if(contact.last_name != '' || contact.first_name !='' || contact.company !='' || contact.phone_1 !='' || contact.phone_2 !='' || contact.email !=''){
  			comment = contact.first_name + " " + contact.last_name+" - "+contact.company+" - "+contact.email+" - "+contact.phone_1+"Rencontré(e) le "+$filter('toFrFormat1')(contact.alerteemailcreationdate) +" "+ $filter('toPlace')(contact.meeting_point) +". ";

  			 libele_nom = "Rappel Buzcard: recontacter "+$filter('capitalize')(contact.first_name) + " " + $filter('capitalize')(contact.last_name)+", rencontré(e) le "+$filter('toFrFormat1')(contact.alerteemailcreationdate) +".";
  			 //"+ $filter('toPlace')(contact.meeting_point) +". "

  		}else{
  			//comment = contact.first_name + " " + contact.last_name+" "+contact.company+"  "+contact.email+" "+contact.phone_1;
  			 libele_nom = "Rappel Buzcard: recontacter "+contact.email+", rencontré(e) le "+$filter('toFrFormat1')(contact.alerteemailcreationdate) +".";
  			 		//  "+ $filter('toPlace')(contact.meeting_point) +". "

  		}

  		//if(contact.meeting_point == "" || contact.meeting_point == $translate.instant('ContactEdit.SearchGPS') )
  			libele_location = "";
  		//else  libele_location = contact.meeting_point;

  		contact.rendez_vous = toTimeStamp(contact.rendez_vous);

  		//cas de rdv old et new rdv vide
      	if(oldRDV =="" && contact.rendez_vous ==''){
      		return callBack();
      		// cas de oldrdv = '' et new RDV !=''
      	}else if(oldRDV =="" && contact.rendez_vous !=''){

     		$cordovaCalendar.findEvent({
			    title: libele_nom,
			    location: libele_location,
			    notes: comment,
			    startDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
			    endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
			}).then(function (result) {
				// si l'event n'existe pas
			if(result ==""){
				//creation de l'evenement
	      	    $cordovaCalendar.createEvent({
	      	    title: libele_nom,
	      	    location: libele_location,
	      	    notes: comment,
	      	    startDate:new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
	      	    endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
	      	  }).then(function (resultx) {
	      		  		// success
	      		 // 	UpdateSynchroStatusContact(db, contact.id, 'true', function(){
	      		  	return callBack();

	      		  //	});

	      	  		}, function (err) {

	      	  			// error
	      	  			// console.log('erreur creation event'+JSON.stringify(err));
	      	  		});

			}else{

				return callBack();
				}
			}, function (err) {

      	  			// error
      	  			// console.log('erreur creation event'+JSON.stringify(err));
      	  		});




      	}else if(contact.rendez_vous =="" && oldRDV !=""){

      		if(oldRDV =="" || oldRDV  =="NaN") oldRDV = new Date().getTime();
    		$cordovaCalendar.findEvent({
    	    title: libele_nom,
    	    location: libele_location,
    	    notes: comment,
    	    startDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 12, 30, 0, 0, 0),
    	    endDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 13, 30, 0, 0, 0)
    	  }).then(function (results) {
    		  	// si l'ancien evenement n'existe pas
    		  if(results ==""){

    			  return callBack();
    		  }else{
    			  $cordovaCalendar.deleteEvent({
      	      	    newTitle: results[0].title,
      	    		location: results[0].location,
      	    		notes: results[0].message,
      	    		 startDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 12, 30, 0, 0, 0),
      	     	    endDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 13, 30, 0, 0, 0)

      	      	    }).then(function (res) {
      	      	    	console.log('res    '+JSON.stringify(res));
      	      	    return callBack();
      	      	    	},function(err){

      	      	    	});
      	      }
    	},function(err){

    		  });
      	}else{
      		$cordovaCalendar.findEvent({
        	    title: libele_nom,
        	    location: libele_location,
        	    notes: comment,
        	    startDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 12, 30, 0, 0, 0),
        	    endDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 13, 30, 0, 0, 0)
        	  }).then(function (results) {
        		  	// si l'ancien evenement n'existe pas
        		  if(results ==""){
        			  $cordovaCalendar.createEvent({
      	    			title: libele_nom,
      	    			location: libele_location,
      	    			notes: comment,
      	    			startDate:new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
      	    			endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
      	    			}).then(function (result) {
      	    				   return callBack();


      	    			}, function (err) {

      	    			});

        		  }else{
    				  //ne sont pas les memes, suppression de l'anciene et creation de nouveau

    				$cordovaCalendar.deleteEvent({
    	      	    title: results[0].title,
    	    		location: results[0].location,
    	    		notes: results[0].message,
    	    		 startDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 12, 30, 0, 0, 0),
    	     	    endDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 13, 30, 0, 0, 0)

    	      	    }).then(function (res) {
    	      	    	//event deleted, creation a new event
    	      	    $cordovaCalendar.createEvent({
    	    			title: libele_nom,
    	    			location: libele_location,
    	    			notes: comment,
    	    			startDate:new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
    	    			endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
    	    			}).then(function (res2) {
    	    			     // success creation, update DB local
    	    				   return callBack();

    	    			}, function (err) {
    	    			   // error
    	    				return callBack();
    	    			});
    	      	    },function(err){
    	      	    	return callBack();
    	      	    });
    	      	    }

        	  },function(err){
        	  });
      	}
			   }else{
				   return callBack();
			   }
		}, function(error){
		    console.error(error);
		    return callBack();
		});
	}
	var createRDVAgenda = function(db, contact, oldRDV,callBack){
		//alert(oldRDV);


		cordova.plugins.diagnostic.requestCalendarAuthorization(function(status){
			   if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
			       console.log("Calendar use is authorized");

		//preparation de parametres de rdv

		   var comment = "";
		   var libele_nom =  ""; //"Rappel Buzcard: recontacter "+contact.email+", rencontré le "+$filter('toFrFormat')(contact.alerteemailcreationdate) +"  "+ $filter('toTiret')(contact.meeting_point) +". "

    		if(contact.last_name != '' || contact.first_name !='' || contact.company !='' || contact.phone_1 !='' || contact.phone_2 !='' || contact.email !=''){
    			comment = contact.first_name + " " + contact.last_name+" - "+contact.company+" - "+contact.email+" - "+contact.phone_1+"Rencontré(e) le "+$filter('toFrFormat1')(contact.alerteemailcreationdate) +" "+ $filter('toPlace')(contact.meeting_point) +". ";

    			 libele_nom = "Rappel Buzcard: Recontacter "+$filter('capitalize')(contact.first_name) + " " + $filter('capitalize')(contact.last_name)+", rencontré(e) le "+$filter('toFrFormat1')(contact.alerteemailcreationdate) +".";
    			 //+ $filter('toPlace')(contact.meeting_point) +". "

    		}else{
    			//comment = contact.first_name + " " + contact.last_name+" "+contact.company+"  "+contact.email+" "+contact.phone_1;
    			 var libele_nom = "Rappel Buzcard: Recontacter "+contact.email+", rencontré(e) le "+$filter('toFrFormat1')(contact.alerteemailcreationdate) +".";
    			 //+ $filter('toPlace')(contact.meeting_point) +". "

    		}

    	//	if(contact.meeting_point == "" || contact.meeting_point == $translate.instant('ContactEdit.SearchGPS') )
    			libele_location = "";
    		//else  libele_location = contact.meeting_point;

    		contact.rendez_vous = toTimeStamp(contact.rendez_vous);
    		//cherche l'ancien rendez_vous
    		//alert('createRDVAgenda'+contact.meeting_point+'   '+oldRDV);
    		if(oldRDV =="" || oldRDV  =="NaN") oldRDV = new Date().getTime();
    		$cordovaCalendar.findEvent({
    	    title: libele_nom,
    	    location: libele_location,
    	    notes: comment,
    	    startDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 12, 30, 0, 0, 0),
    	    endDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 13, 30, 0, 0, 0)
    	  }).then(function (results) {
    		  	// si l'ancien evenement n'existe pas
    		  if(results ==""){
    			  // si le rendez_vous est vide
    	    if(contact.rendez_vous == ""){
    			return callBack();
    		}else{
    			// s'il ya un rendez_vous

    			//verifie l'existance de l'evenement dans le calendrier
    			$cordovaCalendar.findEvent({
				    title: libele_nom,
				    location: libele_location,
				    notes: comment,
				    startDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
				    endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
    			}).then(function (result) {
    				// si l'event n'existe pas
    			if(result ==""){
    				//creation de l'evenement
		      	    $cordovaCalendar.createEvent({
		      	    title: libele_nom,
		      	    location: libele_location,
		      	    notes: comment,
		      	    startDate:new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
		      	    endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
		      	  }).then(function (resultx) {
		      		  		// success
		      		 // 	UpdateSynchroStatusContact(db, contact.id, 'true', function(){
		      		  	return callBack();

		      		  //	});

		      	  		}, function (err) {
		      	  		return callBack();
		      	  			// error
		      	  			// console.log('erreur creation event'+JSON.stringify(err));
		      	  		});

    			}else{
    				//si l'evenement existe, delete l'evenement existante

    	    	$cordovaCalendar.deleteEvent({
    	    		title: result[0].title,
  		      	    location: result[0].location,
  		      	    notes: result[0].message,
    	    		 startDate:result[0].startDate,
 		      	    endDate:result[0].endDate
    	    	  }).then(function (result) {
    	    		  // evenement deleted, création de l'evenement de nouveau

    	    		  $cordovaCalendar.createEvent({
    			      	    title: libele_nom,
    			      	    location: libele_location,
    			      	    notes: comment,
    			      	    startDate:new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
    			      	    endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
    			      	  }).then(function (result1) {
    			      		  		// evenement created, enregistrement dans la base de données local
    			      		  //	UpdateSynchroStatusContact(db, contact.id, 'true', function(){
    			      		  	return callBack();

    			      		  //	});

    			      	  		}, function (err) {
    			      	  		return callBack();
    			      	  			// error
    			      	  			// console.log('erreur creation de nouveau evenet'+JSON.stringify(err));
    			      	  		});
    	    	  }, function (err) {
    	    		  return callBack();
    	    	    // errorreturn callBack();
    	    		  // console.log('erreur delete evenet'+err)
    	    	  });


    			}
    			}, function (err) {
    				return callBack();
    				// console.log('erreur de find event de rdv'+JSON.stringify(err));
    			});
    			}
    		  	}else{
    		  		//l'ancien evenement exist, tester si oldRDV = rendez_vous

    			  if(oldRDV == contact.rendez_vous){
    				 //meme date: update de base de données local;
    					//UpdateSynchroStatusContact(db, contact.id, 'true', function(){
    						return callBack();

		      		  //	});
    			  }else{
    				  console.log('-----results-------'+JSON.stringify(results[0]));
    				  //ne sont pas les memes, suppression de l'anciene et creation de nouveau

    				$cordovaCalendar.deleteEvent({
    	      	    newTitle: results[0].title,
    	    		location: results[0].location,
    	    		notes: results[0].message,
    	    		 startDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 12, 30, 0, 0, 0),
    	     	    endDate: new Date(new Date(oldRDV * 1000).getFullYear(), new Date(oldRDV * 1000).getMonth(), new Date(oldRDV * 1000).getDate(), 13, 30, 0, 0, 0)

    	      	    }).then(function (res) {
    	      	    	
    	      	    	//event deleted, creation a new event
    	      	    	$cordovaCalendar.createEvent({
    	    			title: libele_nom,
    	    			location: libele_location,
    	    			notes: comment,
    	    			startDate:new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
    	    			endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
    	    			}).then(function (result) {
    	    			     // success creation, update DB local
    	    			  // UpdateSynchroStatusContact(db, contact.id, 'true', function(){
    	    				   return callBack();
    	    			  // });

    	    			}, function (err) {
    	    			   // error
    	    				return callBack();
    	    			  // console.log('erreur create event'+JSON.stringify(err));
    	    			});
    	      	    },function(err){
    	      	    	console.log('err    '+JSON.stringify(err));
    	      	    	$cordovaCalendar.createEvent({
        	    			title: libele_nom,
        	    			location: libele_location,
        	    			notes: comment,
        	    			startDate:new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 12, 30, 0, 0, 0),
        	    			endDate: new Date(new Date(contact.rendez_vous * 1000).getFullYear(), new Date(contact.rendez_vous * 1000).getMonth(), new Date(contact.rendez_vous * 1000).getDate(), 13, 30, 0, 0, 0)
        	    			}).then(function (result) {
        	    			     // success creation, update DB local
        	    			  // UpdateSynchroStatusContact(db, contact.id, 'true', function(){
        	    				   return callBack();
        	    			  // });

        	    			}, function (err) {
        	    			   // error
        	    				return callBack();
        	    			  // console.log('erreur create event'+JSON.stringify(err));
        	    			});
    	      	    });
    			  }
    		  }
    	  },function(err){
    		  return callBack();
    			// console.log('erreur find old evenet'+JSON.stringify(err));
    	  });
			   }else{
	    			  return callBack();
	    		  }
		}, function(error){
		    console.error(error);
		});

	};

	/**
	 * update params adresse in contact where idcontact
	 */
	var updateAllCoord = function(db,contactId, lat, lng, address, callBack){
  	  var updateQuery = " UPDATE contact SET  "+
				"latitude_meeting ='"+lat+"' ,  " +
				"longitude_meeting ='"+lng+"' ,  " +
				"meeting_point ='"+addSlashes(address)+"' " +
				"where id="+contactId+"";
  	  // console.warn(updateQuery);

        $cordovaSQLite.execute(db, updateQuery).then(function(result) {

            return callBack(0);
          }, function(reason) {
            //TODO FIXME
            // console.log("error " + reason);
            return callBack(1);
          });
    };
    /**
     * Drop table contact;
     */
    var DropContactTable = function(db,callBack){

        var query ="Drop table IF EXISTS  contact";
        $cordovaSQLite.execute(db, query).then(function(value) {
          return callBack();
        }, function(reason){
          // console.log(reason);
        }, function(value){
        	alert();
        });
      };
	/**
	 * get the fist 50 domaine name
	 */
      var SelectDomaineName = function(db, callBack){
    	  var query ="select DISTINCT domaine from contact  order by domaine ASC  LIMIT 50";
          $cordovaSQLite.execute(db, query).then(function(result) {

        	  return callBack(result);
          }, function(reason){
            // console.log(reason);
            return 1;
          }, function(value){
        	  return 1;

          });
      };
      /**
       * search a domaine name where str in params
       *
       */
      var searchDomaineName = function(str, db, callBack){
    	  var query ="select DISTINCT domaine from contact where domaine like '%"+str+"%' ORDER BY domaine ASC LIMIT 50";
          $cordovaSQLite.execute(db, query).then(function(result) {
        	 // alert(JSON.stringify

        	  var domaines =[];
            	for (var int = 0; int < result.rows.length; int++) {

            	var domaine = {domaine: result.rows.item(int).domaine};


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
      /**
       * search email where str in param
       */
      var searchEmail= function(str, db, callBack){
    	  var query ="select DISTINCT email As Domaine from contact where Domaine like '%"+str+"%' ORDER BY Domaine ASC LIMIT 50";
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
      /**
       * get address with gps position
       */
      var geolocalicationAdress = function (db, contact, callBack){
//       	cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
//       		console.log(status);
      	    //if(status ==cordova.plugins.diagnostic.permissionStatus.GRANTED){
          	var lat  = 0;
          	var lng = 0;
          	  var posOptions = { enableHighAccuracy: true,
          			  timeout: 6000,
          			  maximumAge: 0};
      //  time12 = new Date().getTime();
          	  $cordovaGeolocation
          	    .getCurrentPosition(posOptions)
          	    .then(function (position) {

          	      lat  = position.coords.latitude;
          	      lng = position.coords.longitude;

          		        var latlng = {
          		            lat: parseFloat(lat),
          		            lng: parseFloat(lng)
          		        };
          		       console.log('Coordonnées GPS du position actuelle: '+lat+" : "+lng);

          		       if(latlng.lat != 0 && latlng.lng != 0){

          		        	SynchroServices.getAddressFromCoordonates(lat,lng,contact.id, function(address, id){
          		        	console.log('Adresse recupérée: '+address);
              		        	if("" != address && "undefined" != address){

              		        		updateAddress(db, contact.id, address, function(){

      									updateAllCoord(db,contact.id, lat, lng, address, function(){

      										callBack(address);
      									});
      								});
      						}else{

      									updateAllCoord(db,contact.id, lat, lng, '', function(){
      										// console.log(arguments[0]);
      										$rootScope.gpsNok = false;
      										callBack('');

      									});
      								//}
              		        	}
              		        });
          		        }else{

      							updateAllCoord(db,contact.id, lat, lng,'' , function(){

      								callBack('');
      							});
      						//}
          		        }


          		}, function(err) {

      			 console.warn("erreur get position");
      			 console.warn(err);

      					updateAllCoord(db,contact.id, 0, 0, '' , function(){


      			  		callBack('');

      			  		});

          		});
//      	   }else{
//      		 callBack('');
//      	   }
//    	}, function(error){
//      	    console.error(error);
//      	  callBack('');
//      	});
      };

      var searchContactInDevice = function(email, phone1, callBack, errorCallBack) {
          // alert(/Android|BlackBerry Mini/i.test(navigator.userAgent));
        //alert(email+"------"+phone1+"-------");
          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {

              cordova.plugins.diagnostic.isContactsAuthorized(function(authorized) {

                  if (authorized) {
                      email = (typeof email == undefined) ? "" : email;
                      email = email.toLowerCase();
                      phone1 = (typeof phone1 == undefined) ? "" : phone1;
                      if (phone1.trim() != "") {
                          var opts = {
                              filter: phone1,
                              multiple: true,
                              fields: ['phoneNumbers']

                          };
                          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                              opts.hasPhoneNumber = true; //hasPhoneNumber only works for android.
                          };



                          //  alert(JSON.stringify(opts));
                          $cordovaContacts.find(opts).then(function(allContacts) {
                              //alert(phone1+"phoneeeee "+JSON.stringify(allContacts));
                              if (allContacts == "" && email.trim() != "") {
                                  var opts = {
                                      filter: email,
                                      multiple: true,
                                      fields: ['emails']

                                  };
                                  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                                      opts.hasPhoneNumber = true; //hasPhoneNumber only works for android.
                                  };


                                  //  alert(JSON.stringify(opts));
                                  $cordovaContacts.find(opts).then(function(allContacs) {
                                      //  alert(email+"emaillll   "+JSON.stringify(allContacts));
                                      return callBack(allContacs);

                                  }, function(err) {
                                      return errorCallBack();
                                  });
                              } else {
                                  return callBack(allContacts);
                              }


                          }, function(err) {
                              return errorCallBack();
                          });
                      } else if (email.trim() != "") {
                          var opts = {
                              filter: email,
                              multiple: true,
                              fields: ['emails']

                          };
                          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                              opts.hasPhoneNumber = true; //hasPhoneNumber only works for android.
                          };



                          //  alert(JSON.stringify(opts));
                          $cordovaContacts.find(opts).then(function(allContacts) {
                              //  alert("emaillll   "+JSON.stringify(allContacts));
                              return callBack(allContacts);

                          }, function(err) {
                              return errorCallBack();
                          });
                      } else {
                          return callBack("");
                      }
                  } else {
                      return errorCallBack();
                  }
              }, function(error) {
                  console.error("The following error occurred: " + error);
                  return errorCallBack();
              });
          } else {
              //ios & wp

              email = (typeof email == undefined) ? "" : email;
              email = email.toLowerCase();
              if (phone1.trim() != "") {
                  var opts = {
                      filter: phone1,
                      multiple: true,
                      fields: ['phoneNumbers']

                  };


                  //  alert(JSON.stringify(opts));
                  $cordovaContacts.find(opts).then(function(allContacts) {
                      //alert(phone1+"phoneeeee "+JSON.stringify(allContacts));
                      //alert(email);
                      if (allContacts == "" && email.trim() != "") {
                          var opts = {
                              filter: email,
                              multiple: true,
                              fields: ['emails']

                          };


                          //  alert(JSON.stringify(opts));
                          $cordovaContacts.find(opts).then(function(allContacs) {
                              //  alert(email+"emaillll   "+JSON.stringify(allContacts));
                              return callBack(allContacs);

                          }, function(err) {
                              return errorCallBack();
                          });
                      } else {
                          return callBack(allContacts);
                      }


                  }, function(err) {
                      return errorCallBack();
                  });
              } else if (email.trim() != "") {
                  var opts = {
                      filter: email,
                      multiple: true,
                      fields: ['emails']

                  };
                  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                      opts.hasPhoneNumber = true; //hasPhoneNumber only works for android.
                  };



                  //  alert(JSON.stringify(opts));
                  $cordovaContacts.find(opts).then(function(allContacts) {
                      //alert("emaillll   "+JSON.stringify(allContacts));
                      return callBack(allContacts);

                  }, function(err) {
                      return errorCallBack();
                  });
              } else {
                  // alert("elseee");
                  return callBack("");
              }
          }

      };

     var saveContactInTel = function(contact,callBack){
       if (contact.email.length == 0 && contact.phone_1.length == 0 && contact.phone_2.length == 0 ) {
          return callBack();
       }
    	 var dateBirthday = null;
    		if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {

 	    	} else {
 	    	//	firstsendemail ="";
  	    		dateBirthday = 	$filter('date')("", 'MM/dd/yyyy');
 	    	}
    		var firstname = "";
    		if(contact.first_name !=null || contact.first_name !=""){

    		}
    		var note ="";
    		if(contact.firstsendemail.trim() =="" && contact.meeting_point.trim()==""){
    			note="";
    		}else {
    			note = "Contact rencontré le "+$filter('toFrFormat')(contact.firstsendemail)+" "+$filter('grpFormat')(contact.list)+" \n"+$filter('MeetingFilter')(contact.meeting_point.capitalize())+"\n "+removeSlashes(contact.actu)+" \n"+contact.comment;

    		}

    			var contactDE = {     // We will use it to save a contact

    		        "displayName":contact.first_name+" "+contact.last_name,
    		        "name": {
    		            "givenName"  : contact.first_name.capitalize(),
    		            "familyName" : contact.last_name.capitalize(),
    		            "formatted"  : contact.first_name.capitalize()+" "+contact.last_name.capitalize()
    		        },
    		        //"nickname": contact.first_name.capitalize(),
    		        "phoneNumbers": [
    		        ],
    		        "emails": [
    		            {
    		                "value": contact.email,
    		                "type": "home"
    		            }
    		        ],
    		        "addresses": [
    		            {
    		                "type": "home",
    		                "formatted":contact.addressline1+" "+contact.addressline2+" "+contact.addressline3,
    		                "streetAddress": contact.addressline1+" "+contact.addressline2+" "+contact.addressline3,
    		                "locality":"",
    		                "region":"",
    		                "postalCode":contact.postalcode,
    		                "country":contact.city
    		            }
    		        ],
    		        "ims": null,
    		        "organizations": [
    		            {
    		                "type": "Company",
    		                "name": contact.company.capitalize(),
    		                "department": "",
    		                "title":contact.fonction.capitalize()
    		            }
    		        ],
    		        "birthday": dateBirthday ,
    		        "note": note,
    		        "photos": [
    		            {
    		                "type": "base64",
    		                "value": contact.photofilelocation

    		            }
    		        ],
    		        "categories": null,
    		        "urls": null
    		    }
    	 var phoneNumbers = [];
    	if(contact.phone_1 !=""){
    		 phoneNumbers[0] = new ContactField('Fixe', contact.phone_1, false); //new ContactField();
    		 if(contact.phone_2 !=""){
    			 phoneNumbers[1] = new ContactField('mobile', contact.phone_2, true);
    		 }
    	}else if(contact.phone_2 !=""){
    		phoneNumbers[0] = new ContactField('mobile', contact.phone_2, true);
    	}

    	var Urls = [];
    	Urls[0] = new ContactField('URL',contact.Link_CardOnline);
    	contactDE.urls = Urls;

   	contactDE.phoneNumbers=phoneNumbers;
    	     // alert(JSON.stringify(contactDE));
    	 $cordovaContacts.save(contactDE).then(function(result) {
    	      // Contact saved
    		// alert("success "+JSON.stringify(result));
    		  return callBack();
    	    }, function(err) {
    	      // Contact error
    	    	//alert('erreur '+JSON.stringify(err));
    	    });

     };


     var updateContactDevice = function(contactTel,contact,oldEmailPhone, callBack) {
       if (contact.email.length == 0 && contact.phone_1.length == 0 && contact.phone_2.length == 0 ) {
          return callBack()
       }
    		 var dateBirthday = null;
     		if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {

  	    	} else {
  	    		firstsendemail ="";
  	    		dateBirthday = 	$filter('date')(firstsendemail, 'MM/dd/yyyy');
  	    	}
    	 contactDevice= $cordovaContacts.clone(contactTel);

             var phoneNumbers = [];
             var emailsArray = [];
             console.log(JSON.stringify(contactDevice));
             if (contactDevice.emails != null ) {
               /********  test if email not egales  ************/
               var emailTrouve = false;
               for(var i=0; i< contactDevice.emails.length; i++){
            		 emailsArray[i] = contactDevice.emails[i];
            		 if(contactDevice.emails[i].value == oldEmailPhone.email){
                   emailTrouve = true;
                   contactDevice.emails[i].value = contact.email;
            		 }
            	 }
               if(!emailTrouve){
                 contactDevice.emails.push({type:"home",value:contact.email})
               }
               /********  test if email egales  ************/
             }else {
            	 if(contact.email.length != 0 )
            		 emailsArray[0] = new ContactField('home', contact.email, false);
                contactDevice.emails= emailsArray;
             }


             if(contactDevice.phoneNumbers != null){
            	 var trouvePhone1=false;
            	 var trouvePhone2 = false;
            	 	//alert(contactDevice.phoneNumbers.length);
            	 for(var i=0; i< contactDevice.phoneNumbers.length; i++){
            		 phoneNumbers[i] = contactDevice.phoneNumbers[i];
            		 if(contactDevice.phoneNumbers[i].value == oldEmailPhone.phone_1){
            			 trouvePhone1=true;
                   contactDevice.phoneNumbers[i].value = contact.phone_1;
            		 }
//            		 else if (contactDevice.phoneNumbers[i].value == contact.phone_2){
//            			 trouvePhone2 = true;
//            			 contactDevice.phoneNumbers[i].value = contact.phone_2;
//
//            		 }

            		 if(contactDevice.phoneNumbers[i].value == oldEmailPhone.phone_2){
            			 trouvePhone2=true;
                   contactDevice.phoneNumbers[i].value = contact.phone_2;
            		 }
//            		 else if (contactDevice.phoneNumbers[i].value == contact.phone_1){
//            			 trouvePhone1 = true;
//            			 contactDevice.phoneNumbers[i].value = contact.phone_1;
//            		 }


            	 }
            	//console.log(contactDevice.phoneNumbers.length+" "+trouvePhone1+" "+trouvePhone2);

            	 if(trouvePhone1== false && contact.phone_1 !=""){

        			 phoneNumbers[contactDevice.phoneNumbers.length] = new ContactField('Fixe', contact.phone_1, false);
        		 }
            	 if(trouvePhone2==false && contact.phone_2 !=""){
        			 phoneNumbers[contactDevice.phoneNumbers.length] = new ContactField('mobile', contact.phone_2, false);
        		 }

            	contactDevice.phoneNumbers=phoneNumbers;

             }else{

            	 if(contact.phone_1 !=""){
            		 phoneNumbers[0] = new ContactField('Fixe', contact.phone_1, false); //new ContactField();
            		 if(contact.phone2 !=""){

                		 phoneNumbers[1] = new ContactField('mobile', contact.phone_2, true);
                	}
            	 }
            	 else if(contact.phone_2 !=""){

            		 phoneNumbers[0] = new ContactField('mobile', contact.phone_2, true);
            	}

            	 contactDevice.phoneNumbers=phoneNumbers;
             }
             var Urls = [];
             if(contactDevice.urls !=null){
            	 Urls[0] = new ContactField('URL',contact.Link_CardOnline);
             }else{
         	Urls[0] = new ContactField('URL',contact.Link_CardOnline);
             }
             contactDevice.urls = Urls;
             //alert(contactDevice.photos);
             if(contactDevice.photos ==null || contactDevice.photo =="null"){
            var contactPhoto=[];
            contactPhoto[0]= new ContactField();
            contactPhoto[0].value=contact.photofilelocation;
            contactDevice.photos = contactPhoto;
             }else{
            	 contactDevice.photos[0].value = contact.photofilelocation;
             }
             contactDevice.categories = contact.list;
             if(contact.company !=""){
             if(contactDevice.organizations !=null){
            	 if(contactDevice.organizations.length >0){
            		 contactDevice.organizations[0].name=contact.company.capitalize();
            		 contactDevice.organizations[0].title=contact.fonction.capitalize();
            	 } else{
            	   var organisation=[];
            	    organisation[0] = new ContactOrganization();
            	   organisation[0].name=contact.company.capitalize();
            	   organisation[0].type ="Company";
            	   organisation[0].title=contact.fonction.capitalize();
            	   contactDevice.organizations=organisation;
               }
             }


             }
             contactDevice.note="";
             if(contact.firstsendemail.trim() =="" && contact.meeting_point.trim() ==""){
            	 contactDevice.note =contact.comment;
             }else{
          if(contactDevice.note =="" || contactDevice.note ==null){


             contactDevice.note = "Contact rencontré le "+$filter('toFrFormat')(contact.firstsendemail)+""+$filter('MeetingFilter')(contact.meeting_point.capitalize())+" \n"+removeSlashes(contact.actu)+"\n"+contact.comment;
          }else if(contactDevice.note.indexOf("Contact rencontré le ") != -1 ){
        	  contactDevice.note= "Contact rencontré le "+$filter('toFrFormat')(contact.firstsendemail)+""+$filter('MeetingFilter')(contact.meeting_point.capitalize())+" \n"+removeSlashes(contact.actu)+" \n"+contact.comment;

          }else{
              contactDevice.note = "Contact rencontré le "+$filter('toFrFormat')(contact.firstsendemail)+""+$filter('MeetingFilter')(contact.meeting_point.capitalize())+" \n"+removeSlashes(contact.actu)+"\n"+contact.comment;

          }

}
          if(contactDevice.addresses !=null){

//        	  var addresses = [];
//        	  addresses[0] = new ContactAddress();
        	  contactDevice.addresses[0].type = "home";
        	  contactDevice.addresses[0].formatted = contact.addressline1+" "+contact.addressline2+" "+contact.addressline3;
        	  contactDevice.addresses[0].streetAddress = contact.addressline1+" "+contact.addressline2+" "+contact.addressline3;
        	  contactDevice.addresses[0].postalCode = contact.postalcode;
        	  contactDevice.addresses[0].country = contact.city;
//        	  contactDevice.addresses = addresses;
          }else{
        	  var addresses = [];
        	  addresses[0] = new ContactAddress();
        	  addresses[0].type = "home";
        	  addresses[0].formatted = contact.addressline1+" "+contact.addressline2+" "+contact.addressline3;
        	  addresses[0].streetAddress = contact.addressline1+" "+contact.addressline2+" "+contact.addressline3;
        	  addresses[0].postalCode = contact.postalcode;
        	  addresses[0].country = contact.city;
        	  contactDevice.addresses = addresses;
          }


             contactDevice.birthday = dateBirthday ;
     		contactDevice.displayName =   contact.first_name.capitalize()+" "+contact.last_name.capitalize() ;
			 contactDevice.name.formatted =   contact.first_name.capitalize()+" "+contact.last_name.capitalize();
			 contactDevice.name.givenName =  contact.first_name.capitalize()  ||  contactDevice.name.givenName;
            contactDevice.name.familyName =  contact.last_name.capitalize() || contactDevice.name.familyName;

            contactDevice.nickname=null;
             $cordovaContacts.remove(contactTel).then(function(success){
               $cordovaContacts.save(contactDevice).then(function(result) {
          		     return  callBack();

               }, function(err) {
          	      // Contact error

              	 console.warn('erreur save'+JSON.stringify(err));

          	    });
             },function(error){
            	 console.warn('error remove  '+JSON.stringify(error));
             });

    	// });

           //return contactDevice ;

          };

          /**
          *
          * evaluate the number of keys who has values
          * return the number of keys who has values
          */
          var getScore = function(score, obj) {

            function hasOwnNestedProperty( obj) {
             if (obj){
                 for (var key in obj) {

                     if (typeof obj[key] == "string"){
                        if(obj[key] != ""){
                         score++
                         }
                     }
                     else if (typeof obj[key] == "object" && !Array.isArray(obj[key])){

                       hasOwnNestedProperty( obj[key]);

                      }
                     else if ( Array.isArray(obj[key]) )
                       for (var variable in obj[key]) {

                           hasOwnNestedProperty( obj[key][variable]);
                       }
                 }
               }

          };
            hasOwnNestedProperty(obj);
           return score
          }

          var sortContactDevice = function (array) {

            if (typeof array == "object" && !Array.isArray(array)){
              return array
            }
            else if( Array.isArray(array) ){
              scoreArray = [];
               for (var i = 0; i < array.length; i++) {
                 scoreArray[i]= getScore(0, array[i]);
               }

               var max = scoreArray[0];
                var maxIndex = 0;

                for (var i = 1; i < scoreArray.length; i++) {
                   if (scoreArray[i] > max) {
                       maxIndex = i;
                       max = scoreArray[i];
                   }
                }
                return array[maxIndex];
            }else{
              return "";
            }

          };

          var importContactDevice = function(db,pathfile, callBack, errorCallBack){
        	 // http://www.buzcard.com/import.aspx?service=phonecontacts&act=oqykfkRfe5vQW8HkeiQOxg==&import=OK
        		var path="";
        		 var isWindowsPhone = ionic.Platform.isWindowsPhone();
        	    if(window.cordova){
        	    	if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
        	    	   path = cordova.file.applicationStorageDirectory;
        	    	} else if (isWindowsPhone) {
        	           path = "/";
        	        } else {
        	          path = cordova.file.dataDirectory;
        			}
        	    }
//        	    alert(pathfile);
        	  var fileName = pathfile.substr(pathfile.lastIndexOf('/')+1);
        	  $cordovaFile.readAsText(path, fileName)
              .then(function (success) {
        	  $.ajax({
    	          type : "GET",
    	          url : "https://www.buzcard.com/send.aspx",
    	          timeout : 2000,
    	          success : function(a, status, xhr) {
    	        	  // console.log(a);
    	            var action = $($.parseHTML(a)).filter("#form1").attr("action");
    	            // console.log(action);
    	            var arg = action.split('?');
    	            var url = "https://www.buzcard.com/import.aspx?service=Importphonecontacts&"+decodeURIComponent(arg[1]) +"&FileName="+fileName+"&import=OK";


    	            var jsonfile=success;

                    var formData = new FormData();

                    formData.append('jsonfile', new Blob([jsonfile], {
                        type: "application/json"
                    }),fileName);

                    $http.post(url, formData, {
                        transformRequest: angular.identity,
                        transformResponse: function (data) {
                            var x2js = new X2JS();
                            var json = x2js.xml_str2json(data);
                            return json;
                        },
                        headers: {
                        	'Content-Type': undefined
                        }
                    }).success(function (data, status, headers, config) {
                            // console.log('success upload ...');

                            callBack(data);

                        })
                        .error(function () {
                            // console.log('erreur');
                            errorCallBack();
                        });
//    	            $.ajax({
//    	              type : "POST",
//    	              url : url,
//    	              data: formData,
//    	              dataType: "json",
//    	              processData : false,
//    	              contentType : false,
//    	              transformRequest: angular.identity,
//                    headers: {
//                       'Content-Type': 'application/x-www-form-urlencoded'
//                    },
//    	              success : function(out, status, xhr) {
//    	            	  console.log(JSON.stringify(xhr));
//    	               return callBack();
//    	              },
//    	              error : function(xhr, ajaxOptions, thrownError) {
//    	               console.log(JSON.stringify(xhr));
//    	                   return errorCallBack(xhr);
//    	              }
//    	            });
    	          },
    	          error : function(xhr, ajaxOptions, thrownError) {
    	        	  console.log(JSON.stringify(xhr));
    	                     return errorCallBack(xhr);
       	          }
    	        });
              }, function (error) {
                  // error
            	  console.log(JSON.stringify(error));
                });

        	  };


      var checkExistanceMail = function(db, email, id, callBack){

    	  try {

    	        var query = "SELECT * FROM contact where email='"+email+"' and email != '' and id != '"+id+"' COLLATE NOCASE";
    	        $cordovaSQLite.execute(db, query).then(function(results) {
    	            return callBack(results);

    	          }, function(reason) {
    	            //TODO FIXME
    	            // console.log("error " + reason);
    	            return 1;
    	          });

    	      } catch (e) {
    	        // console.log(e);
    	        return 1;
    	      };

      }

      var createContactServer = function(id, RID){
        var request = {
          url : "https://www.buzcard.com/contacts_mobile.aspx?request=Contact_new&ID="+id+"&RID="+RID,
          method : "GET",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: function(obj) {
            var str = [];
            for ( var p in obj)
              str.push(encodeURIComponent(p) + "="+ encodeURIComponent(obj[p]));
            return str.join("&");
          },
          transformResponse: function(data) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(data);
            return json;
          }
        };

        return $http(request);
      }

      var createContactDB = function(db,id, callBack){
        var query = 'INSERT INTO contact (id,rendez_vous, email, comment,' +
        'last_name, first_name, phone_1, phone_2, company, '+
        'list, status,lastsendemail, LanguageText,firstsendemail,'+
        'modificationdate, meeting_point,latitude_meeting,longitude_meeting,synchro,domaine,lastsendemailtimeStmp,'+
        'emailaddress2 , actu, addressline1, addressline2, addressline3, postalcode, city , workphonenumber , mobilephonenumber2 , source , fonction , Link_CardOnline,Filleul, vcardprofil) '+
        'VALUES ('+id+',"","","","","","","","","","selected","","","","","","","","false","","","","","","","","","","","","","","","","")';

          $cordovaSQLite.execute(db, query).then(function(results) {
              return callBack(results);

            }, function(reason) {
              //TODO FIXME
              // console.log("error " + reason);
              return 1;
            });
      }

      var updateContactByField = function(db, fieldName, fieldValue, id, callBack){
        var query = "UPDATE contact set "+fieldName+" = '"+fieldValue+"' WHERE id="+id;
        $cordovaSQLite.execute(db, query).then(function(results) {

            return callBack(results);

          }, function(reason) {
            //TODO FIXME
            console.log(reason);
            return 1;
          });
      }

      var createContactServerWithPhone = function(userId, PhoneNumber){
        var request = {
          url : "https://www.buzcard.com/contacts_mobile.aspx?request=Contact_add&ID="+userId+"&PhoneNumber="+PhoneNumber,
          method : "GET",
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          transformRequest: function(obj) {
            var str = [];
            for ( var p in obj)
              str.push(encodeURIComponent(p) + "="+ encodeURIComponent(obj[p]));
            return str.join("&");
          },
          transformResponse: function(data) {
            var x2js = new X2JS();
            var json = x2js.xml_str2json(data);
            return json;
          },
        };

        return $http(request);
      }


      var insertContact = function(db,contact,callBack) {
        var synchro='false';
        // console.log("+++++ insertIntoContactsTable ++++++++");
        var insertQuery = 'INSERT INTO contact (id,rendez_vous, email, date, comment,' +
        'last_name, first_name, phone_1, phone_2, company, '+
        'list, status,lastsendemail, LanguageText,firstsendemail,photofilelocation,'+
        'alerteemailcreationdate, modificationdate, meeting_point,latitude_meeting,longitude_meeting,synchro,domaine,lastsendemailtimeStmp,'+
        'emailaddress2 , actu, addressline1, addressline2, addressline3, postalcode, city , workphonenumber , mobilephonenumber2 , source , fonction , Link_CardOnline, Filleul, vcardprofil) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
       // console.warn(insertQuery);

        try {
          var parameters = [contact.id,toTimeStamp(contact.rendez_vous),contact.email,contact.date,addSlashes(contact.comment),
                            addSlashes(contact.last_name),addSlashes(contact.first_name),addSlashes(contact.phone_1),addSlashes(contact.phone_2),
                            addSlashes(contact.company),addSlashes(contact.list),contact.status,contact.lastsendemail,contact.LanguageText,contact.firstsendemail,
                            "img/photo_top_title.jpg",contact.alerteemailcreationdate,contact.modificationdate,addSlashes(contact.meeting_point),contact.latitude_meeting,contact.longitude_meeting,synchro,"", toTimeStampLast(contact.lastsendemail),
                            addSlashes(contact.emailaddress2) , addSlashes(contact.actu), addSlashes(contact.addressline1), addSlashes(contact.addressline2), addSlashes(contact.addressline3), addSlashes(contact.postalcode), addSlashes(contact.city) , addSlashes(contact.workphonenumber) , addSlashes(contact.mobilephonenumber2) , addSlashes(contact.source) , addSlashes(contact.fonction) , contact.Link_CardOnline, contact.Filleul, contact.vcardprofil];
          $cordovaSQLite.execute(db, insertQuery,parameters).then(function(value) {
            // console.log("callback ok+++");
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

      var selectContactByPhone = function(db, phoneNumber, callBack){
        var query = "SELECT * FROM contact WHERE phone_1 ='"+phoneNumber+"' OR phone_2 ='"+phoneNumber+"'";
        $cordovaSQLite.execute(db, query).then(function(res) {

          return callBack(res);
        }, function(reason) {
           console.log(reason);
        }, function(value) {

        });
      };

      var deleteContactcreated = function(db, id, callBack){
    	  var query = "delete from contact WHERE id ="+id;
          $cordovaSQLite.execute(db, query).then(function(res) {

            return callBack(res);
          }, function(reason) {
             console.log(reason);
          }, function(value) {

          });
      }

      var saveOrUpdateContactTel= function(db,contact, oldEmailPhone, callBack, callBackError){
    	//  alert(JSON.stringify(contact));
    	  cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
    		    if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
    		        console.log("Contacts use is authorized");


    	  emailToSearchFor = oldEmailPhone.email;
 		 phone_1ToSearchFor = oldEmailPhone.phone_1;
 			 if(phone_1ToSearchFor.trim() ==''){
         	  phone_1ToSearchFor = oldEmailPhone.phone_2;
         		  }
    	  if(emailToSearchFor.trim() =="" && phone_1ToSearchFor.trim()  ==""){
    		  return callBack();
    	  }else{


    	  searchContactInDevice(emailToSearchFor, phone_1ToSearchFor, function(resu) {
		console.log('------------------search contact device ----------');
		console.log(resu);
		console.log('------------------End search contact device ----------');
		    		  if(resu==""){

    			  saveContactInTel(contact, function() {
    				  return callBack();
    			  });

    		  }else{
    			  updateContactDevice(sortContactDevice(resu), contact,oldEmailPhone, function() {
    				  return callBack();
    			  });
    		  }



    	  },function(err){
    		  return callBackError();
    	  });
    	  }
    		    }else{
    		    	return callBack();
    		    }
  		}, function(error){
  		    console.error(error);
  		});
      };
      var updateContactImported = function(db, total,callBack){
    	  emptyContactTable(db, function() {
    		  console.log('tabdeleted');
				getContactsRecurssiveSynchro(db, 1, function(){
					updateStatusEmailEmpty(db, function(){
						downloadAllPhotoContacts(db,function(){
                          emptyGroupTable(db, function() {
                              // get data from server
                              getGroup().success(function(data, status, headers, config) {

                                  if (data.lists.list instanceof Array) {
                                      // insert into group table
                                         insertBulkGroupe(db, data.lists.list, function() {
                                        	 var dateSynchronisation = MenuService.getDateUS();
                                             MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);

                                             MenuService.setLocalStorage('ReloadContactList', 1);
                                             return callBack();
                                          });
                                  } else {
                                      insertIntoGroupTable(db, data.lists.list, function() {

                                    	  var dateSynchronisation = MenuService.getDateUS();
                                          MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);

                                          MenuService.setLocalStorage('ReloadContactList', 1);
                                          return callBack();
                                      });

                                  }
                              }).error(function(data, status, headers, config) {
                                  // console.log("error " + status);
                                  // TODO FIXME
                              });

                          });



                      });
    	  });
				  });
    	  });

      };

      var insertOrUpdateContactsImported = function(db, i, total, contacts, callBack) {

  		//appel recurssive
  		// alert(total+' '+i);
  	    if (i < parseInt(total)) {

  	        //ca ou il y a plusieurs contacts
  	        if (contacts instanceof Array) {
  	            getContactbyId(db, contacts[i].id, function(result) {

  	                if (result.rows.length > 0) {
  	                    // console.info("update");
  	                    //update
  	                    updateContactInfoDateModification(db, contacts[i], function() {

  	                    	if(contacts[i].email ==''){
  	                    		updateContactByField(db,"status","cant_be_selected", contacts[i].id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}else{
  	                    		updateContactByField(db,"status","selected", contacts[i].id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}


  	                    });
  	                } else {
  	                    // console.info("insert");
  	                    //insert
  	                    insertIntoContactsTable(db, contacts[i], function() {

  	                    	if(contacts[i].email ==''){
  	                    		updateContactByField(db,"status","cant_be_selected", contacts[i].id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}else{
  	                    		updateContactByField(db,"status","selected", contacts[i].id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}

  	                    });
  	                }
  	            });
  	        //ca ou il y a un seul contact
  	        } else {
  	        	// console.log('un seul contact'+contacts);
  	            getContactbyId(db, contacts.id, function(result) {
  	                if (result.rows.length > 0) {
  	                    // console.info("update");
  	                    //update
  	                    updateContactInfoDateModification(db, contacts, function() {
  	                    	if(contacts.email ==''){
  	                    		updateContactByField(db,"status","cant_be_selected", contacts.id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}else{
  	                    		updateContactByField(db,"status","selected", contacts.id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}

  	                    });
  	                } else {
  	                    // console.info("insert");
  	                    //insert
  	                    insertIntoContactsTable(db, contacts, function() {
  	                    	if(contacts.email ==''){
  	                    		updateContactByField(db,"status","cant_be_selected", contacts.id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}else{
  	                    		updateContactByField(db,"status","selected", contacts.id,function(){

  	                    			insertOrUpdateContactsImported(db, i + 1, total, contacts, callBack);

  	                    		});
  	                    	}
//
  	                    });
  	                }
  	            });
  	        }

  	    //appel recurssive
  	    } else {
  	        return callBack();
  	    }
  	};

    var  getContactsRecurssiveSynchro= function(db,page, callBack) {

        // get data from server
        getContacts(page).success(function(data, status, headers, config) {

        	if(parseInt(data.contacts.total) ==1){
        		insertIntoContactsTable(db, data.contacts.contact, function(){
        			return callBack();
        		});

        	}else if (typeof data.contacts.contact == "undefined"){
        		 return callBack();
        	}else{
        		 var pages = data.contacts.pages;
                 if (page <= pages - 1) {
                     page = parseInt(page) + 1;


                     insertBulkIntoContactsTable(db, 0, data.contacts.contact, function() {
                     //    LoadingService.loading($translate.instant('Loading3') + parseInt((page / pages) * 100) + "%");

                     });
                     getContactsRecurssiveSynchro(db, page, callBack);


                 } else {
                     insertBulkIntoContactsTable(db, 0, data.contacts.contact, function() {

                    	 return callBack();
                     });
                 }
        	}

        }).error(function(data, status, headers, config) {
            // console.log("error " + status);
            // TODO FIXME
        });
    };
    var SelectEmailsName = function(db,callBack){
    	 var query ="select DISTINCT email from contact";
         $cordovaSQLite.execute(db, query).then(function(result) {

       	  return callBack(result);
         }, function(reason){
           // console.log(reason);
           return 1;
         }, function(value){
       	  return 1;

         });
     };
     var getContactUpdate= function(contacts, callBack){
    	  if (contacts instanceof Array) {
              var nbcontact = contacts.length;
              if(nbcontact>2){
            	  if(contacts[0].first_name =='' && contacts[0].last_name ==''){
            		  contact1 = contacts[0].email;
            	  }else{
            		  contact1=contacts[0].first_name+' '+contacts[0].last_name
            	  }

            	  if(contacts[1].first_name =='' && contacts[1].last_name ==''){
            		  contact2 = contacts[1].email;
            	  }else{
            		  contact2=contacts[1].first_name+' '+contacts[1].last_name
            	  }

            	  if(contacts[2].first_name =='' && contacts[2].last_name ==''){
            		  contact3 = contacts[2].email;
            	  }else{
            		  contact3=contacts[2].first_name+' '+contacts[2].last_name
            	  }

            	  return callBack({contact1: contact1, contact2:contact2 ,contact3:contact3, nbcontact:contacts.length});
              }else{
            	  if(contacts[0].first_name =='' && contacts[0].last_name ==''){
            		  contact1 = contacts[0].email;
            	  }else{
            		  contact1=contacts[0].first_name+' '+contacts[0].last_name
            	  }

            	  if(contacts[1].first_name =='' && contacts[1].last_name ==''){
            		  contact2 = contacts[1].email;
            	  }else{
            		  contact2=contacts[1].first_name+' '+contacts[1].last_name
            	  }
            	  return callBack({contact1: contact1, contact2:contact2 ,nbcontact:contacts.length});

              }

    } else if (contacts instanceof Object) {
    	  if(contacts.first_name =='' && contacts.last_name ==''){
    		  contact1 = contacts.email;
    	  }else{
    		  contact1=contacts.first_name+' '+contacts.last_name
    	  }

              return callBack({contact1: contact1 ,nbcontact:1});
          }

     };

     var checkinfoserver = function(db, fiedserveur, fieldlocal,field, contactid, callBack){
    	 if(fiedserveur != fieldlocal && fiedserveur !=''){
    		 updateContactByField(db, field, fiedserveur, contactid, function() {
    			 return callBack();
    		 });
    	 }else{
    		 return callBack();
    	 }
     }




  /**
   * the factory returns
   */
  return {
    getContacts: getContacts,
    getContactsEdited: getContactsEdited,
    getGroup : getGroup,
    createGroupTable :createGroupTable,
    createContactsTable : createContactsTable,
    insertIntoGroupTable : insertIntoGroupTable,
    insertIntoContactsTable :insertIntoContactsTable,
    emptyGroupTable  : emptyGroupTable,
    emptyContactTable : emptyContactTable,
    selectContacts : selectContacts,
    getCountOfContact : getCountOfContact,
    getContactbyId:getContactbyId,
    selectFollowers : selectFollowers,
    selectAllGroup : selectAllGroup,
    selectRecontact : selectRecontact,
    updateContactInfo:updateContactInfo,
    deleteContactLocal:deleteContactLocal,
    selectContactsByGroup : selectContactsByGroup,
    getAllContactsByGroup : getAllContactsByGroup,
    searchContact : searchContact,
    insertBulkIntoContactsTable : insertBulkIntoContactsTable,
    downloadPhotoContact: downloadPhotoContact,
    updateContactServer :updateContactServer,
    deleteContactServer : deleteContactServer,
    editGroup : editGroup,
    updateGroupServer : updateGroupServer,
    renameContactGroup : renameContactGroup,
    selectContactByGroupName : selectContactByGroupName,
    deleteGroupByName : deleteGroupByName,
    uploadPhotoContact:uploadPhotoContact,
    getCreditParrainage : getCreditParrainage,
    getContactFromServerByEmail: getContactFromServerByEmail,
    selectContactbyEmail : selectContactbyEmail,
    updateContactStatus : updateContactStatus,
    updateContactIdByEmail : updateContactIdByEmail,
    insertOrUpdateContacts :insertOrUpdateContacts,
    updateContactInfoNew : updateContactInfoNew,
    updateContactInfoDateModification :updateContactInfoDateModification,
    getAllContactsId: getAllContactsId,
    downloadSinglePhotoContact: downloadSinglePhotoContact,
    downloadAllPhotoContacts:downloadAllPhotoContacts,
    compareDate : compareDate,
    USToFrenchFromat :USToFrenchFromat,
    updateContactPhoto :updateContactPhoto,
    downloadPhotoContactsAtSynchro :downloadPhotoContactsAtSynchro,
    downloadAndOverride : downloadAndOverride,
    insertBulkGroupe :insertBulkGroupe,
    isUpToDate : isUpToDate,
    updateContactModificationDate :updateContactModificationDate,
    updateContactLastSendAndLanguageRdv : updateContactLastSendAndLanguageRdv,
    getCountOfAllContact : getCountOfAllContact,
    getContactHaventAddress : getContactHaventAddress,
    updateAddress : updateAddress,
    UpdateSynchroStatusContact:UpdateSynchroStatusContact,
    createEventCalender:createEventCalender,
    updateAllCoord :updateAllCoord,
    DropContactTable:DropContactTable,
    SelectDomaineName:SelectDomaineName,
    searchDomaineName:searchDomaineName,
    createRDVAgenda:createRDVAgenda,
    searchEmail:searchEmail,
    geolocalicationAdress:geolocalicationAdress,
    updateContactLocal:updateContactLocal,
    searchContactInDevice:searchContactInDevice,
    saveContactInTel:saveContactInTel,
    updateContactDevice:updateContactDevice,
    sortContactDevice : sortContactDevice,
    importContactDevice:importContactDevice,
    getCountOfFollowers:getCountOfFollowers,
    selectNonFollowers:selectNonFollowers,
    getCountOfNonFollowers:getCountOfNonFollowers,
    getCountOfContactSansGroups:getCountOfContactSansGroups,
    selectSansGroups:selectSansGroups,
    selectSansEmail:selectSansEmail,
    getCountOfContactSansEmail:getCountOfContactSansEmail,
    getCountOfContactDoublonsProbables:getCountOfContactDoublonsProbables,
    selectDoublonsProbables:selectDoublonsProbables,
    selectBuzwards:selectBuzwards,
    getCountOfContactBuzwards:getCountOfContactBuzwards,
    selectFilleuls:selectFilleuls,
    getCountOfContactFilleuls:getCountOfContactFilleuls,
    checkExistanceMail:checkExistanceMail,
    createContactServer : createContactServer,
    createContactDB : createContactDB,
    updateContactByField : updateContactByField,
    saveOrUpdateContactTel:saveOrUpdateContactTel,
    createContactServerWithPhone : createContactServerWithPhone,
    insertContact : insertContact,
    selectContactByPhone : selectContactByPhone,
    updateContactIdById:updateContactIdById,
    deleteContactcreated:deleteContactcreated,
    updateStatusEmailEmpty: updateStatusEmailEmpty,
    updateContactImported:updateContactImported,
    insertOrUpdateContactsImported:insertOrUpdateContactsImported,
    // getContactsImportedRecurssive:getContactsImportedRecurssive,
    getContactsRecurssiveSynchro:getContactsRecurssiveSynchro,
    SelectEmailsName:SelectEmailsName,
    UpdateRepertoire:UpdateRepertoire,
    createAgendaRDV:createAgendaRDV,
    getContactUpdate:getContactUpdate,
    checkinfoserver:checkinfoserver


  };

}]);
function frenchToUsFormat(frenchDate) {
	try {
		//// console.log(frenchDate);
        var array1 = frenchDate.split("/");
        return array1[1]+"/"+array1[0]+"/"+array1[2];
	} catch (e) {
		return frenchDate ;
	}

};
function toUsFormat(date) {
    try {
		return date.getMonth()+1 +"/"+date.getDate()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes();
	} catch (e) {
		return date;
	}
};
