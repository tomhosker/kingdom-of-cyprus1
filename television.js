/*
This code is responsible for building the "CINEMA" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var cutil = require("./cutil.js"), util = cutil.getClass();
var sql = require("sqlite3"), db = new sql.Database("canons.db");

// Local constants.
var canonLength = 15;

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
function makeRow(row)
{
  var result = [];
  var ordinal = "", title = ""; year = "", notes = "";

  ordinal = String(canonLength+1-row.rank);

  if(row.link === null)
  {
    title = "<em>"+row.title+"</em>";
  }
  else
  {
    title = "<em><a href=\""+row.link+"\">"+row.title+"</a></em>";
  }

  year = row.startYear+"---"+row.endYear;
  notes = util.deNullify(row.notes, ".");

  result = [ordinal, title, year, notes];

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
  var query = "SELECT * FROM TVSeries "+
              "WHERE rank <= "+canonLength+" "+
              "ORDER BY rank DESC;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeTelevision(response, type, err, contents, data);
  }
}

// Makes the table of works by Golden Age poets.
function makeTelevision(response, type, err, contents, data)
{
  var tv = "";
  var table = util.getTable();
  var columns = ["No", "Title", "Years", "Notes"], row = [];

  table.setHTMLClass("conq");
  table.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    row = makeRow(data[i]);
    table.addRow(row);
  }

  tv = table.buildHTMLPrintout();

  contents = util.absRep(contents, "THELIST", tv);

  final.wrapup(response, type, err, contents);
}
