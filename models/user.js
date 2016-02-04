var db = require('../lib/db');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = module.exports;

User.findByUsername = function (username) {
  return db('users').select('*').where({ username: username }).limit(1)
    .then(function(rows) {
      return rows[0] || Promise.reject( new Error('no_such_user') )
    });
};

User.create = function (attrs) {

  // Hash password before inserting into database.
  // This also returns a promise that resolves when both tasks are done.
  return hashPassword(attrs.password)
    .then(function (passwordHash) {
      return db('users').insert({ username: attrs.username, password: passwordHash });
    })
    .then(function (result) {
      var newId = result[0];
      // Return full user object (without password)
      return { id: newId, username: attrs.username }
    })
    .catch(function (err) {
      if ( err.message.match('UNIQUE constraint failed: users.username') ) {
        // Throw a more semantic error
        throw new Error('username_is_taken');
      }
      else {
        // We don't know what this error is; propogate.
        throw err;
      }
    });
  
};

User.comparePassword = comparePassword;

//
// These helpers each use a non-promise callback function,
// but then wraps it in a new promise (and returns that promise).
//
function hashPassword (password) {
  return new Promise(function (resolve, reject) {
    bcrypt.hash(password, null, null, function (err, hashResult) {
      if (err) reject(err);
      else     resolve(hashResult);
    });
  });
};

function comparePassword (attemptedPassword, actualPassword) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(attemptedPassword, actualPassword, function(err, isMatch) {
      if (err)                     reject(err);
      else if (isMatch === false)  reject(new Error('password_does_not_match'))
      else                         resolve();
    });
  });
};
