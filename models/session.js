var db = require('../lib/db');


var Session = module.exports;

Session.find = function (sessionId) {

  return db('sessions').select('*').where({ id: sessionId }).limit(1)
    .then(function (rows) {
      return rows[0] || Promise.reject( new Error('no_such_session') );
    });
  
};

Session.findByUserId = function (userId) {

  return db('sessions').select('*').where({ user_id: userId }).limit(1)
    .then(function (rows) {
      return rows[0] || Promise.reject( new Error('no_such_session') );
    });
  
};

Session.create = function (userId) {
  return db('sessions').insert({ user_id: userId })
    .then(function (result) {
      // Knex gives us an array of newly-created record ids.
      // Since we only created one record, we just return the first.
      return result[0];
    });
};
