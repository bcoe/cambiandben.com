$(document).ready(function() {
  var components = {
      days: {length: 86400000},
      hours: {length: 3600000},
      minutes: {length: 60000},
      seconds: {length: 1000}
    },
    dateOfWedding = new Date('Fri Oct 23 2015 16:30:00 GMT-0800 (PST)');

  Object.keys(components).forEach(function(key) {
    components[key].element = $('#countdown .' + key)
  });

  function update() {
    var now = new Date(),
      diff = Math.max(dateOfWedding - now, 0);

    Object.keys(components).forEach(function(key) {
      var component = components[key],
        length = parseInt(diff / component.length);

      component.element.text(parseInt(diff / component.length));
      diff -= length * component.length;
    });
  }

  setInterval(update, 500);
});
