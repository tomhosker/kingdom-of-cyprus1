/*
This code is responsible for building the various "Stud" pages.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("cyprus.db");

// Local constants.
var male = 1;
var female = 0;

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

// "Conditional Replace" replaces a sub-string with (0) or (1).
function conRep(bigstring, lilstring, rep0, rep1)
{
  var count = 0;
  if(rep0 != null)
  {
    while((bigstring.indexOf(lilstring) >= 0) &&
          (count < constants.maxloops))
    {
      bigstring = bigstring.replace(lilstring, rep0);
      count++;
    }
  }
  else
  {
    while((bigstring.indexOf(lilstring) >= 0) &&
          (count < constants.maxloops))
    {
      bigstring = bigstring.replace(lilstring, rep1);
      count++;
    }
  }
  return(bigstring);
}

// Ronseal.
function rankConverter(rankTier, gender)
{
  if(gender === male)
  {
    if(rankTier === 1) return("Villein");
    else if(rankTier === 2) return("Ploughman");
    else if(rankTier === 3) return("Journeyman");
    else if(rankTier === 4) return("Foreman");
    else if(rankTier === 5) return("Master Craftsman");
    else if(rankTier === 6) return("Bailiff");
    else if(rankTier === 7) return("Grand Master Craftsman");
    else if(rankTier === 8) return("Goodman");
    else if(rankTier === 9) return("Husbandman");
    else if(rankTier === 10) return("Yeoman");
    else if(rankTier === 11) return("Vice-Master");
    else if(rankTier === 12) return("Master");
    else if(rankTier === 13) return("Knight");
    else if(rankTier === 14) return("Baron");
    else if(rankTier === 15) return("Viscount");
    else if(rankTier === 16) return("Earl");
    else if(rankTier === 17) return("Marquess");
    else if(rankTier === 18) return("Duke");
    else if(rankTier === 19) return("Prince");
    else if(rankTier === 20) return("King");
    else if(rankTier === 0) return("None (dead)");
    else return("<em>Invalid rank</em>");
  }
  else
  {
    if(rankTier === 1) return("Villeiness");
    else if(rankTier === 2) return("Ploughman's Wife");
    else if(rankTier === 4) return("Foreman's Wife");
    else if(rankTier === 6) return("Bailiff's Wife");
    else if(rankTier === 8) return("Goodman's Wife");
    else if(rankTier === 9) return("Housekeeper");
    else if(rankTier === 10) return("Yeoman's Wife");
    else if(rankTier === 11) return("Vice-Mistress");
    else if(rankTier === 12) return("Mistress");
    else if(rankTier === 13) return("Knight's Wife");
    else if(rankTier === 14) return("Baroness");
    else if(rankTier === 15) return("Viscountess");
    else if(rankTier === 16) return("Countess");
    else if(rankTier === 17) return("Marchioness");
    else if(rankTier === 18) return("Duchess");
    else if(rankTier === 19) return("Princess");
    else if(rankTier === 20) return("Queen");
    else if(rankTier === 0) return("None (dead)");
    else return("<em>Invalid rank</em>");
  }
}

// Ronseal.
function extractAccoladeName(id, accolade)
{
  for(var i = 0; i < accolade.length; i++)
  {
    if(accolade[i].id === id) return(accolade[i].name);
  }
  return("<em>Invalid accolade ID</em>");
}

/*
######################
#     FIRST PASS     #
# Data from "Person" #
######################
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var url = request.url.toLowerCase();

  var a = url.indexOf("a")+1;
  var b = url.indexOf("b");
  var id = 0;
  if((a > 0) && (b > 0))
  {
    id = url.substr(a, b-a);
    id = parseInt(id);
  }
  else return(fail(response, NotFound, "No such page."));

  var query = "SELECT * FROM Person WHERE id = "+id+";";
  db.all(query, ready);

  function ready(err, data)
  {
    if(err) throw err;
    if(data.length < 1)
    {
      return(final.fail(response, NotFound, "No such page."));
    }
    begin(response, type, err, contents, data, id);
  }
}

// Ronseal.
function begin(response, type, err, contents, data, id)
{
  makeSimples(response, type, err, contents, data, id);
}

// Makes the variables on the "Person" table itself.
function makeSimples(response, type, err, contents, data, id)
{
  var shortTitle = data[0].shortTitle;
  var shortishTitle = "";
  var style = "";
  var otherNames = "";
  var surname = data[0].surname;
  var forename = data[0].forename;
  var rank = rankConverter(data[0].rankTier, data[0].gender);
  var addressedAs = "";
  var profilePicture = "";
  var bio = "";
  var cyprianLegalName = data[0].cyprianLegalName;
  var otherTitles = "";
  var arms = "";
  var otherData = "";

  if(data[0].shortishTitle === null) shortishTitle = shortTitle;
  else shortishTitle = data[0].shortishTitle;
  if(data[0].style === null) style = "";
  else style = data[0].style;
  if(data[0].otherNames === null) otherNames = "<em>None</em>";
  else otherNames = data[0].otherNames;
  if(data[0].addressedAs === null)
  {
    if(data[0].gender === male) addressedAs = "Sir";
    else addressedAs = "Madam";
  }
  else addressedAs = data[0].addressedAs;
  if(data[0].profilePicture === null) profilePicture = "";
  else
  {
    profilePicture =
      "<img src=\"images/"+data[0].profilePicture+"\" "+
           "alt=\"Profile Photo\" align=\"center\" "+
           "width=\"350px\" style=\"margin: 1em\"/>";
  }
  if(data[0].bio === null)
  {
    bio = shortTitle+" is a "+rank+".";
  }
  else bio = data[0].bio;
  if(data[0].otherTitles === null) otherTitles = "<em>None.</em>";
  else otherTitles = data[0].otherTitles;
  if(data[0].arms === null) arms = "";
  else
  {
    arms =
      "<hbox> <img src=\"images/"+data[0].arms+"\" "+
                  "alt=\"Arms\" align=\"center\" width=\"700px\" "+
                  "style=\"margin: 1em\"/> </hbox>";

  }
  if(data[0].otherData === null) otherData = "<em>None.</em>";
  else otherData = data[0].otherData;

  contents = absRep(contents, "SHORTTITLE", shortTitle);
  contents = absRep(contents, "SHORTISHTITLE", shortishTitle);
  contents = absRep(contents, "STYLE", style);
  contents = absRep(contents, "OTHERNAMES", otherNames);
  contents = absRep(contents, "SURNAME", surname);
  contents = absRep(contents, "FORENAME", forename);
  contents = absRep(contents, "RANK", rank);
  contents = absRep(contents, "ADDRESSEDAS", addressedAs);
  contents = absRep(contents, "PROFILEPICTURE", profilePicture);
  contents = absRep(contents, "BIOGRAPHY", bio);
  contents = absRep(contents, "CYPRIANLEGALNAME",
                              cyprianLegalName);
  contents = absRep(contents, "OTHERTITLES", otherTitles);
  contents = absRep(contents, "ARMS", arms);
  contents = absRep(contents, "OTHERDATA", otherData);

  fetchHolds(response, type, err, contents, id);
}


/*
##########################
#      SECOND PASS       #
# Data from "Holds", etc #
##########################
*/

// Fetches the "Holds" table.
function fetchHolds(response, type, err, contents, id)
{
  var query = "SELECT * FROM Holds WHERE person = "+id+";";
  db.all(query, ready);

  function ready(err, holds)
  {
    if(err) throw err;
    fetchAccolade(response, type, err, contents, id, holds);
  }
}

// Fetches the "Accolade" table.
function fetchAccolade(response, type, err, contents, id, holds)
{
  var query = "SELECT * FROM Accolade;";
  db.all(query, ready);

  function ready(err, accolade)
  {
    if(err) throw err;
    makeAccolades(response, type, err, contents, id,
                  holds, accolade);
  }
}

// Makes the person's list of accolades.
function makeAccolades(response, type, err, contents, id,
                       holds, accolade)
{
  var acc = "";

  if(holds.length === 0) acc = "";
  else
  {
    for(var i = 0; i < holds.length; i++)
    {
      acc = acc+extractAccoladeName(holds[i].accolade, accolade)+
            ", ";
    }
  }

  if(acc === "") ;
  else
  {
    acc = acc.substr(0, acc.length-2);
    acc = "<h4> Accolades </h4> <p> "+acc+" </p>";
  }

  contents = absRep(contents, "ACCOLADES", acc);

  final.wrapup(response, type, err, contents);
}
