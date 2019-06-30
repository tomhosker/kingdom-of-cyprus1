/*
This code is responsible for building a search page.
*/

// Constants.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3"), db = new sql.Database("cyprus.db");
                              canons = new sql.Database("canons.db");
var cutil = require("./cutil.js"), util = cutil.getClass();

// This stuff connects this file to server.js.
module.exports = {
  bridge: function(request, response, type, err, content)
  {
    fetchPerson(request, response, type, err, content);
  }
};

/*
####################
# HELPER FUNCTIONS #
####################
*/

// Converts the url to the search string.
function urltoSS(url)
{
  var ss = url.substr(url.indexOf("=")+1, url.length);

  // HTML form replaces ' ' with '+'. Let's undo this.
  while(ss.indexOf("+") >= 0)
  {
    ss = ss.replace("+", " ");
  }

  return(ss);
}

// Ronseal.
function checkField(ss, field)
{
  if(typeof(field) === "number") field = field.toString();
  else if(typeof(field) !== "string") return(false);

  field = field.toLowerCase();

  if(field !== null)
  {
    if(field.indexOf(ss) >= 0) return(true);
  }
  return(false);
}

// Determines if a string appears on a row of a table.
function checkRow(ss, row)
{
  for(var key in row)
  {
    if(checkField(ss, row[key])) return(true);
  }
  return(false);
}

/*
######################
#     FIRST PASS     #
# Data from "Person" #
######################
*/

// Fetches the required data from the database.
function fetchPerson(request, response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM Person ORDER BY rankTier DESC;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    begin(request, response, type, err, contents, data);
  }
}

function begin(request, response, type, err, contents, data)
{
  var ss = urltoSS(request.url);
  var results = new Results();

  ss = ss.toLowerCase();

  addPerson(request, response, type, err, contents, ss, data, results);
}

// Continue processing by adding the Person pages to "results".
function addPerson(request, response, type, err, contents,
                   ss, data, results)
{
  var shortTitle = "";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      shortTitle = util.makeLinkedST(data[i].id, data[i].shortTitle,
                                     data[i].rankTier, data[i].style);
      results.add(shortTitle);
    }
  }

  fetchDuchy(request, response, type, err, contents, ss, results);
}

/*
#####################
#    SECOND PASS    #
# Data from "Duchy" #
#####################
*/

// Ronseal.
function fetchDuchy(request, response, type, err, contents, ss, results)
{
  "use strict";
  var query = "SELECT * FROM Duchy ORDER BY seniority;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addDuchy(request, response, type, err, contents, ss, results, data);
  }
}

// Continue processing by adding the Duchy pages to "results".
function addDuchy(request, response, type, err, contents,
                  ss, results, data)
{
  var name = "";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      name = "<a href=\"duchya"+data[i].id+"\">"+data[i].name+"</a>";
      results.add(name);
    }
  }

  fetchCounty(request, response, type, err, contents, ss, results);
}

/*
######################
#     THIRD PASS     #
# Data from "County" #
######################
*/

// Ronseal.
function fetchCounty(request, response, type, err, contents,
                     ss, results)
{
  "use strict";
  var query = "SELECT * FROM County ORDER BY seniority;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addCounty(request, response, type, err, contents, ss, results, data);
  }
}

// Continue processing by adding the County pages to "results".
function addCounty(request, response, type, err, contents,
                   ss, results, data)
{
  var name = "";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      name = "<a href=\"countya"+data[i].id+"\">"+data[i].name+"</a>";
      results.add(name);
    }
  }

  fetchBarony(request, response, type, err, contents, ss, results);
}

/*
######################
#    FOURTH PASS     #
# Data from "Barony" #
######################
*/

// Ronseal.
function fetchBarony(request, response, type, err, contents, ss, results)
{
  "use strict";
  var query = "SELECT * FROM Barony ORDER BY seniority;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addBarony(request, response, type, err, contents, ss, results, data);
  }
}

// Continue processing by adding the Barony pages to "results".
function addBarony(request, response, type, err, contents,
                   ss, results, data)
{
  var name = "";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      name = "<a href=\"baronya"+data[i].id+"\">"+data[i].name+"</a>";
      results.add(name);
    }
  }

  fetchManor(request, response, type, err, contents, ss, results);
}

/*
#####################
#    FIFTH PASS     #
# Data from "Manor" #
#####################
*/

// Ronseal.
function fetchManor(request, response, type, err, contents, ss, results)
{
  "use strict";
  var query = "SELECT * FROM Manor ORDER BY seniority;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addManor(request, response, type, err, contents, ss, results, data);
  }
}

// Continue processing by adding the County pages to "results".
function addManor(request, response, type, err, contents,
                  ss, results, data)
{
  var name = "";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      name = "<a href=\"manora"+data[i].id+"\">"+data[i].name+"</a>";
      results.add(name);
    }
  }

  fetchChivalric(request, response, type, err, contents, ss, results);
}

/*
#########################
#      SIXTH PASS       #
# Data from "Chivalric" #
#########################
*/

// Ronseal.
function fetchChivalric(request, response, type, err, contents,
                        ss, results)
{
  "use strict";
  var query = "SELECT * FROM Chivalric ORDER BY seniority;";

  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addChivalric(request, response, type, err, contents,
                 ss, results, data);
  }
}

// Continue processing by adding the County pages to "results".
function addChivalric(request, response, type, err, contents,
                      ss, results, data)
{
  var name = "";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      name = "<a href=\"chivalrica"+data[i].id+"\">"+data[i].name+"</a>";

      if(data[i].style !== null) name = data[i].style+" "+name;

      results.add(name);
    }
  }

  fetchPaperBook(request, response, type, err, contents, ss, results);
}

/*
#########################
#      SIXTH PASS       #
# Data from "PaperBook" #
#########################
*/

// Ronseal.
function fetchPaperBook(request, response, type, err, contents, ss, results)
{
  "use strict";
  var query = "SELECT PaperBook.title, PaperBook.notes, Author.fullTitle "+
              "FROM PaperBook "+
              "JOIN Author ON Author.code = PaperBook.author;";

  canons.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addPaperBook(request, response, type, err, contents,
                 ss, results, data);
  }
}

// Continue processing by adding the County pages to "results".
function addPaperBook(request, response, type, err, contents,
                      ss, results, data)
{
  var link = "<a href=\"catalogue.html\">Hosker's Catalogue</a>";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      results.add(link);
      break;
    }
  }

  fetchBook(request, response, type, err, contents, ss, results);
}

/*
####################
#   SEVENTH PASS   #
# Data from "Book" #
####################
*/

// Ronseal.
function fetchBook(request, response, type, err, contents, ss, results)
{
  "use strict";
  var query = "SELECT Book.title, Book.notes, Book.author, Book.genre, "+
                     "Author.fullTitle "+
              "FROM Book "+
              "JOIN Author ON Author.code = Book.author;";

  canons.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addBook(request, response, type, err, contents, ss, results, data);
  }
}

// Continue processing by adding the County pages to "results".
function addBook(request, response, type, err, contents, ss, results, data)
{
  var tLink = "<a href=\"theology.html\">Department of Theology</a>";
  var pLink = "<a href=\"philosophy.html\">Department of Philosophy</a>";
  var libLink = "<a href=\"library.html\">Hosker's Library</a>";
  var tFlag = 0, pFlag = 0, libFlag = 0;
  var theologyGenres = ["hebrew", "greek", "latin", "trans", "theology"];
  var philosophyGenres = ["philosophy"];
  var libraryGenres = ["poetry", "poetry-related"];

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      if(theologyGenres.includes(data[i].genre)) tFlag = 1;
      else if(philosophyGenres.includes(data[i].genre)) pFlag = 1;
      else if(libraryGenres.includes(data[i].genre)) libFlag = 1;
    }
  }

  if(tFlag === 1) results.add(tLink);
  if(pFlag === 1) results.add(pLink);
  if(libFlag === 1) results.add(libLink);

  fetchFilm(request, response, type, err, contents, ss, results);
}

/*
####################
#   EIGHTH PASS    #
# Data from "Film" #
####################
*/

// Ronseal.
function fetchFilm(request, response, type, err, contents, ss, results)
{
  "use strict";
  var query = "SELECT title FROM Film";

  canons.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    addFilm(request, response, type, err, contents, ss, results, data);
  }
}

// Continue processing by adding the County pages to "results".
function addFilm(request, response, type, err, contents, ss, results, data)
{
  var link = "<a href=\"cinema.html\">Hosker's Cinema</a>";

  for(var i = 0; i < data.length; i++)
  {
    if(checkRow(ss, data[i]))
    {
      results.add(link);
      break;
    }
  }

  finish(request, response, type, err, contents, ss, results);
}

// Ronseal.
function finish(request, response, type, err, contents, ss, results)
{
  var resultsString = results.buildHTMLPrintout();
  var originalQuery = urltoSS(request.url);

  contents = util.absRep(contents, "QUERY", originalQuery);
  contents = util.absRep(contents, "RESULTS", resultsString);

  final.wrapup(response, type, err, contents);
}

// Holds a search's results.
class Results
{
  constructor()
  {
    this.array = [];
    this.htmlPrintout = "";
  }

  static getNumeral(number)
  {
    number = number+1;
    return(number.toString());
  }

  add(result)
  {
    this.array.push(result);
  }

  buildHTMLPrintout()
  {
    var s = "", n = "";

    for(var i = 0; i < this.array.length; i++)
    {
      n = Results.getNumeral(i);
      s = s+"<p> "+n+". "+"<strong>"+this.array[i]+"</strong> </p>\n";
    }

    if(this.array.length === 0) s = "<p> Nothing found. </p>";

    this.htmlPrintout = s;

    return(s);
  }
}
