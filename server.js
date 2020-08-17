//Install necessary tools
const express = require('express');
const http = require('http');
const url = require('url');
const bodyParser = require('body-parser');
const path = require('path');

//use express server as app
const app = express();

//use parsers for data get request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'text/*' }))

const appPath = '/dist/ng-visuall';
app.use(express.static(__dirname + appPath));

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 4200;
app.listen(port);

//get the requested data if there is a get request from frontend and respond with the data in url
app.get('/urlquery/*', function (req, res) {
  var reqURL = req.url.substr(10);
  var data = [];
  var request = http.request(reqURL, function (response, body) {
    response.on('data', function (chunk) {
      data.push(chunk);
    });
    response.on('end', function () {
      var result = JSON.parse(data.join(''))
      res.send(result);
    });
  });
  request.on('error', function (e) {
    console.log(e.message);
  });
  request.end();
});

//send user to index from any path except /urlquery
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname + appPath + '/index.html'));
});

//log that server has started listening
console.log('server listening port: ', port);