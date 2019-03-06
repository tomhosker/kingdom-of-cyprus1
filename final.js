// Constants.
var constants = require("./constants.js");
var cdates = require("./cdates.js");

// This stuff connects this file to various others.
module.exports = {
  wrapup: function(response, type, err, contents)
  {
    finalTouches(response, type, err, contents);
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

// "Absolute Replace" replaces a given substring.
function absRep(big, old, rep)
{
  var count = 0;

  while((big.indexOf(old) >= 0) && (count < constants.maxloops))
  {
    big = big.replace(old, rep);
    count++;
  }

  return(big);
}

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

  contents = absRep(contents, "GREGDATE", gregDate);
  contents = absRep(contents, "CYPRIANDATE", cyprianDate);
  contents = absRep(contents, "CYPRIANWDAY", cyprianWeekday);
  contents = absRep(contents, "SACREDDATE", sacredDate);
  contents = absRep(contents, "SACREDCOLOUR", sacredColour);

  return(contents);
}

// Rewrites sovereigns' names in special ink.
function redify(contents)
{
  var kingString = "<a href=\"persona1b.html\">";
  var kingStringRed = "<a class=\"red\" href=\"persona1b.html\">";

  contents = absRep(contents, kingString, kingStringRed);

  return(contents);
}

/*
###########
# WRAP UP #
###########
*/

// Some final prettification.
function finalTouches(response, type, err, contents)
{
  // Prettify quotation marks.
  contents = absRep(contents, "`", constants.lquote);
  contents = absRep(contents, "'", constants.rquote);
  contents = absRep(contents, "---", constants.emdash);
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
