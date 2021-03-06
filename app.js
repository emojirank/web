var express = require('express');
var url = require('url');
var app = express();

var dburl = 'emojirank';
if (process.env.MONGODB_URI) {
  dburl = process.env.MONGODB_URI;
}
var collections = ['glyphs', 'votes'];
var mongojs = require('mongojs');

var db = mongojs(dburl, collections);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/stats/vendor', function(req, res) {
  db.glyphs.aggregate([ { 
    $group: { 
        _id: { vendor: "$vendor_name"}, 
        total_likes: { 
            $sum: "$like_count" 
        },
        total_hates: { 
            $sum: "$hate_count" 
        },
        glyph_score_sum: { 
            $sum: "$glyph_score" 
        }
    }
  }], function(err, result) {
    res.send(result);
  });
});

app.get('/next', function (req, res) {
    // TEMP: Probably a better replacement for this.
    var randomLine = getRandomInt(0,2388);
    console.log(randomLine);
    db.glyphs.find({ "unicode_line" : randomLine.toString()}, function(err, result) {
      res.redirect("/emoji/" + result[0].unicode_value);
    });
});

app.get('/nextgenerate', function (req, res) {
    // TEMP: Probably a better replacement for this.
    var randomLine = getRandomInt(0,2388);
    console.log(randomLine);
    db.glyphs.find({ "unicode_line" : randomLine.toString()}, function(err, result) {
      res.redirect("/generate/" + result[0].unicode_value);
    });
});

app.get('/get-next-emoji', function(req, res) {
  db.glyphs.find({ "emoji_total_count" : { "$exists": false }}).limit(1 , function(err, result) {
    if (result.length === 0)
    {
      var randomLine = getRandomInt(0,2388);
      console.log(randomLine);
      db.glyphs.find({ "unicode_line" : randomLine.toString()}, function(err, result) {

        res.send({"next": result[0].unicode_value, "mode": "random"});
      });
    } else {
        res.send({"next": result[0].unicode_value, "mode": "filling emoji_total_count"});
    }
  });
});

app.get('/get-emoji', function(req, res) {
  var pathname = url.parse(req.headers.referer, true).pathname;


  if (pathname === '/') {
    var randomLine = getRandomInt(0,2388);
    console.log(randomLine);
    db.glyphs.find({ "unicode_line" : randomLine.toString()}, function(err, result) {
      res.send(result);
    });
  }

  if (pathname.indexOf('/emoji/') === 0) {
    db.glyphs.find({ "unicode_value" : pathname.split('/')[2]}, function(err, result) {
      res.send(result);
    });
  }
});

app.get('/get-emoji/:unicode_value', function(req, res) {
  db.glyphs.find({ "unicode_value" : req.params.unicode_value}, function(err, result) {
    res.send(result);
  });
});

app.get('/emoji/:unicode_value', function(req, res) {
    res.sendfile('vote.html');
});

app.get('/results/:unicode_value', function(req, res) {
    res.sendfile('results.html');
});

app.get('/generate/:unicode_value', function(req, res) {
    res.sendfile('generate.html');
});

app.get('/analytics', function(req, res) {
  res.sendfile('analytics.html');
});

app.get('/get-analytics/unvoted-emojis-glyph-count', function(req, res) {
  db.glyphs.find({ "emoji_total_count": {"$exists": false}}).count(function(err, result) {
    var count = { count: result};
    res.send(count);
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

  if (vote === "like") {
      db.glyphs.update(
        {"unicode_value" : character, "vendor_name" : vendor, like_count: {$exists : false}},
        {$set: {like_count: 0}},
        function(err, result) {
          db.glyphs.update(
            {"unicode_value" : character, "vendor_name" : vendor},
            {$inc: {like_count:1}}
          );
        });
  }

  if (vote === "hate") {
      db.glyphs.update(
        {"unicode_value" : character, "vendor_name" : vendor, hate_count: {$exists : false}},
        {$set: {hate_count: 0}},
        function(err, result) {
          db.glyphs.update(
            {"unicode_value" : character, "vendor_name" : vendor},
            {$inc: {hate_count:1}}
          );
        });
  }

  res.send("{success:true}");
  //db.likes.insert("")
});

app.get('/reset-glyph-stats/:unicode_value', function(req, res) {
  db.glyphs.find({ "unicode_value" : req.params.unicode_value}, function(err, result) {
    var likes = 0;
    var hates = 0;
    result.forEach(function(glyph){
      if (glyph.like_count) likes += glyph.like_count;
      if (glyph.hate_count) hates += glyph.hate_count;
    });

    result.forEach(function(glyph){
      var like_hate_diff = (glyph.like_count ? glyph.like_count : 0) - (glyph.hate_count ? glyph.hate_count : 0);
      var glyph_score = like_hate_diff / (likes + hates) * 200;
      db.glyphs.update(
        {"unicode_value" : req.params.unicode_value, "vendor_name": glyph.vendor_name},
        {$set: {"emoji_like_count": likes, "emoji_hate_count": hates, "emoji_total_count": likes + hates, "last_updated": new Date(),
          glyph_score: glyph_score
        }},
        {multi: true}
      );
    });

    res.send({"emoji_like_count": likes, "emoji_hate_count": hates, "emoji_total_count": likes + hates, "success": true});
  });


});

app.get('/', function (req, res) {
    var randomLine = getRandomInt(1, 1024);
    console.log(randomLine);
    db.glyphs.find({ "unicode_line" : randomLine.toString()}, function(err, result) {
      res.redirect("/emoji/" + result[0].unicode_value);
    });
});

app.get('*', function (req, res) {
    res.sendfile('.' + req.path);
});

var server = app.listen(process.env.PORT || 6060, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);

});
