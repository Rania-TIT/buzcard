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
    'ConnectionService', '$interval', 'cameraService', '$window', 'BuzcardService', '$cordovaNativeAudio',
    function ($state, $scope, $ionicPlatform, LoadingService, $cordovaBarcodeScanner, $ionicHistory, $translate, QrCodeServices,
              ContactsService, $rootScope, $filter, SynchroServices, MenuService, LoginService, ConnectionService, $interval, cameraService, $window, BuzcardService, $cordovaNativeAudio) {


        var db = null;
        var act = "";
        $rootScope.needPassword = true;
        $rootScope.showWrongPassword = false;
        $rootScope.emailSend = null;
        $scope.infoSend = false;
        $rootScope.isBackgroudRuning = false;

        $ionicPlatform.ready(function () {

            $rootScope.dateUpdate = $filter('date')(new Date(BuildInfo.buildDate), 'MMM yyyy');


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
            $ionicPlatform.ready(function () {

                $cordovaNativeAudio.preloadSimple('snare', 'img/Mail_Sent.m4a');

            });

            /**
             * every 30' get position
             */
            if (!angular.isDefined($rootScope.forgroundMode)) {
              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                cordova.plugins.backgroundMode.setDefaults({silent: true});
              } else {
                cordova.plugins.backgroundMode.setDefaults({text: ''});
              }

                $rootScope.forgroundMode = $interval(function () {
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

                }, 7200000);
            }


            /** BG mode is activated */
            cordova.plugins.backgroundMode.on('activate', function () {

                console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', 'Activated')
              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                cordova.plugins.backgroundMode.setDefaults({silent: true});
              } else {
                cordova.plugins.backgroundMode.setDefaults({text: ''});
              }

                $interval.cancel($rootScope.timer);
                $rootScope.timer = undefined

                console.log(localStorage.getItem('isCameraOpened'))
                if (localStorage.getItem('isCameraOpened') != 'true') {
                    $rootScope.timer = undefined;
                    if (!angular.isDefined($rootScope.backgroundMode)) {
                        $rootScope.backgroundMode = $interval(function () {

                            SynchroServices.selectAllRequest(db, function (rs) {
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
                                /** End check for notification */
                                if (rs.rows.length > 0 && (!$rootScope.isBackgroudRuning && isNotContactPage())) {
                                    console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', "Sync Auto: Queue Full");
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
                                    console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', "Sync Auto: Skipped");
                                }
                            });
                        }, 180000);
                    }





                } else {
                    console.log("%cBackground Mode", 'background: #45FF55; color: #FC5044', 'Camera is opened')
                }
            });


            function endcheck() {
                console.log('end depilement');
                $interval.cancel($rootScope.backgroundMode);
                $rootScope.backgroundMode = undefined;
            }


            /** First run */
            if (!cordova.plugins.backgroundMode.isActive()) {

                $interval.cancel($rootScope.backgroundMode);
                $rootScope.backgroundMode = undefined;
              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                cordova.plugins.backgroundMode.setDefaults({silent: true});
              } else {
                cordova.plugins.backgroundMode.setDefaults({text: ''});
              }

                if (!angular.isDefined($rootScope.timer)) {
                    $rootScope.timer = $interval(function () {
                        console.log("%cFirst run", 'background: #222; color: #bada55', "Sync Auto: start...");

                        /**  check for notification */
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
                        /**  END check for notification */
                        SynchroServices.selectAllRequest(db, function (rs) {
                            if (rs.rows.length > 0 && (!$rootScope.isBackgroudRuning && isNotContactPage())) {
                                $rootScope.isBackgroudRuning = true;
                                $rootScope.emptyQueue = false;
                                ConnectionService.isConnected(db, function () {
                                    $cordovaNativeAudio.play('snare');
                                    $rootScope.isBackgroudRuning = false;
                                    $rootScope.emptyQueue = true;
                                    ContactsService.getContactsEdited().then(function (response) {
                                        if (response.data && response.data.contacts.pages > 0) {
                                            $rootScope.isDelta = true;
                                            $rootScope.countSynchroDelta++;
                                            if ($rootScope.countSynchroDelta == 1) {
                                                if (document.querySelector(".modal-open") != null) {
                                                    document.querySelector(".modal-open").classList.remove('modal-open');
                                                } else {
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
                                        } else {
                                            $rootScope.isDelta = false;
                                        }
                                        $rootScope.isBackgroudRuning = false;
                                        $rootScope.emptyQueue = true;

                                        console.log("----------------------------");
                                    }, function () {
                                        $rootScope.isBackgroudRuning = false;
                                        $rootScope.emptyQueue = true;
                                    });
                                }, function () {
                                    $rootScope.isBackgroudRuning = false;
                                });
                            } else {
                                console.log("%cFirst run", 'background: #222; color: #bada55', "Sync Auto: Skipped or empty queue");
                            }
                        });
                    }, 15000);
                }

            }


            /**  putting back app in foreground */
            cordova.plugins.backgroundMode.on('deactivate', function () {
                console.log("%c putting back app in foreground", 'background: #00FF00; color: #000')
              if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                cordova.plugins.backgroundMode.setDefaults({silent: true});
              } else {
                cordova.plugins.backgroundMode.setDefaults({text: ''});
              }
                onlyDelta()
                if (isNotEditionPage())
                    $state.go('app.qrcode')


                $interval.cancel($rootScope.backgroundMode);
                $rootScope.backgroundMode = undefined;

                if (!angular.isDefined($rootScope.timer)) {
                    $rootScope.timer = $interval(function () {
                        sychroWithoutDelta();
                    }, 15000);
                }
            });


            function onlyDelta() {
                $rootScope.isBackgroudRuning = true;
                ConnectionService.testConnected(db, function () {

                    ContactsService.getContactsEdited().then(function (response) {
                        if (response.data && response.data.contacts.pages > 0) {
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
                }, function () {
                    $rootScope.isBackgroudRuning = false;
                });
            }


            function sychroWithoutDelta() {
                console.log("%cSync without Delta", 'background: #fff; color: #222FFF', "Sync Auto: start...");
                SynchroServices.selectAllRequest(db, function (rs) {
                    if (rs.rows.length > 0 && (!$rootScope.isBackgroudRuning && isNotContactPage())) {
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
            if (ionic.Platform.isWindowsPhone()) {
                $cordovaBarcodeScanner
                    .scan()
                    .then(function (barcodeData) {
                        if (QrCodeServices.isBuzcardUrl(barcodeData.text)) {

                            act = QrCodeServices.extractAct(barcodeData.text);
                            QrCodeServices.vitalOrVcard(act, function (data) {

                                /************* debut cas de buzcard  **************/

                                // save add contact from qrcode to request
                                cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                                    if (authorized) {
                                        LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                                        SynchroServices.insertRequest(db, "QRCODE", {
                                            act: act
                                        }, function () {

                                        });
                                    } else {
                                        LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                        SynchroServices.insertRequest(db, "QRCODE", {
                                            act: act
                                        }, function () {

                                        });
                                    }
                                }, function (error) {
                                    console.error("The following error occurred: " + error);
                                    LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                    SynchroServices.insertRequest(db, "QRCODE", {
                                        act: act
                                    }, function () {

                                    });
                                });
                                /************ fin cas de buzcard        *********/
                                //  }
                            }, function (err) {
                                //console.log(JSON.stringify(err));
                                cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                                    if (authorized) {
                                        LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                                        SynchroServices.insertRequest(db, "QRCODE", {
                                            act: act
                                        }, function () {

                                        });
                                    } else {
                                        LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                        SynchroServices.insertRequest(db, "QRCODE", {
                                            act: act
                                        }, function () {

                                        });
                                    }
                                }, function (error) {
                                    console.error("The following error occurred: " + error);
                                    LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                    SynchroServices.insertRequest(db, "QRCODE", {
                                        act: act
                                    }, function () {

                                    });
                                });
                            });


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
                        //	    	  alert("Erreur de scan: " + error);
                        LoadingService.dismiss();
                    });
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

                                if (QrCodeServices.isBuzcardUrl(barcodeData.text)) {

                                    act = QrCodeServices.extractAct(barcodeData.text);
                                    QrCodeServices.vitalOrVcard(act, function (data) {
                                        cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                                            if (authorized) {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            } else {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            }
                                        }, function (error) {
                                            console.error("The following error occurred: " + error);
                                            LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                            SynchroServices.insertRequest(db, "QRCODE", {
                                                act: act
                                            }, function () {

                                            });
                                        });
                                        /************ fin cas de buzcard        *********/
                                        // }
                                    }, function (err) {

                                        cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                                            if (authorized) {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            } else {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            }
                                        }, function (error) {
                                            console.error("The following error occurred: " + error);
                                            LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                            SynchroServices.insertRequest(db, "QRCODE", {
                                                act: act
                                            }, function () {

                                            });
                                        });
                                    });


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
                                //	    	  alert("Erreur de scan: " + error);
                                LoadingService.dismiss();
                            });
                    } else {
                        LoadingService.dismiss();
                    }

                }, function (error) {
                    console.error("The following error occurred: " + error);

                }, [cordova.plugins.diagnostic.permission.CAMERA, cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);

            } else {


                cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {
                    //
                    if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

                        $cordovaBarcodeScanner
                            .scan()
                            .then(function (barcodeData) {

                                if (QrCodeServices.isBuzcardUrl(barcodeData.text)) {

                                    act = QrCodeServices.extractAct(barcodeData.text);
                                    console.warn(act);
                                    QrCodeServices.vitalOrVcard(act, function (data) {


                                        cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                                            if (authorized) {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            } else {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            }
                                        }, function (error) {
                                            console.error("The following error occurred: " + error);
                                            LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                            SynchroServices.insertRequest(db, "QRCODE", {
                                                act: act
                                            }, function () {

                                            });
                                        });
                                        /************ fin cas de buzcard        *********/
                                    }, function (err) {

                                        cordova.plugins.diagnostic.isContactsAuthorized(function (authorized) {

                                            if (authorized) {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            } else {
                                                LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                                SynchroServices.insertRequest(db, "QRCODE", {
                                                    act: act
                                                }, function () {

                                                });
                                            }
                                        }, function (error) {
                                            console.error("The following error occurred: " + error);
                                            LoadingService.popupBuz($translate.instant('OfflineQRcodeNoContact'), act, "QrCodeController");
                                            SynchroServices.insertRequest(db, "QRCODE", {
                                                act: act
                                            }, function () {

                                            });
                                        });
                                    });


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
            console.log("Synchro en background from qrCode");
            SynchroServices.selectAllRequest(db, function (rs) {
                console.log("Nb request dans la File: " + rs.rows.length);
                if (rs.rows.length > 0 && !$rootScope.isBackgroudRuning) {
                    //alert($rootScope.sychroEncours);
                    ConnectionService.isConnected(db, function () {
                        console.log("synchro auto terminé");
                        $rootScope.isSynchronizing = false;
                        //LoadingService.dismiss();
                    }, function () {
                        console.log("pas de conexion");
                        $rootScope.isSynchronizing = false;
                        LoadingService.dismiss();
                    });
                }
            });
            LoadingService.dismiss();
        }


        $scope.clickButtonFiche = function (id) {
            // alert(id+'click button fiche');
            $state.go('app.contactEdit', {
                id: id
            }, {
                reload: true
            });
        };

        $scope.clickButtonSend = function (id) {
            LoadingService.loading('Envoi en cours… ');


            ContactsService.getContactbyId(db, id, function (result) {
                var rdv = "";
                var langue = navigator.language.substring(0, 2);
                var tradEmailContent = "";
                console.log(langue);
                BuzcardService.selectEmailTradBylangue(db, langue, function (resultSet) {

                    if (resultSet.rows.length > 0) {
                        tradEmailContent = removeSlashes(resultSet.rows.item(0).textemail) + '\n' + $rootScope.nomComplet;
                        console.log(tradEmailContent);
                    } else {
                        tradEmailContent = "Hello, You will find enclosed herewith my contact details in vCard format to be registered in just one click in your address book (Phone, PC/Mac). You will receive another contact card in case of updates. Best regards.";

                    }

                    if (result.rows.item(0).rendez_vous != "") {
                        rdv = $filter('date')(new Date(result.rows.item(0).rendez_vous * 1000), 'MM/dd/yyyy')
                    } else {
                        rdv = $filter('date')(new Date(), 'MM/dd/yyyy')
                    }
                    var Rid = parseInt(new Date().getTime() / 1000);

                    var object = {
                        email: result.rows.item(0).email,
                        selectLang: langue,
                        checkFollower: "on",
                        sendMobile: 1,
                        dateRDV: rdv,
                        tradEmailContent: addSlashes(tradEmailContent),
                        idTmp: result.rows.item(0).id,
                        Rid: Rid
                    };


                    console.log(JSON.stringify(object));
                    SynchroServices.insertRequest(db, "BUZCARDSEND", object, function () {

                        LoadingService.dismiss();
                        $state.go('app.contactEdit', {
                            id: result.rows.item(0).id
                        }, {
                            reload: true
                        });
                    }, function () {
                        LoadingService.dismiss();
                        MenuService.setLocalStorage('ReloadContactList', 1);

                    });

                });


            });

            //   });
        };

        $scope.dismiss = function () {

            LoadingService.dismiss();
        };

        $scope.confirmSuccess = function () {

            response = $rootScope.QRCODERESPONSE;

            var contact = QrCodeServices.createContactFromQrCode(response.data.answer.contact_id.contact);
            ContactsService.selectContactbyEmail(db, contact.email, function (resultset) {

                //contact exxistant
                if (resultset.rows.length > 0) {

                    QrCodeServices.UPDATECONTACT(db, contact, function () {
                        ContactsService.downloadAndOverride(contact.id, function (urlImge) {
                            ContactsService.updateContactPhoto(db, contact.id, urlImge, function () {
                                QrCodeServices.saveContactDeviceFlash(contact.id, function () {
                                    $rootScope.fromState = "app.qrcode";
                                    LoadingService.dismiss();
                                    MenuService.setLocalStorage('ReloadContactList', 1);
                                    $state.go('app.contactEdit', {
                                        id: contact.id
                                    }, {
                                        reload: true
                                    });
                                });
                            });

                        });
                    });

                    //new contact
                } else {
                    //add contact server

                    QrCodeServices.CREATECONTAT(db, contact, function () {
                        ContactsService.downloadAndOverride(contact.id, function (urlImge) {
                            ContactsService.updateContactPhoto(db, contact.id, urlImge, function () {
                                QrCodeServices.saveContactDeviceFlash(contact.id, function () {
                                    LoadingService.dismiss();
                                    $rootScope.fromState = "app.qrcode";
                                    MenuService.setLocalStorage('ReloadContactList', 1);
                                    $state.go('app.contactEdit', {
                                        id: contact.id
                                    }, {
                                        reload: true
                                    });
                                });
                            });
                        });
                    });
                }
            });
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
                                QrCodeServices.CreateRequestContact(db, function (id) {
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
                                    }, function (err) {

                                        $rootScope.isBackgroudRuning = false;
                                        LoadingService.dismiss();
                                        localStorage.setItem('isCameraOpened', 'false')
                                    });
                                });
                            } else {
                                $rootScope.isBackgroudRuning = false;
                                LoadingService.dismiss();

                            }
                        }, function (error) {
                            console.error("The following error occurred: " + error);
                            $rootScope.isBackgroudRuning = false;
                        }, [cordova.plugins.diagnostic.permission.CAMERA, cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);


                    }
                    // for iphone devices
                    else {
                        cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {
                            if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
                                QrCodeServices.CreateRequestContact(db, function (id) {
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

                                    }, function (err) {
                                        localStorage.setItem('isCameraOpened', 'false')
                                        $rootScope.isBackgroudRuning = false;
                                        LoadingService.dismiss();
                                    });
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

    }
]);
