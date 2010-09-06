// ==UserScript==//
// @name          Elliotoschooloscope
// @namespace     schooloscope.com
// @description   Add Elliotoscope data to Schooloscope
// @include       http://www.schooloscope.com/primary/*
// @include       http://www.schooloscope.com/secondary/*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// ==/UserScript==

function wikipediaNamify(name) {
  return name.replace(/\s/g, "_");
}

function toSentence(array, connector) {
    if (!connector) connector = "and";
    switch(array.length) {
      case 0:  result = ""; break;
      case 1:
        result = array[0].toString(); break;
      case 2:
        result = array[0].toString() + " " + connector + " " + array[1].toString(); break;
      default:
        result = array.slice(0, array.length - 1).join(", ") + " " + connector + " " + array[array.length - 1].toString();
    }
    return result;
  }
  
function output(musicians,actors,writers) {
  if(musicians != "[]" || actors != "[]" || writers != "[]") {
    // ie, there's some output
    htmlString = "<div class='elliotoscope'>";
    if(musicians != "[]") {
      var musiciansData = eval(musicians);
      var musiciansString = "<p><span>Musicians who went to this school:</span> " + toSentence(musiciansData) + "</p>";
      htmlString += musiciansString;
    }
    if(writers != "[]") {
      var writersData = eval(writers);
      var writersString = "<p><span>Writers who went to this school:</span> " + toSentence(writersData) + "</p>";
      htmlString += writersString;
    }
    if(actors != "[]") {
      var actorsData = eval(actors);
      var actorsString = "<p><span>Actors who went to this school:</span> " + toSentence(actorsData) + "</p>";
      htmlString += actorsString;
    }
  }
  styleString = "<style>.elliotoscope span { font-weight: bold;} .elliotoscope {background: #ccc; padding: 10px; margin-top:20px}</style>"
  
  htmlString += "</div>"
  
  $(".school-explanation").append(styleString + htmlString);
}

var ofstedNumber = document.URL.replace(/\D*/, "");
var ofstedLookup = "http://vivid-light-33.heroku.com/school_from_ofsted?ofsted_number=" + ofstedNumber;

musicians = "";

GM_xmlhttpRequest({
    method: 'GET',
    url: ofstedLookup,
    headers: {
        'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
        'Accept': 'application/atom+xml,application/xml,text/xml',
    },
    onload: function(responseDetails) {
      var schoolName = responseDetails.responseText;
      dataObj.schoolName = responseDetails.responseText;
      if(schoolName != "") {
        var wikiSchoolName = wikipediaNamify(schoolName);
        var musicUrl = "http://vivid-light-33.heroku.com/things_associated_with?topic=music&name=" + wikiSchoolName;
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: musicUrl,
            headers: {
                'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
                'Accept': 'application/atom+xml,application/xml,text/xml',
            },
            onload: function(responseDetails) {
              var musicians = responseDetails.responseText;
              var bookUrl = "http://vivid-light-33.heroku.com/things_associated_with?topic=book&name=" + wikiSchoolName;
              
              GM_xmlhttpRequest({
                  method: 'GET',
                  url: bookUrl,
                  headers: {
                      'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
                      'Accept': 'application/atom+xml,application/xml,text/xml',
                  },
                  onload: function(responseDetails) {
                    var writers = responseDetails.responseText;
                    var actorUrl = "http://vivid-light-33.heroku.com/things_associated_with?topic=actor&name=" + wikiSchoolName;
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: actorUrl,
                        headers: {
                            'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
                            'Accept': 'application/atom+xml,application/xml,text/xml',
                        },
                        onload: function(responseDetails) {
                          var actors = responseDetails.responseText;
                          output(musicians,actors,writers);
                        }
                      });
                  }
                });
            }
          });
      }
    }
});