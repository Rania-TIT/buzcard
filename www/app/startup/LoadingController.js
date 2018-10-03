appContext.controller("LoadingController", [
  '$scope',
  '$state',
  'LoginService',
  '$ionicPlatform',
  '$cordovaSQLite',
  'LoadingService',
  '$ionicHistory', 'MenuService', '$rootScope', 'BuzcardService', 'ContactsService',
  'ConnectionService', '$translate', 'UrgencyService', '$timeout', '$window','SynchroServices','QrCodeServices',
  function($scope, $state, LoginService, $ionicPlatform, $cordovaSQLite, LoadingService,
    $ionicHistory, MenuService, $rootScope, BuzcardService, ContactsService, ConnectionService,
    $translate, UrgencyService, $timeout, $window,SynchroServices,QrCodeServices) {

    $scope.splashMargin = ($window.screen.height - $window.screen.width) / 2
    if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
      if (navigator.language.substring(0, 2) == "fr") {
        $scope.photosplash = "img/splashAndroidFR.jpg";
      } else {
        $scope.photosplash = "img/splashAndroidUS.jpg"
      }

    } else {
      if (navigator.language.substring(0, 2) == "fr") {
        $scope.photosplash = "img/splashAndroidFR.jpg"
      } else {
        $scope.photosplash = "img/splashAndroidUS.jpg"
      }
    }
    var db = null;
    $ionicPlatform.ready(function() {
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

      LoadingService.loading($translate.instant('Loading4'));
      LoginService.selectCredentials(db, function(result) {
        if (result == 1) {
          LoadingService.dismiss();
          $rootScope.firstOpenBusiness = true;
          $rootScope.firstOpenUrgency = true;
          
          window.localStorage.removeItem('dateSynchronisation');
          $state.go("app.login");
        } else {
          if (result.rows.length > 0) {
        	  
            LoadingService.dismiss();
            BuzcardService.TestIfExistColumns(db, function(data) {
              if (data == true) {
                
            	  $state.go("app.qrcode");

              } else {
                if (result.rows.item(0).email == null || result.rows.item(0).password == null) {
                  LoadingService.dismiss();
                  window.localStorage.removeItem('dateSynchronisation');
                  $state.go("app.login");
                } else {
                  LoadingService.loading($translate.instant('Loading4'));

                  LoginService.logout().success(
                    function(data, status, headers, config) {
                      LoginService.doLogin(result.rows.item(0).email, result.rows.item(0).password)
                        .success(function(response, status, headers, config) {
                          // delete table modifed
                          if (parseInt(response.identification) != 0) {

                            $rootScope.email = result.rows.item(0).email;
                            $rootScope.userId = response.identification;
                            $rootScope.password = result.rows.item(0).password;
                            window.localStorage.setItem('idUser', $rootScope.userId);
                            BuzcardService.DropTableProfile(db, function() {

                              MenuService.setLocalStorage("dateSynchronisation", false);
                              ContactsService.DropContactTable(db, function() {
                                UrgencyService.DropUrgencyTable(db, function() {
                                  $state.go("app.synchro");
                                });

                              });

                            });

                          }else {
                            LoadingService.dismiss();
                            window.localStorage.removeItem('dateSynchronisation');
                            $state.go("app.login");
                          }


                        }).error(function(data, status, headers, config) {
                        	LoadingService.dismiss();
                        	 $state.go("app.login");
                          //LoadingService.error($translate.instant('Msg3'), "LoadingController");

                        });
                    }).error(function(data, status, headers, config) {
                    	LoadingService.dismiss();
                   	 $state.go("app.qrcode");
                    	//alert("do logout");
                    //LoadingService.error($translate.instant('Msg3'), "LoadingController");
                  });
                }
              }

            });

          } else {
            LoadingService.dismiss();
            $state.go("app.login");
          }
        }

      });
    });


    // to dismiss the PopUp
    $scope.dismiss = function() {
      LoadingService.dismiss();
    };

  }
]);
