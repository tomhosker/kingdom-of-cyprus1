/*
This code is responsible for building the "CATALOGUE" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("canons.db");

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

// Ronseal.
function arrayBuffertoString(buffer)
{
  return(String.fromCharCode.apply(null,
                                   new Uint16Array(buffer)));
}

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

// Determines if a book is a "treasure".
function isTreasure(data, i)
{
  if(data[i].yearPublished < queenVicAccession) return(true);
  else return(false);
}

// Determines if a book is written in Hebrew.
function isHebrew(data, i)
{
  if(isTreasure(data, i) === true) return(false);
  else if(data[i].genre === "hebrew") return(true);
  else return(false);
}

// Determines if a book is written in Greek.
function isGreek(data, i)
{
  if(isTreasure(data, i) === true) return(false);
  else if(data[i].genre === "greek") return(true);
  else return(false);
}

// Determines if a book is written in Latin.
function isLatin(data, i)
{
  if(isTreasure(data, i) === true) return(false);
  else if(data[i].genre === "latin") return(true);
  else return(false);
}

// Determines if a book is written in a sacred language.
function isSacred(data, i)
{
  if(isTreasure(data, i) === true) return(false);
  else if(isHebrew(data, i) === true) return(true);
  else if(isGreek(data, i) === true) return(true);
  else if(isLatin(data, i) === true) return(true);
  else return(false);
}

// Determines if a book falls into the "Parnassian" category.
function isParnassian(data, i)
{
  if(isTreasure(data, i) === true) return(false);
  else if((data[i].dob >= goldenAgeStart) &&
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
  if(isTreasure(data, i) === true) return(false);
  else if((data[i].surname === null) &&
          (data[i].genre === "poetry") &&
          (data[i].yearPublished <= goldenAgeEndBook))
  {
    return(true);
  }
  else return(false);
}

// Determines whether a book doesn't fit any of the above categories.
function isOther(data, i)
{
  if((isSacred(data, i) === false) &&
     (isParnassian(data, i) === false) &&
     (isAnthology(data, i) === false) &&
     (isTreasure(data, i) === false))
  {
    return(true);
  }
  else return(false);
}

/*
##############################
#         FIRST PASS         #
# Data from "PaperBook", etc #
##############################
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
    begin(response, type, err, contents, data);
  }
}

// Begin processing the page's content by turning "content"
// into a string "contents".
function begin(response, type, err, contents, data)
{
  makePoets(response, type, err, contents, data);
}

// Makes the table of works by Golden Age poets.
function makePoets(response, type, err, contents, data)
{
  var poets = "", row = "", inLib = "", title = "", notes = "";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].inLibrary === trueInt) inLib = "yes";
    else inLib = "no";
    title = data[i].title;
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(isParnassian(data, i))
    {
      row = "";
      row = "<td>"+data[i].fullTitle+"</td> "+
            "<td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+inLib+"</td> <td>"+notes+"</td> ";
      row = "<tr> "+row+" </tr>\n";
      poets = poets+row;
    }
  }
  poets = "<table class=\"conq\"> <tr>\n<th>Poet</th> "+
          "<th>Title</th> <th>Year</th> "+
          "<th> In the <a href=\"library.html\">"+
          "Library</a></th> <th>Notes</th> </tr>\n"+poets+
          " </table>";

  contents = absRep(contents, "POETS", poets);
  makeAnthology(response, type, err, contents, data);
}

// Makes the table of works by Golden Age poets.
function makeAnthology(response, type, err, contents, data)
{
  var anth = "", row = "", inLib = "", title = "", notes = "";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].inLibrary === trueInt) inLib = "yes";
    else inLib = "no";
    title = data[i].title;
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(isAnthology(data, i))
    {
      row = "";
      row = "<td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+inLib+"</td> <td>"+notes+"</td> ";
      row = "<tr> "+row+" </tr>\n";
      anth = anth+row;
    }
  }
  anth = "<table class=\"conq\"> <tr> "+
         "<th>Title</th> <th>Year</th> "+
         "<th> In the <a href=\"library.html\">"+
         "Library</a></th> <th>Notes</th> </tr>\n"+
         anth+" </table>";

  contents = absRep(contents, "ANTHOLOGIES", anth);
  makeSacred(response, type, err, contents, data);
}

// Makes the table of works in sacred languages.
function makeSacred(response, type, err, contents, data)
{
  var header = "<table class=\"conq\"> <tr> <th>Poet</th> "+
               "<th>Title</th> <th>Year</th> "+
               "<th> In the <a href=\"theology.html\">"+
               "Library</a></th> <th>Notes</th> </tr>\n";
  var hebrew = ""; var greek = ""; var latin = "";
  var row = ""; var inLib = ""; var poet = "";
  var title = ""; var notes = "";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].inLibrary === trueInt) inLib = "yes";
    else inLib = "no";
    title = data[i].title;
    if(data[i].author === null) poet = "N/A";
    else poet = data[i].fullTitle;
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    row = "";
    row = "<td>"+poet+"</td> <td><em>"+title+"</em></td> "+
          "<td>"+data[i].yearPublished+"</td> "+
          "<td>"+inLib+"</td> <td>"+notes+"</td> ";
    row = "<tr> "+row+" </tr>\n";

    if(isHebrew(data, i)) hebrew = hebrew+row;
    else if(isGreek(data, i)) greek = greek+row;
    else if(isLatin(data, i)) latin = latin+row;
  }
  if(hebrew === "") hebrew = "<p> <em>None as yet.</em> </p>";
  else hebrew = header+hebrew+" </table>";
  if(greek === "") greek = "<p> <em>None as yet.</em> </p>";
  else greek = header+greek+" </table>";
  if(latin === "") latin = "<p> <em>None as yet.</em> </p>";
  else latin = header+latin+" </table>";

  contents = absRep(contents, "SACREDHEBREW", hebrew);
  contents = absRep(contents, "SACREDGREEK", greek);
  contents = absRep(contents, "SACREDLATIN", latin);
  makeTreasures(response, type, err, contents, data);
}

// Makes the table of treasures.
function makeTreasures(response, type, err, contents, data)
{
  var treasures = "", row = "", inLib = "", title = "", notes = "";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].inLibrary === trueInt) inLib = "yes";
    else inLib = "no";
    title = data[i].title;
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(isTreasure(data, i))
    {
      row = "";
      row = "<td>"+data[i].fullTitle+"</td> "+
            "<td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+inLib+"</td> <td>"+notes+"</td> ";
      row = "<tr> "+row+" </tr>\n";
      treasures = treasures+row;
    }
  }
  treasures = "<table class=\"conq\"> <tr>\n<th>Author</th> "+
              "<th>Title</th> <th>Year</th> "+
              "<th> In the <a href=\"library.html\">"+
              "Library</a></th> <th>Notes</th> </tr>\n"+
              treasures+" </table>";

  contents = absRep(contents, "TREASURES", treasures);
  makeOthers(response, type, err, contents, data);
}

// Makes the table of other important books.
function makeOthers(response, type, err, contents, data)
{
  var others = "", row = "", inLib = "", title = "", notes = "";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].inLibrary === trueInt) inLib = "yes";
    else inLib = "no";
    title = data[i].title;
    if(data[i].notes === null) notes = "None.";
    else notes = data[i].notes;

    if(isOther(data, i) === true)
    {
      row = "";
      row = "<td>"+data[i].fullTitle+"</td> "+
            "<td><em>"+title+"</em></td> "+
            "<td>"+data[i].yearPublished+"</td> "+
            "<td>"+inLib+"</td> <td>"+notes+"</td> ";
      row = "<tr> "+row+" </tr>\n";
      others = others+row;
    }
  }
  if(others === "") others = "<p> <em>None as yet</em> </p>";
  else
  {
    others = "<table class=\"conq\"> <tr> <th>Poet</th> "+
             "<th>Title</th> <th>Year</th> "+
             "<th> On the <a href=\"library.html\">"+
             "Library</a></th> <th>Notes</th> </tr> "+
             others+" </table>\n";
  }

  contents = absRep(contents, "OTHERWORKS", others);
  final.wrapup(response, type, err, contents);
}
