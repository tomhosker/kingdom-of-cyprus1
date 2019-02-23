/*
This code is responsible for building the "LIBRARY" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("canons.db");

// Local constants.
var goldenAgeStart = 1485;
var goldenAgeEnd = 1899;
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

// Determines if a book falls into the "Parnassian" category.
function isParnassian(data, i)
{
  if((data[i].dob >= goldenAgeStart) &&
     (data[i].dob <= goldenAgeEnd) &&
     (data[i].genre === "poetry"))
  {
    return(true);
  }
  else return(false);
}

// Determines if a book falls into the "Anthology" category.
function isAnthology(data, i)
{
  if((data[i].author === null) &&
     (data[i].genre === "poetry"))
  {
    return(true);
  }
  else return(false);
}

// Determines if a book falls into the "Other" category.
function isOther(data, i)
{
  if(data[i].genre === "poetry-related") return(true);
  else if((data[i].genre === "poetry"))
  else return(false);
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
  makePoets(response, type, err, contents, data);
}

// Makes the table of works by Golden Age poets.
function makePoets(response, type, err, contents, data)
{
  var poets = "", row = "", inCat = "", title = "", notes = "";
  var tableHeader = "<table class=\"conq\"> <tr> <th>Poet</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th> On the <a href=\"catalogue.html\">"+
                    "Catalogue</a></th> <th>Notes</th> </tr> ";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].inCatalogue === trueInt) inCat = "yes";
    else inCat = "no";
    if(data[i].link === null) title = data[i].title;
    else
    {
      title = "<a href=\""+data[i].link+"\">"+data[i].title+"</a>";
    }
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(isParnassian(data, i))
    {
      row = "<tr> <td>"+data[i].fullTitle+"</td> "+
            "<td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+inCat+"</td> <td>"+notes+"</td> </tr>";
      poets = poets+row;
    }
  }
  poets = tableHeader+poets+" </table>";

  contents = absRep(contents, "POETS", poets);
  makeAnthologies(response, type, err, contents, data);
}

// Makes the table of anthologies.
function makeAnthologies(response, type, err, contents, data)
{
  var anth = "", row = ""; inCat = "", title = "", notes = "";
  var tableHeader = "<table class=\"conq\"> <tr>\n"+
                    "<th>Title</th> <th>Year</th> <th> On the "+
                    "<a href=\"catalogue.html\">"+
                    "Catalogue</a></th> <th>Notes</th> </tr>\n";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].inCatalogue === trueInt) inCat = "yes";
    else inCat = "no";
    if(data[i].link === null) title = data[i].title;
    else
    {
      title = "<a href=\""+data[i].link+"\">"+data[i].title+"</a>";
    }
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(isAnthology(data, i))
    {
      row = "<tr> <td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+inCat+"</td> <td>"+notes+"</td> </tr>";
      anth = anth+row;
    }
  }
  anth = tableHeader+anth+" </table>";

  contents = absRep(contents, "ANTHOLOGIES", anth);

  makeOthers(response, type, err, contents, data);
}

// Makes the table of other books.
function makeOthers(response, type, err, contents, data)
{
  var others = "", row = "", title = "", author = "";
  var tableHeader = "<table class=\"conq\"> <tr> <th>Author</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th>Notes</th> </tr> ";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].link === null) title = data[i].title;
    else
    {
      title = "<a href=\""+data[i].link+"\">"+data[i].title+"</a>";
    }
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(isOther(data, i))
    {
      row = "<tr> <td>"+data[i].fullTitle+"</td> "+
            "<td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+notes+"</td> </tr>";
      others = others+row;
    }
  }
  others = tableHeader+others+" </table>";

  contents = absRep(contents, "OTHERWORKS", others);

  final.wrapup(response, type, err, contents);
}
