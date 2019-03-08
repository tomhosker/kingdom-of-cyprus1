/*
This code is responsible for building the various "County" pages.
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
function buildBaronies(baronies)
{
  var result = "";
  var table = util.getTable();
  var row = [];
  var barony = "", baron = "";

  table.setColumns(["Barony", "Baron"]);
  for(var i = 0; i < baronies.length; i++)
  {
    barony = "<a href=\"baronya"+baronies[i].baronyID+"b.html\">"+
             baronies[i].baronyName+"</a>";
    baron = util.makeLinkedST(baronies[i].baronID,
                              baronies[i].baronShortTitle,
                              baronies[i].baronRankTier,
                              baronies[i].baronStyle);
    row = [barony, baron];
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
  var url = request.url.toLowerCase();
  var a = url.indexOf("a")+1;
  var b = url.indexOf("b");
  var id = 0;
  var data = util.getDataDictionary();
  var query = "SELECT * FROM County WHERE id = ?;";

  if((a > 0) && (b > 0))
  {
    id = url.substr(a, b-a);
    id = parseInt(id);
  }
  else return(final.fail(response, constants.NotFound, "Bad ID."));

  db.all(query, [id], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    if(data.length < 1)
    {
      return(final.fail(response, constants.NotFound, "No such page."));
    }
    data.add("county", extract);
    begin(response, type, err, contents, id, data);
  }
}

function begin(response, type, err, contents, id, data)
{
  id = data.access("county")[0].id;

  fetchEarl(response, type, err, contents, id, data);
}

// Ronseal.
function fetchEarl(response, type, err, contents, id, data)
{
  var earlID = data.access("county")[0].earl;
  var query = "SELECT * FROM Person WHERE id = ?;";

  db.all(query, [earlID], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("earl", extract);
    fetchBaronies(response, type, err, contents, id, data);
  }
}

// Ronseal.
function fetchBaronies(response, type, err, contents, id, data)
{
  var query = "SELECT Barony.id AS baronyID, "+
                     "Barony.name AS baronyName, "+
                     "Person.id AS baronID, "+
                     "Person.shortTitle AS baronShortTitle, "+
                     "Person.rankTier AS baronRankTier, "+
                     "Person.style AS baronStyle "+
              "FROM Barony "+
              "JOIN Person ON Person.id = Barony.baron "+
              "WHERE Barony.county = ? "+
              "ORDER BY Barony.seniority;";

  db.all(query, [id], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("baronies", extract);
    fetchDuchy(response, type, err, contents, id, data);
  }
}

// Ronseal.
function fetchDuchy(response, type, err, contents, id, data)
{
  var duchyID = data.access("county")[0].duchy;
  var query = "SELECT * FROM Duchy WHERE id = ?;";

  db.all(query, [duchyID], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("duchy", extract);
    makeReplacements(response, type, err, contents, id, data);
  }
}

// Makes the simple replacements.
function makeReplacements(response, type, err, contents, id, data)
{
  var county = data.access("county")[0];
  var earl = data.access("earl")[0];
  var baronies = data.access("baronies");
  var duchy = data.access("duchy")[0];

  var name = "", arms = "", earlName = "", duchyName = "",
      description = "", baroniesString = "";

  name = county.name;
  earlName = util.makeLinkedST(earl.id, earl.shortTitle, earl.rankTier,
                               earl.style);
  duchyName = "<a href=\"duchya"+duchy.id+"b.html\">"+duchy.name+"</a>";

  if(county.arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+county.arms+"\" "+
                      "alt=\"Arms\" "+
                      "align=\"center\" "+
                      "width=\""+constants.vsmallProfilePhotoWidth+"\" "+
                      "style=\"margin: 1em\"/>";
  }

  if(county.description === null)
  {
    description = "The <strong>"+name+"</strong> is a county of the"+
                  duchyName+".";
  }
  else description = county.description;

  baroniesString = buildBaronies(baronies);

  contents = util.absRep(contents, "NAME", name);
  contents = util.absRep(contents, "ARMS", arms);
  contents = util.absRep(contents, "EARL", earlName);
  contents = util.absRep(contents, "DUCHY", duchyName);
  contents = util.absRep(contents, "DESCRIPTION", description);
  contents = util.absRep(contents, "BARONIES", baroniesString);

  final.wrapup(response, type, err, contents);
}
