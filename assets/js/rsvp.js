// add new guests to the database.
$(document).ready(function() {
  if (window.location.href.indexOf('/admin') > -1) return;

  var rsvpLookupSource = $("#rsvp-lookup-template").html(),
    rsvpLookupTemplate = Handlebars.compile(rsvpLookupSource),
    rsvpUpdateSource = $('#rsvp-update-template').html(),
    rsvpUpdateTemplate = Handlebars.compile(rsvpUpdateSource);

  function hideMessages() {
    $('#error').hide();
    $('#message').hide();
  }

  function lookupGuest(email) {
    $.ajax({
      type: "GET",
      url: "/guest/" + email,
      dataType: 'json',
      success: function (guest) {
        return showForm(guest);
      },
      error: function (err) {
        $('#error').text(JSON.parse(err.responseText));
        $('#error').slideDown();
      }
    });
  }

  function updateGuest(data) {
    $.ajax({
      type: "PUT",
      url: "/guest",
      dataType: 'json',
      data: data,
      success: function (body) {
        $('#message').text(body);
        $('#message').slideDown();
        $('#rsvp-update-form').hide();
      },
      error: function (err) {
        $('#error').text(JSON.parse(err.responseText));
        $('#error').slideDown();
      }
    });
  }

  $(".comment-form").on("submit", "#email-lookup-form", function(event) {
    var data = {};

    event.preventDefault();
    hideMessages();

    $(this).serializeArray().forEach(function(i) {
      data[i.name] = i.value;
    });

    lookupGuest(data.email);
  });

  $('.comment-form').on("submit", "#rsvp-update-form", function(event) {
    var data = {};

    event.preventDefault();
    hideMessages();

    $(this).serializeArray().forEach(function(i) {
      data[i.name] = i.value;
    });

    if (validateData(data)) updateGuest(data);
  });

  $('.comment-form').on('change', '#rsvp-attending input[name=attending]', function() {
    var attending = $(this).val();

    if (attending === 'yes') $('#rsvp-additional-questions').slideDown('slow');
    else $('#rsvp-additional-questions').slideUp('slow');
  });

  (function showEmailLookup() {
    var rendered = rsvpLookupTemplate();
    $('.comment-form').html(rendered);
    setupTypeahead();
  })();

  function showForm(guest) {
    var rendered = rsvpUpdateTemplate(guest);
    $('.comment-form').html(rendered);
    $('#rsvp-update-form').slideDown('slow');
  }

  function validateData(data) {
    var result = true,
      toCheck = ['fname', 'lname'];

    $('input').removeClass('error');

    if (data.attending === 'yes') {
      toCheck.forEach(function(key) {
        if (data[key].length === 0) {
          $('#' + key).addClass('error');
          result = false;
        }
      });
    }

    return result;
  }

  function setupTypeahead() {
    // Create the engine, used to interact
    // with our search backend.
    var engine = new Bloodhound({
      name: 'guests',
      local: [],
      remote: '/guest/search?q=%QUERY',
      datumTokenizer: function(d) {
        return Bloodhound.tokenizers.whitespace(d.val);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });

    engine.initialize();

    // attach the typeahead extension to
    // our search box using jQuery.
    var typeahead = $('#typeahead-container .search-input').typeahead(
      {
        hint: true,
        highlight: true,
        minLength: 3
      },
      {
        name: 'guests',
        displayKey: 'value',
        source: engine.ttAdapter(),
        limit: 10
      }
    );

    // if we hit enter, perform a search.
    $('#search-container').on('keypress', function(event) {
      if (event.keyCode == 13) {
        $('#email-lookup-form').submit();
      }
    });


    typeahead.on('typeahead:selected', function() {
      $('#email-lookup-form').submit();
    });

    typeahead.on('typeahead:autocompleted', function() {
      $('#email-lookup-form').submit();
    });
  }

});
