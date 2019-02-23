/*
This code is responsible for building the "CINEMA" page.
*/

// Imports.
var constants = require("./constants.js");
var final = require("./final.js");
var sql = require("sqlite3");
var db = new sql.Database("canons.db");

// Local constants.
var canonLength = 15;

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

// Ronseal.
function makeRow(data, i)
{
  var row = "";
  var ordinal = "";
  var title = "";
  var year = "<td>"+data[i].startYear+"---"+data[i].endYear+"</td>";
  var notes = "";

  ordinal = String(canonLength+1-data[i].rank);
  ordinal = "<td>"+ordinal+"</td>";

  if(data[i].link === null)
  {
    title = "<td><em>"+data[i].title+"</em></td>";
  }
  else
  {
    title = "<td><em><a href=\""+data[i].link+"\">"+data[i].title+
            "</a></em></td>";
  }

  if(data[i].notes === null) notes = "<em>None.</em>";
  else notes = data[i].notes;
  notes = "<td>"+notes+"</td>";

  row = "<tr> "+ordinal+" "+title+" "+year+" "+notes+" </tr>";
  return(row);
}

/*
########################
#      FIRST PASS      #
# Data from "TVSeries" #
########################
*/

// Fetches the required data from the database.
function fetch(request, response, type, err, contents)
{
  "use strict";
  var query = "SELECT * FROM TVSeries "+
              "ORDER BY rank DESC;";

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
  makeTelevision(response, type, err, contents, data);
}

// Makes the table of works by Golden Age poets.
function makeTelevision(response, type, err, contents, data)
{
  var tv = "";
  var tableHeader = "<table class=\"conq\"> <tr> <td>No</td>"+
                    "<td>Title</td> <td>Years</td> <td>Notes</td>"+
                    " </tr>";

  for(var i = 0; i < data.length; i++)
  {
    if(data[i].rank <= canonLength)
    {
      tv = tv+makeRow(data, i);
    }
  }
  tv = tableHeader+tv+" </table>";

  contents = absRep(contents, "THELIST", tv);

  final.wrapup(response, type, err, contents);
}
