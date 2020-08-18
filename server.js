//Install express server
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const path = require('path');
var https = require('https');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'text/*' }))


const appPath = '/dist/ng-visuall';
app.use(express.static(__dirname + appPath));

const port = process.env.PORT || 4200;
app.listen(port);

app.get('/urlquery/*', function (req, res) {
	var reqURL = req.url.substr(10);
	var data = [];
	if (reqURL.substr(0, 5).toLowerCase() != "https" && reqURL.substr(0, 5).toLowerCase() == "http") {
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
	}
	else {
		if (reqURL.substr(0, 5).toLowerCase() != "http") {
			reqURL = "https://" + reqURL;
		}
		var request = https.request(reqURL, function (response, body) {
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
	}


});

app.get('/*', function (req, res) {
	res.sendFile(path.join(__dirname + appPath + '/index.html'));
});


// Start the app by listening on the default Heroku port

console.log('server listening port: ', port);
