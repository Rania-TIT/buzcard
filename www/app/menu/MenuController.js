appContext.controller("MenuController", ['$timeout', '$ionicViewSwitcher','$cordovaStatusbar',
'$ionicSideMenuDelegate','$scope', '$state', '$ionicHistory', 'LoginService', 'LoadingService',
'MenuService', '$rootScope', '$cordovaSQLite', '$ionicPlatform', 'ConnectionService', 'BuzcardService',
 'ContactsService','$compile','$translate','$cordovaContacts','$cordovaFile','$cordovaCalendar'
 ,'MultiService','SynchroServices','$interval',
    function($timeout,$ionicViewSwitcher,$cordovaStatusbar,$ionicSideMenuDelegate,$scope, $state,
      $ionicHistory, LoginService, LoadingService, MenuService, $rootScope, $cordovaSQLite,
      $ionicPlatform, ConnectionService, BuzcardService, ContactsService,$compile,
      $translate,$cordovaContacts,$cordovaFile,$cordovaCalendar,MultiService,SynchroServices,$interval) {
	$rootScope.isCusto = false;
	$rootScope.focused = false;
  $rootScope.emptyQueue = true;
  $rootScope.countSynchroDelta = 0;
	$rootScope.imgCusto ="img/buzcard-online.png";
	var db = null;


        $ionicPlatform.ready(function() {

        	if(window.cordova)
    			$cordovaStatusbar.overlaysWebView(false);



            /**
             * create/open DB
             */
            if (window.cordova) {
            	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
            } else {
                db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
            }


            MenuService.setLocalStorage("currentMode", "ONLINE");
            if(MenuService.getLocalStorage("ArrPhoto"))
            $rootScope.ArrPhoto =  MenuService.getLocalStorage("ArrPhoto");
            $scope.currentMode = "ONLINE";
            $scope.switchToMode = "Mode OFF-line";

            SynchroServices.selectAllRequest(db,function(rs){
							if (rs.rows.length > 0) {
                $rootScope.emptyQueue = false;
							}else {
                $rootScope.emptyQueue = true;

							}
						});

        });


        //pour faire la transition entre les pages
        $scope.goTo = function(stateT) {
        var Pages = {
        	"app.loading" : 1 ,
        	"app.login" : 2 ,
        	"app.synchro" : 3 ,
          "app.urgencyIndex" : 4,
          "app.qrcode" : 5 ,
        	"app.buzcard" : 6 ,
        	"app.buzcardEdit" : 6 ,
        	"app.buzcardSend" : 6 ,
        	"app.contactList" : 7 ,
        	"app.contactEdit" : 7 ,
        	"app.contactShow" : 7 ,
        	// "app.commandes" : 7
        };
        to = Pages[stateT] ;
        from = Pages[$ionicHistory.currentStateName()] ;
        if( to > from )
        	$ionicViewSwitcher.nextDirection("forward");
        else
        	$ionicViewSwitcher.nextDirection("back");
/*
		forward
		back
		enter
		exit
		swap
 */
            $state.go(stateT);
        };
        $scope.gotoConfidential = function() {
//            $location.url("/app/creditParrainage");
            $state.go("app.confidential");
        };

        $scope.creditdeparrainage = function() {
//            $location.url("/app/creditParrainage");
            $state.go("app.creditParrainage");
        };

        $scope.getUrgency = function(){

        	 $state.go("app.urgency");
        };
        $scope.ResetPassword = function(){
        	 LoginService.selectCredentials(db, function(result) {
        	window.open('https://www.buzcard.com/recovery.aspx?email='+result.rows.item(0).email, '_system', 'location=yes');
        	 });
        };
        //deconnection
        $scope.deconnexion = function() {
            // console.log('deconnexion');
            LoadingService.deconectionPopup($translate.instant("Menu.deconnection"),$translate.instant("Menu.btnOK") , $translate.instant("Menu.btnCancel"), "MenuController")
        };

        $scope.synchronisePhoneCalendar = function() {
        	LoadingService.loading($translate.instant('LoadingSynchroCalender'));
        	var selectRDV = "SELECT * FROM contact where rendez_vous != '' and rendez_vous != 'NaN' and synchro !='true'";
            // console.error(selectRDV);
            try {
              $cordovaSQLite.execute(db, selectRDV).then(function(result) {

              if(result.rows.length ==0){
            	  LoadingService.dismiss();
              }else{
            	  ContactsService.createEventCalender(db,result, 0, function(i){

                 	 LoadingService.dismiss();
                  });
              }

              }, function(reason) {
                // console.log(reason);
              }, function(value) {
                // console.warn(value);
              });
            } catch (e) {
              // TODO: FIXME handle exception
              return 0;
            }

        };

        $scope.toggleMode = function(currentMode) {
            if (currentMode == "ONLINE") {
                MenuService.setLocalStorage("currentMode", "OFFLINE");
                $scope.switchToMode = "Mode ON-line";
                $scope.currentMode = "OFFLINE";
                // console.info($scope.currentMode);
                //effacer le cache lors de changement du mode (ONLINE/OFFLINE)
            } else {
                MenuService.setLocalStorage("currentMode", "ONLINE");
                $scope.switchToMode = "Mode OFF-line";
                $scope.currentMode = "ONLINE";
                // console.log($scope.currentMode);
                //effacer le cache lors de changement du mode (ONLINE/OFFLINE)
            }
        };
        $scope.getchangeLangue = function(){
        	LoadingService.QuestionChangeLangue($translate.instant('LangueTxt'),$translate.use(), 'MenuController');

        };

        $scope.SynchroniseContact = function(){
        	cordova.plugins.diagnostic.requestContactsAuthorization(function(status){
        	    if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){


        	 LoadingService.questionRepertoire($translate.instant('Menu.MsgRepertoire'),
             "RepertoireController");
        	    }else{

        	    	LoadingService.dismiss();
        	    //	if($rootScope.requestAutoriseContact>1){
        	    		 LoadingService.QuestionAUtorisationContact($translate.instant('QuestionAutoriserContact'), 'ContactEditController');
        	    		//$rootScope.requestAutoriseContact++;
        	    //	}

        	    	// alert("App is " + (authorized ? "authorized" : "denied") + " access to contacts");
                  	// LoadingService.success("App is denied  access to contacts", 'RepertoireController');
        	    }
        	}, function(error){
        	    console.error("The following error occurred: "+error);
        	});

        };

        $scope.changeLangue = function(langue){
        	console.log(langue);
        	$translate.use(langue);
        	//alert($state.current.name);
        	//$state.go($state.current.name,{}, {reload : true});
        	if($state.current.name == 'app.buzcardSend'){
        		$state.go($state.current.name,{}, {reload : true});
        		LoadingService.dismiss();
        	}else{
        		$state.go($state.current.name,{}, {reload : true});
        		LoadingService.dismiss();
        	}

        }
        // to dismiss the PopUp
        $scope.dismiss = function() {
            LoadingService.dismiss();
        };
        $scope.synchronizeUpdate = function(){
        	 if (!$rootScope.isBackgroudRuning) {
                 LoadingService.questionSynchro($translate.instant('MsgSynchro'),
                 "UpdateController");
               }else {
                 console.warn(" Manual sync Skipped ...........");
               }
        };
        $scope.synchronize = function() {
        	console.log('synchronise');
          if (!$rootScope.isBackgroudRuning) {
            LoadingService.questionSynchro($translate.instant('MsgSynchro'),
            "SynchroMenuController");
          }else {
            console.warn(" Manual sync Skipped ...........");
          }

        };

         $scope.yesDec = function() {
             $interval.cancel($rootScope.backgroundModeTimer);
             $interval.cancel($rootScope.timer);
             $interval.cancel($rootScope.forgroundMode);
             $rootScope.backgroundModeTimer =undefined;
             $rootScope.forgroundMode =undefined;
             $rootScope.timer = undefined

           SynchroServices.emptyRequestTable(db, function(result) {
               LoginService.deleteCredentials(db, function(result) {
                   MultiService.emptyMultiTable(db).then(function() {
                       BuzcardService.emptyEmailTradTable(db).then(function() {

                               $timeout(function() {
                                   $ionicHistory.clearCache();
                                   $ionicHistory.clearHistory();
                               }, 1500)
                               $ionicHistory.clearCache();
                               window.localStorage.clear();
                               $rootScope.isCusto = false;
                               $rootScope.decon = true;
                               $scope.password = null;
                               $scope.email = null;
                               $rootScope.isDelta = false;
                               $rootScope.countSynchroDelta = 0;
                               $rootScope.emptyQueue = true;
                              // $interval.cancel($rootScope.timer);
                               $rootScope.timer = undefined;
                               $interval.cancel($rootScope.backgroundModeTimer);
                               $interval.cancel($rootScope.timer);
                               $interval.cancel($rootScope.forgroundMode);
                               $rootScope.backgroundModeTimer =undefined;
                               $rootScope.forgroundMode =undefined;
                               $state.go("app.login", {}, {
                                   reload: true
                               });
                               LoadingService.dismiss();

                       }, function() {
                           console.warn("error");
                           LoadingService.error($translate.instant('DeconMsg'), "MenuController");
                       });
                   });
               }, function() {

               });
           }, function() {

           });
       }
}]);
