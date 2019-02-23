/*
This code is responsible for building the LIST of "County" pages.
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

// Ronseal.
function extractName(id, person)
{
  for(var i = 0; i < person.length; i++)
  {
    if(person[i].id === id) return(person[i].shortTitle);
  }
  return("<em>Invalid ID</em>");
}

/*
#########
# START #
#########
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM Duchy ORDER BY seniority;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    fetchPerson(response, type, err, contents, data);
  }
}

// Fetches the "Person" table from the database.
function fetchPerson(response, type, err, contents, data)
{
  "use strict";
  var query = "SELECT * FROM Person;";

  db.all(query, ready);

  function ready(err, person)
  {
    if(err) throw err;
    makeReplacement(response, type, err, contents, data, person);
  }
}

// Ronseal.
function makeReplacement(response, type, err, contents,
                         data, person)
{
  var replacement = "<table> "+
    "<tr> <th>Duchy</th> <th>Duke</th> </tr> ";
  for(var i = 0; i < data.length; i++)
  {
    replacement = replacement+"<tr> "+
                  "<td><a href=\"duchya"+data[i].id+"b.html\">"+
                       data[i].name+"</a></td> "+
                  "<td><a href=\"persona"+data[i].duke+"b.html\">"+
                       extractName(data[i].duke, person)+
                  "</a></td> </tr>";
  }
  replacement = replacement+"</table>";

  contents = contents.replace("DUCHIES", replacement);

  final.wrapup(response, type, err, contents);
}
