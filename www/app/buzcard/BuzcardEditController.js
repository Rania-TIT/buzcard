appContext.controller('BuzcardEditController', [
    'BuzcardService',
    'cameraService',
    '$scope',
    '$state',
    '$ionicPlatform',
    '$cordovaSQLite',
    '$cordovaFile',
    'LoadingService',
    '$ionicHistory',
    'ConnectionService',
    'SynchroServices',
    '$ionicScrollDelegate',
    'MenuService',
    '$rootScope','$translate','$interval',
    function(BuzcardService, cameraService, $scope, $state, $ionicPlatform,
        $cordovaSQLite, $cordovaFile, LoadingService,$ionicHistory,ConnectionService,SynchroServices,$ionicScrollDelegate,MenuService,$rootScope,$translate,$interval) {

    	if(MenuService.getLocalStorage("customisation")){
    		var custoArray = MenuService.getLocalStorage("customisation");
    		$scope.firstColor = custoArray[3];
    	}

        var db = null;
        var tmpProfil ={};
        $ionicPlatform.ready(function() {
            /**
             * create/open DB
             */
            if (window.cordova) {
            	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
            } else {
                db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
            }
            showInfos();
        });

        /**
         * get infos profil
         */
        function showInfos() {
        	 var isWindowsPhone = ionic.Platform.isWindowsPhone();
             if (window.cordova) {
               if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                 $rootScope.path = cordova.file.applicationStorageDirectory;
               } else if (isWindowsPhone) {
                 $rootScope.path = "//";
               } else {
                 $rootScope.path = cordova.file.dataDirectory;
               }
             }
            BuzcardService.selectProfile(db, function(result) {
            	var isWindowsPhone = ionic.Platform.isWindowsPhone();
                var profil = result.rows.item(0);
                $scope.infos = profil;
                $scope.infos.first_name = removeSlashes(profil.first_name);
                $scope.infos.last_name = removeSlashes(profil.last_name);
                $scope.infos.facebook = removeSlashes(profil.facebook);
                $scope.infos.twitter = removeSlashes(profil.twitter);
                $scope.infos.flickr = removeSlashes(profil.flickr);
                $scope.infos.linkedin = removeSlashes(profil.linkedin);
                $scope.infos.viadeo = removeSlashes(profil.viadeo);
                $scope.infos.instagram = removeSlashes(profil.instagram);
                $scope.infos.youtube = removeSlashes(profil.youtube);
                $scope.infos.snapchat = removeSlashes(profil.snapchat);
                $scope.infos.website = removeSlashes(profil.website);
                $scope.infos.skype = removeSlashes(profil.skype);
                $scope.infos.xing = removeSlashes(profil.xing);
                $scope.infos.myspace = removeSlashes(profil.myspace);
                $scope.infos.delicious = removeSlashes(profil.delicious);
                $scope.infos.rss = removeSlashes(profil.rss);
                $scope.infos.link_title_1 = removeSlashes(profil.link_title_1);
                $scope.infos.link_title_2 = removeSlashes(profil.link_title_2);
                $scope.infos.link_title_3 = removeSlashes(profil.link_title_3);
                $scope.infos.link_title_4 = removeSlashes(profil.link_title_4);
                $scope.infos.company = removeSlashes(profil.company);
                $scope.infos.country = removeSlashes(profil.country);
                $scope.infos.city = removeSlashes(profil.city);
                $scope.infos.city_p = removeSlashes(profil.city_p);
                $scope.infos.foursquare = removeSlashes(profil.foursquare);
                $scope.infos.googleplus = removeSlashes(profil.googleplus);
                $scope.infos.pinterest = removeSlashes(profil.pinterest);
                $scope.infos.position = removeSlashes(profil.position);
                $scope.infos.network = removeSlashes(profil.network);
                $scope.infos.address_line_1 = removeSlashes(profil.address_line_1);
                $scope.infos.address_line_2 = removeSlashes(profil.address_line_2);
                $scope.infos.address_line_3 = removeSlashes(profil.address_line_3);

                $scope.infos.address_p_line_1 = removeSlashes(profil.address_p_line_1);
                $scope.infos.address_p_line_2 = removeSlashes(profil.address_p_line_2);
                $scope.infos.address_p_line_3 = removeSlashes(profil.address_p_line_3);

                $scope.infos.news_1 = removeSlashes(profil.news_1);
                $scope.infos.news_2 = removeSlashes(profil.news_2);
                $scope.infos.news_3 = removeSlashes(profil.news_3);
                tmpProfil =angular.copy(result.rows.item(0));
               // $scope.photoProfil = profil.photolocation;
                // activer l'onglet coordonnées par defaut
                var fileName = profil.photolocation.substr(profil.photolocation.lastIndexOf('/') + 1);
                console.log(result.rows.item(0).photolocation);
                
                if(result.rows.item(0).photolocation !='' ){
             		 $scope.photoProfil = $rootScope.path+fileName;
             		 }else{
             			$scope.photoProfil = "img/photo_top_title.jpg";
             		 }
                console.log($scope.photoProfil);
                $scope.isSelectedCordonnees = true;
            });
            LoadingService.dismiss();
        };

        /**
         * capture photo
         */
        $scope.getPhoto = function() {
        	if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
       		
                cordova.plugins.diagnostic.requestRuntimePermission(function(status){

                if(status == cordova.plugins.diagnostic.permissionStatus.GRANTED){

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
            	LoadingService.loading($translate.instant('BuzcardEdit.getPhoto'));
                var fileName = $rootScope.idProfil+'_'+new Date().getTime()+'.jpg';
                $scope.photoProfil = imageURI;
                var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
                if (imageURL =='') {
                 imageURL = imageURI;
                }else{
                 imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
                }
                var isWindowsPhone = ionic.Platform.isWindowsPhone();
                cameraService.RenamePicture(fileName, imageURL, function(url) {
                	BuzcardService.updatePhotoFileLocation(db, url, $rootScope.idProfil, function(){
                		  	$scope.photoProfil = url; // "img/photo_top_title.jpg";
                   	  });


                    	// cas pas de connection
                      SynchroServices.insertRequest(db, "BUZCARDPHOTO", {path: url}, function() {
                          LoadingService.dismiss();
                          console.log("Synchro en background from buzcard edit");
//                          SynchroServices.selectAllRequest(db, function(rs) {
//
//                              if (rs.rows.length > 0 && !$rootScope.isBackgroudRuning) {
//                                  $rootScope.isBackgroudRuning = true;
//                                  ConnectionService.isConnected(db, function() {
//                                    $rootScope.isBackgroudRuning = false;
//                                      console.log("synchro auto terminé");
//                                      //LoadingService.dismiss();
//                                  }, function() {
//                                    $rootScope.isBackgroudRuning = false;
//                                      console.log("pas de conexion");
//                                      LoadingService.dismiss();
//                                  });
//                              }
//                          });
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
                },cordova.plugins.diagnostic.permission.CAMERA);
                  
    	 }else{



    		 cordova.plugins.diagnostic.requestCameraAuthorization(function(status){

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
                	LoadingService.loading($translate.instant('BuzcardEdit.getPhoto'));
                    var fileName = $rootScope.idProfil+'_'+new Date().getTime()+'.jpg';
                    $scope.photoProfil = imageURI;
                    var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
                    if (imageURL =='') {
                     imageURL = imageURI;
                    }else{
                     imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
                    }
                    var isWindowsPhone = ionic.Platform.isWindowsPhone();
                    cameraService.RenamePicture(fileName, imageURL, function(url) {
                    	BuzcardService.updatePhotoFileLocation(db, url, $rootScope.idProfil, function(){
                    		  	$scope.photoProfil = url; // "img/photo_top_title.jpg";
                       	  });

                        	// cas pas de connection
                        	 SynchroServices.insertRequest(db, "BUZCARDPHOTO", {path:url}, function() {
                        		 // console.log('Request inserted BUZCARDPHOTO');
                        		 LoadingService.dismiss();
//             						console.log("Synchro en background Buzcard edit");
//             						SynchroServices.selectAllRequest(db,function(rs){
//             							console.log("Nb request dans la File: "+ rs.rows.length);
//             							if (rs.rows.length > 0 && !$rootScope.isBackgroudRuning) {
//                          $rootScope.isBackgroudRuning = true;
//             								ConnectionService.isConnected(db, function(){
//             									console.log("synchro auto terminé");
//                              $rootScope.isBackgroudRuning = false;
//             								},function(){
//                              $rootScope.isBackgroudRuning = false;
//             									console.log("pas de conexion");
//             									LoadingService.dismiss();
//             								});
//             							}
//             						});
                             });
                       // });
                    });
                }, function(err) {
                    // console.error(err);
                });
    	    }else{
    	    	if($rootScope.requestAutorisecamera >=1)
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


                cordova.plugins.diagnostic.requestRuntimePermission(function(status){

                if(status == cordova.plugins.diagnostic.permissionStatus.GRANTED){

        	  var options = {
                      quality: 100,
                      destinationType: Camera.DestinationType.FILE_URI,
                      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                      encodingType: Camera.EncodingType.JPEG,
                      targetWidth: 500,
                      targetHeight: 500,
                      //correctOrientation: true,
                      popoverOptions: CameraPopoverOptions
                  };

            cameraService.getPicture(options).then(function(imageURI) {
            	LoadingService.loading($translate.instant('BuzcardEdit.getPhoto'));
            	 var fileName = $rootScope.idProfil+'_'+new Date().getTime()+'.jpg';
                $scope.photoProfil = imageURI;

                var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
                if (imageURL =='') {
                 imageURL = imageURI;
                }else{
                 imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
                }

                var isWindowsPhone = ionic.Platform.isWindowsPhone();


                cameraService.RenamePicture(fileName, imageURL, function(url) {

                	BuzcardService.updatePhotoFileLocation(db, url, $rootScope.idProfil, function(){
            		  	$scope.photoProfil = url;
               	  });
                    	// cas pas de connexion
                    	 SynchroServices.insertRequest(db, "BUZCARDPHOTO", {path:url}, function() {
                    		 // console.log('Request inserted BUZCARDPHOTO');
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
            },cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE);
   	 }else{


   		cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status){

        	  if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){


   	     var options = {
                 quality: 100,
                 destinationType: Camera.DestinationType.FILE_URI,
                 sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                 encodingType: Camera.EncodingType.JPEG,
                 targetWidth: 500,
                 targetHeight: 500,
               //  correctOrientation: true,
                 popoverOptions: CameraPopoverOptions
             };

       cameraService.getPicture(options).then(function(imageURI) {
       	LoadingService.loading($translate.instant('BuzcardEdit.getPhoto'));
       	 var fileName = $rootScope.idProfil+'_'+new Date().getTime()+'.jpg';
           $scope.photoProfil = imageURI;

           var imageURL =imageURI.substr(0, imageURI.lastIndexOf('?'));
           if (imageURL =='') {
            imageURL = imageURI;
           }else{
            imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
           }

           var isWindowsPhone = ionic.Platform.isWindowsPhone();


           cameraService.RenamePicture(fileName, imageURL, function(url) {

           	BuzcardService.updatePhotoFileLocation(db, url, $rootScope.idProfil, function(){
       		  	$scope.photoProfil = url;
          	  });
               	// cas pas de connexion
               	 SynchroServices.insertRequest(db, "BUZCARDPHOTO", {path:url}, function() {

                    LoadingService.dismiss();
//                    console.log("get request");
//                    SynchroServices.selectAllRequest(db,function(rs){
//                      console.log("Nb request dans la File: "+ rs.rows.length);
//                      if (rs.rows.length > 0 && !$rootScope.isBackgroudRuning) {
//                        $rootScope.isBackgroudRuning  = true;
//                        ConnectionService.isConnected(db, function(){
//                          console.log("synchro auto terminé");
//                          $rootScope.isBackgroudRuning = false;
//                          //LoadingService.dismiss();
//                        },function(){
//                          $rootScope.isBackgroudRuning = false;
//                          console.log("pas de conexion");
//                          LoadingService.dismiss();
//                        });
//                      }
//                    });

               });

           });
       }, function(err) {
           // console.error(err);
       });
   	 }else{
   		 if($rootScope.requestAutorisePhoto >=1)
	    	 LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserPhoto'), 'ContactEditController');
   		 	$rootScope.requestAutorisePhoto++;
	    }
	});
	 }
        };

        /**
         * update infos profil
         */
         $scope.updateProfile = function() {
            LoadingService.loading($translate.instant('Buzcard.Msg'));
             BuzcardService.updateProfil(db, $scope.infos, function(profil) {

               /***********************\
                préparation de l'objet
               \***********************/
               var profilObj = {};
               for (var key in tmpProfil)
                   if ($scope.infos[key] != removeSlashes(tmpProfil[key]))
                       profilObj[key] = addSlashes($scope.infos[key]);
               //if there is no difference (no modification)
               if (isEmpty(profilObj)) {
                   LoadingService.dismiss();
                   $state.go("app.buzcard");
               } else {

                 SynchroServices.insertRequest(db, "BUZCARDEDIT", {
                     profile: profilObj
                 }, function() {
                	 LoadingService.dismiss();
                	 $state.go("app.buzcard", {}, {reload: true});
//                   SynchroServices.selectAllRequest(db, function(rs) {
//                      if (rs.rows.length > 0 && !$rootScope.isBackgroudRuning) {
//                          $rootScope.isBackgroudRuning = true;
//                          ConnectionService.isConnected(db, function() {
//                              $rootScope.isBackgroudRuning = false;
//                              LoadingService.dismiss();
//                              $state.go("app.buzcard", {}, {reload: true});
//                          }, function() {
//                              LoadingService.dismiss();
//                              $rootScope.isBackgroudRuning = false;
//                              $state.go("app.buzcard", {}, {reload: true});
//                          });
//                      }else {
//                        LoadingService.dismiss();
//                        $state.go("app.buzcard", {}, {reload: true});
//                      }
//                  });

                 });
               }


             });
         };

        /**
         * select l'onglet actif
         */
        $scope.selectElement = function(element, event) {
            $scope.blur();
            if (element == 'Coordonnes')
                $scope.isSelectedCordonnees = !$scope.isSelectedCordonnees;

            else if (element == 'Adresse')
                $scope.isSelectedAdresse = !$scope.isSelectedAdresse;

            else if (element == 'Adresse_p')
                $scope.isSelectedAdresse_p = !$scope.isSelectedAdresse_p;

            else if (element == 'rxSociaux')
                $scope.isSelectedrxSociaux = !$scope.isSelectedrxSociaux;

            else if (element == 'link')
                $scope.isSelectedLink = !$scope.isSelectedLink;

            else if (element == 'news')
                $scope.isSelectedNews = !$scope.isSelectedNews;

            $ionicScrollDelegate.resize();
        };

        $scope.dismiss = function() {
            LoadingService.dismiss();
        };

        function isEmpty(value){
          return Boolean(value && typeof value == 'object') && !Object.keys(value).length;
        };
        /**
         * on click sur le bouton precedant ou le bouton ok du clavier
         */
        $scope.keyPressed = function(keyEvent) {

       		  if (keyEvent.keyCode == 13) {

              cordova.plugins.Keyboard.close();
       		  }

        };

        //on focus
        $scope.focus = function() {
        	$rootScope.focused = true;
        	 var x = window.scrollX, y = window.scrollY;
             window.scrollTo(x, y);
        };
        //on blr
        $scope.blur = function() {
        	$rootScope.focused = false;
        };
        $scope.ok = function(){
        	LoadingService.dismiss();
//				console.log("synchro background");
//				SynchroServices.selectAllRequest(db,function(rs){
//					console.log("Nb request dans la File: "+ rs.rows.length);
//					if (rs.rows.length > 0 && !$rootScope.isBackgroudRuning) {
//					//alert($rootScope.sychroEncours);
//						ConnectionService.isConnected(db, function(){
//							console.log("synchro auto terminé");
//							//LoadingService.dismiss();
//						},function(){
//							console.log("pas de conexion");
//							LoadingService.dismiss();
//						});
//					}
//				});
            $state.go("app.buzcard", {}, {reload: true});
          };
    }
]);
