appContext.controller('ContactCreateController',['$ionicPlatform','$scope','ContactsService','$translate',function($ionicPlatform, $scope, ContactsService,$translate){


  $scope.isFocusable=false;
  $scope.noGroup = false;
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
  });
  //get group list
  ContactsService.selectAllGroup(db, function(result) {
    $scope.groups = new Array();
    $scope.groups[0] =  $translate.instant('ContactEdit.noGroup');
    for (var i = 0; i < result.rows.length; i++) {
      $scope.groups[i+1] = result.rows.item(i).name;
    }
    $scope.groups[$scope.groups.length] = $translate.instant('ContactEdit.NewGrp');


  });
}]);
