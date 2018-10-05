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
      getContact();
      $rootScope.isBackgroudRuning = false;
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
           console.log('---contactEdit-----'+JSON.stringify(result.rows.item(0)));
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
          console.log("ligne 95 "+$scope.contact.rendez_vous);
          if (result.rows.item(0).list == "")
            $scope.contact.list = $scope.groups[0];
          else {
            document.querySelector('#newGroupeName').disabled = false;
            document.querySelector('#newGroupeName').value = "";
          }

          if ($rootScope.fromState == "app.buzcardSend" || $rootScope.fromState == "app.contactList") {
            $scope.showSend = true;
            $rootScope.focusName = false;
          } else
            $scope.showSend = false;

          $scope.contact.comment = removeSlashes(result.rows.item(0).comment);

          document.querySelector('#newGroupeName').value = removeSlashes(result.rows.item(0).list);
          $rootScope.oldGroupName = removeSlashes(result.rows.item(0).list);
          $scope.contact.lastsendemail = result.rows.item(0).lastsendemail;
          if ($rootScope.fromState == "app.contactShow") {
            if (removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('ContactEdit.SearchGPS') || removeSlashes(result.rows.item(0).meeting_point) == "undefined" || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place') || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place-GPS')) {

              $scope.contact.meeting_point = '';
              tmpContact.meeting_point = '';
            } else {

                $scope.contact.meeting_point = removeSlashes(result.rows.item(0).meeting_point);
            }
          } else if ($rootScope.fromState == "app.buzcardSend" ) {
        	  console.log("$rootScope.fromState "+$rootScope.fromState);
            if (removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('ContactEdit.SearchGPS') || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place') || removeSlashes(result.rows.item(0).meeting_point) == "undefined" || removeSlashes(result.rows.item(0).meeting_point) == "" || removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('No-place-GPS')) {

                $scope.contact.meeting_point = $translate.instant('No-place');
                tmpContact.meeting_point = '';
                console.log("testConexion");
                ConnectionService.testConexion(db, function(){
                	 console.log("connected");
                	  ContactsService.geolocalicationAdress(db, $scope.contact, function(adress) {
                          //alert($rootScope.gpsNok);
                		  console.log('---------------------------'+ adress);
                            $scope.contact.meeting_point = removeSlashes(adress);



                          if ($scope.contact.meeting_point != $translate.instant('No-place') && $scope.contact.meeting_point != $translate.instant('No-place-GPS')) {
                            /////////////////////////////
                        	  ContactsService.updateContactByField(db, "meeting_point", removeSlashes(adress), $scope.contact.id, function() {

                              ContactsService.updateContactServer(0, $scope.contact.id, {meeting_point: removeSlashes(adress) }, function(data) { // update contact server

                              });
                              });

                            ///////////////////////////
                          }

                        });
                },function(){
                	 console.log("no connected");
                	$scope.contact.meeting_point="";
                });


              /////////
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
            console.error(result.rows.item(0).rendez_vous)
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

    function updateContactFn(contact) {
      if (contact.email == "") {
        ContactsService.updateContactByField(db, "status", "cant_be_selected", contact.id, function() {
            updateContactFct(contact);
        });
      } else {
        ContactsService.updateContactByField(db, "status", "selected", contact.id, function() {
            updateContactFct(contact);
        });
      }
    }

    function updateContactFct(contact) {
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
        var contactId = contact.id;
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
        if ($rootScope.opened) {
          LoadingService.loading($translate.instant('LoadingSynchroCalender'));

          ContactsService.createAgendaRDV(db, contactObj, $rootScope.oldRDV, function(result) {


          });

        }


        // LoadingService.loading($translate.instant('Buzcard.Msg'));
        ConnectionService.isConnectedWithoutSync(db, function() {


        }, function() {

          //cas non connecté

//          if (contact.id.toString().length == 10) {
//
//            if (!areTheSame($rootScope.tmpContact, contact))
//              MenuService.setLocalStorage('ReloadContactList', 1);
//            // LoadingService.dismiss();
//
//            ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
//
//
//            // LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
//
//          } else {
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
                	console.warn('-5---'+JSON.stringify(contactObjx));
                  SynchroServices.insertRequest(db, "CONTACTEDIT", {
                    id: $stateParams.id,
                    contact: contactObjx
                  }, function(result) {

                    LoadingService.dismiss();

                    if (!areTheSame($rootScope.tmpContact, $scope.contact))
                      MenuService.setLocalStorage('ReloadContactList', 1);
                    LoadingService.dismiss();

                    if ($rootScope.fromState == "app.buzcardSend") {
                      var phone = contact.phone_1 || contact.phone_2;
                      if ($rootScope.fromsmssend) {
                        // LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phone}), contactId, "ContactEditController");
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                        //LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                      } else {
                        if ($rootScope.autoriseContact == false) {
                          ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                          // LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                        } else {

                          ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                          //                                           LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                          //	   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                        }
                      }
                    } else if ($rootScope.fromState == "app.contactShow") {
                      if ($rootScope.autoriseContact == false) {
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                        //  LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                      } else {
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdate'), contactId);
                        //                                         LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                      }
                      //  $state.go('app.contactShow', {id: contactId },{reload : true});
                    } else if ($rootScope.fromState == "app.qrcode") {
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.sendvcardWithPhoto'), contactId);
                      // $state.go('app.contactShow', {id: contactId },{reload : true});
                    } else if ($rootScope.fromState == "app.contactList") {
                      if ($rootScope.autoriseContact == false) {
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                        //                                      		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                      } else {
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                        //                                      	  LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                      }
                    }else{
                  	  if ($rootScope.autoriseContact == false) {
                          ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                          //                          		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                        } else {
                          ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                          //                            	  LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                        }
                  }
                  });
                } else {
                  // LoadingService.dismiss();
                  //
                  if (!areTheSame($rootScope.tmpContact, $scope.contact))
                    MenuService.setLocalStorage('ReloadContactList', 1);
                  // LoadingService.dismiss();

                  if ($rootScope.fromState == "app.buzcardSend") {
                    var phone = contact.phone_1 || contact.phone_2;
                    if ($rootScope.fromsmssend) {
                      // LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phone}), contactId, "ContactEditController");
                      //                                    		 LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                    } else {
                      if ($rootScope.autoriseContact == false) {
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                        //                                      		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                      } else {
                        ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                        //                                       LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                        //LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                      }
                    }
                  } else if ($rootScope.fromState == "app.contactShow") {
                    if ($rootScope.autoriseContact == false) {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                      //                                 		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                    } else {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdate'), contactId);
                      //                                     LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                    }
                    //  $state.go('app.contactShow', {id: contactId },{reload : true});
                  } else if ($rootScope.fromState == "app.qrcode") {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.sendvcardWithPhoto'), contactId);
                    //$state.go('app.contactShow', {id: contactId },{reload : true});
                  } else if ($rootScope.fromState == "app.contactList") {
                    if ($rootScope.autoriseContact == false) {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                      //                                  		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                    } else {
                      //                                  	  LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                    }
                  }else{
                	  if ($rootScope.autoriseContact == false) {
                          ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                          //                          		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                        } else {
                          ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                          //                            	  LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                        }
                  }
                }
              });

            } else if (!isEmpty(contactObjx)) {
            	console.warn('-6---'+JSON.stringify(contactObjx));

              SynchroServices.insertRequest(db, "CONTACTEDIT", {
                id: $stateParams.id,
                contact: contactObjx
              }, function(result) {
                // LoadingService.dismiss();
                //
            	  console.log('request inserted '+JSON.stringify(contactObjx));
            	  console.log('from state '+$rootScope.fromState);
                if (!areTheSame($rootScope.tmpContact, $scope.contact))
                  MenuService.setLocalStorage('ReloadContactList', 1);
                // LoadingService.dismiss();

                if ($rootScope.fromState == "app.buzcardSend") {
                  var phone = contact.phone_1 || contact.phone_2;
                  if ($rootScope.fromsmssend) {
                    //LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phone}), contactId, "ContactEditController");
                    //                                		 LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                  } else {
                    if ($rootScope.autoriseContact == false) {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                      //                                  		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                    } else {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                      //                                   LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                      //   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                    }
                  }
                } else if ($rootScope.fromState == "app.contactShow") {
                  if ($rootScope.autoriseContact == false) {
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                    //                             		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                  } else {
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdate'), contactId);
                    //                                 LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                  }

                } else if ($rootScope.fromState == "app.qrcode") {
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.sendvcardWithPhoto'), contactId);
                } else if ($rootScope.fromState == "app.contactList") {
                  if ($rootScope.autoriseContact == false) {
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                    //                              		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                  } else {
                    //LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                  }
                }else{
            	  if ($rootScope.autoriseContact == false) {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                      //                          		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                    } else {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                      //                            	  LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                    }
              }

              });
            } else {
              // LoadingService.dismiss();
              if (!areTheSame($rootScope.tmpContact, $scope.contact))
                MenuService.setLocalStorage('ReloadContactList', 1);
              //LoadingService.dismiss();
              if ($rootScope.fromState == "app.buzcardSend") {
                var phone = contact.phone_1 || contact.phone_2;
                if ($rootScope.fromsmssend) {
                  // LoadingService.confirm($translate.instant('ContactEdit.SendSMS',{phone: phone}), contactId, "ContactEditController");
                  //                            		 LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                } else {
                  if ($rootScope.autoriseContact == false) {
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                    //                              		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                  } else {
                    ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdate'), contactId);
                    //                               LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                    //   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                  }
                }
              } else if ($rootScope.fromState == "app.contactShow") {
                if ($rootScope.autoriseContact == false) {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                  //                            		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                } else {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdate'), contactId);
                  //                                LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdate'), contactId, "ContactEditController");
                }

              } else if ($rootScope.fromState == "app.qrcode") {

                  ShowPopUpSychroAuto($translate.instant('ContactEdit.sendvcardWithPhoto'), contactId);

              } else if ($rootScope.fromState == "app.contactList") {
                if ($rootScope.autoriseContact == false) {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                  //                          		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                } else {
                  ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                  //                            	  LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                }
              }else{
            	  if ($rootScope.autoriseContact == false) {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId);
                      //                          		   LoadingService.confirm($translate.instant('ContactEdit.MsgConfimUpdateNOAUTO'), contactId, "ContactEditController");
                    } else {
                      ShowPopUpSychroAuto($translate.instant('ContactEdit.Msg6'), contactId);
                      //                            	  LoadingService.confirm($translate.instant('ContactEdit.Msg6'), contactId, "ContactEditController");
                    }
              }

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
        console.log("Successfully switched to Settings app");
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

      //test de connection
      // LoadingService.loading($translate.instant('Buzcard.Msg'));
      ConnectionService.isConnectedWithoutSync(db, function() {
        // cas connecté
        // TODO FIXME il faut traiter le cas ou la session est expiré
        LoadingService.loading($translate.instant('ContactEdit.Msg8'));

        ContactsService.deleteContactServer(params, function(data) {

          if (data.update.status == "done") {
            LoadingService.dismiss();
            //only for test
            MenuService.setLocalStorage('ReloadContactList', 1);
            LoadingService.confirmDelete($translate.instant('ContactEdit.deleteContact'), "ContactEditController");
            // $state.go('app.contactList');
          } else {
            LoadingService.error($translate.instant('Msg3'), "ContactEditController");
          }

        }, function(status) {
          // console.error(status);
          LoadingService.error($translate.instant('Msg3'), "ContactEditController");
        });

      }, function() {
        //cas non connecté
        SynchroServices.insertRequest(db, "CONTACTDELETE", {
          id: $stateParams.id
        }, function() {

          LoadingService.dismiss();
          MenuService.setLocalStorage('ReloadContactList', 1);
          LoadingService.confirmDelete($translate.instant('ContactEdit.deleteContact'), "ContactEditController");
        });

      });
    };

    $scope.okDelete = function() {
      LoadingService.dismiss();
//      console.log("Synchro en background");
//      SynchroServices.selectAllRequest(db, function(rs) {
//        console.log("Nb request dans la File: " + rs.rows.length);
//        if (rs.rows.length > 0 && !$rootScope.isBackgroudRuning) {
//          //alert($rootScope.sychroEncours);
//          ConnectionService.isConnected(db, function() {
//            console.log("synchro auto terminé");
//            //LoadingService.dismiss();
//          }, function() {
//            console.log("pas de conexion");
//            LoadingService.dismiss();
//          });
//        }
//      });
      $state.go('app.qrcode');
    }
    /**
     * capture photo
     */
    $scope.getPhoto = function() {
      if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {

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

            cameraService.getPicture(options).then(function(imageURI) {
              //LoadingService.loading($translate.instant('prisePhoto.online'));
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

                ContactsService.updateContactPhoto(db, $stateParams.id, url, function() {
                  $rootScope.useCamera = true;
                  ConnectionService.testConexion(db, function() {
                    //cas connecter

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      //  LoadingService.info($translate.instant('prisePhoto.online'), "ContactEditController");
                      // console.log('erreur upload photo buzcard');
                    });


                    // cas pas de connexion
                  }, function() {

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                      photoChangeListener = true
                      photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      //  LoadingService.info($translate.instant('prisePhoto.offline'), "ContactEditController");
                      // console.log('Request inserted CONTACTPHOTO');
                    });

                  });

                });
              });
            }, function(err) {
              // console.error(err);
            });
    	          }

    	          }, function(error){
                      console.error("The following error occurred: "+error);
                      $rootScope.isBackgroudRuning = false;
                  }, [cordova.plugins.diagnostic.permission.CAMERA,cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);
                    
      } else {



        cordova.plugins.diagnostic.requestCameraAuthorization(function(status) {
          //alert('camera permission '+status);
          /// alert("App is " + (authorized ? "authorized" : "denied") + " access to camera");
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

            cameraService.getPicture(options).then(function(imageURI) {
              //LoadingService.loading($translate.instant('prisePhoto.online'));
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

                  ConnectionService.testConexion(db, function() {
                    //cas connecter

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      //LoadingService.info($translate.instant('prisePhoto.online'), "ContactEditController");
                      // console.log('erreur upload photo buzcard');
                    });


                    // cas pas de connexion
                  }, function() {

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      //LoadingService.info($translate.instant('prisePhoto.offline'), "ContactEditController");
                      // console.log('Request inserted CONTACTPHOTO');
                    });

                  });
                  //}
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
            var options = {
              quality: 60,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 600,
              targetHeight: 600,
              correctOrientation: true,
              popoverOptions: CameraPopoverOptions
            };

            cameraService.getPicture(options).then(function(imageURI) {
              //   	LoadingService.loading($translate.instant('prisePhoto.online'));
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

                  ConnectionService.testConexion(db, function() {
                    //cas connecter
                    //        			                     		alert($rootScope.fromState);
                    //        			                     		alert($stateParams.id);
                    //
                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      //  LoadingService.info($translate.instant('prisePhoto.online'), "ContactEditController");
                      // console.log('erreur upload photo buzcard');
                    });


                    // cas pas de connexion
                  }, function() {

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      // LoadingService.info($translate.instant('prisePhoto.offline'), "ContactEditController");
                      // console.log('Request inserted CONTACTPHOTO');
                    });

                  });



                });
              });
            }, function(err) {
              //alert(JSON.stringify(err));
            });
          }
          

          }, function(error){
              console.error("The following error occurred: "+error);
              $rootScope.isBackgroudRuning = false;
          }, [cordova.plugins.diagnostic.permission.CAMERA,cordova.plugins.diagnostic.permission.READ_EXTERNAL_STORAGE]);
            

      } else {

        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(status) {

          if (status === cordova.plugins.diagnostic.permissionStatus.GRANTED) {

            var options = {
              quality: 60,
              destinationType: Camera.DestinationType.FILE_URI,
              sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
              encodingType: Camera.EncodingType.JPEG,
              targetWidth: 600,
              targetHeight: 600,
              correctOrientation: true,
              popoverOptions: CameraPopoverOptions
            };

            cameraService.getPicture(options).then(function(imageURI) {
              //	LoadingService.loading($translate.instant('prisePhoto.online'));
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

                  ConnectionService.testConexion(db, function() {
                    //cas connecter
                    //                     		alert($rootScope.fromState);
                    //                     		alert($stateParams.id);
                    //

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      // LoadingService.info($translate.instant('prisePhoto.online'), "ContactEditController");
                      // console.log('erreur upload photo buzcard');
                    });


                    // cas pas de connexion
                  }, function() {

                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                      id: $stateParams.id,
                      path: url,
                      RID: RID,
                    }, function(resultSet) {
                        photoChangeListener = true
                        photoRequestID = resultSet.insertId
                      LoadingService.dismiss();
                      //  LoadingService.info($translate.instant('prisePhoto.offline'), "ContactEditController");
                      // console.log('Request inserted CONTACTPHOTO');
                    });

                  });



                });
              });
            }, function(err) {
              // alert(JSON.stringify(err));
            });
          } else {
            //alert($rootScope.requestAutorisecamera);

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
        console.log("Successfully switched to Settings app");

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
      // console.warn(document.querySelector('#newGroupeName').value);
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
      window.scrollTo(x, y);
    };
    //on blr
    $scope.blur = function() {
      $rootScope.focused = false;
    };

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

          //                checkExistEmail(contact.email, contact.id, function(exist){
          //                  console.log(exist);
          //                  if(exist){
          //                    LoadingService.errorEmail($translate.instant('ContactEdit.ExistEmail'), "ContactEditController");
          //                  }else{

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
        	        console.log("Contacts use is authorized");
        	         emailToSearchFor = (contact.email != $rootScope.tmpContact.email && $rootScope.tmpContact.email != "") ? $rootScope.tmpContact.email : contact.email;
        	          phone_1ToSearchFor = (contact.phone_1 != $rootScope.tmpContact.phone_1 && $rootScope.tmpContact.phone_1 != "") ? $rootScope.tmpContact.phone_1 : contact.phone_1;
        	          if(phone_1ToSearchFor ==''){
        	        	  phone_1ToSearchFor = (contact.phone_2 != $rootScope.tmpContact.phone_2 && $rootScope.tmpContact.phone_2 != "") ? $rootScope.tmpContact.phone_2 : contact.phone_2;
        	          }
        	if(contact.list.indexOf('Import ') == -1){


        	          ContactsService.searchContactInDevice(emailToSearchFor, phone_1ToSearchFor, function(resu) {
        	            $rootScope.autoriseContact = true;
        	            //alert(resu);
        	            if (resu == "") {
        	              if (emailToSearchFor == "" && phone_1ToSearchFor == "") {
        	                updateContactFn(contact);
        	              } else {


        	                ContactsService.saveContactInTel(contact, function() {


        	                  if ($rootScope.fromState == "app.contactShow") {
        	                    updateContactFn(contact);
        	                  } else if ($rootScope.fromState == "app.buzcardSend" || $rootScope.fromState == "app.qrcode") {
        	                    if (contact.meeting_point == $translate.instant('No-place') || contact.meeting_point == "") {
        	                   //   ContactsService.geolocalicationAdress(db, contact, function(adress) {
        	                        LoadingService.dismiss();
        	                        updateContactFn(contact);
        	                    //  });
        	                    } else {
        	                      updateContactFn(contact);
        	                    }


        	                  } else {
        	                    updateContactFn(contact);
        	                  }
        	                });
        	              }
        	            } else {

        	              $rootScope.allContacts = resu;
        	              $rootScope.contactBuz = contact;

        	              synchroContactDevice();
        	              // }
        	              //                        });
        	            }
        	          }, function() {
        	           // $rootScope.autoriseContact = false;
        	            updateContactFn(contact);
        	          });
        		}else{
        		/// groupe contact = import
        			  updateContactFn(contact);
        		}
        	    }else{
        	    	$rootScope.autoriseContact = false;
    	            updateContactFn(contact);
        	    }
        	}, function(error){
        		$rootScope.autoriseContact = false;
	            updateContactFn(contact);
        	    console.error(error);
        	});

 
        }
      }


    };
    $scope.yesAutorisationContact = function() {
      LoadingService.dismiss();
      cordova.plugins.diagnostic.switchToSettings(function() {
        console.log("Successfully switched to Settings app");

      }, function(error) {
        console.log("The following error occurred: " + error);
      });
    };
    $scope.noAutorisationContact = function() {
      LoadingService.dismiss();
      $rootScope.autoriseContact = false;
      updateContactFn($rootScope.contact);
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

    $scope.dismissEmailExiste = function() {
      LoadingService.loading($translate.instant('Loading4'));

      if ($rootScope.contact.list == $translate.instant('ContactEdit.noGroup')) {
        $scope.noGroup = true;
        $scope.noG = $translate.instant('ContactEdit.noGroup');
        $rootScope.contact.list = "";
        $scope.contact.list = "";
        document.querySelector('#newGroupeName').value = "";
      }
      emailToSearchFor = $rootScope.contact.email;
      phone_1ToSearchFor =$rootScope.contact.phone_1;
    	  if(phone_1ToSearchFor ==''){
    	  phone_1ToSearchFor = $rootScope.contact.phone_2;
    		  }

      ContactsService.searchContactInDevice(emailToSearchFor, phone_1ToSearchFor, function(resu) {
        if (resu == "") {
          if ($rootScope.contact.email == "" && $rootScope.contact.phone_1 == "") {
            updateContactFn($rootScope.contact);
          } else {
            ContactsService.saveContactInTel($rootScope.contact, function() {


              if ($rootScope.fromState == "app.contactShow") {
                updateContactFn($rootScope.contact);
              } else if ($rootScope.fromState == "app.buzcardSend" || $rootScope.fromState == "app.qrcode") {
                if ($rootScope.contact.meeting_point == $translate.instant('No-place') || $rootScope.contact.meeting_point == "") {
                 // ContactsService.geolocalicationAdress(db, $rootScope.contact, function(adress) {
                    LoadingService.dismiss();
                    updateContactFn($rootScope.contact);
                //  });
                } else {
                  updateContactFn($rootScope.contact);
                }


              } else {
                updateContactFn($rootScope.contact);
              }
            });
          }
        } else {


          $rootScope.allContacts = resu;
          $rootScope.contactBuz = $rootScope.contact;

          synchroContactDevice();
        }
      }, function() {
        $rootScope.autoriseContact = false;
        updateContactFn($rootScope.contact);
      });
    };

    function synchroContactDevice() {

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
      ContactsService.updateContactDevice(ContactsService.sortContactDevice(allContact), contact, {
        email: $rootScope.tmpContact.email,
        phone_1: $rootScope.tmpContact.phone_1,
        phone_2: $rootScope.tmpContact.phone_2
      }, function() {

        LoadingService.dismiss();
        if ($rootScope.fromState == "app.contactShow") {
          updateContactFn(contact);
        } else if ($rootScope.fromState == "app.buzcardSend" ) {
          if (contact.meeting_point == $translate.instant('No-place') || contact.meeting_point == "") {
          //  ContactsService.geolocalicationAdress(db, contact, function(adress) {
              LoadingService.dismiss();
              updateContactFn(contact);
          //  });
          } else {
            updateContactFn(contact);
          }


        } else {
          updateContactFn(contact);
        }
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
        updateContactFn(contact);
      } else if ($rootScope.fromState == "app.buzcardSend") {
        if (contact.meeting_point == $translate.instant('No-place') || contact.meeting_point == "") {
        //  ContactsService.geolocalicationAdress(db, contact, function(adress) {
            LoadingService.dismiss();
            updateContactFn(contact);
       //   });
        } else {
          updateContactFn(contact);
        }


      } else {
        updateContactFn(contact);
      }
    }


    $scope.sendBuz = function(contact) {
      $rootScope.contact = contact;
      LoadingService.loading($translate.instant('Loading4'));
      if (contact.list == $translate.instant('ContactEdit.noGroup')) {
          $scope.noGroup = true;
          $scope.noG = $translate.instant('ContactEdit.noGroup');
          contact.list = "";
          $scope.contact.list = "";
          document.querySelector('#newGroupeName').value = "";
        }
      if ($('#dateX').val() == '')
          contact.rendez_vous = '';
        else
          contact.rendez_vous = $('#dateX').val();
        $scope.contact = contact;

        if (!validateEmail(contact.email) || contact.email == "") {
          console.log("--------*********---------")
            console.log("from state " + $rootScope.fromState)
            console.log("imageExist "+ $scope.imageExist)
            console.log("photoChangeListener "+ photoChangeListener)
            console.log("photoRequestID "+ photoRequestID)
          console.log("--------*********---------")
            /**
             * si on vient du Qrcode
             */
          if ( $rootScope.fromState == "app.qrcode" ){
            //update contact create request
              SynchroServices.updateRequestById(db,localStorage.getItem("idTmpEncours"), {
                  idTmp : $stateParams.id,
                  sendvcard : 'OUI'
              }, function () {
                updateContactFn($scope.contact)
                  //LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhoto'), "ContactEditController");
              })
          }
          /**
           * on vient du contactList @@ photoChange
           */
          else if ($rootScope.fromState == "app.contactList" && photoChangeListener === true){
              //update contact create request
              SynchroServices.updateRequestById(db,localStorage.getItem("idTmpEncours"), {
                  idTmp : $stateParams.id,
                  sendvcard : 'OUI'
              }, function () {
            	  updateContactFn($scope.contact)
                  //LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhoto'), "ContactEditController");
              })

          }else if ($rootScope.fromState == "app.contactShow" && photoChangeListener === true){
              var RID =parseInt(new Date().getTime()/1000);
              if (photoRequestID == undefined ){
                  //update contact create request
                  SynchroServices.updateRequestById(db,localStorage.getItem("idTmpEncours"), {
                      idTmp : $stateParams.id,
                      sendvcard : 'OUI'
                  }, function () {
                	  updateContactFn($scope.contact)
                     // LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhoto'), "ContactEditController");
                  })
              }else{
                  SynchroServices.updateRequestById(db,photoRequestID, {
                      id: $stateParams.id,
                      path: $scope.photoProfil,
                      RID: RID,
                      sendvcard : 'OUI'
                  }, function () {
                	  updateContactFn($scope.contact)
                     // LoadingService.success($translate.instant('ContactEdit.sendvcardWithPhoto'), "ContactEditController");
                  })
              }

          }else{
              LoadingService.error($translate.instant('ContactEdit.EmailIncorrect'), "ContactEditController");
          }

        } else {
        	/** begin initialisation */
            var contactObj = {};
            for (var key in contact)
              contactObj[key] = removeSlashes(contact[key]);
            var contactId = contact.id;
            var oldName = contactObj.list;
            var newName = document.querySelector('#newGroupeName').value;
            contactObj.list = newName;

            /******* end *******/


            try {

              contactObj.rendez_vous = toUsFormat(contact.rendez_vous);

              if ($scope.contact.list == $translate.instant('ContactEdit.NewGrp') && !checkIfExist(newName, $rootScope.groups)) {
            	  console.warn("cas de new group");
                ContactsService.updateContactInfo(db, contactObj, function() { //update contact local
                	var status =""
                	 if (contact.email == "") {

                	        status="cant_be_selected";
                	      } else {

                	         status = "selected";

                	      }
                ContactsService.updateContactByField(db, "status", status, contact.id, function() {
                  ContactsService.insertIntoGroupTable(db, newName, function() { //create new groupe local
                    if ($rootScope.oldGroupName != '') {
                      ContactsService.selectContactByGroupName(db, $rootScope.oldGroupName, function(result) {
                        //cas où l'ancien groupe sera vide
                        if (result.rows.length == 0) {
                          ContactsService.deleteGroupByName(db, $rootScope.oldGroupName, function(result) {
                        	  $rootScope.emailSend = contactObj.email;
                        	   LoadingService.dismiss();
                        	  $state.go('app.buzcardSend');

                          });
                        }
                      });
                    }

                  });
                });
                });
                //cas rename groupe
              } else if (oldName != $translate.instant('ContactEdit.NewGrp') && oldName != newName && newName != "") {
                MenuService.setLocalStorage('ReloadContactList', 1);
                console.warn("cas rename grupe");
                ContactsService.updateContactInfo(db, contactObj, function() { //update contact local
                	var status =""
                   	 if (contact.email == "") {

                   	        status="cant_be_selected";
                   	      } else {

                   	         status = "selected";

                   	      }
                   ContactsService.updateContactByField(db, "status", status, contact.id, function() {
                  ContactsService.editGroup(db, oldName, newName, function(result) { //edit groupe local
                    ContactsService.renameContactGroup(db, oldName, newName, function(result) {

                    	   SynchroServices.insertRequest(db, "RENAMEGROUP", {
                               newName: addSlashes(newName),
                               oldName: addSlashes(oldName)
                             }, function(result) {
                               if (!isEmpty(contactObj)) {
                               	console.warn('-5---'+JSON.stringify(contactObj));
                                 SynchroServices.insertRequest(db, "CONTACTEDIT", {
                                   id: $stateParams.id,
                                   contact: contactObj
                                 }, function(result) {
                                	  $rootScope.emailSend = contactObj.email;
                                	   LoadingService.dismiss();
                                	 $state.go('app.buzcardSend');
                                 });
                               }
                               });


                    });
                  });
                });
                });


                // cas de modification de groupe
              } else if (oldName != $translate.instant('ContactEdit.NewGrp') && ((newName == "" && oldName == null) || (newName == oldName))) {
                ContactsService.updateContactInfo(db, contactObj, function() { //update contact local
                	var status =""
                   	 if (contact.email == "") {

                   	        status="cant_be_selected";
                   	      } else {

                   	         status = "selected";

                   	      }
                   ContactsService.updateContactByField(db, "status", status, contact.id, function() {
                  if ($rootScope.oldGroupName != "") {
                    ContactsService.selectContactByGroupName(db, $rootScope.oldGroupName, function(result) {
                      //cas où l'ancien groupe sera vide
                      if (result.rows.length == 0) {
                        ContactsService.deleteGroupByName(db, $rootScope.oldGroupName, function(result) {
                        	  $rootScope.emailSend = contactObj.email;
                        	   LoadingService.dismiss();
                        	 $state.go('app.buzcardSend');
                        });
                      }else{
                    	  $rootScope.emailSend = contactObj.email;
                   	   LoadingService.dismiss();
                   	 $state.go('app.buzcardSend');
                      }
                    });
                  }else{
                	  SynchroServices.insertRequest(db, "CONTACTEDIT", {
                        id: $stateParams.id,
                        contact: contactObj
                      }, function(result) {
                    	  $rootScope.emailSend = contactObj.email;
                    	   LoadingService.dismiss();
                      	  $state.go('app.buzcardSend');
                      });

                  }
                });
                });

              }

            } catch (e) {
              // TODO: handle exception
            }

        }


    }
    $scope.sendSMS = function() {
      LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactEditController");
      if ($rootScope.contact.phone_1 != "") {
        if (validatePhone($rootScope.contact.phone_1) && $rootScope.contact.phone_1.length > 5) {
          $rootScope.fromState = "app.buzcardSend";
          LoadingService.loading($translate.instant("Loading4"));
          BuzcardService.selectProfile(db, function(rs) {

            var phoneNumber = $rootScope.contact.phone_1;
            var buzcardOnline = localStorage.getItem("act");
            var link = $translate.instant("SMS.Msg", {
              buzcardOnline: buzcardOnline,
              first_name: rs.rows.item(0).first_name
            });
            $cordovaSms.send(phoneNumber, link, {})
              .then(function() {
                LoadingService.dismiss();
                LoadingService.confirm($translate.instant('ContactEdit.SendSMS', {
                  phone: phoneNumber
                }), $rootScope.contact.id, "ContactEditController");
                /***********************\
                       SMS envoyé
                \***********************/

              }, function(error) {
                LoadingService.dismiss();
                //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
                LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
              });


          });
        }
      } else if ($rootScope.contact.phone_2 != "") {
        if (validatePhone($rootScope.contact.phone_2) && $rootScope.contact.phone_2.length > 5) {
          $rootScope.fromState = "app.buzcardSend";
          LoadingService.loading($translate.instant("Loading4"));
          BuzcardService.selectProfile(db, function(rs) {

            var phoneNumber = $rootScope.contact.phone_2;
            var buzcardOnline = localStorage.getItem("act");
            var link = $translate.instant("SMS.Msg", {
              buzcardOnline: buzcardOnline,
              first_name: rs.rows.item(0).first_name
            });
            $cordovaSms.send(phoneNumber, link, {})
              .then(function() {
                LoadingService.dismiss();
                LoadingService.confirm($translate.instant('ContactEdit.SendSMS', {
                  phone: phoneNumber
                }), $rootScope.contact.id, "ContactEditController");
                /***********************\
                       SMS envoyé
                \***********************/

              }, function(error) {
                LoadingService.dismiss();
                //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
                LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
              });


          });
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

    $scope.sendEMAIL = function() {
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
    };


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
      updateContactFn(contact);

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

  }

]);
