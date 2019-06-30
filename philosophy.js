/*
This code is responsible for building the "PHILOSOPHY" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var cutil = require("./cutil.js"), util = cutil.getClass();
var sql = require("sqlite3"), db = new sql.Database("canons.db");

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
  var query = "SELECT * FROM Book "+
              "LEFT JOIN Author ON Author.code = Book.author "+
              "WHERE Book.genre = 'philosophy' "+
              "ORDER BY Author.surname, Book.yearPublished;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeLibrary(response, type, err, contents, data);
  }
}

// Makes the table of philosophical works.
function makeLibrary(response, type, err, contents, data)
{
  var replacement = "";
  var table = util.getTable();
  var columns = ["Author", "Title", "Year", "Notes"];
  var row = [];
  var author = "", title = "", year = "", notes = "";

  table.setHTMLClass("conq");
  table.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    author = util.deNullify(data[i].fullTitle);
    title = util.linkify(data[i].title, data[i].link);
    year = data[i].yearPublished;
    notes = util.deNullify(data[i].notes, ".");
    row = [author, title, year, notes];
    table.addRow(row);
  }
  replacement = table.buildHTMLPrintout();

  contents = util.absRep(contents, "LIBRARY", replacement);

  final.wrapup(response, type, err, contents);
}
