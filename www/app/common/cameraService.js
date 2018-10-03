appContext.factory('cameraService', ['$q','$cordovaFile','$timeout','$cordovaFileTransfer', function($q, $cordovaFile,$timeout, $cordovaFileTransfer) {


	var  getPicture=  function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, options);

      return q.promise;
    };
   /**
    *
    */
    var RenamePicture= function(NewPathFile, imageURL, callBack){

        var isWindowsPhone = ionic.Platform.isWindowsPhone();
    	var fileName = imageURL.substr(imageURL.lastIndexOf('/')+1);
    	var pathFile = imageURL.substr(0,imageURL.lastIndexOf('/')+1);
    	var newFileName = NewPathFile;
    	var path="";
	    if(window.cordova){
	    	if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
	    	   path = cordova.file.applicationStorageDirectory;
	    	} else if (isWindowsPhone) {
	           path = "/";
	        } else {
	          path = cordova.file.dataDirectory;
			}
	    	//TODO FIXME  a terminer
	var dirFile =path;
	$cordovaFile.moveFile(pathFile,fileName ,dirFile, newFileName)
		.then(function (success) {
				callBack(success.nativeURL);
			}, function (error) {
				callBack(imageURL);
			});
	    }else{
	    	callBack("");
	    }

    };
    /**
     * download photo serveur
     */
    var downloadFile= function(path, nameFile, url, callBack){

    if(window.cordova){
    	$cordovaFile.createFile(path, nameFile, true)
            .then(function (success) {
                var targetPath = success.nativeURL;
                var trustHosts = true;
                var options = {};
				var headers = {'Connection':'close'};
				options.headers = headers;
				
				if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
					url = url.replace("https",'http');
			    } 
							
           $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
           .then(function (result) {
                      //successs
        	//  alert('downloadFile '+result.nativeURL);
                  callBack(result.nativeURL);
           }, function (err) {
                console.log('erreur download'+JSON.stringify(err));
                // Error
               	callBack("img/photo_top_title.jpg");
           }, function (progress) {
           });
            }, function (error) {
                // error
            	console.error('erreur create file  '+JSON.stringify(error));
            	callBack("img/photo_top_title.jpg");
            });
    }else{
    	callBack("img/photo_top_title.jpg");
    }

    };

    var deleteFile = function(nameFile, callBack){
       var isWindowsPhone = ionic.Platform.isWindowsPhone();
       var path="";
       if(window.cordova){
    	   if( /Android|BlackBerry Mini/i.test(navigator.userAgent) ) {
    		   path = cordova.file.applicationStorageDirectory;
    	   } else if (isWindowsPhone) {
    		   path = "/";
    	   }else{
    		   path = cordova.file.dataDirectory;
    	   }
       }
       $cordovaFile.removeFile(path, nameFile)
       			.then(function (success) {
             	  callBack();
       			}, function (error) {
                 // error
       				// console.log('erreur remove'+error.message);
       				callBack();
       			});
    };
        /**
         * create path en params
         */
    var createPath = function(path, callBack){
    	var isWindowsPhone = ionic.Platform.isWindowsPhone();
    		if(window.cordova){
    			if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
    				directoryRoot = cordova.file.applicationStorageDirectory;
    			}else if (isWindowsPhone) {
    				directoryRoot = "//";
    			} else {
    				directoryRoot = cordova.file.dataDirectory;
    			}
    	    $cordovaFile.checkDir(directoryRoot, path)
             		.then(function (success) {
             			directoryRoot = success.nativeURL;
             			callBack(success.nativeURL);
             		}, function (error) {
                    // error
             $cordovaFile.createDir(directoryRoot, path, true)
             		.then(function (success) {
                        // success
             			directoryRoot = success.nativeURL;
                        callBack(directoryRoot);
             		}, function (error) {
                        // error
             		});
             		});
    		}else{
    			callBack("");
    		}
    };
     /**
      * check if photo exist in the good location
      */
     var checkExistFile = function (nameFile, callBack) {
         var isWindowsPhone = ionic.Platform.isWindowsPhone();
             if (window.cordova) {
                 if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                     path = cordova.file.applicationStorageDirectory;
                 }else if (isWindowsPhone) {
    	             path = "//";
	              } else {
                     path = cordova.file.dataDirectory;
                 }

                         $cordovaFile.checkFile(path, nameFile)
                         .then(function (success) {
                             // success
                        		  callBack(success.nativeURL);
                         }, function (error) {
                             // error
                        	 callBack("img/photo_top_title.jpg");

                         });
                     }
     };

     var checkExistFileCusto = function (nameFile, callBack) {
         var isWindowsPhone = ionic.Platform.isWindowsPhone();

             if (window.cordova) {
                 if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                     path = cordova.file.applicationStorageDirectory+"/custo/";
                 }else if (isWindowsPhone) {
    	             path = "//"+"/custo/";
	              } else {
                     path = cordova.file.dataDirectory+"/custo/";
                 }
                         $cordovaFile.checkFile(path, nameFile)
                         .then(function (success) {
                             // success

                        		  callBack(success.nativeURL);

                         }, function (error) {
                             // error
                        	 callBack("img/buzcard-online.png");

                         });
                     }


     };

   return {
	   getPicture : getPicture,
	   RenamePicture : RenamePicture,
	   downloadFile : downloadFile,
	   createPath:createPath,
	   checkExistFile:checkExistFile,
	   deleteFile:deleteFile,
	   checkExistFileCusto:checkExistFileCusto,
	  };
}]);
