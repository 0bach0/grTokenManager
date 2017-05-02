var express = require("express");
var bodyParser = require("body-parser");
var mongoose    = require('mongoose');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {  
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
 });
app.use(bodyParser.json());

var config = require('./config'); // get our config file    
var Token   = require('./models/token');

require("./routes/routes.js")(app);
app.listen(3000);

mongoose.connect(config.database);
