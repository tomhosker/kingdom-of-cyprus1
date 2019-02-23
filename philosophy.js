/*
This code is responsible for building the "PHILOSOPHY" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("canons.db");

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
              "ORDER BY surname, yearPublished;";

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
  makeLibrary(response, type, err, contents, data);
}

// Makes the table of works in the sacred languages.
function makeLibrary(response, type, err, contents, data)
{
  var row = "", author = "", title = "", notes = "", library = "";
  var tableHeader = "<table class=\"conq\"> <tr> <th>Author</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th>Notes</th> </tr> ";

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

    row = "<tr> <td>"+author+"</td> <td><em>"+title+"</em></td> "+
          "<td>"+data[i].yearPublished+"</td> "+
          "<td>"+notes+"</td> </tr>";
    if(data[i].genre === "philosophy") library = library+row;
  }
  library = tableHeader+library+" </table>";

  contents = absRep(contents, "LIBRARY", library);
  final.wrapup(response, type, err, contents);
}
