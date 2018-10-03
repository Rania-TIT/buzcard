appContext.controller("MultiController", [
		'$scope',
		'$translate',
		'MultiService',
		'LoadingService',
		'$ionicLoading',
		'$ionicPlatform',
		'BuzcardService',
		function($scope,$translate,MultiService,LoadingService,$ionicLoading,$ionicPlatform,BuzcardService) {


			var db = null;
			var act ="";
			$ionicPlatform.ready(function() {
//				act = localStorage.getItem("act").split("act=")[1];
//				$scope.act = act;
					/**
					 * create/open DB
					 */
					if (window.cordova) {
						db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
					} else {
							db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
					}


					/**
					*
					*/
					LoadingService.loading(   $translate.instant('Loading4')   );

						//get event list from server
					BuzcardService.getACT(function(act){
						
					
						MultiService.getEventList(act).then(function(response){
								if (response.data.Events.list) {

									if (typeof(response.data.Events.list) =="string") {
										var array = [response.data.Events.list]
											$scope.eventList = array;
											$ionicLoading.hide();
											$scope.showNoEvent = false;
											MultiService.insert(db,response.data.Events.list).then(function(){

												 },function(){

												 });

									}else if (typeof(response.data.Events.list) =="object") {
										var array = [];
										for (var i = 0; i < response.data.Events.list.length; i++) {
										array[i] =	response.data.Events.list[i]
										}
										$scope.eventList = array;
										$ionicLoading.hide();
										$scope.showNoEvent = false;
										MultiService.insertBulk(db,array).then(function(){

										 },function(){

										 });
									}

								}else{
									MultiService.findAll(db).then(function(rs){
										if (rs.rows.length > 0) {
											var array = [];
											for (var i = 0; i < rs.rows.length; i++) {
												array[i] = rs.rows.item(i);
											}
											 $scope.eventList = array;
										}else{
											$ionicLoading.hide()
											$scope.showNoEvent = true;
										}
									 },function(){

									 });

								}
								 },function(){
									 MultiService.findAll(db).then(function(rs){
										 if (rs.rows.length > 0) {
											 var array = [];
											 for (var i = 0; i < rs.rows.length; i++) {
												 array[i] = rs.rows.item(i).name;
											 }
										 $scope.eventList = array;
										 $ionicLoading.hide();
										 $scope.showNoEvent = false;
										 }else{
											 $ionicLoading.hide()
											 $scope.showNoEvent = true;
										 }
										},function(){

										});
								 });
					});


			});

			 $scope.dismiss = function(){
				 $ionicLoading.hide()
			 }

			 $scope.surf = function(eventName){
				 BuzcardService.getACT(function(act){
				 var link = "https://www.buzcard.com/EventParticipants_mobile.aspx?request=event&eventname="+eventName+"&act="+act;
				 window.open(link,"_system");
				 });

			 }
    }]);
// yoram tZJiqXMPtxrqHFGL1XqU9A==
//me  nv2P7D3FhLM7VU5/mvp71A==
// silvio oqykfkRfe5VQW8HkeiQOXg==
