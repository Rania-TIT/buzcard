appContext.controller('BuzcardSendController', [
  '$cordovaDatePicker',
  '$scope',
  'MenuService',
  'BuzcardService',
  'LoadingService',
  '$filter',
  'ContactsService',
  '$state',
  '$ionicPlatform',
  '$cordovaSQLite',
  '$ionicHistory',
  '$rootScope',
  'cameraService',
  'ConnectionService',
  'SynchroServices',
  '$cordovaGeolocation',
  '$translate', 'autoCompleteDomaines', '$timeout', 'ionicToast', '$cordovaSms', 'LoginService', 'AutoCompleteService', '$interval',
  function ($cordovaDatePicker, $scope, MenuService, BuzcardService, LoadingService, $filter, ContactsService,
            $state, $ionicPlatform, $cordovaSQLite, $ionicHistory, $rootScope, cameraService,
            ConnectionService, SynchroServices, $cordovaGeolocation, $translate, autoCompleteDomaines, $timeout, ionicToast, $cordovaSms, LoginService, AutoCompleteService, $interval) {


    if (MenuService.getLocalStorage("customisation")) {
      var custoArray = MenuService.getLocalStorage("customisation");
      $scope.secondColor = "1px solid " + custoArray[4];
      $scope.firstColor = custoArray[3];
    }
    var db = null;
    $rootScope.needPassword = true;
    $rootScope.showWrongPassword = false;
    $scope.showinfo = false;
    $scope.options = false;
    $scope.options_text = $translate.instant('Send.options');
    $scope.headertop = {"margin-top": "80px"};
    $rootScope.displaydrowdown = {"z-index": "0"};
    $rootScope.displaydrowdown1 = {"dispaly": "none"};
    $scope.photoContact = null;
    $scope.dateRDV = $translate.instant('dateRDVPlaceholer');
    $rootScope.useCamera = false;
    $rootScope.photographier = false;
    $ionicPlatform.ready(function () {

      /**
       * create/open DB
       */
      if (window.cordova) {
        db = window.sqlitePlugin.openDatabase({name: "buzcard.db", androidDatabaseImplementation: 2}); // device
      } else {
        db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
      }

      if ($rootScope.emailSend != "" && $rootScope.emailSend != null) {
        $scope.email = $rootScope.emailSend;
        document.getElementById("id_email").value = $rootScope.emailSend;
        $rootScope.focusName = true;
      } else {
        $scope.email = "";
      }

      $scope.checkFollower = true;
      $scope.sendMobile = 1;
      autoCompleteDomaines.selectDomaine(db, function (data) {
        //alert($rootScope.focusName);
        if ($rootScope.focusName == true) {

        } else {
          document.getElementById("id_email").focus();
        }

        $scope.domaines = data;
      });

      /******************\
       Begin Trad Email
       \******************/
      $scope.tradEmailArray = [];
      BuzcardService.selectEmailTrad(db, function (resultSet) {
        if (resultSet.rows.length > 0) {
          for (var i = 0; i < resultSet.rows.length; i++) {
            $scope.tradEmailArray.push({
              languageid: removeSlashes(resultSet.rows.item(i).languagename) + '/' + removeSlashes(resultSet.rows.item(i).originalname),
              textemail: removeSlashes(resultSet.rows.item(i).textemail),
              lcid: resultSet.rows.item(i).languagecode,
              languagename: removeSlashes(resultSet.rows.item(i).languagename)
            })
            if ($translate.use() == resultSet.rows.item(i).languagecode) {
              $scope.defaultLn = resultSet.rows.item(i).languagecode;
              $scope.tradEmailContent = removeSlashes($scope.tradEmailArray[i].textemail);
            }
          }
        }
      });
      /******************\
       End Trad Email
       \******************/


    });
    if (ionic.Platform.isAndroid())
      $scope.textAreaHeight = "115";
    else
      $scope.textAreaHeight = "233";

    $scope.showOptions = function () {
      $rootScope.displaydrowdown = {"z-index": "9999"};
      $rootScope.displaydrowdown = {"z-index": "9999", "position": "relative"};


      if ($scope.options == true) {
        $scope.options = false;
        $scope.options_text = $translate.instant('Send.options');
        $scope.headertop = {"margin-top": "80px"};


      }
      else {
        $scope.options = true;
        $scope.options_text = $translate.instant('Send.Hide');
        $scope.headertop = {"margin-top": "0px"};

      }
    }
    $scope.showInfoFn = function () {
      if ($scope.showinfo) {
        $scope.showinfo = false;
      } else {
        $scope.showinfo = true;
      }
    }
    /**************************\
     Begin select change value
     \**************************/
    $scope.changedLanguage = function (selectLang) {
      for (var i = 0; i < $scope.tradEmailArray.length; i++) {
        if ($scope.tradEmailArray[i].lcid == selectLang) {
          $scope.tradEmailContent = removeSlashes($scope.tradEmailArray[i].textemail);
          break;
        }
      }

    }

    /*************************\
     End select change value
     \*************************/

    function sendB(email, selectLang, checkFollower, sendMobile, dateRDV, meeting_point, latitude_meeting, longitude_meeting) {
      dateRDV = $('#datepickerDirective').val();
      if (dateRDV == $translate.instant('dateRDVPlaceholer')) dateRDV = $filter('date')(new Date(), 'dd/MM/yyyy');
      var dateRDVT = new Date(dateRDV.substr(6, 4), Number(dateRDV.substr(3, 2)) - 1, dateRDV.substr(0, 2));

      MenuService.setLocalStorage('ReloadContactList', 1);
      var checkFollowerValue = '';
      if (checkFollower) {
        checkFollowerValue = 'on';
      } else {
        checkFollowerValue = 'off';
      }

      var dateRDVValue = "";
      if (dateRDVT == '' || dateRDVT == null) {
        dateRDVValue = $filter('date')(new Date(), 'MM/dd/yyyy');
      } else {
        dateRDVValue = $filter('date')(dateRDVT, 'MM/dd/yyyy');
      }
      if (typeof email === null || email == '') {
        $rootScope.focusName = true;
        LoadingService.error($translate.instant('BuzcardSend.Msg1'), "BuzcardSendController");

      } else if (validateEmail(email) == false) {
        $rootScope.focusName = true;
        LoadingService.error($translate.instant('BuzcardSend.Msg2'), "BuzcardSendController");
      } else {

        $rootScope.fromState = "app.buzcardSend";
        ///LoadingService.loading($translate.instant('BuzcardSend.Msg3_1') + email + $translate.instant('BuzcardSend.Msg3_2'));
        //************* cas non connecté **********************
        if (dateRDVValue == $filter('date')(new Date(), 'MM/dd/yyyy')) {
          dateRDVValue = '';
          dateRDV2 = $filter('date')(new Date(), 'MM/dd/yyyy');
        } else {
          dateRDVValue = $filter('date')(dateRDVT, 'dd/MM/yyyy');
          dateRDV2 = $filter('date')(dateRDVT, 'MM/dd/yyyy');
        }

        $rootScope.emailSend = "";
        $rootScope.langueSend = "";

        // popup envoi en cours
        LoadingService.loading($translate.instant('BuzcardSend.LoadingSend'));
        ContactsService.selectContactbyEmail(db, email, function (localContactResultSet) {

          if (localContactResultSet.rows.length == 0) {
            //  Nouveau contact
            //preparation des object
            var idTmp = parseInt(new Date().getTime() / 1000);
            var Rid = parseInt(new Date().getTime() / 1000);

            var status = "";
            if (checkFollowerValue == "on") {
              status = "selected";
            } else {
              status = "cant_be_selected";
            }
            var arrayEmail = decomposeEmail(email);
            var contactObj = {
              id: idTmp,
              email: email.toLowerCase(),
              date: idTmp,
              rendez_vous: toUsFormat(dateRDVValue),
              comment: "",
              last_name: $filter('capitalize')(arrayEmail[1]),
              first_name: $filter('capitalize')(arrayEmail[0]),
              phone_1: "",
              phone_2: "",
              company: $filter('capitalize')(arrayEmail[2]),
              list: "",
              emailaddress2: "",
              actu: "",
              addressline1: "",
              addressline2: "",
              addressline3: "",
              postalcode: "",
              city: "",
              workphonenumber: "",
              mobilephonenumber2: "",
              source: "",
              fonction: "",
              Link_CardOnline: "",
              vcardprofil: 1,
              Filleul: 0,
              status: status,
              firstsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
              lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
              photofilelocation: "img/photo_top_title.jpg",
              LanguageText: extractLangName(selectLang),
              alerteemailcreationdate: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'),
              meeting_point: meeting_point,
              latitude_meeting: latitude_meeting,
              longitude_meeting: longitude_meeting
            };

            var object = {
              email: email.toLowerCase(),
              selectLang: extractLang(selectLang),
              checkFollower: checkFollowerValue,
              sendMobile: sendMobile,
              dateRDV: dateRDV2,
              tradEmailContent: addSlashes($scope.tradEmailContent),
              idTmp: idTmp,
              Rid: Rid

            };
            //creation de contact en local
            ContactsService.insertIntoContactsTable(db, contactObj, function () {
              var domaine = email.substring(email.indexOf('@') + 1, email.length);
              autoCompleteDomaines.AddnewDomaine(db, domaine, function () {
                AutoCompleteService.checkIfExistPrenom(db, email.toLowerCase(), function () {
                  //insertion de la requete local
                  SynchroServices.insertRequest(db, "BUZCARDSEND", object, function () {
                    ContactsService.selectContactbyEmail(db, email, function (resultSet) {
                      ContactsService.saveOrUpdateContactTel(db, resultSet.rows.item(0), {

                        email: resultSet.rows.item(0).email,
                        phone_1: resultSet.rows.item(0).phone_1,
                        phone_2: resultSet.rows.item(0).phone_2
                      }, function () {
                        $rootScope.fromsmssend = false;
                        LoadingService.dismiss();
                        $state.go("app.contactEdit", {
                          'id': resultSet.rows.item(0).id
                        });

                      }, function () {
                        $rootScope.fromsmssend = false;
                        LoadingService.dismiss();
                        $state.go("app.contactEdit", {
                          'id': resultSet.rows.item(0).id
                        });

                      });

                    });
                  });
                });
              });
            });
          } else {
            //contact existant
            // creation de l'object requete serveur
            var Rid = parseInt(new Date().getTime() / 1000);
            var objectServerToSend = {
              email: email.toLowerCase(),
              selectLang: extractLang(selectLang),
              checkFollower: checkFollowerValue,
              sendMobile: sendMobile,
              dateRDV: dateRDV2,
              tradEmailContent: addSlashes($scope.tradEmailContent),
              idTmp: localContactResultSet.rows.item(0).id,
              Rid: Rid
            };
            //creation objet contact local
            /********************\
             Begin
             \********************/
            var dateTmp = new Date(dateRDV.substr(6, 4), Number(dateRDV.substr(3, 2)) - 1, dateRDV.substr(0, 2));
            if ($filter('date')(new Date(dateTmp), 'MM/dd/yyyy') == $filter('date')(new Date(), 'MM/dd/yyyy')) {
              if (localContactResultSet.rows.item(0).firstsendemail == '') {
                contactX = {
                  id: localContactResultSet.rows.item(0).id,
                  firstsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
                  lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
                  LanguageText: extractLangName(selectLang)
                };
              } else {
                contactX = {
                  id: localContactResultSet.rows.item(0).id,
                  firstsendemail: localContactResultSet.rows.item(0).firstsendemail,
                  lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
                  LanguageText: extractLangName(selectLang)
                };
              }

            } else {
              if (localContactResultSet.rows.item(0).firstsendemail == '') {
                contactX = {
                  id: localContactResultSet.rows.item(0).id,
                  rendez_vous: $filter('date')(new Date(dateTmp), 'MM/dd/yyyy'),
                  firstsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
                  lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
                  LanguageText: extractLangName(selectLang)
                };
              } else {
                contactX = {
                  id: localContactResultSet.rows.item(0).id,
                  rendez_vous: $filter('date')(new Date(dateTmp), 'MM/dd/yyyy'),
                  firstsendemail: localContactResultSet.rows.item(0).firstsendemail,
                  lastsendemail: $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'),
                  LanguageText: extractLangName(selectLang)
                };
              }
            }

            /********************\
             End
             \********************/
            //update du contact en local
            ContactsService.updateContactInfoNew(db, contactX, function () {
              delete contactX.id;
              delete contactX.firstsendemail;
              delete contactX.lastsendemail;
              SynchroServices.insertRequest(db, "BUZCARDSEND", objectServerToSend, function () {
                SynchroServices.insertRequest(db, "CONTACTEDIT", {
                  id: localContactResultSet.rows.item(0).id,
                  contact: contactX
                }, function () {
                  ContactsService.selectContactbyEmail(db, email, function (resultSet) {
                    ContactsService.saveOrUpdateContactTel(db, resultSet.rows.item(0), {
                      email: resultSet.rows.item(0).email,
                      phone_1: resultSet.rows.item(0).phone_1,
                      phone_2: resultSet.rows.item(0).phone_2
                    }, function () {
                      $rootScope.fromsmssend = false;
                      LoadingService.dismiss();
                      $state.go("app.contactEdit", {
                        'id': resultSet.rows.item(0).id
                      });

                    }, function () {
                      $rootScope.fromsmssend = false;
                      LoadingService.dismiss();
                      $state.go("app.contactEdit", {
                        'id': resultSet.rows.item(0).id
                      });

                    });
                  });
                });
              });
            });

          }
        });

      }
    }

    // to dismiss the PopUp
    $scope.ok = function (id) {
      $rootScope.focusName = false;
      LoadingService.dismiss();
      $state.go("app.contactEdit", {
        'id': id
      });


    };
    // to dismiss the PopUp
    $scope.dismiss = function () {
      $rootScope.focusName = false;
      LoadingService.dismiss();
    };




    function toUsFormat(date) {
      try {
        if ("" != date) {
          var array = date.split("/");
          var dateTmp = array[1] + "/" + array[0] + "/" + array[2];
          return dateTmp;
        } else {
          return date;
        }

      } catch (e) {
        return date;
      }

    }

    function validateEmail(email) {

      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }

    function extractLang(selectLang) {
      var language = "";
      if (selectLang === undefined) {
        language = $translate.use();
      } else {
        for (var i = 0; i < $scope.tradEmailArray.length; i++) {
          if ($scope.tradEmailArray[i].lcid == selectLang) {
            language = $scope.tradEmailArray[i].lcid;
            break;
          }
        }
      }

      return language;
    }

    function extractLangName(selectLang) {

      var language = "";
      if (selectLang === undefined) {
        selectLang = $translate.use();
      }

      for (var i = 0; i < $scope.tradEmailArray.length; i++) {
        if ($scope.tradEmailArray[i].lcid == selectLang) {
          language = $scope.tradEmailArray[i].languagename;
          break;
        }
      }


      return language;
    }

    //on focus
    $scope.focus = function () {
      $rootScope.focused = true;
    };
    //on blr
    $scope.blur = function () {
      $rootScope.focused = false;
    };

    $scope.sendBuzcard = function (email, selectLang, checkFollower, sendMobile, dateRDV) {
      $rootScope.displaydrowdown1 = {"z-index": "-1"};

      LoadingService.loading($translate.instant('BuzcardSend.LoadingSend'));
      if (email != undefined && email != null) {
        var string = email.substring(1, 2);

        if (isCharacter(string) && !validateEmail(email.toLowerCase())) {
          $rootScope.focusName = true;
          LoadingService.error($translate.instant("SMS.emailNonValid"), "BuzcardSendController");

        } else if (isNonChar(string) && !validatePhone(email) && !validateEmail(email.toLowerCase())) {
          $rootScope.focusName = true;
          LoadingService.error($translate.instant("SMS.phoneNonValid"), "BuzcardSendController");
        } else if (validateEmail(email.toLowerCase())) {
            cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
                sendB(email.toLowerCase(), selectLang, checkFollower, sendMobile, dateRDV, $translate.instant('ContactEdit.SearchGPS'), "", "");
            }, function (error) {
              sendB(email.toLowerCase(), selectLang, checkFollower, sendMobile, dateRDV, $translate.instant('ContactEdit.SearchGPS'), "", "");
            });
        }

        else if (validatePhone(email) && email.length > 5) {
          $rootScope.fromState = "app.buzcardSend";

          LoadingService.loading($translate.instant("Loading4"));
          BuzcardService.selectProfile(db, function (rs) {
            var options = {
              replaceLineBreaks: false, // true to replace \n by a new line, false by default
              android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
              }
            };
            var phoneNumber = email;
            var buzcardOnline = localStorage.getItem("act");
            var link = $translate.instant("SMS.Msg", {
              buzcardOnline: buzcardOnline,
              first_name: rs.rows.item(0).first_name
            });

            $cordovaSms.send(email, link, options)
              .then(function () {
                /***********************\
                 SMS envoyé
                 \***********************/
                ContactsService.selectContactByPhone(db, phoneNumber, function (res) {
                  console.log('/***********************\\\n' +
                    '                 SMS envoyé\n' +
                    '                 \\***********************/')

                  if (res.rows.length > 0) {
                    if(res.rows.item(0).firstsendemail !='')
                    ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt(res.rows.item(0).id), function () {
                      ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt(res.rows.item(0).id), function () {

                        $rootScope.focusName = true;
                        LoadingService.confirm($translate.instant('BuzcardSend.successSendSMS', {phone: phoneNumber}), parseInt(res.rows.item(0).id), "BuzcardSendController");
                      })
                    })
                    else
                      ContactsService.updateContactByField(db, "firstsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt(res.rows.item(0).id), function () {
                        ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt(res.rows.item(0).id), function () {
                          ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt(res.rows.item(0).id), function () {

                            $rootScope.focusName = true;
                            LoadingService.confirm($translate.instant('BuzcardSend.successSendSMS', {phone: phoneNumber}), parseInt(res.rows.item(0).id), "BuzcardSendController");
                          })
                        })
                      })
                      } else {
                    var idTmp = new Date().getTime();
                    ContactsService.createContactDB(db, idTmp, function (res) {
                      SynchroServices.insertRequest(db, "CONTACTCREATE", {idTmp: idTmp, SMS: 'OUI'}, function () {
                        ContactsService.updateContactByField(db, "phone_2", phoneNumber, idTmp, function () {
                          ContactsService.updateContactByField(db, "firstsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), idTmp, function () {
                            ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), idTmp, function () {
                            ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime()/1000, idTmp, function () {
                              ContactsService.updateContactByField(db, "alerteemailcreationdate", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'), idTmp, function () {
                                ContactsService.updateContactByField(db, "status", "cant_be_selected", idTmp, function () {
                                  ContactsService.updateContactByField(db, "photofilelocation", "img/photo_top_title.jpg", idTmp, function () {
                                    $rootScope.focusName = true;
                                    LoadingService.confirm($translate.instant('BuzcardSend.successSendSMS', {phone: phoneNumber}), idTmp, "BuzcardSendController");

                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                      });
                    })
                  }
                })

              }, function (err) {
              console.log("----569---"+ err)
              LoadingService.dismiss();
              $rootScope.focusName = true;
              LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
            });
          }, function (error) {
            LoadingService.dismiss();
            $rootScope.focusName = true;
            LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "BuzcardSendController");
          });


          //     });
        } else {
          $rootScope.focusName = true;
          LoadingService.error($translate.instant('BuzcardSend.InvalidET'), "BuzcardSendController");
        }
      } else {
        $rootScope.focusName = true;
        LoadingService.dismiss()
        LoadingService.error($translate.instant("SMS.emailNonValid"), "BuzcardSendController");
      }
    };

    // to dismiss the PopUp
    $scope.dismissInfoCallBack = function (email, selectLang, checkFollower, sendMobile, dateRDV, meeting_point, lat, long) {
      ///////////////////////////////////////////////////////////////////////////
      cordova.plugins.diagnostic.getLocationAuthorizationStatus(function (status) {
        if (status == "not_determined") {
          cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
            //alert('Location premission '+status);
            sendB(email.toLowerCase(), selectLang, checkFollower, sendMobile, dateRDV, meeting_point, lat, long);
          }, function (error) {
            //alert("The following error occurred: "+error);
            sendB(email.toLowerCase(), selectLang, checkFollower, sendMobile, dateRDV, meeting_point, lat, long);
          });
        } else {
          sendB(email.toLowerCase(), selectLang, checkFollower, sendMobile, dateRDV, meeting_point, lat, long);
        }
      }, function (error) {
        //alert("The following error occurred: "+error);
        sendB(email.toLowerCase(), selectLang, checkFollower, sendMobile, dateRDV, meeting_point, lat, long);
      });
      LoadingService.dismiss();
    };
    // to dismiss the PopUp
    $scope.dismissInfo = function () {
      LoadingService.dismiss();
    };


    function validatePhone(phone) {
      var re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/;
      return re.test(phone);
    }

    function isCharacter(string) {
      var reg = /^[a-zA-Z]*$/;
      return reg.test(string);
    }

    function isNonChar(string) {
      var reg = /^[0-9!@#\$%\^\&*\)\(+]+$/;
      return reg.test(string);
    }

  }]);
