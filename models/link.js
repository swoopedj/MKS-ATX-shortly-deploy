var db = require('../lib/db');
var crypto = require('crypto');


var Link = module.exports;

Link.all = function () {
  return db('urls').select('*');
};


Link.findByUrl = function (url) {
  return db('urls').select('*').where({ url: url }).limit(1)
    .then(function(rows) {
      return rows[0] || Promise.reject(new Error('no_such_link'))
    });
};


Link.findByCode = function (code) {
  return db('urls').select('*').where({ code: code }).limit(1)
    .then(function(rows) {
      return rows[0] || Promise.reject(new Error('no_such_link'))
    });
};


Link.create = function (attrs) {

  // Hash url before inserting into database
  var shasum = crypto.createHash('sha1');
  shasum.update(attrs.url);
  attrs.code = shasum.digest('hex').slice(0, 5);

  return db('urls').insert(attrs).then(function () {
    return attrs
  });
};


Link.recordClick = function (linkId) {
  return db('clicks').insert({ link_id: linkId });
};

module.exports = Link;
