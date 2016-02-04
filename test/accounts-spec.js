var expect = require('chai').expect;
var request = require('supertest-as-promised');

var db   = require('../lib/db');
var app  = require('../server.js')
var User = require('../models/user');



describe('Accounts API', function() {

  beforeEach(function() {
    app.testSession = undefined;
    // Clear out db before every test
    return db.deleteEverything();
  });

  describe('Privileged Access:', function(){

    it('Redirects to login page if a user tries to access the main page and is not signed in', function() {
      return request(app)
        .get('/')
        .expect(302)
        .expect('Location', '/sign-in')
    });

    it('Redirects to login page if a user tries to create a link and is not signed in', function() {
      return request(app)
        .get('/create')
        .expect(302)
        .expect('Location', '/sign-in')
    });

  });

  describe('Account Creation:', function() {

    it('Signup creates a user record', function() {
      return request(app)
        .post('/sign-up')
        .send({ username: 'Svnh', password: 'Svnh' })
        .expect(302)
        .expect('Location', '/')
    });

    it('Redirects on a taken username', function() {
      return request(app)
        .post('/sign-up')
        .send({ username: 'Svnh', password: 'Svnh' })
        .expect(302)
        .expect('Location', '/')
        .then(function (response) {

          return request(app)
            .post('/sign-up')
            .send({ username: 'Svnh', password: 'Svnh' })
            .expect(302)
            .expect('Location', '/sign-up')
        })
    });

  });


  describe('Account Login:', function(){

    beforeEach(function(){
      return User.create({
          username: 'Phillip',
          password: 'Phillip'
      });
    })

    it('Logs in existing users', function() {
      return request(app)
        .post('/sign-in')
        .send({ username: 'Phillip', password: 'Phillip' })
        .expect(302)
        .expect('Location', '/')
    });

    it('Users that do not exist are kept on login page', function() {
      return request(app)
        .post('/sign-in')
        .send({ username: 'Fred', password: 'Fred' })
        .expect(302)
        .expect('Location', '/sign-in')
    });

  });

});
