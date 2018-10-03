appContext.controller("LoginController", [
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

        });


        $scope.recreemonmotdepasse = function(email, password) {
        	if(email == undefined || email =='undefined') email ='';
					if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
						navigator.app.loadUrl("https://www.buzcard.com/recovery.aspx?email="+email, {openExternal:true});
					} else {
						window.open("https://www.buzcard.com/recovery.aspx?email="+email, '_system');
					}
        };

        $scope.signIn = function(email, password) {
            if ( !email || !password ) {
                LoadingService.error($translate.instant('LoginMsg1'), "LoginController");
            } else {
                LoadingService.loading($translate.instant('Loading4'));

                LoginService.doLogin(email, password)
                    .success(function(response, status, headers, config) {

                        // user exist
                        if (parseInt(response.identification) != 0) {
                        	 window.localStorage.removeItem('dateSynchronisation');
                          $rootScope.email = email;
                          $rootScope.userId = response.identification;
                          $rootScope.password = password;
                          window.localStorage.setItem('idUser',$rootScope.userId );
//                        $ionicHistory.nextViewOptions({disableBack: true});
//                        $ionicHistory.clearCache();
                          LoadingService.dismiss();
                          $state.go("app.synchro");
                        }
                        // user does not exists
                        else {
                            LoadingService.error($translate.instant('LoginMsg2'), "LoginController");
                        }

                    }).error(function(data, status, headers, config) {
                    	console.log(JSON.stringify(data));
                    //	alert(JSON.stringify(data));
                    	
                        LoadingService.error($translate.instant('Msg3'), "LoginController");

                    });
            }
        };

        // to dismiss the PopUp
        $scope.dismiss = function() {
       $scope.avtivateEmail =null;
            LoadingService.dismiss();
        };
        $scope.gotocreateaccount = function(){
        	window.open('https://www.buzcard.com/Buzcard_30KDO.aspx', '_system', 'location=yes');
        }

        // activate the given email
        $scope.activate = function(email) {
            if (!validateEmail(email)) {
                LoadingService.error($translate.instant('AccountMsg1'), "LoginController");
            } else {
                LoadingService.loading($translate.instant('Loading4'));
                LoginService
                    .activateAccount(email)
                    .success(function(data, status, headers, config) {
                        switch (data.activation) {
                            case "done":
                                LoadingService.success($translate.instant('AccountMsg2'), "LoginController");
                                $scope.email= email;
                                $scope.avtivateEmai='';
                                
                                break;
                            case "activated_KDO":
                                LoadingService.success($translate.instant('AccountMsg3'), "LoginController");
                                $scope.email= email;
                                $scope.avtivateEmai=';'
                                break;
                            case "already_activated":
                                LoadingService.error($translate.instant('AccountMsg4'), "LoginController");
                                break;
                            default:
                            	LoadingService.dismiss();
                                break;
                        };
                    }).error(function(data, status, headers, config) {
                        LoadingService.error($translate.instant('Msg3'), "LoginController");
                    });
            }

        };

        // deconnection
        $scope.deconnexion = function(){
          console.log('deconnexion');
           LoginService.deleteCredentials(db, function(result) {
             if (result.rowsAffected !=0) {
            	$state.go("app.login");
//            	$location.url("/app/login");
            } else {
              LoadingService.error($translate.instant('DeconMsg'),"LoginController");
            }
        });
        };
        /*
         * pour faire la transition entre les pages
         */
//        $scope.goTo = function(stateT){
////        	 $ionicHistory.nextViewOptions({
////           	  disableBack: true
////           	});
////       	  $ionicHistory.clearCache();
//       	  $state.go(stateT);
//        }

        function validateEmail(email) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            return re.test(email);
        }
    }
]);
