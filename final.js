// Constants.
var constants = require("./constants.js");
var maxloops = 1000;
var OK = 200, NotFound = 404, BadType = 415, Error = 500;

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
  while((big.indexOf(old) >= 0) &&
        (count < maxloops))
  {
    big = big.replace(old, rep);
    count++;
  }
  return(big);
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
