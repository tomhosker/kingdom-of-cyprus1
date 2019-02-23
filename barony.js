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
function makeManors(manor, person)
{
  var manors = "<table> <tr> <th>Manor</th> "+
               "<th>Master</th> </tr>";
  for(var i = 0; i < manor.length; i++)
  {
    manors = manors+"<tr> <td><a href=\"manora"+manor[i].id+
             "b.html\">"+manor[i].name+"</a></td>"+
             "<td>"+getPersonName(manor[i].master, person)+
             "</td> </tr> ";
  }
  manors = manors+"</table>";
  return(manors);
}

// Ronseal.
function getCountyName(id, county)
{
  var name = "";
  for(var i = 0; i < county.length; i++)
  {
    if(county[i].id === id)
    {
      name = "<a href=\"countya"+id+"b.html\">"+
             county[i].name+"</a>";
      return(name);
    }
  }
  return("<em>Invalid ID</em>");
}

/*
######################
#     FIRST PASS     #
# Data from "Barony" #
######################
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var url = request.url.toLowerCase();
  url = url.substr(url.indexOf("a")+1, url.length);

  var a = url.indexOf("a")+1;
  var b = url.indexOf("b");
  var id = 0;
  if((a > 0) && (b > 0))
  {
    id = url.substr(a, b-a);
    id = parseInt(id);
  }
  else return(final.fail(response, NotFound, "No such page."));

  var query = "SELECT * FROM Barony WHERE id = "+id+";";
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
    fetchManor(response, type, err, contents, id,
               data, person);
  }
}

// Fetches the "Manor" table from the database.
function fetchManor(response, type, err, contents, id,
                    data, person)
{
  var query = "SELECT * FROM Manor WHERE barony = "+id+" "+
              "ORDER BY seniority;";
  db.all(query, ready);

  function ready(err, manor)
  {
    if(err) throw err;
    fetchCounty(response, type, err, contents, id,
                data, person, manor);
  }
}

// Fetches the "Duchy" table from the database.
function fetchCounty(response, type, err, contents, id,
                     data, person, manor)
{
  var query = "SELECT * FROM County;";
  db.all(query, ready);

  function ready(err, county)
  {
    if(err) throw err;
    makeReplacements(response, type, err, contents, id,
                     data, person, manor, county);
  }
}

// Makes the simple replacements.
function makeReplacements(response, type, err, contents, id,
                          data, person, manor, county)
{
  var name = "", arms = "", baron = "", theCounty = "",
      description = "", manors = "";

  name = data[0].name;
  if(data[0].arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+data[0].arms+"\" "+
            "alt=\"Arms\" align=\"center\" "+
            "width=\"200px\" style=\"margin: 1em\"/>";
  }
  if(data[0].baron === null) baron = "<em>Vacant</em>";
  else baron = getPersonName(data[0].baron, person);
  if(data[0].county === null) theCounty = "<em>None</em>";
  else theCounty = getCountyName(data[0].county, county);
  if(data[0].description === null)
  {
    description = "The <strong>"+name+"</strong> is a barony.";
  }
  else description = data[0].description;
  if(manor.length === 0) manors = "<p> <em>None.</em> </p>";
  else manors = makeManors(manor, person);

  contents = absRep(contents, "NAME", name);
  contents = absRep(contents, "ARMS", arms);
  contents = absRep(contents, "BARON", baron);
  contents = absRep(contents, "COUNTY", theCounty);
  contents = absRep(contents, "DESCRIPTION", description);
  contents = absRep(contents, "MANORS", manors);

  final.wrapup(response, type, err, contents);
}
