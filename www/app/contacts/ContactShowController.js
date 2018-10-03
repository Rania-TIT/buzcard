appContext.controller("ContactShowController", [
    '$scope',
    '$state',
    'ContactsService',
    '$ionicPlatform',
    '$cordovaSQLite',
    '$stateParams',
    '$rootScope',
    'cameraService',
    '$ionicHistory',
    '$ionicModal',
    '$ionicSlideBoxDelegate',
    'ConnectionService',
    'LoadingService',
    'MenuService',
    '$translate','$filter','SynchroServices','$ionicSlideBoxDelegate','$cordovaSms','ionicToast','BuzcardService',
    function($scope, $state, ContactsService, $ionicPlatform, $cordovaSQLite,
            $stateParams, $rootScope, cameraService,$ionicHistory,$ionicModal,$ionicSlideBoxDelegate,ConnectionService,LoadingService,MenuService,$translate,$filter,SynchroServices,$ionicSlideBoxDelegate,$cordovaSms,ionicToast,BuzcardService) {
      $scope.showLast = false;
      $scope.tmp=false;
      var db = null;

      $ionicPlatform.ready(function() {

        /**
         * create/open DB
         */
        if (window.cordova) {
        	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
        } else {
          db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
        }

       // $ionicHistory.clearHistory();
        getContact();
      });

      /**
       * get infos contact by id
       */
      function getContact() {
    	  // $scope.photoProfil = "img/photo_top_title.jpg";
        ContactsService.getContactbyId(db, $stateParams.id, function(result) {
        	if(result.rows.length > 0){
        		tmpContact = result.rows.item(0);
                $scope.contact = result.rows.item(0);
                $scope.contact.last_name = removeSlashes(result.rows.item(0).last_name);
                $scope.contact.first_name = removeSlashes(result.rows.item(0).first_name);
                $scope.contact.company = removeSlashes(result.rows.item(0).company);
                $scope.contact.list = removeSlashes(result.rows.item(0).list);
                $scope.contact.lastsendemail =result.rows.item(0).lastsendemail;
                $scope.contact.fonction = removeSlashes(result.rows.item(0).fonction);
                $scope.contact.address = removeSlashes(result.rows.item(0).addressline1)+" "+removeSlashes(result.rows.item(0).addressline2)+" "+removeSlashes(result.rows.item(0).addressline3)+" "+removeSlashes(result.rows.item(0).postalcode)+" "+removeSlashes(result.rows.item(0).city);
                $scope.contact.Link_CardOnline = result.rows.item(0).Link_CardOnline;
                $rootScope.contact = $scope.contact;
            	if(removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('ContactEdit.SearchGPS') || removeSlashes(result.rows.item(0).meeting_point) =="undefined" || removeSlashes(result.rows.item(0).meeting_point) ==$translate.instant('No-place') || removeSlashes(result.rows.item(0).meeting_point) ==$translate.instant('No-place-GPS')){
           		 $scope.contact.meeting_point = '';
           	}else{
           		 $scope.contact.meeting_point = removeSlashes(result.rows.item(0).meeting_point);
              	}
            	 if(result.rows.item(0).photofilelocation  =="img/photo_top_title.jpg" ){
            		// result.rows.item(0).photofilelocation="img/profilcontact.png";
              		$scope.photoProfil = "";
                  $scope.imageExist = true;
                     }else{
                       $scope.imageExist = false;
             		var fileName = result.rows.item(0).photofilelocation.substr(result.rows.item(0).photofilelocation.lastIndexOf('/')+1);
                    result.rows.item(0).photofilelocation = $rootScope.path+fileName;
                    $scope.photoProfil = result.rows.item(0).photofilelocation;
//                    ConnectionService.isConnected(db, function(){
//                    	  var fileLocation = window.localStorage.getItem('idUser')// $rootScope.fileLocaltion;
//
//                    	 $scope.photoProfil = "https://www.buzcard.com/upload/" + fileLocation + "/contacts/" + result.rows.item(0).id + "/imgThumbnail.jpg";
//                    }, function(){
//                    	 $scope.photoProfil = result.rows.item(0).photofilelocation;
//                    })

                  //  console.log($scope.photoProfil );
                         	 }


                //test sur le premier e dernier buzz
            	  if (!compareDate(result.rows.item(0).lastsendemail,result.rows.item(0).firstsendemail))
                      $scope.showLast = true;
                var idProfil = $rootScope.idProfil;
                $scope.tmp=true;

                // console.log(JSON.stringify($scope.contact));
                if(result.rows.item(0).rendez_vous !=""){
                	$scope.contact.rendez_vous = new Date(result.rows.item(0).rendez_vous * 1000);
                }else{
                	$scope.contact.rendez_vous = result.rows.item(0).rendez_vous;
                }

                // console.log($scope.contact.rendez_vous);

                if ( Object.prototype.toString.call($scope.contact.rendez_vous) === "[object Date]" ) {
                  // it is a date
                  if ( isNaN( $scope.contact.rendez_vous.getTime() ) ) {
                    // date is not valid
                    $scope.contact.rendez_vous="";
                  }
                  else {
                    // date is valid
                  }
                }
                else {
                  // not a date
                }
        	}else{
        		MenuService.setLocalStorage('ReloadContactList',1);
        		$state.go('app.contactList');
        	}
          /*******  show cut link  ******/
          console.warn($scope.contact.vcardprofil);
          if ($scope.contact.vcardprofil.length == 0){
              $scope.showCutLink =  false;
          }else if(parseInt($scope.contact.vcardprofil) > 0 && $scope.contact.status == 'selected'){
              $scope.showCutLink =  true;
          }else if($scope.contact.vcardprofil == -1) {
              $scope.showCutLink =  false;
          }else {
              $scope.showCutLink =  false;
          }
          /*******  end show cut link  ******/
        });
      };
      
      function compareDate(d1,d2){
      	
  	    var dd1 = new Date(d1);
  	    console.log(dd1);
  	    var dd2 = new Date(d2);
  	    console.log((dd1.getDate() == dd2.getDate() && dd1.getFullYear() == dd2.getFullYear() && dd1.getMonth() == dd2.getMonth() && dd1.getHours() == dd2.getHours() && dd1.getMinutes() == dd2.getMinutes())) ;
  	 
  	  if(dd1.getDate() == dd2.getDate() && dd1.getFullYear() == dd2.getFullYear() && dd1.getMonth() == dd2.getMonth() && dd1.getHours() == dd2.getHours() && dd1.getMinutes() == dd2.getMinutes()) return true;
	     else return false;
  	    
      }
      

      $scope.yesAutorisationCamera = function(){
        	 LoadingService.dismiss();
        	 cordova.plugins.diagnostic.switchToSettings(function(){
 	    		    console.log("Successfully switched to Settings app");

 	    		}, function(error){
 	    		  console.log("The following error occurred: "+error);
 	    		});
        };
        $scope.noAutorisationCamera = function(){
        	 LoadingService.dismiss();

        }

      $scope.nextSlide = function() {
    	    $ionicSlideBoxDelegate.next();
    	  }
      $scope.previewSlide = function(){
    	  console.log("previous");
    	  $ionicSlideBoxDelegate.previous();
      }
      $scope.showSlide= function(index){
    	  console.log(index);
    	  $ionicSlideBoxDelegate.slide(index);
      }
      $ionicModal.fromTemplateUrl('app/common/partials/imagepopup.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
        });

        $scope.openModal = function() {
        	// console.log('open modal');
          $scope.modal.show();
          // Important: This line is needed to update the current ion-slide's width
          // Try commenting this line, click the button and see what happens
          $ionicSlideBoxDelegate.update();
        };


        $scope.closeModal = function() {
          $scope.modal.hide();

        };
        // Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function() {
          $scope.modal.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hide', function() {
          // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function() {
          // Execute action
        });
        $scope.$on('modal.shown', function() {
          // console.log('Modal is shown!');
        });



        $scope.updateAndShowContact =function(id,email){
//        	/**€€€€€€€
//             *  begin synchronisation
//             €€€€€€€*/
//        		LoadingService.loading("Synchronisation...");
//                ConnectionService.isConnectedWithoutSync(db, function() {
//                	// console.log(id.toString().length)
//                	if (id.toString().length != 10) {
//                	ContactsService.getContactFromServerByEmail(email,function(contact){
//                		// console.log("there is contact")
//                		ContactsService.getContactbyId(db,contact.id,function(result){
//	                			if(result.rows.length >0){
//	                				if(ContactsService.isUpToDate(result.rows.item(0).modificationdate,contact.modificationdate )){
//	                					//le contact est à jour
        								$rootScope.fromState = "app.contactShow";
	                					$state.go('app.contactEdit', {id: id });
//	                				}else{
//	                					//le contact sera mit à jour
//	                					// console.log(contact);
//	                            		// console.log("++++++++");
//	                            		ContactsService.updateContactModificationDate(db,id,contact.modificationdate, function(){
//	                            		ContactsService.updateContactInfo(db,contact,function(){
//	                            			 // empty group table
//	                                        ContactsService.emptyGroupTable(db, function() {
//	                                            // get data from server
//	                                            ContactsService.getGroup().success(function(data, status, headers, config) {
//	                                            	ContactsService.downloadAndOverride($stateParams.id,function(urlImage,i){
//	                                            		ContactsService.updateContactPhoto(db,$stateParams.id,urlImage,function(){
//	                                            			//rafraichir la page contact list
//	                                            			// console.log("+++++=======++++++++++++++");
//	                                            			MenuService.setLocalStorage('ReloadContactList',1);
//	                                            		if (data.lists.list instanceof Array) {
//	                                                        for (var int = 0; int < data.lists.list.length; int++)
//	                                                        // insert into group table
//	                                                            ContactsService.insertIntoGroupTable(db, data.lists.list[int], function() {
//	                                                            	//go to contact Edit without update
//	                                                            	LoadingService.dismiss();
//	                                                            	$state.go('app.contactEdit', {id: Number(contact.id) });
//
//	                                                            });
//	                                                        // LoadingService.loading("Chargement des groupes...");
//	                                                    } else ContactsService.insertIntoGroupTable(db, data.lists.list, function() {
//	                                                    	//go to contact Edit without update
//	                                                    	LoadingService.dismiss();
//	                                                    	$state.go('app.contactEdit', {id: Number(contact.id) });
//	                                                    });
//	                                            	});
//	                                            	});
//	                                            }).error(function(data, status, headers, config) {
//	                                                // console.log("error " + status);
//	                                                // TODO FIXME
//	                                            });
//
//	                                        });
//	                            		});//========
//	                				});//========
//	                				}
//	                			}else{
//                				LoadingService.error("La connexion est insuffisante ou saturée. <br> Veuillez réessayer ultérieurement.","ContactShowController");
//
//                			}
//                		});
//
//                	},function(status){
//                		if("NOCONTACT" == status){
//                			// console
//                			// console.log("there is no contact");
//                			LoadingService.errorWithTreatment("ce contact n'existe plus dans le serveur","ContactShowController",id);
//                		}else{
//                			//go to contact Edit without update
//                    		LoadingService.dismiss();
//                    		$state.go('app.contactEdit', {id: id });
//                		}
//
//
//                	});
//                }
//                	LoadingService.dismiss();
//                	//go to contact Edit (there is no connection)
//                	$state.go('app.contactEdit', {id: id })
//                }, function() {
//                	// no connection
//                	LoadingService.dismiss();
//                	//go to contact Edit (there is no connection)
//                	$state.go('app.contactEdit', {id: id })
//                });
//            /**€€€€€€€
//             *  end synchronisation
//             €€€€€€€*/

        };

        $scope.dismiss = function(){
        	LoadingService.dismiss();
        	$state.go('app.contactList');
        };

        $scope.treatment = function(id){
        	ContactsService.deleteContactLocal(db,id,function(){
        		MenuService.setLocalStorage('ReloadContactList',1);
        		LoadingService.dismiss();
        		$state.go('app.contactList')
        	});
        };

        $scope.showAdress =function(meeting_point){
        	var url = "https://www.google.fr/maps/place/"+meeting_point;
        	window.open(url, '_system');
        }
        $scope.getLink = function(link){
        	window.open(link, '_system');
        }

        $scope.clickTel =function (tel){
        //	alert(tel);
        //	alert(tel.replace(/ /g,""));
        	LoadingService.popUpClickTel(tel.replace(/ /g,""),"ContactShowController");

        }
        $scope.clicksendSMS = function(tel){
        	
        	
        	 LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactShowController");

      		   if (validatePhone(tel) && tel.toString().length >5) {
      	         	  $rootScope.fromState = "app.buzcardSend";
      	           LoadingService.loading($translate.instant("Loading4"));
      	           BuzcardService.selectProfile(db,function(rs){

      	           var phoneNumber = $rootScope.contact.phone_2.toString().replace(/ /g,"");
      	           var buzcardOnline = localStorage.getItem("act");
      	           var link = " ";
      	         var options = {
      	               android: {
      	                   intent: 'INTENT'
      	               }
      	         };
      	         console.log(phoneNumber);
      	        	   //$translate.instant("SMS.Msg",{ buzcardOnline: buzcardOnline, first_name: rs.rows.item(0).first_name });
      	           $cordovaSms.send(phoneNumber, link, options)
      	                .then(function() {
      	                  LoadingService.dismiss();
      	             	// LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phoneNumber}), $rootScope.contact.id, "ContactEditController");
      	                  /***********************\
      	                         SMS envoyé
      	                  \***********************/

      	                }, function(error) {
      	                   LoadingService.dismiss();
      	               // LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
      	                 //   ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
      	                });


      	              });
      	         }

        }
        /**
         *
         * button lui envoi ma buzcard
         */
        $scope.sendBuz= function(contact){
        	$rootScope.contact = contact;
        	$rootScope.emailSend = contact.email;
        	$state.go('app.buzcardSend');

//        	if((contact.phone_1 !="" && contact.email !="") || (contact.phone_2 !="" && contact.email !="")){
//        		LoadingService.popUpLuiRenvoyer("ContactShowController");
//        	}else if(contact.phone_1 !="" || contact.phone_2 !=""){
//        		sendBuzcardSMS();
//        	}else if(contact.email !=""){
//        		sendBuzcardEmail();
//        	}

        }
       $scope.sendSMS = function(){
    	   LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactShowController");
    	   if($rootScope.contact.phone_1 !=""){
    		   if (validatePhone($rootScope.contact.phone_1) && $rootScope.contact.phone_1.length>5) {
    	         	  $rootScope.fromState = "app.buzcardSend";
    	           LoadingService.loading($translate.instant("Loading4"));
    	           BuzcardService.selectProfile(db,function(rs){

    	           var phoneNumber = $rootScope.contact.phone_1;
    	           var buzcardOnline = localStorage.getItem("act");
    	           var link = $translate.instant("SMS.Msg",{ buzcardOnline: buzcardOnline, first_name: rs.rows.item(0).first_name });
    	           $cordovaSms.send(phoneNumber, link, {})
    	                .then(function() {
    	                  LoadingService.dismiss();
    	             	 LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phoneNumber}), $rootScope.contact.id, "ContactEditController");
    	                  /***********************\
    	                         SMS envoyé
    	                  \***********************/

    	                }, function(error) {
    	                   LoadingService.dismiss();
    	                   LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
    	                  //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
    	                });


    	              });
    	         }
    	   }else if($rootScope.contact.phone_2 !=""){
    		   if (validatePhone($rootScope.contact.phone_2) && $rootScope.contact.phone_2.length>5) {
    	         	  $rootScope.fromState = "app.buzcardSend";
    	           LoadingService.loading($translate.instant("Loading4"));
    	           BuzcardService.selectProfile(db,function(rs){

    	           var phoneNumber = $rootScope.contact.phone_2;
    	           var buzcardOnline = localStorage.getItem("act");
    	           var link = $translate.instant("SMS.Msg",{ buzcardOnline: buzcardOnline, first_name: rs.rows.item(0).first_name });
    	           $cordovaSms.send(phoneNumber, link, {})
    	                .then(function() {
    	                  LoadingService.dismiss();
    	             	 LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phoneNumber}), $rootScope.contact.id, "ContactShowController");
    	                  /***********************\
    	                         SMS envoyé
    	                  \***********************/

    	                }, function(error) {
    	                   LoadingService.dismiss();
    	                   LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
    	                  //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
    	                });


    	              });
    	         }
    	   }else{
    		   LoadingService.error("Veuillez introduire Numéro de mobile ", "ContactShowController");
    	   }

       }
       $scope.dismiss = function(){
    	   LoadingService.dismiss();
       }
       $scope.ok = function(id) {
           LoadingService.dismiss();

           $state.go('app.contactShow', {
               id: id
           }, {
               reload: true
           });

       };

        $scope.sendEMAIL = function(){


      	  LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactShowController");
      	  var rdv="";
      	  var langue = navigator.language.substring(0,2);
      	  if($rootScope.contact.rendez_vous !=""){
      		  console.warn($rootScope.contact.rendez_vous)
      		  //var dateTmp = new Date(contact.rendez_vous.substr(6, 4), Number(contact.rendez_vous.substr(3, 2)) - 1, contact.rendez_vous.substr(0, 2));
      		  rdv= $filter('date')(new Date($rootScope.contact.rendez_vous), 'MM/dd/yyyy')
      	  }else{
      		  rdv= $filter('date')(new Date(), 'MM/dd/yyyy')
      	  }
      	  window.localStorage.setItem('contactUpdate', JSON.stringify($rootScope.contact));
//      	  $rootScope.emailSend = contact.email;
//      	  $rootScope.langueSend = langue;
//      	  LoadingService.dismiss();
//      	  console.log($rootScope.emailSend+"    "+$rootScope.langueSend);
//      	  $state.go('app.buzcardSend');
  		 var object = {
  	                email: $rootScope.contact.email.toLowerCase(),
  	                selectLang: langue,
  	                checkFollower: "on",
  	                dateRDV: rdv,
  	                idTmp:$rootScope.contact.id
  	            };
  	            SynchroServices.insertRequest(db, "BUZCARDSEND", object, function() {
  	            ///	LoadingService.loading($translate.instant('Buzcard.Msg'));
  	            	LoadingService.loading($translate.instant('BuzcardSend.LoadingSend'));
  	            	ConnectionService.isConnectedSYc(db,function() {

  	            		LoadingService.dismiss();
  	            		LoadingService.confirm2($translate.instant('ContactShow.MsgSend'), $rootScope.contact.id, "ContactShowController");
  	            		 MenuService.setLocalStorage('ReloadContactList',1);
  	                    /// $state.go('app.contactList');
  	            	},function(){
  	            		LoadingService.dismiss();
  	            		LoadingService.confirm2($translate.instant('ContactShow.MsgSendOFF',{ email: $rootScope.contact.email}), $rootScope.contact.id, "ContactShowController");
  	            		 MenuService.setLocalStorage('ReloadContactList',1);
  	                     ///$state.go('app.contactList');
  	            	});

  	            });

        };
        function sendBuzcardEmail(){
        	  LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactShowController");
          	  var rdv="";
          	  var langue = navigator.language.substring(0,2);
          	  if($rootScope.contact.rendez_vous !=""){
          		  console.warn($rootScope.contact.rendez_vous)
          		  //var dateTmp = new Date(contact.rendez_vous.substr(6, 4), Number(contact.rendez_vous.substr(3, 2)) - 1, contact.rendez_vous.substr(0, 2));
          		  rdv= $filter('date')(new Date($rootScope.contact.rendez_vous), 'MM/dd/yyyy')
          	  }else{
          		  rdv= $filter('date')(new Date(), 'MM/dd/yyyy')
          	  }
          	  window.localStorage.setItem('contactUpdate', JSON.stringify($rootScope.contact));
//          	  $rootScope.emailSend = contact.email;
//          	  $rootScope.langueSend = langue;
//          	  LoadingService.dismiss();
//          	  console.log($rootScope.emailSend+"    "+$rootScope.langueSend);
//          	  $state.go('app.buzcardSend');
      		 var object = {
      	                email: $rootScope.contact.email.toLowerCase(),
      	                selectLang: langue,
      	                checkFollower: "on",
      	                dateRDV: rdv,
      	                idTmp:$rootScope.contact.id
      	            };
      	            SynchroServices.insertRequest(db, "BUZCARDSEND", object, function() {
      	            ///	LoadingService.loading($translate.instant('Buzcard.Msg'));
      	            	LoadingService.loading($translate.instant('BuzcardSend.LoadingSend'));
      	            	ConnectionService.isConnectedSYc(db,function() {

      	            		LoadingService.dismiss();
      	            		LoadingService.confirm2($translate.instant('ContactShow.MsgSend'), $rootScope.contact.id, "ContactShowController");
      	            		 MenuService.setLocalStorage('ReloadContactList',1);
      	                    /// $state.go('app.contactList');
      	            	},function(){
      	            		LoadingService.dismiss();
      	            		LoadingService.confirm2($translate.instant('ContactShow.MsgSendOFF',{ email: $rootScope.contact.email}), $rootScope.contact.id, "ContactShowController");
      	            		 MenuService.setLocalStorage('ReloadContactList',1);
      	                     ///$state.go('app.contactList');
      	            	});

      	            });
        }

        function sendBuzcardSMS(){
        	LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactShowController");
     	   if($rootScope.contact.phone_1 !=""){
     		   if (validatePhone($rootScope.contact.phone_1) && $rootScope.contact.phone_1.length>5) {
     	         	  $rootScope.fromState = "app.buzcardSend";
     	           LoadingService.loading($translate.instant("Loading4"));
     	           BuzcardService.selectProfile(db,function(rs){

     	           var phoneNumber = $rootScope.contact.phone_1;
     	           var buzcardOnline = localStorage.getItem("act");
     	           var link = $translate.instant("SMS.Msg",{ buzcardOnline: buzcardOnline, first_name: rs.rows.item(0).first_name });
     	           $cordovaSms.send(phoneNumber, link, {})
     	                .then(function() {
     	                  LoadingService.dismiss();
     	             	 LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phoneNumber}), $rootScope.contact.id, "ContactEditController");
     	                  /***********************\
     	                         SMS envoyé
     	                  \***********************/

     	                }, function(error) {
     	                   LoadingService.dismiss();
     	                   LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
     	                  //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
     	                });


     	              });
     	         }
     	   }else if($rootScope.contact.phone_2 !=""){
     		   if (validatePhone($rootScope.contact.phone_2) && $rootScope.contact.phone_2.length>5) {
     	         	  $rootScope.fromState = "app.buzcardSend";
     	           LoadingService.loading($translate.instant("Loading4"));
     	           BuzcardService.selectProfile(db,function(rs){

     	           var phoneNumber = $rootScope.contact.phone_2;
     	           var buzcardOnline = localStorage.getItem("act");
     	           var link = $translate.instant("SMS.Msg",{ buzcardOnline: buzcardOnline, first_name: rs.rows.item(0).first_name });
     	           $cordovaSms.send(phoneNumber, link, {})
     	                .then(function() {
     	                  LoadingService.dismiss();
     	             	 LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phoneNumber}), $rootScope.contact.id, "ContactShowController");
     	                  /***********************\
     	                         SMS envoyé
     	                  \***********************/

     	                }, function(error) {
     	                   LoadingService.dismiss();
     	                   LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
     	                  //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
     	                });


     	              });
     	         }
     	   }

        }

        /**
         *
         */
        $scope.buzwardContact = function(contact){
        	$rootScope.emailSend="";
        	$state.go('app.buzward', {id: contact.id });
        };

        $scope.ok2 = function(id) {

      		LoadingService.dismiss();


        };

        /**
         * click on button supprimer: delete contact
         */
        $scope.deleteContact = function() {
          LoadingService.question($translate.instant('ContactEdit.Msg7'),
                  $stateParams.id, "ContactShowController");
        };

        /**
         * click on button Non (popup suppression)
         */
        $scope.no = function() {
          LoadingService.dismiss();
        };

        /**
         * click on button Yes (pop up suppression )
         */
        $scope.yes = function(params) {
          ContactsService.deleteContactLocal(db, params, function() {
          	if($rootScope.oldGroupName !=''){
            ContactsService.selectContactByGroupName(db,$rootScope.oldGroupName,function(result){
              //cas où l'ancien groupe sera vide
              if (result.rows.length ==0){
                ContactsService.deleteGroupByName(db,$rootScope.oldGroupName, function(result){
                  // console.log("group is empty : deleted");
                });
              }
            });
          	}
          });

          //test de connection
         // LoadingService.loading($translate.instant('Buzcard.Msg'));
          ConnectionService.isConnectedWithoutSync(db,function() {
            // cas connecté
            // TODO FIXME il faut traiter le cas ou la session est expiré
            LoadingService.loading($translate.instant('ContactEdit.Msg8'));

            ContactsService.deleteContactServer(params,function(data){

              if (data.update.status =="done") {
                LoadingService.dismiss();
                //only for test
                MenuService.setLocalStorage('ReloadContactList',1);
                $state.go('app.contactList');
                //LoadingService.confirmDelete($translate.instant('ContactEdit.deleteContact'), "ContactListController");
              } else {
                LoadingService.error($translate.instant('Msg3'),"ContactShowController");
              }

            },function(status){
              // console.error(status);
              LoadingService.error($translate.instant('Msg3'),"ContactShowController");
            });

          }, function() {
            //cas non connecté
            SynchroServices.insertRequest(db,"CONTACTDELETE",{id:$stateParams.id},function(){

              LoadingService.dismiss();
              MenuService.setLocalStorage('ReloadContactList',1);
              $state.go('app.contactList');
            //  LoadingService.confirmDelete($translate.instant('ContactEdit.deleteContact'), "ContactListController");
            });

          });
        };

        $scope.okDelete = function(){
        	LoadingService.dismiss();
        	$state.go('app.contactList');
        }
        /*******  Cut Link  ********/
        $scope.cutLink = function(contact){
          LoadingService.questionCutLink($translate.instant('ContactEdit.questionCutLink'),$stateParams.id, "ContactShowController");
        }

        $scope.yesCutLink = function(contact_id){

          SynchroServices.insertRequest(db, "CONTACTEDIT", {
              id: contact_id,
              contact: {vcardprofil : -1}
          }, function(result) {
             ContactsService.updateContactByField(db,"vcardprofil","-1", contact_id,function(){
            	 ContactsService.updateContactByField(db,"status", "not_selected", contact_id,function(){
            	 
               LoadingService.dismiss()
               $state.go('app.contactList');
            	 });
             });
          });

        }
        /*******  Cut Link  ********/



        function validatePhone(phone){
            var re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/ ;
            return re.test(phone);
          }

    }]);
