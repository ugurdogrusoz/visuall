//Install express server
const express = require('express');
const path = require('path');

const app = express();

const appPath = '/dist/ng-visuall';
// Serve only the static files form the dist directory
app.use(express.static(__dirname + appPath));

app.get('/*', function(req,res) {
    
res.sendFile(path.join(__dirname + appPath + '/index.html'));
});

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8080
app.listen(port);
console.log('server listening port: ', port);