appContext.factory("ConnectionService", ['LoginService', '$http', 'SynchroServices', 'BuzcardService', 'ContactsService', 'LoadingService', '$rootScope',
    'cameraService', 'MenuService', '$timeout', '$translate', 'UrgencyService', '$translate', 'QrCodeServices', 'BuzwardService', '$cordovaFile', '$state',
    function (LoginService, $http, SynchroServices, BuzcardService, ContactsService, LoadingService, $rootScope, cameraService, MenuService, $timeout, $translate,
              UrgencyService, $translate, QrCodeServices, BuzwardService, $cordovaFile, $state) {


        /**
         * test if there is connection
         */
        var isConnected = function (db, connectedCallBack, notConnectedCallBack) {
            console.log("%cTest CNX + depilement",  'background: #000; color: #FF8000')
            LoginService.selectCredentials(db, function (result) {
                LoginService.doLogin(result.rows.item(0).email,
                    result.rows.item(0).password).success(
                    function (data, status, headers, config) {
                        /**
                         *
                         */
                        if (parseInt(data.identification) != 0) {
                            console.log("login success...");
                            var currentState = $state.current.name;
                            if ($rootScope.sychroEncours != true) {
                                //	alert("exec");
                                $rootScope.isSynchronizing = true;
                                execReq(db, function () {
                                    $rootScope.isSynchronizing = false;
                                    return connectedCallBack();
                                });


                            } else {
                                $rootScope.isSynchronizing = false;
                                console.info("rootScope.sychroEncours = false;")
                                return connectedCallBack();
                            }

                        } else {
                            // return not connected
                            $rootScope.isSynchronizing = false;
                            console.log("false cridential & error login");
                            console.log(JSON.stringify(data));
                            return notConnectedCallBack();
                        }
                        /**
                         *
                         */


                    }).error(function (data, status, headers, config) {
                    // return not connected
                    $rootScope.isSynchronizing = false;
                    console.log("not connected & error login");
                    console.log(JSON.stringify(data));
                    return notConnectedCallBack();
                });
            });

        };


        /**
         * test if there is connection
         */
        var testConnected = function (db, connectedCallBack, notConnectedCallBack) {
            console.log("%cJust Test CNX",  'background: #FF8000; color: #000')
            LoginService.selectCredentials(db, function (result) {
                LoginService.doLogin(result.rows.item(0).email,
                    result.rows.item(0).password).success(
                    function (data, status, headers, config) {
                        // console.log("login success...");
                        if (parseInt(data.identification) != 0) {
                            return connectedCallBack();
                        } else {
                            console.log("false cridential & error login");
                            return notConnectedCallBack();
                        }


                    }).error(function (data, status, headers, config) {
                    // return not connected
                    console.log("not connected & error login");
                    return notConnectedCallBack();
                });
            });

        };
        var testConexion = function (db, connectedCallBack, notConnectedCallBack) {
            var Request = {
                url: "https://www.buzcard.com/nepaseffacer.txt",
                method: "GET",

            }
            $http(Request).success(function (data, status, headers, config) {
                return connectedCallBack();
            }).error(function (data, status, headers, config) {
                return notConnectedCallBack();
            });
        }

        /**
         *
         */

        var isConnectedSYc = function (db, connectedCallBack, notConnectedCallBack) {

            LoginService.selectCredentials(db, function (result) {
                LoginService.doLogin(result.rows.item(0).email,
                    result.rows.item(0).password).success(
                    function (data, status, headers, config) {

                        // console.log("login success...");
                        if (parseInt(data.identification) != 0) {
                            if (!$rootScope.isBackgroudRuning) {
                                exeBuzcardSend(db, function () {

                                    return connectedCallBack();
                                });
                            } else {
                                console.warn("Buzcard Send Skipped !!");
                                return connectedCallBack();
                            }
                        } else {
                            console.log("false cridential & error login");
                            return notConnectedCallBack();
                        }


                    }).error(function (data, status, headers, config) {
                    // return not connected
                    // console.warn("not connected & error login");
                    return notConnectedCallBack();
                });
            });

        };


        /**
         * test if there is connection
         */
        var isConnectedWithoutSync = function (db, connectedCallBack, notConnectedCallBack) {
            return notConnectedCallBack();
        };


        function exeBuzcardSend(db, callBack) {
            SynchroServices.selectBuzcardSend(db, function (result) {
                if (result.rows.length > 0) {
                    $rootScope.isBackgroudRuning = true;
                    MenuService.setLocalStorage('ReloadContactList', 1);
                    switch (result.rows.item(0).name) {
                        case "BUZCARDSEND":

                            BuzcardService.sendBuzcardToServer(JSON.parse(result.rows.item(0).object).email,
                                JSON.parse(result.rows.item(0).object).selectLang,
                                JSON.parse(result.rows.item(0).object).checkFollower,
                                JSON.parse(result.rows.item(0).object).sendMobile,
                                JSON.parse(result.rows.item(0).object).dateRDV,
                                JSON.parse(result.rows.item(0).object).tradEmailContent,
                                JSON.parse(result.rows.item(0).object).Rid,
                                function (contactServer) {
                                    console.log(" ***** send ok  ******");
                                    //it s a new contact
                                    ContactsService.getContactbyId(db, JSON.parse(result.rows.item(0).object).idTmp, function (resultx) {

                                        if (resultx.rows.length > 0) {
                                            if (contactServer.id != resultx.rows.item(0).id) {
                                                //changement de id
                                                if (resultx.rows.item(0).id.toString().length == 10) {
                                                    ContactsService.updateContactIdById(db, JSON.parse(result.rows.item(0).object).idTmp, contactServer.id, function () {


                                                        /*******************************\
                                                         préparation de l'objet serveur
                                                         \*******************************/
                                                        var contactObj = {};
                                                        var localContact = resultx.rows.item(0);
                                                        var remoteContact = contactServer;
                                                        if (localContact.meeting_point == $translate.instant('ContactEdit.SearchGPS')) {
                                                            localContact.meeting_point = "";
                                                        }

                                                        for (var key in localContact)
                                                            if (remoteContact[key] != localContact[key])
                                                                contactObj[key] = localContact[key];

                                                        delete contactObj.rendez_vous;
                                                        delete contactObj.id;
                                                        delete contactObj.date;
                                                        delete contactObj.photofilelocation;
                                                        delete contactObj.LanguageText;
                                                        delete contactObj.domaine;
                                                        delete contactObj.synchro;
                                                        delete contactObj.modificationdate;
                                                        delete contactObj.alerteemailcreationdate;
                                                        delete contactObj.firstsendemail;
                                                        delete contactObj.lastsendemail;
                                                        delete contactObj.lastsendemailtimeStmp;
                                                        /** end **/

                                                        console.warn(JSON.stringify(contactObj));
                                                        if (!isEmpty(contactObj)) {
                                                            //add contact edit request
                                                            SynchroServices.insertRequest(db, "CONTACTEDIT", {
                                                                id: remoteContact.id,
                                                                contact: contactObj
                                                            }, function () {
                                                                //check if existe photo depuis buzcard send et le renomer et le synchroniser vers le serveur
                                                                //--------check if existe photo depuis buzcard send et le renomer et le synchroniser vers le serveur
                                                                if (localContact.photofilelocation != 'img/photo_top_title.jpg') {
                                                                    var RID = parseInt(new Date().getTime() / 1000);
                                                                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                        id: remoteContact.id,
                                                                        path: localContact.photofilelocation,
                                                                        RID: RID
                                                                    }, function () {
                                                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                            $rootScope.buzcardSend = 0;
                                                                            exeBuzcardSend(db, callBack);
                                                                        });
                                                                    });
                                                                } else {
                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                        $rootScope.buzcardSend = 0;
                                                                        exeBuzcardSend(db, callBack);
                                                                    });
                                                                }
                                                                //--------------
                                                            });
                                                        } else {
                                                            //--------check if existe photo depuis buzcard send et le renomer et le synchroniser vers le serveur
                                                            if (localContact.photofilelocation != 'img/photo_top_title.jpg') {
                                                                var RID = parseInt(new Date().getTime() / 1000);
                                                                SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                    id: remoteContact.id,
                                                                    path: localContact.photofilelocation,
                                                                    RID: RID
                                                                }, function () {
                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                        $rootScope.buzcardSend = 0;
                                                                        exeBuzcardSend(db, callBack);
                                                                    });
                                                                });
                                                            } else {
                                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                    $rootScope.buzcardSend = 0;
                                                                    exeBuzcardSend(db, callBack);
                                                                });
                                                            }
                                                            //--------------
                                                        }
                                                    });
                                                } else {
                                                    //id contact different que celle en local: update de contact par l'id en local
                                                    //(cas particuliere  de contact existant)
                                                    /*******************************\
                                                     préparation de l'objet serveur
                                                     \*******************************/
                                                    var contactObj = {};
                                                    var localContact = resultx.rows.item(0);
                                                    var remoteContact = contactServer;
                                                    if (localContact.meeting_point == $translate.instant('ContactEdit.SearchGPS')) {
                                                        localContact.meeting_point = "";
                                                    }

                                                    for (var key in localContact)
                                                        if (remoteContact[key] != localContact[key])
                                                            contactObj[key] = localContact[key];

                                                    delete contactObj.rendez_vous;
                                                    delete contactObj.id;
                                                    delete contactObj.date;
                                                    delete contactObj.photofilelocation;
                                                    delete contactObj.LanguageText;
                                                    delete contactObj.domaine;
                                                    delete contactObj.synchro;
                                                    delete contactObj.modificationdate;
                                                    delete contactObj.alerteemailcreationdate;
                                                    delete contactObj.firstsendemail;
                                                    delete contactObj.lastsendemail;
                                                    delete contactObj.lastsendemailtimeStmp;
                                                    /** end **/
                                                    console.warn(JSON.stringify(contactObj));
                                                    if (!isEmpty(contactObj)) {
                                                        //add contact edit request
                                                        SynchroServices.insertRequest(db, "CONTACTEDIT", {
                                                            id: localContact.id,
                                                            contact: contactObj
                                                        }, function () {
                                                            //check if existe photo depuis buzcard send et le renomer et le synchroniser vers le serveur
                                                            if (localContact.photofilelocation != 'img/photo_top_title.jpg') {
                                                                var RID = parseInt(new Date().getTime() / 1000);
                                                                SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                    id: remoteContact.id,
                                                                    path: localContact.photofilelocation,
                                                                    RID: RID
                                                                }, function () {
                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                        $rootScope.buzcardSend = 0;
                                                                        exeBuzcardSend(db, callBack);
                                                                    });
                                                                });
                                                            } else {
                                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                    $rootScope.buzcardSend = 0;
                                                                    exeBuzcardSend(db, callBack);
                                                                });
                                                            }
                                                            //--------------
                                                        });
                                                    } else {
                                                        //-check if existe photo depuis buzcard send et le renomer et le synchroniser vers le serveur
                                                        if (localContact.photofilelocation != 'img/photo_top_title.jpg') {
                                                            var RID = parseInt(new Date().getTime() / 1000);
                                                            SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                id: remoteContact.id,
                                                                path: localContact.photofilelocation,
                                                                RID: RID
                                                            }, function () {
                                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                    $rootScope.buzcardSend = 0;
                                                                    exeBuzcardSend(db, callBack);
                                                                });
                                                            });
                                                        } else {
                                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                $rootScope.buzcardSend = 0;
                                                                exeBuzcardSend(db, callBack);
                                                            });
                                                        }
                                                        //--------------
                                                        //--------------
                                                    }
                                                }
                                                //contact existant
                                            } else {
                                                /**
                                                 * upload photo si il a
                                                 * update contact if there modification in local
                                                 */
                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                    exeBuzcardSend(db, callBack);
                                                });
                                            }
                                        } else {

                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                exeBuzcardSend(db, callBack);
                                            });

                                        }
                                    });

                                },
                                function () {
                                    LoadingService.dismiss();
                                    if ($rootScope.buzcardSend > 2) {
                                        $rootScope.buzcardSend = 0;
                                        $timeout(function () {
                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {

                                                exeBuzcardSend(db, callBack);
                                            });
                                        }, 2000);
                                    } else {
                                        $rootScope.buzcardSend = $rootScope.buzcardSend + 1;
                                        $timeout(function () {
                                            execReq(db, callBack);
                                        }, 2000);
                                    }
                                });
                            break;
                    }
                } else {
                    $rootScope.isBackgroudRuning = false;
                    $rootScope.sychroEncours = false;
                    return callBack();
                }
            });
        }


        function execReq(db, callBack) {


            //alert("execRes");
            //testConnected(db, function(){

            // alert("connected");

            SynchroServices.selectAllRequest(db, function (result) {


                //	 alert(result.rows.length);

                if (result.rows.length > 0) {
                    //alert( JSON.stringify(result.rows.item(0).object));
                    $rootScope.emptyQueue = false;

                    console.info(result.rows.item(0).name);

                    switch (result.rows.item(0).name) {
                        case "BUZCARDEDIT":
                            BuzcardService.updateProfilServer(0, JSON.parse(result.rows.item(0).object).profile, function () {
                                $rootScope.buzcardEdit = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                LoadingService.dismiss();
                                $timeout(function () {
                                    if ($rootScope.buzcardEdit > 2) {
                                        $rootScope.buzcardEdit = 0;
                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                            execReq(db, callBack);
                                        });
                                    } else {
                                        $rootScope.buzcardEdit = $rootScope.buzcardEdit + 1;
                                        execReq(db, callBack);
                                    }
                                    // console.log("une erreur réseau est survenue lors de la synchronisation \nVeuillez réessayer plus tard \n code : 0x0001 ");

                                }, 200);
                            });
                            break;


                        case "CONTACTEDIT":
                            /***************/
                            // remove unsed fields
                            contactAfterClean = JSON.parse(result.rows.item(0).object).contact;
                            console.warn(JSON.parse(result.rows.item(0).object).id);
                            delete contactAfterClean.domaine;
                            delete contactAfterClean.date;
                            delete contactAfterClean.id;
                            delete contactAfterClean.lastsendemailtimeStmp;
                            delete contactAfterClean.Link_CardOnline;
                            delete contactAfterClean.synchro;
                            delete contactAfterClean.modificationdate;
                            delete contactAfterClean.photofilelocation;
                            delete contactAfterClean.alerteemailcreationdate;

                            console.warn("***************contact after clean******");
                            console.warn(JSON.stringify(contactAfterClean));
                            console.warn("contact id " + JSON.parse(result.rows.item(0).object).id);
                            console.warn("*********************");
                            /***************/

                            ContactsService.updateContactServer(0, JSON.parse(result.rows.item(0).object).id, contactAfterClean, function () {
                                $rootScope.contactEdit = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                LoadingService.dismiss();
                                $timeout(function () {
                                    if ($rootScope.contactEdit > 2) {
                                        $rootScope.contactEdit = 0;
                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                            execReq(db, callBack);
                                        });
                                    } else {
                                        $rootScope.contactEdit = $rootScope.contactEdit + 1;
                                        execReq(db, callBack);
                                    }
                                    console.log("une erreur réseau est survenue lors de la synchronisation \nVeuillez réessayer plus tard  \n code : 0x0002");

                                }, 200);
                            });
                            break;

                        case "RENAMEGROUP":
                            ContactsService.updateGroupServer(JSON.parse(result.rows.item(0).object).oldName, JSON.parse(result.rows.item(0).object).newName, function () {
                                $rootScope.renameGroup = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                LoadingService.dismiss();
                                $timeout(function () {
                                    if ($rootScope.renameGroup > 2) {
                                        $rootScope.renameGroup = 0;
                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                            execReq(db, callBack);
                                        });
                                    } else {
                                        $rootScope.renameGroup = $rootScope.renameGroup + 1;
                                        execReq(db, callBack);
                                    }
                                    console.log("une erreur réseau est survenue lors de la synchronisation \nVeuillez réessayer plus tard  \n code : 0x0003");

                                }, 200);
                            });
                            break;

                        case "BUZCARDSEND":

                            BuzcardService.sendBuzcardToServer(JSON.parse(result.rows.item(0).object).email,
                                JSON.parse(result.rows.item(0).object).selectLang,
                                JSON.parse(result.rows.item(0).object).checkFollower,
                                JSON.parse(result.rows.item(0).object).sendMobile,
                                JSON.parse(result.rows.item(0).object).dateRDV,
                                JSON.parse(result.rows.item(0).object).tradEmailContent,
                                JSON.parse(result.rows.item(0).object).Rid,
                                function (contactServer) {
                                    console.log("buzcardSend : OK");
                                    ContactsService.getContactbyId(db, JSON.parse(result.rows.item(0).object).idTmp, function (contactLocalResultSet) {
                                        // contact Local Existe
                                        if (contactLocalResultSet.rows.length > 0) {

                                            //cas de contact existant avec id temporaire
                                            if (contactLocalResultSet.rows.item(0).id != contactServer.id) {
                                                // changement d'id temporaire par id serveur dans la DB
                                                ContactsService.updateContactIdById(db, JSON.parse(result.rows.item(0).object).idTmp, contactServer.id, function () {
                                                    var contactLocal = contactLocalResultSet.rows.item(0);
                                                    //  ContactsService.getContactServeurAfterSend(db,contactServer,contactLocal,  function(contactLocalAfter){
                                                    ContactsService.checkinfoserver(db, contactServer.first_name, contactLocal.first_name, 'first_name', contactServer.id, function () {
                                                        contactLocal.first_name = contactServer.first_name;
                                                        ContactsService.checkinfoserver(db, contactServer.last_name, contactLocal.last_name, 'last_name', contactServer.id, function () {
                                                            contactLocal.last_name = contactServer.last_name;
                                                            ContactsService.checkinfoserver(db, contactServer.company, contactLocal.company, 'company', contactServer.id, function () {
                                                                contactLocal.company = contactServer.company;

                                                                console.log(contactLocal);
                                                                /**********************************************\
                                                                 préparation de l'objet à envoyer au serveur
                                                                 \**********************************************/
                                                                var contactObj = {};

                                                                // meeting_point par default
                                                                if (contactLocal.meeting_point == $translate.instant('ContactEdit.SearchGPS')) {
                                                                    contactLocal.meeting_point = "";
                                                                }

                                                                for (var key in contactLocal)
                                                                    if (contactServer[key] != contactLocal[key])
                                                                        contactObj[key] = contactLocal[key];

                                                                delete contactObj.rendez_vous;
                                                                delete contactObj.id;
                                                                delete contactObj.date;
                                                                delete contactObj.photofilelocation;
                                                                delete contactObj.LanguageText;
                                                                delete contactObj.domaine;
                                                                delete contactObj.synchro;
                                                                delete contactObj.modificationdate;
                                                                delete contactObj.alerteemailcreationdate;
                                                                delete contactObj.firstsendemail;
                                                                delete contactObj.lastsendemail;
                                                                delete contactObj.lastsendemailtimeStmp;
                                                                delete contactObj.vcardprofil;
                                                                delete contactObj.Filleul;
                                                                delete contactObj.Link_CardOnline;
                                                                /** end **/
                                                                console.log("********* contactObj::à Envoyer au serveur ***********");
                                                                console.log(contactObj);
                                                                //creer les requetes CONTACTEDIT
                                                                if (!isEmpty(contactObj)) {
                                                                    //object is not empty :: there is modification to send
                                                                    SynchroServices.insertRequest(db, "CONTACTEDIT", {
                                                                        id: contactServer.id,
                                                                        contact: contactObj
                                                                    }, function () {
                                                                        // verification s'il a une photo pour creer CONTACTPHOTO
                                                                        if (contactLocal.photofilelocation != 'img/photo_top_title.jpg') {
                                                                            var RID = parseInt(new Date().getTime() / 1000);
                                                                            SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                                id: contactServer.id,
                                                                                path: contactLocal.photofilelocation,
                                                                                RID: RID
                                                                            }, function () {
                                                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                    $rootScope.buzcardSend = 0;
                                                                                    execReq(db, callBack);
                                                                                });
                                                                            });

                                                                            ///////////

                                                                            //});
                                                                        } else {
                                                                            //contact has no photo && delete buzcardSend Request
                                                                            if (contactServer.photoflelocation != '') {
                                                                                ContactsService.downloadAndOverride(contactServer.id, function (urlImg) {
                                                                                    ContactsService.updateContactPhoto(db, contactServer.id, urlImg, function () {
                                                                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                            $rootScope.buzcardSend = 0;
                                                                                            execReq(db, callBack);
                                                                                        });
                                                                                    });
                                                                                });
                                                                            } else {

                                                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                    $rootScope.buzcardSend = 0;
                                                                                    execReq(db, callBack);
                                                                                });

                                                                            }
                                                                        }
                                                                    });

                                                                } else {
                                                                    // verification s'il a une photo pour creer CONTACTPHOTO
                                                                    if (contactLocal.photofilelocation != 'img/photo_top_title.jpg') {
                                                                        var RID = parseInt(new Date().getTime() / 1000);
                                                                        SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                            id: contactServer.id,
                                                                            path: contactLocal.photofilelocation,
                                                                            RID: RID
                                                                        }, function () {

                                                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                $rootScope.buzcardSend = 0;
                                                                                execReq(db, callBack);
                                                                            });


                                                                        });
                                                                    } else {
                                                                        //contact has no photo && delete buzcardSend Request
                                                                        //////////
                                                                        if (contactServer.photoflelocation != '') {
                                                                            ContactsService.downloadAndOverride(contactServer.id, function (urlImg) {
                                                                                ContactsService.updateContactPhoto(db, contactServer.id, urlImg, function () {
                                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                        $rootScope.buzcardSend = 0;
                                                                                        execReq(db, callBack);
                                                                                    });
                                                                                });
                                                                            });
                                                                        } else {

                                                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                $rootScope.buzcardSend = 0;
                                                                                execReq(db, callBack);
                                                                            });
                                                                        }
                                                                    }
                                                                }
                                                                //////
                                                            });
                                                        });

                                                    });
                                                    // } );

                                                    ///////////
                                                });
                                            }
                                            //cas de contact existant avec meme id
                                            else {
                                                console.info("BEFORE DELETE")


                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                    console.info("AFTER DELETE")
                                                    $rootScope.buzcardSend = 0;
                                                    execReq(db, callBack);
                                                });
                                            }

                                        }
                                        // contact Local n'Existe pas
                                        else {
                                            //creation d'un contact en local
                                            ContactsService.insertIntoContactsTable(db, contactServer, function (data) {
                                                if (data == 0) {
                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                        $rootScope.buzcardSend = 0;
                                                        execReq(db, callBack);
                                                    });
                                                } else {
                                                    console.error("insertIntoContactsTable Error");
                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                        $rootScope.buzcardSend = 0;
                                                        execReq(db, callBack);
                                                    });
                                                }
                                            });
                                        }
                                    });

                                }, function () {
                                    console.log("une erreur réseau est survenue lors de la Envoi BuzcardCard");
                                    // test sur le nombre de fois d'envoi de buzcardSend
                                    if ($rootScope.buzcardSend > 2) {
                                        $rootScope.buzcardSend = 0;
                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                            execReq(db, callBack);
                                        });
                                    } else {
                                        $rootScope.buzcardSend = $rootScope.buzcardSend + 1;
                                        execReq(db, callBack);
                                    }
                                });
                            break;

                        case "BUZCARDPHOTO":
                            BuzcardService.uploadPhotoProfil(JSON.parse(result.rows.item(0).object).path, function () {
                                $rootScope.buzcardPhoto = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                //LoadingService.dismiss();
                                $timeout(function () {
                                    // console.log("une erreur réseau est survenue lors de la synchronisation \nVeuillez réessayer plus tard  \n code : 0x0008");
                                    if ($rootScope.buzcardPhoto > 2) {
                                        $rootScope.buzcardPhoto = 0;
                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                            execReq(db, callBack);
                                        });
                                    } else {
                                        $rootScope.buzcardPhoto = $rootScope.buzcardPhoto + 1;
                                        execReq(db, callBack);
                                    }

                                }, 2000);
                            });
                            break;

                        case "CONTACTPHOTO":
                            ContactsService.uploadPhotoContact(JSON.parse(result.rows.item(0).object).path, JSON.parse(result.rows.item(0).object).id, JSON.parse(result.rows.item(0).object).RID, JSON.parse(result.rows.item(0).object).sendvcard, function () {
                                $rootScope.contactPhoto = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                execReq(db, callBack);
                            });
                            break;

                        case "CONTACTDELETE":
                            ContactsService.deleteContactServer(JSON.parse(result.rows.item(0).object).id, function (data) {
                                $rootScope.contactDelete = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                execReq(db, callBack);
                            });

                            break;
                        case "URGENCYEDIT":
                            UrgencyService.updateUrgencyServer(0, JSON.parse(result.rows.item(0).object).vcard, function () {
                                $rootScope.urgencyEdit = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                execReq(db, callBack);
                            });
                            break;
                        case "URGENCYPHOTO":
                            UrgencyService.uploadPhotoUrgency(JSON.parse(result.rows.item(0).object).path, function () {
                                $rootScope.urgencyPhoto = 0;
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });
                            }, function () {
                                execReq(db, callBack);
                            });
                            break;

                        case "QRCODE":

                            LoginService.selectCredentials(db, function (resultx) {
                                $rootScope.userId = resultx.rows.item(0).userId;

                                QrCodeServices.vitalOrVcard(JSON.parse(result.rows.item(0).object).act, function (data) {

                                    if ("VCARD" == data.QRCode.TypeQR || "4EV" == data.QRCode.TypeQR) {


                                        QrCodeServices.getCardInfoFromQrCode(JSON.parse(result.rows.item(0).object).act).then(function (response) {
                                            console.log(response)
                                            $rootScope.qrCode = 0;

                                            if (response.data.answer.contact_id != "") {


                                                var contact = QrCodeServices.createContactFromQrCode(response.data.answer.contact_id.contact);
                                                ContactsService.selectContactbyEmail(db, contact.email, function (resultset) {

                                                    //contact exxistant
                                                    if (resultset.rows.length > 0) {

                                                        QrCodeServices.UPDATECONTACT(db, contact, function () {
                                                            console.log(contact.id);
                                                            ContactsService.downloadPhotoContact(contact.id, function (url) {
                                                                ContactsService.updateContactPhoto(db, contact.id, url, function () {
                                                                    QrCodeServices.saveContactDeviceFlash(contact.id, function () {


                                                                        //LoadingService.dismiss();
                                                                        QrCodeServices.checkBuzcardSendAFterBuz(db, contact.id, JSON.parse(result.rows.item(0).object).act, function () {

                                                                            $rootScope.fromState = "app.qrcode";
                                                                            MenuService.setLocalStorage('ReloadContactList', 1);
                                                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                execReq(db, callBack);
                                                                            });
                                                                        })
                                                                    });
                                                                });
                                                            });
                                                        });

                                                        //new contact
                                                    } else {
                                                        QrCodeServices.CREATECONTAT(db, contact, function () {
                                                            //	LoadingService.dismiss();
                                                            ContactsService.downloadPhotoContact(contact.id, function (url) {
                                                                ContactsService.updateContactPhoto(db, contact.id, url, function () {
                                                                    QrCodeServices.saveContactDeviceFlash(contact.id, function () {

                                                                        QrCodeServices.checkBuzcardSendAFterBuz(db, contact.id, JSON.parse(result.rows.item(0).object).act, function () {

                                                                            $rootScope.fromState = "app.qrcode";
                                                                            MenuService.setLocalStorage('ReloadContactList', 1);
                                                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                                execReq(db, callBack);
                                                                            });
                                                                        });
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    }

                                                });
                                            } else {
                                                //	 QrCodeServices.checkSendAFterBuz(db,JSON.parse(result.rows.item(0).object).act, function(){
                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                    execReq(db, callBack);
                                                });
                                                // });
                                            }

                                        }, function (data, status, headers, config) {
                                            execReq(db, callBack);

                                        });
                                    } else {
                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                            execReq(db, callBack);
                                        });
                                    }
                                }, function (err) {
                                    execReq(db, callBack);
                                });
                            });
                            break;
                        case "BUZWARDSEND" :
                            if (window.cordova) {
                                var path = "";
                                if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                                    path = cordova.file.applicationStorageDirectory;
                                    var isWindowsPhone = ionic.Platform.isWindowsPhone();
                                } else if (isWindowsPhone) {
                                    path = "/";
                                } else {
                                    path = cordova.file.dataDirectory;
                                }
                                $cordovaFile.writeFile(path, "buzwardtext.txt", removeSlashes(JSON.parse(result.rows.item(0).object).filebuzward), true)
                                    .then(function (success) {

                                        BuzwardService.SendBuzwardServerWithtext(JSON.parse(result.rows.item(0).object).contactId, JSON.parse(result.rows.item(0).object).email, success.target.localURL, JSON.parse(result.rows.item(0).object).checkBox, JSON.parse(result.rows.item(0).object).checkBox2, function (contactserver) {

                                            console.log(contactserver);

                                            ContactsService.getContactbyId(db, contactserver.id, function (contactLocalResultSet) {
                                                // contact Local Existe
                                                if (contactLocalResultSet.rows.length > 0) {

                                                    //cas de contact existant a

                                                    console.log('contact existant');
                                                    $rootScope.buzwardSend = 0;
                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                        execReq(db, callBack);
                                                    });


                                                } else {
                                                    ContactsService.insertIntoContactsTable(db, contactserver, function (data) {

                                                        ContactsService.downloadPhotoContact(contactserver.id, function (url) {
                                                            ContactsService.updateContactPhoto(db, contactserver.id, url, function () {
                                                                QrCodeServices.saveContactDeviceFlash(contactserver.id, function () {

                                                                    MenuService.setLocalStorage('ReloadContactList', 1);
                                                                    console.log('contact inserted');
                                                                    $rootScope.buzwardSend = 0;
                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                        execReq(db, callBack);
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });
                                                }


                                            });
                                        }, function () {
                                            execReq(db, callBack);
                                        });
                                    }, function (error) {
                                        // error writefile
                                        console.log(JSON.stringify(error));
                                    });
                            }

                            break;
                        case "CONTACTCREATE" :
                            //creation d'un contact
                            LoginService.selectCredentials(db, function (credentialResultSet) {
                                var ridCreateContact = parseInt(new Date().getTime() / 1000);
                                ContactsService.createContactServer(credentialResultSet.rows.item(0).userId, ridCreateContact).success(function (response, status, headers, config) {
                                    if (response.answer && response.answer.status == 0) {
                                        var sendvcard = JSON.parse(result.rows.item(0).object).sendvcard ? JSON.parse(result.rows.item(0).object).sendvcard : "NON"
                                        console.log("!! sendVcard !! " + sendvcard)
                                        $rootScope.createContact = 0;
                                        var contactServer = response.answer.contact_id.contact;
                                        /**
                                         *  mise a jour de l'id
                                         */
                                        //get contact from DB
                                        ContactsService.getContactbyId(db, JSON.parse(result.rows.item(0).object).idTmp, function (contactLocalResultSet) {
                                            if (contactLocalResultSet.rows.length > 0) {
                                                // contact local existe avec id  temporaire
                                                ContactsService.updateContactByField(db, "id", contactServer.id, JSON.parse(result.rows.item(0).object).idTmp, function (resultset) {
                                                    SynchroServices.updateRequest(db, "BUZCARDSEND", JSON.parse(result.rows.item(0).object).idTmp, contactServer.id, function (value) {
                                                        /**
                                                         * mise a jour des champs
                                                         */
                                                        //preparation de l'object à envoyer
                                                        /*******************************\
                                                         préparation de l'objet serveur
                                                         \*******************************/
                                                        var contactObj = {};
                                                        var contactLocal = contactLocalResultSet.rows.item(0);
                                                        // valeur par defaut de meeting_point
                                                        if (contactLocal.meeting_point == $translate.instant('ContactEdit.SearchGPS')) {
                                                            contactLocal.meeting_point = "";
                                                        }

                                                        for (var key in contactLocal)
                                                            if (contactServer[key] != contactLocal[key])
                                                                contactObj[key] = contactLocal[key];

                                                        delete contactObj.rendez_vous;
                                                        delete contactObj.id;
                                                        delete contactObj.date;
                                                        delete contactObj.photofilelocation;
                                                        delete contactObj.LanguageText;
                                                        delete contactObj.domaine;
                                                        delete contactObj.synchro;
                                                        delete contactObj.modificationdate;
                                                        delete contactObj.alerteemailcreationdate;
                                                        delete contactObj.firstsendemail;
                                                        delete contactObj.lastsendemail;
                                                        delete contactObj.lastsendemailtimeStmp;
                                                        delete contactObj.status;
                                                        delete contactObj.LinkCardOnline;
                                                        delete contactObj.vcardprofil;
                                                        delete contactObj.Filleul;
                                                        /** end **/
                                                        if (!isEmpty(contactObj)) {
                                                            ContactsService.updateContactServer(0, contactServer.id, contactObj, function () {

                                                                /**
                                                                 * upload photo si elle existe
                                                                 */
                                                                //test if photo existe
                                                                if (contactLocal.photofilelocation != "img/photo_top_title.jpg") {
                                                                    var RID = parseInt(new Date().getTime() / 1000);
                                                                    console.warn("LIGNE 1116")
                                                                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                        id: contactServer.id,
                                                                        path: contactLocal.photofilelocation,
                                                                        RID: RID,
                                                                        sendvcard: sendvcard
                                                                    }, function () {
                                                                        $rootScope.createContact = 0;
                                                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                            execReq(db, callBack);
                                                                        });
                                                                    });

                                                                }
                                                                //photo n'existe pas
                                                                else {
                                                                    $rootScope.createContact = 0;
                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                        execReq(db, callBack);
                                                                    });
                                                                }

                                                            }, function () {
                                                                console.error("erreur envoi des requetes update contact chez le serveur");
                                                                //test if photo existe
                                                                if (contactLocal.photofilelocation != "img/photo_top_title.jpg") {
                                                                    var RID = parseInt(new Date().getTime() / 1000);
                                                                    console.warn("LIGNE 1143")
                                                                    SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                        id: contactServer.id,
                                                                        path: contactLocal.photofilelocation,
                                                                        RID: RID,
                                                                        sendvcard: sendvcard
                                                                    }, function () {
                                                                        $rootScope.createContact = 0;
                                                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                            execReq(db, callBack);
                                                                        });
                                                                    });

                                                                }
                                                                //photo n'existe pas
                                                                else {
                                                                    $rootScope.createContact = 0;
                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                        execReq(db, callBack);
                                                                    });
                                                                }

                                                            });

                                                        } else {
                                                            //object contact vide
                                                            //test if photo existe
                                                            if (contactLocal.photofilelocation != "img/photo_top_title.jpg") {
                                                                var RID = parseInt(new Date().getTime() / 1000);
                                                                console.warn("LIGNE 1172")
                                                                SynchroServices.insertRequest(db, "CONTACTPHOTO", {
                                                                    id: contactServer.id,
                                                                    path: contactLocal.photofilelocation,
                                                                    RID: RID,
                                                                    sendvcard: sendvcard
                                                                }, function () {
                                                                    $rootScope.createContact = 0;
                                                                    SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                        execReq(db, callBack);
                                                                    });
                                                                });

                                                            }
                                                            //photo n'existe pas
                                                            else {
                                                                $rootScope.createContact = 0;
                                                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                                    execReq(db, callBack);
                                                                });
                                                            }
                                                        }

                                                    });
                                                });
                                            } else {
                                                // contact local n'existe pas
                                                //creation d'un contact en local from server
                                                ContactsService.insertIntoContactsTable(db, contactServer, function (data) {
                                                    if (data == 0) {
                                                        console.info("insertIntoContactsTable succes");
                                                        $rootScope.createContact = 0;
                                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                            execReq(db, callBack);
                                                        });
                                                    } else {
                                                        console.error("insertIntoContactsTable Error");
                                                        SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                            $rootScope.createContact = 0;
                                                            execReq(db, callBack);
                                                        });
                                                    }
                                                });

                                            }
                                        });
                                    } else {
                                        console.error("erreur requete createContact");
                                        if ($rootScope.createContact > 2) {
                                            $rootScope.createContact = 0;
                                            SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                                execReq(db, callBack);
                                            });

                                        } else {
                                            $rootScope.createContact = $rootScope.createContact + 1;
                                            execReq(db, callBack);
                                        }
                                    }

                                }).error(function (response, status, headers, config) {
                                    // erreur requete createContact
                                    console.error("erreur requete createContact");
                                    execReq(db, callBack);
                                });
                            });

                            break;
                        case "IMPORTCONTACT":
                            ContactsService.updateContactImported(db, JSON.parse(result.rows.item(0).object).total, function () {
                                $rootScope.importContact = 0;
                                MenuService.setLocalStorage('ReloadContactList', 1);
                                SynchroServices.deleteRequest(db, result.rows.item(0).id, function () {
                                    execReq(db, callBack);
                                });


                            }, function () {
                                execReq(db, callBack);
                            });

                    }
                    //  pas de reseau

                } else {
                    console.info("EMPTY QUEUE");
                    $rootScope.sychroEncours = false;
                    $rootScope.emptyQueue = true;
                    return callBack();
                }


            });
        };

        var checkFroNotification = function (act, callback) {

            var request = {
                method: 'POST',
                url: 'https://www.buzcard.com/RegisterUserApp.aspx?request=alertmessage',
                data : {
                    act : act
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'

                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                transformResponse: function (data) {
                    var x2js = new X2JS();
                    var json = x2js.xml_str2json(data);
                    return json;
                },

            };
            // the HTTP request
            return $http(request);
        }

        /**
         * test if object is empty
         */
        function isEmpty(value) {
            return Boolean(value && typeof value == 'object') && !Object.keys(value).length;
        };
        return {
            isConnected: isConnected,
            isConnectedWithoutSync: isConnectedWithoutSync,
            testConnected: testConnected,
            isConnectedSYc: isConnectedSYc,
            testConexion: testConexion,
            checkFroNotification : checkFroNotification
        };
    }]);
