/*
This code is responsible for building the various "Person" pages.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3"), db = new sql.Database("cyprus.db");
var cutil = require("./cutil.js"), util = cutil.getClass();

// Local constants.
var male = 1;
var female = 0;
var maleRanks = ["None (dead)", "Villein", "Ploughman", "Journeyman",
                 "Foreman", "Master Craftsman", "Bailiff",
                 "Grand Master Craftsman", "Goodman", "Husbandman",
                 "Yeoman", "Vice-Master", "Master", "Knight", "Baron",
                 "Viscount", "Earl", "Marquess", "Duke", "Prince", "King"];
var femaleRanks = ["None (dead)", "Villeiness", "Ploughman's Wife",
                   "Journeyman's Wife", "Foreman's Wife",
                   "Master Craftsman's Wife", "Bailiff's Wife",
                   "Grand Master Craftsman's Wife", "Goodman's Wife",
                   "Housekeeper", "Yeoman's Wife", "Vice-Mistress",
                   "Mistress", "Knight's Wife", "Baroness", "Viscountess",
                   "Countess", "Marchioness", "Duchess", "Princess",
                   "Queen"];

// This stuff connects this file to server.js.
module.exports = {
  bridge: function(request, response, type, err, content)
  {
    fetch(request, response, type, err, content);
  }
};

/*
#########
# START #
#########
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var url = request.url.toLowerCase();
  var a = url.indexOf("a")+1;
  var b = url.indexOf("b");
  var id = 0;
  var query = "SELECT * FROM Person WHERE id = ?;";

  if((a > 0) && (b > 0))
  {
    id = url.substr(a, b-a);
    id = parseInt(id);
  }
  else return(fail(response, constants.NotFound, "No ID."));

  db.all(query, [id], ready);

  function ready(err, data)
  {
    if(err) throw err;
    if(data.length < 1)
    {
      return(final.fail(response, constants.NotFound, "No such page."));
    }
    begin(response, type, err, contents, data, id);
  }
}

// Ronseal.
function begin(response, type, err, contents, data, id)
{
  id = data[0].id;
  makeSimples(response, type, err, contents, data, id);
}

// Makes the variables on the "Person" table itself.
function makeSimples(response, type, err, contents, data, id)
{
  var shortTitle = data[0].shortTitle;
  var shortishTitle = "", style = "", otherNames = "";
  var surname = data[0].surname;
  var forename = data[0].forename;
  var rank = 0
  var addressedAs = "", profilePicture = "", bio = "";
  var cyprianLegalName = data[0].cyprianLegalName;
  var otherTitles = "", arms = "", otherData = "";

  if(data[0].shortishTitle === null) shortishTitle = shortTitle;
  else shortishTitle = data[0].shortishTitle;

  if(data[0].style === null) style = "";
  else style = data[0].style;

  if(data[0].otherNames === null) otherNames = "<em>None</em>";
  else otherNames = data[0].otherNames;

  if(data[0].gender === male) rank = maleRanks[data[0].rankTier];
  else rank = femaleRanks[data[0].rankTier];

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
           "alt=\"Profile Photo\" "+
           "align=\"center\" "+
           "width=\""+constants.standardProfilePhotoWidth+"\" "+
           "style=\"margin: 1em\"/>";
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

  contents = util.absRep(contents, "SHORTTITLE", shortTitle);
  contents = util.absRep(contents, "SHORTISHTITLE", shortishTitle);
  contents = util.absRep(contents, "STYLE", style);
  contents = util.absRep(contents, "OTHERNAMES", otherNames);
  contents = util.absRep(contents, "SURNAME", surname);
  contents = util.absRep(contents, "FORENAME", forename);
  contents = util.absRep(contents, "RANK", rank);
  contents = util.absRep(contents, "ADDRESSEDAS", addressedAs);
  contents = util.absRep(contents, "PROFILEPICTURE", profilePicture);
  contents = util.absRep(contents, "BIOGRAPHY", bio);
  contents = util.absRep(contents, "CYPRIANLEGALNAME", cyprianLegalName);
  contents = util.absRep(contents, "OTHERTITLES", otherTitles);
  contents = util.absRep(contents, "ARMS", arms);
  contents = util.absRep(contents, "OTHERDATA", otherData);

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
  var query = "SELECT Accolade.name, "+
                     "Chivalric.name AS chivalric, "+
                     "Chivalric.id AS chivkey "+
              "FROM Holds "+
              "JOIN Accolade ON Accolade.id = Holds.accolade "+
              "JOIN Chivalric ON Accolade.chivalric = Chivalric.id "+
              "WHERE Holds.person = ? "+
              "ORDER BY Accolade.tier;";

  db.all(query, [id], ready);

  function ready(err, holds)
  {
    if(err) throw err;
    makeAccolades(response, type, err, contents, id, holds);
  }
}

// Makes the person's list of accolades.
function makeAccolades(response, type, err, contents, id, holds)
{
  var acc = new Accolades(holds);
  var accoladesString = acc.htmlPrintout;

  accoladesString = "<h4> Accolades </h4>\n<p> "+accoladesString+" </p>";
  contents = util.absRep(contents, "ACCOLADES", accoladesString);

  final.wrapup(response, type, err, contents);
}

// This class holds a person's accolades.
class Accolades
{
  constructor(holds)
  {
    this.holds = holds;
    this.accolades = this.buildAccolades();
    this.orders = this.buildOrders();
    this.chivkeys = this.buildChivkeys();
    this.htmlPrintout = this.buildHTMLPrintout();
  }

  buildAccolades()
  {
    var accolades = [];

    for(var i = 0; i < this.holds.length; i++)
    {
      accolades.push(this.holds[i].name);
    }

    return(accolades);
  }

  buildOrders()
  {
    var chivalrics = util.getCSet();

    for(var i = 0; i < this.holds.length; i++)
    {
      chivalrics.add(this.holds[i].chivalric);
    }

    return(chivalrics);
  }

  buildChivkeys()
  {
    var keys = util.getCSet();

    for(var i = 0; i < this.holds.length; i++)
    {
      keys.add(this.holds[i].chivkey);
    }

    return(keys);
  }

  buildHTMLPrintout()
  {
    var result = "", plainString = "", linkString = "";

    for(var i = 0; i < this.accolades.length-1; i++)
    {
      result = result+this.accolades[i]+", ";
    }
    result = result+this.accolades[this.accolades.length-1];

    for(var i = 0; i < this.orders.getLength(); i++)
    {
      plainString = this.orders.get(i);
      linkString = "<a href=\"chivalrica"+this.chivkeys.get(i)+"b.html\">"+
                   plainString+"</a>";
      result = result.replace(plainString, linkString);
    }

    return(result);
  }
}
