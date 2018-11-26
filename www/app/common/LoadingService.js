appContext.factory("LoadingService", ['$ionicLoading','$translate','$rootScope', function($ionicLoading,$translate,$rootScope) {

  var error = function (msg,controller) {

    $ionicLoading.show({
      template: '<div class="window error" ng-controller="'+controller+'"><p class="incorrect_informations_text">'+msg+'.</p><div class="container-button"><button class="ok_text" ng-click="dismiss()">ok</button></div></div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  };
  var errorEmail = function(msg, controller){
	  $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'.</p><div class="container-button"><button class="ok_text" ng-click="dismissEmailExiste()">ok</button></div><div><a class="no_link" ng-click="no()">'+$translate.instant('QRep.NO')+'</a></div> </div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
  };
  var errorWithTreatment = function (msg,controller,id) {

	    $ionicLoading.show({
	      template: '<div class="window error" ng-controller="'+controller+'"><p class="incorrect_informations_text">'+msg+'.</p><div class="container-button"><button class="ok_text" ng-click="treatment('+id+')">ok</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });

	  };

  var success = function(msg,controller) {

    $ionicLoading.show({
      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="ok_text" ng-click="dismiss()">ok</button></div></div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  };
  var infobuz = function(msg, controller){

	    $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="yes_text" ng-click="ok()">OK</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
  };
  var infoWithCallBack = function(msg,controller,email,selectLang,checkFollower,dateRDV,meeting_point,lat, long) {

	  $ionicLoading.show({
		  template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="ok_text" ng-click="dismissInfoCallBack(&#39;'+ email+'&#39;,&#39;'+selectLang+'&#39;,&#39;'+checkFollower+'&#39;,&#39;'+dateRDV+'&#39;,&#39;'+meeting_point+'&#39;,&#39;'+lat+'&#39;,&#39;'+long+'&#39;)">ok</button></div></div>',
		  animation: 'fade-in',
		  showBackdrop: true,
	  });

  };
  var info = function(msg,controller) {

	  $ionicLoading.show({
		  template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="ok_text" ng-click="dismissInfo()">ok</button></div></div>',
		  animation: 'fade-in',
		  showBackdrop: true,
	  });

  };
  
  var infoFirstopen = function(msg,controller) {

	  $ionicLoading.show({
		  template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="ok_text" ng-click="Info()">ok</button></div></div>',
		  animation: 'fade-in',
		  showBackdrop: true,
	  });

  };

  var question = function(msg,params, controller) {

	    $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button" ><button class="no_text" ng-click="no()">'+$translate.instant('Loading.NO')+'</button><button class="yes_text" ng-click="yes('+params+')">'+$translate.instant('Loading.YES')+'</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });

	  };
  var questionCutLink = function(msg,params, controller) {

	    $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button" ><button class="no_text" ng-click="no()">'+$translate.instant('Loading.NO')+'</button><button class="yes_text" ng-click="yesCutLink('+params+')">'+$translate.instant('Loading.YES')+'</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });

	  };
	  var QuestionAUtorisation = function(msg,params, controller) {

		    $ionicLoading.show({
		      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="no_text" ng-click="noAutorisation('+params+')">'+$translate.instant('Loading.NO')+'</button><button class="yes_text" ng-click="yesAutorisation('+params+')">'+$translate.instant('Loading.YES')+'</button></div></div>',
		      animation: 'fade-in',
		      showBackdrop: true,
		    });

		  };
		  var QuestionAUtorisationCamera = function(msg, controller) {

			    $ionicLoading.show({
			      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="no_text" ng-click="noAutorisationCamera()">'+$translate.instant('Loading.NO')+'</button><button class="yes_text" ng-click="yesAutorisationCamera()">'+$translate.instant('Loading.YES')+'</button></div></div>',
			      animation: 'fade-in',
			      showBackdrop: true,
			    });

			  };

  var QuestionAUtorisationLocation = function(msg, controller) {

    $ionicLoading.show({
      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="no_text" ng-click="noAutorisation()">'+$translate.instant('Loading.NO')+'</button><button class="yes_text" ng-click="yesAutorisation()">'+$translate.instant('Loading.YES')+'</button></div></div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  };
		var	  QuestionAUtorisationContact= function(msg, controller) {

		    $ionicLoading.show({
		      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="no_text" ng-click="noAutorisationContact()">'+$translate.instant('Loading.NO')+'</button><button class="yes_text" ng-click="yesAutorisationContact()">'+$translate.instant('Loading.YES')+'</button></div></div>',
		      animation: 'fade-in',
		      showBackdrop: true,
		    });

		  };


  var loading = function(msg) {
    $ionicLoading.show({
      template: '<p class="item-icon-left" id="lodingText" style="color: #000; background-color: #FFFFFF; margin: auto; padding: 12px 10px 0px 10px; display: block; border-radius: 0px;">'+msg+'<br><img src="img/loading.gif"></p>',
      animation: 'fade-in',
      showBackdrop: true,
    });
  };

  var dismiss = function() {
    $ionicLoading.hide();
    $rootScope.isSynchronizing = false;
  };

  var confirm = function(msg,params, controller) {

    $ionicLoading.show({
      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="yes_text" ng-click="ok('+params+')">OK</button></div></div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  };
  var confirmAfterSendMyContactInfo = function(msg,params, controller) {

    $ionicLoading.show({
      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="yes_text" ng-click="sendContactInfook('+params+')">OK</button></div></div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  };
  var confirmDelete = function(msg, controller){
	  $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="yes_text" ng-click="okDelete()">OK</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
  }

  var confirm2 = function(msg,params, controller) {

	    $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="yes_text" ng-click="ok2('+params+')">OK</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });

	  };

  var questionSynchroDelta = function(msg, controller) {
	  
	    $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="no_text" ng-click="no()">'+$translate.instant('Loading.NO')+'</button><button class="yes_text" ng-click="yes()">'+$translate.instant('Loading.YES')+'</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });

	  };
	  var questionSynchro = function(msg, controller) {

		    $ionicLoading.show({
		      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="yes_text" ng-click="yes()">'+$translate.instant('Loading.YES2')+'</button><a class="no_link" ng-click="no()">'+$translate.instant('Loading.NO2')+'</a></div></div>',
		      animation: 'fade-in',
		      showBackdrop: true,
		    });

		  };

  var loadingWithPourcentage = function(msg){
	  $ionicLoading.show({
	      template: '<p class="item-icon-left" id="lodingText" style="color: #000; background-color: #FFFFFF; margin: auto; padding: 12px 10px 0px 10px; display: block; border-radius: 0px;">'+msg+'&nbsp{{pourcentage}}<br><img src="img/loading.gif"></p>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
  };
  var QuestionChangeLangue = function(msg,langue, controller){

	  $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><img class="img-drapeau" src="img/France.png" ng-click="changeLangue(\'fr\')" /> <img class="img-drapeau" src="img/USA.png" ng-click="changeLangue(\'en\')" /><a class="no_link" ng-click="dismiss()">'+$translate.instant('ChangeLangue.Cancel')+'</a></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
  }


  var successWithCallBack = function(msg,controller) {

	    $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="ok_text" ng-click="confirmSuccess()">ok</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });


  };

  var popUpQrcode = function(msg,params, controller) {

	    $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="no_text qrvoirfiche" ng-click="clickButtonFiche('+params+')">'+$translate.instant('Loading.ButtonFiche')+'</button></div><div><button class="yes_text qrpopup" ng-click="clickButtonSend('+params+')">'+$translate.instant('Loading.ButtonSend')+'</button></div><a class="no_link" ng-click="dismiss()">'+$translate.instant('popUpQR.retour')+'</a></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });

	  };
  var passwordPopup = function(controller) {

	    $ionicLoading.show({
	      template:
        '<div class="window password-popup" ng-controller="'+controller+'">'+
          '<div>'+
            '<p>'+
              $translate.instant('Urgency.enterPassword')+
            '</p>'+
            '<div class="inline-display">'+
              '<input class="input-popup-password" id="password_" style="border-radius: 5px;" type="password" autofocus ng-focus="focus()" ng-blur="blur()" ng-model="passForVerification" />'+
              '<button class="btn-popup-password"  ng-click="checkPassword(passForVerification)">'+$translate.instant('Urgency.ok')+'</button>'+
            '</div>'+
            '<div style="height: 42px;margin-top: 10px;line-height: 24px;">'+
            '<a class="link-popup-password"  ng-click="hideLoading()">'+$translate.instant('Urgency.cancel')+'</a>'+
            '<br><a class="blink_me" style="text-decoration:none" href="#" ng-if="showWrongPassword">'+$translate.instant('Urgency.wrongPassword')+'</a>'+
          '</div>'+
        '</div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
	   

	  };
  var confirmOnglet2 = function(msg, controller){
	  $ionicLoading.show({
	      template:
        '<div class="window " ng-controller="'+controller+'">'+
          '<div>'+
            '<p>'+msg+
            '</p>'+
            '<div class="container-button"><input checked="checked" style="margin-right: 8px;" type="checkbox"  ng-model="isChecked" />'+$translate.instant('UrgencyEdit.checkAccord')+'</div>'+
              '<div><button class="btn-popup-onglet2"  ng-click="confirmRequest(isChecked)">'+$translate.instant('Urgency.ok')+'</button></div>'+
            '</div>'+
        '</div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
  }
// var callOrSms = function(btn1, btn2, controller){
//	  $ionicLoading.show({
//		  template: '<div class="windows" ng-controller="'+controller+'"><div><button class="yes_text" ng-click="call">'+btn1+'</button></div><div style="padding-top:10px;"><a class="yes_text" ng-click="call">'+btn2+'</a></div></div>',
//	      animation: 'fade-in',
//	      showBackdrop: true,
//	  });
//  };
  var popUpSynchroContactDevice = function(msg,controller){
	 $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="no_text" ng-click="dismissContactDevice()">'+$translate.instant('popUpContact.ButtonNo')+'</button><button class="yes_text" ng-click="synchroContactDevice()">'+$translate.instant('Loading.ButtonYes')+'</button></div></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });
 	} ;
 	var questionRepertoire = function(msg, controller){
	  $ionicLoading.show({
	      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button class="yes_text" ng-click="yes()">'+$translate.instant('QRep.YES')+'</button></div><a class="no_link" ng-click="no()">'+$translate.instant('QRep.NO')+'</a></div>',
	      animation: 'fade-in',
	      showBackdrop: true,
	    });

 	};
 	 var deconectionPopup = function(msg,btn1, btn2, controller) {

      $ionicLoading.show({
        template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button"><button style="font-size:14px" class="yes_text" ng-click="yesDec()">'+btn1+'</button></div><a class="no_link" ng-click="dismiss()">'+btn2+'</a></div></div>',
        animation: 'fade-in',
        showBackdrop: true,
      });

    };
 	var popUpLuiRenvoyer = function(controller){

 		 $ionicLoading.show({
 		      template:
 	        '<div class="window " ng-controller="'+controller+'">'+
 	          '<div>'+
 	            '<div class="container-button"><button class="yes_text" style="margin:10px" ng-click="sendSMS()">'+$translate.instant('msgPopUpSend.button1')+
 	            '</button>'+
 	            '<button class="yes_text" style="margin:10px"  ng-click="sendEMAIL()">'+$translate.instant('msgPopUpSend.button2')+
 	            '</button>'+
 	              '<a class="no_link" ng-click="no()">'+$translate.instant('QRep.NO')+'</a>'+
 	            '</div></div>'+
 	        '</div>',
 		      animation: 'fade-in',
 		      showBackdrop: true,
 		    });
 	};
 	var popUpClickTel = function(tel, controller){
 		 $ionicLoading.show({
		      template:
	        '<div class="window " ng-controller="'+controller+'">'+
	          '<div>'+
	            '<div><a class="no_text" style="text-decoration:none" href="tel:'+tel+'">'+$translate.instant('popUpClickTel.Call')+
	            '</a></div>'+
	            '<div class="container-button"><button class="yes_text" ng-click="clicksendSMS('+tel+')">'+$translate.instant('popUpClickTel.SMS')+
	            '</button>'+
	              '<a class="no_link" ng-click="no()">'+$translate.instant('QRep.NO')+'</a>'+
	            '</div></div>'+
	        '</div>',
		      animation: 'fade-in',
		      showBackdrop: true,
		    });

 	}
 	var popupBuz = function(msg,act,controller){
 		 $ionicLoading.show({
 		      template: '<div class="window" ng-controller="'+controller+'"><p class="activated_KDO_text">'+msg+'</p><div class="container-button">'+
 		      '<button class="no_text qrvoirfiche" ng-click="sendwithACT(\''+act+'\')">'+$translate.instant('popupBuz.ButtonSend')+'</button><br/><br/>'+
 		      '<button class="ok_text" ng-click="dismiss()">ok</button></div></div>',
 		      animation: 'fade-in',
 		      showBackdrop: true,
 		    });

 	}
  var popupClickLuiEnvoyerMaFiche = function(email, phone_1, phone_2,controller){
    $ionicLoading.show({
      template:
        '<div class="window " ng-controller="'+controller+'">'+
        '<div>'+
        '<div style="margin: 5px auto; display: block; position: relative; width: 110px"><a class="no_text" style="text-decoration:none; display: block;margin-right: 0" ng-click="sendCardViaEmail(\''+email+'\')">'+$translate.instant('popupClickLuiEnvoyerMaFiche.Email')+
        '</a></div>'+
        '<div  style="margin: 5px auto; display: block; position: relative; width: 110px;margin-top:28px;"><a class="yes_text" style="display: block" ng-click="sendCardViaSMS(\''+phone_1+'\',\''+phone_2+'\')">'+$translate.instant('popupClickLuiEnvoyerMaFiche.SMS')+
        '</a></div>'+
        '<a class="no_link" ng-click="no()">'+$translate.instant('QRep.NO')+'</a>'+
        '</div>'+
        '</div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  }
  var confirmSearch = function(msg, act, latitude, longitude, controller) {

    $ionicLoading.show({
      template: '<div class="window" ng-controller="'+controller+'">' +
        '<p class="activated_KDO_text">'+msg+'</p>' +
        '<div class="container-button">' +
        '<button style="font-size:14px" class="yes_text" ng-click="confirmSearchYes(\''+act+'\', \''+latitude+'\', \''+longitude+'\')">'+$translate.instant('alert.confirm')+'</button>' +
        '</div>' +
        '<a class="no_link" ng-click="dismiss()">'+$translate.instant('urgency.cancel')+'</a></div></div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  };
  var confirmAlert = function(msg, act, latitude, longitude, controller) {

    $ionicLoading.show({
      template: '<div class="window" ng-controller="'+controller+'">' +
        '<p class="activated_KDO_text">'+msg+'</p>' +
        '<div class="container-button">' +
        '<button style="font-size:14px" class="yes_text" ng-click="confirmAlertYes(\''+act+'\', \''+latitude+'\', \''+longitude+'\')">'+$translate.instant('alert.confirm')+'</button>' +
        '</div>' +
        '<a class="no_link" ng-click="dismiss()">'+$translate.instant('urgency.cancel')+'</a></div></div>',
      animation: 'fade-in',
      showBackdrop: true,
    });

  };

  return {
    error : error,
    success : success,
    loading : loading,
    dismiss : dismiss,
    question: question,
    confirm : confirm,
    questionSynchro:questionSynchro,
    loadingWithPourcentage :loadingWithPourcentage,
    errorWithTreatment : errorWithTreatment,
    infoWithCallBack : infoWithCallBack,
    info : info,
    QuestionChangeLangue:QuestionChangeLangue,
    successWithCallBack : successWithCallBack,
    confirm2 : confirm2,
    popUpQrcode : popUpQrcode,
    passwordPopup : passwordPopup,
    popUpSynchroContactDevice:popUpSynchroContactDevice,
    questionRepertoire:questionRepertoire,
    confirmOnglet2:confirmOnglet2,
    errorEmail:errorEmail,
    deconectionPopup : deconectionPopup,
//    callOrSms : callOrSms,
    popUpLuiRenvoyer:popUpLuiRenvoyer,
    popUpClickTel:popUpClickTel,
    confirmDelete:confirmDelete,
    infobuz: infobuz,
    QuestionAUtorisation:QuestionAUtorisation,
    QuestionAUtorisationCamera:QuestionAUtorisationCamera,
    QuestionAUtorisationContact:QuestionAUtorisationContact,
    questionCutLink : questionCutLink,
    questionSynchroDelta:questionSynchroDelta,
    infoFirstopen:infoFirstopen,
    popupBuz:popupBuz,
    popupClickLuiEnvoyerMaFiche:popupClickLuiEnvoyerMaFiche,
    confirmSearch:confirmSearch,
    QuestionAUtorisationLocation:QuestionAUtorisationLocation,
    confirmAlert:confirmAlert
  };
}]);
