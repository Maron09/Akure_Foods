let autocomplete;

function initAutoComplete(){
autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('id_address'),
    {
        types: ['geocode', 'establishment'],
        //default in this app is "IN" - add your country code
        componentRestrictions: {'country': ['NG']},
    })
// function to specify what should happen when the prediction is clicked
autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged (){
    var place = autocomplete.getPlace();

    // User did not select the prediction. Reset the input field or alert
    if (!place.geometry) {
        document.getElementById('id_address').placeholder = 'Start typing...';
    }
    else{
        // console.log('place name=>', place.name)
    }

    // console.log(place);

    var geocoder = new google.maps.Geocoder()
    var address = document.getElementById('id_address').value;

    geocoder.geocode({'address': address}, function(results, status){
        // console.log('results=>', results)
        // console.log('status=>', status)
        if (status == google.maps.GeocoderStatus.OK) {
            var latitude = results[0].geometry.location.lat();
            var longitude = results[0].geometry.location.lng();

            $('#id_latitude').val(latitude);
            $('#id_longitude').val(longitude);

            $('#id_address').val(address);
        }
    });

    // Loop through the address components and assign other address data
    console.log(place.address_components)
    for (var i = 0; i < place.address_components.length; i++) {
        for(var j = 0; j < place.address_components[i].types.length; j++) {
            // country
            if (place.address_components[i].types[j] == 'country') {
                $('#id_country').val(place.address_components[i].long_name);
            }
            // state
            if (place.address_components[i].types[j] == 'administrative_area_level_1') {
                $('#id_state').val(place.address_components[i].long_name);
            }
            // city
            if (place.address_components[i].types[j] == 'locality') {
                $('#id_city').val(place.address_components[i].long_name);
            }
            // pin code
            if (place.address_components[i].types[j] == 'postal_code') {
                $('#id_pin_code').val(place.address_components[i].long_name);
            }
        }
        
    }
}

$(document).ready(function () {
    // Add to cart
    $('.add_to_cart').on('click', function (e) {
        e.preventDefault();

        let food_id = $(this).attr('data-id');
        let url = $(this).attr('data-url');

        $.ajax({
            type: 'GET',
            url: url,
            success: function(response) {
                console.log(response);
                if (response.status === 'login_required') {
                    swal(response.message, '', 'info').then(function () {
                        window.location = '/login';
                    });
                } else if (response.status === 'Failed') {
                    swal(response.message, '', 'error');
                } else {
                    $('#cart_counter').html(response.cart_counter['cart_count']);
                    $('#qty-' + food_id).html(response.qty);
                    cartAmount(response.cart_amount.subtotal, response.cart_amount.tax, response.cart_amount.grand_total);
                }
            }
        });
    });

    // Place cart item quantity
    $('.item_qty').each(function () {
        let the_id = $(this).attr('id');
        let qty = $(this).attr('data-qty');
        $('#' + the_id).html(qty);
    });

    // Decrease Cart
    $('.decrease_cart').on('click', function (e) {
        e.preventDefault();

        let food_id = $(this).attr('data-id');
        let url = $(this).attr('data-url');
        let cart_id = $(this).attr('id');

        $.ajax({
            type: 'GET',
            url: url,
            success: function(response) {
                console.log(response);
                if (response.status === 'login_required') {
                    swal(response.message, '', 'info').then(function () {
                        window.location = '/login';
                    });
                } else if (response.status === 'Failed') {
                    swal(response.message, '', 'error');
                } else {
                    $('#cart_counter').html(response.cart_counter.cart_count);
                    $('#qty-' + food_id).html(response.qty);
                    cartAmount(response.cart_amount.subtotal, response.cart_amount.tax, response.cart_amount.grand_total);
                    if (window.location.pathname === '/cart/') {
                        removeCartItem(response.qty, cart_id);
                        checkEmptyCart();
                    }
                }
            }
        });
    });

    // Delete cart item
    $('.delete_cart').on('click', function (e) {
        e.preventDefault();

        let cart_id = $(this).attr('data-id');
        let url = $(this).attr('data-url');

        $.ajax({
            type: 'GET',
            url: url,
            success: function(response) {
                console.log(response);
                if (response.status === 'Failed') {
                    swal(response.message, '', 'error');
                } else {
                    $('#cart_counter').html(response.cart_counter.cart_count);
                    swal(response.status, response.message, 'success');
                    cartAmount(response.cart_amount.subtotal, response.cart_amount.tax, response.cart_amount.grand_total);
                    removeCartItem(0, cart_id);
                    checkEmptyCart();
                }
            }
        });
    });

    // Remove cart item if the quantity is 0
    function removeCartItem(cartItemQty, cart_id) {
        if (cartItemQty <= 0) {
            document.getElementById("cart-item-" + cart_id).remove();
        }
    }

    // Check if cart is empty
    function checkEmptyCart() {
        let cart_counter = document.getElementById("cart_counter").innerHTML;
        if (cart_counter == 0) {
            document.getElementById("empty-cart").style.display = 'block';
        }
    }

    // Update cart amount
    function cartAmount(subtotal, tax, grand_total) {
        if (window.location.pathname === '/cart/') {
            $('#subtotal').html(subtotal);
            $('#tax').html(tax);
            $('#total').html(grand_total);
        }
    }
    // Add opening hours
    $('.add_hour').on('click', function(e){
        e.preventDefault();
        var day = document.getElementById('id_day').value;
        var from_hour = document.getElementById('id_from_hour').value;
        var to_hour = document.getElementById('id_to_hour').value;
        var is_closed = document.getElementById('id_is_closed').checked; //its a checkbox so we can't get the value and it will return false or true
        var csrf_token = $('input[name=csrfmiddlewaretoken').val() //we use val() because it is jquery
        var url = document.getElementById('add_hour_url').value

        console.log(day, from_hour, to_hour,is_closed, csrf_token)

        if(is_closed){
            is_closed = 'True'
            condition = "day != ''"
        }else{
            is_closed = 'False'
            condition = "day != '' && from_hour != '' && to_hour != ''"
        }

        // we call the eval function before adding the condition because it is a variable
        if (eval(condition)){
            $.ajax({
                type: 'POST',
                url: url,
                data:{
                    'day': day,
                    'from_hour': from_hour,
                    'to_hour': to_hour,
                    'is_closed': is_closed,
                    'csrfmiddlewaretoken': csrf_token //this ajax function gets the data and passes it to the add hours url like not refreshing the page
                },
                success: function(response){
                    if (response.status == 'success') {
                        if (response.is_closed == 'Closed') {
                            html = '<tr id="hour-'+response.id+'"><td><b>'+response.day+'</b></td><td>Closed</td><td><a href="#" class="remove_hour" data-url="/vendor/open_hours/remove/'+response.id+'/">Remove</a></td></tr>';
                        }else{
                            html = '<tr id="hour-'+response.id+'"><td><b>'+response.day+'</b></td><td>'+response.from_hour+' - '+response.to_hour+'</td><td><a href="#" class="remove_hour" data-url="/vendor/open_hours/remove/'+response.id+'/">Remove</a></td></tr>';
                        }
                        $('.opening_hours').append(html)
                        document.getElementById('opening_hours').reset();// what happens here is the response gotten we are appending it to the html and reseting the page
                    } else{
                        swal(response.message, '', "error")
                    }
                }
            })
        }else{
            swal("please fill all fields", '', 'info')
        }
    })

    
    $(document).on('click', '.remove_hour', function(e){
        e.preventDefault();
        url = $(this).attr('data-url');
        
        
        $.ajax({
            type: 'GET',
            url: url,
            success: function(response){
                if(response.status == 'success'){
                    document.getElementById('hour-'+response.id).remove();
                }
            }
        })
    });
    // document ready close
});