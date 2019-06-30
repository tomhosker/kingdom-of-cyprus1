/*
This code is responsible for building the various "Manor" pages.
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
#########
# START #
#########
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var url = request.url.toLowerCase();
  var a = url.indexOf("manora")+"manora".length;
  var b = url.indexOf("b");
  var id = 0;
  var data = util.getDataDictionary();
  var query = "SELECT * FROM Manor WHERE id = ?;";

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
      return(final.fail(response, constants.NotFound, "No such page."));
    }
    data.add("manor", extract);
    begin(response, type, err, contents, id, data);
  }
}

function begin(response, type, err, contents, id, data)
{
  id = data.access("manor")[0].id;

  fetchMaster(response, type, err, contents, id, data);
}

// Ronseal.
function fetchMaster(response, type, err, contents, id, data)
{
  var query = "SELECT * FROM Person WHERE id = ?;";
  var masterID = data.access("manor")[0].master;

  db.all(query, [masterID], ready);

  function ready(err, extract)
  {
    if(err) throw err;
    data.add("master", extract);
    fetchBarony(response, type, err, contents, id, data);
  }
}

// Ronseal.
function fetchBarony(response, type, err, contents, id, data)
{
  var query = "SELECT * FROM Barony WHERE id = ?;";
  var baronyID = data.access("manor")[0].barony;

  db.all(query, [baronyID], ready);

  function ready(err, extract)
  {
    if(err) throw err;

    if(extract.length === 0) data.add("barony", null);
    else data.add("barony", extract);

    makeReplacements(response, type, err, contents, id, data);
  }
}

// Makes the simple replacements.
function makeReplacements(response, type, err, contents, id, data)
{
  var manor = data.access("manor")[0];
  var master = data.access("master")[0];
  var barony = data.access("barony")[0];
  var name = "", arms = "", masterName = "", baronyName = "",
      description = "";

  name = manor.name;
  masterName = util.makeLinkedST(master.id, master.shortTitle,
                                 master.rankTier, master.style);

  if(manor.arms === null) arms = "";
  else
  {
     arms = "<br/><img src=\"images/"+manor.arms+"\" "+
                      "alt=\"Arms\" "+
                      "align=\"center\" "+
                      "width=\""+constants.vsmallProfilePhotoWidth+"\" "+
                      "style=\"margin: 1em\"/>";
  }

  if(barony === null) baronyName = "<em>None</em>";
  else
  {
    baronyName = "<a href=\"baronya"+barony.id+"b.html\">"+
                 barony.name+"</a>";
  }

  if(manor.description === null)
  {
    description = "The <strong>"+name+"</strong> is a manor.";
  }
  else description = manor.description;

  contents = util.absRep(contents, "NAME", name);
  contents = util.absRep(contents, "ARMS", arms);
  contents = util.absRep(contents, "MASTER", masterName);
  contents = util.absRep(contents, "BARONY", baronyName);
  contents = util.absRep(contents, "DESCRIPTION", description);

  final.wrapup(response, type, err, contents);
}
