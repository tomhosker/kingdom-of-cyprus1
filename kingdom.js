/*
This code is responsible for building the LIST of "County" pages.
*/

// Imports.
var constants = require("./constants.js");
var cutil = require("./cutil.js"), util = cutil.getClass();
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
function buildDuchies(duchies)
{
  var result = "";
  var table = util.getTable();
  var row = [];
  var duchy = "", duke = "";

  table.setHTMLClass("wider");
  table.setColumns(["Duchy", "Duke"]);
  for(var i = 0; i < duchies.length; i++)
  {
    duchy = "<a href=\"duchya"+duchies[i].duchyID+"b.html\">"+
            duchies[i].duchyName+"</a>";
    duke = util.makeLinkedST(duchies[i].dukeID,
                             duchies[i].dukeShortTitle,
                             duchies[i].dukeRankTier,
                             duchies[i].dukeStyle);
    row = [duchy, duke];
    table.addRow(row);
  }
  result = table.buildHTMLPrintout();

  return(result);
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
  var query = "SELECT Duchy.id AS duchyID, "+
                     "Duchy.name AS duchyName, "+
                     "Person.id AS dukeID, "+
                     "Person.shortTitle AS dukeShortTitle, "+
                     "Person.rankTier AS dukeRankTier, "+
                     "Person.style AS dukeStyle "+
              "FROM Duchy "+
              "JOIN Person ON Person.id = Duchy.duke "+
              "ORDER BY Duchy.seniority;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeReplacement(response, type, err, contents, data);
  }
}

// Ronseal.
function makeReplacement(response, type, err, contents, data)
{
  var replacement = buildDuchies(data);

  contents = contents.replace("DUCHIES", replacement);

  final.wrapup(response, type, err, contents);
}
