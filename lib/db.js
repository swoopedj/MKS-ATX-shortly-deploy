var path = require('path');

var db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: process.env.NODE_ENV === 'test'
              ? ':memory:' // Use in-memory storage for test suite
              : path.join(__dirname, '../db/shortly.sqlite')
  }
});

db.deleteEverything = function () {
  return Promise.all([
    db('urls').delete(),
    db('clicks').delete(),

    db('users').delete(),
    db('sessions').delete(),
      ])
}

module.exports = db;
