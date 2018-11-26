appContext.directive('datepickerDirective', function($translate,LoadingService, $rootScope){
	return {
		restrict :'C',
		scope:{
			returnValue:'&getValue'
		},
		link: function(scope, element, attrs){
		//$(element).pickadate(scope.options);
		$(element).pickadate({
			  monthsFull: [$translate.instant('Janvier'), $translate.instant('Février'), $translate.instant('Mars'), $translate.instant('Avril'), $translate.instant('Mai'), $translate.instant('Juin'), $translate.instant('Juillet'), $translate.instant('Août'), $translate.instant('Septembre'), $translate.instant('Octobre'), $translate.instant('Novembre'), $translate.instant('Décembre')],
			  weekdaysShort: [$translate.instant('Dim'), $translate.instant('Lun'), $translate.instant('Mar'), $translate.instant('Mer'), $translate.instant('Jeu'), $translate.instant('Ven'), $translate.instant('Sam')],
			  today: $translate.instant('aujourd\'hui'),
			  clear: '',
			  format:'dd/mm/yyyy',
			  formatSubmit: 'dd/mm/yyyy',
			  onOpen: function(){	  
				  $rootScope.opened = true;
          $rootScope.closedCalender = true
				  $rootScope.displaydrowdown1={"z-index" :"9999999999999999"};
				//alert(ee);
				  $('.picker__holder').attr('style','display:none');
				
				  cordova.plugins.diagnostic.requestCalendarAuthorization(function(status){
				   		console.log('calender permission '+status);
//				        	  alert("App is " + (authorized ? "authorized" : "denied") + " access to calender");
//				        	
				   	 
				        	    if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
				        	    	 $('.picker__holder').attr('style','display:block');
				        	    }else{
				        	    	// alert(false);
				        	    	 $('.picker__holder').attr('style','display:none');
				        	    	if($rootScope.requestAutoriseCalender >=1)
				        	    	LoadingService.QuestionAUtorisationCamera($translate.instant('QuestionAutoriserCalender'), 'ContactShowController');
				        	    		$rootScope.requestAutoriseCalender ++;
				        	    }
				      	}, function(error){
				    	    console.log("The following error occurred: "+error);
				      		
				      	});
				  
			  },onSet: function(context) {
			    console.log(parseInt(context.select))
			    if(parseInt(context.select)) $rootScope.closedCalender = true
        console.log('Just set stuff:', context)
        console.log($rootScope.closedCalender)
      }
			 
			});
		
		}
	}
});
