//Google API call back function
function initMap() {
    //Call back function for navigator.geolocation.getCurrentPosition method.
    //This wil get us the coordinates (latitude,longitude) for the user's current position.
    const sucessCallback = (position) => {
        const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        //Get the map around the user's current postion.
        var map = new google.maps.Map(document.getElementById("map"), {
            center: currentPosition,
            zoom: 18,
            mapId: '6dbf17a103bba713'
        });

        //Parsing the restaurant latitude and longitude coordinates passed in the query string.
        function getPageParamValueByName(paramName) {
            return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(paramName).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
        }

        //Setting the marker position on the map just incase we can't parse the restaurant position in the query string.
        var markerPosition = currentPosition;

        var latitude = parseFloat(getPageParamValueByName("lat"));
        var longitude = parseFloat(getPageParamValueByName("lng"));

        //If we can parse the restaurant position in the query string we will make it the marker position for the restaurant.
        if (latitude && longitude) {
            markerPosition = {
                lat: latitude,
                lng: longitude
            };
        }

        //Put the marker indicate the location of the restaurant on the map.
        new google.maps.Marker({
            position: markerPosition,
            map,
            title: 'restaurant location'
        });
    }

    navigator.geolocation.getCurrentPosition(sucessCallback);
};