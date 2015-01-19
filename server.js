var _ = require('lodash'),
  dotenv = require('dotenv'),
  fs = require('fs'),
  handlebars = require('handlebars'),
  restify = require('restify'),
  path = require('path'),
  server = restify.createServer(),
  RSVP = require('./lib/rsvp');

dotenv.load();

function Server() {
  _.extend(this, {
    realm: 'rsvp',
    rsvp: new RSVP()
  });

  this._createRoutes();
  this._createTemplates();
}

Server.prototype._createTemplates = function() {
  this.body = handlebars.compile(fs.readFileSync('./templates/body.mustache', 'utf-8'));

  handlebars.registerPartial('indexBody', fs.readFileSync('./templates/index.mustache', 'utf-8'));
  handlebars.registerPartial('dayOfBody', fs.readFileSync('./templates/dayof.mustache', 'utf-8'));
  handlebars.registerPartial('accomodationBody', fs.readFileSync('./templates/accomodation.mustache', 'utf-8'));
  handlebars.registerPartial('rsvpBody', fs.readFileSync('./templates/rsvp.mustache', 'utf-8'));
  handlebars.registerPartial('registryBody', fs.readFileSync('./templates/registry.mustache', 'utf-8'));
  handlebars.registerPartial('galleryBody', fs.readFileSync('./templates/gallery.mustache', 'utf-8'));
  handlebars.registerPartial('adminBody', fs.readFileSync('./templates/admin.mustache', 'utf-8'));
};

Server.prototype._createRoutes = function() {
  var _this = this;

  server.use(restify.queryParser());
  server.use(restify.bodyParser());
  server.use(restify.authorizationParser());

  // serve the various mustache templates.
  server.get('/', function(req, res, next) { _this._serve({isIndex: true}, res, next); });
  server.get('/dayof', function(req, res, next) { _this._serve({isDayOf: true}, res, next); });
  server.get('/accomodation', function(req, res, next) { _this._serve({isAccomodation: true}, res, next); });
  server.get('/rsvp', function(req, res, next) { _this._serve({isRSVP: true}, res, next); });
  server.get('/registry', function(req, res, next) { _this._serve({isRegistry: true}, res, next); });
  server.get('/gallery', function(req, res, next) { _this._serve({isGallery: true}, res, next); });
  server.get('/admin', function(req, res, next) { _this.admin(req, res, next); });

  // RSVP guest-list management.
  server.post('/guest', function(req, res, next) { _this.addGuest(req, res, next); });
  server.del('/guest/:email', function(req, res, next) { _this.deleteGuest(req, res, next); });
  server.get('/guest', function(req, res, next) { _this.getGuests(req, res, next); });
  server.get('/guest/search', function(req, res, next) { _this.searchGuests(req, res, next); })
  server.get('/guest/csv', function(req, res, next) { _this.getCSV(req, res, next); });
  server.get('/guest/:email', function(req, res, next) { _this.lookupGuest(req, res, next); });
  server.put('/guest', function(req, res, next) { _this.updateGuest(req, res, next); });

  // serve static assets.
  server.get(/\.[a-zA-Z]{1,5}/, restify.serveStatic({
    directory: path.resolve(__dirname, './assets')
  }));
};

Server.prototype.admin = function(req, res, next) {
  var _this = this;

  this._auth(req, res, next, function(auth) {
    return _this._serve({
      isAdmin: true,
      auth: auth
    }, res, next);
  });
};

Server.prototype.addGuest = function(req, res, next) {
  var _this = this;

  this._auth(req, res, next, function(auth) {
    if (!req.params.email) {
      res.send(500, 'email address is required');
      return next();
    } else {
      _this.rsvp.addGuest(req.params, function(err, message) {
        if (err) res.send(500, err.message);
        else res.send(200, message);
        return next();
      });
    }
  });
};

Server.prototype.updateGuest = function(req, res, next) {
  var _this = this,
    params = _.extend({
      hasrsvpd: 'yes'
    }, req.params);

  _this.rsvp.lookupGuest(req.params.email.toLowerCase(), function(err, guest) {

    if (err) {
      res.send(500, err.message);
      return next();
    } else if (!guest) {
      res.send(404, 'could not find invite for ' + req.params.email);
      return next();
    } else {
      _this.rsvp.addGuest(params, function(err, message) {
        if (err) res.send(500, err.message);
        else {
          var message = req.params.attending === 'yes' ? "Thanks, can't wait to see you on Oct 23rd" : "Sorry that you can't make it";
          res.send(200, message);
        }
        return next();
      });
    }
  });
};

Server.prototype.deleteGuest = function(req, res, next) {
  var _this = this;

  this._auth(req, res, next, function(auth) {
    _this.rsvp.deleteGuest(req.params.email, function(err, guests) {
      if (err) res.send(500, err.message);
      else res.send(200);
      return next();
    });
  });
};

Server.prototype.lookupGuest = function(req, res, next) {
  var _this = this;

  _this.rsvp.lookupGuest(req.params.email, function(err, guest) {
    if (err) res.send(500, err.message);
    else if (!guest) res.send(404, 'could not find invite for ' + req.params.email);
    else res.send(200, guest);
    return next();
  });
};

Server.prototype.getGuests = function(req, res, next) {
  var _this = this;

  this._auth(req, res, next, function(auth) {
    _this.rsvp.getGuests(function(err, guests) {
      if (err) res.send(500, err.message);
      else res.send(200, guests);
      return next();
    });
  });
};

Server.prototype.searchGuests = function(req, res, next) {
  if (req.params.q.length < 3) { // don't return emails if you have entered less than 3 characters.
    res.send(200, []);
    return next();
  } else {
    this.rsvp.getGuests(function(err, guests) {
      var guests = _.select(guests, function(g) {return g.email.indexOf(req.params.q) === 0;});
      res.send(200, _.map(guests, function(g) {
        return {
          value: g.email
        }
      }));
    });
  }
};

Server.prototype.getCSV = function(req, res, next) {
  var _this = this;

  this._auth(req, res, next, function(auth) {
    _this.rsvp.getCSV(function(err, csv) {
      if (err) res.send(500, err.message);

      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(csv),
        'Content-Type': 'text/csv; name="guests.csv"',
        'Content-Disposition': 'attachment; filename="guests.csv"'
      });

      res.write(csv);
      res.end();

      return next();
    });
  });
};


Server.prototype._auth = function(req, res, next, cb) {
  var auth = req.authorization.basic;

  if (auth && auth.username === process.env.USERNAME && auth.password === process.env.PASSWORD) {
    return cb(new Buffer(process.env.USERNAME + ':' + process.env.PASSWORD).toString('base64'));
  } else {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm=' + this.realm
    });
    res.end();
    return next();
  }
};

Server.prototype._serve = function(opts, res, next) {
  var body = this.body(opts);

  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html'
  });

  res.write(body);
  res.end();

  return next();
};

Server.prototype.start = function() {
  server.listen(process.env.PORT, function() {
    console.log('%s listening at %s', server.name, server.url);
  });
};

(new Server()).start();
