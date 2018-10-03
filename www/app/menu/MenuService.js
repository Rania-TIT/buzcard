appContext.factory("MenuService", [function() {

    /**
     * read from localStorage
     */
    var getLocalStorage = function(index) {

        try {
//        	// console.log('getLocalStorage ');
            if (window.localStorage[index])
                return JSON.parse(localStorage[index]);
            else
                return false;
        } catch (e) {
            // console.log('getLocalStorage Error : ' + e);
            return false;
        }

    };
    /**
     * write to localStorage
     */
    var setLocalStorage = function(index, value) {
        try {

            localStorage[index] = JSON.stringify(value);
            if (localStorage[index] == JSON.stringify(value))
                return true;
            else
                return false;
        } catch (e) {
            // console.log('setLocalStorage Error : ' + e);
            return false;
        }
    };

    /**
     * generate now date mm/dd/yyyy hh:mm
     */
    var getDateUS = function() {

    	return moment().tz("Europe/Paris").format("MM/DD/YYYY HH:mm:ss");
    };
    return {
        getLocalStorage: getLocalStorage,
        setLocalStorage: setLocalStorage,
        getDateUS: getDateUS,
    };

}]);
