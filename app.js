var express = require('express');
var url = require('url');
var app = express();

var dburl = 'emojirank';
var collections = ['glyphs', 'votes'];
var mongojs = require('mongojs');

var db = mongojs(dburl, collections);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/getter', function(req, res) {

  db.glyphs.find({ "unicode_value" : "1f575_1f3fd"}, function(err, result) {
    res.send(result);
  });
});

app.get('/get-random', function(req, res) {
  var randomLine = getRandomInt(0,2388);
  console.log(randomLine);
  db.glyphs.find({ "unicode_line" : randomLine.toString()}, function(err, result) {
    res.send(result);
  });
});

app.get("/vote", function(req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var character = query['character'];
  var vendor = query['vendor'];
  var vote = query['vote'];

  var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
  console.log(ip);

  db.votes.insert({
    "character": character,
    "vendor": vendor,
    "vote": vote,
    "user_ip": ip,
    "t": new Date()
  });
  res.send("{success:true}");
  //db.likes.insert("")
});




app.get('/get/pallet', function (req, res) {
    res.send(db.pallets.find({filename: req.params.pallet}));
});
//.skip(parseInt(query['index'], 10)).limit(1)
app.get('/get/frame', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var result = query['status'];
console.log(query['filename']);
	db.frames.find({filename: query['filename']}).sort({totalDraws:1}).skip(parseInt(query['index'], 10)).limit(1,
	function(err, result) {

		console.log(query['filename']);
		console.log(query['index']);
		console.log(result);

		res.send(result);
	});
});

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

app.get('*', function (req, res) {
    res.sendfile('.' + req.path);
});

var server = app.listen(6060, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);

});
