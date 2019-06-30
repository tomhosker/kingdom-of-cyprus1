/*
This code is responsible for building the "THEOLOGY" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var cutil = require("./cutil.js"), util = cutil.getClass();
var sql = require("sqlite3"), db = new sql.Database("canons.db");

// Local constants.
var trueInt = 1;
var falseInt = 0;

// This stuff connects this file to server.js.
module.exports = {
  bridge: function(request, response, type, err, contents)
  {
    fetch(request, response, type, err, contents);
  }
};

/*
#########################
#      FIRST PASS       #
# Data from "Book", etc #
#########################
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM Book "+
              "LEFT JOIN Author ON Author.code = Book.author "+
              "ORDER BY surname, title, yearPublished;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeSacred(response, type, err, contents, data);
  }
}

// Makes the table of works in the sacred languages.
function makeSacred(response, type, err, contents, data)
{
  var row = [];
  var columns = ["Poet", "Title",
                 "On the <a href=\"catalogue.html\">Catalogue</a>",
                 "Notes"];
  var poet = "", title = "", inCat = "", notes = "";
  var hebrew = util.getTable(), greek = util.getTable(),
      latin = util.getTable(), trans = util.getTable();
  var hebrewString = "", greekString = "", latinString = "",
      transString = "";

  hebrew.setHTMLClass("conq");
  greek.setHTMLClass("conq");
  latin.setHTMLClass("conq");
  trans.setHTMLClass("conq");
  hebrew.setColumns(columns);
  greek.setColumns(columns);
  latin.setColumns(columns);
  trans.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    poet = util.deNullify(data[i].fullTitle);

    if(data[i].link === null) title = "<em>"+data[i].title+"</em>";
    else
    {
      title = "<em><a href=\""+data[i].link+"\">"+data[i].title+
              "</a></em>";
    }

    inCat = util.digitToYesNo(data[i].inCatalogue);
    notes = util.deNullify(data[i].notes, ".");
    row = [poet, title, inCat, notes];

    if(data[i].genre === "hebrew") hebrew.addRow(row);
    else if(data[i].genre === "greek") greek.addRow(row);
    else if(data[i].genre === "latin") latin.addRow(row);
    else if(data[i].genre === "trans") trans.addRow(row);
  }
  hebrewString = hebrew.buildHTMLPrintout();
  greekString = greek.buildHTMLPrintout();
  latinString = latin.buildHTMLPrintout();
  transString = trans.buildHTMLPrintout();

  contents = util.absRep(contents, "HEBREWWORKS", hebrewString);
  contents = util.absRep(contents, "GREEKWORKS", greekString);
  contents = util.absRep(contents, "LATINWORKS", latinString);
  contents = util.absRep(contents, "TRANSLATIONS", transString);

  makeOthers(response, type, err, contents, data);
}


// Makes the table of other books.
function makeOthers(response, type, err, contents, data)
{
  var tableString = "";
  var table = util.getTable(), row = [];
  var columns = ["Author", "Title", "Year",
                 "On the <a href=\"catalogue.html\">Catalogue</a>",
                 "Notes"];
  var author = "", title = "", year = "", inCat = "", notes = "";

  table.setHTMLClass("conq");
  table.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    if(data[i].genre === "theology")
    {
      author = util.deNullify(data[i].fullTitle);

      if(data[i].link === null) title = "<em>"+data[i].title+"</em>";
      else
      {
        title = "<em><a href=\""+data[i].link+"\">"+data[i].title+
                "</a></em>";
      }

      year = data[i].yearPublished.toString();
      inCat = util.digitToYesNo(data[i].inCatalogue);
      notes = util.deNullify(data[i].notes, ".");
      row = [author, title, year, inCat, notes];
      table.addRow(row);
    }
  }
  tableString = table.buildHTMLPrintout();

  contents = util.absRep(contents, "OTHERWORKS", tableString);

  final.wrapup(response, type, err, contents);
}
