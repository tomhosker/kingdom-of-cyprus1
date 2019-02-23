/*
This code is responsible for building the "CINEMA" page.
*/

// Imports.
var constants = require("./constants.js");
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

// "Absolute Replace" replaces a given substring.
function absRep(bigstring, lilstring, rep)
{
  var count = 0;
  while((bigstring.indexOf(lilstring) >= 0) &&
        (count < constants.maxloops))
  {
    bigstring = bigstring.replace(lilstring, rep);
    count++;
  }
  return(bigstring);
}

// Determines if a film is in Book I.
function isBookI(data, i)
{
  if((data[i].genre === "tragedy") &&
     (data[i].topTen === null) &&
     (data[i].rank > partLength) &&
     (data[i].rank < (bookiLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book II.
function isBookII(data, i)
{
  if((data[i].genre === "comedy") &&
     (data[i].topTen === null) &&
     (data[i].rank > partLength) &&
     (data[i].rank < (bookiiLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book III.
function isBookIII(data, i)
{
  if((data[i].genre === "satire") &&
     (data[i].topTen === null) &&
     (data[i].rank > partLength) &&
     (data[i].rank < (bookiiiLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book IV.
function isBookIV(data, i)
{
  if((data[i].genre === "other") &&
     (data[i].topTen === null) &&
     (data[i].rank > partLength) &&
     (data[i].rank < (bookivLength+partLength)))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 1.
function isVPart1(data, i)
{
  if((data[i].genre === "tragedy") &&
     (data[i].topTen === null) &&
     (data[i].rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 2.
function isVPart2(data, i)
{
  if((data[i].genre === "comedy") &&
     (data[i].topTen === null) &&
     (data[i].rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 3.
function isVPart3(data, i)
{
  if((data[i].genre === "satire") &&
     (data[i].topTen === null) &&
     (data[i].rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 4.
function isVPart4(data, i)
{
  if((data[i].genre === "other") &&
     (data[i].topTen === null) &&
     (data[i].rank <= partLength))
  {
    return(true);
  }
  else return(false);
}

// Determines if a film is in Book V Part 5.
function isVPart5(data, i)
{
  if(data[i].topTen === null) return(false);
  else return(true);
}

// Calculates the film's number in the canon.
function getOrdinal(data, i)
{
  var start = 0;

  if(isVPart5(data, i))
  {
    start = canonLength+1;
    n = start-data[i].topTen;
  }
  else if(isVPart4(data, i))
  {
    start = cannonLength-partLength+1;
    n = start-data[i].rank;
  }
  else if(isVPart3(data, i))
  {
    start = cannonLength-(2*partLength)+1;
    n = start-data[i].rank;
  }
  else if(isVPart2(data, i))
  {
    start = cannonLength-(3*partLength)+1;
    n = start-data[i].rank;
  }
  else if(isVPart1(data, i))
  {
    start = cannonLength-(4*partLength)+1;
    n = start-data[i].rank;
  }
  else if(isBookIV(data, i))
  {
    start = bookiLength+bookiiLength+bookiiiLength+
            bookivLength+1;
    n = start-data[i].rank;
  }
  else if(isBookIII(data, i))
  {
    start = bookiLength+bookiiLength+bookiiiLength+1;
    n = start-data[i].rank;
  }
  else if(isBookII(data, i))
  {
    start = bookiLength+bookiiLength+1;
    n = start-data[i].rank;
  }
  else if(isBookI(data, i))
  {
    start = bookiLength+1;
    n = start-data[i].rank;
  }
  else n = 0;

  return(n);
}

// Ronseal.
function makeRow(data, i, n)
{
  var row = "";
  var ordinal = "<td>"+n+"</td>";
  var title = "";
  var year = "<td>"+data[i].year+"</td>";
  var notes = "";

  if(data[i].link === null)
  {
    title = "<td><em>"+data[i].title+"</em></td>";
  }
  else
  {
    title = "<td><em><a href=\""+link+"\">"+
            data[i].title+"</a></em></td>";
  }

  if(data[i].notes === null) notes = "<em>None.</em>";
  else notes = data[i].notes;
  notes = "<td>"+notes+"</td>";

  row = "<tr> "+ordinal+" "+title+" "+year+" "+notes+" </tr>";
  return(row);
}

/*
####################
#    FIRST PASS    #
# Data from "Film" #
####################
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM FILM "+
              "ORDER BY topTen DESC, rank DESC;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    begin(response, type, err, contents, data);
  }
}

// Ronseal.
function begin(response, type, err, contents, data)
{
  makeCinema(response, type, err, contents, data);
}

// Makes the table of works by Golden Age poets.
function makeCinema(response, type, err, contents, data)
{
  var booki = ""; var bookii = ""; var bookiii = "";
  var bookiv = ""; var vPart1 = ""; var vPart2 = "";
  var vPart3 = ""; var vPart4 = ""; var vPart5 = "";
  var tableHeader = "<table class=\"conq\"> <tr> <th>No</th> "+
                    "<th>Title</th> <th>Year</th> <th>Notes</th> "+
                    "</tr>";

  for(var i = 0; i < data.length; i++)
  {
    n = getOrdinal(data, i);
    if(isVPart5(data, i)) vPart5 = vPart5+makeRow(data, i, n);
    else if(isVPart4(data, i)) vPart4 = vPart4+makeRow(data, i, n);
    else if(isVPart3(data, i)) vPart3 = vPart3+makeRow(data, i, n);
    else if(isVPart2(data, i)) vPart2 = vPart2+makeRow(data, i, n);
    else if(isVPart1(data, i)) vPart1 = vPart1+makeRow(data, i, n);
    else if(isBookIV(data, i)) bookiv = bookiv+makeRow(data, i, n);
    else if(isBookIII(data, i)) bookiii = bookiii+makeRow(data, i, n);
    else if(isBookII(data, i)) bookii = bookii+makeRow(data, i, n);
    else if(isBookI(data, i)) booki = booki+makeRow(data, i, n);
  }

  if(booki === "") booki = "<p> <em>None as yet.</em> </p>";
  else booki = tableHeader+booki+" </table>";
  if(bookii === "") bookii = "<p> <em>None as yet.</em> </p>";
  else bookii = tableHeader+bookii+" </table>";
  if(bookiii === "") bookiii = "<p> <em>None as yet.</em> </p>";
  else bookiii = tableHeader+bookiii+" </table>";
  if(bookiv === "") bookiv = "<p> <em>None as yet.</em> </p>";
  else bookiv = tableHeader+bookiv+" </table>";
  if(vPart1 === "") vPart1 = "<p> <em>None as yet.</em> </p>";
  else vPart1 = tableHeader+vPart1+" </table>";
  if(vPart2 === "") vPart2 = "<p> <em>None as yet.</em> </p>";
  else vPart2 = tableHeader+vPart2+" </table>";
  if(vPart3 === "") vPart3 = "<p> <em>None as yet.</em> </p>";
  else vPart3 = tableHeader+vPart3+" </table>";
  if(vPart4 === "") vPart4 = "<p> <em>None as yet.</em> </p>";
  else vPart4 = tableHeader+vPart4+" </table>";
  if(vPart5 === "") vPart5 = "<p> <em>None as yet.</em> </p>";
  else vPart5 = tableHeader+vPart5+" </table>";

  contents = absRep(contents, "BOOKONE", booki);
  contents = absRep(contents, "BOOKTWO", bookii);
  contents = absRep(contents, "BOOKTHREE", bookiii);
  contents = absRep(contents, "BOOKFOUR", bookiv);
  contents = absRep(contents, "FIVEPARTONE", vPart1);
  contents = absRep(contents, "FIVEPARTTWO", vPart2);
  contents = absRep(contents, "FIVEPARTTHREE", vPart3);
  contents = absRep(contents, "FIVEPARTFOUR", vPart4);
  contents = absRep(contents, "FIVEPARTFIVE", vPart5);

  final.wrapup(response, type, err, contents);
}
