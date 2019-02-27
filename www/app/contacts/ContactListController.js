appContext.controller("ContactListController", [
    '$scope',
    'ContactsService',
    '$ionicPlatform',
    '$cordovaSQLite',
    'LoadingService',
    '$rootScope',
    'cameraService',
    '$ionicHistory',
    'MenuService',
    '$ionicScrollDelegate',
    '$state',
    '$location',
    '$ionicPosition',
    '$timeout',
    '$translate',
    'ConnectionService','$filter','LoginService','SynchroServices',
    function($scope, ContactsService, $ionicPlatform, $cordovaSQLite, LoadingService, $rootScope, cameraService, $ionicHistory, MenuService,
       $ionicScrollDelegate,$state,$location,$ionicPosition,$timeout,$translate,ConnectionService,$filter, LoginService,SynchroServices) {

        var db = null;
        $rootScope.needPassword = true;
		$rootScope.showWrongPassword=false;

        $ionicPlatform.ready(function() {
            /**
             * create/open DB
             */
            if (window.cordova) {
            	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
            } else {
                db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
            }
            $scope.shownGroup = null;
            MenuService.setLocalStorage("firstLoad",0);


        });
        $scope.$on('$ionicView.beforeEnter', function( scopes, states ) {

    		init();
        });

         function init(){
        	 if ( MenuService.getLocalStorage("firstLoad") == 0 || MenuService.getLocalStorage("firstLoad") == false || ( MenuService.getLocalStorage("ReloadContactList") != 0 || MenuService.getLocalStorage("ReloadContactList") != false ) ){
        		$scope.creditParrainage = MenuService.getLocalStorage("credit");
	            // initialize

	           $scope.groups = [];
	            $scope.tousContact = [
	                                  {
	                                	  name: "followers",
	                                	  id: 1,
	              	                    	items: [],
	              	                    	count: 0,
	              	                    	page: 1,
	              	                    	totalPages: 1,
	              	                    	empty: true,
	                                  },
	                                  {
	                                      name: "nofollowers",
	                                      id: 2,
	              	                    items: [],
	              	                    count: 0,
	              	                    page: 1,
	              	                    totalPages: 1,
	              	                    empty: true,
	                                  }
	                                ];
	            $scope.nogroups={
		                items: [],
		                count: 0,
  	                    page: 1,
		                totalPages: 1,
		                empty: true,
		            };
	            $scope.noemails={
	            		 items: [],
			                count: 0,
	  	                    page: 1,
			                totalPages: 1,
			                empty: true,
		            };
	            $scope.doublons={
	            		  items: [],
			                count: 0,
	  	                    page: 1,
			                totalPages: 1,
			                empty: true,
		            };
	            $scope.buzward={
	            		  items: [],
			                count: 0,
	  	                    page: 1,
			                totalPages: 1,
			                empty: true,
		            };
	            $scope.filleuls={
	            		  items: [],
			                count: 0,
	  	                    page: 1,
			                totalPages: 1,
			                empty: true,
		            };
	            $scope.recontact = {
	                items: [],
	                count: 0,
	                empty: true,
	            };
	            var searchename= $translate.instant('ContactList.SearchName')
	            $scope.search = {
	                name: searchename,
	                items: [],
	                empty: true,
	            };

	            $scope.show = false;
	            $scope.shownGroup = 'tousContact';
	            MenuService.setLocalStorage("firstLoad",1)
	        	MenuService.setLocalStorage("ReloadContactList",0);
	            var isWindowsPhone = ionic.Platform.isWindowsPhone();
	            if (window.cordova) {
	                if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
	                    $rootScope.path = cordova.file.applicationStorageDirectory;
	                }else if (isWindowsPhone) {
	                	$rootScope.path = "//";
		              } else {
		            	  $rootScope.path = cordova.file.dataDirectory;
	                }
	            }
	            $scope.countAllContact =0;
	            ContactsService.getCountOfAllContact(db, function(result) {
	//select followers
	            	 if (result.rows.length > 0) {
                         for (var key in result.rows.item(0)) {

                        	 $scope.countAllContact = result.rows.item(0)[key];

                         }
                     } else {
                         $scope.countAllContact = 0;

                     }
	            ContactsService.selectFollowers(db, 1, function(result) {
                    $scope.tousContact[0].items = [];
                    if (result.rows.length > 0) {
                        $scope.tousContact[0].empty = false;
                        for (var int = 0; int < result.rows.length; int++) {
                           // $scope.tabs[1].items.push(result.rows.item(int));
                        	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                    var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                    result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                        	 }
                        	$scope.tousContact[0].items.push(result.rows.item(int));
                        }
                    } else {
                        //$scope.tousContact[0].items.push({});
                        $scope.tousContact[0].empty = true;
                    }
                    ContactsService.getCountOfFollowers(db, function(result) {
                        var fowllowersCount = 0;
                        if (result.rows.length > 0) {
                            for (var key in result.rows.item(0)) {
                                fowllowersCount = result.rows.item(0)[key];
                                $scope.tousContact[0].count = result.rows.item(0)[key];
                                $scope.tousContact[0].totalPages = guessPagesNumber($scope.tousContact[0].count);
                               // console.log( $scope.tousContact[0].totalPages );
                            }
                        } else {
                            $scope.tousContact[0].count = 0;
                            $scope.tousContact[0].empty = true;
                        }



                        ContactsService.selectNonFollowers(db, 1, function(result) {
                            $scope.tousContact[1].items = [];
                            if (result.rows.length > 0) {
                                $scope.tousContact[1].empty = false;
                                for (var int = 0; int < result.rows.length; int++) {
                                   // $scope.tabs[1].items.push(result.rows.item(int));
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                            var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                            result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                	 }
                                	$scope.tousContact[1].items.push(result.rows.item(int));
                                }
                            } else {
                               // $scope.tousContact[1].items.push({});
                                $scope.tousContact[1].empty = true;
                            }

                            ContactsService.getCountOfNonFollowers(db, function(result) {
                                var NonfowllowersCount = 0;
                                if (result.rows.length > 0) {
                                    for (var key in result.rows.item(0)) {
                                    	NonfowllowersCount = result.rows.item(0)[key];
                                        $scope.tousContact[1].count = result.rows.item(0)[key];
                                        $scope.tousContact[1].totalPages = guessPagesNumber($scope.tousContact[1].count);
                                      //  console.log( $scope.tousContact[0].totalPages );
                                    }
                                } else {
                                    $scope.tousContact[1].count = 0;
                                    $scope.tousContact[1].empty = true;
                                }


                                ContactsService.selectAllGroup(db, function(result) {
                                    $scope.groupNumber = result.rows.length;
                                    if (result.rows.length > 0) {
                                        for (var int = 0; int < result.rows.length; int++) {
                                            $scope.groups[int] = {
                                                name: result.rows.item(int).name,
                                                items: [],
                                                count: 0,
                                            };
                                        }
                                        ContactsService.getAllContactsByGroup(db, $scope, $scope.groups.length, function() {
                                        	//console.log("-------"+$scope.groups.length);
                                        	for (var int = 0; int < $scope.groups.length; int++) {
                                        		$scope.groups[int].count = $scope.groups[int].nbr;
                                        		$scope.groups[int].nbrpage = guessPagesNumber($scope.groups[int].nbr);
                                        		$scope.groups[int].page = 1;

//                                        		$scope.groups[int].nbr = result.rows.item(int).nbr;
                                        		//ssss
                                        	}
                                        });
                                    } else {
                                    	// console.log("emptyyy....");
                                    }
                                })
                                //get à recontacter list
                                ContactsService.selectRecontact(db, function(result) {
                                    $scope.recontact.items = [];
                                    if (result.rows.length > 0) {
                                        $scope.recontact.empty = false;
                                        $scope.recontact.count = result.rows.length;
                                        for (var int = 0; int < result.rows.length; int++) {
                                        	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                                 var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                                 result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                                     	 }
                                        	$scope.recontact.items.push(result.rows.item(int));
                                        }
                                    } else {
                                        $scope.recontact.empty = true;
                                    }
                                });

                                ContactsService.selectSansGroups(db, 1, function(result) {
                                    $scope.nogroups.items = [];
                                    if (result.rows.length > 0) {
                                        $scope.nogroups.empty = false;
                                        for (var int = 0; int < result.rows.length; int++) {
                                           // $scope.tabs[1].items.push(result.rows.item(int));
                                        	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                    var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                    result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                        	 }
                                        	$scope.nogroups.items.push(result.rows.item(int));
                                        }
                                    } else {
                                        $scope.nogroups.items.push({});
                                        $scope.nogroups.empty = true;
                                    }

                                    ContactsService.getCountOfContactSansGroups(db, function(result) {
                                        var CountSansGrp = 0;
                                        if (result.rows.length > 0) {
                                            for (var key in result.rows.item(0)) {
                                            	CountSansGrp = result.rows.item(0)[key];
                                                $scope.nogroups.count = result.rows.item(0)[key];
                                                $scope.nogroups.totalPages = guessPagesNumber($scope.nogroups.count);
                                               // console.log( $scope.nogroups.totalPages );
                                            }
                                        } else {
                                            $scope.nogroups.count = 0;
                                            $scope.nogroups.empty = true;
                                        }
                                        ContactsService.selectSansEmail(db, 1, function(result) {
                                            $scope.noemails.items = [];
                                            if (result.rows.length > 0) {
                                                $scope.noemails.empty = false;
                                                for (var int = 0; int < result.rows.length; int++) {
                                                   // $scope.tabs[1].items.push(result.rows.item(int));
                                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                            var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                            result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                                	 }
                                                	$scope.noemails.items.push(result.rows.item(int));
                                                }
                                            } else {
                                                $scope.noemails.items.push({});
                                                $scope.noemails.empty = true;
                                            }

                                            ContactsService.getCountOfContactSansEmail(db, function(result) {
                                                var CountSansEmail = 0;
                                                if (result.rows.length > 0) {
                                                    for (var key in result.rows.item(0)) {
                                                    	CountSansEmail = result.rows.item(0)[key];
                                                        $scope.noemails.count = result.rows.item(0)[key];
                                                        $scope.noemails.totalPages = guessPagesNumber($scope.noemails.count);
                                                      //  console.log( $scope.noemails.totalPages );
                                                    }
                                                } else {
                                                    $scope.noemails.count = 0;
                                                    $scope.noemails.empty = true;
                                                }


                                        ContactsService.selectDoublonsProbables(db, 1, function(result) {
                                            $scope.doublons.items = [];
                                            if (result.rows.length > 0) {
                                                $scope.doublons.empty = false;
                                                for (var int = 0; int < result.rows.length; int++) {
                                                   // $scope.tabs[1].items.push(result.rows.item(int));
                                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                            var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                            result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                                	 }
                                                	$scope.doublons.items.push(result.rows.item(int));
                                                }
                                            } else {
                                                $scope.doublons.items.push({});
                                                $scope.doublons.empty = true;
                                            }

                                            ContactsService.getCountOfContactDoublonsProbables(db, function(result) {
                                                var Countdoublons = 0;
                                                if (result.rows.length > 0) {
                                                    for (var key in result.rows.item(0)) {
                                                    	Countdoublons = result.rows.item(0)[key];
                                                        $scope.doublons.count = result.rows.item(0)[key];
                                                        $scope.doublons.totalPages = guessPagesNumber($scope.doublons.count);
                                                     //   console.log( $scope.doublons.totalPages );
                                                    }
                                                } else {
                                                    $scope.doublons.count = 0;
                                                    $scope.doublons.empty = true;
                                                }

                                                ContactsService.selectBuzwards(db, 1, function(result) {
                                                    $scope.buzward.items = [];
                                                    if (result.rows.length > 0) {
                                                        $scope.buzward.empty = false;
                                                        for (var int = 0; int < result.rows.length; int++) {
                                                           // $scope.tabs[1].items.push(result.rows.item(int));
                                                        	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                                    var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                                    result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                                        	 }
                                                        	$scope.buzward.items.push(result.rows.item(int));
                                                        }
                                                    } else {
                                                        $scope.buzward.items.push({});
                                                        $scope.buzward.empty = true;
                                                    }

                                                    ContactsService.getCountOfContactBuzwards(db, function(result) {
                                                        var Countbuzward = 0;
                                                        if (result.rows.length > 0) {
                                                            for (var key in result.rows.item(0)) {
                                                            	Countbuzward = result.rows.item(0)[key];
                                                                $scope.buzward.count = result.rows.item(0)[key];
                                                                $scope.buzward.totalPages = guessPagesNumber($scope.buzward.count);
                                                               // console.log( $scope.buzward.totalPages );
                                                            }
                                                        } else {
                                                            $scope.buzward.count = 0;
                                                            $scope.buzward.empty = true;
                                                        }

                                                    });
                                                });
                                                ContactsService.selectFilleuls(db, 1, function(result) {
                                                    $scope.filleuls.items = [];
                                                    if (result.rows.length > 0) {
                                                        $scope.filleuls.empty = false;
                                                        for (var int = 0; int < result.rows.length; int++) {
                                                           // $scope.tabs[1].items.push(result.rows.item(int));
                                                        	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                                    var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                                    result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                                        	 }
                                                        	$scope.filleuls.items.push(result.rows.item(int));
                                                        }
                                                    } else {
                                                        $scope.filleuls.items.push({});
                                                        $scope.filleuls.empty = true;
                                                    }

                                                    ContactsService.getCountOfContactFilleuls(db, function(result) {
                                                        var Countfilleuls = 0;
                                                        if (result.rows.length > 0) {
                                                            for (var key in result.rows.item(0)) {
                                                            	Countfilleuls = result.rows.item(0)[key];
                                                                $scope.filleuls.count = result.rows.item(0)[key];
                                                                $scope.filleuls.totalPages = guessPagesNumber($scope.filleuls.count);
                                                               // console.log( $scope.filleuls.totalPages );
                                                            }
                                                        } else {
                                                            $scope.filleuls.count = 0;
                                                            $scope.filleuls.empty = true;
                                                        }

                                                    });
                                                });
                                            });
                                        });
                                            });
                                        });

                                    });
                                });
                            });
                        });
                    });
	            });

	            });

        	 }
         }

         /**
          * if given group is the selected group, deselect it else, select the
          * given group
          */
         $scope.toggleGroup = function(group, element) {
         	//console.log(group);
         	//console.log(element);
             if ($scope.isGroupShown(group)) {
                 $scope.shownGroup = null;
             } else {
                 $scope.shownGroup = group;
             }


             $ionicScrollDelegate.$getByHandle().scrollTop(false);

         };
         $scope.infoContact =false;
         $scope.ShowinfoContact = function(){
       	  if($scope.infoContact)
       		  $scope.infoContact =false;
       		  else
       			  $scope.infoContact=true;
         }

         $scope.isGroupShown = function(group) {

             return $scope.shownGroup === group;
         };
         /**
          * if given group tab is the selected group tab, deselect it else, select the
          * given group tab
          */
         $scope.toggleGroupX = function(group, element) {

             if ($scope.isGroupShownX(group)) {
                 $scope.shownGroupX = null;
             } else {
                 $scope.shownGroupX = group;
             }

             $location.hash(element);
             var handle = $ionicScrollDelegate.$getByHandle();
          //   $ionicScrollDelegate.resize();
             $timeout(function(){

             	 handle.anchorScroll(false);
             },200);



         };
         $scope.isGroupShownX = function(group) {
//
             return $scope.shownGroupX === group;
         };
         /**
          * return the total pages number
          */
         function guessPagesNumber(total) {
             var div = total / 20;
             if (parseInt(div) == div) {
                 return div;
             } else {
                 return parseInt(div + 1);
             }
         }

         //dismiss popup
         $scope.dismiss = function() {
             LoadingService.dismiss();
         };
         //on focus
         $scope.focus = function() {
         	$rootScope.focused = true;
         };
         //on blr
         $scope.blur = function() {
         	$rootScope.focused = false;
         };

         //next page groupe
         $scope.forwardgroups = function(i,element) {
//         	// console.error($scope);
         	if ( $scope.groups[i].page < $scope.groups[i].nbr ) {
 	        	$scope.groups[i].page = $scope.groups[i].page + 1;
 	            var selectQuery = "SELECT * FROM contact where status != 'deleted' and list =='"+$scope.groups[i].name+"' order by last_name ASC LIMIT 20 OFFSET "+parseInt(20*($scope.groups[i].page-1))+";";
 	            try {
 	              $cordovaSQLite.execute(db, selectQuery).then(function(result) {
 	                // console.warn(selectQuery);
 	                var count = 0;
 	                $scope.groups[i].items = [];
 	            	for (var int = 0; int < result.rows.length; int++) {
 	            		 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                             var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                             result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                 	 }
 	    				var tmp= result.rows.item(int);

 	            		$scope.groups[i].items.push(tmp);
 	            	}
 	            	$location.hash(element);
 	                 var handle = $ionicScrollDelegate.$getByHandle('content');

 	                 handle.anchorScroll(false);
 	              }, function(reason) {
 	                // console.log(reason);
 	              }, function(value) {
 	                // console.warn(value);
 	              });
 	            } catch (e) {
 	              // TODO: FIXME handle exception
 	              return 0;
 	            }
         	}
         };
         //prev page groupe
         $scope.rewindgroups = function(i,element) {
         	if ( $scope.groups[i].page > 1 ) {
 	        	$scope.groups[i].page = $scope.groups[i].page - 1;
 	            var selectQuery = "SELECT * FROM contact where status != 'deleted' and list =='"+$scope.groups[i].name+"' order by last_name ASC LIMIT 20 OFFSET "+parseInt(20*($scope.groups[i].page-1))+";";
 	            try {
 	              $cordovaSQLite.execute(db, selectQuery).then(function(result) {
 	                // console.warn(selectQuery);
 	                var count = 0;
 	                $scope.groups[i].items = [];
 	            	for (var int = 0; int < result.rows.length; int++) {
 	            		 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                             var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                             result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                 	 }
 	    				var tmp= result.rows.item(int);
 	            		$scope.groups[i].items.push(tmp);
 	            	}
 	            	 $location.hash(element);
 	                 var handle = $ionicScrollDelegate.$getByHandle('content');

 	                 handle.anchorScroll(false);
 	              }, function(reason) {
 	                // console.log(reason);
 	              }, function(value) {
 	                // console.warn(value);
 	              });
 	            } catch (e) {
 	              // TODO: FIXME handle exception
 	              return 0;
 	            }
         	}
         };
         //next page
         $scope.forward = function(id) {
             switch (id) {
                 case 0:
                     if ($scope.tousContact[0].page < $scope.tousContact[0].totalPages) {
                         ContactsService.selectFollowers(db, ($scope.tousContact[0].page + 1), function(result) {
                             $scope.tousContact[0].items = [];
                             if (result.rows.length > 0) {
                                 $scope.tousContact[0].empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.tousContact[0].items.push(result.rows.item(int));
                                     $scope.dynamicTimeStamp = new Date().getTime();
                                 }
                                 $scope.tousContact[0].page++;
                             } else {
                                 $scope.tousContact[0].items.push({});
                                 $scope.tousContact[0].empty = true;
                             }
                             $location.hash('TousContact');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 1:
                     if ($scope.tousContact[1].page < $scope.tousContact[1].totalPages) {
                         ContactsService.selectNonFollowers(db, ($scope.tousContact[1].page + 1), function(result) {
                      console.log(result.rows.item)
                           console.log(result.rows.length)
                             $scope.tousContact[1].items = [];
                             if (result.rows.length >= 0) {
                                 $scope.tousContact[1].empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {

                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.tousContact[1].items.push(result.rows.item(int));
                                     $scope.dynamicTimeStamp = new Date().getTime();
                                 }
                                 $scope.tousContact[1].page++;
                             } else {
                                 $scope.tousContact[1].items.push({});
                                 $scope.tousContact[1].empty = true;
                             }
                         $location.hash('Followers');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 2:
                     if ($scope.nogroups.page < $scope.nogroups.totalPages) {
                         ContactsService.selectSansGroups(db, ($scope.nogroups.page + 1), function(result) {

                             $scope.nogroups.items = [];
                             if (result.rows.length > 0) {
                                 $scope.nogroups.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.nogroups.items.push(result.rows.item(int));
                                     $scope.dynamicTimeStamp = new Date().getTime();
                                 }
                                 $scope.nogroups.page++;
                             } else {
                                 $scope.nogroups.items.push({});
                                 $scope.nogroups.empty = true;
                             }
                         $location.hash('contactSansgrp');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 3:
                     if ($scope.noemails.page < $scope.noemails.totalPages) {
                         ContactsService.selectSansEmail(db, ($scope.noemails.page + 1), function(result) {

                             $scope.noemails.items = [];
                             if (result.rows.length > 0) {
                                 $scope.noemails.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.noemails.items.push(result.rows.item(int));
                                     $scope.dynamicTimeStamp = new Date().getTime();
                                 }
                                 $scope.noemails.page++;
                             } else {
                                 $scope.noemails.items.push({});
                                 $scope.noemails.empty = true;
                             }
                         $location.hash('contactSansMail');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 4:
                     if ($scope.doublons.page < $scope.doublons.totalPages) {
                         ContactsService.selectDoublonsProbables(db, ($scope.doublons.page + 1), function(result) {

                             $scope.doublons.items = [];
                             if (result.rows.length > 0) {
                                 $scope.doublons.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.doublons.items.push(result.rows.item(int));
                                     $scope.dynamicTimeStamp = new Date().getTime();
                                 }
                                 $scope.doublons.page++;
                             } else {
                                 $scope.doublons.items.push({});
                                 $scope.doublons.empty = true;
                             }
                         $location.hash('doublonsProbable');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 5:
                     if ($scope.buzward.page < $scope.buzward.totalPages) {
                         ContactsService.selectBuzwards(db, ($scope.buzward.page + 1), function(result) {

                             $scope.buzward.items = [];
                             if (result.rows.length > 0) {
                                 $scope.buzward.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.buzward.items.push(result.rows.item(int));
                                     $scope.dynamicTimeStamp = new Date().getTime();
                                 }
                                 $scope.buzward.page++;
                             } else {
                                 $scope.buzward.items.push({});
                                 $scope.buzward.empty = true;
                             }
                         $location.hash('buzwards');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 6:
                     if ($scope.filleuls.page < $scope.filleuls.totalPages) {
                         ContactsService.selectFilleuls(db, ($scope.filleuls.page + 1), function(result) {

                             $scope.filleuls.items = [];
                             if (result.rows.length > 0) {
                                 $scope.filleuls.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.filleuls.items.push(result.rows.item(int));
                                     $scope.dynamicTimeStamp = new Date().getTime();
                                 }
                                 $scope.filleuls.page++;
                             } else {
                                 $scope.filleuls.items.push({});
                                 $scope.filleuls.empty = true;
                             }
                         $location.hash('Filleuls');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
             }
         };
         //previous page
         $scope.rewind = function(id) {
             switch (id) {
                 case 0:
                     if ($scope.tousContact[0].page > 1) {
                         ContactsService.selectFollowers(db, ($scope.tousContact[0].page - 1), function(result) {

                             $scope.tousContact[0].items = [];
                             if (result.rows.length > 0) {
                                 $scope.tousContact[0].empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                         console.log(result.rows.item(int).photofilelocation);

                                             	 }
                                     $scope.tousContact[0].items.push( result.rows.item(int));
                                 }
                                 $scope.tousContact[0].page--;
                             } else {
                                 $scope.tousContact[0].items.push({});
                                 $scope.tousContact[0].empty = true;
                             }
                             $location.hash('TousContact');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }

                     break;
                 case 1:
                     if ($scope.tousContact[1].page > 1) {
                         ContactsService.selectNonFollowers(db, ($scope.tousContact[1].page - 1), function(result) {

                             $scope.tousContact[1].items = [];
                             if (result.rows.length > 0) {
                                 $scope.tousContact[1].empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.tousContact[1].items.push(result.rows.item(int));

                                 }
                                 $scope.tousContact[1].page--;
                             } else {
                                 $scope.tousContact[1].items.push({});
                                 $scope.tousContact[1].empty = true;
                             }
                             $location.hash('Followers');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 2:
                     if ($scope.nogroups.page > 1) {
                         ContactsService.selectSansGroups(db, ($scope.nogroups.page - 1), function(result) {

                             $scope.nogroups.items = [];
                             if (result.rows.length > 0) {
                                 $scope.nogroups.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.nogroups.items.push(result.rows.item(int));

                                 }
                                 $scope.nogroups.page--;
                             } else {
                                 $scope.nogroups.items.push({});
                                 $scope.nogroups.empty = true;
                             }
                             $location.hash('contactSansgrp');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 3:
                     if ($scope.noemails.page > 1) {
                         ContactsService.selectSansEmail(db, ($scope.noemails.page - 1), function(result) {

                             $scope.noemails.items = [];
                             if (result.rows.length > 0) {
                                 $scope.noemails.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.noemails.items.push(result.rows.item(int));

                                 }
                                 $scope.noemails.page--;
                             } else {
                                 $scope.noemails.items.push({});
                                 $scope.noemails.empty = true;
                             }
                             $location.hash('contactSansMail');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 4:
                     if ($scope.doublons.page > 1) {
                         ContactsService.selectDoublonsProbables(db, ($scope.doublons.page - 1), function(result) {

                             $scope.doublons.items = [];
                             if (result.rows.length > 0) {
                                 $scope.doublons.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.doublons.items.push(result.rows.item(int));

                                 }
                                 $scope.doublons.page--;
                             } else {
                                 $scope.doublons.items.push({});
                                 $scope.doublons.empty = true;
                             }
                             $location.hash('doublonsProbable');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 5:
                     if ($scope.buzward.page > 1) {
                         ContactsService.selectBuzwards(db, ($scope.buzward.page - 1), function(result) {

                             $scope.buzward.items = [];
                             if (result.rows.length > 0) {
                                 $scope.buzward.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.buzward.items.push(result.rows.item(int));

                                 }
                                 $scope.buzward.page--;
                             } else {
                                 $scope.buzward.items.push({});
                                 $scope.buzward.empty = true;
                             }
                             $location.hash('buzwards');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
                 case 6:
                     if ($scope.filleuls.page > 1) {
                         ContactsService.selectFilleuls(db, ($scope.filleuls.page - 1), function(result) {

                             $scope.filleuls.items = [];
                             if (result.rows.length > 0) {
                                 $scope.filleuls.empty = false;
                                 for (var int = 0; int < result.rows.length; int++) {
                                	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                         var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                         result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                             	 }
                                     $scope.filleuls.items.push(result.rows.item(int));

                                 }
                                 $scope.filleuls.page--;
                             } else {
                                 $scope.filleuls.items.push({});
                                 $scope.filleuls.empty = true;
                             }
                             $location.hash('Filleuls');
                             var handle = $ionicScrollDelegate.$getByHandle('content');

                             handle.anchorScroll(false);
                         });
                     }
                     break;
             }
         };
         $scope.changeHandler = function(criteria) {
        	 $scope.hidesearch = false;
             if (angular.equals(criteria.length, 0)) {
                 $scope.show = false;
             }

         };
         $scope.clearSearch = function(){

             document.querySelector('#searchinput').value = "";
             $timeout(function(){
            	 document.getElementById("searchinput").focus();
             },750);


             $rootScope.focused = true;
             $scope.show = false;
             $scope.hidesearch = true;
           };
         //show the search result
         $scope.btnSearch = function(criteria) {
             $scope.search.items = [];
             if (!angular.equals(criteria.length, 0)) {
                 ContactsService.searchContact(db, criteria, function(result) {
                     if (result.rows.length > 0) {
                         $scope.show = true;
                         $scope.search.empty = false;
                         for (var int = 0; int < result.rows.length; int++) {
                        	 if(result.rows.item(int).photofilelocation  !="img/photo_top_title.jpg" ){
                                 var fileName = result.rows.item(int).photofilelocation.substr(result.rows.item(int).photofilelocation.lastIndexOf('/')+1);
                                 result.rows.item(int).photofilelocation = $rootScope.path+fileName;
                                     	 }
                             $scope.search.items.push(result.rows.item(int));

                         }
                         if (!$scope.isGroupShown($scope.search)) {
                             $scope.toggleGroup($scope.search);
                         }

                     } else {
                         $scope.show = true;
                         $scope.search.empty = true;
                         if (!$scope.isGroupShown($scope.search)) {
                             $scope.toggleGroup($scope.search);
                         }
                     }
                 });
             } else {
                 LoadingService.error($translate.instant('ContactList.Msg1'), "ContactListController");
             }
         };


         $scope.createContact = function(){
             var id = new Date().getTime();
             ContactsService.createContactDB(db,id,function(res){
               SynchroServices.insertRequest(db,"CONTACTCREATE",{idTmp : id},function(rs){
                 localStorage.setItem("idTmpEncours",rs.insertId);
                ContactsService.updateContactByField(db,"photofilelocation","img/photo_top_title.jpg", id,function(){
                 ContactsService.updateContactByField(db,"status","selected", id,function(){ //
                 ContactsService.updateContactByField(db,"vcardprofil","1", id,function(){ //
                   ContactsService.updateContactByField(db,"Filleul","0", id,function(){ //

                    ContactsService.updateContactByField(db,"date",moment().unix(), id,function(){
                      ContactsService.updateContactByField(db,"alerteemailcreationdate", $filter('date')(new Date(), 'MM/dd/yyyy HH:mm:ss'), id,function(){
                            LoadingService.dismiss();
                        MenuService.setLocalStorage('ReloadContactList', 1);
                        $state.go('app.contactEdit', {id: id});

                        });
                  });
  			          });
			          });

              });//
                 });
             });
             });
         };

         $scope.okDelete = function(){
         	LoadingService.dismiss();
         	$state.go('app.contactList');
         }

         $scope.ok = function(){
         	LoadingService.dismiss();
         }
    }]);
