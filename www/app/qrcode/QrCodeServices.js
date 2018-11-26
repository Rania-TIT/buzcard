appContext.factory("QrCodeServices", ['$http','$cordovaSQLite','$filter','LoginService','$rootScope','cameraService','ContactsService','SynchroServices','$translate','BuzcardService', function($http, $cordovaSQLite, $filter, LoginService,$rootScope,cameraService, ContactsService,SynchroServices,$translate,BuzcardService) {

	var getCardInfoFromQrCode = function (act){
		var idUser = $rootScope.userId;

		req = {
				url : "https://www.buzcard.com/contacts_mobile.aspx?request=ContactBuz_add&ID="+idUser+"&act="+act,
				//url :"http://buzcard.fr/isbuzcard.aspx?request=virtual_card&act="+act,
				headers: {
			        'Content-Type': 'application/x-www-form-urlencoded'

			      },
			      transformResponse: function(data) {
			        var x2js = new X2JS();
			        var json = x2js.xml_str2json(data);
			        return json;
			      },
		};
		console.log("----------requete ajout contact ---------");
		console.log(JSON.stringify(req.url));
		console.log("-----------------------------------------");
		return $http(req);
	};


	var extractAct = function(str){

		 var tmp = str.substr(str.indexOf("id="),str.length);
		 return tmp.substr(tmp.indexOf("=")+1,tmp.length);
	};


	  var isBuzcardUrl = function (string){
		  if(string.indexOf("http://www.2d2c.fr?id=") > -1 || string.indexOf("http://www.2D2C.me?id=") > -1 || string.indexOf("http://www.2d2c.me?id=") > -1 || string.indexOf("http://www.2D2C.fr?id=") > -1)
			  return true;
		  else
			  return false;
	  };


	  var getBuzToken = function(callBack){
		  var db = null;
    	  if (window.cordova) {
          	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
          } else {
              db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
          }

    	 var query = 'SELECT act FROM profile  ';

		  $cordovaSQLite.execute(db, query).then(function(result) {

			  return callBack((result.rows.item(0).act));

		  }, function(reason) {
			  //TODO FIXME
			  // console.log("error " + reason);
			  return 1;
		  });
//		  $.ajax({
//	          type : "GET",
//	          url : "https://www.buzcard.com/send.aspx",
//	          success : function(a, status, xhr) {
//	        	  // console.log(a);
//	            var action = $($.parseHTML(a)).filter("#form1").attr("action");
//	            // console.log(action);
//	            var arg = action.split('?');
//	            var tmp = decodeURIComponent(arg[1]);
//
//	            tmp= tmp.substr(tmp.indexOf("=")+1,tmp.length);
//
//	            callBack(tmp);
//	          },
//	          error : function(xhr, ajaxOptions, thrownError) {
//	        	  callBack("error");
//	          }
//	        });
	  };
	  
	

	var createContactFromQrCode = function(data){

		var domaine = data.email.substring(data.email.indexOf('@')+1, data.email.length);


		var contact = {
				id: parseInt(data.id),
                email : data.email,
                date: data.date,
                rendez_vous: data.rendez_vous,
                comment: data.comment,
                last_name : data.last_name,
                first_name : data.first_name,
                phone_1 : data.phone_1,
                phone_2 : data.phone_2,
                company : data.company,
                list: data.list,
                emailaddress2:data.emailaddress2,
                actu:data.actu,
                addressline1:data.addressline1,
                addressline2:data.addressline2,
                addressline3:data.addressline3,
                postalcode:data.postalcode,
                city:data.city,
                workphonenumber:data.workphonenumber,
                mobilephonenumber2:data.mobilephonenumber2,
                source:data.source,
                fonction:data.fonction,
                Link_CardOnline:data.Link_CardOnline,
                vcardprofil: 1,
                Filleul: 0,
                status : data.status,
                firstsendemail:data.firstsendemail,
                lastsendemail: data.lastsendemail,
                lastsendemailtimeStmp:toTimeStampLast(data.lastsendemail,data.alerteemailcreationdate),
                photofilelocation: data.photofilelocation,
                LanguageText : data.LanguageText,
                alerteemailcreationdate: data.alerteemailcreationdate,
                meeting_point :  data.meeting_point,
                latitude_meeting : data.latitude_meeting,
                longitude_meeting : data.longitude_meeting,
                domaine : domaine,
                synchro:false
		};

		return contact ;
	};


	var copyQrContactIntoContact = function (QrContact, DbContact){

        /******************************\
        préparation de l'objet serveur
       \******************************/
       var contactObjx = {};
       for (var key in tmpContact)
          if(contact[key] != tmpContact[key])
            contactObjx[key] =contact[key];
        contactObjx.list = newName;
        delete contactObjx.id;
        delete contactObjx.date;
        /******* end *******/


	};


	var UPDATECONTACT = function(db, contact, callBack){

		  try{

			  var updateQuery = " UPDATE contact SET  "+
			          //TODO FIXME est ce que c'est bien un timestamp ?




			  				"first_name = '"+addSlashes(contact.first_name)+"', " +
			  				"last_name  = '"+addSlashes(contact.last_name)+"', "+
			  				"email = '"+contact.email+"', "+
			  				"phone_1 ='"+contact.phone_1+"', "+
			  				"phone_2 ='"+contact.phone_2+"', "+
			  				"company ='"+addSlashes(contact.company)+"', "+
			  				"meeting_point ='"+addSlashes(contact.meeting_point)+"', "+
			  				"latitude_meeting ='"+contact.latitude_meeting+"', "+
			  				"longitude_meeting ='"+contact.longitude_meeting+"', "+
			  				"domaine ='"+contact.domaine+"', "+
			  				"rendez_vous ='"+toTimeStamp(contact.rendez_vous)+"', "+
			  				"status ='"+contact.status+"', "+
			  				"firstsendemail ='"+contact.firstsendemail+"', "+
			  				"lastsendemail ='"+contact.lastsendemail+"', "+
			  				"lastsendemailtimeStmp='"+contact.lastsendemailtimeStmp+"', "+
			  				"LanguageText ='"+contact.LanguageText+"', "+
			  			  "list ='"+addSlashes(contact.list)+"', "+
						  "LanguageText='"+contact.LanguageText+"', "+
						  "comment ='"+addSlashes(contact.comment)+"',"+
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
						  "vcardprofil ='"+contact.vcardprofil+"', "+
						  "Filleul ='"+contact.Filleul+"', "+
						  "fonction ='"+addSlashes(contact.fonction)+"', "+
			  				"alerteemailcreationdate ='"+contact.alerteemailcreationdate+"', "+
			  				"synchro ='"+contact.synchro+"'"+
			  				"where id="+contact.id+"";
			   console.warn(updateQuery);
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

	}

	/**
	   * insert a single contatc into contacts
	   */
	  var CREATECONTAT = function(db,contact,callBack) {
		  var synchro='false';
	    var insertQuery = 'INSERT INTO contact (id,rendez_vous, email, date, comment,' +
	    'last_name, first_name, phone_1, phone_2, company, '+
	    'list, status,lastsendemail, LanguageText,firstsendemail,photofilelocation,'+
	    'alerteemailcreationdate, modificationdate, meeting_point,latitude_meeting,longitude_meeting,synchro,domaine,lastsendemailtimeStmp,emailaddress2 , actu, addressline1, addressline2, addressline3, postalcode, city, workphonenumber, mobilephonenumber2, source, fonction, Link_CardOnline, Filleul, vcardprofil) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	    console.warn(insertQuery);
	   var domaine = contact.email.substring(contact.email.indexOf('@')+1, contact.email.length);
	    try {
	      var parameters = [contact.id,toTimeStamp(contact.rendez_vous),contact.email,contact.date,addSlashes(contact.comment),
	                        addSlashes(contact.last_name),addSlashes(contact.first_name),contact.phone_1,contact.phone_2,
	                        addSlashes(contact.company),addSlashes(contact.list),contact.status,contact.lastsendemail,contact.LanguageText,contact.firstsendemail,
	                        contact.photofilelocation,contact.alerteemailcreationdate,contact.modificationdate,addSlashes(contact.meeting_point),contact.latitude_meeting,contact.longitude_meeting,synchro,domaine.trim(),toTimeStampLast(contact.lastsendemail, contact.alerteemailcreationdate),addSlashes(contact.emailaddress2) , addSlashes(contact.actu), addSlashes(contact.addressline1), addSlashes(contact.addressline2), addSlashes(contact.addressline3), addSlashes(contact.postalcode), addSlashes(contact.city) , addSlashes(contact.workphonenumber) , addSlashes(contact.mobilephonenumber2) , addSlashes(contact.source) , addSlashes(contact.fonction) , addSlashes(contact.Link_CardOnline), contact.Filleul, contact.vcardprofil];
	      // console.warn(parameters);
	      $cordovaSQLite.execute(db, insertQuery,parameters).then(function(value) {
	    	   console.log("callback ok+++");
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


	  var addContatToServer = function(email, token){

		  // the request parameters
		  var request = {
	              method: 'GET',
	              url: 'https://www.buzcard.com/contacts_mobile.aspx?request=app_add',
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
	              data: {

	                  token: token,
	                  email: email,
	                  status: 2
	              }
	          };

          // the HTTP request
          return $http(request);
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

		function toTimeStampLast(datelast, dateAlert){
			var date = "";
			if(datelast ==""){
				date = dateAlert;
			}else{
				date= datelast;
			}
			try {

				var x="";
				if(date!=""){
					x= new Date(date).getTime()/1000;
				}

				// console.log('try'+x +'   '+date);
				return x;
			} catch (e) {
				// console.log(e);
				var x="";
				if(date!=""){
				var x= new Date().getTime()/1000;
				// console.log('catch '+x);
				}
				return x;
			}
		};

		function frenchToUsFormat(frenchDate) {
			try {
			console.log(frenchDate);
			if(frenchDate !=""){
				 var array1 = frenchDate.split("/");
			        return array1[1]+"/"+array1[0]+"/"+array1[2];
			}else{
				return "";
			}

			} catch (e) {
				return frenchDate ;
			}

		};

			var vitalOrVcard = function(act, callBack, errorCallBack){

				// the request parameters
				var request = {
							method: 'GET',
							url: 'https://www.buzcard.com/QR_Infos.aspx?act='+act,
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

							$http(request)
								.success(function(data, status, headers, config){
										console.warn(data);
										return callBack(data);
								}).error(function(data, status, headers, config){
									console.warn(config);
									return errorCallBack();
							});
			};

	var createTableQRcodes = function(db, callBack){
		var createQuery = 'CREATE TABLE IF NOT EXISTS qrcode ('+
	    'id INTEGER PRIMARY KEY, '+
	    'flashcodeUID text, type text, pathFile text)';
	    try {
	        $cordovaSQLite.execute(db, createQuery).then(function(value) {
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

	var emptyTableQRcodes = function(db, callBack){
		  var query ="DELETE FROM qrcode";
		    $cordovaSQLite.execute(db, query).then(function(value) {
		      return callBack();
		    }, function(reason){
		      console.log(reason);
		    }, function(value){

		    });
	}
	var insertTableQRcodes = function(db, idQRcode, type, pathFile, callBack){
		  var insertQuery = 'INSERT INTO qrcode (flashcodeUID,type, pathFile) VALUES ("'+idQRcode+'", "'+type+'", "'+pathFile+'")';
		    try {
		       console.warn(insertQuery);
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
	}

	var downloadQRcode = function (db,idQR, type, act, QR_Type, callBack){
		var isWindowsPhone = ionic.Platform.isWindowsPhone();

  	  if(window.cordova){
  		   if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                 path = cordova.file.applicationStorageDirectory;
             }else if (isWindowsPhone) {
	             path = "/";
	              } else {
                 path = cordova.file.dataDirectory;
             }
  		 var fileName = idQR+'_'+new Date().getTime()+'.png';
  		 var url = "https://www.buzcard.com/image_provider.aspx?image="+QR_Type+"&act"+act;
  		 console.log(url);
  	     cameraService.downloadFile(path, fileName, url, function (urlImage) {
  	   	// alert("-------------------"+urlImage);

  	    	insertTableQRcodes(db,idQR, type, urlImage, function(){
  	    		return callBack();
  	    	});
  	         //TODO FIXME callback if need
  	     	});
  	  }else{

	    	insertTableQRcodes(db,idQR, type, "default", function(){
	    		return callBack();
	    	});
  	  }
	};
	var downloadQRProfile = function(db,act, callBack){
		var query = "select flashcodeUID from profile ";
		  try {
			  $cordovaSQLite.execute(db, query).then(function(results) {
				  if(results.rows.length>0){
					  downloadQRcode(db,results.rows.item(0).flashcodeUID, "profil", act,"QR_Business", function(){
						  console.log("QRcode profile inserted");
						  return  callBack();
					  });
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
	var downloadQRVitale = function(db, act, callBack){
		var query = "select flashcodeUID from urgency ";
		  try {
			  $cordovaSQLite.execute(db, query).then(function(results) {
				  if(results.rows.length>0){
					  downloadQRcode(db,results.rows.item(0).flashcodeUID, "vital",act, "QR_Urgence", function(){
						  console.log("QRcode vital inserted");
						 return  callBack();
					  });
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

	var selectMesQRcodes = function(db, callBack){
		var query = "select* from qrcode ";
		  try {
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
		    }
	}
	var saveContactDeviceFlash= function(id, callBack){
		  var db = null;
    	  if (window.cordova) {
          	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
          } else {
              db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
          }
          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
              if (ionic.Platform.version() >= 6) {
           		  var permissions = window.plugins.permissions;
           		  //do we already have permissions
           		  permissions.hasPermission(function(status){
           		    if(!status.hasPermission) {
           		      //if not, warn in console
           		      var errorCallback = function() {
           		      console.log('READ_CONTACTS permission is not turned on');
           		      }
           		      //make request for permissions
           		      permissions.requestPermission(function(status) {
           		        //do we still not have permissions? user denied. Do something here
           		        if( !status.hasPermission ) errorCallback();
           		      }, function(){}, permissions.READ_CONTACTS);
           		    }else{
           		    	$rootScope.autoriseContact = true;
           		    }
           		  }, function(){}, permissions.READ_CONTACTS);
           		}
             	if (ionic.Platform.version() >= 6) {
             		  var permissions = window.plugins.permissions;
             		  //do we already have permissions
             		  permissions.hasPermission(function(status){
             		    if(!status.hasPermission) {
             		      //if not, warn in console
             		      var errorCallback = function() {
             		      console.log('READ_CONTACTS permission is not turned on');
             		      }
             		      //make request for permissions
             		      permissions.requestPermission(function(status) {
             		        //do we still not have permissions? user denied. Do something here
             		        if( !status.hasPermission ) errorCallback();
             		      }, function(){}, permissions.WRITE_CONTACTS);
             		    }else{
           		    	$rootScope.autoriseContact = true;
           		    }
             		  }, function(){}, permissions.WRITE_CONTACTS);
             		}
             	if (ionic.Platform.version() >= 6) {
           		  var permissions = window.plugins.permissions;
           		  //do we already have permissions
           		  permissions.hasPermission(function(status){
           		    if(!status.hasPermission) {
           		      //if not, warn in console
           		      var errorCallback = function() {
           		      console.log('READ_CONTACTS permission is not turned on');
           		      }
           		      //make request for permissions
           		      permissions.requestPermission(function(status) {
           		        //do we still not have permissions? user denied. Do something here
           		        if( !status.hasPermission ) errorCallback();
           		      }, function(){}, permissions.GET_ACCOUNTS);
           		    }else{
           		    	$rootScope.autoriseContact = true;
           		    }
           		  }, function(){}, permissions.GET_ACCOUNTS);
           		}
     }

        ContactsService.getContactbyId(db, id, function(result) {
           contact = result.rows.item(0);
           console.log(JSON.stringify(contact));
           emailToSearchFor = contact.email;
  		 phone_1ToSearchFor = contact.phone_1;
  			 if(phone_1ToSearchFor ==''){
          	  phone_1ToSearchFor = contact.phone_2;
          		  }
		ContactsService.searchContactInDevice(emailToSearchFor, phone_1ToSearchFor, function(resu) {
			  if (resu == "") {
				  if(contact.email=="" &&  contact.phone_1==""){
					  return callBack();
				  }else{
                  ContactsService.saveContactInTel(contact, function() {
                	 return callBack();

                  });
				  }
              } else {
            	   ContactsService.updateContactDevice(ContactsService.sortContactDevice(resu), contact,{email: contact.email,phone_1: contact.phone_1, phone_2:contact.phone_2}, function() {
            		   return callBack();
            	   });

		}
		},function(){
			 return callBack();
       });
        });
	};
	
	  var  getMeetingPoint = function(db,contact, callBack){
	    	cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status) {
	            //	alert('Location premission '+status);

	            ContactsService.geolocalicationAdress(db, contact, function(adress) {
	            
	              if (contact.meeting_point != $translate.instant('No-place') && contact.meeting_point != $translate.instant('No-place-GPS')) {
	               
	            	   ContactsService.updateContactByField(db, "meeting_point", addSlashes(adress), contact.id, function() {
	            		   return callBack();
	                  });

	               
	              }else{
	            	  return callBack();
	              }

	            });
	          }, function(error) {
	        	  return callBack();
	        
	          });
	    };
	    var CreateRequestContact = function(db, callBack){
	    	  var id = new Date().getTime();
			    ContactsService.createContactDB(db, id, function(res) {
			      SynchroServices.insertRequest(db, "CONTACTCREATE", {
			        idTmp: id,
			      }, function(rs) {

			        localStorage.setItem("idTmpEncours", rs.insertId);
			        ContactsService.updateContactByField(db, "photofilelocation", "img/photo_top_title.jpg", id, function() {
			          ContactsService.updateContactByField(db, "status", "not_selected", id, function() {
			          ContactsService.updateContactByField(db, "vcardprofil", "1", id, function() {
			          ContactsService.updateContactByField(db, "Filleul", "0", id, function() {
			          //  var first_name = ($translate.use() == "fr") ? 'Photo à traiter' : "Picture to be processed" ;
                      ContactsService.updateContactByField(db, "email", $translate.instant('loading.data'), id, function () {
                          ContactsService.updateContactByField(db, "date", moment().unix(), id, function () {
                            ContactsService.updateContactByField(db, "alerteemailcreationdate", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'), id, function () {
                              ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime()/1000, id, function () {

                                return callBack(id);
                              })
                            });
                          });
                    });
                  });
			          });//
			          });//
			        });
			      });
			    });
	    };
	    var checkBuzcardSendAFterBuz= function(db, contactid, act,callBack){
	    	console.log(contactid);
	    	SynchroServices.selectBuzcardSendById(db, act,function(res){
	    		 console.log(res.rows.length);
	    		  var rdv = "";
		          var langue = navigator.language.substring(0,2);
		          var tradEmailContent="";
		          console.log("------"+langue+"-----");
	    		if(res.rows.length > 0){
	    			console.warn(contactid);
	    			
	    		      ContactsService.getContactbyId(db, contactid, function(result) {
	    		        
	    		          BuzcardService.selectEmailTradBylangue(db, langue, function(resultSet){

	    		          	   if (resultSet.rows.length > 0) {
	    		          		   tradEmailContent = removeSlashes(resultSet.rows.item(0).textemail)+'\n'+$rootScope.nomComplet;
	    		          		   console.log(tradEmailContent);
	    		          	   }else{
	    		          		   tradEmailContent="Hello, You will find enclosed herewith my contact details in vCard format to be registered in just one click in your address book (Phone, PC/Mac). You will receive another contact card in case of updates. Best regards.";

	    		          	   }

	    		          if (result.rows.item(0).rendez_vous != "") {
	    		            rdv = $filter('date')(new Date(result.rows.item(0).rendez_vous * 1000), 'MM/dd/yyyy')
	    		          } else {
	    		            rdv = $filter('date')(new Date(), 'MM/dd/yyyy')
	    		          }
	    		          var Rid = parseInt(new Date().getTime() / 1000);

	    		          var object = {
	    		            email: result.rows.item(0).email,
	    		            selectLang: langue,
	    		            checkFollower: "on",
	    		            sendMobile:1,
	    		            dateRDV: rdv,
	    		            tradEmailContent : addSlashes(tradEmailContent),
	    		            idTmp: result.rows.item(0).id,
	    		            Rid:Rid
	    		          };

	    		  	     console.log(JSON.stringify(object));
	    		          SynchroServices.insertRequest(db, "BUZCARDSEND", object, function() {
	    		        	   SynchroServices.deleteRequest(db,res.rows.item(0).id,function(){
	    		        	  return callBack();
	    		        	   });
	    		            }, function() {
	    		           
	    		              MenuService.setLocalStorage('ReloadContactList', 1);
	    		            
		    		        	  return callBack();
		    		        	
	    		            });

	    		          });



	    		          });
	    		}else{
	    			return callBack();
	    		}
	    		
	    	}); 
	    };
	    
	    var checkSendAFterBuz = function(db, act,callBack){
	    	SynchroServices.selectBuzcardSendById(db, act,function(res){
	    		 console.log(res.rows.length);
	    		 if(res.rows.length >0){
	    			   SynchroServices.deleteRequest(db,res.rows.item(0).id,function(){
	    		        	  return callBack();
	    		        	   });
	    		 }else{
	    			 return callBack();
	    		 }
	    	});
	    }

	return {

		getCardInfoFromQrCode : getCardInfoFromQrCode,
		extractAct : extractAct,
		isBuzcardUrl : isBuzcardUrl,
		createContactFromQrCode : createContactFromQrCode,
		copyQrContactIntoContact : copyQrContactIntoContact,
		UPDATECONTACT  : UPDATECONTACT,
		CREATECONTAT : CREATECONTAT,
		addContatToServer : addContatToServer,
		getBuzToken : getBuzToken,
		vitalOrVcard : vitalOrVcard,
		createTableQRcodes:createTableQRcodes,
		emptyTableQRcodes:emptyTableQRcodes,
		insertTableQRcodes:insertTableQRcodes,
		downloadQRcode:downloadQRcode,
		downloadQRProfile:downloadQRProfile,
		downloadQRVitale:downloadQRVitale,
		selectMesQRcodes:selectMesQRcodes,
		saveContactDeviceFlash:saveContactDeviceFlash,
		getMeetingPoint:getMeetingPoint,
		CreateRequestContact:CreateRequestContact,
		checkBuzcardSendAFterBuz:checkBuzcardSendAFterBuz,
		checkSendAFterBuz:checkSendAFterBuz


	}
}]);
