appContext.controller("RepertoireController", [
    '$scope',
    '$state',
    '$rootScope','LoadingService','$cordovaContacts','$ionicPlatform','$translate','ContactsService','ConnectionService','$cordovaFile','$interval','SynchroServices','MenuService','$interval',
    function($scope, $state, $rootScope,LoadingService,$cordovaContacts,$ionicPlatform,$translate,ContactsService,ConnectionService,$cordovaFile,$interval,SynchroServices,MenuService,$interval) {

    	 /**
         * create/open DB
         */
        var db = null;
        $ionicPlatform.ready(function() {


            if (window.cordova) {
            	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
            } else {
                db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
            };
        });
        /**
         * click on button Annuler (popup synchronisation)
         */
        $scope.no = function() {
            LoadingService.dismiss();
        };

        /**
         * click on button ok (pop up synchronisation )
         */
        $scope.yes = function() {

        	cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
        	    if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
        	        console.log("Contacts use is authorized");
        	   
        	var contactImport=[];
        	LoadingService.loading($translate.instant('LoadingSynchroContact'));


        	var opts = {

        		      multiple: true


        		    };

        	cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
        	    if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){


        $cordovaContacts.find(opts).then(function(allContacts) {

        	//alert(JSON.stringify(allContacts));
        	for(var i=0;i<allContacts.length; i++){
        		var displayName="";
        		var nickname="";
        		var PhoneNumbers="";
        		var name="";
        		var organisation="";
        		var note="";
        		var email="";


        		if(allContacts[i].emails !=null){
        			email= allContacts[i].emails[0].value;
        		}

        			if(allContacts[i].displayName !=null) displayName = allContacts[i].displayName;
        			//if(allContacts[i].nickname != null) nickname=allContacts[i].nickname;

        			if(allContacts[i].name !=null) {
        				if(allContacts[i].name.givenName !=null){
        					nickname = allContacts[i].name.givenName;
        				}

        			}
        			if(allContacts[i].name !=null){
        				if(allContacts[i].name.familyName){
        					name = allContacts[i].name.familyName;
        				}

        			}
        			if(allContacts[i].phoneNumbers !=null) {
                PhoneNumbers = allContacts[i].phoneNumbers[0].value;
                for (var k = 1; k < allContacts[i].phoneNumbers.length; k++) {
                  PhoneNumbers = PhoneNumbers + "|"+allContacts[i].phoneNumbers[k].value;
                }

        			}

        	if(allContacts[i].organizations!= null ) {
        		//alert(allContacts[i].organizations.length+" "+allContacts[i].organizations[0].name);
        		organisation= allContacts[i].organizations[0].name;
        	}
        	if(allContacts[i].note !=null){
        		note= allContacts[i].note;
        	}
        		var contact = {id: i.toString(),
        							rawId: i.toString(),
        							displayName: displayName,
        							name: name,
        							nickname: nickname,
        							phoneNumbers:PhoneNumbers,
        							emails:email ,
        							addresses: "",
        							ims:"",
        							organisations:organisation,
        							birthday:"",
        							note:note,
        							photo:"",
        							categories:"",
        							urls:""

        							}
        		contactImport.push(contact);

        	}
          console.warn(contactImport);
        	////
        	//alert(JSON.stringify(contactImport));
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
        	 $cordovaFile.writeFile(path, "contacts_phone.json", JSON.stringify(contactImport), true)
             .then(function (success) {
               // success
           console.log(JSON.stringify(success));
           console.log(success.target.localURL);

           //LoadingService.dismiss();
          // alert(contactImport.length);

       		  ///LoadingService.loading($translate.instant('LoadingSynchroContactServeur'));
           ConnectionService.isConnected(db,function() {

        	 ContactsService.importContactDevice(db, success.target.localURL , function(data){

        		 var nbContact =parseInt(data.JsonFile.TotalJson);
     		//
        		 //alert(nbContact);
     		// alert(JSON.stringify(data));
     		// alert(JSON.stringify(data.contacts.contact));


//        		 if(parseInt(nbContact) == 0){
//        			 LoadingService.success($translate.instant('successImport0Contact',{ nb: parseInt(nbContact)  }), 'RepertoireController');
//
//        		 }else{
        			// LoadingService.dismiss();
                    //LoadingService.loading($translate.instant('LoadingSynchroContactSynchro'));
            			// alert("ok");
                     var object = {
                             total: parseInt(nbContact)
                         };
                       //  SynchroServices.insertRequest(db, "IMPORTCONTACT", object, function() {
                        	// alert("ok"+ JSON.stringify(object));
                        	 LoadingService.dismiss();
                        	 var dateSynchronisation = MenuService.getDateUS();
                             MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);
                 			 LoadingService.success($translate.instant('ImportContactFinish',{ nbContact: parseInt(nbContact) }), 'RepertoireController');

                       	  MenuService.setLocalStorage('ReloadContactList',1);

                      //   });
                     // });
        			// }

        	 },function(){
//        		 LoadingService.dismiss();
            	 LoadingService.success($translate.instant('MsgImportOffline'), 'RepertoireController');
        	 });
           }, function(err){
   	    	LoadingService.dismiss();
          	 LoadingService.success($translate.instant('MsgImportOffline'), 'RepertoireController');
           });
             }, function (error) {
                 // error writefile
            	 console.log(JSON.stringify(error));
               });



        	 },function(){
        		 LoadingService.dismiss();
            	 LoadingService.success($translate.instant('MsgImportOffline'), 'RepertoireController');

        	 });
        	    }else{

        	    	LoadingService.dismiss();
        	    	//if($rootScope.requestAutoriseContact>1){
        	    		 LoadingService.QuestionAUtorisationContact($translate.instant('QuestionAutoriserContact'), 'ContactEditController');
        	    	//	$rootScope.requestAutoriseContact++;
        	    	//}

        	    	// alert("App is " + (authorized ? "authorized" : "denied") + " access to contacts");
                  	// LoadingService.success("App is denied  access to contacts", 'RepertoireController');
        	    }
        	}, function(error){
        		LoadingService.dismiss();
        	    console.error("The following error occurred: "+error);
        	});
        	    }
        	}, function(error){
        	    console.error(error);
        	});
        }
        $scope.dismiss = function(){
				console.log("Synchro en background from repertoire controller");
				SynchroServices.selectAllRequest(db,function(rs){
					console.log("Nb request dans la File: "+ rs.rows.length);
					if (rs.rows.length > 0) {
					//alert($rootScope.sychroEncours);
						ConnectionService.isConnected(db, function(){
							console.log("synchro auto terminé");
							//LoadingService.dismiss();
						},function(){
							console.log("pas de conexion");
							LoadingService.dismiss();
						});
					}
				});
        	 LoadingService.dismiss();
        }
        $scope.yesAutorisationContact = function(){
         	 LoadingService.dismiss();
          	 cordova.plugins.diagnostic.switchToSettings(function(){
   	    		    console.log("Successfully switched to Settings app");

   	    		}, function(error){
   	    		  console.log("The following error occurred: "+error);
   	    		});
          };
          $scope.noAutorisationContact = function(){
          	 LoadingService.dismiss();

          }

    }]);
