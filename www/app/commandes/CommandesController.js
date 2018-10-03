appContext.controller('CommandesController', ['$scope', '$state', '$ionicPlatform', '$cordovaSQLite', '$ionicSlideBoxDelegate', '$rootScope',
  function($scope, $state, $ionicPlatform, $cordovaSQLite, $ionicSlideBoxDelegate, $rootScope) {

    var db = null;
    $rootScope.needPassword = true;
    $rootScope.showWrongPassword = false;
    $ionicPlatform.ready(function() {

      /**
       * create/open DB
       */
      if (window.cordova) {
        db = window.sqlitePlugin.openDatabase({
          name: "buzcard.db",
          androidDatabaseImplementation: 2
        }); // device
      } else {
        db = window.openDatabase("buzcard.db", '1', 'my', 1024 * 1024 * 10); // browser
      }
    });

    $scope.next = function() {
      console.log('NEXT');
      $scope.$broadcast('slideBox.nextSlide');
    };
    $scope.prev = function() {
      console.log('PREV');
      $scope.$broadcast('slideBox.prevSlide');
    };
    $scope.slideChanged = function(index) {
      console.log('Slide changed', index);
    };

    $scope.store1 = function() {

      window.open("http://stores.buzcard.fr/contact", '_system');

    };
    $scope.store2 = function() {

      window.open("http://stores.buzcard.fr/pages/Creez-votre-buzcard-forever", '_system');

    };
    $scope.store3 = function() {

      window.open("http://stores.buzcard.fr/pages/Creez-votre-buzcard-forever", '_system');

    };

    $scope.toggleGroup = function(group) {

      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }

    };

    $scope.isGroupShown = function(group) {

      return $scope.shownGroup === group;
    };
  }
]);
