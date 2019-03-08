/*
This code is responsible for building the various "Barony" pages.
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

// Returns a linked version of a person's short title.
function makeLinkedST(id, shortTitle, rankTier, style)
{
  var result = "<a href=\"persona"+id+"b.html\">"+shortTitle+"</a>";

  if((rankTier >= constants.marquessRank) && (style !== null))
  {
    result = style+" "+result;
  }
  return(result);
}

// Ronseal.
function buildManors(manors)
{
  var result = "";
  var table = util.getTable();
  var row = [];
  var manor = "", master = "";

  table.setColumns(["Manor", "Master"]);
  for(var i = 0; i < manors.length; i++)
  {
    manor = "<a href=\"manora"+manors[i].manorID+"b.html\">"+
            manors[i].manorName+"</a>";
    master = makeLinkedST(manors[i].masterID, manors[i].masterShortTitle,
                          manors[i].masterRankTier, manors[i].masterStyle);
    row = [manor, master];
    table.addRow(row);
  }
  result = table.buildHTMLPrintout();

  return(result);
}

/*
##############
# FETCH DATA #
##############
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var url = request.url.toLowerCase();
  var a = url.indexOf("baronya")+"baronya".length;
  var b = url.indexOf("b.html");
  var id = 0;
  var query = "SELECT * FROM Barony WHERE id = ?;";
  var data = util.getDataDictionary();

  if((a > 0) && (b > a)) id = parseInt(url.substr(a, b-a));
  else return(final.fail(response, constants.NotFound, "No ID."));

  db.all(query, [id], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    if(extract.length < 1)
    {
      return(fail(response, constants.NotFound, "No such page."));
    }
    data.add("barony", extract);
    begin(response, type, err, contents, id, data);
  }
}

// Ronseal.
function begin(response, type, err, contents, id, data)
{
  id = data.access("barony")[0].id;

  fetchPerson(response, type, err, contents, id, data);
}

// Fetches the "Person" table from the database.
function fetchPerson(response, type, err, contents, id, data)
{
  var query = "SELECT * FROM Person WHERE id = ?;";
  var baronID = data.access("barony")[0].id;

  db.all(query, [baronID], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("baron", extract);
    fetchManor(response, type, err, contents, id, data);
  }
}

// Fetches the "Manor" table from the database.
function fetchManor(response, type, err, contents, id, data)
{
  var query = "SELECT Manor.id AS manorID, "+
                     "Manor.name AS manorName, "+
                     "Person.id AS masterID, "+
                     "Person.shortTitle AS masterShortTitle, "+
                     "Person.rankTier AS masterRankTier, "+
                     "Person.style AS masterStyle "+
              "FROM Manor "+
              "JOIN Person ON Person.id = Manor.master "+
              "WHERE Manor.barony = ? "+
              "ORDER BY Manor.seniority;";

  db.all(query, [id], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("manors", extract);
    fetchCounty(response, type, err, contents, id, data);
  }
}

// Fetches the "County" table from the database.
function fetchCounty(response, type, err, contents, id, data)
{
  var query = "SELECT * FROM County WHERE id = ?;";
  var countyID = data.access("barony")[0].county;

  db.all(query, [countyID], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("county", extract);
    makeReplacements(response, type, err, contents, id, data);
  }
}

// Makes the simple replacements.
function makeReplacements(response, type, err, contents, id, data)
{
  var barony = data.access("barony")[0];
  var baron = data.access("baron")[0];
  var manors = data.access("manors");
  var county = data.access("county")[0];
  var name = "", arms = "", baronName = "", countyName = "",
      description = "", manorsString = "";

  name = barony.name;
  baronName = makeLinkedST(baron.id, baron.shortTitle, baron.rankTier,
                           baron.style);
  theCounty = "<a href=\"countya"+county.id+"b.html\">"+county.name+"</a>";

  if(barony.arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+barony.arms+"\" "+
                      "alt=\"Arms\" "+
                      "align=\"center\" "+
                      "width=\""+constants.vsmallProfilePhotoWidth+"\" "+
                      "style=\"margin: 1em\"/>";
  }

  if(barony.description === null)
  {
    description = "The <strong>"+name+"</strong> is a barony of the "+
                  "County of "+theCounty+".";
  }
  else description = barony.description;

  if(manors.length === 0) manorsString = "<p> <em>None.</em> </p>";
  else manorsString = buildManors(manors);

  contents = util.absRep(contents, "NAME", name);
  contents = util.absRep(contents, "ARMS", arms);
  contents = util.absRep(contents, "BARON", baronName);
  contents = util.absRep(contents, "COUNTY", theCounty);
  contents = util.absRep(contents, "DESCRIPTION", description);
  contents = util.absRep(contents, "MANORS", manorsString);

  final.wrapup(response, type, err, contents);
}
