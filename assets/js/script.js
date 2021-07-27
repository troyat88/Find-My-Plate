//Headers information required by the rapid api.
const headers = {
    "x-api-key": "0b686874e0bcbe80f5eabcfc65de520b",
    "x-rapidapi-key": "5e922e6790msh2246e4b31f234a3p150363jsn9bc00953d94a",
    "x-rapidapi-host": "documenu.p.rapidapi.com"
};

const formEl = document.querySelector('#user-form');

//Event handler function for the user's input form.
const formSubmitHandler = event => {
    event.preventDefault();
    $('#menu-details').hide();

    //First we get the latitude and longitude for the user's location
    const sucessCallback = position => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        var cuisine = document.querySelector('#cuisine').value;
        var distance = document.querySelector('#distance').value;

        //Build the request Url for the rapid restaurant search api.
        var requestUrl = "https://documenu.p.rapidapi.com/restaurants/search/geo?lat=" + lat + "&lon=" + lng + "&size=10&page=1";

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

    navigator.geolocation.getCurrentPosition(sucessCallback);
}

//Get list of restaurants from restaurant API.
const GetRestaurants = requestUrl => {
    fetch(requestUrl, {
            "method": "GET",
            "headers": headers
        })
        .then(response => {
            return response.json();
        }).then(data => {
            if (data.data.length > 0) {
                ShowRestaurantInfo(data.data);
            }
        })
        .catch(err => {
            console.error(err);
        });
}

//Show restaurant info
const ShowRestaurantInfo = restaurants => {
    var restaurantDisplayEl = $('#restaurant-display');
    var restaurantHeaderEl = $('#restaurant-header');
    var restaurantDetailsEl = $('#restaurant-details')
    restaurantDisplayEl.empty();
    restaurantHeaderEl.empty();
    restaurantDetailsEl.empty();

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

const restaurantClickHandler = restaurant => {
    var restaurantDetailEl = $('#restaurant-details');
    restaurantDetailEl.empty();
    var restaurantName = restaurant.restaurant_name;
    var restaurantAddress = restaurant.address.formatted;
    var restaurantPhoneNumber = restaurant.restaurant_phone;
    var restaurantHours = restaurant.hours;
    var restaurantWebsite = restaurant.restaurant_website;
    var restaurantid = restaurant.restaurant_id;
    var lat = restaurant.geo.lat;
    var lng = restaurant.geo.lon;

    restaurantDetailEl.append(`<p>Name: ${restaurantName}</p>`);
    restaurantDetailEl.append(`<p>Address: ${restaurantAddress}</p>`);
    restaurantDetailEl.append(`<p>Phone: ${restaurantPhoneNumber}</p>`);
    if (restaurantHours) {
        restaurantDetailEl.append(`<p>Hours: ${restaurantHours}</p>`);
    }

    if (restaurantWebsite) {
        restaurantDetailEl.append(`<p>Website: <a href="${restaurantWebsite}" target="_blank">${restaurantWebsite}</a></p>`);
    }

    restaurantDetailEl.append('<button id="view-map" class="w3-round-large">View Map</button>');

    //Shoe resturant menu
    GetMenu(restaurantid)

    var detailsButtonEl = restaurantDetailEl.children('#view-map');

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
    //get element  
    var menuheaderEl = $('#menu-header')
    var menuEl = $('#menuitem-details')

    //clear menu data before update new data
    menuheaderEl.empty();
    menuEl.empty();
    $('#menu-details-tbl').DataTable().rows().clear().draw();

    if (menu.length > 0) {
        //add menu item table header
        var headerRowEl = $('<tr>');
        var headeritemnameTdEl = $('<th>').text("Menu item");
        var headeritempriceTdEl = $('<th>').text("Price");
        var headeritemdescTdEl = $('<th>').text("Description");
        headerRowEl.append(
            headeritemnameTdEl,
            headeritempriceTdEl,
            headeritemdescTdEl
        );
        menuheaderEl.append(headerRowEl);

        //add menu items
        for (var i = 0; i < menu.length; i++) {
            var menuRowEl = $('<tr>').addClass('menu-row');
            menuRowEl.attr('menuIndex', i);
            var itemnameTdEl = $('<td>').text(menu[i].menu_item_name);
            var itempriceTdEl = $('<td>').text(menu[i].menu_item_price);
            var itemdescTdEl = $('<td>').text(menu[i].menu_item_description);
            menuRowEl.append(
                itemnameTdEl,
                itempriceTdEl,
                itemdescTdEl
            );
            menuEl.append(menuRowEl);
        }
        $(document).ready(function() {
            $('#menu-details-tbl').DataTable();
        });

        $('#menu-details').show();
    } else {
        $('#menu-details').hide();
    }
}

//Add event listener on the user's form.
formEl.addEventListener('submit', formSubmitHandler);