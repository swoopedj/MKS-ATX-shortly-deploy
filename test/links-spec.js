var expect = require('chai').expect;
var request = require('supertest-as-promised');

var db   = require('../lib/db');
var app  = require('../server.js')
var User = require('../models/user');
var Link = require('../models/link');


describe('Links API', function() {

  beforeEach(function() {
    app.testSession = undefined;
    // Clear out db before every test
    return db.deleteEverything();
  });

  describe('Link creation:', function(){

    beforeEach(function () {
      return User.create({
          'username': 'Phillip',
          'password': 'Phillip'
      }).then(function (user) {
        // Set session to mock logged-in state
        app.testSession = { userId: user.id };
      });
    });

    it('Only shortens valid urls, returning a 404 - Not found for invalid urls', function() {
      this.timeout(5000);
      return request(app)
        .post('/links')
        .send({ url: 'invalid url' })
        .expect(404)
    });

    describe('Shortening links:', function(){

      it('Responds with the short code', function() {
        return request(app)
          .post('/links')
          .send({ url: 'http://www.roflzoo.com/' })
          .expect(function (response) {
            expect(response.body.url).to.equal('http://www.roflzoo.com/');
            expect(response.body.code).to.not.be.null;
          });
      });

      it('Persists with the title', function() {
        return request(app)
          .post('/links')
          .send({ url: 'http://www.roflzoo.com/' })
          .expect(function (response) {

            // Fetch all links and ensure created is in the result
            request(app)
              .get('/links')
              .expect(function (response) {
                expect(response.body.length).to.equal(1);
                expect(response.body[0].url).to.equal('http://www.roflzoo.com/');
                expect(response.body[0].title).to.equal('Funny pictures of animals, funny dog pictures');
                expect(response.body[0].code).to.not.be.null;
              })
          })
      });

    }); // 'Shortening links'


    describe('With previously saved urls:', function(){

      var link;

      beforeEach(function () {
        // save a link to the database
        return Link.create({
          url: 'http://www.roflzoo.com/',
          title: 'Rofl Zoo - Daily funny animal pictures',
          base_url: 'http://127.0.0.1:4568'
        })
          .then(function(newLink){
            link = newLink;
          })
      });

      it('Returns the same shortened code', function() {
        return request(app)
          .post('/links')
          .send({ url: 'http://www.roflzoo.com/' })
          .expect(function (response) {
            expect(response.body.code).to.equal(link.code);
          })
      });

      it('Shortcode redirects to correct url', function() {
        return request(app)
          .get('/' + link.code)
          .expect(302)
          .expect('Location', 'http://www.roflzoo.com/')
      });

    }); // 'With previously saved urls'

  }); // 'Link creation'

});
