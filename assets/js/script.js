//Headers information required by the rapid api.
const headers = {
    "x-api-key": "3ce48efe965c39226846b567978d8871",
    "x-rapidapi-key": "5e922e6790msh2246e4b31f234a3p150363jsn9bc00953d94a",
    "x-rapidapi-host": "documenu.p.rapidapi.com"
};

//Select place holder elements.
const formEl = document.querySelector('#user-form');
var restaurantDisplayEl = $('#restaurant-display');
var restaurantHeaderEl = $('#restaurant-header');
var restaurantDetailsEl = $('#restaurant-details')
var menuDetailsEl = $('#menu-details');
var menuheaderEl = $('#menu-header')
var menuEl = $('#menuitem-details')
var searchby = document.getElementById("searchby");
$("#byzipcode").hide();

var lastCuisineSearch = localStorage.getItem("cuisine");
if (lastCuisineSearch !== null) {
    document.querySelector('#cuisine').value = lastCuisineSearch;
}

var userCurrentPosition = {
    lat: 0,
    lng: 0
}

const setUserCurrentPosition = position => {
    userCurrentPosition.lat = position.coords.latitude;
    userCurrentPosition.lng = position.coords.longitude;
}

//First we get the latitude and longitude for the user's location
navigator.geolocation.getCurrentPosition(setUserCurrentPosition);

//Function to reset the RestaurantInfo table.
const ResetRestaurantInfo = () => {
    restaurantDisplayEl.empty();
    restaurantHeaderEl.empty();
}

//Function to reset the restaurant details section.
const ResetRestaurantDetailsSection = () => {
    restaurantDetailsEl.empty();
    restaurantDetailsEl.show();
}

//Function to reset the menu items table.
const ResetMenuItemsTable = () => {
    menuheaderEl.empty();
    menuEl.empty();
    menuDetailsEl.hide();
}

//Event handler function for the user's input form.
const formSubmitHandler = event => {
    event.preventDefault();

    //Clear restaurant data.
    ResetRestaurantInfo();
    ResetRestaurantDetailsSection();
    ResetMenuItemsTable();

    console.log(userCurrentPosition);

    const lat = userCurrentPosition.lat;
    const lng = userCurrentPosition.lng;
    var cuisine = document.querySelector('#cuisine').value;
    var distance = document.querySelector('#distance').value;
    var restaurantName = document.querySelector('#restaurant-name').value;
    var zip = document.querySelector('#zip').value;
    localStorage.setItem("cuisine", cuisine);

    if (searchby.value === "zipcode") {
        console.log("GetResturantByNameAPI");
        GetResturantByNameAPI(restaurantName, zip, cuisine)
    } else {
        console.log("GetResturantByGeoAPI");
        GetResturantByGeoAPI(lat, lng, distance, cuisine)
    };
}

//Get list of restaurants from restaurant API then show them.
const GetRestaurants = requestUrl => {
    console.log("GetRestaurants");
    fetch(requestUrl, {
            "method": "GET",
            "headers": headers
        })
        .then(response => {
            return response.json();
        }).then(data => {
            ShowRestaurantInfo(data.data);
        })
        .catch(err => {
            console.error(err);
        });
}

//Show restaurant info
const ShowRestaurantInfo = restaurants => {
    ResetRestaurantInfo();

    if (restaurants.length > 0) {
        //add menu item table header
        var restaurantHeaderRowEl = $('<tr>');
        var restaurantNamHeaderEl = $('<th>').text("Name");
        var restaurantAddressHeaderEl = $('<th>').text("Address");
        var restaurantPhoneNumberHeaderEl = $('<th>').text("Phone Number");
        restaurantHeaderRowEl.append(
            restaurantNamHeaderEl,
            restaurantAddressHeaderEl,
            restaurantPhoneNumberHeaderEl
        );
        restaurantHeaderEl.append(restaurantHeaderRowEl);

        //Add each restaurant found in search to the table
        for (var i = 0; i < restaurants.length; i++) {
            var restaurantRowEl = $('<tr>').addClass('restaurant-row');
            restaurantRowEl.attr('restaurantIndex', i);
            var restaurantNameTdEl = $('<td>').text(restaurants[i].restaurant_name);
            var restaurantAddressTdEl = $('<td>').text(restaurants[i].address.formatted);
            var restaurantPhoneTdEl = $('<td>').text(restaurants[i].restaurant_phone);
            restaurantRowEl.append(
                restaurantNameTdEl,
                restaurantAddressTdEl,
                restaurantPhoneTdEl
            );
            restaurantDisplayEl.append(restaurantRowEl);
        }

        //Add event listener when user clicks on a restaurant row
        restaurantDisplayEl.on('click', '.restaurant-row', event => {
            $('.restaurant-row').each((a, b) => {
                $(b).click(function() {
                    $('.restaurant-row').css('background', '#ffffff');
                    $(this).css('background', '#008080');
                });
            });
            var restaurantIndex = event.currentTarget.attributes['restaurantIndex'].value;
            restaurantClickHandler(restaurants[restaurantIndex]);
        });
    }
}

//Restaurant onclick event handler.
const restaurantClickHandler = restaurant => {
    console.log("restaurantClickHandler", restaurant)
    ResetRestaurantDetailsSection();
    ResetMenuItemsTable();

    var restaurantName = restaurant.restaurant_name;
    var restaurantAddress = restaurant.address.formatted;
    var restaurantPhoneNumber = restaurant.restaurant_phone;
    var restaurantHours = restaurant.hours;
    var restaurantWebsite = restaurant.restaurant_website;
    var restaurantid = restaurant.restaurant_id;
    var lat = restaurant.geo.lat;
    var lng = restaurant.geo.lon;

    restaurantDetailsEl.append(`<p>Name: ${restaurantName}</p>`);
    restaurantDetailsEl.append(`<p>Address: ${restaurantAddress}</p>`);
    restaurantDetailsEl.append(`<p>Phone: ${restaurantPhoneNumber}</p>`);
    if (restaurantHours) {
        restaurantDetailsEl.append(`<p>Hours: ${restaurantHours}</p>`);
    }

    if (restaurantWebsite) {
        restaurantDetailsEl.append(`<p>Website: <a href="${restaurantWebsite}" target="_blank">${restaurantWebsite}</a></p>`);
    }

    restaurantDetailsEl.append('<button id="view-map" class="w3-round-large w3-teal">View Map</button>');

    //Show restaurant menu
    GetMenu(restaurantid)

    var detailsButtonEl = restaurantDetailsEl.children('#view-map');

    //Open the map and show restaurant location with marker on Google map using Google map api if user click on "View Map" button.
    detailsButtonEl.on('click', event => {
        var searchUrl = "index-search-map.html?lat=" + lat + "&lng=" + lng;
        window.open(searchUrl);
    })
}

//get menu API
const GetMenu = restaurantid => {
    var requestUrl = "https://api.documenu.com/v2/restaurant/" + restaurantid + "/menuitems";
    fetch(requestUrl, {
            "method": "GET",
            "headers": headers
        })
        .then(response => {
            return response.json();
        }).then(data => {
            ShowMenu(data.data);
        })
        .catch(err => {
            console.error(err);
        });
}

//Show Menu
const ShowMenu = menu => {
    menuEl.empty();
    menuheaderEl.empty();
    if (menu.length > 0) {
        menuDetailsEl.show();
        //add menu item table header
        var headerRowEl = $('<tr>');
        var headeritemnameTdEl = $('<th>').text("Menu item");
        var headeritempriceTdEl = $('<th>').text("Price");
        headerRowEl.append(
            headeritemnameTdEl,
            headeritempriceTdEl
        );
        menuheaderEl.append(headerRowEl);

        //add menu items
        for (var i = 0; i < menu.length; i++) {
            var menuRowEl = $('<tr>').addClass('menu-row');
            menuRowEl.attr('menuIndex', i);
            var itemnameTdEl = $('<td>').text(menu[i].menu_item_name);
            var itempriceTdEl = $('<td>').text("$ " + menu[i].menu_item_price);
            menuRowEl.append(
                itemnameTdEl,
                itempriceTdEl
            );
            menuEl.append(menuRowEl);
        }
        //Make the menu items table a JQuery dataTable.
        $(document).ready(function() {
            if (!$.fn.dataTable.isDataTable('#menu-details-tbl')) {
                $('#menu-details-tbl').DataTable();
            }
        });
    }
}

//get resturant by name API
const GetResturantByNameAPI = (restaurantName, zip, cuisine) => {
    var requestUrl = "https://api.documenu.com/v2/restaurants/search/fields?zip_code=" + zip + "&exact=false" + "&size=15&page=1";
    if (restaurantName) {
        requestUrl += "&restaurant_name=" + restaurantName;
    }

    if (cuisine) {
        requestUrl = requestUrl + "&cuisine=" + cuisine;
    }
    GetRestaurants(requestUrl);
};

//get resturant by Geo API
const GetResturantByGeoAPI = (lat, lng, distance, cuisine) => {
    //Build the request Url for the rapid restaurant search api.
    var requestUrl = "https://documenu.p.rapidapi.com/restaurants/search/geo?lat=" + lat + "&lon=" + lng + "&size=15&page=1";

    //If the user select the distance in the user's form, we filter based on the distance selected.
    if (distance) {
        requestUrl = requestUrl + "&distance=" + distance;
    }
    //If the user entered the cuisine we filtler based on the cuisine entered.
    if (cuisine) {
        requestUrl = requestUrl + "&cuisine=" + cuisine;
    }
    GetRestaurants(requestUrl);
}

//Add event listener on the user's form.
formEl.addEventListener('submit', formSubmitHandler);

searchby.addEventListener("change", function() {
    //Clear restaurant data.
    ResetRestaurantInfo();
    ResetRestaurantDetailsSection();
    ResetMenuItemsTable();

    if (searchby.value === "zipcode") {
        $("#bylocation").hide();
        $("#byzipcode").show();
    } else {
        $("#bylocation").show();
        $("#byzipcode").hide();
    }
});
