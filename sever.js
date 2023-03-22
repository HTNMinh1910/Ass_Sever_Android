const express = require("express");
const app = express();
const fs = require('fs');
const http = require('http');
const hbs = require("express-handlebars");
const path = require("path");

app.engine('hbs', hbs.engine());
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/src/views'));
console.log(path.join(__dirname, '/src/views'));
app.listen(8080);

app.get('/', function(req, res){
  res.render('home', {showTitle: true});
});

  http.createServer(function (req, res) {
  fs.readFile('./src/css/reset.css', function(err, data) {
    res.writeHead(200, {'Content-Type': 
    'text/css'
  });
    res.write(data);
    return res.end();
  });
}).listen(8020);

  http.createServer(function (req, res) {
  fs.readFile('./src/css/style.css', function(err, data) {
    res.writeHead(200, {'Content-Type': 
    'text/css'
  });
    res.write(data);
    return res.end();
  });
}).listen(8010);