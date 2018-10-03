appContext.controller('BuzwardController', [ '$state','$scope','$ionicPlatform','$translate','ContactsService','$stateParams','BuzcardService','autoCompleteDomaines','$rootScope','BuzwardService','SynchroServices','ConnectionService','LoadingService','$cordovaFile','$filter','$interval',
function($state, $scope, $ionicPlatform, $translate,ContactsService,$stateParams, BuzcardService,autoCompleteDomaines,$rootScope,BuzwardService,SynchroServices,ConnectionService,LoadingService,$cordovaFile,$filter, $interval) {

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





	 ContactsService.getContactbyId(db, $stateParams.id, function(result) {
     	if(result.rows.length > 0){
     		$rootScope.contact = result.rows.item(0);
     		$rootScope.contact.last_name = removeSlashes(result.rows.item(0).last_name);
     		$rootScope.contact.first_name = removeSlashes(result.rows.item(0).first_name);
     	}
     	});
	 BuzcardService.selectProfile(db, function(result) {
         // TODO FIXME ng-repeat view buzcard
       	if(result.rows.length >0){
       		$rootScope.user = result.rows.item(0);
       	}
       	$scope.checkInfo = false;
       	$scope.messagebuzward=$translate.instant('Buzward.msg')+" "+ $filter('capitalize')($rootScope.contact.first_name)+" "+$filter('capitalize')($rootScope.contact.last_name)+".\n \n"+$rootScope.user.first_name+" "+$rootScope.user.last_name;
       	$scope.checkboxInfo = $translate.instant('Buzward.checkbox', {contactfirst: $filter('capitalize')($rootScope.contact.first_name), contactlast: $filter('capitalize')($rootScope.contact.last_name)});
       // 	console.log($scope.checkboxInfo);
       	autoCompleteDomaines.selectDomaine(db,function(data){
        if(!$rootScope.focusName){
        	document.getElementById("id_email").focus();
        }

        	$scope.domaines = data;
        	//document.getElementById("message").focus();
        });
	 });
      });
      $scope.checkjointcontact = function(joint){
    	  console.log(joint);
    	  if(joint){
    			$scope.messagebuzward=$translate.instant('Buzward.msgJoint')+".\n \n"+$rootScope.user.first_name+" "+$rootScope.user.last_name;
    		         
    		  
    	  }else{
    			$scope.messagebuzward=$translate.instant('Buzward.msg')+" "+ $filter('capitalize')($rootScope.contact.first_name)+" "+$filter('capitalize')($rootScope.contact.last_name)+".\n \n"+$rootScope.user.first_name+" "+$rootScope.user.last_name;
    		         
    	  }
      }

      /**
       * action de bouton envoyer la fiche
       */
      $scope.sendVcard = function(contact, email,messagebuzward, checkInfo,checkjoint2){

    	  var path="";


    	  var checkbox="on";
    	  if(checkInfo) checkbox ="on"; else checkbox="off";
    	  if(checkjoint2) checkbox2 ="on"; else checkbox2="off";
    	  if (typeof email === null || email == '' || email == undefined) {
    		  $rootScope.focusName = true;
              LoadingService.error($translate.instant('BuzcardSend.Msg1'), "BuzwardController");

          } else if (!validateEmail(email)) {
        	  $rootScope.focusName = true;
              LoadingService.error($translate.instant('BuzcardSend.Msg2'), "BuzwardController");
          } else {
        	  LoadingService.loading($translate.instant('BuzcardSend.LoadingSend'));
        	  var domaine = email.substring(email.indexOf('@')+1, email.length);
        	  autoCompleteDomaines.AddnewDomaine(db,domaine,function(){
        		  ////////////////////

        		  if(window.cordova){
          	    	if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
          	    	   path = cordova.file.applicationStorageDirectory;
          	    	 var isWindowsPhone = ionic.Platform.isWindowsPhone();
          	    	} else if (isWindowsPhone) {
          	           path = "/";
          	        } else {
          	          path = cordova.file.dataDirectory;
          			}
          	     // alert(path+" "+messagebuzward);
              	 $cordovaFile.writeFile(path, "buzwardtext.txt",messagebuzward , true)
                   .then(function (success) {
                     // success
                	   var object = {
             	                email: email.toLowerCase(),
             	                contactId: contact.id,
             	                checkBox: checkbox,
             	                checkBox2:checkbox2,
             	              filebuzward: addSlashes(messagebuzward)
             	            };

             	            SynchroServices.insertRequest(db, "BUZWARDSEND", object, function() {
             	            	//LoadingService.dismiss();
//             	            	 $rootScope.focusName = true;
//             	                if (!$rootScope.isBackgroudRuning) {
//             	                  //  $rootScope.isBackgroudRuning = true;
             	            	//ConnectionService.isConnected(db, function(){
             	            		//  LoadingService.dismiss();
             	            		  if(checkbox2 =="on"){
             	            			  $rootScope.focusName = true;
                     	       			  //$rootScope.isBackgroudRuning = false;
                     	       	 LoadingService.confirm($translate.instant('Buzward.checkbox2Msg', { email: email.toLowerCase(), lastnameContact: $filter('capitalize')(contact.last_name), firstnameContact: $filter('capitalize')(contact.first_name) }), contact.id, "BuzwardController");
		  
             	            		  }else{
             	       			  if(checkbox == "off"){
             	       				  $rootScope.focusName = true;
             	       			 // $rootScope.isBackgroudRuning = false;
             	       	 LoadingService.confirm($translate.instant('Buzward.MsgNotChecked', { email: email.toLowerCase(), lastnameContact: $filter('capitalize')(contact.last_name), firstnameContact: $filter('capitalize')(contact.first_name) }), contact.id, "BuzwardController");

             	       			  }else{
             	       				  $rootScope.focusName = true;
             	       			 // $rootScope.isBackgroudRuning = false;
             	       	 LoadingService.confirm($translate.instant('Buzward.MsgChecked', { email: email.toLowerCase(), lastnameContact: $filter('capitalize')(contact.last_name), firstnameContact: $filter('capitalize')(contact.first_name) }), contact.id, "BuzwardController");

             	       			  }
             	            	}
//             	            	 }, function(){
//             	          		  //offline
//             	          		
//             	            		 LoadingService.dismiss();
//             	            		  $rootScope.isBackgroudRuning = false;
//             	             // $state.go('app.contactShow', {id: contact.id });
//             	            	LoadingService.confirm($translate.instant('Buzward.Msgoffline', { email: email.toLowerCase()}), contact.id, "BuzwardController");
//             	            	 });
             	           
//             	            }else{
//             	            	 var _count = 0;
//                                 $rootScope.$watch("isBackgroudRuning", function(){
//                                    if(!$rootScope.isBackgroudRuning && _count == 0){
//                                      _count = 1 ;
//                                     // $rootScope.isBackgroudRuning = true;
//                                     // ConnectionService.isConnected(db,function(){
//                                    	  LoadingService.dismiss();
//                     	       			  if(checkbox == "off"){
//                     	       				  $rootScope.focusName = true;
//                     	       			//  $rootScope.isBackgroudRuning = false;
//                     	       	 LoadingService.confirm($translate.instant('Buzward.MsgNotChecked', { email: email.toLowerCase(), lastnameContact: $filter('capitalize')(contact.last_name), firstnameContact: $filter('capitalize')(contact.first_name) }), contact.id, "BuzwardController");
//
//                     	       			  }else{
//                     	       				  $rootScope.focusName = true;
//                     	       			//  $rootScope.isBackgroudRuning = false;
//                     	       	 LoadingService.confirm($translate.instant('Buzward.MsgChecked', { email: email.toLowerCase(), lastnameContact: $filter('capitalize')(contact.last_name), firstnameContact: $filter('capitalize')(contact.first_name) }), contact.id, "BuzwardController");
//
//                     	       			  }
////                                      },function(){
////
////                  	            		 LoadingService.dismiss();
////                  	            		  $rootScope.isBackgroudRuning = false;
////                  	             // $state.go('app.contactShow', {id: contact.id });
////                  	            	LoadingService.confirm($translate.instant('Buzward.Msgoffline', { email: email.toLowerCase()}), contact.id, "BuzwardController");
////                  	            	  
////                                      });
//                                    }else if($rootScope.isBackgroudRuning && _count == 0){
//                                    	 console.warn("isBackgroudRuning :: true");
//                                    }
//                                 },true);
             	       //     }
             	           });
    	  ////////////////////////
                   }, function (error) {
                       // error writefile
                  	console.log(JSON.stringify(error));
                     });
        		  }
        	  });

          }

      };

      $scope.ok = function(id){
    	  LoadingService.dismiss();
    	  $rootScope.focusName = false;
    	  $state.go('app.contactShow', {id: id });
      }
      $scope.dismiss = function() {
    
          LoadingService.dismiss();
      };
      function validateEmail(email) {
          var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
          return re.test(email);
      }
      /**
       * action bouton cancel
       */
      $scope.cancelsahre = function(){
    	
    	$state.go('app.contactShow', {id: $stateParams.id });
      };

    //on focus
      $scope.focus = function() {
      	$rootScope.focused = true;
      };
      //on blr
      $scope.blur = function() {
      	$rootScope.focused = false;
      };



}]);
