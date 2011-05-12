var embeds = [];
var currentEmbed = 0;
var responses = [];

var embedTemplate='\
<img src="{{{thumbnail_url}}}" />\
<a href="{{original_url}}" target="_blank"><h3>{{title}}</h3></a>\
<p>{{description}}</p>\
<i>{{provider_name}}</i>';

var errorTemplate='<h3>{{error_message}}</h3>';

function gadgetRun() {
    if (typeof google.contentmatch !== "undefined") {
        var matches = google.contentmatch.getContentMatches();
        gadgets.log(gadgets.json.stringify(matches));
        if (matches && matches.length) {
          for(var i = 0; i < matches.length; i++) {
            embeds.push(matches[i].url);
          }
        }
    }
    
    if (embeds.length > 0) {
      loadEmbed(currentEmbed);
      $('#prev').click(function() {
        if (currentEmbed == 0) {
          return;
        }
        currentEmbed--;
        loadEmbed(currentEmbed);
      });
      $('#next').click(function() {
        if (currentEmbed == embeds.length - 1) {
          return;
        }
        currentEmbed++;
        loadEmbed(currentEmbed);
      });
    }
}

function showLoadingAnimation() {
  $('#embed').html('<img src="file://Z:/xobni_oembed/loading.gif" />');
}

function loadEmbed(i) {
  if (responses[i]) {
      render(i);
      return;
  }
  showLoadingAnimation();
  $.ajax({
    url: 'http://api.embed.ly/1/oembed?maxwidth=200&maxheight=200&format=json&url=' + encodeURIComponent(embeds[i]),
    dataType: 'jsonp',
    success: function(response) {
        gadgets.log(gadgets.json.stringify(response));
        if (response.error_message) {
            loadOpenGraph(i);
        } else {
            response.original_url = embeds[i];
            response.thumbnail_url = encodeURI(response.thumbnail_url);
            response.description = response.description.substr(0, 100);
            responses[i] = response;
            render(i);
        }
    },
    error: function(response) {
        gadgets.log(gadgets.json.stringify(response));
    }
  });
}

var notFoundTemplate = '<p>No preview available for <a href="{{url}}" target="_blank">{{short_url}}</a></p>';
function loadOpenGraph(i) {
    var url = embeds[i];
    var params = {}; 
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT; 
    gadgets.io.makeRequest(url, function(response) {
        if (response.errors.length > 0) {
            gadgets.log(gadgets.json.stringify(response.errors));
            $('#embed').html(Mustache.to_html(notFoundTemplate, {url: url, short_url: url.substr(0,50) + '...'}));
            return;
        }
        gadgets.log(gadgets.json.stringify(response));
        var title = response.text.match(/<meta\s*property="og:title\"\s*content="(.*?)"/i);
        var description = response.text.match(/<meta\s*name="description\"\s*content="(.*?)"/i);
        var thumbnail_url = response.text.match(/<meta\s*property="og:image\"\s*content="(.*?)"/i);
        var provider_name = response.text.match(/<meta\s*property="og:site_name\"\s*content="(.*?)"/i);
        var meta = {
            original_url: url
        };
        if (title) {
            meta.title = title[1];
        }
        if (description) {
            meta.description = description[1].substr(0, 100);
        }
        if (thumbnail_url) {
            meta.thumbnail_url = encodeURI(thumbnail_url[1]);
        }
        if (provider_name) {
            meta.provider_name = provider_name[1];
        }
        responses[i] = meta;
        render(i);
    }, params);
}

function render(i) {
    $('#embed').html(Mustache.to_html(embedTemplate, responses[i]));
    gadgets.window.adjustHeight();
}

if (typeof gadgets !== 'undefined' && gadgets.util && gadgets.util.registerOnLoadHandler) {
    gadgets.util.registerOnLoadHandler(gadgetRun);
}
else {
    $(document).ready(function() {
        gadgetRun();
    });
}


/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/
 
var Utf8 = {
 
	// public method for url encoding
	encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// public method for url decoding
	decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}