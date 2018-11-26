appContext.factory("BuzwardService", ['$http', '$cordovaSQLite','$rootScope','$cordovaFile','$http','BuzcardService', function($http, $cordovaSQLite,$rootScope,$cordovaFile,$http,BuzcardService ) {

	var SendBuzwardServerWithtext = function(contactId, email,filebuzward, checkbox, checkbox2, Rid, callBack,errorCallBack){

	       var isWindowsPhone = ionic.Platform.isWindowsPhone();
   	    if(window.cordova){
   	    	if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
   	    	   path = cordova.file.applicationStorageDirectory;
   	    	} else if (isWindowsPhone) {
   	           path = "/";
   	        } else {
   	          path = cordova.file.dataDirectory;
   			}
   	    }
   	  var fileName = filebuzward.substr(filebuzward.lastIndexOf('/')+1);
   	  $cordovaFile.readAsText(path, fileName)
         .then(function (success) {
       	 console.log(success);
       	BuzcardService.getACT(function(act) {

          // var url = "https://www.buzcard.com/Vcard_Send_mobile.aspx?act="+act+"&Buzward=OK&"+data;
	           var url = "https://www.buzcard.com/BuzcardSendVcard.aspx?request=Buzward";
            console.log(url)
	            var file=success;

                var formData = new FormData();
                formData.append('act', act)
                formData.append('ContactID', contactId)
                formData.append('Email', email)
                formData.append('EmailLanguage', 'fr')
                formData.append('CheckBox1', checkbox)
                formData.append('CheckBox2', checkbox2)
                formData.append('RID', Rid)
                formData.append('txtfile', new Blob([file], {
                    type: "text/plain"
                }),fileName);
              //  data = "ContactID="+contactId+"&CheckBox="+checkbox+"&EmailLanguage=fr&Email="+email;


                $http.post(url, formData, {
                    transformRequest: angular.identity,
                    transformResponse: function (data) {
                    	   var x2js = new X2JS();
                           var json = x2js.xml_str2json(data);
                           return json
                    },
                    headers: {
                    	'Content-Type': undefined
                    }
                    
                }).success(function (data, status, headers, config) {
                        console.log('success buzward ...');
                        console.log(data);
                        callBack(data.answer);

                    })
                    .error(function (xhr, ajaxOptions, thrownError) {
                    	 // alert(JSON.stringify(xhr));
                        errorCallBack();
                    });

         });
         }, function (error) {
             // error
       	  console.log(JSON.stringify(error));
           });
	};

	return {
		SendBuzwardServerWithtext:SendBuzwardServerWithtext
	}
}]);
