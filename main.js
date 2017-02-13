var MODE = {};
MODE.LIKE = 1;
MODE.HATE = 2;
MODE.RESULTS = 3;
var current_mode = MODE.LIKE;

var image_prefix = "/images/";
if (window.location.href.indexOf('localhost') === -1) {
  image_prefix = "http://www.bpulse.co.uk/emoji/images/";
}

// http://stackoverflow.com/a/6274398/384316
function shuffle(array) {
  let counter = array.length;
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

function initialiseGlyphs() {
  $("#container").empty();
  $.get("/get-emoji", function(data) {
    $("#emoji_name").text(data[0].emoji_name);
    data = shuffle(data);
    for (i in data) {
      var emoji = data[i];
      //console.log(emoji);
      var box = $("<div class='glyph'>");
      box.attr("vendor", emoji.vendor_name);
      var img = $("<img>");
      img.attr("width", "72");
      img.attr("src",  image_prefix + emoji.unicode_value + "_" + emoji.vendor_name + ".png");
      box.append(img);
      $("#container").append(box);
      box.click(function(event) {
        glyphClick(event, emoji);
      });
    }
  });
}

function setModeLike() {
  current_mode = MODE.LIKE;
  $("#instruction").text("Select your favourite!");
  initialiseGlyphs();
  $("#user_selections").hide();
}

function setModeHate() {
  current_mode = MODE.HATE;
  $("#instruction").text("Which one do you hate?");
}

function setModeResults() {
  current_mode = MODE.RESULTS;
  $("#instruction").text("Results:");
  $("#user_selections").show();
}

function glyphClick(event, emoji) {
  var vote = '';
  var vendor = event.delegateTarget.attributes.vendor.value;
  event.delegateTarget.style.display = "none";

  if (current_mode == MODE.LIKE) {
    vote = 'like';
    setModeHate();
    fillUserLikeEmoji(emoji, vendor);
  } else if (current_mode == MODE.HATE) {
    vote = 'hate';
    setModeResults();
    fillUserHateEmoji(emoji, vendor);
  }

  console.log(vendor);
  $.get("/vote",
    {
      character: emoji.unicode_value,
      vendor: vendor,
      vote: vote
    }, function(data) {
      console.log(data);
    });
}

$(document).ready(function() {
  setModeLike();

  $("#go_next").click(function() {
    setModeLike();
  });
});

function fillUserLikeEmoji(emoji, vendor_name) {
  $("#user_like").empty();
  var box = $("<div class='glyph'>"); // TODO: this section copied from above, refactor?
  var img = $("<img>");
  img.attr("width", "72");
  img.attr("src",  image_prefix + emoji.unicode_value + "_" + vendor_name + ".png");
  box.append(img);
  $("#user_like").append(box);
}

function fillUserHateEmoji(emoji, vendor_name) {
  $("#user_hate").empty();
  var box = $("<div class='glyph'>"); // TODO: this section copied from above, refactor?
  var img = $("<img>");
  img.attr("width", "72");
  img.attr("src",  image_prefix + emoji.unicode_value + "_" + vendor_name + ".png");
  box.append(img);
  $("#user_hate").append(box);
}