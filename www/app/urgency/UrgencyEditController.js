appContext.controller('UrgencyEditController', [
	'$ionicScrollDelegate','$ionicSideMenuDelegate',
    '$scope',
    '$state',
    '$ionicPlatform',
    '$cordovaSQLite',
    '$rootScope',
    'LoadingService','$ionicHistory','$ionicModal','$translate','UrgencyService','ConnectionService','cameraService','SynchroServices',
    function($ionicScrollDelegate,$ionicSideMenuDelegate, $scope, $state, $ionicPlatform,
            $cordovaSQLite, $rootScope,LoadingService,$ionicHistory,$ionicModal,$translate,UrgencyService,ConnectionService,cameraService,SynchroServices) {

      var db = null;
      var tmpcard ={};

      $ionicPlatform.ready(function() {

    	  	$ionicSideMenuDelegate.canDragContent(false);

	        /**
	         * create/open DB
	         */
	        if (window.cordova) {
	        	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
	        } else {
	          db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
	        }
	        //---------------
	        getInfos();
	         //---------------
	        $scope.isSelectedOnglet1=true;
	        $scope.isSelectedOnglet2=true;

      });

      function getInfos(){
    	  UrgencyService.selectUrgency(db,function(result){
    		  if(result.rows.length >0){

          		$scope.card = result.rows.item(0);
							for (key in result.rows.item(0)) {
								$scope.card[key] =  removeSlashes( result.rows.item(0)[key]);
							}
          		tmpcard =angular.copy(result.rows.item(0));
          		$rootScope.idCard=result.rows.item(0).id;
          		 var fileName = result.rows.item(0).photofilelocation.substr(result.rows.item(0).photofilelocation.lastIndexOf('/')+1);
          		 if(result.rows.item(0).photofilelocation !=''){
          		 $scope.photoProfil = $rootScope.path+fileName;
          		 }else{
          			$scope.photoProfil = "img/photo_top_title.jpg";
          		 }
//                 cameraService.checkExistFile(fileName,function(url) {
//                 if(url =="img/photo_top_title.jpg" ){
//                	 UrgencyService.downloadPhotoUrgency(db, window.localStorage.getItem('photoFileLocationUrgency'), result.rows.item(0).id, function(urlImge) {
//                 			$scope.photoProfil = urlImge;
//                 	});
//                	}else{
//                		$scope.photoProfil = url;
//                 	}
//                 });

    		  }else{
    			  $scope.card = new Object();
    		  }
    	  });
      }

      $scope.update =function(cardScope){
    	  LoadingService.dismiss();
    	  $rootScope.cardScope = cardScope;
				if ($scope.photoProfil == "img/photo_top_title.jpg") {

						LoadingService.success($translate.instant('UrgencyEdit.needPhoto'),"UrgencyEditController");
				} else {

		if(cardScope.social_welfare_number!="" || cardScope.insurance !="" ||cardScope.insurance_number !="" || cardScope.mutual !="" || cardScope.mutual_number!="" ||
		cardScope.doctorname !="" || cardScope.doctornumber !="" || cardScope.doctoreamail !="" || cardScope.specalistenumber1 !="" || cardScope.specalistenumber2 !="" ||
		cardScope.antecedents !="" || cardScope.antecedents2 !="" || cardScope.pathology !="" || cardScope.pathology2 !="" || cardScope.treatment !="" ||
		cardScope.treatment2 !="" || cardScope.allergies !="" || cardScope.allergies2 !="" || cardScope.blood_group !="" || cardScope.contact_lens !="" || cardScope.organ_donation !="" ||
		cardScope.first_aid !="" || cardScope.risk_sports !="" || cardScope.comment2 !="" || cardScope.schedule_of_benefits !="" || cardScope.limits_and_exclusions !=""){
			 LoadingService.confirmOnglet2($translate.instant('UrgencyEdit.PopUpOnglet2'), "UrgencyEditController");
		}else{
    	  LoadingService.loading($translate.instant('UrgencyEdit.LoadingUpdate'));
    	  // console.log($scope.card);
          UrgencyService.updateUrgency(db, cardScope, function(card) {

						LoadingService.loading($translate.instant('Buzcard.Msg'));

						//cas ou il y a de connection

						/***********************\
						 préparation de l'objet
						\***********************/
						var cardObj = {};
						for (var key in tmpcard){
							if(cardScope[key] != tmpcard[key]){
							 cardObj[key] = cardScope[key];
						 }
						}

						//if there is no difference (no modification)
						delete cardObj.photofilelocation;

						if (isEmpty(cardObj)) {
				      LoadingService.dismiss();
				      $rootScope.needPassword = true;

				      localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});

				    } else {
							console.info("not an empty object")
//							ConnectionService.isConnected(db,function() {
//										console.warn("connected");
//										  UrgencyService.updateUrgencyServer(0, cardObj, function(data) {
//												if (data.response.status == 0) {
//								          LoadingService.dismiss();
//								          $rootScope.needPassword = true;
//
//								          localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});
//								        } else {
//								            LoadingService.error($translate.instant('Msg3'), "UrgencyEditController");
//								        }
//											},function(){
//												LoadingService.error($translate.instant('Msg3'), "UrgencyEditController");
//											});
//
//							}, function() {
								// cas s'il pas de connection

								/***********************\
								 préparation de l'objet
								\***********************/
								SynchroServices.insertRequest(db, "URGENCYEDIT", {vcard:cardObj} , function() {
					          LoadingService.dismiss();
					          $rootScope.needPassword = true;

					          localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});
					      });
							//});
						}

          });
		}
				}

      };
      $scope.confirmRequest= function(accord){
    	  console.log(accord);
    	  if(accord){
    		  LoadingService.loading($translate.instant('UrgencyEdit.LoadingUpdate'));
        	  // console.log($scope.card);
              UrgencyService.updateUrgency(db, $rootScope.cardScope, function(card) {

    						LoadingService.loading($translate.instant('Buzcard.Msg'));

    						//cas ou il y a de connection

    						/***********************\
    						 préparation de l'objet
    						\***********************/
    						var cardObj = {};
    						for (var key in tmpcard){
    							if($rootScope.cardScope[key] != tmpcard[key]){
    							 cardObj[key] = $rootScope.cardScope[key];
    						 }
    						}

    						//if there is no difference (no modification)
    						delete cardObj.photofilelocation;

    						if (isEmpty(cardObj)) {
    				      LoadingService.dismiss();

    				      localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});
    				      $rootScope.needPassword =false;
    				      $rootScope.shown2=false;

    				    } else {
    							console.info("not an empty object")
//    							ConnectionService.isConnected(db,function() {
//    										console.warn("connected");
//    										  UrgencyService.updateUrgencyServer(0, cardObj, function(data) {
//    												if (data.response.status == 0) {
//    								          LoadingService.dismiss();
//    								          $rootScope.needPassword =false;
//    								          $rootScope.shown2=false;
//
//    								          localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});
//    								        } else {
//    								            LoadingService.error($translate.instant('Msg3'), "UrgencyEditController");
//    								        }
//    											},function(){
//    												LoadingService.error($translate.instant('Msg3'), "UrgencyEditController");
//    											});
//
//    							}, function() {
    								// cas s'il pas de connection

    								/***********************\
    								 préparation de l'objet
    								\***********************/
    								SynchroServices.insertRequest(db, "URGENCYEDIT", {vcard:cardObj} , function() {
    					          LoadingService.dismiss();
    					          $rootScope.needPassword =false;

    					          localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});
    					      });
    						//	});
    						}

              });
    	  }else{
    		  LoadingService.loading($translate.instant('UrgencyEdit.LoadingUpdate'));
        	  // console.log($scope.card);
              UrgencyService.updateUrgency(db, $rootScope.cardScope, function(card) {

    						LoadingService.loading($translate.instant('Buzcard.Msg'));

    						//cas ou il y a de connection

    						/***********************\
    						 préparation de l'objet
    						\***********************/
    						var cardObj = {};
    						for (var key in tmpcard){
    							if($rootScope.cardScope[key] != tmpcard[key]){
    							 cardObj[key] = $rootScope.cardScope[key];
    						 }
    						}

    						//if there is no difference (no modification)
    						delete cardObj.photofilelocation;

    						if (isEmpty(cardObj)) {
    				      LoadingService.dismiss();


    				      $rootScope.needPassword =false;
    				    } else {
    							console.info("not an empty object")
//    							ConnectionService.isConnected(db,function() {
//    										console.warn("connected");
//    										  UrgencyService.updateUrgencyServer(0, cardObj, function(data) {
//    												if (data.response.status == 0) {
//    								          LoadingService.dismiss();
//    								          $rootScope.needPassword =false;
//
//    								          localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});
//    								        } else {
//    								            LoadingService.error($translate.instant('Msg3'), "UrgencyEditController");
//    								        }
//    											},function(){
//    												LoadingService.error($translate.instant('Msg3'), "UrgencyEditController");
//    											});
//
//    							}, function() {
    								// cas s'il pas de connection

    								/***********************\
    								 préparation de l'objet
    								\***********************/
    								SynchroServices.insertRequest(db, "URGENCYEDIT", {vcard:cardObj} , function() {
    					          LoadingService.dismiss();
    					          $rootScope.needPassword =false;

    					          localStorage.setItem("EmergencyReload",true);$state.go("app.urgency",{}, {reload: true, inherit: false});
    					      });
    							//});
    						}

              });
    	  }
      }
      /**
       * select l'onglet actif
       */
      $scope.selectElement = function(element, event) {
				$scope.blur();
          if (element == 'Onglet1')
              $scope.isSelectedOnglet1 = !$scope.isSelectedOnglet1;

          else if (element == 'Onglet2')
              $scope.isSelectedOnglet2 = !$scope.isSelectedOnglet2;



          $ionicScrollDelegate.resize();
      };

      $scope.dismiss = function() {
          LoadingService.dismiss();
      };
      $scope.ok = function() {
          LoadingService.dismiss();
      };
      //on focus
      $scope.focus = function() {
      	$rootScope.focused = true;
      };
      //on blr
      $scope.blur = function() {
      	$rootScope.focused = false;
      };

      $scope.getPhoto = function() {
    	  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
              cordova.plugins.diagnostic.requestRuntimePermissions(function(statuses){
              	var ArrayPermission=[];
              	var i=0
              	 for (var permission in statuses){
              		 console.log(statuses[permission]);
              		 if(statuses[permission] == cordova.plugins.diagnostic.permissionStatus.GRANTED){
              			 ArrayPermission[i]=true;
              			 i++;
              		 }else{
              			 ArrayPermission[i]=false;
              			 i++; 
              		 }
     
                }
              if(ArrayPermission[0]  && ArrayPermission[1]){
          var options = {
              quality: 50,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.CAMERA,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 500,
              targetHeight: 500,
              correctOrientation: true,
              popoverOptions: CameraPopoverOptions

          };
          cameraService.getPicture(options).then(function(imageURI) {
          	LoadingService.loading($translate.instant('UrgencyEdit.getPhoto'));
              var fileName = $rootScope.idCard+'_'+new Date().getTime()+'.jpg';
              $scope.photoProfil = imageURI;
              var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
              if (imageURL =='') {
               imageURL = imageURI;
              }else{
               imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              }

              cameraService.RenamePicture(fileName, imageURL, function(url) {

            	  UrgencyService.updatePhotoFileLocation(db, url, $rootScope.idCard, function(){
                   $scope.card.photofilelocation = url;
              		  	$scope.photoProfil = url; // "img/photo_top_title.jpg";
              			LoadingService.dismiss();
                 	  });

            	  LoadingService.loading($translate.instant('Buzcard.Msg'));
//                  ConnectionService.isConnected(db,function() {
//                  //cas il ya connection
//                  UrgencyService.uploadPhotoUrgency(url, function() {
//                  	LoadingService.dismiss();
//                      // console.log('success upload PHOTO');
//                  }, function(){
//                  	LoadingService.dismiss();
//                	  // console.log('erreur upload photo buzcard');
//                  });
//                  },function(){
                  	// cas pas de connection
                  	 SynchroServices.insertRequest(db, "URGENCYPHOTO", {path:url}, function() {
                  		 // console.log('Request inserted URGENCYPHOTO');
                  		 LoadingService.dismiss();
                       });
                //  });
              });
          }, function(err) {
              // console.error(err);
          });
              }
              }, function(error){
                  console.error("The following error occurred: "+error);
                  $rootScope.isBackgroudRuning = false;
              }, [cordova.plugins.diagnostic.permission.CAMERA,cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);
                
       	 }else{



       		cordova.plugins.diagnostic.requestCameraAuthorization(function(status){
         		//alert('camera permission '+status);
            	 /// alert("App is " + (authorized ? "authorized" : "denied") + " access to camera");
//
            	  if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){

       	    	var options = {
       	              quality: 50,
       	              destinationType: Camera.DestinationType.FILE_URI,
       	              sourceType: Camera.PictureSourceType.CAMERA,
       	              encodingType: Camera.EncodingType.JPEG,
       	              targetWidth: 500,
       	              targetHeight: 500,
       	              correctOrientation: true,
       	              popoverOptions: CameraPopoverOptions

       	          };
       	          cameraService.getPicture(options).then(function(imageURI) {
       	          	LoadingService.loading($translate.instant('UrgencyEdit.getPhoto'));
       	              var fileName = $rootScope.idCard+'_'+new Date().getTime()+'.jpg';
       	              $scope.photoProfil = imageURI;
       	              var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
       	              if (imageURL =='') {
       	               imageURL = imageURI;
       	              }else{
       	               imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
       	              }

       	              cameraService.RenamePicture(fileName, imageURL, function(url) {

       	            	  UrgencyService.updatePhotoFileLocation(db, url, $rootScope.idCard, function(){
       	                   $scope.card.photofilelocation = url;
       	              		  	$scope.photoProfil = url; // "img/photo_top_title.jpg";
       	              			LoadingService.dismiss();
       	                 	  });

//       	            	  LoadingService.loading($translate.instant('Buzcard.Msg'));
//       	                  ConnectionService.isConnected(db,function() {
//       	                  //cas il ya connection
//       	                  UrgencyService.uploadPhotoUrgency(url, function() {
//       	                  	LoadingService.dismiss();
//       	                      // console.log('success upload PHOTO');
//       	                  }, function(){
//       	                  	LoadingService.dismiss();
//       	                	  // console.log('erreur upload photo buzcard');
//       	                  });
//       	                  },function(){
       	                  	// cas pas de connection
       	                  	 SynchroServices.insertRequest(db, "URGENCYPHOTO", {path:url}, function() {
       	                  		 // console.log('Request inserted URGENCYPHOTO');
       	                  		 LoadingService.dismiss();
       	                       });
       	              //    });
       	              });
       	          }, function(err) {
       	              // console.error(err);
       	          });
       	   }else{
       		   if($rootScope.requestAutorisecamera >= 1)
    	    	 LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserCamera'), 'ContactEditController');
       		$rootScope.requestAutorisecamera++;
    	    }
    	});
     	 }
      };
      /**
       * choose file from library
       */
      $scope.choseFile = function() {
    	  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
     		

              cordova.plugins.diagnostic.requestRuntimePermissions(function(statuses){
              	var ArrayPermission=[];
              	var i=0
              	 for (var permission in statuses){
              		 console.log(statuses[permission]);
              		 if(statuses[permission] == cordova.plugins.diagnostic.permissionStatus.GRANTED){
              			 ArrayPermission[i]=true;
              			 i++;
              		 }else{
              			 ArrayPermission[i]=false;
              			 i++; 
              		 }
     
                }
              if(ArrayPermission[0]  && ArrayPermission[1]){
      	  var options = {
                    quality: 100,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWidth: 500,
                    targetHeight: 500,
                    correctOrientation: true,
                    popoverOptions: CameraPopoverOptions
                };

          cameraService.getPicture(options).then(function(imageURI) {
          	LoadingService.loading($translate.instant('UrgencyEdit.getPhoto'));
          	 var fileName = $rootScope.idCard+'_'+new Date().getTime()+'.jpg';
              $scope.photoProfil = imageURI;

              var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
              if (imageURL =='') {
               imageURL = imageURI;
              }else{
               imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              }

              var isWindowsPhone = ionic.Platform.isWindowsPhone();


              cameraService.RenamePicture(fileName, imageURL, function(url) {
            	  UrgencyService.updatePhotoFileLocation(db, url, $rootScope.idCard, function(){
                      $scope.card.photofilelocation = url;
          		  	$scope.photoProfil = url; // "img/photo_top_title.jpg";
          		  LoadingService.dismiss();
             	  });

//                  ConnectionService.isConnected(db,function() {
//                  	//cas ou il ya connexion
//                  	  UrgencyService.uploadPhotoUrgency(url, function() {
//                  		  LoadingService.dismiss();
//                            // console.log('success upload PHOTO');
//                        }, function(){
//                      	  LoadingService.dismiss();
//                        	  // console.log('erreur upload photo buzcard');
//                        });
//                  },function(){
                  	// cas pas de connexion
                  	 SynchroServices.insertRequest(db, "URGENCYPHOTO", {path:url}, function() {
                  		 // console.log('Request inserted URGENCYPHOTO');
                  		 LoadingService.dismiss();
                  });

              // });
              });
          }, function(err) {
              // console.error(err);
          });
     			  }
             }, function(error){
                 console.error("The following error occurred: "+error);
                 $rootScope.isBackgroudRuning = false;
             }, [cordova.plugins.diagnostic.permission.CAMERA,cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);
               
      	 }else{



      		cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status){
         		//alert('camera permission '+status);
            	 /// alert("App is " + (authorized ? "authorized" : "denied") + " access to camera");
//
            	  if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){


      	    	var options = {
                        quality: 100,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 500,
                        targetHeight: 500,
                        correctOrientation: true,
                        popoverOptions: CameraPopoverOptions
                    };

              cameraService.getPicture(options).then(function(imageURI) {
              	LoadingService.loading($translate.instant('UrgencyEdit.getPhoto'));
              	 var fileName = $rootScope.idCard+'_'+new Date().getTime()+'.jpg';
                  $scope.photoProfil = imageURI;

                  var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
                  if (imageURL =='') {
                   imageURL = imageURI;
                  }else{
                   imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
                  }

                  var isWindowsPhone = ionic.Platform.isWindowsPhone();


                  cameraService.RenamePicture(fileName, imageURL, function(url) {
                	  UrgencyService.updatePhotoFileLocation(db, url, $rootScope.idCard, function(){
                          $scope.card.photofilelocation = url;
              		  	$scope.photoProfil = url; // "img/photo_top_title.jpg";
              		  LoadingService.dismiss();
                 	  });

//                      ConnectionService.isConnected(db,function() {
//                      	//cas ou il ya connexion
//                      	  UrgencyService.uploadPhotoUrgency(url, function() {
//                      		  LoadingService.dismiss();
//                                // console.log('success upload PHOTO');
//                            }, function(){
//                          	  LoadingService.dismiss();
//                            	  // console.log('erreur upload photo buzcard');
//                            });
//                      },function(){
//                      	// cas pas de connexion
                      	 SynchroServices.insertRequest(db, "URGENCYPHOTO", {path:url}, function() {
                      		 // console.log('Request inserted URGENCYPHOTO');
                      		 LoadingService.dismiss();
                      });

                 //  });
                  });
              }, function(err) {
                  // console.error(err);
              });
      	  }else{
      		  if($rootScope.requestAutorisePhoto >= 1)
 	    	 LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserPhoto'), 'ContactEditController');
      		$rootScope.requestAutorisePhoto ++;
 	    }
 	});
  	 }
      };
      function isEmpty(value){
          return Boolean(value && typeof value == 'object') && !Object.keys(value).length;
        };

	}]);
