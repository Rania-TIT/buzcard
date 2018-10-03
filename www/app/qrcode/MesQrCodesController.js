appContext.controller('MesQrCodesController', ['$state', '$scope', '$ionicPlatform', 'LoadingService', '$translate', 'QrCodeServices', '$ionicModal', '$rootScope', 'BuzcardService',
    function ($state, $scope, $ionicPlatform, LoadingService, $translate, QrCodeServices, $ionicModal, $rootScope, BuzcardService) {


        /**
         * create/open DB
         */
        var db = null;
        $rootScope.needPassword = true;
        $rootScope.showWrongPassword = false;
        $ionicPlatform.ready(function () {


            if (window.cordova) {
                db = window.sqlitePlugin.openDatabase({name: "buzcard.db", androidDatabaseImplementation: 2}); // device
            } else {
                db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
            }
            ;

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
        });


        QrCodeServices.selectMesQRcodes(db, function (results) {
            if (results.rows.length > 0) {
                for (var i = 0; i < results.rows.length; i++) {
                    if (results.rows.item(i).type == "profil") {
                        if (results.rows.item(i).pathFile != "img/photo_top_title.jpg") {
                            var fileName = results.rows.item(i).pathFile.substr(results.rows.item(i).pathFile.lastIndexOf('/') + 1);
                            $scope.qrProfil = $rootScope.path + fileName;
                        }
                    } else if (results.rows.item(i).type == "vital") {
                        if (results.rows.item(i).pathFile != "img/photo_top_title.jpg") {
                            var fileName = results.rows.item(i).pathFile.substr(results.rows.item(i).pathFile.lastIndexOf('/') + 1);
                            $scope.qrVital = $rootScope.path + fileName;

                        }
                    }
                }
            }
        });

        $ionicModal.fromTemplateUrl('app/common/partials/photoQRBuz.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modall = modal;
        });

        $scope.openModall = function () {
            $scope.modall.show();
        };

        $scope.closeModall = function () {
            $scope.modall.hide();
        };

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modall.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hide', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });
        $scope.$on('modal.shown', function () {
            // console.log('Modal is shown!');
        });

        $scope.showImageQR = function () {
            $scope.openModall();
        }


        $ionicModal.fromTemplateUrl('app/common/partials/photoQRVital.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modalV = modal;
        });

        $scope.openModalV = function () {
            $scope.modalV.show();
        };

        $scope.closeModalV = function () {
            $scope.modalV.hide();
        };

        //Cleanup the modal when we're done with it!
        $scope.$on('$destroy', function () {
            $scope.modalV.remove();
        });
        // Execute action on hide modal
        $scope.$on('modal.hide', function () {
            // Execute action
        });
        // Execute action on remove modal
        $scope.$on('modal.removed', function () {
            // Execute action
        });
        $scope.$on('modal.shown', function () {
            // console.log('Modal is shown!');
        });

        $scope.showImageV = function () {
            $scope.openModalV();
            linkVital();
        }

        function linkVital() {
            BuzcardService.getACT(function (act) {
                var link = "https://www.buzcard.com/buzcardvital.aspx?act=" + act


                if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    navigator.app.loadUrl(link, {
                        openExternal: true
                    });
                    LoadingService.dismiss();
                } else {
                    window.open(link, '_system');
                    LoadingService.dismiss();
                }
            })
        }
    }]);