appContext.controller("ContactShowController", [
    '$scope',
    '$state',
    'ContactsService',
    '$ionicPlatform',
    '$cordovaSQLite',
    '$stateParams',
    '$rootScope',
    'cameraService',
    '$ionicHistory',
    '$ionicModal',
    '$ionicSlideBoxDelegate',
    'ConnectionService',
    'LoadingService',
    'MenuService',
    '$translate','$filter','SynchroServices','$ionicSlideBoxDelegate','$cordovaSms','ionicToast','BuzcardService',
    function($scope, $state, ContactsService, $ionicPlatform, $cordovaSQLite,
            $stateParams, $rootScope, cameraService,$ionicHistory,$ionicModal,$ionicSlideBoxDelegate,ConnectionService,LoadingService,MenuService,$translate,$filter,SynchroServices,$ionicSlideBoxDelegate,$cordovaSms,ionicToast,BuzcardService) {
      $scope.showLast = false;
      $scope.tmp=false;
      var db = null;

      $ionicPlatform.ready(function() {

        /**
         * create/open DB
         */
        if (window.cordova) {
        	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
        } else {
          db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
        }

       // $ionicHistory.clearHistory();
        getContact();
      });

      /**
       * get infos contact by id
       */
      function getContact() {
    	  // $scope.photoProfil = "img/photo_top_title.jpg";
        ContactsService.getContactbyId(db, $stateParams.id, function(result) {
        	if(result.rows.length > 0){
        		tmpContact = result.rows.item(0);
                $scope.contact = result.rows.item(0);
                $scope.contact.last_name = removeSlashes(result.rows.item(0).last_name);
                $scope.contact.first_name = removeSlashes(result.rows.item(0).first_name);
                $scope.contact.company = removeSlashes(result.rows.item(0).company);
                $scope.contact.list = removeSlashes(result.rows.item(0).list);
                $scope.contact.lastsendemail =result.rows.item(0).lastsendemail;
                $scope.contact.fonction = removeSlashes(result.rows.item(0).fonction);
                $scope.contact.address = removeSlashes(result.rows.item(0).addressline1)+" "+removeSlashes(result.rows.item(0).addressline2)+" "+removeSlashes(result.rows.item(0).addressline3)+" "+removeSlashes(result.rows.item(0).postalcode)+" "+removeSlashes(result.rows.item(0).city);
                $scope.contact.Link_CardOnline = result.rows.item(0).Link_CardOnline;
                $rootScope.contact = $scope.contact;
            	if(removeSlashes(result.rows.item(0).meeting_point) == $translate.instant('ContactEdit.SearchGPS') || removeSlashes(result.rows.item(0).meeting_point) =="undefined" || removeSlashes(result.rows.item(0).meeting_point) ==$translate.instant('No-place') || removeSlashes(result.rows.item(0).meeting_point) ==$translate.instant('No-place-GPS')){
           		 $scope.contact.meeting_point = '';
           	}else{
           		 $scope.contact.meeting_point = removeSlashes(result.rows.item(0).meeting_point);
              	}
            	 if(result.rows.item(0).photofilelocation  =="img/photo_top_title.jpg" ){
            		// result.rows.item(0).photofilelocation="img/profilcontact.png";
              		$scope.photoProfil = "";
                  $scope.imageExist = true;
                     }else{
                       $scope.imageExist = false;
             		var fileName = result.rows.item(0).photofilelocation.substr(result.rows.item(0).photofilelocation.lastIndexOf('/')+1);
                    result.rows.item(0).photofilelocation = $rootScope.path+fileName;
                    $scope.photoProfil = result.rows.item(0).photofilelocation;
//                    ConnectionService.isConnected(db, function(){
//                    	  var fileLocation = window.localStorage.getItem('idUser')// $rootScope.fileLocaltion;
//
//                    	 $scope.photoProfil = "https://www.buzcard.com/upload/" + fileLocation + "/contacts/" + result.rows.item(0).id + "/imgThumbnail.jpg";
//                    }, function(){
//                    	 $scope.photoProfil = result.rows.item(0).photofilelocation;
//                    })

                  //  console.log($scope.photoProfil );
                         	 }


                //test sur le premier e dernier buzz
            	  if (!compareDate(result.rows.item(0).lastsendemail,result.rows.item(0).firstsendemail))
                      $scope.showLast = true;
                var idProfil = $rootScope.idProfil;
                $scope.tmp=true;

                // console.log(JSON.stringify($scope.contact));
                if(result.rows.item(0).rendez_vous !=""){
                	$scope.contact.rendez_vous = new Date(result.rows.item(0).rendez_vous * 1000);
                }else{
                	$scope.contact.rendez_vous = result.rows.item(0).rendez_vous;
                }

                // console.log($scope.contact.rendez_vous);

                if ( Object.prototype.toString.call($scope.contact.rendez_vous) === "[object Date]" ) {
                  // it is a date
                  if ( isNaN( $scope.contact.rendez_vous.getTime() ) ) {
                    // date is not valid
                    $scope.contact.rendez_vous="";
                  }
                  else {
                    // date is valid
                  }
                }
                else {
                  // not a date
                }
        	}else{
        		MenuService.setLocalStorage('ReloadContactList',1);
        		$state.go('app.contactList');
        	}
          /*******  show cut link  ******/
          console.warn($scope.contact.vcardprofil);
          if($scope.contact.status == 'selected'){
              $scope.showCutLink =  true;
          }else if($scope.contact.vcardprofil == -1) {
              $scope.showCutLink =  false;
          }else {
              $scope.showCutLink =  false;
          }
          /*******  end show cut link  ******/
        });
      };
      
      function compareDate(d1,d2){
      	
  	    var dd1 = new Date(d1);
  	    console.log(dd1);
  	    var dd2 = new Date(d2);
  	    console.log((dd1.getDate() == dd2.getDate() && dd1.getFullYear() == dd2.getFullYear() && dd1.getMonth() == dd2.getMonth() && dd1.getHours() == dd2.getHours() && dd1.getMinutes() == dd2.getMinutes())) ;
  	 
  	  if(dd1.getDate() == dd2.getDate() && dd1.getFullYear() == dd2.getFullYear() && dd1.getMonth() == dd2.getMonth() && dd1.getHours() == dd2.getHours() && dd1.getMinutes() == dd2.getMinutes()) return true;
	     else return false;
  	    
      }

      $scope.nextSlide = function() {
    	    $ionicSlideBoxDelegate.next();
    	  }
      $scope.previewSlide = function(){
    	  console.log("previous");
    	  $ionicSlideBoxDelegate.previous();
      }
      $scope.showSlide= function(index){
    	  console.log(index);
    	  $ionicSlideBoxDelegate.slide(index);
      }
      $ionicModal.fromTemplateUrl('app/common/partials/imagepopup.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
        });

        $scope.openModal = function() {
        	// console.log('open modal');
          $scope.modal.show();
          // Important: This line is needed to update the current ion-slide's width
          // Try commenting this line, click the button and see what happens
          $ionicSlideBoxDelegate.update();
        };


        $scope.closeModal = function() {
          $scope.modal.hide();

        };
        // Cleanup the modal when we're done with it!
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



        $scope.updateAndShowContact =function(id,email){
        								$rootScope.fromState = "app.contactShow";
	                					$state.go('app.contactEdit', {id: id });
        };

        $scope.dismiss = function(){
        	LoadingService.dismiss();
        	$state.go('app.contactList');
        };

        $scope.treatment = function(id){
        	ContactsService.deleteContactLocal(db,id,function(){
        		MenuService.setLocalStorage('ReloadContactList',1);
        		LoadingService.dismiss();
        		$state.go('app.contactList')
        	});
        };

        $scope.showAdress =function(meeting_point){
        	var url = "https://www.google.fr/maps/place/"+meeting_point;
        	window.open(url, '_system');
        }
        $scope.getLink = function(link){
        	window.open(link, '_system');
        }

        $scope.clickTel =function (tel){
        //	alert(tel);
        //	alert(tel.replace(/ /g,""));
          $rootScope.focused = false;
        	LoadingService.popUpClickTel(tel.replace(/ /g,""),"ContactShowController");

        }
        $scope.clicksendSMS = function(tel){

          $rootScope.focused = false;
        	 LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactShowController");

      		   if (validatePhone(tel) && tel.toString().length >5) {
      	         	  $rootScope.fromState = "app.buzcardSend";
      	           LoadingService.loading($translate.instant("Loading4"));
      	           var phoneNumber = $rootScope.contact.phone_2.toString().replace(/ /g,"");
      	           var buzcardOnline = localStorage.getItem("act");
      	           var link = " ";
      	         var options = {
      	               android: {
      	                   intent: 'INTENT'
      	               }
      	         };
      	         console.log(phoneNumber);
      	           $cordovaSms.send(phoneNumber, link, options)
      	                .then(function() {
      	                  LoadingService.dismiss();
      	                  /***********************\
      	                         SMS envoyé
      	                  \***********************/

      	                }, function(error) {
      	                   LoadingService.dismiss();
      	                });
      	         }
        }



      /**
       *
         * button lui envoi ma buzcard
         */
      $scope.LuiEnvoyerMaBuz = function(contact){
        console.log('lui envoyer ma buz')
        console.log(contact)
        if(contact.email === '' && contact.phone_2 ==='' && contact.phone_1 === ''){
          console.log('remlpir email ou phoneNumber ')
          LoadingService.error($translate.instant("email.phone.empty"), "ContactShowController");
        }

        else if(contact.email !=='' && contact.phone_2 ==='' && contact.phone_1 === ''){
          console.log('existe email seulement')
          $scope.sendCardViaEmail(contact.email)
        }

        else if(contact.email === '' && (contact.phone_2 !== '' || contact.phone_1 !=='')){
          console.log('existe phone seulement')
          LoadingService.popupClickLuiEnvoyerMaFiche(contact.email, contact.phone_1, contact.phone_2, 'ContactShowController')
        }


        else {
          console.log('existe email and phone')
          LoadingService.popupClickLuiEnvoyerMaFiche(contact.email, contact.phone_1, contact.phone_2, 'ContactShowController')
        }
      }
      /***
       * send par email
       */
      $scope.sendCardViaEmail = function(email){
        if(email == '' || validateEmail(email)){
          $rootScope.emailSend = email;
          LoadingService.dismiss();
          $state.go('app.buzcardSend');
        }else{
          LoadingService.error($translate.instant('ContactEdit.EmailIncorrect'), "ContactShowController");
        }

      }
      /****
       *
       */
      /****** click sur par SMS *****/
      $scope.sendCardViaSMS = function(phone_1, phone_2) {
        LoadingService.loading($translate.instant('ContactEdit.loadingSend'), "ContactShowController");
        if (phone_2 != "") {
          if (validatePhone(phone_2) && phone_2.length > 5) {
            $rootScope.fromState = "app.buzcardSend";
            LoadingService.loading($translate.instant("Loading4"));
            BuzcardService.selectProfile(db, function(rs) {

              var phoneNumber =phone_2;
              var buzcardOnline = localStorage.getItem("act");
              var link = $translate.instant("SMS.Msg", {
                buzcardOnline: buzcardOnline,
                first_name: rs.rows.item(0).first_name
              });
              $cordovaSms.send(phoneNumber, link, {})
                .then(function() {
                  if($scope.contact.firstsendemail !='')
                    ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($scope.contact.id), function () {
                      ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt($scope.contact.id), function () {

                        LoadingService.dismiss();

                        LoadingService.confirm2($translate.instant('ContactEdit.SendSMS', {
                          phone: phoneNumber
                        }), $scope.contact.id, "ContactShowController");
                      })
                    })
                  else
                    ContactsService.updateContactByField(db, "firstsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($scope.contact.id), function () {
                      ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($scope.contact.id), function () {
                        ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt($scope.contact.id), function () {

                          LoadingService.dismiss();

                          LoadingService.confirm2($translate.instant('ContactEdit.SendSMS', {
                            phone: phoneNumber
                          }), $scope.contact.id, "ContactShowController");
                        })
                      })
                    })
                  /***********************\
                   SMS envoyé
                   \***********************/

                }, function(error) {
                  LoadingService.dismiss();
                  //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
                  LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "ContactShowController");
                });


            });
          }
        }else if (phone_1 != "") {
          if (validatePhone(phone_1) && phone_1.length > 5) {
            $rootScope.fromState = "app.buzcardSend";
            LoadingService.loading($translate.instant("Loading4"));
            BuzcardService.selectProfile(db, function(rs) {

              var phoneNumber = phone_1;
              var buzcardOnline = localStorage.getItem("act");
              var link = $translate.instant("SMS.Msg", {
                buzcardOnline: buzcardOnline,
                first_name: rs.rows.item(0).first_name
              });
              $cordovaSms.send(phoneNumber, link, {})
                .then(function() {
                  LoadingService.dismiss();
                  ContactsService.updateContactByField(db, "lastsendemail", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm'), parseInt($scope.contact.id), function () {
                    ContactsService.updateContactByField(db, "lastsendemailtimeStmp", new Date().getTime() / 1000, parseInt($scope.contact.id), function () {

                      LoadingService.confirm2($translate.instant('ContactEdit.SendSMS', {
                        phone: phoneNumber
                      }), $scope.contact.id, "ContactShowController");
                    })
                  })
                  /***********************\
                   SMS envoyé
                   \***********************/

                }, function(error) {
                  LoadingService.dismiss();
                  //  ionicToast.show("Votre SMS n'est pas envoyé", 'middle', true, 2000);
                  LoadingService.success($translate.instant('BuzcardSend.errorSendSMS'), "ContactShowController");
                });


            });
          }
        } else {
          LoadingService.error("Veuillez introduire Numéro de mobile ", "ContactEditController");
        }

      }

       $scope.dismiss = function(){
    	   LoadingService.dismiss();
       }
       $scope.ok2 = function(id) {
           LoadingService.dismiss();
           console.log('confirm2')
           $state.go('app.contactEdit', {
               id: id
           });

       };


        /**
         * buzward (partager la fiche)
         */
        $scope.buzwardContact = function(contact){
        	$rootScope.emailSend="";
        	$state.go('app.buzward', {id: contact.id });
        };

        /**
         * click on button supprimer: delete contact
         */
        $scope.deleteContact = function() {
          LoadingService.question($translate.instant('ContactEdit.Msg7'),
                  $stateParams.id, "ContactShowController");
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
          	if($rootScope.oldGroupName !=''){
            ContactsService.selectContactByGroupName(db,$rootScope.oldGroupName,function(result){
              //cas où l'ancien groupe sera vide
              if (result.rows.length ==0){
                ContactsService.deleteGroupByName(db,$rootScope.oldGroupName, function(result){
                  // console.log("group is empty : deleted");
                });
              }
            });
          	}
          });
            SynchroServices.insertRequest(db,"CONTACTDELETE",{id:$stateParams.id},function(){

              LoadingService.dismiss();
              MenuService.setLocalStorage('ReloadContactList',1);
              $state.go('app.contactList');
            });
        };

        /*******  Cut Link  ********/
        $scope.cutLink = function(contact){
          LoadingService.questionCutLink($translate.instant('ContactEdit.questionCutLink'),$stateParams.id, "ContactShowController");
        }

        $scope.yesCutLink = function(contact_id){

          SynchroServices.insertRequest(db, "CONTACTEDIT", {
              id: contact_id,
              contact: {vcardprofil : -1}
          }, function(result) {
             ContactsService.updateContactByField(db,"vcardprofil","-1", contact_id,function(){
            	 ContactsService.updateContactByField(db,"status", "not_selected", contact_id,function(){
                 MenuService.setLocalStorage('ReloadContactList', 1);
               LoadingService.dismiss()
               $state.go('app.contactList');
            	 });
             });
          });

        }
        /*******  Cut Link  ********/


        function validateEmail(email) {
          // var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
          var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          return re.test(email);
        }
        function validatePhone(phone){
            var re = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/ ;
            return re.test(phone);
          }

    }]);
