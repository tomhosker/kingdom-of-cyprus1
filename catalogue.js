/*
This code is responsible for building the "CATALOGUE" page.
*/

// Imports.
var constants = require("./constants.js");
var cutil = require("./cutil.js"), util = cutil.getClass();
var final = require("./final.js");
var sql = require("sqlite3"), db = new sql.Database("canons.db");

// Local constants.
var goldenAgeStart = 1485;
var goldenAgeEnd = 1899;
var goldenAgeEndBook = 1918;
var queenVicAccession = 1837;
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
####################
# HELPER FUNCTIONS #
####################
*/

// Determines if a book is a "treasure".
function isTreasure(row)
{
  if(row.yearPublished < queenVicAccession) return(true);
  else return(false);
}

// Determines if a book is written in Hebrew.
function isHebrew(row)
{
  if(isTreasure(row) === true) return(false);
  else if(row.genre === "hebrew") return(true);
  else return(false);
}

// Determines if a book is written in Greek.
function isGreek(row)
{
  if(isTreasure(row) === true) return(false);
  else if(row.genre === "greek") return(true);
  else return(false);
}

// Determines if a book is written in Latin.
function isLatin(row)
{
  if(isTreasure(row) === true) return(false);
  else if(row.genre === "latin") return(true);
  else return(false);
}

// Determines if a book is written in a sacred language.
function isSacred(row)
{
  if(isTreasure(row) === true) return(false);
  else if(isHebrew(row) === true) return(true);
  else if(isGreek(row) === true) return(true);
  else if(isLatin(row) === true) return(true);
  else return(false);
}

// Determines if a book falls into the "Parnassian" category.
function isParnassian(row)
{
  if(isTreasure(row) === true) return(false);
  else if((row.dob >= goldenAgeStart) &&
          (row.dob <= goldenAgeEnd) &&
          (row.genre === "poetry"))
  {
    return(true);
  }
  else return(false);
}

// Determines if a book falls into the "Anthology" category.
function isAnthology(row)
{
  if(isTreasure(row) === true) return(false);
  else if((row.surname === null) &&
          (row.genre === "poetry") &&
          (row.yearPublished <= goldenAgeEndBook))
  {
    return(true);
  }
  else return(false);
}

// Determines whether a book doesn't fit any of the above categories.
function isOther(row)
{
  if((isSacred(row) === false) &&
     (isParnassian(row) === false) &&
     (isAnthology(row) === false) &&
     (isTreasure(row) === false))
  {
    return(true);
  }
  else return(false);
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
  var query = "SELECT * FROM PaperBook "+
              "LEFT JOIN Author ON Author.code = PaperBook.author "+
              "ORDER BY surname, yearPublished;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makePoets(response, type, err, contents, data);
  }
}

// Makes the table of works by Golden Age poets.
function makePoets(response, type, err, contents, data)
{
  var result = "";
  var table = util.getTable();
  var columns = ["Poet", "Title", "Year",
                 "In the <a href=\"library.html\">Library</a>", "Notes"];
  var row = [];
  var poet = "", title = "", year = "", inLib = "", notes = "";

  table.setHTMLClass("conq");
  table.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    if(isParnassian(data[i]))
    {
      poet = util.deNullify(data[i].fullTitle);
      title = "<em>"+data[i].title+"</em>";
      year = data[i].yearPublished;
      inLib = util.digitToYesNo(data[i].inLibrary);
      notes = util.deNullify(data[i].notes, ".");

      row = [poet, title, year, inLib, notes];
      table.addRow(row);
    }
  }

  result = table.buildHTMLPrintout();
  contents = util.absRep(contents, "POETS", result);

  makeAnthology(response, type, err, contents, data);
}

// Makes the table of works by Golden Age poets.
function makeAnthology(response, type, err, contents, data)
{
  var result = "";
  var table = util.getTable();
  var columns = ["Title", "Year",
                 "In the <a href=\"library.html\">Library</a>", "Notes"];
  var row = [];
  var poet = "", title = "", year = "", inLib = "", notes = "";

  table.setHTMLClass("conq");
  table.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    if(isAnthology(data[i]))
    {
      title = "<em>"+data[i].title+"</em>";
      year = data[i].yearPublished;
      inLib = util.digitToYesNo(data[i].inLibrary);
      notes = util.deNullify(data[i].notes, ".");

      row = [title, year, inLib, notes];
      table.addRow(row);
    }
  }

  result = table.buildHTMLPrintout();
  contents = util.absRep(contents, "ANTHOLOGIES", result);

  makeSacred(response, type, err, contents, data);
}

// Makes the table of works in sacred languages.
function makeSacred(response, type, err, contents, data)
{
  var resultH = "", resultG = "", resultL = "";
  var columns = ["Poet", "Title", "Year",
                 "In the <a href=\"theology.html\">Library</a>", "Notes"];
  var hebrew = util.getTable();
  var greek = util.getTable();
  var latin = util.getTable();
  var row = [];
  var poet = "", title = "", year = "", inLib = "", notes = "";

  hebrew.setHTMLClass("conq");
  greek.setHTMLClass("conq");
  latin.setHTMLClass("conq");
  hebrew.setColumns(columns);
  greek.setColumns(columns);
  latin.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    poet = util.deNullify(data[i].fullTitle);
    title = "<em>"+data[i].title+"</em>";
    year = data[i].yearPublished;
    inLib = util.digitToYesNo(data[i].inLibrary);
    notes = util.deNullify(data[i].notes, ".");
    row = [poet, title, year, inLib, notes];

    if(isHebrew(data[i])) hebrew.addRow(row);
    else if(isGreek(data[i])) greek.addRow(row);
    else if(isLatin(data[i])) latin.addRow(row);
  }
  resultH = hebrew.buildHTMLPrintout();
  resultG = greek.buildHTMLPrintout();
  resultL = latin.buildHTMLPrintout();

  contents = util.absRep(contents, "SACREDHEBREW", resultH);
  contents = util.absRep(contents, "SACREDGREEK", resultG);
  contents = util.absRep(contents, "SACREDLATIN", resultL);

  makeTreasures(response, type, err, contents, data);
}

// Makes the table of treasures.
function makeTreasures(response, type, err, contents, data)
{
  var result = "";
  var table = util.getTable();
  var columns = ["Author", "Title", "Year",
                 "In the <a href=\"library.html\">Library</a>", "Notes"];
  var row = [];
  var author = "", title = "", year = "", inLib = "", notes = "";

  table.setHTMLClass("conq");
  table.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    if(isTreasure(data[i]))
    {
      author = util.deNullify(data[i].fullTitle);
      title = "<em>"+data[i].title+"</em>";
      year = data[i].yearPublished;
      inLib = util.digitToYesNo(data[i].inLibrary);
      notes = util.deNullify(data[i].notes, ".");

      row = [author, title, year, inLib, notes];
      table.addRow(row);
    }
  }

  result = table.buildHTMLPrintout();
  contents = util.absRep(contents, "TREASURES", result);

  makeOthers(response, type, err, contents, data);
}

// Makes the table of other important books.
function makeOthers(response, type, err, contents, data)
{
  var result = "";
  var table = util.getTable();
  var columns = ["Author", "Title", "Year",
                 "In the <a href=\"library.html\">Library</a>", "Notes"];
  var row = [];
  var author = "", title = "", year = "", inLib = "", notes = "";

  table.setHTMLClass("conq");
  table.setColumns(columns);
  for(var i = 0; i < data.length; i++)
  {
    if(isOther(data[i]))
    {
      author = util.deNullify(data[i].fullTitle);
      title = "<em>"+data[i].title+"</em>";
      year = data[i].yearPublished;
      inLib = util.digitToYesNo(data[i].inLibrary);
      notes = util.deNullify(data[i].notes, ".");

      row = [author, title, year, inLib, notes];
      table.addRow(row);
    }
  }

  result = table.buildHTMLPrintout();
  contents = util.absRep(contents, "OTHERWORKS", result);

  final.wrapup(response, type, err, contents);
}
