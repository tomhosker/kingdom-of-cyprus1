/*
This code is responsible for building the "CINEMA" page.
*/

// Imports.
var constants = require("./constants.js");
var cutil = require("./cutil.js"), util = cutil.getClass();
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("canons.db");

// Local constants.
var partLength = 10;
var bookiLength = 30;
var bookiiLength = 30;
var bookiiiLength = 20;
var bookivLength = 20;
var canonLength = 150;

// This stuff connects this file to server.js.
module.exports = {
  bridge: function(request, response, type, err, content)
  {
    fetch(request, response, type, err, content);
  }
};

/* 
####################
# HELPER FUNCTIONS #
####################
*/

// Determines if a film is in Book I.
function isBookI(row)
{
  if((row.genre === "tragedy") && (row.topTen === null) &&
     (row.rank > partLength) && (row.rank < (bookiLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book II.
function isBookII(row)
{
  if((row.genre === "comedy") && (row.topTen === null) &&
     (row.rank > partLength) && (row.rank < (bookiiLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book III.
function isBookIII(row)
{
  if((row.genre === "satire") && (row.topTen === null) &&
     (row.rank > partLength) && (row.rank < (bookiiiLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book IV.
function isBookIV(row)
{
  if((row.genre === "other") && (row.topTen === null) &&
     (row.rank > partLength) && (row.rank < (bookivLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 1.
function isVPart1(row)
{
  if((row.genre === "tragedy") &&
     (row.topTen === null) &&
     (row.rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 2.
function isVPart2(row)
{
  if((row.genre === "comedy") &&
     (row.topTen === null) &&
     (row.rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 3.
function isVPart3(row)
{
  if((row.genre === "satire") &&
     (row.topTen === null) &&
     (row.rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 4.
function isVPart4(row)
{
  if((row.genre === "other") &&
     (row.topTen === null) &&
     (row.rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 5.
function isVPart5(row)
{
  if(row.topTen === null) return(false);
  else return(true);
}

// Calculates the film's number in the canon.
function getOrdinal(row)
{
  var start = 0;

  if(isVPart5(row))
  {
    start = canonLength+1;
    n = start-row.topTen;
  }
  else if(isVPart4(row))
  {
    start = cannonLength-partLength+1;
    n = start-row.rank;
  }
  else if(isVPart3(row))
  {
    start = cannonLength-(2*partLength)+1;
    n = start-row.rank;
  }
  else if(isVPart2(row))
  {
    start = cannonLength-(3*partLength)+1;
    n = start-row.rank;
  }
  else if(isVPart1(row))
  {
    start = cannonLength-(4*partLength)+1;
    n = start-row.rank;
  }
  else if(isBookIV(row))
  {
    start = bookiLength+bookiiLength+bookiiiLength+bookivLength+1;
    n = start-row.rank;
  }
  else if(isBookIII(row))
  {
    start = bookiLength+bookiiLength+bookiiiLength+1;
    n = start-row.rank;
  }
  else if(isBookII(row))
  {
    start = bookiLength+bookiiLength+1;
    n = start-row.rank;
  }
  else if(isBookI(row))
  {
    start = bookiLength+1;
    n = start-row.rank;
  }
  else n = 0;

  return(n);
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
  var query = "SELECT * FROM FILM ORDER BY topTen DESC, rank DESC;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeCinema(response, type, err, contents, data);
  }
}

// Makes the table of works by Golden Age poets.
function makeCinema(response, type, err, contents, data)
{
  var bookiString = "", bookiiString = "", bookiiiString = "",
      bookivString = "", vPart1String = "", vPart2String = "",
      vPart3String = "", vPart4String = "", vPart5String = "";
  var booki = util.getTable(), bookii = util.getTable(),
      bookiii = util.getTable(), bookiv = util.getTable(),
      vPart1 = util.getTable(), vPart2 = util.getTable(),
      vPart3 = util.getTable(), vPart4 = util.getTable(),
      vPart5 = util.getTable();
  var columns = ["No", "Title", "Year", "Notes"];
  var no = 0, year = 0;
  var title = "", notes = "";
  var row = [];

  booki.setHTMLClass("conq");
  booki.setColumns(columns);
  bookii.setHTMLClass("conq");
  bookii.setColumns(columns);
  bookiii.setHTMLClass("conq");
  bookiii.setColumns(columns);
  bookiv.setHTMLClass("conq");
  bookiv.setColumns(columns);
  vPart1.setHTMLClass("conq");
  vPart1.setColumns(columns);
  vPart2.setHTMLClass("conq");
  vPart2.setColumns(columns);
  vPart3.setHTMLClass("conq");
  vPart3.setColumns(columns);
  vPart4.setHTMLClass("conq");
  vPart4.setColumns(columns);
  vPart5.setHTMLClass("conq");
  vPart5.setColumns(columns);

  for(var i = 0; i < data.length; i++)
  {
    no = getOrdinal(data[i]);
    title = util.linkify(data[i].title, data[i].link);
    year = data[i].year;
    notes = util.deNullify(data[i].notes, ".");
    row = [no, title, year, notes];

    if(isVPart5(data[i])) vPart5.addRow(row);
    else if(isVPart4(data[i])) vPart4.addRow(row);
    else if(isVPart3(data[i])) vPart3.addRow(row);
    else if(isVPart2(data[i])) vPart2.addRow(row);
    else if(isVPart1(data[i])) vPart1.addRow(row);
    else if(isBookIV(data[i])) bookiv.addRow(row);
    else if(isBookIII(data[i])) bookiii.addRow(row);
    else if(isBookII(data[i])) bookii.addRow(row);
    else if(isBookI(data[i])) booki.addRow(row);
  }
  bookiString = booki.buildHTMLPrintout();
  bookiiString = bookii.buildHTMLPrintout();
  bookiiiString = bookiii.buildHTMLPrintout();
  bookivString = bookiv.buildHTMLPrintout();
  vPart1String = vPart1.buildHTMLPrintout();
  vPart2String = vPart2.buildHTMLPrintout();
  vPart3String = vPart3.buildHTMLPrintout();
  vPart4String = vPart4.buildHTMLPrintout();
  vPart5String = vPart5.buildHTMLPrintout();

  contents = util.absRep(contents, "BOOKONE", bookiString);
  contents = util.absRep(contents, "BOOKTWO", bookiiString);
  contents = util.absRep(contents, "BOOKTHREE", bookiiiString);
  contents = util.absRep(contents, "BOOKFOUR", bookivString);
  contents = util.absRep(contents, "FIVEPARTONE", vPart1String);
  contents = util.absRep(contents, "FIVEPARTTWO", vPart2String);
  contents = util.absRep(contents, "FIVEPARTTHREE", vPart3String);
  contents = util.absRep(contents, "FIVEPARTFOUR", vPart4String);
  contents = util.absRep(contents, "FIVEPARTFIVE", vPart5String);

  final.wrapup(response, type, err, contents);
}
