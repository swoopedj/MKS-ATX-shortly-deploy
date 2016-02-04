var db = require('../lib/db');

db.schema.createTableIfNotExists('urls', function(table) {
  table.increments('id').primary();
  table.string('url', 255);
  table.string('base_url', 255);
  table.string('code', 100);
  table.string('title', 255);
  table.timestamps();
})
.then(function () {
  console.log('urls table is ready.');
});


db.schema.createTableIfNotExists('clicks', function(table) {
  table.increments('id').primary();
  table.integer('link_id');
  table.timestamps();
})
.then(function () {
  console.log('clicks table is ready.');
});

db.schema.createTableIfNotExists('users', function (table) {
  table.increments('id').primary();
  table.string('username', 100).unique();
  table.string('password', 100);
  table.timestamps();
})
.then(function () {
  console.log('users table is ready.');
});

db.schema.createTableIfNotExists('sessions', function (table) {
  //
  // Using an incrementing number as an id is very insecure.
  // You should be able to explain why :)
  table.increments('id').primary();
  table.integer('user_id');
  table.timestamps();
})
.then(function () {
  console.log('sessions table is ready.');
});
