/*
This code is responsible for building the "THEOLOGY" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("canons.db");

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
    begin(response, type, err, contents, data);
  }
}

// Ronseal.
function begin(response, type, err, contents, data)
{
  makeSacred(response, type, err, contents, data);
}

// Makes the table of works in the sacred languages.
function makeSacred(response, type, err, contents, data)
{
  var row = "", author = "", inCat = "", title = "", notes = "";
  var hebrew = "", greek = "", latin = "", trans = "";
  var tableHeader = "<table class=\"conq\">\n<tr> <th>Poet</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th> On the <a href=\"catalogue.html\">"+
                    "Catalogue</a></th> <th>Notes</th> </tr>\n";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].author === null) author = "N/A";
    else author = data[i].fullTitle;
    if(data[i].link === null) title = data[i].title;
    else
    {
      title = "<a href=\""+data[i].link+"\">"+data[i].title+"</a>";
    }
    if(data[i].inCatalogue === trueInt) inCat = "yes";
    else inCat = "no";
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    row = "<tr> <td>"+author+"</td> <td><em>"+title+"</em></td> "+
          "<td>"+data[i].yearPublished+"</td> <td>"+inCat+"</td> "+
          "<td>"+notes+"</td> </tr>\n";
    if(data[i].genre === "hebrew") hebrew = hebrew+row;
    else if(data[i].genre === "greek") greek = greek+row;
    else if(data[i].genre === "latin") latin = latin+row;
    else if(data[i].genre === "trans") trans = trans+row;
  }
  if(hebrew === "") hebrew = "<p> <em>None as yet.</em> </p>";
  else hebrew = tableHeader+hebrew+" </table>";
  if(greek === "") greek = "<p> <em>None as yet.</em> </p>";
  else greek = tableHeader+greek+" </table>";
  if(latin === "") latin = "<p> <em>None as yet.</em> </p>";
  else latin = tableHeader+latin+" </table>";
  if(trans === "") trans = "<p> <em>None as yet.</em> </p>";
  else trans = tableHeader+trans+" </table>";

  contents = absRep(contents, "HEBREWWORKS", hebrew);
  contents = absRep(contents, "GREEKWORKS", greek);
  contents = absRep(contents, "LATINWORKS", latin);
  contents = absRep(contents, "TRANSLATIONS", trans);
  makeOthers(response, type, err, contents, data);
}


// Makes the table of other books.
function makeOthers(response, type, err, contents, data)
{
  var others = "", row = "", title = "", author = "", notes = "";
  var tableHeader = "<table class=\"conq\">\n<tr> <th>Author</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th>Notes</th> </tr>\n";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].author === null) author = "N/A";
    else author = data[i].fullTitle;
    if(data[i].link === null) title = data[i].title;
    else
    {
      title = "<a href=\""+data[i].link+"\">"+data[i].title+"</a>";
    }
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(data[i].genre === "theology")
    {
      row = "<tr> <td>"+author+"</td> "+
            "<td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+notes+"</td> </tr>\n";
      others = others+row;
    }
  }
  if(others === "") others = "<p> <em>None as yet.</em> </p>";
  else others = tableHeader+others+" </table>";

  contents = absRep(contents, "OTHERWORKS", others);

  final.wrapup(response, type, err, contents);
}
