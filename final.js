// Imports.
var constants = require("./constants.js");
var cdates = require("./cdates.js");
var cutil = require("./cutil.js"), util = cutil.getClass();

// This stuff connects this file to various others.
module.exports = {
  wrapup: function(response, type, err, contents)
  {
    footerMaker(response, type, err, contents);
  },
  fail: function(response, code, text)
  {
    fail(response, code, text)
  }
};

/* 
####################
# HELPER FUNCTIONS #
####################
*/

// Adds today's date in its various forms.
function addDates(contents)
{
  var cdd = cdates.getClass();
  var gregDate = cdd.gregorian.dateString;
  var cyprianDate = "", cyprianWeekday = "";
  var sacredDate = "", sacredColour = "";

  if((contents.indexOf("CYPRIANDATE") >= 0) ||
     (contents.indexOf("CYPRIANWDAY") >= 0))
  {
    cdd.updateCyprian();
    cyprianDate = cdd.cyprian.dateString;
    cyprianWeekday = cdd.cyprian.weekday;
  }

  if((contents.indexOf("SACREDDATE") >= 0) ||
     (contents.indexOf("SACREDCOLOUR") >= 0))
  {
    cdd.updateSacred();
    sacredDate = cdd.sacred.dateString;
    sacredColour = cdd.sacred.colour;
  }

  contents = util.absRep(contents, "GREGDATE", gregDate);
  contents = util.absRep(contents, "CYPRIANDATE", cyprianDate);
  contents = util.absRep(contents, "CYPRIANWDAY", cyprianWeekday);
  contents = util.absRep(contents, "SACREDDATE", sacredDate);
  contents = util.absRep(contents, "SACREDCOLOUR", sacredColour);

  return(contents);
}

// Rewrites sovereigns' names in special ink.
function redify(contents)
{
  var kingString = "<a href=\"persona1b.html\">";
  var kingStringRed = "<a class=\"red\" href=\"persona1b.html\">";

  contents = util.absRep(contents, kingString, kingStringRed);

  return(contents);
}

/*
###########
# WRAP UP #
###########
*/

// Ronseal.
function footerMaker(response, type, err, contents)
{
  var footer = "<div class=\"footer\">\n"+
               "<p> Property of His Majesty's Government &#8226; "+
               "<a href=\"index.html\">Home</a> &#8226; "+
               "<a href=\"kingdom.html\">About the Kingdom</a> &#8226; "+
               "<a href=\"support.html\">Support</a> &#8226; "+
               "<a href=\"go_for.html\">Search</a> &#8226; "+
               "<a href=\"more.html\">More</a> &#8226; "+
               "Accessed: GREGDATE </p>\n"+
               "</div>";

  contents = contents.replace("THEFOOTER", footer);

  finalTouches(response, type, err, contents);
}

// Some final prettification.
function finalTouches(response, type, err, contents)
{
  // Prettify quotation marks.
  contents = util.absRep(contents, "`", constants.lquote);
  contents = util.absRep(contents, "'", constants.rquote);
  contents = util.absRep(contents, "---", constants.emdash);
  // Add today's date in its various forms.
  contents = addDates(contents);
  // Sovereigns' names are written in special ink.
  contents = redify(contents);

  deliver(response, type, err, contents);
}

// Delivers the file that has been read in to the browser.
function deliver(response, type, err, contents)
{
  var typeHeader = { "Content-Type": type };
  response.writeHead(constants.OK, typeHeader);
  response.write(contents);
  response.end();
}

// Give a minimal failure response to the browser
function fail(response, code, text)
{
  var textTypeHeader = { "Content-Type": "text/plain" };
  response.writeHead(code, textTypeHeader);
  response.write(text, "utf8");
  response.end();
}
