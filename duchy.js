/*
This code is responsible for building the various "Barony" pages.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("cyprus.db");

// This stuff connects this file to server.js.
module.exports = {
  bridge: function(request, response, type, err, contents)
  {
    fetch(request, response, type, err, contents);
  }
};

/* 
####################
# HELPER FUNCTIONS #
####################
*/

// "Absolute Replace" replaces a given substring.
function absRep(bigstring, lilstring, rep)
{
  var count = 0;
  while((bigstring.indexOf(lilstring) >= 0) &&
        (count < constants.maxloops))
  {
    bigstring = bigstring.replace(lilstring, rep);
    count++;
  }
  return(bigstring);
}

// "Conditional Replace" replaces a sub-string with (0) or (1).
function conRep(bigstring, lilstring, rep0, rep1)
{
  var count = 0;
  if(rep0 != null)
  {
    while((bigstring.indexOf(lilstring) >= 0) &&
          (count < constants.maxloops))
    {
      bigstring = bigstring.replace(lilstring, rep0);
      count++;
    }
  }
  else
  {
    while((bigstring.indexOf(lilstring) >= 0) &&
          (count < constants.maxloops))
    {
      bigstring = bigstring.replace(lilstring, rep1);
      count++;
    }
  }
  return(bigstring);
}

// Ronseal.
function getPersonName(id, person)
{
  var name = "";
  for(var i = 0; i < person.length; i++)
  {
    if(person[i].id === id)
    {
      name = "<a href=\"persona"+id+"b.html\">"+
             person[i].shortTitle+"</a>";
      return(name);
    }
  }
  return("<em>Invalid ID</em>");
}

// Ronseal.
function makeCounties(county, person)
{
  var counties = "<table> <tr> <th>County</th> <th>Earl</th> </tr>";
  for(var i = 0; i < county.length; i++)
  {
    counties = counties+"<tr> <td><a href=\"countya"+county[i].id+
               "b.html\">"+county[i].name+"</a></td>"+
               "<td>"+getPersonName(county[i].earl, person)+
               "</td> </tr> ";
  }
  counties = counties+"</table>";
  return(counties);
}

/*
#####################
#    FIRST PASS     #
# Data from "Duchy" #
#####################
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var url = request.url.toLowerCase();

  var a = url.indexOf("a")+1;
  var b = url.indexOf("b");
  var id = 0;
  if((a > 0) && (b > 0))
  {
    id = url.substr(a, b-a);
    id = parseInt(id);
  }
  else return(fail(response, NotFound, "No such page."));

  var query = "SELECT * FROM Duchy WHERE id = "+id+";";
  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    if(data.length < 1)
    {
      return(fail(response, NotFound, "No such page."));
    }
    begin(response, type, err, contents, id, data);
  }
}

// Ronseal.
function begin(response, type, err, contents, id, data)
{
  fetchPerson(response, type, err, contents, id, data);
}

// Fetches the "Person" table from the database.
function fetchPerson(response, type, err, contents, id, data)
{
  var query = "SELECT * FROM Person;";
  db.all(query, ready);

  function ready(err, person)
  {
    if(err) throw err;
    fetchCounty(response, type, err, contents, id,
                data, person);
  }
}

// Fetches the "Person" table from the database.
function fetchCounty(response, type, err, contents, id,
                     data, person)
{
  var query = "SELECT * FROM County WHERE duchy = "+id+" "+
              "ORDER BY "+"seniority;";
  db.all(query, ready);

  function ready(err, county)
  {
    if(err) throw err;
    makeReplacements(response, type, err, contents, id,
                     data, person, county);
  }
}

// Makes the simple replacements.
function makeReplacements(response, type, err, contents, id,
                          data, person, county)
{
  var name = "";
  var arms = "";
  var duke = "";
  var description = "";
  var counties = "";

  name = data[0].name;
  if(data[0].arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+data[0].arms+"\" "+
            "alt=\"Arms\" align=\"center\" "+
            "width=\"200px\" style=\"margin: 1em\"/>";
  }
  if(data[0].duke === null) duke = "<em>Vacant</em>";
  else duke = getPersonName(data[0].duke, person);
  if(data[0].description === null)
  {
    description = "The <strong>"+name+"</strong> is a duchy.";
  }
  else description = data[0].description;
  if(county.length === 0) counties = "<p> <em>None.</em> </p>";
  else counties = makeCounties(county, person);

  contents = absRep(contents, "NAME", name);
  contents = absRep(contents, "ARMS", arms);
  contents = absRep(contents, "DUKE", duke);
  contents = absRep(contents, "DESCRIPTION", description);
  contents = absRep(contents, "COUNTIES", counties);

  final.wrapup(response, type, err, contents);
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
  contents = absRep(contents, "`", "&#8216;");
  contents = absRep(contents, "'", "&#8217;");

  deliver(response, type, err, contents)
}

// Delivers the file that has been read in to the browser.
function deliver(response, type, err, contents)
{
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
