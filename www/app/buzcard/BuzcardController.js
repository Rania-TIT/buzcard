appContext.controller('BuzcardController', [
  '$ionicSideMenuDelegate',
  'BuzcardService',
  'cameraService',
  '$scope',
  '$state',
  '$ionicPlatform',
  '$cordovaSQLite',
  '$rootScope',
  'LoadingService',
  '$ionicHistory',
  '$ionicModal',
  '$ionicSlideBoxDelegate',
  'MenuService',
  'ConnectionService',
  '$translate', 'QrCodeServices', '$interval', 'SynchroServices',
  function($ionicSideMenuDelegate, BuzcardService, cameraService, $scope, $state, $ionicPlatform,
    $cordovaSQLite, $rootScope, LoadingService, $ionicHistory, $ionicModal, $ionicSlideBoxDelegate, MenuService, ConnectionService, $translate, QrCodeServices, $interval, SynchroServices) {

    var db = null;
    $rootScope.needPassword = true;
    $rootScope.showWrongPassword = false;
    $rootScope.denied = false;


    $ionicPlatform.ready(function() {

      $ionicSideMenuDelegate.canDragContent(false);

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

    });

    $scope.$on('$ionicView.beforeEnter', function() {
      var isWindowsPhone = ionic.Platform.isWindowsPhone();


      if (MenuService.getLocalStorage("customisation")) {
        $rootScope.isCusto = true;
        var arrayCusto = MenuService.getLocalStorage("customisation");
        $rootScope.secondColor = "1px solid " + arrayCusto[4];
        $rootScope.firstColor = arrayCusto[3];
        if (isWindowsPhone) {
          $rootScope.imgCusto = MenuService.getLocalStorage("imgCusto");
        } else {
          cameraService.checkExistFileCusto('newHeader.png', function(url) {
            var isWindowsPhone = ionic.Platform.isWindowsPhone();
            if (isWindowsPhone) {
              $rootScope.imgCusto = url;
            } else {

              $rootScope.imgCusto = url + '?' + new Date().getTime();

            }

          });

        }
      }
      showInfos();
    });
    /**
     * get infos profil
     */
    // TODO FIXME ng-repeat view buzcard.html
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
      $rootScope.denied = false;
      //avant d'afficher la page afficher la page loading
      BuzcardService.selectProfile(db, function(result) {
        // TODO FIXME ng-repeat view buzcard
        if (result.rows.length > 0) {
          var profil = result.rows.item(0);
          $scope.infos = profil;
          $scope.infos.address = profil.address_line_1 + ' ' + profil.address_line_2 + ' ' +
            profil.address_line_3 + ' ' + profil.postal_code + ' \n ' + profil.city + ' ' + profil.country;

          $scope.infos.address_p = profil.address_p_line_1 + ' ' + profil.address_p_line_2 + ' ' +
            profil.address_p_line_3 + ' ' + profil.postal_code_p + ' \n ' + profil.city_p;
          $scope.lengthName = 23;
          if ($scope.infos.first_name.lenght > 16 || $scope.infos.last_name.lenght > 16) {
            $scope.lengthName = 20;
          }
          var fileName = profil.photolocation.substr(profil.photolocation.lastIndexOf('/') + 1);
       
          	if(profil.photolocation !='' ){
       		 $scope.photoProfil = $rootScope.path+fileName;
       		 }else{
       			$scope.photoProfil = "img/photo_top_title.jpg";
       		 }
					console.log($scope.photoProfil);
          // cameraService.checkExistFile(fileName, function(url) {
          //   if (url == "img/photo_top_title.jpg") {
          //     BuzcardService.downloadPhotoProfil(db, window.localStorage.getItem('fileProfil'), profil.id, function(urlImge) {
          //       $scope.photoProfil = urlImge;
          //     });
          //   } else {
          //     $scope.photoProfil = url;
          //   }
          // });

          if (profil.photolocation != '') {
            $rootScope.fileLocaltion = window.localStorage.getItem('fileLocation');
          }
          $rootScope.idProfil = profil.id;


          QrCodeServices.selectMesQRcodes(db, function(results) {
            if (results.rows.length > 0) {
              for (var i = 0; i < results.rows.length; i++) {
                if (results.rows.item(i).type == "profil") {
                  if (results.rows.item(i).pathFile != "img/photo_top_title.jpg") {
                    var fileNamee = results.rows.item(i).pathFile.substr(results.rows.item(i).pathFile.lastIndexOf('/') + 1);
                    $scope.qrProfil = $rootScope.path + fileNamee;

                  }
                  //                			$scope.qrProfil = results.rows.item(i).pathFile;
                  //                				console.log("qr profil -----"+$scope.qrProfil);
                }
              }
            }
          });


        }

      });

    };
    $scope.getlink_1 = function() {

      window.open($scope.infos.link_1, '_system');

    };
    $scope.getlink_2 = function() {

      window.open($scope.infos.link_2, '_system');

    };
    $scope.getlink_3 = function() {

      window.open($scope.infos.link_3, '_system');

    };
    $scope.getlink_4 = function() {

      window.open($scope.infos.link_4, '_system');

    };

    $scope.clickReseauxSociaux = function(linkRx) {
      var prefix = 'http://';
      if (!linkRx.match(/^[a-zA-Z]+:\/\//)) {
        linkRx = prefix + linkRx;
      }
      // console.log(linkRx);
      window.open(linkRx, '_system', 'location=yes');

    }

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
    }

    $ionicModal.fromTemplateUrl('app/common/partials/photoQRBuz.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modall = modal;
    });

    $scope.openModall = function() {
      $scope.modall.show();
    };

    $scope.closeModall = function() {
      $scope.modall.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modall.remove();
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

    $scope.showImageQR = function() {
      $scope.openModall();
    }

    /**
     *
     */
    $scope.updateAll = function() {
      $state.go("app.buzcardEdit");
    }
    $scope.ok = function() {
      LoadingService.dismiss();
      $state.go("app.buzcard", {}, {
        reload: true
      });
    };

  }
]);
