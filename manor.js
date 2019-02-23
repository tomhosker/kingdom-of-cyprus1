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
function getBaronyName(id, barony)
{
  var name = "";
  for(var i = 0; i < barony.length; i++)
  {
    if(barony[i].id === id)
    {
      name = "<a href=\"baronya"+id+"b.html\">"+
             barony[i].name+"</a>";
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
  url = url.substr(url.indexOf("a")+1, url.length);

  var a = url.indexOf("a")+1;
  var b = url.indexOf("b");
  var id = 0;
  if((a > 0) && (b > 0))
  {
    id = url.substr(a, b-a);
    id = parseInt(id);
  }
  else return(fail(response, NotFound, "No such page."));

  var query = "SELECT * FROM Manor WHERE id = "+id+";";
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
  var query = "SELECT * FROM Barony;";
  db.all(query, ready);

  function ready(err, barony)
  {
    if(err) throw err;
    makeReplacements(response, type, err, contents, id,
                     data, person, barony);
  }
}

// Makes the simple replacements.
function makeReplacements(response, type, err, contents, id,
                          data, person, barony)
{
  var name = "", arms = "", master = "", theBarony = "",
      description = "";

  name = data[0].name;
  if(data[0].arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+data[0].arms+"\" "+
            "alt=\"Arms\" align=\"center\" "+
            "width=\"200px\" style=\"margin: 1em\"/>";
  }
  if(data[0].master === null) master = "<em>Vacant</em>";
  else master = getPersonName(data[0].master, person);
  if(data[0].barony === null) theBarony = "<em>None</em>";
  else theBarony = getBaronyName(data[0].barony, barony);
  if(data[0].description === null)
  {
    description = "The <strong>"+name+"</strong> is a manor.";
  }
  else description = data[0].description;

  contents = absRep(contents, "NAME", name);
  contents = absRep(contents, "ARMS", arms);
  contents = absRep(contents, "MASTER", master);
  contents = absRep(contents, "BARONY", theBarony);
  contents = absRep(contents, "DESCRIPTION", description);

  final.wrapup(response, type, err, contents);
}
