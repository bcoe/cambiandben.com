var _ = require('lodash'),
  dotenv = require('dotenv'),
  fs = require('fs'),
  handlebars = require('handlebars'),
  restify = require('restify'),
  path = require('path'),
  server = restify.createServer();

dotenv.load();

function Server() {
  _.extend(this, {
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
};

Server.prototype._createRoutes = function() {
  var _this = this;

  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  // serve static assets.
  server.get(/\.[a-zA-Z]{1,5}/, restify.serveStatic({
    directory: path.resolve(__dirname, './assets')
  }));

  // serve the various mustache templates.
  server.get('/', function(req, res, next) { _this._serve({isIndex: true}, res, next); });
  server.get('/dayof', function(req, res, next) { _this._serve({isDayOf: true}, res, next); });
  server.get('/accomodation', function(req, res, next) { _this._serve({isAccomodation: true}, res, next); });
  server.get('/rsvp', function(req, res, next) { _this._serve({isRSVP: true}, res, next); });
  server.get('/registry', function(req, res, next) { _this._serve({isRegistry: true}, res, next); });
  server.get('/gallery', function(req, res, next) { _this._serve({isGallery: true}, res, next); });
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
