/**
 * Angucomplete
 * Autocomplete directive for AngularJS
 * By Daryl Rowland
 */

angular.module('angucomplete', [] )
    .directive('angucomplete', function ($parse, $http, $sce, $timeout, ContactsService,AutoCompleteService, $rootScope,autoCompleteDomaines) {


    return {
        restrict: 'EA',
        scope: {
            "id": "@id",
            "placeholder": "@placeholder",
            "selectedObject": "=selectedobject",
            "url": "@url",
            "dataField": "@datafield",
            "titleField": "@titlefield",
            "descriptionField": "@descriptionfield",
            "imageField": "@imagefield",
            "imageUri": "@imageuri",
            "inputClass": "@inputclass",
            "userPause": "@pause",
            "localData": "=localdata",
            "searchFields": "@searchfields",
            "minLengthUser": "@minlength",
            "matchClass": "@matchclass",
            "ng-model": "=searchSrc"

        },
        template: '<div class="angucomplete-holder"><input id="id_email"  ng-model="searchSrc" type="text" placeholder="{{placeholder}}" class="{{inputClass}}"  ng-focus="resetHideResults()" ng-blur="hideResults()" /><div id="{{id}}_dropdown" class="angucomplete-dropdown" ng-if="showDropdown"><div class="angucomplete-searching" ng-show="searching">Searching...</div><div class="angucomplete-row" ng-repeat="result in results" ng-click="selectResult(result)"  ng-class="{\'angucomplete-selected-row\': $index == currentIndex}"><div ng-if="imageField" class="angucomplete-image-holder"></div><div class="angucomplete-title" ng-if="matchClass" ng-bind-html="result.title"></div><div class="angucomplete-title" ng-if="!matchClass">{{ result.title }}</div><div ng-if="result.description && result.description != \'\'" class="angucomplete-description">{{result.description}}</div></div></div></div>',

        link: function($scope, elem, attrs) {
            $scope.lastSearchTerm = null;
            $scope.currentIndex = null;
            $scope.justChanged = false;
            $scope.searchTimer = null;
            $scope.hideTimer = null;
            $scope.searching = false;
            $scope.pause = 100;
            $scope.minLength = 3;
            $scope.searchSrc = null;
            $scope.serachCarac ='@';
            if($rootScope.emailSend !="" && $rootScope.emailSend !=null){
            	//console.log('autocomplete '+$rootScope.emailSend);
            	$scope.email = $rootScope.emailSend;
            	$scope.searchSrc = $rootScope.emailSend;
            	document.getElementById("id_email").value = $rootScope.emailSend;
            	$scope.selectedObject= $rootScope.emailSend;
            	
            	$rootScope.focusName =true;
            }
          
//            if($rootScope.emailSend !="" && $rootScope.emailSend !=null){
//            	$scope.searchSrc = $rootScope.emailSend;
//            	//document.querySelector('#id_email').value = $rootScope.emailSend;
//            }
            if ($scope.minLengthUser && $scope.minLengthUser != "") {
                $scope.minLength = $scope.minLengthUser;
            }

            if ($scope.userPause) {
                $scope.pause = $scope.userPause;
            }

            isNewSearchNeeded = function(newTerm, oldTerm) {
            	  //&&  newTerm.indexOf($scope.serachCarac) != -1
                return newTerm != oldTerm

            }

            $scope.processResults = function(responseData, str) {
            	var db = null;
            	$rootScope.name = false;
            	$rootScope.focusName = true;
            	 if (window.cordova) {
                 	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
                 } else {
                     db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
                 }
            	 autoCompleteDomaines.searchDomaine(str,db,function(data){
            //	ContactsService.searchDomaineName(str, db, function(data){
                    $scope.results = [];

                    var titleFields = [];
                    if ($scope.titleField && $scope.titleField != "") {
                        titleFields = $scope.titleField.split(",");
                    }
                    	if (data) {

                        var searchFields = $scope.searchFields.split(",");

                        var responseData = [];

                        for (var i = 0; i < data.length; i++) {
                            var match = false;

                            for (var s = 0; s < searchFields.length; s++) {

                                match =  ( data[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) == 0);
                                if (match) {

                                	responseData[responseData.length] = data[i];
                                }
                            }
                        }
                        }

                    for (var i = 0; i < responseData.length; i++) {
                        // Get title variables
                        var titleCode = [];
                        for (var t = 0; t < titleFields.length; t++) {
                            titleCode.push(responseData[i][titleFields[t]]);
                        }
                        var text = titleCode.join(' ');
                        if ($scope.matchClass) {
                            var re = new RegExp(str, 'i');
                            var strPart = text.match(re)[0];
                            text = $sce.trustAsHtml(text.replace(re, '<span class="'+ $scope.matchClass +'">'+ strPart +'</span>'));
                        }

                        var resultRow = {
                            title: text,
                            originalObject: responseData[i]
                        }

                        $scope.results[$scope.results.length] = resultRow;
                    }

            	});
            }
            	$scope.processResults2 = function(responseData, str) {
              $rootScope.name = true;
            		var db = null;
               	 if (window.cordova) {
                    	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
                    } else {
                        db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
                    }
               	AutoCompleteService.searchName(db,str, function(data){
               	//	console.log(data);
                       $scope.results = [];

                       var titleFields = [];
                       if ($scope.titleField && $scope.titleField != "") {
                           titleFields = $scope.titleField.split(",");
                       }
                       if (data) {

                           var searchFields = $scope.searchFields.split(",");

                           var responseData = [];

                           for (var i = 0; i < data.length; i++) {
                               var match = false;

                               for (var s = 0; s < searchFields.length; s++) {

                                   match =  ( data[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) == 0);
                                   if (match) {

                                   	responseData[responseData.length] = data[i];
                                   }
                               }
                           }
                           }
                       for (var i = 0; i < responseData.length; i++) {
                           // Get title variables
                           var titleCode = [];
                           for (var t = 0; t < titleFields.length; t++) {
                               titleCode.push(responseData[i][titleFields[t]]);
                           }
                           var text = titleCode.join(' ');
                           if ($scope.matchClass) {
                               var re = new RegExp(str, 'i');
                               var strPart = text.match(re)[0];
                               text = $sce.trustAsHtml(text.replace(re, '<span class="'+ $scope.matchClass +'">'+ strPart +'</span>'));
                           }

                           var resultRow = {
                               title: text,
                               originalObject: responseData[i]
                           }

                           $scope.results[$scope.results.length] = resultRow;
                       }
               	 });

               };

            $scope.searchTimerComplete = function(str) {
                // Begin the search
            	$rootScope.displaydrowdown={"z-index" :"-1"};
            	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
            	//alert(str);
            	if(str.indexOf($scope.serachCarac) != -1){
            		str= str.substr(str.lastIndexOf($scope.serachCarac)+1);
            		if(str !=""){


                    if ($scope.localData) {

                        var searchFields = $scope.searchFields.split(",");

                        var matches = [];

                        for (var i = 0; i < $scope.localData.length; i++) {
                            var match = false;

                            for (var s = 0; s < searchFields.length; s++) {

                                match =  ( $scope.localData[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) == 0);
                                if (match) {

                                    matches[matches.length] = $scope.localData[i];
                                }
                            }
                        }
                        $scope.showDropdown = true;
                        $scope.searching = false;
                        $scope.processResults(matches, str);

                    } else {
                        $http.get($scope.url + str, {}).
                            success(function(responseData, status, headers, config) {
                                $scope.searching = false;
                                $scope.processResults((($scope.dataField) ? responseData[$scope.dataField] : responseData ), str);
                            }).
                            error(function(data, status, headers, config) {
                             //   console.log("error");
                            });
                    }
            		}
                }else{
                	var db = null;
               	 if (window.cordova) {
                    	db = window.sqlitePlugin.openDatabase({name : "buzcard.db" , androidDatabaseImplementation: 2}); // device
                    } else {
                        db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
                    }
               	 if(str !=''){
               	AutoCompleteService.searchName(db,str, function(result){
               		//console.log(result);
               		 if(result.length >0){
               		  var searchFields = $scope.searchFields.split(",");

                      var matches = [];

                      for (var i = 0; i < result.length; i++) {
                          var match = false;

                          for (var s = 0; s < searchFields.length; s++) {

                              match =  ( result[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) == 0);
                              if (result[i][searchFields[s]].toLowerCase().indexOf(str.toLowerCase()) == 0) {
                                  matches[matches.length] = result[i];
                              }
                          }


                      }
                      $scope.showDropdown = true;
                      $scope.searching = false;
                      $scope.processResults2(matches, str);
               		 }
               	 });
               	 }
                }
            }

            $scope.hideResults = function() {
            	$rootScope.focused = false;

            	$rootScope.displaydrowdown={"z-index" :"9999"};
            	$rootScope.displaydrowdown1={"z-index" :"9999","position" :""};
            	//console.log("blur");
            	  $scope.selectedObject = $scope.searchSrc;
                $scope.hideTimer = $timeout(function() {
                    $scope.showDropdown = false;
                    $scope.selectedObject = $scope.searchSrc;
//                    if($rootScope.name){
//                    	 document.getElementById("id_email").focus();
//                    }
//
                }, $scope.pause);
            };

            $scope.resetHideResults = function() {
            //	console.log("focused");
             $scope.showDropdown = false;
            	$rootScope.displaydrowdown={"z-index" :"-1"};
            	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
            	$rootScope.focused = true;
            	   $scope.selectedObject = $scope.searchSrc;
                if($scope.hideTimer) {
                    $timeout.cancel($scope.hideTimer);
                    $scope.selectedObject = $scope.searchSrc;
//                    if($rootScope.name){
//                   	 document.getElementById("id_email").focus();
//                   }
                };
            };

            $scope.hoverRow = function(index) {
                $scope.currentIndex = index;
                $scope.selectedObject = $scope.searchSrc;
//                if($rootScope.name){
//               	 document.getElementById("id_email").focus();
//               	$rootScope.displaydrowdown={"z-index" :"-1"};
//            	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
//               }
            }

            $scope.keyPressed = function(event) {
                if (!(event.which == 38 || event.which == 40 || event.which == 13)) {
                //	$scope.searchSrc = document.getElementById("id_email").value;
                    if (!$scope.searchSrc || $scope.searchSrc == "") {
                        $scope.showDropdown = false;
                        $scope.lastSearchTerm = null
                        
                    } else if (isNewSearchNeeded($scope.searchSrc, $scope.lastSearchTerm)) {

                    	$rootScope.displaydrowdown={"z-index" :"-1"};
                    	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};

                        $scope.lastSearchTerm = $scope.searchSrc
                        $scope.showDropdown = true;
                        $scope.currentIndex = -1;
                        $rootScope.name = false;
                        $scope.results = [];
                        $scope.selectedObject = $scope.searchSrc;
                        if ($scope.searchTimer) {
                            $timeout.cancel($scope.searchTimer);
                        }

                        $scope.searching = false;

                        $scope.searchTimer = $timeout(function() {
                        	//alert($scope.searchSrc);
                        
                            $scope.searchTimerComplete($scope.searchSrc);
                        }, $scope.pause);
                    }

                }
                else {
                    event.preventDefault();
//                    $scope.searching = false;
//                    $rootScope.name = false;
                }
            }

            $scope.selectResult = function(result) {
                if ($scope.matchClass) {
                    result.title = result.title.toString().replace(/(<([^>]+)>)/ig, '');
                }



                $scope.searchSrc = $scope.searchSrc.substr(0,$scope.searchSrc.indexOf($scope.serachCarac)+1)+''+result.title;

                $scope.selectedObject = $scope.searchSrc;
                $scope.showDropdown = false;
                $scope.searching = false;
                $scope.results = [];

              //  $scope.$apply();
            }

            var inputField = elem.find('input');

            inputField.on('keyup', $scope.keyPressed);

            elem.on("keyup", function (event) {

                if(event.which === 40) {
                    if ($scope.results && ($scope.currentIndex + 1) < $scope.results.length) {
                        $scope.currentIndex ++;
                        $scope.$apply();
                        event.preventDefault;
                       //event.stopPropagation();
                        $scope.selectedObject = $scope.searchSrc;
//                        $rootScope.displaydrowdown={"z-index" :"-1"};
//                    	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
                    }
                //    $rootScope.name = false;
                    $scope.$apply();
                } else if(event.which == 38) {
                    if ($scope.currentIndex >= 1) {
                        $scope.currentIndex --;
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                        $scope.selectedObject = $scope.searchSrc;
//                        $rootScope.displaydrowdown={"z-index" :"-1"};
//                    	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
                    }
                 //   $rootScope.name = false;
                } else if (event.which == 13) {
                    if ($scope.results && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.results.length) {
                        $scope.selectResult($scope.results[$scope.currentIndex]);
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                        $scope.selectedObject = $scope.searchSrc;
                    } else {
                        $scope.results = [];
                        $scope.$apply();
                        event.preventDefault;
                        event.stopPropagation();
                        $scope.selectedObject = $scope.searchSrc;
                    }
//                    $rootScope.displaydrowdown={"z-index" :"-1"};
//                	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
//                    $rootScope.name = false;
                } else if (event.which == 27) {
                    $scope.results = [];
                    $scope.showDropdown = false;
                    $scope.$apply();
//                    $rootScope.name = false;
//                    $rootScope.displaydrowdown={"z-index" :"-1"};
//                	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
                } else if (event.which == 8) {
                    $scope.selectedObject = null;
                    $scope.$apply();
//                    $rootScope.name = false;
//                    $rootScope.displaydrowdown={"z-index" :"-1"};
//                	$rootScope.displaydrowdown1={"z-index" :"-1","position" :"relative"};
                }
            });

        }
    };
});
