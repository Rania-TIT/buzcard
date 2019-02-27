appContext.controller('UrgencyController', [
	'$ionicSideMenuDelegate',
    '$scope',
    '$state',
    '$ionicPlatform',
    '$cordovaSQLite',
    '$rootScope',
    'LoadingService','$ionicModal','$translate','UrgencyService','ConnectionService','cameraService','$ionicPopup','LoginService','QrCodeServices','ionicToast','$timeout','BuzcardService',
    function($ionicSideMenuDelegate,$scope, $state, $ionicPlatform,
            $cordovaSQLite, $rootScope,LoadingService,$ionicModal,$translate,UrgencyService,ConnectionService,cameraService, $ionicPopup, LoginService,QrCodeServices,ionicToast,$timeout,BuzcardService) {

      var db = null;
			//$rootScope.needPassword = true;
			$rootScope.showWrongPassword=false;
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

	         //---------------

		     $scope.$on('$ionicView.beforeEnter', function() {
					 getInfos();
				 });
      });

      function getInfos(){
    	  var isWindowsPhone = ionic.Platform.isWindowsPhone();
          if (window.cordova) {
              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                  $rootScope.path = cordova.file.applicationStorageDirectory;
              }else if (isWindowsPhone) {
              	$rootScope.path = "//";
	              } else {
	            	  $rootScope.path = cordova.file.dataDirectory;
              }
          }

    	  UrgencyService.selectUrgency(db,function(result){
    		  if(result.rows.length >0){

          		$scope.card = result.rows.item(0);

          		$rootScope.idCard = result.rows.item(0).id;
          		console.log('---------'+result.rows.item(0).photofilelocation);
          		 if(result.rows.item(0).photofilelocation !=""){
          		 var fileName = result.rows.item(0).photofilelocation.substr(result.rows.item(0).photofilelocation.lastIndexOf('/')+1);
          		console.log('---------'+$rootScope.path+fileName+"-----");
          		$scope.photoProfil = $rootScope.path+fileName;
          		 }else{
          			$scope.photoProfil ="img/photo_top_title.jpg";
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

    		  }
    	  });
    	   QrCodeServices.selectMesQRcodes(db, function(results){
    	    	if(results.rows.length>0){
    	    		for(var i=0; i<results.rows.length; i++){
    	    			if(results.rows.item(i).type=="vital"){
    	    				 if(results.rows.item(i).pathFile  !="img/photo_top_title.jpg" ){
    	                         var fileName = results.rows.item(i).pathFile.substr(results.rows.item(i).pathFile.lastIndexOf('/')+1);
    	                         $scope.qrVital= $rootScope.path+fileName;

//    	    				$scope.qrVital = results.rows.item(i).pathFile;
    	    				console.log("qr vital -----"+$scope.qrProfil);
    	    				 }
    	    			}
    	    		}
    	    	}
    	    });
      }
    //on focus
      $scope.focus = function() {
      	$rootScope.focused = true;
    // 	$rootScope.displaydrowdown={"z-index" :"-1"};
      };
      //on blr
      $scope.blur = function() {
      	$rootScope.focused = false;
      	//$rootScope.displaydrowdown={"z-index" :"9999"};
      };

      $scope.getlink_1 = function(){

			window.open($scope.card.link_1, '_system');

      };
      $scope.getlink_2 = function(){

			window.open($scope.card.link_2, '_system');

      };
      $scope.getlink_3 = function(){

			window.open($scope.card.link_3, '_system');

      };
      $scope.getlink_4 = function(){

			window.open($scope.card.link_4, '_system');

      };

      $scope.getlink_foot1 = function(){
    	  window.open("http://www.doctissimo.fr/html/sante/urgence/sa_898_ardiaque.htm", '_system');
      };
      $scope.getlink_foot2 = function(){
    	  window.open("https://www.youtube.com/watch?v=s-8-BHL2Nh8&app=desktop", '_system');
      };
      $scope.getlink_foot3 = function(){
    	  window.open("http://www.doctissimo.fr/html/sante/urgence/sa_849_inconscience.htm", '_system');
      };

      $scope.updateAll = function(){

				if ($rootScope.needPassword == true) {
					$rootScope.tabOrUpdate = "update";

					LoadingService.passwordPopup("UrgencyController");


				}else {
						$state.go('app.urgencyEdit');
				}
      };
      /**
       * show popup photo de profil
       */

      $ionicModal.fromTemplateUrl('app/common/partials/imagepopup.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
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

    $scope.showImage = function() {
      $scope.openModal();
    };

    $ionicModal.fromTemplateUrl('app/common/partials/photoQRVital.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modalV = modal;
      });

      $scope.openModalV = function() {
        $scope.modalV.show();
      };

      $scope.closeModalV = function() {
        $scope.modalV.hide();
      };
      $scope.gotoVital = function(){

    	  BuzcardService.getACT(function(act){
    		  window.open(" https://www.buzcard.com/buzcardvital.aspx?act="+act, '_system');

    	  })

		}
      //Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modalV.remove();
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

      $scope.showImageV = function() {
        $scope.openModalV();
      }

		$scope.toggleGroup = function(shown, tab){
      switch (tab) {
        case "tab1":
			     $scope.shown = !shown;
           break;
        case "tab2":
				console.warn($rootScope.shown2);
				if (!$rootScope.shown2  && $rootScope.needPassword) {

					$rootScope.tabOrUpdate = "tab";
          LoadingService.passwordPopup("UrgencyController");
				}else if($rootScope.shown2) {

			    $rootScope.shown2 = !shown;
				}else if( ! $rootScope.needPassword){

						$rootScope.shown2 = !shown;
				}
           break;

      }
		};
      $scope.recreemonmotdepasse = function() {
        email =$rootScope.email
        if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
          navigator.app.loadUrl("https://www.buzcard.com/recovery.aspx?email="+email, {openExternal:true});
        } else {
          window.open("https://www.buzcard.com/recovery.aspx?email="+email, '_system');
        }
      };
		$scope.hideLoading= function(){
				LoadingService.dismiss();
		}

		$scope.checkPassword= function(password){

			LoginService.selectCredentials(db,function(data){
			if ( password == data.rows.item(0).password) {
					$rootScope.needPassword = false;
					LoadingService.dismiss();
				if ($rootScope.tabOrUpdate == "tab") {
					$rootScope.shown2 = true;
				}else if ($rootScope.tabOrUpdate =="update") {
					$rootScope.shown2 =false;
					$state.go('app.urgencyEdit');
				}
			} else {
				$rootScope.showWrongPassword=false;
				$timeout(function(){
						$rootScope.showWrongPassword=true;
				}, 100);
				$timeout(function(){
						$rootScope.showWrongPassword=false;
				}, 1500);
					$scope.passForVerification = '';
			}

			});

		};


	}]);
