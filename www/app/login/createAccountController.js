appContext.controller("createAccountController", [
    '$scope',
    '$state',
    'LoginService',
    '$ionicPlatform',
    '$cordovaSQLite',
    'LoadingService',
    '$ionicHistory',
    '$rootScope',
    '$translate',
    function($scope, $state, LoginService, $ionicPlatform, $cordovaSQLite, LoadingService,$ionicHistory,$rootScope,$translate) {

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
//SSS
//            if($rootScope.decon){
//               	$rootScope.decon = false;
//               	window.location.reload();
//               }
        });

//        $scope.email = "kammoun.salem@gmail.com";
//        $scope.password = "melas123";
        // check whether the user exist or not

        

       
        // to dismiss the PopUp
        $scope.dismiss = function() {
       
            LoadingService.dismiss();
        };
        $scope.gotocreateaccount = function(){
        	window.open('https://www.buzcard.com/Buzcard_30KDO.aspx', '_system', 'location=yes');
        }

        // activate the given email
        $scope.email="";
        $scope.password="";
        $scope.confirmpassword="";
        $scope.createCompte = function (email,password,confirmpassword){
        	if(email !="" && password !="" && confirmpassword !=""){
        		  if (!validateEmail(email)) {
                  	LoadingService.success($translate.instant('popup.EmptyEmail'), "createAccountController");
                    
                  } else {
                  	if(!validatepassword(password)){
                  		LoadingService.success($translate.instant('popup.passwordNOK'), "createAccountController");
                  	}else if(password != confirmpassword){
                  		LoadingService.success($translate.instant('popup.confirmPasswordNOK'), "createAccountController");
                  	}else{
                  		 LoadingService.loading($translate.instant('popoup.Loading'));
                  		 
                  		 LoginService.createAccount(email, password, confirmpassword)
                         .success(function(response, status, headers, config) {
                  
                  			if(response.AccountCreation.status == 0){
                  				
                  				$rootScope.email =email;
                  				$rootScope.password = password;
                  				LoadingService.dismiss();
                  				LoadingService.confirm($translate.instant('popup.ConfirmCreate'), response.AccountCreation.status, "createAccountController");
                  			}else if(response.AccountCreation.status ==1){
                  				$rootScope.email =email;
                  				 LoadingService.confirm($translate.instant('popup.EmailExist'),response.AccountCreation.status, "createAccountController");	
                  			}else{
                  				$rootScope.email =email;
                     				 LoadingService.confirm($translate.instant('popup.EmailExist'),response.AccountCreation.status, "createAccountController");
                     			
                  			}
                  		}).error(function(data, status, headers, config) {
                        	console.log(JSON.stringify(data));
                  			
                  		})
                  		
                  			
                  		
                  		 /// tester la reponse du webservice
                  		
                  	}
                  }
        	}else{
        		if((email !="" && password =="" ) || (email !="" && password !="" && confirmpassword =="")){
        			LoadingService.success($translate.instant('popup.PasswordEmpty'), "createAccountController");
        		}else {
        			LoadingService.success($translate.instant('popup.Empty'), "createAccountController");
        		}
        	}
        	
        	

        };

      $scope.ok = function(obj){
    	  LoadingService.dismiss();
    	  if(JSON.parse(obj).status == 0){
    		  $state.go("app.login", {
                  'email': $rootScope.email,
                  'password' : $rootScope.password
              });
    	  }else {
    		  $state.go("app.login", {
                  'email': $rootScope.email
                 
              });  
    	  }
    	  
      } 
      function validatepassword(password){
    	   var regularExpression  = /^[a-zA-Z0-9!@#$%^&*]{8,16}$/;
    	   return regularExpression.test(password);
      }

        function validateEmail(email) {
         //   var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            return re.test(email);
        }
    }
]);
