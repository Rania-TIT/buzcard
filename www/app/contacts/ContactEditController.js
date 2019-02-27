appContext.controller("ContactEditController", [
  '$scope',
  '$state',
  '$filter',
  'ContactsService',
  'LoadingService',
  '$ionicPlatform',
  '$cordovaSQLite',
  '$stateParams',
  '$rootScope',
  'cameraService',
  '$ionicHistory',
  'ConnectionService',
  'SynchroServices',
  '$cordovaKeyboard',
  'MenuService',
  '$ionicViewSwitcher',
  '$translate',
  '$cordovaGeolocation',
  '$timeout',
  '$ionicScrollDelegate',
  '$cordovaSms', 'ionicToast', 'BuzcardService','$cordovaNativeAudio',
  function($scope, $state, $filter, ContactsService, LoadingService,
    $ionicPlatform, $cordovaSQLite, $stateParams, $rootScope,
    cameraService, $ionicHistory, ConnectionService, SynchroServices, $cordovaKeyboard, MenuService, $ionicViewSwitcher, $translate, $cordovaGeolocation, $timeout,
    $ionicScrollDelegate, $cordovaSms, ionicToast, BuzcardService,$cordovaNativeAudio) {

    $scope.showLast = false;
    $scope.tmp = false;
    $scope.isFocusable = false;
    $scope.noGroup = false;
    var photoChangeListener = null;
    var photoRequestID = null;
    var tmpContact = {};
    var db = null;
    var networkAttempt = 0;
    $rootScope.focusName = false;
    var gpsAttempt = 0;
    $rootScope.language = $translate.instant('ContactEdit.noGroup');


    $ionicPlatform.ready(function() {

    	$rootScope.focusName = false;
     document.getElementById("empty_zone").click()
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

	  $cordovaNativeAudio.preloadSimple('snare', 'img/Mail_Sent.m4a');
    });

    $scope.$on('$ionicView.beforeEnter', function(scopes, states) {
      $rootScope.isBackgroudRuning = false;
      getContact();
    });
    /**
     * get infos contact by id
     */
    function getContact() {
      // remplir select box
      ContactsService.selectAllGroup(db, function(result) {
        $rootScope.groups = new Array();
        $rootScope.groups[0] = $translate.instant('ContactEdit.noGroup');
        for (var i = 0; i < result.rows.length; i++) {
          $rootScope.groups[i + 1] = removeSlashes(result.rows.item(i).name);
        }
        $rootScope.groups[$rootScope.groups.length] = $translate.instant('ContactEdit.NewGrp');


      });

      ContactsService.getContactbyId(db, $stateParams.id, function(result) {
        if (result.rows.length > 0) {

          $rootScope.tmpContact = angular.copy(result.rows.item(0));

          tmpContact = angular.copy(result.rows.item(0));
          $scope.contact = result.rows.item(0);
          $scope.contact.last_name = removeSlashes(result.rows.item(0).last_name);
          $scope.contact.first_name = removeSlashes(result.rows.item(0).first_name);
          $scope.contact.company = removeSlashes(result.rows.item(0).company);
          $scope.contact.list = removeSlashes(result.rows.item(0).list);
          $scope.contact.fonction = removeSlashes(result.rows.item(0).fonction);
          //   $scope.contact.address = removeSlashes(result.rows.item(0).addressline1)+" "+removeSlashes(result.rows.item(0).addressline2)+" "+removeSlashes(result.rows.item(0).addressline3)+" "+removeSlashes(result.rows.item(0).postalcode)+" "+removeSlashes(result.rows.item(0).city);
          $scope.contact.Link_CardOnline = result.rows.item(0).Link_CardOnline;
          $scope.contact.addressline1 = removeSlashes(result.rows.item(0).addressline1);
          $scope.contact.addressline2 = removeSlashes(result.rows.item(0).addressline2)
          $scope.contact.addressline3 = removeSlashes(result.rows.item(0).addressline3)
          $scope.contact.postalcode = removeSlashes(result.rows.item(0).postalcode)
          $scope.contact.city = removeSlashes(result.rows.item(0).city);
          if (result.rows.item(0).list == "")
            $scope.contact.list = $scope.groups[0];
          else {
            document.querySelector('#newGroupeName').disabled = false;
            document.querySelector('#newGroupeName').value = "";
          }

          document.querySelector('#newGroupeName').value = removeSlashes(result.rows.item(0).list);
          $rootScope.oldGroupName = removeSlashes(result.rows.item(0).list);

          if ($rootScope.fromState == "app.buzcardSend" || $rootScope.fromState == "app.contactList") {
            $scope.showSend = true;
            $rootScope.focusName = false;
          } else
            $scope.showSend = false;

          $scope.contact.comment = removeSlashes(result.rows.item(0).comment);

          $scope.contact.lastsendemail = result.rows.item(0).lastsendemail;
          if ($rootScope.fromState == "app.contactShow") {
            if (removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('ContactEdit.SearchGPS') || removeSlashes(result.rows.item(0).meeting_point) == "undefined" || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place') || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place-GPS')) {

              $scope.contact.meeting_point = '';
              tmpContact.meeting_point = '';
            } else {

                $scope.contact.meeting_point = removeSlashes(result.rows.item(0).meeting_point);
            }
          } else if ($rootScope.fromState == "app.buzcardSend" ) {
            console.log('-----sms------')
            console.log(result.rows.item(0).meeting_point)
            if (result.rows.item(0).meeting_point == "" || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('ContactEdit.SearchGPS') || removeSlashes(result.rows.item(0).meeting_point) == "undefined" || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place') || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place-GPS')) {
            console.log('*********')
              $scope.contact.meeting_point = '';
                tmpContact.meeting_point = '';
                ConnectionService.testConexion(db, function(){
                	 console.log("connected");
                	  ContactsService.geolocalicationAdress(db, $scope.contact, function(adress) {
                            $scope.contact.meeting_point = removeSlashes(adress);

                          if ($scope.contact.meeting_point != $translate.instant('No-place') && $scope.contact.meeting_point != $translate.instant('No-place-GPS')) {
                        	  ContactsService.updateContactByField(db, "meeting_point", adress, $scope.contact.id, function() {
                              });
                          }

                        });
                },function(){
                	 console.log("no connected");
                	$scope.contact.meeting_point="";
                });
                 } else {

                $scope.contact.meeting_point = removeSlashes(result.rows.item(0).meeting_point);

            }

          }
          if (!compareDate(result.rows.item(0).lastsendemail,result.rows.item(0).firstsendemail))
            $scope.showLast = true;
          if (result.rows.item(0).photofilelocation == "img/photo_top_title.jpg" || result.rows.item(0).photofilelocation == "") {

            $scope.photoProfil = "img/photocontact.png";
            $scope.imageExist = true;
          } else {
            $scope.imageExist = false;
            var fileName = result.rows.item(0).photofilelocation.substr(result.rows.item(0).photofilelocation.lastIndexOf('/') + 1);
            result.rows.item(0).photofilelocation = $rootScope.path + fileName;
            $scope.photoProfil = result.rows.item(0).photofilelocation;
            console.log($scope.photoProfil);
          }

          $rootScope.oldRDV = result.rows.item(0).rendez_vous;
          // Use the picker object directly.
          if (result.rows.item(0).rendez_vous && result.rows.item(0).rendez_vous != "NaN") {
        	  var picker = $('#dateX').pickadate('picker');
            $scope.contact.rendez_vous = $filter('date')(new Date(result.rows.item(0).rendez_vous * 1000), 'dd/MM/yyyy');
            picker.set('select', new Date(result.rows.item(0).rendez_vous * 1000));
            picker.set('view', new Date(result.rows.item(0).rendez_vous * 1000));
            picker.set('highlight', new Date(result.rows.item(0).rendez_vous * 1000));

            if ($scope.contact.rendez_vous == '01/01/1900' || $scope.contact.rendez_vous == '01/01/1970') {

              $scope.contact.rendez_vous = '';
            }
          } else {

            $scope.contact.rendez_vous = '';
          }
          $scope.tmp = true;

        } else {
          $state.go('app.qrcode');
        }

      });
      LoadingService.dismiss();

    };

    $scope.getLink = function(link) {
      window.open(link, '_system');
    }

    function updateContactFn(contact, callBack) {
      var contactId = contact.id;
      if (contact.email == "") {
        ContactsService.updateContactByField(db, "status", "cant_be_selected", contact.id, function() {
            updateContactFct(contact, function (){
            if (!areTheSame($rootScope.tmpContact, $scope.contact))

            LoadingService.dismiss();

            if ($rootScope.fromState == "app.buzcardSend") {
              MenuService.setLocalStorage('ReloadContactList', 1);
                if ( $scope.contactSaved == false) {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.SansNumero'), contactId);
                  return callBack()
                } else {

                  ShowPopUpSychroAuto($translate.instant('ContactEdit.AvecNumero'), contactId);
                  return callBack()
                }
            } else if ($rootScope.fromState == "app.contactShow") {
              if ($scope.contactSaved == false) {
                ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifSansNumero'), contactId);
                return callBack()
              } else {
                ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifAvecNumero'), contactId);
                return callBack()
              }
            } else if ($rootScope.fromState == "app.qrcode") {
              MenuService.setLocalStorage('ReloadContactList', 1);
              ShowPopUpSychroAuto($translate.instant('ContactEdit.sendvcardWithPhoto'), contactId);
              return callBack()
            } else if ($rootScope.fromState == "app.contactList") {
              MenuService.setLocalStorage('ReloadContactList', 1);
              if ($scope.contactSaved == false) {
                ShowPopUpSychroAuto($translate.instant('ContactEdit.SansNumero'), contactId);
                return callBack()
              } else {
                ShowPopUpSychroAuto($translate.instant('ContactEdit.AvecNumero'), contactId);
                return callBack()
              }
            }else{
              if ($scope.contactSaved == false) {
                ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifSansNumero'), contactId);
                return callBack()
              } else {
                ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifAvecNumero'), contactId);
                return callBack()
              }
            }
          });
        });
      } else {
        ContactsService.updateContactByField(db, "status", "selected", contact.id, function() {
            updateContactFct(contact, function () {
              if (!areTheSame($rootScope.tmpContact, $scope.contact))
                LoadingService.dismiss();

              if ($rootScope.fromState == "app.buzcardSend") {
                MenuService.setLocalStorage('ReloadContactList', 1);

                  if ($scope.contactSaved == false) {
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.SansNumero'), contactId);
                    return callBack()
                  } else {

                    ShowPopUpSychroAuto($translate.instant('ContactEdit.AvecNumero'), contactId);
                    return callBack()
                  }
              } else if ($rootScope.fromState == "app.contactShow") {
                if ($scope.contactSaved == false) {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifSansNumero'), contactId);
                  return callBack()
                } else {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifAvecNumero'), contactId);
                  return callBack()
                }
              } else if ($rootScope.fromState == "app.qrcode") {
                MenuService.setLocalStorage('ReloadContactList', 1);
                ShowPopUpSychroAuto($translate.instant('ContactEdit.sendvcardWithPhoto'), contactId);
                return callBack()
              } else if ($rootScope.fromState == "app.contactList") {
                MenuService.setLocalStorage('ReloadContactList', 1);
                if ($scope.contactSaved == false) {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.SansNumero'), contactId);
                  return callBack()
                } else {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.AvecNumero'), contactId);
                  return callBack()
                }
              }else{
                if ($scope.contactSaved == false) {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifSansNumero'), contactId);
                  return callBack()
                } else {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.ModifAvecNumero'), contactId);
                  return callBack()
                }
              }
            });
        });
      }
    }

    function updateContactFct(contact, callback) {
      var dateRDV = $('#dateX').val();
      var newNameTmp = document.querySelector('#newGroupeName').value;

      // LoadingService.loading($translate.instant('Buzcard.Msg'));
      if ($('#dateX').val() == '')
        contact.rendez_vous = '';
      else
        contact.rendez_vous = $('#dateX').val();
      $scope.contact = contact;
        console.error($scope.contact)
      //cas de nouveau groupe & le champ est vide
      if (document.querySelector('#newGroupeName').value == "" && $scope.contact.list == $translate.instant('ContactEdit.NewGrp')) {
        LoadingService.error($translate.instant('ContactEdit.Msg1'), "ContactEditController");

        //cas d'un groupe existant & le champ est vide
      } else if (document.querySelector('#newGroupeName').value == "" && $scope.contact.list != $translate.instant('ContactEdit.NewGrp') && $scope.contact.list != "" && $scope.contact.list != null) {
        LoadingService.error($translate.instant('ContactEdit.Msg2'), "ContactEditController");

        //tous les champs sont bien remplis
      } else if ($scope.contact.list == $translate.instant('ContactEdit.NewGrp') && checkIfExist(newNameTmp, $rootScope.groups)) {
        LoadingService.error($translate.instant('ContactEdit.Msg3'), "ContactEditController");

      } else {

        /** begin initialisation */
        var contactObj = {};
        for (var key in contact)
          contactObj[key] = removeSlashes(contact[key]);

        var oldName = contactObj.list;
        var newName = document.querySelector('#newGroupeName').value;
        contactObj.list = newName;

        /******* end *******/

        try {

          contactObj.rendez_vous = toUsFormat(contact.rendez_vous);

          if ($scope.contact.list == $translate.instant('ContactEdit.NewGrp') && !checkIfExist(newName, $rootScope.groups)) {

            ContactsService.updateContactInfo(db, contactObj, function() { //update contact local

              ContactsService.insertIntoGroupTable(db, newName, function() { //create new groupe local
                if ($rootScope.oldGroupName != '') {
                  ContactsService.selectContactByGroupName(db, $rootScope.oldGroupName, function(result) {
                    //cas où l'ancien groupe sera vide
                    if (result.rows.length == 0) {
                      ContactsService.deleteGroupByName(db, $rootScope.oldGroupName, function(result) {

                      });
                    }
                  });
                }

              });
            });
            //cas rename groupe
          } else if (oldName != $translate.instant('ContactEdit.NewGrp') && oldName != newName && newName != "") {
            MenuService.setLocalStorage('ReloadContactList', 1);
            ContactsService.updateContactInfo(db, contactObj, function() { //update contact local
              ContactsService.editGroup(db, oldName, newName, function(result) { //edit groupe local
                ContactsService.renameContactGroup(db, oldName, newName, function(result) {


                });
              });
            });

            //cas nom de groupe existe déjà
          } else if ($scope.contact.list == $translate.instant('ContactEdit.NewGrp') && checkIfExist(newName, $rootScope.groups)) {
            LoadingService.error($translate.instant('ContactEdit.Msg3'), "ContactEditController");

            // cas de modification de groupe
          } else if (oldName != $translate.instant('ContactEdit.NewGrp') && ((newName == "" && oldName == null) || (newName == oldName))) {
            ContactsService.updateContactInfo(db, contactObj, function() { //update contact local
              if ($rootScope.oldGroupName != '') {
                ContactsService.selectContactByGroupName(db, $rootScope.oldGroupName, function(result) {
                  //cas où l'ancien groupe sera vide
                  if (result.rows.length == 0) {
                    ContactsService.deleteGroupByName(db, $rootScope.oldGroupName, function(result) {

                    });
                  }
                });
              }
            });
          }

        } catch (e) {
          // TODO: handle exception
        }



        $rootScope.contactObj = contactObj;
        // LoadingService.loading($translate.instant('ContactEdit.Msg4'));
        if(contact.email != $translate.instant('loading.data') && contact.first_name != $translate.instant('loading.data') && contact.last_name != $translate.instant('loading.data'))
        if ($rootScope.opened && contact.rendez_vous != '') {
          LoadingService.loading($translate.instant('LoadingSynchroCalender'));
              console.warn(contactObj)
          ContactsService.createAgendaRDV(db, contactObj, $rootScope.oldRDV, function(result) {


          });

        }


        // LoadingService.loading($translate.instant('Buzcard.Msg'));
        ConnectionService.isConnectedWithoutSync(db, function() {


        }, function() {

            LoadingService.loading($translate.instant('ContactEdit.Msg4'));

            /*******************************\
             préparation de l'objet serveur
            \*******************************/
            if (oldName == null)
              oldName = "";

            var contactObjx = {};
            for (var key in tmpContact)
              if ($scope.contact[key] != tmpContact[key])
                contactObjx[key] = addSlashes($scope.contact[key]);

            delete contactObjx.id;
            delete contactObjx.date;

            contactObjx.list = addSlashes(newName);
            /******* end *******/

            //cas rename groupe //2 requete
            if (addSlashes(oldName) != $translate.instant('ContactEdit.NewGrp') && addSlashes(oldName) != addSlashes(newName) && addSlashes(newName) != "") {

              SynchroServices.insertRequest(db, "RENAMEGROUP", {
                newName: addSlashes(newName),
                oldName: addSlashes(oldName)
              }, function(result) {
                if (!isEmpty(contactObjx)) {
                  SynchroServices.insertRequest(db, "CONTACTEDIT", {
                    id: $stateParams.id,
                    contact: {list: addSlashes(newName)}
                  }, function(result) {

                    LoadingService.dismiss();

                    return callback()
                  });
                } else {
                  LoadingService.dismiss()
                  return callback()
                }
              });

            } else {
               LoadingService.dismiss();
             return callback()

            }
        //  }

        });

      }



    };


    /**
     * confim click sur ok dans popup enregistrement
     */
    $scope.ok = function(id) {
        LoadingService.dismiss();

    };

    function ShowPopUpSychroAuto(msg, param) {

        if ($rootScope.useCamera == true)
          LoadingService.confirm($translate.instant('ContactEdit.sendvcardWithPhoto'), param, "ContactEditController");
        else
          LoadingService.confirm(msg, param, "ContactEditController");


          $rootScope.useCamera = false;
          $rootScope.photographier = false;

          $state.go('app.qrcode');
    }


    if ($rootScope.photographier == true) {
      $rootScope.useCamera = true;
    } else {
      $rootScope.useCamera = false;
    }

    $scope.yesAutorisation = function(id) {
      LoadingService.dismiss();
      cordova.plugins.diagnostic.switchToSettings(function() {
        $state.go('app.contactShow', {
          id: id
        }, {
          reload: true
        });

      }, function(error) {
        console.log("The following error occurred: " + error);
      });
    };

    $scope.noAutorisation = function(id) {
      LoadingService.dismiss();
      $state.go('app.contactShow', {
        id: id
      }, {
        reload: true
      });
    }

    /**
     * click on button supprimer: delete contact
     */
    $scope.deleteContact = function() {
      LoadingService.question($translate.instant('ContactEdit.Msg7'),
        $stateParams.id, "ContactEditController");
    };

    /**
     * click on button Non (popup suppression)
     */
    $scope.no = function() {

      LoadingService.dismiss();
    };

    /**
     * click on button Yes (pop up suppression )
     */
    $scope.yes = function(params) {
      ContactsService.deleteContactLocal(db, params, function() {
        if ($rootScope.oldGroupName != '') {
          ContactsService.selectContactByGroupName(db, $rootScope.oldGroupName, function(result) {
            //cas où l'ancien groupe sera vide
            if (result.rows.length == 0) {
              ContactsService.deleteGroupByName(db, $rootScope.oldGroupName, function(result) {

              });
            }
          });
        }
      });
        //cas non connecté
        SynchroServices.insertRequest(db, "CONTACTDELETE", {
          id: $stateParams.id
        }, function() {

          LoadingService.dismiss();
          MenuService.setLocalStorage('ReloadContactList', 1);
          LoadingService.confirmDelete($translate.instant('ContactEdit.deleteContact'), "ContactEditController");
        });
    };

    $scope.okDelete = function() {
      LoadingService.dismiss();

      $state.go('app.contactList');
    }
    /**
     * capture photo
     */
    $scope.getPhoto = function() {
      if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {

        cordova.plugins.diagnostic.requestCameraAuthorization(function (status) {
          //
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
            cameraService.getPicture(options).then(function(imageURI) {

              var fileName = $stateParams.id + '_' + new Date().getTime() + '.jpg';
              $scope.imageExist = false;
              var RID =parseInt(new Date().getTime()/1000);
              $scope.photoProfil = imageURI;
              var imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              if (imageURL == '') {
                imageURL = imageURI;
              } else {
                imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              }
              cameraService.RenamePicture(fileName, imageURL, function(url) {
                $scope.photoProfil = url;
                $scope.contact.photofilelocation = url;

                ContactsService.updateContactPhoto(db, $stateParams.id, url, function() {
                  $rootScope.useCamera = true;

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                      photoChangeListener = true
                      photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      localStorage.setItem('isCameraOpened', 'false')
                    });

                  });

                });
            }, function(err) {
              // console.error(err);
            });
    	          }else{
            LoadingService.dismiss();
               }

    	          }, function(error){
                      console.error("The following error occurred: "+error);
                  });

      } else {



        cordova.plugins.diagnostic.requestCameraAuthorization(function(status) {

          if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {


            var options = {
              quality: 90,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.CAMERA,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 700,
              targetHeight: 700,
              correctOrientation: true,
              popoverOptions: CameraPopoverOptions
            };
            localStorage.setItem('isCameraOpened', 'true')
            cameraService.getPicture(options).then(function(imageURI) {

              var fileName = $stateParams.id + '_' + new Date().getTime() + '.jpg';
              $scope.imageExist = false;
              var RID =parseInt(new Date().getTime()/1000);
              $scope.photoProfil = imageURI;
              var imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              if (imageURL == '') {
                imageURL = imageURI;
              } else {
                imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              }
              cameraService.RenamePicture(fileName, imageURL, function(url) {
                $scope.photoProfil = url;
                $scope.contact.photofilelocation = url;
                $rootScope.useCamera = true;
                ContactsService.updateContactPhoto(db, $stateParams.id, url, function() {
                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      localStorage.setItem('isCameraOpened', 'false')
                    });

                  });
              });
            }, function(err) {
              // console.error(err);
            });
          } else {
            if ($rootScope.requestAutorisecamera >= 1)
              LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserCamera'), 'ContactEditController');
           $rootScope.requestAutorisecamera++;
          }
        });
      }
    };
    /**
     * choose file from library
     */
    $scope.choseFile = function() {
      if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {

        cordova.plugins.diagnostic.requestRuntimePermission(function (status) {
          //
          if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {
            var options = {
              quality: 100,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 600,
              targetHeight: 600,
              correctOrientation: true,
              popoverOptions: CameraPopoverOptions
            };
            localStorage.setItem('isCameraOpened', 'true')
            cameraService.getPicture(options).then(function(imageURI) {
              var isWindowsPhone = ionic.Platform.isWindowsPhone();
              var fileName = $stateParams.id + '_' + new Date().getTime() + '.jpg';
              $scope.imageExist = false;
              var RID =parseInt(new Date().getTime()/1000);
              $scope.photoProfil = imageURI;
              var imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              if (imageURL == '') {
                imageURL = imageURI;
              } else {
                imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              }
              cameraService.RenamePicture(fileName, imageURL, function(url) {
                $scope.photoProfil = url;
                $scope.contact.photofilelocation = url;

                $rootScope.useCamera = true;

                ContactsService.updateContactPhoto(db, $stateParams.id, url, function() {


                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      localStorage.setItem('isCameraOpened', 'false')
                    });

                  });
                });
            }, function(err) {
              //alert(JSON.stringify(err));
            });
          }


          }, function(error){
              console.error("The following error occurred: "+error);
          }, cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE);


      } else {

        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status) {

          if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

            var options = {
              quality: 100,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 600,
              targetHeight: 600,
              correctOrientation: true,
              popoverOptions: CameraPopoverOptions
            };
            localStorage.setItem('isCameraOpened', 'true')
            cameraService.getPicture(options).then(function(imageURI) {
              var isWindowsPhone = ionic.Platform.isWindowsPhone();
              var fileName = $stateParams.id + '_' + new Date().getTime() + '.jpg';
              $scope.imageExist = false;
              var RID =parseInt(new Date().getTime()/1000);
              $scope.photoProfil = imageURI;
              var imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              if (imageURL == '') {
                imageURL = imageURI;
              } else {
                imageURL = imageURI.substr(0, imageURI.lastIndexOf('?'));
              }
              cameraService.RenamePicture(fileName, imageURL, function(url) {
                $scope.photoProfil = url;
                $scope.contact.photofilelocation = url;


                $rootScope.useCamera = true;
                ContactsService.updateContactPhoto(db, $stateParams.id, url, function() {
                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      localStorage.setItem('isCameraOpened', 'false')
                    });

                  });
                });
            }, function(err) {
              // alert(JSON.stringify(err));
            });
          } else {
            if ($rootScope.requestAutorisePhoto >= 1)
              LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserPhoto'), 'ContactEditController');
            $rootScope.requestAutorisePhoto++;
          }
        });
      }

    };

    $scope.yesAutorisationCamera = function() {
      LoadingService.dismiss();
      cordova.plugins.diagnostic.switchToSettings(function() {

      }, function(error) {
        console.log("The following error occurred: " + error);
      });
    };

    $scope.noAutorisationCamera = function() {
      LoadingService.dismiss();

    };

    $scope.dismissInfo = function() {
      LoadingService.dismiss();
    };

    /**
     * select box handler
     */
    $scope.changeHandler = function() {

      if ($scope.contact.list != $translate.instant('ContactEdit.NewGrp') && $scope.contact.list != $translate.instant('ContactEdit.noGroup')) {
        $scope.isFocusable = true;
        document.querySelector('#newGroupeName').value = $scope.contact.list;
        document.querySelector('#newGroupeName').disabled = false;
        $scope.tmpContact.list = document.querySelector('#newGroupeName').value
        ContactsService.updateContactByField(db, 'list', $scope.contact.list, parseInt($stateParams.id), function () {
          SynchroServices.insertRequest(db, "CONTACTEDIT", {
            id: $stateParams.id,
            contact: {list: $scope.contact.list}
          }, function (result) {
            console.log('request insert' + JSON.stringify({list: $scope.contact.list}))
          })
        })
      } else {
        $scope.isFocusable = true;
        //document.querySelector('#groupe-combo-editcontact').style.height = '80px';
        document.querySelector('#newGroupeName').value = "";
        document.querySelector('#newGroupeName').disabled = false;

        $timeout(function() {
          document.getElementById("newGroupeName").focus();
          // $ionicScrollDelegate.$getByHandle().scrollTop(false);
        });
      }
      /**
       *
       * save list name && save request
       *
       */

    };

    // to dismiss the PopUp
    $scope.dismiss = function() {
      LoadingService.dismiss();

    };


    function checkIfExist(string, array) {
      if (string != "" && array.length > 0) {
        var exist = false;
        for (var int = 0; int < array.length; int++) {
          if (array[int].trim().toUpperCase() == string.trim().toUpperCase())
            exist = true;
        }
        return exist;
      } else return false;
    }

    function isEmpty(value) {
      return Boolean(value && typeof value == 'object') && !Object.keys(value).length;
    };

    function toUsFormat(dateTimeStamp) {
      if (!dateTimeStamp)
        return '';
      var n = new Date(dateTimeStamp.substr(6, 4), parseInt(dateTimeStamp.substr(3, 2)) - 1, dateTimeStamp.substr(0, 2));

      var x = (n.getMonth() + 1) + "/" + n.getDate() + "/" + n.getFullYear();

      return (n.getMonth() + 1) + "/" + n.getDate() + "/" + n.getFullYear();
    };


    function areTheSame(obj1, obj2) {
      var d1 = new Date(obj1.rendez_vous * 1000);
      var d2 = new Date(getTimeStampFromFrenchFormatDate(obj2.rendez_vous));

      if (d1.getTime() != d2.getTime()) {
        // console.log("d1 is not d2");
        return false;
      } else {
        delete obj1.rendez_vous;
        delete obj2.rendez_vous;
        // console.error(obj1);
        if (JSON.stringify(obj1) === JSON.stringify(obj2)) {
          // console.log("obj1 ==== D2");
          return true;
        } else {
          // console.log("d1 ==@##=== D2");
          return false;
        }

      }

    }
    function compareDate(d1,d2){

    	var dd1 = new Date(d1);
  	    console.log(dd1);
  	    var dd2 = new Date(d2);
  	    console.log((dd1.getDate() == dd2.getDate() && dd1.getFullYear() == dd2.getFullYear() && dd1.getMonth() == dd2.getMonth() && dd1.getHours() == dd2.getHours() && dd1.getMinutes() == dd2.getMinutes())) ;

  	  if(dd1.getDate() == dd2.getDate() && dd1.getFullYear() == dd2.getFullYear() && dd1.getMonth() == dd2.getMonth() && dd1.getHours() == dd2.getHours() && dd1.getMinutes() == dd2.getMinutes()) return true;
	     else return false;

    }

    function getTimeStampFromFrenchFormatDate(frDate) {
      try {

        if (true) {
          var array = frDate.split("/");

          return new Date(array[1] + "/" + array[0] + "/" + array[2]).getTime();
        } else {

          return frDate;
        }

      } catch (e) {

        return frDate;
      }
    }
    //on focus
    $scope.focus = function() {
      $rootScope.focused = true;
      //$ionicScrollDelegate.$getByHandle().scrollTop(false);
      // cordova.plugins.Keyboard.disableScroll(true);
      var x = window.scrollX,
        y = window.scrollY;
      window.scrollTo(x, y-10);
    };
    //on blr
    $scope.blur = function() {
      $rootScope.focused = false;
    };

    $scope.saveAndBlur = function(field, value){
      $rootScope.focused = false;
        console.log(field)
        console.log(value)
        var contactObj = {}
        contactObj[field] = value
        console.log(contactObj)
        ContactsService.updateContactByField(db, field, value, parseInt($stateParams.id), function () {
          if (field != 'email'){
            ContactsService.updateContactByField(db, "status", "cant_be_selected", parseInt($stateParams.id), function () {
              SynchroServices.insertRequest(db, "CONTACTEDIT", {
                id: $stateParams.id,
                contact: contactObj
              }, function (result) {
                MenuService.setLocalStorage('ReloadContactList', 1);
                console.log('request inserted ' + JSON.stringify(contactObj));
              });
            })
          }else {


          SynchroServices.insertRequest(db, "CONTACTEDIT", {
            id: $stateParams.id,
            contact: contactObj
          }, function (result) {
            MenuService.setLocalStorage('ReloadContactList', 1);
            console.log('request inserted ' + JSON.stringify(contactObj));
          });
          }
        })
      }
    $('#dateX').on('change', function (e) {
      $rootScope.focused = false;
      if($rootScope.closedCalender == true){
        console.log($('#dateX').val())
        var DateValue= $('#dateX').val()
        var value = toTimeStamp(toUsFormat(DateValue))
        console.log(value)
        ContactsService.updateContactByField(db, 'rendez_vous', value, parseInt($stateParams.id), function () {
          SynchroServices.insertRequest(db, "CONTACTEDIT", {
            id: $stateParams.id,
            contact: {rendez_vous: value}
          }, function (result) {

            console.log('request inserted ' + JSON.stringify({rendez_vous: value}));
          });
        })
      }

    })


    /**
     * click on button valider: update contact
     */
    $scope.updateContact = function(contact) {
      $rootScope.focused = false;
      console.warn(contact);
      if (contact.email == "" && contact.first_name == "" && contact.last_name == "" && contact.phone_1 == "" && contact.phone_2 == "" && contact.photofilelocation == "img/photo_top_title.jpg") {

        ContactsService.deleteContactcreated(db, contact.id, function() {
          //   ContactsService.deleteContactServer(contact.id,function(data){
          //  SynchroServices.insertRequest(db,"CONTACTDELETE",{id:contact.id},function(){

          LoadingService.dismiss();
          //only for test
          MenuService.setLocalStorage('ReloadContactList', 1);
          $state.go('app.contactList');

          //
          //  });
        });
      } else {
        if (!validateEmail(contact.email) && contact.email != "" && contact.email != $translate.instant('loading.data')) {
          LoadingService.error($translate.instant('ContactEdit.EmailIncorrect'), "ContactEditController");
        } else {
      //    contact.email = contact.email.toLowerCase();
          $rootScope.contact = contact;

          LoadingService.loading($translate.instant('Loading4'));

          if (contact.list == $translate.instant('ContactEdit.noGroup')) {
            $scope.noGroup = true;
            $scope.noG = $translate.instant('ContactEdit.noGroup');
            contact.list = "";
            $scope.contact.list = "";
            document.querySelector('#newGroupeName').value = "";
          }
          cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
        	    if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
        	         emailToSearchFor = (contact.email != $rootScope.tmpContact.email && $rootScope.tmpContact.email != "") ? $rootScope.tmpContact.email : contact.email;
        	          phone_1ToSearchFor = (contact.phone_1 != $rootScope.tmpContact.phone_1 && $rootScope.tmpContact.phone_1 != "") ? $rootScope.tmpContact.phone_1 : contact.phone_1;
        	          if(phone_1ToSearchFor ==''){
        	        	  phone_1ToSearchFor = (contact.phone_2 != $rootScope.tmpContact.phone_2 && $rootScope.tmpContact.phone_2 != "") ? $rootScope.tmpContact.phone_2 : contact.phone_2;
        	          }
        	          if(contact.list.indexOf('Import ') == -1){


        	          ContactsService.searchContactInDevice(emailToSearchFor, phone_1ToSearchFor, function(resu) {

        	            if (resu == "") {
        	              if (contact.phone_1 == "" && contact.phone_2 == "") {
                          $rootScope.autoriseContact = false;
                          $scope.contactSaved = false
        	                updateContactFn(contact, function () {
                          });
        	              } else {
        	                ContactsService.saveContactInTel(contact, function() {
                            $rootScope.autoriseContact = true;
                            $scope.contactSaved = true
                            updateContactFn(contact, function () {
                            });
        	                });
        	              }
        	            } else {
                /// contact existe phonebook
                        $scope.contactSaved = true
        	              $rootScope.allContacts = resu;
        	              $rootScope.contactBuz = contact;

        	              synchroContactDevice();
        	              // }
        	              //                        });
        	            }
        	          }, function() {
        	           // $rootScope.autoriseContact = false;
                      $rootScope.autoriseContact = false;
                      $scope.contactSaved = false
        	            updateContactFn(contact, function () {
                        console.log("contactUpdated")
                      });
        	          });
        		}else{
        		/// groupe contact = import
                      $scope.contactSaved = false
                      $rootScope.autoriseContact = false;
        			  updateContactFn(contact, function () {
                  console.log("contactUpdated")
                });
        		}
        	    }else{
                $scope.contactSaved = false

        	    	$rootScope.autoriseContact = false;
    	            updateContactFn(contact, function () {
                    console.log("contactUpdated")
                  });
        	    }
        	}, function(error){
            $scope.contactSaved = false
        		$rootScope.autoriseContact = false;
	            updateContactFn(contact, function () {
                console.log("contactUpdated")
              });
        	    console.error(error);
        	});


        }
      }


    };
    $scope.yesAutorisationContact = function() {
      LoadingService.dismiss();
      $rootScope.autoriseContact = true;
      cordova.plugins.diagnostic.switchToSettings(function() {
        console.log("Successfully switched to Settings app");

      }, function(error) {
        console.log("The following error occurred: " + error);
      });
    };
    $scope.noAutorisationContact = function() {
      LoadingService.dismiss();
      $rootScope.autoriseContact = false;
      updateContactFn($rootScope.contact, function () {
        console.log("contactUpdated")
      });
    }



    $scope.back = function(contact) {
    	 $rootScope.useCamera = false;
         $rootScope.photographier = false;
      ContactsService.getContactbyId(db, contact.id, function(dbContact) {
        dbContact = dbContact.rows.item(0);
        console.warn(dbContact);
        var id = parseInt(dbContact.id);
        delete dbContact.id;
        delete dbContact.alerteemailcreationdate;
        delete dbContact.date;
        delete dbContact.status;
        delete dbContact.synchro;

        if (dbContact.photofilelocation == "img/photo_top_title.jpg") {
          delete dbContact.photofilelocation;
        }
        if (dbContact.list == $translate.instant("ContactEdit.noGroup")) {
          delete dbContact.list;
        }
        if (hasFields(dbContact)) {
          console.warn(id);
          $state.go('app.contactShow', {
            id: id
          });

        } else {

          SynchroServices.deleteRequest(db, localStorage.getItem("idTmpEncours"), function() {
            ContactsService.deleteContactcreated(db, id, function() {
              $state.go('app.contactList');
            })
          });
        }
      })


    }



    function synchroContactDevice() {

      LoadingService.loading($translate.instant('Loading4'));
      var allContact = $rootScope.allContacts;
      var contact = $rootScope.contactBuz;
      $rootScope.autoriseContact = true;
      if (contact.list == $translate.instant('ContactEdit.noGroup')) {
        $scope.noGroup = true;
        $scope.noG = $translate.instant('ContactEdit.noGroup');
        contact.list = "";
        $scope.contact.list = "";
        document.querySelector('#newGroupeName').value = "";
      }
      ContactsService.updateContactDevice(ContactsService.sortContactDevice(allContact), contact, {
        email: $rootScope.tmpContact.email,
        phone_1: $rootScope.tmpContact.phone_1,
        phone_2: $rootScope.tmpContact.phone_2
      }, function() {

        LoadingService.dismiss();
          updateContactFn(contact, function () {
            console.log("contactUpdated")
          });

      });
    };

    $scope.dismissContactDevice = function() {
      LoadingService.dismiss();
      LoadingService.loading($translate.instant('Loading4'));
      var allContact = $rootScope.allContacts;
      var contact = $rootScope.contactBuz;

      if (contact.list == $translate.instant('ContactEdit.noGroup')) {
        $scope.noGroup = true;
        $scope.noG = $translate.instant('ContactEdit.noGroup');
        contact.list = "";
        $scope.contact.list = "";
        document.querySelector('#newGroupeName').value = "";
      }

      if ($rootScope.fromState == "app.contactShow") {
        updateContactFn(contact, function () {
          console.log("contactUpdated")
        });
      } else if ($rootScope.fromState == "app.buzcardSend") {
        if (contact.meeting_point == $translate.instant('No-place') || contact.meeting_point == "") {
        //  ContactsService.geolocalicationAdress(db, contact, function(adress) {
            LoadingService.dismiss();
            updateContactFn(contact, function () {
              console.log("contactUpdated")
            });
       //   });
        } else {
          updateContactFn(contact, function () {
            console.log("contactUpdated")
          });
        }


      } else {
        updateContactFn(contact, function () {
          console.log("contactUpdated")
        });
      }
    }



    $scope.sendCardViaEmail = function(email) {

      if ($scope.contact.list == $translate.instant('ContactEdit.noGroup')) {
        $scope.noGroup = true;
        $scope.noG = $translate.instant('ContactEdit.noGroup');
        $scope.contact.list = "";
        document.querySelector('#newGroupeName').value = "";
      }
      if (!validateEmail(email) ||email == "") {
        console.log("--------*********---------")
        console.log("from state " + $rootScope.fromState)
        console.log("imageExist " + $scope.imageExist)
        console.log("photoChangeListener " + photoChangeListener)
        console.log("photoRequestID " + photoRequestID)
        console.log("--------*********---------")
        /**
         * si on vient du Qrcode
         */
        if ($rootScope.fromState == "app.qrcode") {
          //update contact create request
          SynchroServices.updateRequestById(db, localStorage.getItem("idTmpEncours"), {
            idTmp: $stateParams.id,
            sendvcard: 'OUI'
          }, function (res) {
            updateContactFct($scope.contact, function(){
              console.log('$$$$$$$$$$$$$$$$$$$')
              ContactsService.geolocalicationAdress(db, $scope.contact, function(adress) {
                console.log(adress)
                LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhotoNew'), "ContactEditController");
                $rootScope.useCamera = false;
                $rootScope.photographier = false;

                $state.go('app.qrcode');
              });

            })
            //
          })
        }
        /**
         * on vient du contactList @@ photoChange
         */
        else if ($rootScope.fromState == "app.contactList" && photoChangeListener === true) {
          //update contact create request
          SynchroServices.updateRequestById(db, localStorage.getItem("idTmpEncours"), {
            idTmp: $stateParams.id,
            sendvcard: 'OUI'
          }, function () {
            updateContactFct($scope.contact, function () {
              ContactsService.geolocalicationAdress(db, $scope.contact, function(adress) {
                LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhotoNew'), "ContactEditController");
                $rootScope.useCamera = false;
                $rootScope.photographier = false;

                $state.go('app.qrcode');
              });
            })
            //
          })

        } else if ($rootScope.fromState == "app.contactShow" && photoChangeListener === true) {
          var RID = parseInt(new Date().getTime() / 1000);
          if (photoRequestID == undefined) {
            //update contact create request
            SynchroServices.updateRequestById(db, localStorage.getItem("idTmpEncours"), {
              idTmp: $stateParams.id,
              sendvcard: 'OUI'
            }, function () {
              updateContactFct($scope.contact, function () {
                ContactsService.geolocalicationAdress(db, $scope.contact, function(adress) {
                  LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhotoNew'), "ContactEditController");
                  $rootScope.useCamera = false;
                  $rootScope.photographier = false;

                  $state.go('app.qrcode');
                });
              })
              //
            })
          } else {
            SynchroServices.updateRequestById(db, photoRequestID, {
              id: $stateParams.id,
              path: $scope.photoProfil,
              RID: RID,
              sendvcard: 'OUI'
            }, function () {
              updateContactFct($scope.contact, function () {
                ContactsService.geolocalicationAdress(db, $scope.contact, function(adress) {
                  LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhotoNew'), "ContactEditController");
                  $rootScope.useCamera = false;
                  $rootScope.photographier = false;

                  $state.go('app.qrcode');
                });
              })
              //
            })
          }

        } else {
          LoadingService.error($translate.instant('ContactEdit.EmailIncorrect'), "ContactEditController");
        }

      } else {
        console.log(email)
        if (validateEmail(email) == true) {
          updateContactFct($scope.contact, function () {
            console.log("contactUpdated")
            $rootScope.emailSend = email;
            LoadingService.dismiss();
            $state.go('app.buzcardSend');
          });
        } else {
          LoadingService.error($translate.instant('ContactEdit.EmailIncorrect'), "ContactEditController");
        }


      }
    }

    $scope.LuiEnvoyerMaBuz = function(contact){
      console.log('lui envoyer ma buz')
      console.log(contact)
      if(contact.email === '' && contact.phone_2 ==='' && contact.phone_1 === ''){
        console.log('remlpir email ou phoneNumber ')
        $scope.sendCardViaEmail(contact.email)
       // LoadingService.error($translate.instant("email.phone.empty"), "ContactEditController");
      }

      else if(contact.email !=='' && contact.phone_2 ==='' && contact.phone_1 === ''){
        console.log('existe email seulement')
        $scope.sendCardViaEmail(contact.email)
      }

      else if(contact.email === '' && (contact.phone_2 !== '' || contact.phone_1 !=='')){
        console.log('existe phone seulement')
        $rootScope.contact = contact
        LoadingService.popupClickLuiEnvoyerMaFiche(contact.email, contact.phone_1, contact.phone_2, 'ContactEditController')
      }
      else {
        console.log('existe email and phone')
        $rootScope.contact = contact
        LoadingService.popupClickLuiEnvoyerMaFiche(contact.email, contact.phone_1, contact.phone_2, 'ContactEditController')

      }
    }


    $scope.sendCardViaSMS = function(phone_1, phone_2) {
      console.log(phone_1, phone_2)
      LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactEditController");
      if (phone_2 != "") {
        if(phone_2.indexOf('"') != -1)
          phone_2= phone_2.substr(1, phone_2.length -1)
        if (validatePhone(phone_2) && phone_2.length > 5) {
          console.log(phone_2)
          $rootScope.fromState = "app.buzcardSend";
          LoadingService.loading($translate.instant("Loading4"));
          BuzcardService.selectProfile(db, function(rs) {
            var options = {
              replaceLineBreaks: false, // true to replace \n by a new line, false by default
              android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
              }
            };
            var phoneNumber = phone_2;
            var buzcardOnline = localStorage.getItem("act");
            var link = $translate.instant("SMS.Msg", {
              buzcardOnline: buzcardOnline,
              first_name: rs.rows.item(0).first_name
            });
            console.log(phoneNumber)
            console.log(link)
           // $cordovaSms.send(phoneNumber, link, options)
             // .then(function() {
            window.open("sms:"+phoneNumber+";?&body="+link, '_system');
                if($rootScope.contact.firstsendemail != '')

                    ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($rootScope.contact.id), function () {
                      ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt($rootScope.contact.id), function () {

                        LoadingService.dismiss();
                        if($rootScope.fromState == 'app.qrcode')
                        ContactsService.geolocalicationAdress(db, $rootScope.contact, function(adress) {
                        SynchroServices.insertRequest(db, "CONTACTEDIT", {
                          id: $stateParams.id,
                          contact: {
                            meeting_point: adress,
                            lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm')
                          }
                        }, function (result) {
                          LoadingService.confirm($translate.instant('ContactEdit.SendSMS', {
                            phone: phoneNumber
                          }), $rootScope.contact.id, "ContactEditController");
                        })
                      })
                        else
                          LoadingService.confirm($translate.instant('ContactEdit.SendSMS', {
                            phone: phoneNumber
                          }), $rootScope.contact.id, "ContactEditController");
                    })
                  })
                else

                    ContactsService.updateContactByField(db, "firstsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($rootScope.contact.id), function () {
                      ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($rootScope.contact.id), function () {
                        ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt($rootScope.contact.id), function () {

                          LoadingService.dismiss();
                          if($rootScope.fromState == 'app.qrcode')
                          ContactsService.geolocalicationAdress(db, $rootScope.contact, function(adress) {
                          SynchroServices.insertRequest(db, "CONTACTEDIT", {
                            id: $stateParams.id,
                            contact: { meeting_point: adress, lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm')}
                          }, function (result) {
                            LoadingService.confirm($translate.instant('ContactEdit.SendSMS', {
                              phone: phoneNumber
                            }), $rootScope.contact.id, "ContactEditController");
                          })
                        })
                          else
                            LoadingService.confirm($translate.instant('ContactEdit.SendSMS', {
                              phone: phoneNumber
                            }), $rootScope.contact.id, "ContactEditController");

                      })
                    })
                  })
                /***********************\
                 SMS envoyé
                 \***********************/

              }, function(error) {
                LoadingService.dismiss();
                //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
                LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
              });


         // });
        }
      }else if (phone_1 != "") {
        if(phone_1.indexOf('"') != -1)
          phone_1= phone_1.substr(1, phone_1.length -1)
        if (validatePhone(phone_1) && phone_1.length > 5) {
          $rootScope.fromState = "app.buzcardSend";
          LoadingService.loading($translate.instant("Loading4"));
          BuzcardService.selectProfile(db, function(rs) {
            var options = {
              replaceLineBreaks: false, // true to replace \n by a new line, false by default
              android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
              }
            };
            var phoneNumber = phone_1;
            var buzcardOnline = localStorage.getItem("act");
            var link = $translate.instant("SMS.Msg", {
              buzcardOnline: buzcardOnline,
              first_name: rs.rows.item(0).first_name
            });
           // $cordovaSms.send(phoneNumber, link, options)
            //  .then(function() {
            window.open("sms:"+phoneNumber+";?&body="+link, '_system');
                LoadingService.dismiss();
                ContactsService.geolocalicationAdress(db, $rootScope.contact, function(adress) {
                  ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($rootScope.contact.id), function () {
                    ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt($rootScope.contact.id), function () {

                      SynchroServices.insertRequest(db, "CONTACTEDIT", {
                        id: $stateParams.id,
                        contact: { meeting_point: adress, lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm')}
                      }, function (result) {
                        LoadingService.confirm($translate.instant('ContactEdit.SendSMS', {
                          phone: phoneNumber
                        }), $rootScope.contact.id, "ContactEditController");
                      })
                    })
                  })
                })
                /***********************\
                       SMS envoyé
                \***********************/

              }, function(error) {
                LoadingService.dismiss();
                //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
                LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
              });


       //   });
        }
      } else {
        LoadingService.error("Veuillez introduire Numéro de mobile ", "ContactEditController");
      }

    }
    $scope.dismiss = function() {
      LoadingService.dismiss();
    }
    /**
     *
     * button lui envoi ma buzcard
     */

   /* $scope.sendEMAIL = function() {
      if (!$rootScope.contact) {
        LoadingService.error($translate.instant("SMS.emailNonValid"), "ContactEditController");
      } else if (!validateEmail($rootScope.contact.email)) {
        LoadingService.error($translate.instant("SMS.emailNonValid"), "ContactEditController");
      } else {

        LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactEditController");
        var rdv = "";

        var langue = navigator.language.substring(0, 2);
        var Rendez_vous = $('#dateX').val();

        if (Rendez_vous != "") {
          var dateTmp = new Date(Rendez_vous.substr(6, 4), Number(Rendez_vous.substr(3, 2)) - 1, Rendez_vous.substr(0, 2));
          rdv = $filter('date')(new Date(dateTmp), 'MM/dd/yyyy')
        } else {
          rdv = $filter('date')(new Date(), 'MM/dd/yyyy')
        }
        window.localStorage.setItem('contactUpdate', JSON.stringify($rootScope.contact));

        var object = {
          email: $rootScope.contact.email.toLowerCase(),
          selectLang: langue,
          checkFollower: "on",
          dateRDV: rdv,
          idTmp: $rootScope.contact.id
        };
        SynchroServices.insertRequest(db, "BUZCARDSEND", object, function() {


          LoadingService.loading($translate.instant('BuzcardSend.LoadingSend'));

          ConnectionService.isConnectedSYc(db, function() {


            LoadingService.dismiss();
            LoadingService.confirm2($translate.instant('ContactEdit.MsgSend', {
              email: $rootScope.contact.email
            }), $rootScope.contact.id, "ContactEditController");
            MenuService.setLocalStorage('ReloadContactList', 1);



          }, function() {
            LoadingService.dismiss();
            LoadingService.confirm2($translate.instant('ContactShow.MsgSendOFF', {
              email: $rootScope.contact.email
            }), $rootScope.contact.id, "ContactEditController");
            MenuService.setLocalStorage('ReloadContactList', 1);

          });

        });

      }
    };*/


    $scope.ok2 = function(id) {
      contact = JSON.parse(window.localStorage.getItem('contactUpdate'));
      $scope.contact = contact;
      if (contact.list == $translate.instant('ContactEdit.noGroup')) {
        $scope.noGroup = true;
        $scope.noG = $translate.instant('ContactEdit.noGroup');
        contact.list = "";
        $scope.contact.list = "";
        document.querySelector('#newGroupeName').value = "";
      }
      LoadingService.dismiss();
      updateContactFn(contact, function () {
        console.log('contact updated')
      });

    };


    function validateEmail(email) {
     // var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      return re.test(email);
    }

    function validatePhone(phone) {
      var re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/;
      return re.test(phone);
    }
    function hasFields(obj) {
      var has = false;
      if (obj) {
        for (var variable in obj) {
          if (obj[variable].length > 0) {
            has = true
            break;
          }

        }

      }
      return has;
    }


      function isNotEditionPage() {
          return $state.current.name != 'app.contactEdit' && $state.current.name != 'app.buzcardEdit' && $state.current.name != 'app.buzcardSend' && $state.current.name != 'app.urgencyEdit' && $state.current.name != 'app.buzward'
      }
    /**
     * convert date to timeStamp
     */
    function toTimeStamp(date) {
      try {
        var x="";
        if(date!=""){
          x= new Date(date).getTime()/1000;
        }

        // console.log('try'+x +'   '+date);
        return x;
      } catch (e) {
        // console.log(e);
        var x= new Date().getTime()/1000;
        // console.log('catch '+x);
        return x;
      }
    };

  }

]);
