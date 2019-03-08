/*
This code is responsible for building the various "Duchy" pages.
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
function buildCounties(counties)
{
  var result = "";
  var table = util.getTable();
  var row = [];
  var county = "", earl = "";

  table.setColumns(["County", "Earl"]);
  for(var i = 0; i < counties.length; i++)
  {
    county = "<a href=\"countya"+counties[i].countyID+"b.html\">"+
             counties[i].countyName+"</a>";
    earl = util.makeLinkedST(counties[i].earlID,
                             counties[i].earlShortTitle,
                             counties[i].earlRankTier,
                             counties[i].earlStyle);
    row = [county, earl];
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
  var query = "SELECT * FROM Duchy WHERE id = ?;";
  var data = util.getDataDictionary();

  if((a > 0) && (b > a))
  {
    id = url.substr(a, b-a);
    id = parseInt(id);
  }
  else return(final.fail(response, constants.NotFound, "No ID."));

  db.all(query, [id], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    if(data.length < 1)
    {
      return(final.fail(response, constant.NotFound, "No such page."));
    }
    data.add("duchy", extract);
    begin(response, type, err, contents, id, data);
  }
}

function begin(response, type, err, contents, id, data)
{
  id = data.access("duchy")[0].id;

  fetchDuke(response, type, err, contents, id, data);
}

// Ronseal.
function fetchDuke(response, type, err, contents, id, data)
{
  var query = "SELECT * FROM Person WHERE id = ?;";
  var dukeID = data.access("duchy")[0].duke;

  db.all(query, [dukeID], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("duke", extract);
    fetchCounties(response, type, err, contents, id, data);
  }
}

// Ronseal.
function fetchCounties(response, type, err, contents, id, data)
{
  var query = "SELECT County.id AS countyID, "+
                     "County.name AS countyName, "+
                     "Person.id AS earlID, "+
                     "Person.shortTitle AS earlShortTitle, "+
                     "Person.rankTier AS earlRankTier, "+
                     "Person.style AS earlStyle "+
              "FROM County "+
              "JOIN Person ON Person.id = County.earl "+
              "WHERE County.duchy = ? "+
              "ORDER BY County.seniority;";

  db.all(query, [id], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("counties", extract);
    makeReplacements(response, type, err, contents, id, data);
  }
}

// Ronseal.
function makeReplacements(response, type, err, contents, id, data)
{
  var duchy = data.access("duchy")[0];
  var duke = data.access("duke")[0];
  var counties = data.access("counties");
  var name = "", arms = "", dukeName = "", description = "",
      countiesString = "";

  name = duchy.name;
  dukeName = util.makeLinkedST(duke.id, duke.shortTitle, duke.rankTier,
                               duke.style);

  if(duchy.arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+duchy.arms+"\" "+
                      "alt=\"Arms\" "+
                      "align=\"center\" "+
                      "width=\""+constants.vsmallProfilePhotoWidth+"\" "+
                      "style=\"margin: 1em\"/>";
  }

  if(duchy.description === null)
  {
    description = "The <strong>"+name+"</strong> is a duchy of "+
                  "the Kingdom.";
  }
  else description = duchy.description;

  countiesString = buildCounties(counties);

  contents = util.absRep(contents, "NAME", name);
  contents = util.absRep(contents, "ARMS", arms);
  contents = util.absRep(contents, "DUKE", dukeName);
  contents = util.absRep(contents, "DESCRIPTION", description);
  contents = util.absRep(contents, "COUNTIES", countiesString);

  final.wrapup(response, type, err, contents);
}
