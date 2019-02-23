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
function makeBaronies(barony, person)
{
  var baronies = "<table> <tr> <th>Barony</th> "+
                 "<th>Baron</th> </tr>";
  for(var i = 0; i < barony.length; i++)
  {
    baronies = baronies+"<tr> <td><a href=\"baronya"+barony[i].id+
               "b.html\">"+barony[i].name+"</a></td>"+
               "<td>"+getPersonName(barony[i].baron, person)+
               "</td> </tr> ";
  }
  baronies = baronies+"</table>";
  return(baronies);
}

// Ronseal.
function getDuchyName(id, duchy)
{
  var name = "";
  for(var i = 0; i < duchy.length; i++)
  {
    if(duchy[i].id === id)
    {
      name = "<a href=\"duchya"+id+"b.html\">"+
             duchy[i].name+"</a>";
      return(name);
    }
  }
  return("<em>Invalid ID</em>");
}

/*
######################
#     FIRST PASS     #
# Data from "County" #
######################
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

  var query = "SELECT * FROM County WHERE id = "+id+";";
  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    if(data.length < 1)
    {
      return(final.fail(response, NotFound, "No such page."));
    }
    begin(response, type, err, contents, id, data);
  }
}

// Begin processing the page's content
// by turning "content" into a string "contents".
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
    fetchBarony(response, type, err, contents, id,
                data, person);
  }
}

// Fetches the "Barony" table from the database.
function fetchBarony(response, type, err, contents, id,
                     data, person)
{
  var query = "SELECT * FROM Barony WHERE county = "+id+" "+
              "ORDER BY "+"seniority;";
  db.all(query, ready);

  function ready(err, barony)
  {
    if(err) throw err;
    fetchDuchy(response, type, err, contents, id,
               data, person, barony);
  }
}

// Fetches the "Duchy" table from the database.
function fetchDuchy(response, type, err, contents, id,
                    data, person, barony)
{
  var query = "SELECT * FROM Duchy;";
  db.all(query, ready);

  function ready(err, duchy)
  {
    if(err) throw err;
    makeReplacements(response, type, err, contents, id,
                     data, person, barony, duchy);
  }
}

// Makes the simple replacements.
function makeReplacements(response, type, err, contents, id,
                          data, person, barony, duchy)
{
  var name = "", arms = "", earl = "", theDuchy = "",
      description = "", baronies = "";

  name = data[0].name;
  if(data[0].arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+data[0].arms+"\" "+
            "alt=\"Arms\" align=\"center\" "+
            "width=\"200px\" style=\"margin: 1em\"/>";
  }
  if(data[0].earl === null) earl = "<em>Vacant</em>";
  else earl = getPersonName(data[0].earl, person);
  if(data[0].duchy === null) theDuchy = "<em>None</em>";
  else theDuchy = getDuchyName(data[0].duchy, duchy);
  if(data[0].description === null)
  {
    description = "The <strong>"+name+"</strong> is a duchy.";
  }
  else description = data[0].description;
  if(barony.length === 0) baronies = "<p> <em>None.</em> </p>";
  else baronies = makeBaronies(barony, person);

  contents = absRep(contents, "NAME", name);
  contents = absRep(contents, "ARMS", arms);
  contents = absRep(contents, "EARL", earl);
  contents = absRep(contents, "DUCHY", theDuchy);
  contents = absRep(contents, "DESCRIPTION", description);
  contents = absRep(contents, "BARONIES", baronies);

  final.wrapup(response, type, err, contents);
}
