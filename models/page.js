var request = require('request');


var Page = module.exports

Page.getUrlTitle = function(url, cb) {
  return new Promise(function (resolve, reject) {

    request(url, function(err, res, html) {
      if (err) {
        console.log('Error reading url heading: ', err);
        return reject(err);
      } else {
        var tag = /<title>(.*)<\/title>/;
        var match = html.match(tag);
        var title = match ? match[1] : url;
        return resolve(title);
      }
    });

  });
};

Page.isValidUrl = function(url) {
  return url.match(rValidUrl);
};

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;
