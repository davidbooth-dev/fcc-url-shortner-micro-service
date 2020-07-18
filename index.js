'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var cors = require('cors');
var validUrl = require('valid-url');

var app = express();
var router = express.Router();

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
var cors_options = {
  optionSuccessStatus: 200, // some legacy browsers choke on 204
  origin: [
    "https://marsh-glazer.gomix.me",
    "https://narrow-plane.gomix.me",
    "https://www.freecodecamp.com"
  ]
}
app.use(cors(cors_options));  

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

router.get("/file/*?", function (req, res, next) {
  if (req.params[0] === ".env") {
    return next({ status: 401, message: "ACCESS DENIED" });
  }
  fs.readFile(path.join(__dirname, req.params[0]), function (err, data) {
    if (err) {
      return next(err);
    }
    res.type("txt").send(data.toString());
  });
});

try{
  var mongoose = require('mongoose');
}
catch(e){
  console.log(e);
}

router.get("/is-mongoose-ok", function(req, res) {
  if (mongoose) {
    res.json({ isMongooseOk: !! mongoose.connection.readyState });
  } else {
    res.json({ isMongooseOk: false });
  }
});

app.use("/api", cors(), router);

var add = require('./mongoose-module').add;

router.post("/shorturl/:id", function (req, res, next) {
  next();
},
  function(req, res, next){
    let id = req.params.id;
    let url = req.body.url;
    
    if(id === 'new')
      // Check if valid url
      if (validUrl.isUri(url)){
        console.log('Looks like an URI ', url);
        // add to database
        add(url, function(err, data){
          if(err) { 
            //return ( next(err) ) };
            //res.json();
            err.message = { error: 'Record Already Exists'}
            return next(err);
          }
          if(!data){
            console.log('Missing `done()` statement');
            return next({message: 'Missing Callback Argument'});
          }
          res.json({ url: url, short_url: data.idx });
        })
    } 
    else {
        console.log('Not a URI');
        res.json({ error: 'Invalid URL'});
    }
  }
)

var getById = require('./mongoose-module').getById;

router.get('/shorturl/:id', function(req, res, next){
  next();
},
  function(req, res, next){
    let id = req.params.id;
    getById(id, function(err, data){
        if(err) {           
          //return { error: 'URL Not Found'};
          return ( next(err) ) 
        };
        if(!data){
          console.log('Missing `done()` statement');
          return next({message: 'Missing Callback Argument'});
        }
        //console.log(data);
        if(data) res.json({ url: data });
    })
  }
)
// Error handler
app.use(function (err, req, res, next) {
  if (err) {
    console.log(err);
    res
      .status(err.status || 500)
      .type("txt")
      .send(err.message || "SERVER ERROR");
  }
});

//var runTests = require('tests').runTests;

//runTests();

// Unmatched routes handler
app.use(function (req, res) {
  if (req.method.toLowerCase() === "options") {
    res.end();
  } else {
    res
      .status(404)
      .type("txt")
      .send("Not Found");
  }
});


// listen for requests :)
var server = app.listen(process.env.PORT || 3001, function () {
  console.log('Express Server Listening on localhost:port ' + server.address().port)
});