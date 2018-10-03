appContext.controller("creditParrainageController", [
		'$scope',
		function($scope) {
			var reg = new RegExp('["]', 'gi');
			$scope.creditParrainage = localStorage.getItem("credit").replace(reg,'');
		} ]);