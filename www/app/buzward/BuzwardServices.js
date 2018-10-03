appContext.factory("BuzwardService", ['$http', '$cordovaSQLite','$rootScope','$cordovaFile','$http','BuzcardService', function($http, $cordovaSQLite,$rootScope,$cordovaFile,$http,BuzcardService ) {

	var SendBuzwardServer = function(contactId, email,filebuzward, checkbox, callBack,errorCallBack){

	      var data = "";
//	      // console.log(checkFollower);
//	      if (checkFollower =="on") {
	      data = "ContactID="+contactId+"&CheckBox="+checkbox+"&EmailLanguage=fr&Email="+email;
//	      } else {
//	        data = "TextBox_Mail="+email+"&EmailLanguageDropDownList="+selectLang+"&DateRDV="+dateRDV;
//	      }
	       console.log(data);

	      $.ajax({
	          type : "GET",
	          url : "https://www.buzcard.com/send.aspx",
	          timeout : 6000,
	          success : function(a, status, xhr) {
	        	  // console.log(a);
	            var action = $($.parseHTML(a)).filter("#form1").attr("action");
	            // console.log(action);
	            var arg = action.split('?');
	            $.ajax({
	              type : "POST",
	              url : "https://www.buzcard.com/Vcard_Send.aspx?"+decodeURIComponent(arg[1]) +"&Buzward=OK",
	              data : data,
	              timeout : 6000,
	              success : function(out, status, xhr) {
	               return callBack();
	              },
	              error : function(xhr, ajaxOptions, thrownError) {
	            	  //alert(JSON.stringify(xhr));
	               if(ajaxOptions === "timeout") {
	                return callBack();
	                  } else {
	                   return errorCallBack(xhr);
	                  }

	              }
	            });
	          },
	          error : function(xhr, ajaxOptions, thrownError) {

	        	  if(ajaxOptions === "timeout") {
	                  return callBack();
	                    } else {
	                     return errorCallBack(xhr);
	                    }
	          }
	        });
	};
	var SendBuzwardServerWithtext = function(contactId, email,filebuzward, checkbox, checkbox2, callBack,errorCallBack){

	      var data = "";
//	      // console.log(checkFollower);
//	      if (checkFollower =="on") {
	      data = "ContactID="+contactId+"&CheckBox="+checkbox+"&EmailLanguage=fr&Email="+email+"&CheckBox2="+checkbox2;
//	      } else {
//	        data = "TextBox_Mail="+email+"&EmailLanguageDropDownList="+selectLang+"&DateRDV="+dateRDV;
//	      }
	       console.log(data);
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
//   	    alert(pathfile);
   	  var fileName = filebuzward.substr(filebuzward.lastIndexOf('/')+1);
   	  $cordovaFile.readAsText(path, fileName)
         .then(function (success) {
       	 console.log(success);
       	BuzcardService.getACT(function(act) {
	            var url = "https://www.buzcard.com/Vcard_Send_mobile.aspx?act="+act+"&Buzward=OK&"+data;

	            var file=success;

                var formData = new FormData();

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
                        callBack(data.answer.contact_id.contact);

                    })
                    .error(function (xhr, ajaxOptions, thrownError) {
                    	  //alert(JSON.stringify(xhr));
                        errorCallBack();
                    });

         });
         }, function (error) {
             // error
       	  console.log(JSON.stringify(error));
           });
	};

	return {
		SendBuzwardServer:SendBuzwardServer,
		SendBuzwardServerWithtext:SendBuzwardServerWithtext
	}
}]);
