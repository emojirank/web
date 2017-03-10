var image_prefix = "/images/";
if (window.location.href.indexOf('localhost') === -1) {
  image_prefix = "http://www.bpulse.co.uk/emoji/images/";
}

var unicode_value = window.location.pathname.split('/')[2];

var emoji_array = [];

$(document).ready(function() {
  $(".vote_link").attr("href", "/emoji/" + unicode_value);

  $.get('/reset-glyph-stats/' + unicode_value, function(data) {
    getData();
  }); 
});

function like_comparison(a, b) {
  if (a.like_count > b.like_count) return -1;
  if (a.like_count < b.like_count) return 1;
  else return 0;
}

function hate_comparison(a, b) {
  if (a.hate_count > b.hate_count) return -1;
  if (a.hate_count < b.hate_count) return 1;
  else return 0;
}

function glyph_score_comparison(a, b) {
  if (a.glyph_score > b.glyph_score) return -1;
  if (a.glyph_score < b.glyph_score) return 1;
  else return 0;
}

function getGlyphBox(emoji) {
  var box = $("<div class='glyph'>");
  box.attr("vendor", emoji.vendor_name);
  var img = $("<img>");
  img.attr("width", "72");
  img.attr("src",  image_prefix + emoji.unicode_value + "_" + emoji.vendor_name + ".png");
  box.append(img);

  return box;
}

function getData() {
  $.get("/get-emoji/" + unicode_value, function(data) {
    $("#emoji_name").html(data[0].emoji_name);
    document.title = "EmojiRank: " + data[0].emoji_name;

    var has_votes = false;
    for (i in data) {
      var emoji = data[i];

      if (! emoji.like_count) emoji.like_count = 0;
      if (! emoji.hate_count) emoji.hate_count = 0;
      emoji_array.push(emoji);
      if (emoji.like_count > 0 || emoji.hate_count > 0) {
        has_votes = true;
      }
    }

    if (!has_votes) {
      $("#no_votes_warning").show();
      $("#glyph_rows").hide();
    }

    emoji_array.sort(glyph_score_comparison);

    for (i in emoji_array) {
      var emoji = emoji_array[i];

      var glyph_bar = $("<div>");
      glyph_bar.addClass("crisp");
      glyph_bar.css("width", Math.abs(emoji.glyph_score) * 5);
      glyph_bar.css("height", 36);
      glyph_bar.css("background-image", 'url(' + image_prefix + emoji.unicode_value + "_" + emoji.vendor_name + ".png)");
      glyph_bar.css("background-repeat", "repeat-x");
      glyph_bar.css("background-size", "36px 36px");

      var glyph_row = $("<tr>");
      glyph_row.addClass("glyph_row");

      var negative_column = $("<td>");
      if (emoji.glyph_score < 0) {
        glyph_bar.addClass("negative_bar");
        negative_column.append(glyph_bar);
      }
      glyph_row.append(negative_column);

      glyph_row.append($("<td style=\"text-align: center;\">").text(emoji.vendor_name));

      var positive_column = $("<td>");
      if (emoji.glyph_score > 0) {
        positive_column.append(glyph_bar);
      }
      glyph_row.append(positive_column);

      $("#glyph_rows").append(glyph_row);
    }

    return;

    emoji_array.sort(like_comparison);

    for (i in emoji_array) {
      var tr = $("<tr>");
      tr.append($("<td>").text(parseInt(i, 10) + 1));
      tr.append($("<td>").append(getGlyphBox(emoji_array[i])));
      tr.append($("<td>").text(emoji_array[i].vendor_name));
      tr.append($("<td>").text(emoji_array[i].like_count));
      $("#table_by_like").append(tr);
    }

    emoji_array.sort(hate_comparison);

    for (i in emoji_array) {
      var tr = $("<tr>");
      tr.append($("<td>").text(parseInt(i, 10) + 1));
      tr.append($("<td>").append(getGlyphBox(emoji_array[i])));
      tr.append($("<td>").text(emoji_array[i].vendor_name));
      tr.append($("<td>").text(emoji_array[i].hate_count));
      $("#table_by_hate").append(tr);
    }
  });
}