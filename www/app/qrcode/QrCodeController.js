appContext.controller('QrCodeController', [
  '$state',
  '$scope',
  '$ionicPlatform',
  'LoadingService',
  '$cordovaBarcodeScanner',
  '$ionicHistory',
  '$translate',
  'QrCodeServices',
  'ContactsService',
  '$rootScope',
  '$filter',
  'SynchroServices',
  'MenuService',
  'LoginService',
  'ConnectionService', '$interval', 'cameraService', '$window', 'BuzcardService', '$cordovaNativeAudio', 'LogService',
  function ($state, $scope, $ionicPlatform, LoadingService, $cordovaBarcodeScanner, $ionicHistory, $translate, QrCodeServices,
            ContactsService, $rootScope, $filter, SynchroServices, MenuService, LoginService, ConnectionService, $interval, cameraService, $window, BuzcardService, $cordovaNativeAudio, LogService) {


    var db = null;
    var act = "";
    $rootScope.needPassword = true;
    $rootScope.showWrongPassword = false;
    $rootScope.emailSend = null;
    $scope.infoSend = false;
    $rootScope.isBackgroudRuning = false;

    $ionicPlatform.ready(function () {

      $rootScope.dateUpdate = $filter('date')(new Date(BuildInfo.buildDate), 'MMM yyyy');

      $cordovaNativeAudio.preloadComplex('snare', 'img/Mail_Sent.m4a', 0.1, 1, 0);

      if (window.cordova) {
        db = window.sqlitePlugin.openDatabase({
          name: "buzcard.db",
          androidDatabaseImplementation: 2
        }); // device
      } else {
        db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
      }

      if ($rootScope.firstOpenBusiness == true) {
        $rootScope.firstOpenBusiness = false;
        localStorage.setItem('isCameraOpened', false)
        LoadingService.infoFirstopen($translate.instant('firstOpenedBusiness'),
          "QrCodeController");
      }

      /**
       * every 30' get position
       */
      console.log(localStorage.getItem('isSecouriste'))
      if (localStorage.getItem('isSecouriste') == '"1"') {
        if (!angular.isDefined($rootScope.forgroundMode)) {
          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
            cordova.plugins.backgroundMode.setDefaults({silent: true});
          } else {
            cordova.plugins.backgroundMode.setDefaults({text: ''});
          }
          $rootScope.forgroundMode = $interval(function () {
            console.log('check for location ')
            SynchroServices.getLocationMobile(cordova.plugins.backgroundMode.isActive(), function () {
              /** check for notification */
              console.log("%c check for notification", 'background: #FF8000; color: #FF0055')
              BuzcardService.getACT(function (act) {
                ConnectionService.checkFroNotification(act).then(function (res) {
                  if (res.data.Alert) {
                    console.log(res.data.Alert.URL)
                    var path = ''
                    if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                      path = cordova.file.applicationStorageDirectory;
                    } else if (isWindowsPhone) {
                      path = "//";
                    } else {
                      path = cordova.file.dataDirectory;
                    }

                    if (res.data.Alert.URL) {
                      var absoluteUrl = res.data.Alert.URL
                      var audioName = absoluteUrl.substring(absoluteUrl.lastIndexOf('/') + 1);
                      cameraService.downloadFile(path, audioName, absoluteUrl, function (audioUrl) {

                        var audio = new Audio(audioUrl);
                        audio.play();

                      });
                    }

                  }
                }, function (err) {

                })
              })
              /** End check for notification*/
            });

          }, 1800000);
        }
      } else {
        console.log('ddddd')
      }


      /** BG mode is activated */
      cordova.plugins.backgroundMode.on('activate', function () {

        console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', 'Activated')
        LogService.saveLog("Background Mode Activated", 'QrCodeController')

        if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
          cordova.plugins.backgroundMode.setDefaults({text: ''});
        } else {
          cordova.plugins.backgroundMode.setDefaults({text: ''});
        }

        if (!isEditionAndSend() && localStorage.getItem('isCameraOpened') != 'true') $state.go('app.qrcode');

        $rootScope.focused = false;
        console.log(localStorage.getItem('isCameraOpened'))
        if (localStorage.getItem('isCameraOpened') != 'true') {
          if (!angular.isDefined($rootScope.backgroundModeTimer)) {

            $interval.cancel($rootScope.timer);
            $rootScope.timer = undefined
            $rootScope.backgroundModeTimer = $interval(function () {
              LogService.saveLog("Background Mode:: sync", 'QrCodeController')

              SynchroServices.selectAllRequest(db, function (res) {
                LogService.saveLog(res.rows.length, 'QrCodeController')

                if (res.rows.length > 0) {

                  console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', "Sync Auto: Queue Full");
                  //   LogService.saveLog("isBackgroundRuning "+$rootScope.isBackgroudRuning , 'QrCodeController')
                  //  LogService.saveLog("isNotContactPage "+isNotContactPage() , 'QrCodeController')
                  LogService.saveLog('$rootScope.isBackgroudRuning '+$rootScope.isBackgroudRuning, 'QrCodeController')
                  LogService.saveLog('isNotContactPage() '+isNotContactPage(), 'QrCodeController')
                  console.log($rootScope.isBackgroudRuning)
                  console.log(isNotContactPage())
                  if ($rootScope.isBackgroudRuning == false && isNotContactPage()) {
                    $rootScope.isBackgroudRuning = true;
                    $rootScope.emptyQueue = false;
                    ConnectionService.isConnected(db, function () {
                      $rootScope.isBackgroudRuning = false;
                      $rootScope.emptyQueue = true;
                      $cordovaNativeAudio.play('snare');
                      endcheck();

                    }, function () {
                      $rootScope.isBackgroudRuning = false;
                    });
                  } else {
                    LogService.saveLog('BackgroundMod:: Full Queue :: sync skipped', 'QrCodeController')
                    console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', "Sync Auto: Skipped");

                  }
                } else {
                  LogService.saveLog("Background Mode:: empty queue", 'QrCodeController')
                  endcheck();
                }
              });
            }, 8000);
          } else {
            LogService.saveLog("Background Mode:: backgroundModeTimer DEF", 'QrCodeController')
          }


        } else {
          LogService.saveLog("Background Mode:: camera opened", 'QrCodeController')
          console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', 'Camera is opened')
        }
      });


      function endcheck() {
        console.log('end depilement');
        //LogService.saveLog("End Depilement " , 'QrCodeController')
        $interval.cancel($rootScope.backgroundModeTimer);
        $rootScope.backgroundModeTimer = undefined;
      }


      /** First run */
     // if (!cordova.plugins.backgroundMode.isActive()) {

        if (!angular.isDefined($rootScope.timer)) {
          LogService.saveLog("FIRST RUN LUNCHED", 'QrCodeController')
          console.log('iss actifififif')
          $interval.cancel($rootScope.backgroundModeTimer);
          $rootScope.backgroundModeTimer = undefined

          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
            cordova.plugins.backgroundMode.setDefaults({silent: true});
          } else {
            cordova.plugins.backgroundMode.setDefaults({text: ''});
          }

          $rootScope.timer = $interval(function () {
            LogService.saveLog("FIRST RUN :: Interval ::  is running", 'QrCodeController')
            console.log("%cFirst run ", 'background: #222; color: #bada55', "Sync Auto: start...");
            //   LogService.saveLog("First run Sync Auto: start..." , 'QrCodeController')
            SynchroServices.selectAllRequest(db, function (rs) {
              console.log(rs.rows.length, $rootScope.isBackgroudRuning)
              LogService.saveLog("First Run Pile length " + rs.rows.length, 'QrCodeController')
              //  LogService.saveLog("isBackgroundRuning "+ $rootScope.isBackgroudRuning, 'QrCodeController')
              if (rs.rows.length > 0 && ($rootScope.isBackgroudRuning == false && isNotContactPage())) {
                $rootScope.isBackgroudRuning = true;
                $rootScope.emptyQueue = false;
                ConnectionService.isConnected(db, function () {
                  $cordovaNativeAudio.play('snare');
                  $rootScope.isBackgroudRuning = false;
                  $rootScope.emptyQueue = true;
                  // onlyDelta()
                }, function () {
                  $rootScope.isBackgroudRuning = false;
                });
              } else {
                LogService.saveLog("FIRST RUN :: Sync Auto: Skipped or empty queue", 'QrCodeController')
                console.log("%cFirst run", 'background: #222; color: #bada55', "Sync Auto: Skipped or empty queue");
              }
            });
          }, 8000);
        } else {
          console.log('first run timer defined')
          LogService.saveLog("FIRST RUN :: timer DEF", 'QrCodeController')

        }

      /*} else {
        console.log($rootScope.backgroundModeTimer)
        console.log($rootScope.timer)
        LogService.saveLog("FIRST RUN :: BG ACTIVE", 'QrCodeController')
      }*/


      /**  putting back app in foreground */
      cordova.plugins.backgroundMode.on('deactivate', function () {
        LogService.saveLog(" PB :: FOREGROUND : putting back app in foreground", 'QrCodeController')
        console.log("%c putting back app in foreground", 'background: #00FF00; color: #000')
        if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
          cordova.plugins.backgroundMode.setDefaults({silent: true});
        } else {
          cordova.plugins.backgroundMode.setDefaults({text: ''});
        }
        $interval.cancel($rootScope.backgroundModeTimer);
        $rootScope.backgroundModeTimer = undefined;
        if ($state.current.name != 'app.login' && $state.current.name != 'app.synchro' && $state.current.name != 'app.loading') {
          ConnectionService.testConnected(db, function () {
            LogService.saveLog("PB:: FOREGROUND :: ONLY DELTA" , 'QrCodeController')
            onlyDelta()
          }, function () {
          });
        }
        if (!angular.isDefined($rootScope.timer)) {
          $rootScope.timer = $interval(function () {
            sychroWithoutDelta();

          }, 8000);
        } else {
          LogService.saveLog("FOREGROUND : Timer is DEFINED", 'QrCodeController')
        }
      });

      function onlyDelta() {
        $rootScope.isBackgroudRuning = true;
        BuzcardService.getACT(function (act) {
          ContactsService.getContactsEdited(1, act).then(function (response) {
            if (response.data && response.data.contacts.pages > 0) {
              if ($state.current.name != 'app.login' && $state.current.name != 'app.synchro' && $state.current.name != 'app.loading') {

                $rootScope.isDelta = true;
                console.log("%cOnly Delta", 'background: #FFF222; color: #333', "there is Delta");
                $rootScope.countSynchroDelta++;
                if ($rootScope.countSynchroDelta == 1) {
                  if (document.querySelector(".modal-open") != null) {
                    document.querySelector(".modal-open").classList.remove('modal-open');
                  } else {
                    // console.info("OPEN MODAL IS NULL")
                  }
                  ContactsService.getContactUpdate(response.data.contacts.contact, function (contactsName) {
                    if (contactsName.nbcontact == 1) {
                      LoadingService.questionSynchroDelta($translate.instant('MsgSynchroDelta1', {
                          nameContact1: contactsName.contact1
                        }),
                        "UpdateController");
                    } else if (contactsName.nbcontact == 2) {
                      LoadingService.questionSynchroDelta($translate.instant('MsgSynchroDelta2', {
                          nameContact1: contactsName.contact1,
                          nameContact2: contactsName.contact2
                        }),
                        "UpdateController");
                    } else {
                      if (contactsName.nbcontact > 10) {
                        LoadingService.questionSynchroDelta($translate.instant('MsgSynchroDelta4', {
                            nameContact1: contactsName.contact1,
                            nameContact2: contactsName.contact2,
                            nameContact3: contactsName.contact3,
                            nbcontact: contactsName.nbcontact
                          }),
                          "UpdateController");
                      } else {
                        LoadingService.questionSynchroDelta($translate.instant('MsgSynchroDelta3', {
                            nameContact1: contactsName.contact1,
                            nameContact2: contactsName.contact2,
                            nameContact3: contactsName.contact3
                          }),
                          "UpdateController");
                      }

                    }

                  });

                }
              }
            } else {
              console.log("%cOnly Delta", 'background: #FFF222; color: #333', 'Nothing new in server')
              $rootScope.isDelta = false;
            }
            $rootScope.isBackgroudRuning = false;
            console.log("%cOnly Delta", 'background: #FFF222; color: #333', "----------------------------");
          }, function () {
            console.log("%cOnly Delta", 'background: #FFF222; color: #333', "No connection");
            $rootScope.isBackgroudRuning = false;
          });
        })
      }


      function sychroWithoutDelta() {
        console.log("%cSync without Delta", 'background: #fff; color: #222FFF', "Sync Auto: start...");
          LogService.saveLog("Sync without Delta" , 'QrCodeController')
        SynchroServices.selectAllRequest(db, function (rs) {
          LogService.saveLog("Sync without Delta:: PILE : Result "+rs , 'QrCodeController')
          LogService.saveLog("Sync without Delta:: PILE : "+rs.rows.length , 'QrCodeController')
          if (rs.rows.length > 0 && ($rootScope.isBackgroudRuning == false && isNotContactPage())) {
            console.log("%cSync without Delta", 'background: #fff; color: #222FFF', " Sync Auto: Queue Full");
            $rootScope.isBackgroudRuning = true;
            $rootScope.emptyQueue = false;
            ConnectionService.isConnected(db, function () {
              $cordovaNativeAudio.play('snare');
              $rootScope.isBackgroudRuning = false;
              $rootScope.emptyQueue = true;

            }, function () {
              $rootScope.isBackgroudRuning = false;

            });
          } else {
            LogService.saveLog("Sync without Delta:: PILE : Sync Auto: Skipped" , 'QrCodeController')
            console.log("%cSync without Delta", 'background: #fff; color: #222FFF', "Sync Auto: Skipped");
          }
        });
      }

      $scope.infoSend = false;
      $scope.infoPhoto = false;
      $scope.infoFlash = false;
      $scope.ShowinfoSend = function () {
        console.log($scope.infoSend);
        if ($scope.infoSend)
          $scope.infoSend = false;
        else
          $scope.infoSend = true;
      };

      $scope.ShowinfoPhoto = function () {
        if ($scope.infoPhoto)
          $scope.infoPhoto = false;
        else
          $scope.infoPhoto = true;
      }

      $scope.ShowinfoFlash = function () {
        if ($scope.infoFlash)
          $scope.infoFlash = false;
        else
          $scope.infoFlash = true;
      }

      $scope.tutorials = function () {
        console.log('https://www.buzcard.com//tutos.aspx?fr=' + $translate.use() + '&Type=BS');
        localStorage.setItem('isCameraOpened', 'false')
        window.open('https://www.buzcard.com//tutos.aspx?fr=' + $translate.use() + '&Type=BS', '_system', 'location=yes');
      }


      //--------------
      $scope.Info = function () {
        LoadingService.dismiss();
      }

      var isWindowsPhone = ionic.Platform.isWindowsPhone();
      if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
        $scope.txtqrcodez = $translate.instant('QRCode.txtAndroid');
      } else if (isWindowsPhone) {
        $scope.txtqrcodez = $translate.instant('QRCode.txtWP8');
      } else {
        $scope.txtqrcodez = $translate.instant('QRCode.txtIOS');
      }

    });

    $scope.scanBarcode = function () {
      LoadingService.loading($translate.instant('Loading4'));
      if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
        cordova.plugins.diagnostic.requestRuntimePermission(function (status) {

          if (status == cordova.plugins.diagnostic.permissionStatus.GRANTED) {


            $cordovaBarcodeScanner
              .scan()
              .then(function (barcodeData) {

                if (QrCodeServices.isBuzcardUrl(barcodeData.text)) {

                  act = QrCodeServices.extractAct(barcodeData.text);
                  var Rid = parseInt(new Date().getTime() / 1000);
                  cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                    if (authorized) {
                      LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                      SynchroServices.insertRequest(db, "QRCODE", {
                        act: act,
                        RID: Rid
                      }, function () {
                      });
                    } else {
                      LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                      SynchroServices.insertRequest(db, "QRCODE", {
                        act: act,
                        RID: Rid
                      }, function () {
                      });
                    }
                  }, function (error) {
                    console.error("The following error occurred: " + error);
                    LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                    SynchroServices.insertRequest(db, "QRCODE", {
                      act: act,
                      RID: Rid
                    }, function () {
                    });
                  });
                  /************ fin cas de buzcard        *********/


                } else if (barcodeData.cancelled == false) {

                  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    navigator.app.loadUrl(barcodeData.text, {
                      openExternal: true
                    });
                  } else {
                    window.open(barcodeData.text, '_system');
                    LoadingService.dismiss();

                  }
                } else {
                  LoadingService.dismiss();
                }


              }, function (error) {
                //	    	  alert("Erreur de scan: " + error);
                LoadingService.dismiss();
              });
          } else {
            LoadingService.dismiss();
          }

        }, function (error) {
          console.error("The following error occurred: " + error);

        }, cordova.plugins.diagnostic.permission.CAMERA);

      } else {


        cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {
          //
          if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

            $cordovaBarcodeScanner
              .scan()
              .then(function (barcodeData) {

                if (QrCodeServices.isBuzcardUrl(barcodeData.text)) {

                  act = QrCodeServices.extractAct(barcodeData.text);
                  var Rid = parseInt(new Date().getTime() / 1000);
                  console.warn(act);
                  cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                    if (authorized) {
                      LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                      SynchroServices.insertRequest(db, "QRCODE", {
                        act: act,
                        RID: Rid
                      }, function () {
                      });
                    } else {
                      LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                      SynchroServices.insertRequest(db, "QRCODE", {
                        act: act,
                        RID: Rid
                      }, function () {
                      });
                    }
                  }, function (error) {
                    console.error("The following error occurred: " + error);
                    LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                    SynchroServices.insertRequest(db, "QRCODE", {
                      act: act,
                      RID: Rid
                    }, function () {
                    });
                  });
                  /************ fin cas de buzcard        *********/

                } else if (barcodeData.cancelled == false) {

                  if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    navigator.app.loadUrl(barcodeData.text, {
                      openExternal: true
                    });
                    LoadingService.dismiss();
                  } else {
                    window.open(barcodeData.text, '_system');
                    LoadingService.dismiss();
                  }

                } else {
                  LoadingService.dismiss();


                }


              }, function (error) {
                console.error("Erreur de scan: ");
                console.error(error);
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
    };

    $scope.sendwithACT = function (act) {
      var Rid = parseInt(new Date().getTime() / 1000);

      var object = {
        email: "",
        selectLang: "",
        checkFollower: "",
        sendMobile: 1,
        dateRDV: "",
        tradEmailContent: "",
        idTmp: act,
        Rid: Rid
      };


      SynchroServices.insertRequest(db, "BUZCARDSEND", object, function () {
        LoadingService.dismiss();
        LoadingService.success($translate.instant('SendQRcode'), "QrCodeController");

      });
    };

    $scope.dismiss = function () {

      LoadingService.dismiss();
    };

    $scope.createContact = function () {
      var count = 0;
      localStorage.setItem('isCameraOpened', 'true')
      $rootScope.$watch("isBackgroudRuning", function () {
        if (!$rootScope.isBackgroudRuning && count == 0) {
          count = 1;
          LoadingService.dismiss();
          $rootScope.isBackgroudRuning = true;

          LoadingService.loading($translate.instant("Loading4"));


          /********************\
           end open camera
           \********************/
          // for android devices
          if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
            cordova.plugins.diagnostic.requestRuntimePermission(function (status) {
              if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

                var options = {
                  quality: 60,
                  destinationType: Camera.DestinationType.FILE_URI,
                  sourceType: Camera.PictureSourceType.CAMERA,
                  encodingType: Camera.EncodingType.JPEG,
                  targetWidth: 600,
                  targetHeight: 600,
                  correctOrientation: true,
                  popoverOptions: CameraPopoverOptions
                };

                localStorage.setItem('isCameraOpened', 'true')
                cameraService.getPicture(options).then(function (imageURI) {
                  console.log("imageURI : " + imageURI);
                  QrCodeServices.CreateRequestContact(db, function (id) {
                    var fileName = id + '_' + new Date().getTime() + '.jpg';
                    console.log("fileName : " + fileName);
                    cameraService.RenamePicture(fileName, imageURI, function (url) {
                      console.log("url : " + url);


                      ContactsService.updateContactPhoto(db, id, url, function () {
                        console.log("update contact photo : ok");
                        // $rootScope.photographier = true;
                        var RID = parseInt(new Date().getTime() / 1000);
                        $rootScope.fromState = "app.qrcode";
                        SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                          id: id,
                          path: url,
                          RID: RID
                        }, function () {

                          console.log("insertRequest CONTACTPHOTO");
                          MenuService.setLocalStorage('ReloadContactList', 1);
                          $rootScope.isBackgroudRuning = false;
                          LoadingService.dismiss();
                          localStorage.setItem('isCameraOpened', 'false')
                          $state.go('app.contactEdit', {
                            id: id
                          }, {
                            reload: true
                          });
                        });

                      });

                    });
                  });
                }, function (err) {
                  console.log(err)
                  $rootScope.isBackgroudRuning = false;
                  LoadingService.dismiss();
                  localStorage.setItem('isCameraOpened', 'false')
                });

              } else {
                console.log('permission to access camera')
                $rootScope.isBackgroudRuning = false;
                LoadingService.dismiss();

              }
            }, function (error) {
              console.error("The following error occurred: " + error);
              $rootScope.isBackgroudRuning = false;
            }, cordova.plugins.diagnostic.permission.CAMERA);


          }
          // for iphone devices
          else {
            cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {
              if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

                var options = {
                  quality: 60,
                  destinationType: Camera.DestinationType.FILE_URI,
                  sourceType: Camera.PictureSourceType.CAMERA,
                  encodingType: Camera.EncodingType.JPEG,
                  targetWidth: 600,
                  targetHeight: 600,
                  correctOrientation: true,
                  popoverOptions: CameraPopoverOptions
                };

                localStorage.setItem('isCameraOpened', 'true')
                cameraService.getPicture(options).then(function (imageURI) {
                  QrCodeServices.CreateRequestContact(db, function (id) {
                    var fileName = id + '_' + new Date().getTime() + '.jpg';
                    cameraService.RenamePicture(fileName, imageURI, function (url) {
                      ContactsService.updateContactPhoto(db, id, url, function () {
                        // $rootScope.photographier = true;
                        $rootScope.fromState = "app.qrcode";
                        var RID = parseInt(new Date().getTime() / 1000);
                        SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                          id: id,
                          path: url,
                          RID: RID
                        }, function () {
                          MenuService.setLocalStorage('ReloadContactList', 1);
                          $rootScope.isBackgroudRuning = false;
                          LoadingService.dismiss();
                          localStorage.setItem('isCameraOpened', 'false')
                          $state.go('app.contactEdit', {
                            id: id
                          }, {
                            reload: true
                          });
                          // LoadingService.info($translate.instant('QrCode.scanImage'),'QrCodeController');
                        });
                      });
                    });
                  });

                }, function (err) {
                  localStorage.setItem('isCameraOpened', 'false')
                  $rootScope.isBackgroudRuning = false;
                  LoadingService.dismiss();
                });

              } else {
                if ($rootScope.requestAutorisecamera >= 1) {
                  LoadingService.dismiss();
                  LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserCamera'), 'QrCodeController');
                  $rootScope.isBackgroudRuning = false;
                  $rootScope.requestAutorisecamera++;
                } else {
                  LoadingService.dismiss();
                  $rootScope.isBackgroudRuning = false;
                  $rootScope.requestAutorisecamera++;
                }

              }
            });
          }
          /********************\
           begin open camera
           \********************/


        } else if ($rootScope.isBackgroudRuning && count == 0) {
          LoadingService.loading($translate.instant("business.waiting"));
        }
      }, true);

    }


    $scope.yesAutorisationCamera = function () {
      LoadingService.dismiss();
      cordova.plugins.diagnostic.switchToSettings(function () {
        console.log("Successfully switched to Settings app");

      }, function (error) {
        console.log("The following error occurred: " + error);
      });
    };

    $scope.noAutorisationCamera = function () {
      LoadingService.dismiss();

    };


    $scope.dismissInfo = function () {
      LoadingService.dismiss();

    }

    function isNotContactPage() {
      return $state.current.name != 'app.contactEdit' && $state.current.name != 'app.contactList' && $state.current.name != 'app.contactShow'
    }

    function isNotEditionPage() {
      return $state.current.name != 'app.contactEdit' && $state.current.name != 'app.buzcardEdit' && $state.current.name != 'app.buzcardSend' && $state.current.name != 'app.urgencyEdit' && $state.current.name != 'app.buzward'
    }

    function isEditionAndSend() {

      console.log('current state' + $state.current.name)
      return $state.current.name == 'app.buzcardEdit' || $state.current.name == 'app.buzcardSend' || $state.current.name == 'app.urgencyEdit' || $state.current.name == 'app.buzward' || $state.current.name == 'app.login' || $state.current.name == 'app.synchro' || $state.current.name == 'app.loading'
    }

  }
]);
