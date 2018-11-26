appContext.factory("UrgencyService", ['$http', '$cordovaSQLite','cameraService','$cordovaFile','MenuService','$cordovaGeolocation', function($http, $cordovaSQLite,cameraService,$cordovaFile,MenuService, $cordovaGeolocation ) {
  /**
   * get carde info from server
   */
  var getUrgency = function() {

		url = 'https://www.buzcard.com/vitale_card.aspx?request=vitale_card';

    // the request parameters
      var getcardRequest = {
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

    // the HTTP request
    return $http(getcardRequest);
  };

  var getUrgencyEdited = function() {

	  var dateSynchronisation = MenuService.getLocalStorage("dateSynchronisation");
	  var url="";
	  if(dateSynchronisation !=false){
		url= 'https://www.buzcard.com/vitale_card.aspx?request=vitale_card' ;
	  }else{
		  url = 'https://www.buzcard.com/vitale_card.aspx?request=vitale_card';
	  }


  // the request parameters
    var getcardRequest = {
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
//    timeout: 4000,

  };

  // the HTTP request
  return $http(getcardRequest);
};

   /**
   * create if not exist a urgency table
   */
  var createUrgencyTable = function (db,callBack){

    try {

      var createQuery = 'CREATE TABLE  IF NOT EXISTS  urgency ('+
      'id integer primary key UNIQUE, '+
      'first_name text, last_name text, familynumber1 text, familynumber2 text, '+
      'familynumber3 text, doctornumber text, specalistenumber1 text, specalistenumber2 text,pathology text, '+
      'treatment text, allergies text, blood_group text, organ_donation text, first_aid text, '+
      ' link_1 text, link_title_1 text, link_2 text,' +
      'link_title_2 text, link_3 text, link_title_3 text, link_4 text,  link_title_4 text, '+
      'antecedents text, social_welfare_number text, insurance text, insurance_number text, mutual text,  mutual_number text, '+
      'photofilelocation text, comment1 text, comment2 text, pathology2 text, treatment2 text, antecedents2 text,'+
      'allergies2 text,risk_sports text, familyname1 text, familyname2 text, familyname3 text , familyemail1 text, '+
      'familyemail2 text, familyemail3 text, doctorname text, doctoreamail text, contact_lens text, birthday_year text,flashcodeUID text, sex text,height text, weight text, country text, schedule_of_benefits text, limits_and_exclusions text )';

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
   * empty the urgency table
   */
  var emptyUrgencyTable = function(db,callBack){

    var query ="DELETE FROM urgency";
    $cordovaSQLite.execute(db, query).then(function(value) {
      return callBack();
    }, function(reason){
      // console.log(reason);
    }, function(value){

    });
  };

  /**
   * INSERT OR REPLACE INTO urgency
   */
  var insertIntoUrgency = function(db,card,callBack){
    try {

      var query = 'INSERT INTO urgency (id,first_name, last_name, familynumber1, familynumber2, '+
      'familynumber3, doctornumber, specalistenumber1, specalistenumber2 ,pathology , '+
      'treatment, allergies, blood_group, organ_donation, first_aid, '+
      ' link_1, link_title_1, link_2,link_title_2, link_3, link_title_3, link_4,  link_title_4, '+
      'antecedents, social_welfare_number, insurance, insurance_number, mutual,  mutual_number, '+
      'photofilelocation, comment1, comment2, pathology2, treatment2, antecedents2,'+
      'allergies2, risk_sports, familyname1, familyname2, familyname3, familyemail1,'+
      'familyemail2, familyemail3, doctorname, doctoreamail, contact_lens, birthday_year,flashcodeUID, sex, height,weight,country ,schedule_of_benefits, limits_and_exclusions   ) VALUES'+
      '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
      var params = [card.id, card.first_name, card.last_name,
                    card.familynumber1 , card.familynumber2 , card.familynumber3 ,card.doctornumber ,
                    card.specalistenumber1 , card.specalistenumber2 , card.pathology ,
                    card.treatment,card.allergies, card.blood_group, card.organ_donation , card.first_aid ,
                    addhttp( card.link_1) , card.link_title_1 ,
                    addhttp( card.link_2) ,
                    card.link_title_2 , addhttp( card.link_3) , card.link_title_3 ,
                    addhttp( card.link_4) , card.link_title_4 ,
                    addSlashes(card.antecedents) , addSlashes(card.social_welfare_number) , addSlashes(card.insurance) , card.insurance_number ,
                    card.mutual , card.mutual_number ,
                    card.photofilelocation , card.comment1, card.comment2, card.pathology2, card.treatment2, card.antecedents2,
                    card.allergies2, card.risk_sports, card.familyname1, card.familyname2, card.familyname3, card.familyemail1,
                    card.familyemail2, card.familyemail3, card.doctorname, card.doctoreamail, card.contact_lens, card.birthday_year, card.flashcodeUID,
                    card.sex, card.height, card.weight, card.country, addSlashes(card.schedule_of_benefits), addSlashes(card.limits_and_exclusions)];

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
   * SELECT carde from Db local
   */
  var selectUrgency = function(db, callBack){
    try {

      var query = 'SELECT * FROM urgency';
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
   * update card urgency en local
   */
  var updateUrgency = function(db, card, callBack){

	  try {

	        var query = 'UPDATE  urgency SET '+
	        'first_name ="'+card.first_name+'" ,'+
	        'last_name="'+card.last_name+'" ,'+
	        'familynumber1 ="'+card.familynumber1+'" ,'+
	        'familynumber2  ="'+card.familynumber2+'" ,'+
	        'familynumber3 ="'+card.familynumber3+'" ,'+
	        'doctornumber ="'+card.doctornumber+'" ,'+
	        'specalistenumber1 ="'+card.specalistenumber1+'" ,'+
	        'specalistenumber2 ="'+card.specalistenumber2+'" ,'+
	        'pathology ="'+addSlashes(card.pathology)+'" ,'+
	        'treatment ="'+addSlashes(card.treatment)+'" ,'+
	        'allergies ="'+addSlashes(card.allergies)+'" ,'+
	        'blood_group  ="'+card.blood_group+'" ,'+
	        'organ_donation  ="'+addSlashes(card.organ_donation)+'" ,'+
	        'first_aid  ="'+addSlashes(card.first_aid)+'" ,'+
	        'link_1 ="'+addhttp( card.link_1)+'" ,'+
	        'link_title_1  ="'+card.link_title_1+'" ,'+
	        'link_2  ="'+addhttp( card.link_2)+'" ,'+
	        'link_title_2 ="'+card.link_title_2+'" ,'+
	        'link_3 ="'+addhttp( card.link_3)+'" ,'+
	        'link_title_3  ="'+card.link_title_3+'" ,'+
	        'link_4 ="'+addhttp( card.link_4)+'" ,'+
	        'link_title_4  ="'+card.link_title_4+'" ,'+
	        'antecedents ="'+addSlashes(card.antecedents)+'" ,'+
	        'social_welfare_number ="'+card.social_welfare_number+'" ,'+
	        'insurance ="'+addSlashes(card.insurance)+'" ,'+
	        'insurance_number ="'+card.insurance_number+'" ,'+
	        'mutual ="'+card.mutual+'" ,'+
	        'mutual_number ="'+card.mutual_number+'" ,'+
//	        'photofilelocation ="'+card.photofilelocation+'" ,'+
	        'pathology2 ="'+addSlashes(card.pathology2)+'" ,'+
	        'treatment2="'+addSlashes(card.treatment2)+'" ,'+
	        'antecedents2="'+addSlashes(card.antecedents2)+'" ,'+
	        'allergies2="'+addSlashes(card.allergies2)+'" ,'+
	        'risk_sports="'+addSlashes(card.risk_sports)+'" ,'+
	        'familyname1="'+addSlashes(card.familyname1)+'" ,'+
	        'familyname2="'+addSlashes(card.familyname2)+'" ,'+
	        'familyname3="'+addSlashes(card.familyname3)+'" ,'+
	        'familyemail1="'+addSlashes(card.familyemail1)+'" ,'+
	        'familyemail2="'+addSlashes(card.familyemail2)+'" ,'+
	        'familyemail3="'+addSlashes(card.familyemail3)+'" ,'+
	        'doctorname="'+addSlashes(card.doctorname)+'" ,'+
	        'doctoreamail="'+addSlashes(card.doctoreamail)+'" ,'+
	        'contact_lens="'+addSlashes(card.contact_lens)+'" ,'+
	        'birthday_year="'+addSlashes(card.birthday_year)+'",  '+
	        'sex="'+card.sex+'",  '+
	        'height="'+card.height+'",  '+
	        'weight="'+card.weight+'",  '+
	        'country="'+card.country+'",  '+ 
	        'flashcodeUID="'+card.flashcodeUID+'", '+
	        'comment1="'+card.comment1+'", '+
	        'comment2="'+card.comment2+'", '+
	        'limits_and_exclusions="'+addSlashes(card.limits_and_exclusions)+'" ,'+
	        'schedule_of_benefits="'+addSlashes(card.schedule_of_benefits)+'" '+
	        'where id ='+card.id;

	        $cordovaSQLite.execute(db, query).then(function(results){
	          callBack(card);

	        }, function(reason) {

	            console.error(reason);
	            callBack(1);

	        }, function(value) {

	         console.error(value);
	         callBack(1);
	        });

	      } catch (e) {
	        // console.log(e);
          console.error(e);
	        callBack(1);
	      }
  		};

  		/**
  		 * update photo file location en local
  		 */
  	var updatePhotoFileLocation = function(db, urlImage, id, callBack){

	     var updateQuery = "UPDATE urgency SET photofilelocation = '"+urlImage+"' where id='"+id+"'";

	      // console.log(updateQuery);
	      $cordovaSQLite.execute(db, updateQuery).then(function(result){
	        return callBack();
	      }, function (err) {
	        // console.error(err);
	      });
	  };
	  /**
	   * update urgency to server
	   */
	 var updateUrgencyServer= function(i, vcard, callBack,errorCallBack){


		   var length =0;
	       for(j in vcard){

	         if(length == i) key = j;
	         length++;
	       }
	       //TODO vitale_card

	     // the send request parameters
	      var request = {
	        method: 'POST',
	        url: 'https://www.buzcard.com/vitale_card.aspx?request=update',
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
	          update:makeXml(key,vcard[key]),

	        },
//	        timeout : 4000,
	      };

	      $http(request).success(function(data, status, headers, config) {

          i++;
	        if(i<length){

	          updateUrgencyServer(i, vcard, callBack,errorCallBack);
	        }else{

	          callBack(data);
	        }
	      }).error(function(data, status, headers, config) {
	        errorCallBack(status);
	      });
	 };
	 /**
	   * download photo urgency
	   */
	  var downloadPhotoUrgency = function(db,photolocation, id,callBack) {

	      var isWindowsPhone = ionic.Platform.isWindowsPhone();

	    	  if(window.cordova){
	    		   if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
	                   path = cordova.file.applicationStorageDirectory;
	               }else if (isWindowsPhone) {
	  	             path = "/";
		              } else {
	                   path = cordova.file.dataDirectory;
	               }

	    	var fileName = id+'_'+new Date().getTime()+'.jpg';

	        	  if(photolocation !=""){
		 var url = "https://www.buzcard.com/" + photolocation.substr(2);
	     cameraService.downloadFile(path, fileName, url, function (urlImage) {
	   	  // console.warn("-------------------"+urlImage);
	   	  updatePhotoFileLocation(db, urlImage, id, function(){
	   		  //alert(urlImage);
	   		 callBack(urlImage);
	   	  });

	         //TODO FIXME callback if need
	     	});
	        	  }else{

	        		  callBack("img/photo_top_title.jpg");
	        	  }


	      }else{
	    		 callBack("img/photo_top_title.jpg");
	    	 }



	    };
	    /**
	     * upload photo urgency to server
	     */
	    var uploadPhotoUrgency = function (path, callBack, errorCallBack) {

	            var isWindowsPhone = ionic.Platform.isWindowsPhone();


	                var fileName = path.substr(path.lastIndexOf('/') + 1);
	                var pathFile = path.substr(0, path.lastIndexOf('/') + 1);

	                // the send request parameters
	                var request = {
	                    method: 'POST',
	                    //TODO vitale_card http://www.buzcard.com/vitale_card.aspx?request=update_portrait
	                   url: 'https://www.buzcard.com/vitale_card.aspx?request=update',
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
//	                    timeout: 10000,
	                };
	                $http(request).success(function (data, status, headers, config) {

	                    // console.warn(' fileName ' + fileName + '  pathFile' + pathFile);
	                    $cordovaFile.readAsArrayBuffer(pathFile, fileName).then(function (success) {
	                        // success
	                        // console.warn("success");

	                        var fd = new FormData();
	                        var image = new Uint8Array(success);
	                        fd.append('photo', new Blob([image], {
	                            type: 'image/jpeg'
	                        }), fileName);
	                        //TODO vitale_card
	                       $http.post("https://www.buzcard.com/vitale_card.aspx?request=update_portrait", fd, {
	                            transformRequest: angular.identity,
	                            headers: {
	                                'Content-Type': undefined
	                            }
	                        }).success(function (data, status, headers, config) {
	                                // console.log('success upload ...');
	                                // console.warn(data);
	                                callBack();

	                            })
	                            .error(function () {
	                                // console.log('erreur');
	                                errorCallBack();
	                            });
	                    }, function (error) {
	                        // error
	                        errorCallBack();
	                    });
	                });
	    };

	    var DropUrgencyTable = function(db,callBack){

	        var query ="Drop table urgency";
	        $cordovaSQLite.execute(db, query).then(function(value) {
	          return callBack();
	        }, function(reason){
	          // console.log(reason);
	        }, function(value){

	        });
	      };
  /**
   * get  gps position
   */
  var getPosition = function (callBack){
      console.log('eeeeeeee')
    cordova.plugins.diagnostic.getLocationAuthorizationStatus(function(status){
      console.log(status);
      if(status == cordova.plugins.diagnostic.permissionStatus.DENIED)
        return callBack('DENIED')
      else {
        var lat = 0;
        var lng = 0;
        var posOptions = {
          enableHighAccuracy: true,
          timeout: 10000
        };
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {

            lat = position.coords.latitude;
            lng = position.coords.longitude;

            var latlng = {
              latitude: parseFloat(lat),
              longitude: parseFloat(lng)
            };
            console.log('Coordonnées GPS du position actuelle: ' + lat + " : " + lng);
            return callBack(latlng)

          }, function (err) {
            console.log(err)
            return callBack('error')
          });
      }
   }, function(error){
      console.error(error);
      return callBack('error')
    });
  };

  /**
   *
   */
  var searchRescuer = function(act,latitude, longitude, callBack){

    var request = {
      method: 'POST',
      url: 'https://www.buzcard.com/RegisterUserApp.aspx?request=alertsecouriste',
      data : {
        act : act,
        latitude: latitude,
        longitude: longitude
      },
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


    };
    // the HTTP request
    return $http(request).success(function (data) {
      return callBack(data)
    }).error(function (err) {
      return callBack(err)
    });
  }
  var alertRelative = function (act, latitude, longitude, callBack) {
    var request = {
      method: 'POST',
      url: 'https://www.buzcard.com/RegisterUserApp.aspx?request=alertproche',
      data : {
        act : act,
        latitude: latitude,
        longitude: longitude
      },
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


    };
    // the HTTP request
    return $http(request).success(function (data) {
      return callBack(data)
    }).error(function (err) {
      return callBack(err)
    });
  }

  return {
	  getUrgency:getUrgency,
	  createUrgencyTable:createUrgencyTable,
	  emptyUrgencyTable:emptyUrgencyTable,
	  insertIntoUrgency:insertIntoUrgency,
	  selectUrgency:selectUrgency,
	  updateUrgency:updateUrgency,
	  updatePhotoFileLocation:updatePhotoFileLocation,
	  updateUrgencyServer:updateUrgencyServer,
	  downloadPhotoUrgency:downloadPhotoUrgency,
	  uploadPhotoUrgency:uploadPhotoUrgency,
	  getUrgencyEdited:getUrgencyEdited,
	  DropUrgencyTable:DropUrgencyTable,
    getPosition:getPosition,
    searchRescuer:searchRescuer,
    alertRelative:alertRelative

  }


}]);
function makeXml(key,value){
	 return "<update><"+key+">"+value+"</"+key+"></update>";
	};
