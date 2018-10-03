appContext.controller('UrgencyIndexController', ['$scope','$rootScope', 'LoadingService','$translate','$cordovaBarcodeScanner',
  function($scope, $rootScope, LoadingService,$translate, $cordovaBarcodeScanner) {
	
	
	  var db = null;
	   /**
     * create/open DB
     */
    if (window.cordova) {
      db = window.sqlitePlugin.openDatabase({
        name: "buzcard.db",
        androidDatabaseImplementation: 2
      }); // device
    } else {
      db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
    }
    $scope.infoUrgency=false;
    $scope.infourgencyFlash=false;
    console.log($rootScope.firstOpenUrgency);
    if($rootScope.firstOpenUrgency == true){
  	  $rootScope.firstOpenUrgency =false;
  	  LoadingService.infoFirstopen($translate.instant('firstOpenedUrgency'),
  			
        "UrgencyIndexController");
    }
    $scope.scanBarcodeUrgency = function(){
    	LoadingService.loading($translate.instant('Loading4'));
    	//window phone
        if (ionic.Platform.isWindowsPhone()) {
          $cordovaBarcodeScanner
            .scan()
            .then(function(barcodeData) {
            	
            	 if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                     navigator.app.loadUrl(barcodeData.text, {
                       openExternal: true
                     });
                     LoadingService.dismiss();
                   } else {
                     window.open(barcodeData.text, '_system');
                     LoadingService.dismiss();
                   }
            	 
            }, function(error) {
                //	    	  alert("Erreur de scan: " + error);
                LoadingService.dismiss();
              });
          //Android 
          } else if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
            

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


                $cordovaBarcodeScanner
                  .scan()
                  .then(function(barcodeData) {
                	 
                	  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                          navigator.app.loadUrl(barcodeData.text, {
                            openExternal: true
                          });
                          LoadingService.dismiss();
                        } else {
                          window.open(barcodeData.text, '_system');
                          LoadingService.dismiss();
                        }
                	  
                  }, function(error) {
                      //	    	  alert("Erreur de scan: " + error);
                      LoadingService.dismiss();
                    });
                  }else{
                  	  LoadingService.dismiss();
                  }

      	          }, function(error){
                      console.error("The following error occurred: "+error);
                    
                  }, [cordova.plugins.diagnostic.permission.CAMERA,cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);
            
                // iphone
              } else {



              cordova.plugins.diagnostic.requestCameraAuthorization(function(status) {
               
                if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

                  $cordovaBarcodeScanner
                    .scan()
                    .then(function(barcodeData) {
                    
                    	 if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                             navigator.app.loadUrl(barcodeData.text, {
                               openExternal: true
                             });
                             LoadingService.dismiss();
                           } else {
                             window.open(barcodeData.text, '_system');
                             LoadingService.dismiss();
                           }
                    	 
                    }, function(error) {
                      //   		    	  alert("Erreur de scan: " + error);

                    });

                } else {
                  if ($rootScope.requestAutorisecamera >= 1) {
                    LoadingService.dismiss();
                    LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserCamera'), 'ContactEditController');
                    $rootScope.requestAutorisecamera++;
                  } else {
                    LoadingService.dismiss();
                    $rootScope.requestAutorisecamera++;
                  }
                 
                }
              });
            }
    
         }
    $scope.ShowinfoUrgency= function(){
    	if($scope.infoUrgency)
    		$scope.infoUrgency=false;
    		else
    			$scope.infoUrgency=true;
    		
    }
    $scope.ShowinfourgencyFlash= function(){
    	if($scope.infourgencyFlash)
    		$scope.infourgencyFlash=false;
    		else
    			$scope.infourgencyFlash=true;
    		
    }
    
    $scope.tutorials = function(){
    	console.log('https://www.buzcard.com//tutos.aspx?fr='+$translate.use()+'&Type=UR')
  	  window.open('https://www.buzcard.com//tutos.aspx?fr='+$translate.use()+'&Type=UR', '_system', 'location=yes');
    }
    
    $scope.Info = function(){
  	  LoadingService.dismiss();
    }
    
   
  }
]);
