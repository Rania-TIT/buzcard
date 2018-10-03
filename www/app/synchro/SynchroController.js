appContext.controller("SynchroController", [
    '$state',
    '$cordovaSQLite',
    '$ionicPlatform',
    'ContactsService',
    'LoadingService',
    'BuzcardService',
    '$scope',
    '$rootScope',
    '$ionicHistory',
    'SynchroServices',
    'LoginService',
    'MenuService','$translate','UrgencyService','AutoCompleteService','autoCompleteDomaines','QrCodeServices','$window','MultiService',
    function($state, $cordovaSQLite, $ionicPlatform, ContactsService, LoadingService,
       BuzcardService, $scope, $rootScope, $ionicHistory, SynchroServices, LoginService,MenuService,$translate,
      UrgencyService,AutoCompleteService,autoCompleteDomaines,QrCodeServices,$window,MultiService) {

    	$scope.splashMargin = ($window.screen.height - $window.screen.width) /2
        if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
      	  if(navigator.language.substring(0,2) =="fr"){
      		  $scope.photosplash=  "img/splashAndroidFR.jpg";
      	  }else{
      		  $scope.photosplash=  "img/splashAndroidUS.jpg"
      	  }

     	} else {
     	 if(navigator.language.substring(0,2) =="fr"){
     		$scope.photosplash=  "img/splashAndroidFR.jpg"
  	  }else{
  		  $scope.photosplash=  "img/splashAndroidUS.jpg"
  	  }
     	}

        /**
         * create/open DB
         */
    	var db = null;
        $ionicPlatform.ready(function() {

            LoadingService.loading($translate.instant('Loading1'));

            if (window.cordova) {
            	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
            } else {
                db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
            };
            //alert("strat sycnrho");
            MultiService.createMultiTable(db).then(function(){
            	BuzcardService.DropTableTradEmail(db, function(){
        BuzcardService.createEmailTradTable(db,function(){
            SynchroServices.createRequestTable(db, function() {
                // create profil table
                BuzcardService.createProfileTable(db, function() {
                    BuzcardService.emptyProfileTable(db, function() {
                        // insert data to profile table
                        BuzcardService.getProfil().success(function(data, status, headers, config) {

                            var profil = data.response.virtual_card;
                        	// console.error(data);

                            $rootScope.fileLocaltion = profil.photofilelocation.substr(2, profil.photofilelocation.lastIndexOf('/') - 1);
                            window.localStorage.setItem('fileLocation', profil.photofilelocation.substr(2, profil.photofilelocation.lastIndexOf('/') - 1));
                            window.localStorage.setItem('fileProfil',profil.photofilelocation);
                            $rootScope.idProfil = profil.id;
                           

                            BuzcardService.insertIntoProfile(db, data.response.virtual_card, function() {
                            	BuzcardService.getACT(function(act){
                            		
                                //begin get email trad from server
                                BuzcardService.getEmailTrad(act).then(function(rep){
                                  BuzcardService.insertIntoEmailTradTable(db, rep.data.response.EmailsVcard.Email,function(){

                                    localStorage.setItem("act", act);
                            	  LoadingService.loading($translate.instant('Loading2'));
                                //LoadingService.loading("Chargement de la photo...");
                                BuzcardService.downloadPhotoProfil(db, profil.photofilelocation, profil.id, function(url) {

                                	 //LoadingService.dismiss();
                                	 //LoadingService.loading($translate.instant('Loading6'));
                                	UrgencyService.createUrgencyTable(db, function(){

                                		UrgencyService.emptyUrgencyTable(db,function(){

                                		UrgencyService.getUrgency().success(function(data, status, headers, config) {
                                			if(data !=''){
                                			var card = data.response.vitale_card;
                                			// console.log(card);
                                			UrgencyService.insertIntoUrgency(db, card, function(){
                                				window.localStorage.setItem('photoFileLocationUrgency',card.photofilelocation);

                                				UrgencyService.downloadPhotoUrgency(db, card.photofilelocation, card.id, function(url) {


                                				});

                                			});
                                			}
                                		}).error(function(data, status, headers, config) {
                                    		// console.log("error " + data);
                                    		// TODO FIXME
                                    	});
                                		});
                                		});



                                    // create group table
                                    ContactsService.createGroupTable(db, function() {
                                        // empty group table
                                        ContactsService.emptyGroupTable(db, function() {
                                            // get data from server
                                        	ContactsService.getGroup().success(function(data, status, headers, config) {

                                        		if (typeof data.lists.list == "undefined") {
                                        		} else {

                                        			if (data.lists.list instanceof Array) {
                                        				// insert into group table
                                        					ContactsService.insertBulkGroupe(db, data.lists.list, function() {});
                                        			} else ContactsService.insertIntoGroupTable(db, data.lists.list, function() {});
                                        		}
                                        		// console.log("1111111");
                                        	}).error(function(data, status, headers, config) {
                                        		// console.log("error " + status);
                                        		// TODO FIXME
                                        	});

                                        });
                                    });
                                    // create contacts table
                                    ContactsService.DropContactTable(db, function() {
                                    ContactsService.createContactsTable(db, function() {
                                        //empty contact table
                                        ContactsService.emptyContactTable(db, function() {
                                        	 LoadingService.dismiss();
                                          //  LoadingService.loading("Chargement des contacts...");
                                        	  LoadingService.loading($translate.instant('Loading3'));
                                            //get from server and persist
                                            getContactsRecurssive(1, function() {
                                            	/////////////
                                            	ContactsService.updateStatusEmailEmpty(db, function(){

                                            		/**************************/

                                            	/////
                                       			 LoadingService.dismiss();
                                                    //  LoadingService.loading("Chargement des contacts...");
                                                  	  LoadingService.loading($translate.instant('Loading.Autocomplet'));
                                       	AutoCompleteService.createPrenom(db,function(){
                                       		AutoCompleteService.emptyPrenomTable(db, function(){
                                       			insertPRenomsRecursive(0,function(){
                                       				AutoCompleteService.insertEmailsContact(db, function(){


                                       				////
                                       		//begin insert domaines
                                       				autoCompleteDomaines.createDomaines(db,function(){
                                       					autoCompleteDomaines.emptyDomainesTable(db, function(){
                                       						insertDomainesRecursive(0,function(){
                                       							autoCompleteDomaines.insertDomaineContact(db, function(){

                                                LoginService.createIdentifiantTable(db, function() {
                                                    LoginService.emptyIdentifiantTable(db, function() {
                                                        if ($rootScope.email != "" && $rootScope.password != "") {



                                                        	LoadingService.loadingWithPourcentage($translate.instant('Loading5'));
                                                        	ContactsService.downloadAllPhotoContacts(db,function(){
                                                            	ContactsService.getCreditParrainage(function(credit){
                                                            		MenuService.setLocalStorage("credit",credit);

                                                            		var dateSynchronisation = MenuService.getDateUS();
                                                            		MenuService.setLocalStorage("dateSynchronisation",dateSynchronisation);
                                                            		LoginService.setCredentials(db, $rootScope.email, $rootScope.password,$rootScope.userId, function() {
                                                            			 window.localStorage.setItem('VersionApp',$rootScope.versionApp);



                                                            						//------------------------------------
                                                            			QrCodeServices.createTableQRcodes(db, function(){
                                                            				QrCodeServices.emptyTableQRcodes(db, function(){
                                                            					QrCodeServices.downloadQRProfile(db,act, function(){
                                                            						QrCodeServices.downloadQRVitale(db,act, function(){


                                                            					//_______
                                                            			BuzcardService.getCustoFile(db,function(array){
                                                            				if("404" != array){
                                                            					console.log(array[2]);
                                                            					BuzcardService.downloadPhotoCusto(array[2],"custo",function(imgUrl){
                                                            						MenuService.setLocalStorage("customisation",array);
                                                            						 $rootScope.imgCusto = imgUrl;
                                                                					LoadingService.dismiss();
                                                                                   // $state.go("app.buzcard");
                                                                					 $state.go("app.qrcode");
                                                            					});

                                                            				}else{
                                                            					 $rootScope.isCusto = false;
                                                            		         	//  var arrayCusto = MenuService.getLocalStorage("customisation");
                                                            		         	 $rootScope.secondColor = "";
                                                            		               $rootScope.firstColor ="";

                                                            		            	   $rootScope.imgCusto ="";
                                                            					LoadingService.dismiss();
                                                                              //  $state.go("app.buzcard");
                                                            					 $state.go("app.qrcode");
                                                            				}

                                                            						});
                                                            				//---------------------------------------

                                                            						});

                                                                        //sssss
                                                            					});
                                                            				});
                                                            			});
                                                            			//------8888888888888888888888

                                                            			///////////////999999999999999999


                                                                 });

                                                            	});

                                                            });
                                                        }
                                                    });
                                                });

                                       							});
                                                				///end insert domaines
                                                            			});
                                                            		});

                                                            	});
                                                			});
                                                				/// end insertPrenomRecursives
                                                			});
                                                		});

                                                	});
                                                /********************************/
                                            	});/////////////////
                                            });
                                        });

                                    });
                                    });


                                }); //End Download photo
                              });
                            }); //end get email trad from server
                          },function(){

                          });//end of get act
                            //End insert profil


                        });
                        });
                        //dddddddddd
                    });
                });
            });
          },function(){

          });
		});
          },function(){

          });
        });




        /**
         * get all contact recursively from server and persist them to DB
         */
        function getContactsRecurssive(page, callBack) {

            // get data from server
            ContactsService.getContacts(page).success(function(data, status, headers, config) {

            	if(parseInt(data.contacts.total) ==1){
            		ContactsService.insertIntoContactsTable(db, data.contacts.contact, function(){
            			return callBack();
            		});

            	}else if (typeof data.contacts.contact == "undefined"){
            		 return callBack();
            	}else{
            		 var pages = data.contacts.pages;
                     if (page <= pages - 1) {
                         page = parseInt(page) + 1;


                         ContactsService.insertBulkIntoContactsTable(db, 0, data.contacts.contact, function() {
                             LoadingService.loading($translate.instant('Loading3') + parseInt((page / pages) * 100) + "%");
                         });

                         getContactsRecurssive(page, callBack);
                     } else {
                         ContactsService.insertBulkIntoContactsTable(db, 0, data.contacts.contact, function() {

                        	 return callBack();
                         });
                     }
            	}

            }).error(function(data, status, headers, config) {
                // console.log("error " + status);
                // TODO FIXME
            });
        }
        function insertPRenomsRecursive(counter, callBack){
        	AutoCompleteService.getPrenoms(function(data){

        		AutoCompleteService.insertPrenoms(db, 0, data, function(){
        			callBack();
        		});
        	},function(){

        	})
        }

        function insertDomainesRecursive(counter, callBack){
        	autoCompleteDomaines.getNomdeDomaines(function(data){

        		autoCompleteDomaines.insertDomaines(db, 0, data, function(){
        			callBack();
        		});
        	},function(){

        	})
        }


    }
]);
