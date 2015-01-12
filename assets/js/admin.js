// add new guests to the database.
$(document).ready(function() {
  var source = $("#guest-row-template").html(),
    guestRowTemplate = Handlebars.compile(source);

  function hideMessages() {
    $('#error').hide();
    $('#message').hide();
  }

  function fetchGuests() {
    $.ajax({
      type: "GET",
      url: "/guest",
      dataType: 'json',
      success: function (guests) {
        var rsvpd = $('#rsvpd');
        rsvpd.html('');
        guests.forEach(function(guest) {
          var row = guestRowTemplate(guest);
          rsvpd.append(row);
        });
      },
      error: function (err) {
        $('#error').text(JSON.parse(err.responseText));
        $('#error').slideDown();
      }
    });
  }

  function addGuest(data) {
    $.ajax({
      type: "POST",
      url: "/guest",
      dataType: 'json',
      data: data,
      success: function (body) {
        $('#message').text(body);
        $('#message').slideDown();
        fetchGuests();
      },
      error: function (err) {
        $('#error').text(JSON.parse(err.responseText));
        $('#error').slideDown();
      }
    });
  }

  $("#adminForm").on( "submit", function( event ) {
    var data = {};

    event.preventDefault();
    hideMessages();

    $(this).serializeArray().forEach(function(i) {
      data[i.name] = i.value;
    });

    addGuest(data);
  });

  fetchGuests(); // display the guestlist on load.

  $('.delete-link').live('click',  function(event) {
    event.preventDefault();

    $.ajax({
      type: "DELETE",
      url: "/guest/" + $(this).data('email'),
      dataType: 'json',
      success: function (guests) {
        fetchGuests();
      },
      error: function (err) {
        $('#error').text(JSON.parse(err.responseText));
        $('#error').slideDown();
      }
    });
  });
});
