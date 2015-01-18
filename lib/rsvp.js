var _ = require('lodash'),
  async = require('async'),
  csv = require('to-csv'),
  Joi = require('joi'),
  redis = require('redis-url');

function RSVP(opts) {
  _.extend(this, {
    key: 'guests',
    addGuestSchema: Joi.object().keys({
      email: Joi.string().email(),
      plusone: Joi.number(),
      attending: Joi.number(),
    })
  }, opts);

  this.redis = redis.connect(process.env.REDISTOGO_URL);
};

RSVP.prototype.addGuest = function(params, cb) {
  var _this = this,
    booleans = ['plusone', 'attending', 'hasrsvpd'],
    values = {};

  Object.keys(params).forEach(function(key) {
    if (booleans.indexOf(key) > -1) {
      values[key] = params[key] === 'yes' ? 1 : 0;
    } else {
      values[key] = params[key];
    }
  });

  Joi.validate(_.pick(values, Object.keys(this.addGuestSchema)), this.addGuestSchema, function(err, result) {
    if (err) return cb(err);

    _this.redis.hmset(values.email.toLowerCase(), values, function(err, result) {
      if (err) {
        return cb(err);
      } else {
        return cb(undefined, 'guest ' + values.email + ' added');
      }
      return next();
    });
  });
};

RSVP.prototype.getGuests = function(cb) {
  var _this = this,
    guests = [];

  _this.redis.keys('*', function(err, result) {
    if (err) return cb(err);

    async.each(result, function(key, done) {
      _this.redis.hgetall(key, function(err, result) {
        if (err) return done(err);
        _this._createRows(guests, result);
        return done();
      });
    }, function(err, result) {
      if (err) return cb(err);

      guests = guests.sort(function(a, b) {
        return a.email.localeCompare(b.email);
      });

      return cb(undefined, guests);
    });
  });
};

RSVP.prototype._createRows = function(guests, result) {
  var row = {
    hasRSVPD: result.hasrsvpd === '1',
    attending: result.attending === '1',
    plusOneAllowed: result.plusone === '1',
    email: result.email.toLowerCase(),
    fname: result.fname || '',
    lname: result.lname || '',
    food: result.food || '',
    guestfname: result.guestfname || '',
    guestlname: result.gustlname || '',
    guestfood: result.guestfood || ''
  };

  guests.push(row);
};

RSVP.prototype.getCSV = function(cb) {
  this.getGuests(function(err, guests) {
    if (err) return cb(err);
    return cb(undefined, csv(guests));
  });
};

RSVP.prototype.deleteGuest = function(email, cb) {
  this.redis.del(email, cb);
};

RSVP.prototype.lookupGuest = function(email, cb) {
  var _this = this;
  this.redis.hgetall(email.toLowerCase(), function(err, result) {
    var guests = [];
    if (result) _this._createRows(guests, result);
    return cb(err, guests[0]);
  });
};

module.exports = RSVP;
