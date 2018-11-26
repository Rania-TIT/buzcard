appContext.factory("BuzcardService", ['$http', '$cordovaSQLite','cameraService','$cordovaFile','MenuService','$rootScope','$q', function($http, $cordovaSQLite, cameraService,$cordovaFile,MenuService,$rootScope,$q ) {
  /**
   * get profile info from server
   */
  var getProfil = function() {
	  var dateSynchronisation = MenuService.getLocalStorage("dateSynchronisation");
	  var url="";
	  if(dateSynchronisation !=false){
		url= 'https://www.buzcard.com/virtual_card_mobile.aspx?request=virtual_card'
	  }else{
		url = 'https://www.buzcard.com/virtual_card_mobile.aspx?request=virtual_card';
	  }
    // the request parameters
      var getProfilRequest = {
      method: 'POST',
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'

      },
      transformRequest: function(obj) {
        var str = [];
        for ( var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      transformResponse: function(data) {
        var x2js = new X2JS();
        var json = x2js.xml_str2json(data);
        return json;
      },
//      timeout: 4000,

    };
      // console.log('url profil -------'+url);
    // the HTTP request
    return $http(getProfilRequest);
  };

   /**
   * create if not exist a profile table
   */
  var createProfileTable = function (db,callBack){

    try {

      var createQuery = 'CREATE TABLE  IF NOT EXISTS  profile ('+
      'id integer primary key UNIQUE, '+
      'first_name text, last_name text, birthdate text, company text, '+
      'position text, network text, email text,email_2 text, mobile_1 text,mobile_2 text, '+
      'landline_1 text, landline_2 text, fax text, address_line_1 text, address_line_2 text, '+
      'address_line_3 text, postal_code text, facebook text, twitter text, flickr text, '+
      'linkedin text, viadeo text, website text, skype text, xing text, myspace text, '+
      'delicious text, rss text, link_1 text, link_title_1 text, link_2 text,' +
      'link_title_2 text, link_3 text, link_title_3 text, link_4 text,  link_title_4 text, '+
      'news_1 text, news_2 text, news_3 text, city text, country text,  foursquare text, '+
      'googleplus text, pinterest text, photolocation text, address_p_line_1 text,  '+
      'address_p_line_2 text, address_p_line_3 text, postal_code_p text, city_p text, instagram text,youtube text,snapchat text,flashcodeUID text,act text)';

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
   * empty the profile table
   */
  var emptyProfileTable = function(db,callBack){

    var query ="DELETE FROM profile";
    $cordovaSQLite.execute(db, query).then(function(value) {
      return callBack();
    }, function(reason){
      // console.log(reason);
    }, function(value){

    });
  };
  /**
   * INSERT OR REPLACE INTO profile
   */
  var insertIntoProfile = function(db,profil,callBack){
    try {

      var query = 'INSERT INTO profile (id, first_name, last_name, birthdate, company , '+
      'position , network , email , mobile_1 ,mobile_2 , '+
      'landline_1 , landline_2 , fax , address_line_1 , address_line_2 , '+
      'address_line_3 , postal_code , facebook , twitter , flickr , '+
      'linkedin , viadeo , website , skype , xing , myspace , '+
      'delicious , rss , link_1 , link_title_1 , link_2 ,' +
      'link_title_2 , link_3 , link_title_3 , link_4 , link_title_4 , '+
      'news_1 , news_2 , news_3 , city , country , foursquare , '+
      'googleplus , pinterest,photolocation, address_p_line_1 ,  '+
      'address_p_line_2, address_p_line_3, postal_code_p, city_p, instagram,youtube,snapchat,email_2,flashcodeUID,act) VALUES'+
      '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      var params = [profil.id, profil.first_name, profil.last_name,
                    profil.birthdate , addSlashes(profil.company) , addSlashes(profil.position) , addSlashes(profil.network) ,
                    profil.email , profil.mobile_1 ,profil.mobile_2 ,
                    profil.landline_1 , profil.landline_2 , profil.fax ,
                    addSlashes(profil.address_line_1) , addSlashes(profil.address_line_2) ,
                    addSlashes(profil.address_line_3) , profil.postal_code , profil.facebook ,
                    profil.twitter , profil.flickr ,
                    profil.linkedin , profil.viadeo , profil.website , profil.skype ,
                    profil.xing , profil.myspace ,
                    profil.delicious , profil.rss ,addhttp( profil.link_1) , profil.link_title_1 ,
                    addhttp( profil.link_2) ,
                    profil.link_title_2 , addhttp( profil.link_3) , profil.link_title_3 ,
                    addhttp( profil.link_4) , profil.link_title_4 ,
                    addSlashes(profil.news_1) , addSlashes(profil.news_2) , addSlashes(profil.news_3) , profil.city ,
                    profil.country , profil.foursquare ,
                    profil.googleplus , profil.pinterest, profil.photofilelocation, profil.address_p_line_1, profil.address_p_line_2,
                    profil.address_p_line_3, profil.postal_code_p, profil.city_p, profil.instagram, profil.youtube, profil.snapchat, profil.email_2, profil.flashcodeUID, profil.act ];

      $cordovaSQLite.execute(db, query, params).then(function(value) {
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
   * SELECT profile from Db local
   */
  var selectProfile = function(db, callBack){
    try {

      var query = 'SELECT * FROM profile';
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

  };
  /**
   * SELECT user from Db local
   */
  var selectUser = function(db, callBack){
	  try {

		  var query = 'SELECT * FROM identifiant ';
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

  };

  /**
   * update profil Db local
   */
  var updateProfil = function(db, profil, callBack){

    try {

        var query = 'UPDATE  profile SET '+
        'first_name ="'+profil.first_name+'" ,'+
        'last_name="'+profil.last_name+'" ,'+
        'birthdate ="'+profil.birthdate+'" ,'+
        'company  ="'+addSlashes(profil.company)+'" ,'+
        'position ="'+addSlashes(profil.position)+'" ,'+
        'network ="'+addSlashes(profil.network)+'" ,'+
        'email_2 ="'+profil.email_2+'" ,'+
        'mobile_1 ="'+profil.mobile_1+'" ,'+
        'mobile_2 ="'+profil.mobile_2+'" ,'+
        'landline_1 ="'+profil.landline_1+'" ,'+
        'landline_2 ="'+profil.landline_2+'" ,'+
        'fax  ="'+profil.fax+'" ,'+
        'address_line_1  ="'+addSlashes(profil.address_line_1)+'" ,'+
        'address_line_2  ="'+addSlashes(profil.address_line_2)+'" ,'+
        'address_line_3  ="'+addSlashes(profil.address_line_3)+'" ,'+
        'postal_code  ="'+addSlashes(profil.postal_code)+'" ,'+
        'facebook  ="'+addSlashes(profil.facebook)+'" ,'+
        'twitter ="'+addSlashes(profil.twitter)+'" ,'+
        'flickr ="'+addSlashes(profil.flickr)+'" ,'+
        'linkedin ="'+addSlashes(profil.linkedin)+'" ,'+
        'viadeo ="'+addSlashes(profil.viadeo)+'" ,'+
        'website ="'+addSlashes(profil.website)+'" ,'+
        'skype ="'+addSlashes(profil.skype)+'" ,'+
        'xing ="'+addSlashes(profil.xing)+'" ,'+
        'myspace ="'+addSlashes(profil.myspace)+'" ,'+
        'delicious ="'+addSlashes(profil.delicious)+'" ,'+
        'rss ="'+addSlashes(profil.rss)+'" ,'+
        'link_1 ="'+addhttp( profil.link_1)+'" ,'+
        'link_title_1  ="'+addSlashes(profil.link_title_1)+'" ,'+
        'link_2  ="'+addhttp( profil.link_2)+'" ,'+
        'link_title_2 ="'+addSlashes(profil.link_title_2)+'" ,'+
        'link_3 ="'+addhttp( profil.link_3)+'" ,'+
        'link_title_3  ="'+addSlashes(profil.link_title_3)+'" ,'+
        'link_4 ="'+addhttp( profil.link_4)+'" ,'+
        'link_title_4  ="'+(profil.link_title_4)+'" ,'+
        'news_1 ="'+addSlashes(profil.news_1)+'" ,'+
        'news_2 ="'+addSlashes(profil.news_2)+'" ,'+
        'news_3 ="'+addSlashes(profil.news_3)+'" ,'+
        'city ="'+addSlashes(profil.city)+'" ,'+
        'country ="'+addSlashes(profil.country)+'" ,'+
        'foursquare ="'+addSlashes(profil.foursquare)+'" ,'+
        'googleplus ="'+addSlashes(profil.googleplus)+'" ,'+
        'pinterest ="'+addSlashes(profil.pinterest)+'" , '+
        'address_p_line_1 ="'+addSlashes(profil.address_p_line_1)+'" , '+
        'address_p_line_2 ="'+addSlashes(profil.address_p_line_2)+'" , '+
        'address_p_line_3 ="'+addSlashes(profil.address_p_line_3)+'" , '+
        'postal_code_p ="'+addSlashes(profil.postal_code_p)+'" , '+
        'city_p ="'+addSlashes(profil.city_p)+'" , '+
        'instagram ="'+addSlashes(profil.instagram)+'", '+
        'youtube ="'+addSlashes(profil.youtube)+'", '+
        'snapchat ="'+addSlashes(profil.snapchat)+'", '+
        'flashcodeUID="'+profil.flashcodeUID+'", '+
        'act="'+profil.act+'" '+
        'where id ='+profil.id;

        $cordovaSQLite.execute(db, query).then(function(results){

          callBack(profil); //TODO FIXME cette variable contient <img id="profil"> !! normale
        }, function(reason) {
             console.log(reason);
            return 1;
        }, function(value) {

         console.log(value);
         return 1;
        });

        return 0;
      } catch (e) {
        // console.log(e);
        return 1;
      }
  };
  /**
   * download photo profil
   */
  var downloadPhotoProfil = function(db,photolocation, id,callBack) {

      var isWindowsPhone = ionic.Platform.isWindowsPhone();

    	  if(window.cordova){
    		   if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                   path = cordova.file.applicationStorageDirectory;
               }else if (isWindowsPhone) {
  	             path = "/";
	              } else {
                   path = cordova.file.dataDirectory;
               }
       deleteAncienPhoto(db,id,function() {
    	var fileName = id+'_'+new Date().getTime()+'.jpg';
    //// alert("---"+photolocation+"---");
        if(photolocation =="" || photolocation ==null || photolocation =="null"){
        callBack("img/photo_top_title.jpg");
        	  }else{


	 var url = "https://www.buzcard.com/" + photolocation.substr(2);
     cameraService.downloadFile(path, fileName, url, function (urlImage) {
   	  updatePhotoFileLocation(db, urlImage, id, function(){
   		 callBack(urlImage);
   	  });

         //TODO FIXME callback if need
     	});
        	  }
          });
      }else{
    		 callBack("img/photo_top_title.jpg");
    	 }



    };

    var getACT = function(callBack){

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
			  return 1;
		  });
	  };
    /**
     * send buzcard to server
     */
  var sendBuzcardToServer = function(email, selectLang, checkFollower, sendMobile, dateRDV, tradEmailContent,Rid, callBack, errorCallBack) {

var db=null;
      if (window.cordova) {
      	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
      } else {
          db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
      }
    var data = "TextBox_Mail=" + email + "&EmailLanguageDropDownList=" + selectLang + "&CheckBox1=" + checkFollower + "&DateRDV=" + dateRDV + "&VcardProfil=" + sendMobile+"&RID="+Rid;
    console.log(data);
    selectProfile(db, function(resultProfile){
    	
    selectEmailTradBylangue(db, selectLang, function(result){
    	//console.log(result.rows.item(0).textemail);
    	var textinit="";
    	if(result.rows.length >0)  textinit = result.rows.item(0).textemail+'\n'+resultProfile.rows.item(0).first_name+" "+resultProfile.rows.item(0).last_name;
    if( textinit == tradEmailContent){
    		  console.log("sansFichier");
    		 getACT(function(act) {
    			   var url = "https://www.buzcard.com/Vcard_Send_mobile.aspx?act=" + act + "&Click=OK&" + data;
                   
    			 var request = {
    			          url :url,
    			          method : "POST",
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
              
              
                 $http(request).success(function(response) {
                	 console.log(response);
                	 if(response.answer.contact_id !=null){
                		 return callBack(response.answer.contact_id.contact);
                	 }else{
                		  errorCallBack(status);
                	 }
                	
                    
                 
                 }).error(function(data, status, headers, config) {
                     errorCallBack(status);
                 });


             });
    		 
    	}else{
    		
    
            getACT(function(act) {
                var url = "https://www.buzcard.com/Vcard_Send_mobile.aspx?act=" + act + "&Click=OK&" + data;
                var formData = new FormData();
                var blob = new Blob([removeSlashes(tradEmailContent)], {type: "text/plain"});
                var filename="txtfile.txt";

                formData.append('txtfile', blob,filename);
                $http.post(url, formData, {
                    withCredentials: false,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                    transformResponse: function(data) {
                        var x2js = new X2JS();
                        var json = x2js.xml_str2json(data);
                        return json
                    }
                }).then(function(response) {
                    return callBack(response.data.answer.contact_id.contact);
                }, function(err) {
                    return errorCallBack(err);
                });


            });
    	}
    });
    });

};


    /**
     *   update profil server
     */
    var updateProfilServer = function(i, profil,callBack,errorCallBack){
      // TODO FIXME envoyer seullement les champs modifiée !!
       var length =0;
       for(j in profil){
         if(length == i)   key = j;
         length++;
       }
     // the send request parameters
      var request = {
        method: 'POST',
        url: 'https://www.buzcard.com/virtual_card.aspx?request=update',
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
          update:makeXml(key,removeSlashes(profil[key])),

        },
//        timeout : 4000,
      };
      $http(request).success(function(data, status, headers, config) {
        if(i != (length-1)){
          i++;
          updateProfilServer(i, profil,callBack,errorCallBack);
        }else{
          callBack(data);
        }
      }).error(function(data, status, headers, config) {
        errorCallBack(status);
      });
    };

    /**
     * upload photo de profil buzcard
     */
    var uploadPhotoProfil = function (path, callBack, errorCallBack) {

        var isWindowsPhone = ionic.Platform.isWindowsPhone();


            var fileName = path.substr(path.lastIndexOf('/') + 1);
            var pathFile = path.substr(0, path.lastIndexOf('/') + 1);

            // the send request parameters
            var request = {
                method: 'POST',
                url: 'https://www.buzcard.com/virtual_card.aspx?request=update',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                transformResponse: function (data) {
                    var x2js = new X2JS();
                    var json = x2js.xml_str2json(data);
                    return json;
                },
                data: {
                    update: "<update><photofilelocation>" + fileName + "</photofilelocation></update>",

                },
//                timeout: 10000,
            };
            $http(request).success(function (data, status, headers, config) {

                 console.warn(' success ' + JSON.stringify(data));
                $cordovaFile.readAsArrayBuffer(pathFile, fileName).then(function (success) {
                    // success
                    // console.warn("success");

                    var fd = new FormData();
                    var image = new Uint8Array(success);
                    fd.append('photo', new Blob([image], {
                        type: 'image/jpeg'
                    }), fileName);

                    $http.post("https://www.buzcard.com/virtual_card.aspx?request=update_portrait", fd, {
                        transformRequest: angular.identity,
                        headers: {
                            'Content-Type': undefined
                        }
                    }).success(function (data, status, headers, config) {
                            // console.log('success upload ...');
                             console.warn(JSON.stringify(data));
                            callBack();

                        })
                        .error(function (err) {
                        	   console.warn(JSON.stringify(err));
                            errorCallBack();
                        });
                }, function (error) {
                    // error
                	  console.warn(JSON.stringify(error));
                    errorCallBack();
                });
            });

  };

  /**
   * get custo file
   */
  var getCustoFile = function(db,callBack) {
	  //result.rows.item(0).id
	  var  d = new Date();
	  selectUser(db,function(result){
		    // the request parameters
	      var request = {
	      method: 'GET',
	      url: "https://www.buzcard.com/upload/"+result.rows.item(0).userId+"/"+result.rows.item(0).userId+".txt?"+d.getTime(),
	      transformResponse: function(data) {
	        var array = data.split("|");
	        return array;
	      },
	    };
	   // the HTTP request
		 $http(request).success(function(data, status, headers, config) {
			  console.log('getCustoFile   '+ JSON.stringify(data));
				return callBack(data);

			}).error(function(data, status, headers, config) {
             return callBack(status);
			});
	  });


  };


  /**
   * download photo custo
   */
  var downloadPhotoCusto= function(photolocation, id, callBack) {
      var isWindowsPhone = ionic.Platform.isWindowsPhone();
      console.log(photolocation);
          if (window.cordova) {
              cameraService.createPath(id, function(path) {
                  if (photolocation != "") {
                      var url = photolocation;
                      cameraService.downloadFile(path, 'newHeader.png', url, function(urlImage) {
                          // console.warn("new header img :" + urlImage);
                          MenuService.setLocalStorage("imgCusto", urlImage);
                          return callBack(urlImage);
                      });
                  } else {
                      callBack("img/buzcard-online.png");
                  }

              });
          } else {
//        	  MenuService.setLocalStorage("imgCusto", "img/orange-logo-buz.png");
            callBack("img/buzcard-online.png");
//            return callBack("img/orange-logo-buz.png");
          }

  };
  var updatePhotoFileLocation = function(db, urlImage, id, callBack){

  var updateQuery = "UPDATE profile SET photolocation = '"+urlImage+"' where id='"+id+"'";

      // console.warn(updateQuery);
      $cordovaSQLite.execute(db, updateQuery).then(function(result){
        return callBack();
      }, function (err) {
        // console.error(err);
      });
  };

  var selectFileLocation = function(db,id, callBack){
	  try {

	        var query = "SELECT photolocation FROM profile where  id='"+id+"'";
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
  var deleteAncienPhoto = function(db, id,callBack){
	  selectFileLocation(db, id, function(result){
		//  alert(JSON.stringify(result.rows.item(0)));
		 cameraService.deleteFile(result.rows.item(0).photolocation+'.jpg',function(){
			callBack();
		 }) ;
	  });
  }

  var TestIfExistColumns = function(db,callBack){
	 var version = window.localStorage.getItem('VersionApp');
	 //alert(version+' '+$rootScope.versionApp);
	 if(version == $rootScope.versionApp){
		 callBack(true);
	 }else{

		 //alert("versionApp "+window.localStorage.getItem('VersionApp'));
		 callBack(false);
	 }
  	};
  var DropTableProfile = function(db, callBack){
	  var query ="Drop table IF EXISTS profile  ";
	    $cordovaSQLite.execute(db, query).then(function(value) {
	      return callBack();
	    }, function(reason){
	      // console.log(reason);
	    }, function(value){

	    });
  	};
  	 var DropTableTradEmail = function(db, callBack){
  		  var query ="Drop table IF EXISTS  tradEmail ";
  		    $cordovaSQLite.execute(db, query).then(function(value) {
  		      return callBack();
  		    }, function(reason){
  		      // console.log(reason);
  		    }, function(value){

  		    });
  	  	};

    var createEmailTradTable = function(db, callBack){
  try {

    var createQuery = 'CREATE TABLE  IF NOT EXISTS  tradEmail ('+
    'languageid integer primary key UNIQUE, '+
    'lcid integer,languagename text, originalname text,languagecode text, readdirection text, textemail text,listindex text)';

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
}

var getEmailTrad = function(act){
  // the request parameters
    var request = {
    method: 'GET',
    url: "https://www.cardonline.buzcard.com/buzcardsendEmails_test.aspx?act="+act+"&request=Emails",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'

    },
    transformRequest: function(obj) {
      var str = [];
      for ( var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      return str.join("&");
    },
    transformResponse: function(data) {
      var x2js = new X2JS();
      var json = x2js.xml_str2json(data);
      return json;
    },

  };
  // the HTTP request
  return $http(request);
}

var insertIntoEmailTradTable = function (db, tradEmailArray,callBack ) {
  emptyEmailTradTable(db).then(function(){
    var insertQuery = "INSERT INTO tradEmail " + " SELECT '" +
      tradEmailArray[0].languageid + "' AS 'languageid', '" +
      tradEmailArray[0].lcid + "' AS 'lcid', '" +
      addSlashes(tradEmailArray[0].languagename) + "' AS 'languagename','" +
      addSlashes(tradEmailArray[0].originalname) + "' AS 'originalname','" +
      tradEmailArray[0].languagecode + "' AS 'languagecode','" +
      tradEmailArray[0].readdirection + "' AS 'readdirection','" +
      addSlashes(tradEmailArray[0].textemail) + "' AS 'textemail','"+
      tradEmailArray[0].listindex+ "'AS 'listindex'";

    for (var j= 1; j < tradEmailArray.length; j++) {
      insertQuery = insertQuery + "  UNION SELECT '"
          + tradEmailArray[j].languageid + "','"
          + tradEmailArray[j].lcid + "','"
          + addSlashes(tradEmailArray[j].languagename) + "','"
          + addSlashes(tradEmailArray[j].originalname) + "','"
          + tradEmailArray[j].languagecode + "','"
          + tradEmailArray[j].readdirection + "','"
          + addSlashes(tradEmailArray[j].textemail) + "','"
          +tradEmailArray[j].listindex+"'";
    }
    $cordovaSQLite.execute(db, insertQuery).then(function(value) {
      return callBack();
    }, function(reason){
       console.log(reason);
    }, function(value){
    	console.log(value);
    });
     },function(){

     });

}

var emptyEmailTradTable = function(db) {
    var deffered = $q.defer();
    var createQuery = 'DELETE  FROM tradEmail';

    $cordovaSQLite.execute(db, createQuery).then(function(value) {
        deffered.resolve();

    }, function(reason) {
        deffered.reject()
    });

    return deffered.promise;
}

var selectEmailTrad = function(db,callBack){

  var selectQuery = "SELECT * FROM tradEmail ORDER BY cast(listindex as unsigned)";
  $cordovaSQLite.execute(db, selectQuery).then(function(resultSet) {
    return callBack(resultSet);
  }, function(reason){
    // console.log(reason);
  }, function(value){

  });
}

var selectEmailTradBylangue = function(db,lang, callBack){

	  var selectQuery = "SELECT * FROM tradEmail where languagecode='"+lang+"'";
	  console.log(selectQuery);
	  $cordovaSQLite.execute(db, selectQuery).then(function(resultSet) {
	    return callBack(resultSet);
	  }, function(reason){
	    // console.log(reason);
	  }, function(value){

	  });
	}

var selectEmailTradBylangueName = function(db,lang, callBack){

	  var selectQuery = "SELECT * FROM tradEmail where ='"+lang+"'";
	  $cordovaSQLite.execute(db, selectQuery).then(function(resultSet) {
	    return callBack(resultSet);
	  }, function(reason){
	    // console.log(reason);
	  }, function(value){

	  });
	}
  /**
     * the factory returns
     */
  return {
    getProfil : getProfil,
    createProfileTable : createProfileTable,
    insertIntoProfile :insertIntoProfile,
    emptyProfileTable: emptyProfileTable,
    selectProfile: selectProfile,
    updateProfil: updateProfil,
    downloadPhotoProfil:downloadPhotoProfil,
    sendBuzcardToServer : sendBuzcardToServer,
    updateProfilServer : updateProfilServer,
    uploadPhotoProfil : uploadPhotoProfil,
    getCustoFile : getCustoFile,
    downloadPhotoCusto :downloadPhotoCusto,
    updatePhotoFileLocation:updatePhotoFileLocation,
    selectFileLocation:selectFileLocation,
    deleteAncienPhoto:deleteAncienPhoto,
    TestIfExistColumns:TestIfExistColumns,
    DropTableProfile:DropTableProfile,
    getACT:getACT,
    createEmailTradTable : createEmailTradTable,
    getEmailTrad : getEmailTrad,
    insertIntoEmailTradTable : insertIntoEmailTradTable,
    selectEmailTrad : selectEmailTrad,
    emptyEmailTradTable : emptyEmailTradTable,
    selectEmailTradBylangue:selectEmailTradBylangue,
    DropTableTradEmail:DropTableTradEmail,
    selectEmailTradBylangueName:selectEmailTradBylangueName

  };
}]);
//make an xml  of the given parameter
function makeXml(key,value){
 return "<update><"+key+">"+value+"</"+key+"></update>";
};
//Check if a string starts with http using
function addhttp(url) {
   if (!/^(f|ht)tps?:\/\//i.test(url) && ""!= url) {
      url = "http://" + url;
   }
   return url;
};
