appContext.controller('UrgencyIndexController', ['$scope', '$rootScope', 'LoadingService', '$translate', '$cordovaBarcodeScanner', 'BuzcardService', 'UrgencyService', 'ConnectionService',
  function ($scope, $rootScope, LoadingService, $translate, $cordovaBarcodeScanner, BuzcardService, UrgencyService, ConnectionService) {


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
    $scope.infoUrgency = false;
    $scope.infourgencyFlash = false;
    $scope.infoAlert = false
    $scope.infoSearch = false
    console.log($rootScope.firstOpenUrgency);
    if ($rootScope.firstOpenUrgency == true) {
      $rootScope.firstOpenUrgency = false;
      LoadingService.infoFirstopen($translate.instant('firstOpenedUrgency'),

        "UrgencyIndexController");
    }
    $scope.scanBarcodeUrgency = function () {
      LoadingService.loading($translate.instant('Loading4'));
      //window phone
      if (ionic.Platform.isWindowsPhone()) {
        $cordovaBarcodeScanner
          .scan()
          .then(function (barcodeData) {
            BuzcardService.selectUser(db, function (resultSet) {
              var buildedUrl = barcodeData.text + '&UserID=' + resultSet.rows.item(0).userId

              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                navigator.app.loadUrl(buildedUrl, {
                  openExternal: true
                });
                LoadingService.dismiss();
              } else {
                window.open(buildedUrl, '_system');
                LoadingService.dismiss();
              }
            })
          }, function (error) {
            //	    	  alert("Erreur de scan: " + error);
            LoadingService.dismiss();
          });
        //Android
      } else if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {


        cordova.plugins.diagnostic.requestRuntimePermissions(function (statuses) {
          var ArrayPermission = [];
          var i = 0
          for (var permission in statuses) {
            console.log(statuses[permission]);
            if (statuses[permission] == cordova.plugins.diagnostic.permissionStatus.GRANTED) {
              ArrayPermission[i] = true;
              i++;
            } else {
              ArrayPermission[i] = false;
              i++;
            }

          }
          if (ArrayPermission[0] && ArrayPermission[1]) {


            $cordovaBarcodeScanner
              .scan()
              .then(function (barcodeData) {


                BuzcardService.selectUser(db, function (resultSet) {
                  var buildedUrl = barcodeData.text + '&UserID=' + resultSet.rows.item(0).userId

                  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    navigator.app.loadUrl(buildedUrl, {
                      openExternal: true
                    });
                    LoadingService.dismiss();
                  } else {
                    window.open(buildedUrl, '_system');
                    LoadingService.dismiss();
                  }
                })
              }, function (error) {
                //	    	  alert("Erreur de scan: " + error);
                LoadingService.dismiss();
              });
          } else {
            LoadingService.dismiss();
          }

        }, function (error) {
          console.error("The following error occurred: " + error);

        }, [cordova.plugins.diagnostic.permission.CAMERA, cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);

        // iphone
      } else {


        cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {

          if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

            $cordovaBarcodeScanner
              .scan()
              .then(function (barcodeData) {
                BuzcardService.selectUser(db, function (resultSet) {
                  var buildedUrl = barcodeData.text + '&UserID=' + resultSet.rows.item(0).userId
                  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    navigator.app.loadUrl(buildedUrl, {
                      openExternal: true
                    });
                    LoadingService.dismiss();
                  } else {
                    window.open(buildedUrl, '_system');
                    LoadingService.dismiss();
                  }
                })
              }, function (error) {

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
    $scope.searchSecouriste = function () {
      LoadingService.loading($translate.instant('Loading4'))
      BuzcardService.selectProfile(db, function (result) {
        if (result.rows.item(0).mobile_1 == '' && result.rows.item(0).mobile_2 == '') {
          LoadingService.dismiss()
          LoadingService.error($translate.instant('searchUrgency.emptyMobile'), 'UrgencyIndexController')
        } else {
          UrgencyService.getPosition(function (data) {
            if (data == 'error') {
              LoadingService.dismiss()
              LoadingService.error($translate.instant('Msg3'), 'UrgencyIndexController')
            } else if (data == 'DENIED') {
              LoadingService.dismiss()
              LoadingService.QuestionAUtorisationLocation($translate.instant('QuestionAutoriserLocation'), 'UrgencyIndexController')
            }
            else {
              ConnectionService.testConexion(db, function () {
                console.log('connected')
                LoadingService.confirmSearch($translate.instant('searchUrency.success'), result.rows.item(0).act, data.latitude, data.longitude, 'UrgencyIndexController')
              }, function () {
                LoadingService.error($translate.instant('Msg3'), 'UrgencyIndexController')
              })

            }

          })
        }
      })

    }


    $scope.alertProches = function () {
      LoadingService.loading($translate.instant('Loading4'))
      UrgencyService.selectUrgency(db, function (result) {
        if (result.rows.item(0).familynumber1 == '' && result.rows.item(0).familynumber2 == '' && result.rows.item(0).familynumber3 == '') {
          LoadingService.dismiss()
          LoadingService.error($translate.instant('alert.emptyFamilyNumbers'), 'UrgencyIndexController')
        } else {
          UrgencyService.getPosition(function (data) {
            if (data == 'error') {
              LoadingService.dismiss()
              LoadingService.error($translate.instant('Msg3'), 'UrgencyIndexController')
            } else if (data == 'DENIED') {
              LoadingService.dismiss()
              LoadingService.QuestionAUtorisationLocation($translate.instant('QuestionAutoriserLocation'), 'UrgencyIndexController')
            }
            else {
              ConnectionService.testConexion(db, function () {
                console.log('connected')
                BuzcardService.getACT(function (act) {
                  LoadingService.confirmAlert($translate.instant('alertProche.success'), act, data.latitude, data.longitude, 'UrgencyIndexController')
                })
              }, function () {
                LoadingService.error($translate.instant('Msg3'), 'UrgencyIndexController')
              })
            }
          })
        }
      })
    }
    $scope.confirmSearchYes = function (act, latitude, longitude) {
      LoadingService.dismiss()
      UrgencyService.searchRescuer(act, latitude, longitude, function (response) {
        console.log(response)
        LoadingService.dismiss()
      })
    }

    $scope.confirmAlertYes = function (act, latitude, longitude) {
      LoadingService.dismiss()
      UrgencyService.alertRelative(act, latitude, longitude, function (response) {
        console.log(response)
        LoadingService.dismiss()
      })
    }
    $scope.yesAutorisation = function () {
      LoadingService.dismiss();
      cordova.plugins.diagnostic.switchToSettings(function () {
        console.log("Successfully switched to Settings app");

      }, function (error) {
        console.log("The following error occurred: " + error);
      });
    }
    $scope.noAutorisation = function () {
      LoadingService.dismiss()
    }
    $scope.dismiss = function () {
      LoadingService.dismiss()
    }

    $scope.ShowinfoSearch = function () {
      if ($scope.infoSearch) $scope.infoSearch = false
      else $scope.infoSearch = true
    }
    $scope.ShowinfoAlert = function () {
      if ($scope.infoAlert) $scope.infoAlert = false
      else $scope.infoAlert = true
    }

    $scope.ShowinfoUrgency = function () {
      if ($scope.infoUrgency)
        $scope.infoUrgency = false;
      else
        $scope.infoUrgency = true;

    }
    $scope.ShowinfourgencyFlash = function () {
      if ($scope.infourgencyFlash)
        $scope.infourgencyFlash = false;
      else
        $scope.infourgencyFlash = true;

    }

    $scope.tutorials = function () {
      console.log('https://www.buzcard.com//tutos.aspx?fr=' + $translate.use() + '&Type=UR')
      window.open('https://www.buzcard.com//tutos.aspx?fr=' + $translate.use() + '&Type=UR', '_system', 'location=yes');
      localStorage.setItem('isCameraOpened', 'false')
    }

    $scope.Info = function () {
      LoadingService.dismiss();
    }


  }
]);
