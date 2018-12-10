appContext.factory("LogService", ['$cordovaFile',
  function ($cordovaFile) {

    var saveLog = function (msg, controller) {
      var path = "";
      if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
        path = cordova.file.applicationStorageDirectory;
      } else {
        path = cordova.file.dataDirectory;
      }
      $cordovaFile.checkFile(path, "log4.txt").then(function (res) {
        var message =" > "+ new Date().toISOString() + ' | ' + msg + ' | ' + controller + "\n "
        $cordovaFile.writeExistingFile(path, "log4.txt", message)
          .then(function (success) {
            console.log(success)
          }, function (error) {
            console.log(error)
          })
      }, function (err) {
        console.log(err)
        var message =" > "+ new Date().toISOString() + ' | ' + msg + ' | ' + controller + "\n "
        $cordovaFile.writeFile(path, "log4.txt", message)
          .then(function (success) {
            console.log(success)
          }, function (error) {
            console.log(error)
          })
      })


    }

    return {
      saveLog: saveLog
    }
  }])

