/*
This code is responsible for building the "LIBRARY" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("canons.db");

// Local constants.
var goldenAgeStart = 1485, goldenAgeEnd = 1899;
var trueInt = 1, falseInt = 0;

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
###########################
#       FIRST PASS        #
# Poets of the Golden Age #
###########################
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM Book "+
              "LEFT JOIN Author ON Author.code = Book.author "+
              "WHERE Book.genre = 'poetry' "+
              "AND Author.dob >= "+goldenAgeStart+" "+
              "AND Author.dob <= "+goldenAgeEnd+" "+
              "ORDER BY surname, yearPublished, title;";

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
  var tableHeader = "<table class=\"conq\">\n<tr> <th>Poet</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th> On the <a href=\"catalogue.html\">"+
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

    row = "<tr> <td>"+data[i].fullTitle+"</td> "+
          "<td><em>"+title+"</em></td> "+
          "<td>"+data[i].yearPublished+"</td> "+
          "<td>"+inCat+"</td> <td>"+notes+"</td> </tr>\n";
    poets = poets+row;
  }
  poets = tableHeader+poets+" </table>";

  contents = absRep(contents, "GOLDENPOETS", poets);
  fetchAnthologies(response, type, err, contents, data);
}

/*
###############
# SECOND PASS #
# Anthologies #
###############
*/

// Ronseal.
function fetchAnthologies(response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM Book "+
              "WHERE genre = 'poetry' "+
              "AND author IS NULL "+
              "ORDER BY yearPublished, title;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeAnthologies(response, type, err, contents, data);
  }
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

    row = "<tr> <td><em>"+title+"</em></td> "+
          "<td>"+data[i].yearPublished+"</td> "+
          "<td>"+inCat+"</td> <td>"+notes+"</td> </tr>";
    anth = anth+row;
  }
  anth = tableHeader+anth+" </table>";

  contents = absRep(contents, "ANTHOLOGIES", anth);

  fetchOtherPoets(response, type, err, contents);
}

/*
###############
# THIRD PASS  #
# Other Poets #
###############
*/

// Fetches the required data from the database.
function fetchOtherPoets(response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM Book "+
              "LEFT JOIN Author ON Author.code = Book.author "+
              "WHERE Book.genre = 'poetry' "+
              "AND (Author.dob < "+goldenAgeStart+" "+
                   "OR Author.dob > "+goldenAgeEnd+") "+
              "ORDER BY surname, yearPublished, title;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeOtherPoets(response, type, err, contents, data);
  }
}

// Makes the table of works by other poets.
function makeOtherPoets(response, type, err, contents, data)
{
  var poets = "", row = "", inCat = "", title = "", notes = "";
  var tableHeader = "<table class=\"conq\">\n<tr> <th>Poet</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th>Notes</th> </tr>\n";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].link === null) title = data[i].title;
    else
    {
      title = "<a href=\""+data[i].link+"\">"+data[i].title+"</a>";
    }
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    row = "<tr> <td>"+data[i].fullTitle+"</td> "+
          "<td><em>"+title+"</em></td> "+
          "<td>"+data[i].yearPublished+"</td> "+
          "<td>"+notes+"</td> </tr>\n";
    poets = poets+row;
  }
  poets = tableHeader+poets+" </table>";

  contents = absRep(contents, "OTHERPOETS", poets);
  fetchPoetryRelated(response, type, err, contents);
}

/*
###########################
#       FOURTH PASS       #
# Poetry-Related Material #
###########################
*/

// Fetches the required data from the database.
function fetchPoetryRelated(response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM Book "+
              "LEFT JOIN Author ON Author.code = Book.author "+
              "WHERE Book.genre = 'poetry-related' "+
              "ORDER BY surname, title;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    makeOthers(response, type, err, contents, data);
  }
}

// Makes the table of poetry-related books.
function makeOthers(response, type, err, contents, data)
{
  var others = "", row = "", title = "", author = "";
  var tableHeader = "<table class=\"conq\"> <tr> <th>Author</th> "+
                    "<th>Title</th> <th>Year</th> "+
                    "<th>Notes</th> </tr>\n";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].link === null) title = data[i].title;
    else
    {
      title = "<a href=\""+data[i].link+"\">"+data[i].title+"</a>";
    }
    if(data[i].author === null) author = "N/A";
    else author = data[i].fullTitle;
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    row = "<tr> <td>"+data[i].fullTitle+"</td> "+
          "<td><em>"+title+"</em></td> "+
          "<td>"+data[i].yearPublished+"</td> "+
          "<td>"+notes+"</td> </tr>\n";
    others = others+row;
  }
  others = tableHeader+others+" </table>";

  contents = absRep(contents, "POETRYRELATED", others);

  final.wrapup(response, type, err, contents);
}
