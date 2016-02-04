var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var morgan = require('morgan');


require('./db/config');
var User = require('./models/user');
var Link = require('./models/link');
var Page = require('./models/page');

var Session = require('./models/session');

var app = express();

// Automatic request logging
app.use(morgan('dev'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());



//
// This parses the client's cookie, and
// assigns the result to req.cookies.
var cookieParser = require('cookie-parser')
app.use( cookieParser() );

//
// This fetches the client's session from the database
// and makes it available to all endpoints (via req.session)
app.use(function (req, res, next) {

  if (req.cookies.sessionId) {

    Session.find(req.cookies.sessionId)
      .then(function(session) {
        req.session = session;
        next();
      });
  }
  else {
    // No session to fetch; just continue down the pipeline.
    next();
  }
})

//
// For testing purposes; allow test code to set session directly
//
if ( process.env.NODE_ENV === 'test' ) {
  app.use(function (req, res, next) {
    if ( app.testSession !== undefined ) req.session = app.testSession;
    next();
  })
}

//
// Parse JSON (for our AJAX requests)
//
app.use(bodyParser.json());

//
// Parse built-in browser forms (for sign-up/sign-in pages)
//
app.use(bodyParser.urlencoded({ extended: true }));

//
// Make files within the public/ folder publicly accessible
//
app.use(express.static(__dirname + '/public'));


//
// In response to a GET / request,
// send back html generated by `views/index.ejs`
//
app.get('/', function(req, res) {
  if ( ! req.session ) {
    return res.redirect('/signin');
  }
  res.render('index');
});

app.get('/create', function(req, res) {
  if ( ! req.session ) {
    return res.redirect('/signin');
  }
  res.render('index');
});

app.get('/links', function(req, res) {
  Link.all().then(function(links) {
    res.status(200).send(links);
  });
});

app.post('/links', function(req, res) {
  var uri = req.body.url;

  if ( ! Page.isValidUrl(uri) ) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.findByUrl(uri)
    .then(function(link) {
      //
      // Link has already been shortened; send it back.
      res.status(200).send(link);
    })
    .catch(function (err) {
      if ( err.message === 'no_such_link' ) {
        //
        // Link does not yet exist; create and send it back.
        Page.getUrlTitle(uri)
          .then(function(title) {

            return Link.create({
              url: uri,
              title: title,
              base_url: req.headers.origin
            })
          })
          .then(function(newLink) {
            res.status(200).send(newLink);
          })
          .catch(function(err) {
            console.log('Error reading URL heading: ', err);
            res.send(404);
          });
      }
      else {
        res.status(500).send(err.message)
      }
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/signup', function (req, res) {
  return res.render('signup');
});

app.post('/signup', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;

  User.create({ username: username, password: password })
    .then(function(user) {
      return Session.create(user.id);
    })
    .then(function (newSessionId) {
      res.setHeader('Set-Cookie', 'sessionId=' + newSessionId);
      res.redirect('/');
    })
    .catch(function (err) {
      if ( err.message === 'username_is_taken' ) {
        console.log("Username is taken:", username)
        res.redirect('/signup');
      }
      else {
        res.status(500).send(err.message)
      }
    })

});


app.get('/signin', function (req, res) {

  res.render('signin');

});

app.post('/signin', function(req, res) {

  var username = req.body.username;
  var password = req.body.password;

  User.findByUsername(username)
    .then(function (user) {
      return User.comparePassword(password, user.password)
        .then(function () {
          return Session.create(user.id)
        })
    })
    .then(function (newSessionId) {
      res.setHeader('Set-Cookie', 'sessionId=' + newSessionId);
      res.redirect('/');
    })
    .catch(function (err) {
      if ( err.message === 'no_such_user' ) {
        console.log("No such username:", username)
        res.redirect('/signin')
      }
      else if ( err.message === 'password_does_not_match' ) {
        console.log("Incorrect password.")
        res.redirect('/signin');
      }
      else {
        res.status(500).send(err.message);
      }
    });

});


/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {

  Link.findByCode( req.params[0] )
    .then(function(link) {

      Link.recordClick(link.id).then(function() {
        return res.redirect(link.url);
      });
    })
    .catch(function(err) {
      res.redirect('/');
    });
});


if ( process.env.NODE_ENV === 'test' ) {
  // Log all errors
  app.use(function (err, req, res, next) {
    console.error("==Error==");
    console.error("   " + err.stack);
    next(err);
  });

  module.exports = app;
}
else {
  var port = process.env.PORT || 3468;
  console.log('Shortly is listening on '+ port);
  app.listen(port);
}
