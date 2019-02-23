/*
This code is responsible for building a search page.
*/

// Constants.
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var sql = require("sqlite3");
var db = new sql.Database("cyprus.db");

// This stuff connects this file to server.js.
module.exports = {
  bridge: function(request, response, type, err, content)
  {
    fetchPerson(request, response, type, err, content);
  }
};

/*
####################
# Helper Functions #
####################
*/

// Ronseal.
function arrayBuffertoString(buffer)
{
  return(String.fromCharCode.apply(null,
                                   new Uint16Array(buffer)));
}

// Converts the url to the search string.
function urltoSs(url)
{
  var ss = url.substr(url.indexOf("=")+1, url.length);
  // HTML form replaces ' ' with '+'. Let's undo this.
  while(ss.indexOf("+") >= 0)
  {
    ss = ss.replace("+", " ");
  }
  return(ss);
}

// Ronseal.
function checkField(ss, field)
{
  if(field != null)
  {
    if(field.indexOf(ss) >= 0) return(true);
  }
  return(false);
}

// Looks for a string within a stud's entry on the DB.
function isOnPersonPage(ss, data, i)
{
  if(checkField(ss, data[i].shortTitle)) return(true);
  return(false);
}

/*
######################
#     First Pass     #
# Data from "Person" #
######################
*/

// Fetches the required data from the database.
function fetchPerson(request, response, type, err, content)
{
  "use strict";
  var query = "SELECT * "+
              "FROM Person "+
              "ORDER BY rankTier DESC;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    process1(request, response, type, err, content, data);
  }
}

// Begin processing the page's content by replacing "content"
// with a string "contents".
function process1(request, response, type, err, content, data)
{
  var contents = arrayBuffertoString(content);
  var ss = urltoSs(request.url);

  addPerson(request, response, type, err, contents, ss, data);
}

// Continue processing by adding the "Stud" pages to "results".
function addPerson(request, response, type, err, contents,
                   ss, data)
{
  var results = "";
  var count = 0;
  for(var i = 0; i < data.length; i++)
  {
    if(isOnPersonPage(ss, data, i))
    {
      count++;
      results = results+"<p> "+count+".  "
                +"<strong> <a href=\"persona"
                +data[i].id+"b.html\">"
                +data[i].shortTitle
                +"</a> </strong> </p>";
    }
  }

  finalTouches(request, response, type, err, contents, ss,
               results, count);
}

/*
###########
# Wrap Up #
###########
*/

// Ronseal.
function finalTouches(request, response, type, err, contents, ss,
                      results, count)
{
  contents = contents.replace(/QUERY/g, "\""+ss+"\"");

  if(count == 0) results = "<p> Nothing found. </p>";
  contents = contents.replace("RESULTS", results);

  deliver(request, response, type, err, contents);
}

// Delivers the file that has been read in to the browser.
function deliver(request, response, type, err, contents)
{
  if(err) return(fail(response, NotFound, "File not found"));
  var typeHeader = { "Content-Type": type };

  response.writeHead(OK, typeHeader);
  response.write(contents);
  response.end();
}

// IAN'S FUNCTION.
// Give a minimal failure response to the browser
function fail(response, code, text) {
    var textTypeHeader = { "Content-Type": "text/plain" };
    response.writeHead(code, textTypeHeader);
    response.write(text, "utf8");
    response.end();
}
