// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving
// Angular modules
// 'starter' is the name of this angular module example (also set in a <body>
// attribute in index.html)
// the 2nd parameter is an array of 'requires'
var appContext = angular.module('appContext', ['ionic', 'ngCordova', 'ngIOS9UIWebViewPatch', 'pascalprecht.translate', 'angucomplete', 'ionic-datepicker', 'ionic-toast'])
//rendre l'object state publique : $rootScope, $state, $stateParams
    .run(function ($ionicPlatform, $rootScope, $state, $cordovaStatusbar) {
        var isWindowsPhone = ionic.Platform.isWindowsPhone();
        $rootScope.$state = $state;

        /**
         *
         */
        $rootScope.isBackgroudRuning = false;
        $rootScope.isDelta = false;
        /**
         *
         */
        $ionicPlatform.registerBackButtonAction(function (event) {
          event.preventDefault();
          if ($state.current.name == "app.qrcode") {
            // do something for this state
          } else {
            navigator.app.backHistory();
          }
          //alert("back button action handler");
        }, 999);
        $ionicPlatform.ready(function () {

            setTimeout(function () {
                if (window.cordova) {
                    navigator.splashscreen.hide();
                }
            }, 100);
            if (window.cordova) {
                if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    cordova.plugins.backgroundMode.setDefaults({silent: true});
                } else {
                    cordova.plugins.backgroundMode.setDefaults({text: ''});
                }

                cordova.plugins.backgroundMode.enable();
                /**
                 * background
                 */

                cordova.getAppVersion(function (version) {
                    $rootScope.versionApp = version;
                });
            }
            if (window.cordova) {
                if (!isWindowsPhone) {
                    $cordovaStatusbar.overlaysWebView(true);
                    // styles: Default : 0, LightContent: 1, BlackTranslucent: 2, BlackOpaque: 3
                    $cordovaStatusbar.style(3);
                    // supported names: black, darkGray, lightGray, white, gray, red, green,
                    // blue, cyan, yellow, magenta, orange, purple, brown
                    $cordovaStatusbar.styleColor('black');
                    $cordovaStatusbar.styleHex('#000');
                    $cordovaStatusbar.show();
                } else {
                    $cordovaStatusbar.overlaysWebView(false);
                    $cordovaStatusbar.hide();
                }

            }

            if (window.cordova) {
                if (/Android|BlackBerry Mini/i.test(navigator.userAgent)) {
                    $rootScope.path = cordova.file.applicationStorageDirectory;
                } else if (isWindowsPhone) {
                    $rootScope.path = "//";
                } else {
                    $rootScope.path = cordova.file.dataDirectory;
                }
            }
            $rootScope.buzcardEdit = 0;
            $rootScope.contactEdit = 0;
            $rootScope.renameGroup = 0;
            $rootScope.buzcardSend = 0;
            $rootScope.buzcardPhoto = 0;
            $rootScope.contactPhoto = 0;
            $rootScope.contactDelete = 0;
            $rootScope.urgencyEdit = 0;
            $rootScope.urgencyPhoto = 0;
            $rootScope.qrCode = 0;
            $rootScope.buzwardSend = 0;
            $rootScope.createContact = 0;
            $rootScope.importContact = 0;
            $rootScope.requestAutorisecamera = 0;
            $rootScope.requestAutorisePhoto = 0;
            $rootScope.requestAutoriseCalender = 0;
            $rootScope.requestAutoriseContact = 0;


            /**
             * Hide the accessory bar by default (remove this to show the accessory bar
             * above the keyboard
             * for form inputs)
             */
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            }

        });

    }).config(function ($stateProvider, $urlRouterProvider, $httpProvider, $compileProvider, $ionicConfigProvider, $translateProvider) {

        $ionicConfigProvider.views.swipeBackEnabled(false);
        //$ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.views.forwardCache(true);

        $httpProvider.defaults.withCredentials = true;

        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension|x-wmapp.?):|data:image\//);
        $ionicConfigProvider.views.maxCache(10);


        var langue = navigator.language.substring(0, 2);
        if (langue == 'fr') {
            $translateProvider.preferredLanguage('fr');
        } else {
//  var langue = navigator.language.substring(0,2);
            $translateProvider.preferredLanguage('en');
        }

        $translateProvider.useStaticFilesLoader({
            prefix: 'translate/local-',
            suffix: '.json'
        });


        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "app/menu/menu.html",
                controller: 'MenuController',

            })
            .state('app.loading', {
                url: '/loading',
                views: {
                    'menuContent': {
                        templateUrl: 'app/startup/partials/loading.html',
                        controller: 'LoadingController',

                    }
                },
                data: {
                    requireLogin: false
                }
            }).state('app.login', {
            url: '/login',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/login/partials/Login.html',
                    controller: 'LoginController',

                }
            },
            data: {
                requireLogin: false
            }
        }).state('app.createAccount', {
            url: '/createAccount',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/login/partials/createAccount.html',
                    controller: 'createAccountController',

                }
            },
            data: {
                requireLogin: false
            }
        }).state('app.synchro', {
            url: '/synchro',
            views: {
                'menuContent': {
                    templateUrl: 'app/synchro/partials/Synchronisation.html',
                    controller: 'SynchroController',
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.buzcard', {
            url: '/buzcard',
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'app/buzcard/partials/Buzcard.html',
                    controller: 'BuzcardController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.buzcardEdit', {
            url: '/buzcardEdit',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/buzcard/partials/BuzcardEdit.html',
                    controller: 'BuzcardEditController'
                }
            },

            data: {
                requireLogin: true
            }
        }).state('app.buzcardSend', {
            url: '/buzcardSend',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/buzcard/partials/BuzcardSend.html',
                    controller: 'BuzcardSendController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.contactList', {
            url: '/contactList',
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'app/contacts/partials/contactList2.html',
                    controller: 'ContactListController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.creditParrainage', {
            url: '/creditParrainage',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/parrainage/partials/creditParrainage.html',
                    controller: 'creditParrainageController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.contactEdit', {
            url: '/contactEdit/{id:int}',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/contacts/partials/ContactEdit2.html',
                    controller: 'ContactEditController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.contactCreate', {
            url: '/contactCreate/',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/contacts/partials/contactCreate.html',
                    controller: 'ContactCreateController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.contactShow', {
            url: '/contactShow/{id:int}',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/contacts/partials/contactShow2.html',
                    controller: 'ContactShowController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.commandes', {
            url: '/commandes',
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'app/commandes/partials/FAQ.html',
                    controller: 'CommandesController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.qrcode', {
            url: '/qrcode',
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'app/qrcode/partials/business.html',
                    controller: 'QrCodeController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.mesqrcodes', {
            url: '/mesqrcodes',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/qrcode/partials/MesQRcodes.html',
                    controller: 'MesQrCodesController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.urgencyIndex', {
            url: '/urgency',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/urgency/partials/urgency-index.html',
                    controller: 'UrgencyIndexController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.urgency', {
            url: '/urgency',
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'app/urgency/partials/urgency-new.html',
                    controller: 'UrgencyController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.urgencyEdit', {
            url: '/urgencyEdit',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/urgency/partials/urgency-edit-new.html',
                    controller: 'UrgencyEditController'
                }
            },

            data: {
                requireLogin: true
            }
        }).state('app.confidential', {
            url: '/confidential',
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'app/confidential/confidential.html',
                    controller: 'ConfidentialController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.buzward', {
            url: '/buzward/{id:int}',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/buzward/partials/buzward.html',
                    controller: 'BuzwardController'
                }
            },
            data: {
                requireLogin: true
            }
        }).state('app.multi', {
            url: '/multi',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'app/multi/partials/multi.html',
                    controller: 'MultiController'
                }
            },
            data: {
                requireLogin: true
            }
        });

        $urlRouterProvider.otherwise('/app/loading');
    }).filter('removeSeconds', function () {
        return function (input) {

            try {
                var result;
                result = input.substring(0, input.lastIndexOf(":"));
                return result;
            } catch (e) {
                return input;
            }
        };
    })
    .filter('escape', function () {
        return function (input) {
            try {
                if (input)
                    return input.replace(/#A#/g, '\'')
                        .replace(/#AA#/g, '\"');
            } catch (e) {

            }


        };
    }).filter("toFrFormat", function ($translate) {

        //Defining the filter function
        return function (input) {

            var result = "";
            input = input || "";

            try {
                var array1 = input.split("/");
                var array2 = array1[2].split(" ");
                var array3 = array2[1].split(":");
                if (array1[1].length == 1)
                    array1[1] = "0" + array1[1];
                if (array1[0].length == 1)
                    array1[0] = "0" + array1[0];
                if (array3[0].length == 1)
                    array3[0] = "0" + array3[0];
                if (array2[2] == "PM" && array3[0] != "12")
                    array3[0] = parseInt(parseInt(array3[0]) + 12);
                if (array2[2] == "AM" && array3[0] == "12") {
                    array3[0] = '00';
                }
                result = array1[1] + "/" + array1[0] + "/" + array2[0] + $translate.instant('FormatFR') + array3[0] + ":" + array3[1];
                return result;

            } catch (e) {
// 				console.error(e);
                return input;
            }
        };
    })
    .filter("toFormatEmail", function () {
        return function (input) {
            try {
                if (input.length > 24) {
                    var mail = input.substr(0, input.lastIndexOf('@')) + '\n' + input.substr(input.lastIndexOf('@'), input.length + 1)
                    return mail.trim();
                } else {
                    return input.trim();
                }
            } catch (e) {
//				console.error(e);
                return input;
            }
        };
    })
    .filter("toTiret", function ($translate) {
        return function (input) {
            if (typeof input != "undefined") {
                var result = "";
                if (input.trim() == "" || input.trim() == $translate.instant('ContactEdit.SearchGPS') || input.trim() == "undefined" || input.trim() == $translate.instant('No-place')) {
                    return result;
                } else {
                    try {
                        var adress = input.split(',');
                        var ville = adress[adress.length - 2].split(' ');
                        var adr = "";
                        for (var i = 0; i < ville.length; i++) {
                            adr += " " + ville[i];
                        }
                        return "- " + adr;
                    } catch (e) {
                        return result;
                    }


                }
            } else {
                return input;
            }

        }
    })
    .filter("toPlace", function ($translate) {
        return function (input) {

            var result = "";
            if (input.trim() == "" || input == $translate.instant('ContactEdit.SearchGPS') || input.trim() == "undefined" || input.trim() == $translate.instant('No-place')) {
                return result;
            } else {
                try {
                    var adress = input.split(',');
                    //alert(input+'  '+adress[adress.length-2]);
                    var ville = adress[adress.length - 2].split(' ');
                    var adr = "";
                    //alert(ville.length);
                    for (var i = 0; i < ville.length; i++) {
                        //console.log(ville[i]);
                        if (Number(ville[i]) || ville[i].indexOf('00') != -1) {

                        } else {
                            adr += " " + ville[i];
                        }
                    }
                    //alert(ville[0]+' '+ville[ville.length-1]);
                    //	console.log(adress[adress.length-2]+'-----'+adress);
                    return " à " + input;
                } catch (e) {
                    return result;
                }


            }
        }
    })
    .filter("toFrFormat1", function ($translate) {

        //Defining the filter function
        return function (input) {

            var result = "";
            input = input || "";

            try {

                var array1 = input.split("/");
                var array2 = array1[2].split(" ");
                var array3 = array2[1].split(":");
                if (array1[1].length == 1)
                    array1[1] = "0" + array1[1];
                if (array1[0].length == 1)
                    array1[0] = "0" + array1[0];
                if (array3[0].length == 1)
                    array3[0] = "0" + array3[0];
                if (array2[2] == "PM" && array3[0] != "12")
                    array3[0] = parseInt(parseInt(array3[0]) + 12);
                result = array1[1] + "/" + array1[0] + "/" + array2[0] + " à " + array3[0] + ":" + array3[1];
                return result;

            } catch (e) {
// 				console.error(e);
                return input;
            }
        };
    })
    .filter("getAge", function ($translate) {
        return function (input) {
            try {
                if (input == "" || isNaN(input)) {
                    console.warn("ifff");
                    return "";

                } else {
                    var rtn = "";
                    rtn = new Date().getFullYear() - input;
                    console.warn(rtn);
                    return rtn + " " + $translate.instant('Urgency.year')
                }

            } catch (e) {
                console.error(e);
                return "";
            }
        };
    })
    .filter("MeetingFilter", function ($translate) {
        return function (input) {
            try {
                if (input.trim() == "" || input == $translate.instant('ContactEdit.SearchGPS') || input.trim() == "undefined" || input.trim() == $translate.instant('No-place')) {

                    return "";

                } else {
                    var adress = input.split(',');
                    var add1 = adress[0];
                    var ville = "";
                    for (var i = 1; i < adress.length; i++) {
                        ville += ' ' + adress[i];
                    }
                    return '\n@ ' + add1 + '\n' + ville;
                }


            } catch (e) {
                console.error(e);
                return "";
            }
        };
    }).filter("formatStringnull", function () {
        return function (input) {
            try {
                if (input.trim() == "" || input.trim() == "null") {

                    return "";

                } else {

                    return input;
                }

            } catch (e) {
                console.error(e);
                return "";
            }
        };
    })
    .filter("grpFormat", function ($translate) {
        return function (input) {
            try {
                if (input.trim() == "") {

                    return "";

                } else {

                    return $translate.instant('grpAssociate') + ' ' + input;
                }

            } catch (e) {
                console.error(e);
                return "";
            }
        };
    }).filter("capitalize", function () {
        return function (input) {
            return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }

    }).filter("htmlSafe", ['$sce', function ($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };
    }]).filter("toEnFormat", function(){
      return function (input) {
        var result = "";
        input = input || "";

        try {
          var array1 = input.split("/");
          return array1[1]+'/'+array1[0]+'/'+array1[2]
        }catch (e) {

          return input

        }

      }
  });

/**
 * special character escape
 */
function addSlashes(string) {
    try {
        if (typeof string !== 'undefined' && typeof string != null)
            return string
                .replace(/'/g, '\#A#')
                .replace(/"/g, '\#AA#');
        else
            return string;
    } catch (e) {
        console.error("---- error -----");
        console.error(e);
        return string;
    }

};

/**
 *
 * @param input
 * @returns
 */
function removeSlashes(input) {
    try {
        if (typeof input !== 'undefined' && typeof input == "string")
            return input.replace(/#A#/g, '\'')
                .replace(/#AA#/g, '\"');
        else return input;
    } catch (e) {
        return input;
    }

};

String.prototype.capitalize = function () {
    if (this != null || this != "")
        return this.charAt(0).toUpperCase() + this.slice(1);
    else
        return this;
}


function decomposeEmail(email) {


    var kowingDoaminsArray = ["yahoo", "outlook", "inbox", "mac", "me", "wanadoo", "orange", "free", "aol", "cegetel", "sfr", "bouygues", "laposte", "msn", "zoho", "gmx", "lycos", "yandex", "hotmail", "gmail", "Gmail"];
    var returnArray = [];
    var emailArray = email.split('@');
    //domain section
    var contain = false;
    var domainArray = emailArray[1].split(".");
    for (var i = 0; i < kowingDoaminsArray.length; i++)
        if (domainArray[0] == kowingDoaminsArray[i])
            contain = true;
    if (contain) {
        returnArray[2] = "";
    } else {
        var domainArray = emailArray[1].split(".");
        var org = "";
        if (domainArray.length > 2) {
            for (var i = 0; i < domainArray.length - 1; i++)
                org = org + domainArray[i].split('-').join(" ") + "."
            returnArray[2] = org.substring(0, org.length - 1);
        } else
            returnArray[2] = domainArray[0].split('-').join(" ");
    }
    //person section
    personArray = emailArray[0].split('.');
    returnArray[0] = personArray[0];
    if (personArray[1] != undefined) {
        returnArray[1] = personArray[1];
    } else {
        returnArray[1] = "";
    }
      console.log(returnArray)
    return returnArray;
};
