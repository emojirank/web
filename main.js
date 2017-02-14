var MODE = {};
MODE.LIKE = 1;
MODE.HATE = 2;
MODE.RESULTS = 3;
var current_mode = MODE.LIKE;

var most_liked = {};
var most_hated = {};

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
  $("#db_selections").hide();

  most_liked = {};
  most_hated = {};

  $.get("/get-emoji", function(data) {
    $("#emoji_name").text(data[0].emoji_name);
    document.title = "EmojiRank: " + data[0].emoji_name;
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

      if (!most_liked.like_count ||
        emoji.like_count && (most_liked.like_count < emoji.like_count) ) {
        most_liked = JSON.parse(JSON.stringify(emoji));
      }
      if (!most_hated.hate_count ||
        emoji.hate_count && (most_hated.hate_count < emoji.hate_count) ) {
        most_hated = JSON.parse(JSON.stringify(emoji));
      }
    }

    $("#db_like").append($("<h2>").text(most_liked.vendor_name));
    var most_liked_div = $("<div class='glyph'>");
    var most_liked_img = $("<img>");
    most_liked_img.attr("width", "72");
    most_liked_img.attr("src",  image_prefix + most_liked.unicode_value + "_" + most_liked.vendor_name + ".png");
    most_liked_div.append(most_liked_img);
    $("#db_like").append(most_liked_div);

    $("#db_hate").append($("<h2>").text(most_hated.vendor_name));
    var most_hated_div = $("<div class='glyph'>");
    var most_hated_img = $("<img>");
    most_hated_img.attr("width", "72");
    most_hated_img.attr("src",  image_prefix + most_hated.unicode_value + "_" + most_hated.vendor_name + ".png");
    most_hated_div.append(most_hated_img);
    $("#db_hate").append(most_hated_div);

    console.log("most liked");
    console.log(most_liked);
    console.log("most hated");
    console.log(most_hated);
  });
}

function setModeLike() {
  current_mode = MODE.LIKE;
  $("#instruction").text("Select your favourite!");
  initialiseGlyphs();
}

function setModeHate() {
  current_mode = MODE.HATE;
  $("#instruction").text("Which one do you hate?");
}

function setModeResults() {
  current_mode = MODE.RESULTS;
  $("#instruction").text("Results:");
  $("#db_selections").show();
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
      if (vote === 'hate') {
        $.get('/reset-glyph-stats/' + emoji.unicode_value);
      }
    });
}

$(document).ready(function() {
  setModeLike();

  $("#go_next").click(function() {
    $.get("/get-next-emoji", function (data){
      window.location = "/emoji/" + data.next;
      setModeLike();
    });
  });
});

function fillUserLikeEmoji(emoji, vendor_name) {
  $("#user_like").empty();
  var box = $("<div class='glyph'>"); // TODO: this section copied from above, refactor?
  var img = $("<img>");
  img.attr("width", "72");
  img.attr("src",  image_prefix + emoji.unicode_value + "_" + vendor_name + ".png");
  box.append(img);
  $("#user_like").append($("<h2>").text(vendor_name));
  $("#user_like").append(box);
}

function fillUserHateEmoji(emoji, vendor_name) {
  $("#user_hate").empty();
  var box = $("<div class='glyph'>"); // TODO: this section copied from above, refactor?
  var img = $("<img>");
  img.attr("width", "72");
  img.attr("src",  image_prefix + emoji.unicode_value + "_" + vendor_name + ".png");
  box.append(img);
  $("#user_hate").append($("<h2>").text(vendor_name));
  $("#user_hate").append(box);
}