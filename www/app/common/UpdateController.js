appContext.controller("UpdateController", [
    '$scope',
    '$state',
    '$rootScope',
    'MenuService',
    'ConnectionService',
    'LoadingService',
    'BuzcardService',
    'ContactsService',
    '$ionicPlatform',
    '$ionicHistory',
    '$cordovaSQLite',
    '$location',
    '$translate',
    'UrgencyService','QrCodeServices',
    function($scope, $state, $rootScope, MenuService, ConnectionService, LoadingService, BuzcardService, ContactsService, $ionicPlatform,$ionicHistory,$cordovaSQLite,$location,$translate,UrgencyService,QrCodeServices) {


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
      $rootScope.isBackgroudRuning = true;
        /**€€€€€€€
         *  begin synchronisation
         €€€€€€€*/

        LoadingService.loading($translate.instant('Buzcard.Msg'));
        var dateSynchronisation = MenuService.getLocalStorage("dateSynchronisation");
        if (dateSynchronisation != false) {
        	LoadingService.loading($translate.instant('Buzcard.Msg'));
            ConnectionService.isConnected(db, function() {

                BuzcardService.getProfil().success(function(data, status, headers, config) {
                    if (data != "") {
                        var profil = data.response.virtual_card;
                        // console.log(profil);
                        $rootScope.fileLocaltion = profil.photofilelocation.substr(2, profil.photofilelocation.lastIndexOf('/') - 1);
                        $rootScope.idProfil = profil.id;
                        window.localStorage.setItem('fileLocation', profil.photofilelocation.substr(2, profil.photofilelocation.lastIndexOf('/') - 1));
                        window.localStorage.setItem('fileProfil',profil.photofilelocation);
                        BuzcardService.updateProfil(db, data.response.virtual_card, function() {

                            BuzcardService.downloadPhotoProfil(db ,profil.photofilelocation, profil.id, function(url) {
                            	UrgencyService.getUrgencyEdited().success(function(data, status, headers, config){
                            		if(data !=''){


                            			var card = data.response.vitale_card;
                            			//alert(JSON.stringify(data));
                            			UrgencyService.updateUrgency(db, card, function(){
                            				window.localStorage.setItem('photoFileLocationUrgency',card.photofilelocation);

                            				UrgencyService.downloadPhotoUrgency(db, card.photofilelocation, card.id, function(url) {

                                //get from server and persist
                                ContactsService.getContactsEdited().success(function(data, status, headers, config) {

                                    var nbContacts = 0;

                                    if (data && data.contacts.contact instanceof Array) {
                                        nbContacts = data.contacts.contact.length;
                                //alert("++++++++" +nbContacts);
                              } else if (data && data.contacts.contact instanceof Object) {
                                        nbContacts = 1;
                                       //alert("+++++" + data.contacts.contact);
                                    }
                                    if (nbContacts == 0) {

                                        var dateSynchronisation = MenuService.getDateUS();
                                        MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);
                                        LoadingService.dismiss();
                                        MenuService.setLocalStorage('ReloadContactList', 1);
                                        $rootScope.isBackgroudRuning = false;
                                        $rootScope.isDelta = false;
                                        $rootScope.countSynchroDelta =0;
                                        $state.go("app.qrcode");
                                    } else {
                                    	ContactsService.UpdateRepertoire(db, 0, nbContacts, data.contacts.contact, function(){
                                        ContactsService.insertOrUpdateContacts(db, 0, nbContacts, data.contacts.contact, function() {
                                            // empty group table
                                            ContactsService.downloadPhotoContactsAtSynchro(db, data.contacts.contact, function() {
                                            	console.log("-------nbcontact----- "+nbContacts);
                                        //    	ContactsService.UpdateRepertoire(db, 0, nbContacts, data.contacts.contact, function(){


                                                ContactsService.emptyGroupTable(db, function() {
                                                    // get data from server
                                                    ContactsService.getGroup().success(function(data, status, headers, config) {

                                                        if (data.lists.list instanceof Array) {
                                                            // insert into group table
                                                                ContactsService.insertBulkGroupe(db, data.lists.list, function() {
                                                                ContactsService.getCreditParrainage(function(credit) {
                                                                    MenuService.setLocalStorage("credit", credit);
                                                                    var dateSynchronisation = MenuService.getDateUS();
                                                                    MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);

                                                                    LoadingService.dismiss();

                                                                    MenuService.setLocalStorage('ReloadContactList', 1);
                                                                    $rootScope.isBackgroudRuning = false;
                                                                    $rootScope.isDelta = false;
                                                                    $rootScope.countSynchroDelta =0;
                                                                    $state.go("app.qrcode");
                                                                });
                                                            });
                                                        } else {
                                                            ContactsService.insertIntoGroupTable(db, data.lists.list, function() {
                                                                var act = localStorage.getItem('act')
                                                                ContactsService.getCreditParrainage(function(credit) {
                                                                	//_________________
                                                                	QrCodeServices.createTableQRcodes(db, function(){
                                                        				QrCodeServices.emptyTableQRcodes(db, function(){
                                                        					QrCodeServices.downloadQRProfile(db,act, function(){
                                                        						QrCodeServices.downloadQRVitale(db,act, function(){
                                                                	//____________________
                                                                    MenuService.setLocalStorage("credit", credit);
                                                                    var dateSynchronisation = MenuService.getDateUS();
                                                                    MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);
                                                                    LoadingService.dismiss();
                                                                    MenuService.setLocalStorage('ReloadContactList', 1);
                                                                    $rootScope.isBackgroudRuning = false;
                                                                    $rootScope.isDelta = false;
                                                                    $rootScope.countSynchroDelta =0;
                                                                    $state.go("app.qrcode");
                                                        						});
                                                        					});
                                                        				});
                                                        			});
                                                                    //_____
                                                                });

                                                            });

                                                        }
                                                    }).error(function(data, status, headers, config) {
                                                        // console.log("error " + status);
                                                        // TODO FIXME
                                                        $rootScope.isBackgroudRuning = false;
                                                        LoadingService.dismiss();
                                                        $state.go("app.qrcode");
                                                    });

                                                });

                                            	///});

                                            });
                                        });
                                    	 });

                                    }

                                }).error(function(data, status, headers, config) {
                                    // console.log("error " + status);
                                    // TODO FIXME
                                    $rootScope.isBackgroudRuning = false;
                                    LoadingService.dismiss();
                                    $state.go("app.qrcode");
                                });
                            		//end UrgencySynchro

                            				});



                            			});
                            			}

                            	}).error(function(data, status, headers, config){
                                $rootScope.isBackgroudRuning = false;
                                LoadingService.dismiss();
                                $state.go("app.qrcode");
                            	})
                            	/////////////////////////
                            });
                        });
                    } else {
                    	// Urgency synchro

                        //get from server and persist
                 	   ContactsService.emptyContactTable(db, function() {
       					ContactsService.getContactsRecurssiveSynchro(db, 1, function(){

       						ContactsService.updateStatusEmailEmpty(db, function(){
       							ContactsService.downloadAllPhotoContacts(db,function(){

       					     ContactsService.emptyGroupTable(db, function() {
                                  // get data from server
                                  ContactsService.getGroup().success(function(data, status, headers, config) {
                                      if (data.lists.list instanceof Array) {
                                          // insert into group table
                                              ContactsService.insertBulkGroupe(db, data.lists.list, function() {
                                              ContactsService.getCreditParrainage(function(credit) {
                                                  MenuService.setLocalStorage("credit", credit);
                                                  var dateSynchronisation = MenuService.getDateUS();
                                                  MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);

                                                  LoadingService.dismiss();

                                                  MenuService.setLocalStorage('ReloadContactList', 1);
                                                  $rootScope.isBackgroudRuning = false;
                                                  $rootScope.isDelta = false;
                                                  $rootScope.countSynchroDelta =0;
                                                  $state.go("app.qrcode");
                                              });
                                          });
                                      } else {
                                          ContactsService.insertIntoGroupTable(db, data.lists.list, function() {
                                              var act  = localStorage.getItem('act')
                                              ContactsService.getCreditParrainage(function(credit) {
                                              	//_________________
                                              	QrCodeServices.createTableQRcodes(db, function(){
                                      				QrCodeServices.emptyTableQRcodes(db, function(){
                                      					QrCodeServices.downloadQRProfile(db,act, function(){
                                      						QrCodeServices.downloadQRVitale(db,act, function(){
                                              	//____________________
                                                  MenuService.setLocalStorage("credit", credit);
                                                  var dateSynchronisation = MenuService.getDateUS();
                                                  MenuService.setLocalStorage("dateSynchronisation", dateSynchronisation);
                                                  LoadingService.dismiss();
                                                  MenuService.setLocalStorage('ReloadContactList', 1);
                                                  $rootScope.isBackgroudRuning = false;
                                                  $rootScope.isDelta = false;
                                                  $rootScope.countSynchroDelta =0;
                                                  $state.go("app.qrcode");
                                      						});
                                      					});
                                      				});
                                      			});
                                                  //_____
                                              });

                                          });

                                      }
                                  }).error(function(data, status, headers, config) {
                                    $rootScope.isBackgroudRuning = false;
                                    LoadingService.dismiss();
                                    $state.go("app.qrcode");
                                      // console.log("error " + status);
                                      // TODO FIXME
                                  });
       					});
       							});
       						});
       					});
       					   });
                        ///////end UrgencySynchro
//
                    }
                }).error(function(data, status, headers, config) {
                  $rootScope.isBackgroudRuning = false;
                  LoadingService.dismiss();
                  $state.go("app.qrcode");
                    // console.log("error " + status);
                    // TODO FIXME
                });

            }, function() {
              $rootScope.isBackgroudRuning = false;
                LoadingService.info($translate.instant('Msg3'), "UpdateController");
            });

        } else {
        	var dateSynchronisation = MenuService.getDateUS();
    		MenuService.setLocalStorage("dateSynchronisation",dateSynchronisation);
    		$scope.yes();
        }

    }
    $scope.dismissInfo = function(){
    	LoadingService.dismiss();
    }
}]);
