/*
This file has its roots in a file written by Dr Ian Holyer, but has
been changed significantly by me since then.
*/

// Constants.
const PORT = process.env.PORT || 3000;
//var port = 8443;
var verbose = true;
var unauthorised = 401;
var password = "mellon";
var types, banned;

// Library modules.
var fs = require("fs");
var https = require("https");
var auth = require("basic-auth");

// Local modules.
var constants = require("./constants.js");
var final = require("./final.js");
var searching = require("./searching.js");
var person = require("./person.js");
var manor = require("./manor.js");
var barony = require("./barony.js");
var county = require("./county.js");
var duchy = require("./duchy.js");
var kingdom = require("./kingdom.js");
var library = require("./library.js");
var catalogue = require("./catalogue.js");
var cinema = require("./cinema.js");
var television = require("./television.js");
var theology = require("./theology.js");
var philosophy = require("./philosophy.js");

// This points to the key and certificate for https.
var options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt"),
};
start();

/* 
####################
# HELPER FUNCTIONS #
####################
*/

// Provides the various types of which a file can be.
function defineTypes()
{
  var types = {
    html : "application/xhtml+xml",
    css  : "text/css",
    js   : "application/javascript",
    mjs  : "application/javascript",
    png  : "image/png",
    gif  : "image/gif",
    jpeg : "image/jpeg",
    jpg  : "image/jpeg",
    svg  : "image/svg+xml",
    json : "application/json",
    pdf  : "application/pdf",
    txt  : "text/plain",
    ttf  : "application/x-font-ttf",
    woff : "application/font-woff",
    aac  : "audio/aac",
    mp3  : "audio/mpeg",
    mp4  : "video/mp4",
    webm : "video/webm",
    ico  : "image/x-icon",
    xhtml: undefined,
    htm  : undefined,
    rar  : undefined,
    doc  : undefined,
    docx : undefined
  }
  return(types);
}

// Check that the site folder and index page exist.
function checkSite()
{
  var path = "./public";
  var ok = fs.existsSync(path);
  if(ok) path = "./public/index.html";
  if(ok) ok = fs.existsSync(path);
  if(!ok) console.log("Can't find", path);
  return(ok);
}

// Determines whether a url is requesting a search.
function isSearch(url)
{
  if(url.indexOf("search?") >= 0) return(true)
  return(false);
}

// Determines whether a request uses the DB.
function usesDB(request)
{
  var url = request.url.toLowerCase();
  if(isSearch(url)) return(true);
  else if(url.endsWith(".svg")) return(false);
  else if(url.endsWith(".png")) return(false);
  else if(url.endsWith(".jpg")) return(false);
  else if(url.indexOf("persona1b.html") >= 0) return(false);
  else if(url.indexOf("kingdom") >= 0) return(true);
  else if(url.indexOf("person") >= 0) return(true);
  else if(url.indexOf("duchy") >= 0) return(true);
  else if(url.indexOf("county") >= 0) return(true);
  else if(url.indexOf("barony") >= 0) return(true);
  else if(url.indexOf("manor") >= 0) return(true);
  else if(url.indexOf("library") >= 0) return(true);
  else if(url.indexOf("catalogue") >= 0) return(true);
  else if(url.indexOf("cinema") >= 0) return(true);
  else if(url.indexOf("television") >= 0) return(true);
  else if(url.indexOf("theology") >= 0) return(true);
  else if(url.indexOf("philosophy") >= 0) return(true);
  return(false);
}

// Handles the event where the user, either deliberately or
// inadvertently, tries to get up to mischief with the URL.
function naughty()
{
  var message = "Bad URL.\n\n"+
                "See https://www.youtube.com/"+
                "watch?v=ugTwbS24ZAQ\n\n"+
                "When making use of the database, URLs may "+
                "only contain the following characters:\n"+
                "./+&#;-0123456789abcdefghijklmnopqrstuvwxyz"+
                "\n\n"+
                "(Upper case versions of the above will be "+
                "converted to lower case versions "+
                "automatically.)\n"+
                "Two hyphens together (\"--\") are also "+
                "forbidden.";
  return(message);
}

// Does the password protection stuff.
function authenticate(request, response)
{
  var credentials = request.headers["authorization"];

  if(credentials === undefined)
  {
    response.setHeader("WWW-Authenticate",
                       "Basic realm=\"The Sergalio\"");
    return(final.fail(response, unauthorised, "Access denied."))
  }
  else
  {
    response.setHeader("WWW-Authenticate",
                       "Basic realm=\"Secure Area\"");
    var credentialsD = credentials.split(" ");
    var credentialsDD = new Buffer.from(credentialsD[1],
                                        "base64");
    var credentialsTD = credentialsDD.toString();
    var credentialsQD = credentialsTD.split(':');
    var pw = credentialsQD[1];
    if(pw != password)
    {
      return(final.fail(response, unauthorised, "Access denied."))
    }
  }
  handle(request, response);
}

// Forbid any resources which shouldn't be delivered to the browser.
function isBanned(url)
{
  var b;
  for(var i = 0; i < banned.length; i++)
  {
    b = banned[i];
    if(url.startsWith(b)) return(true);
  }
  return(false);
}

// Find the content type to respond with, or undefined.
function findType(url)
{
  var dot = url.lastIndexOf(".");
  var extension = url.substring(dot+1);
  return(types[extension]);
}

// Checks if the user is getting up to mischief by putting
// weird stuff in the URL.
function isSafe(url)
{
  var wl = ['.', '/', '+', '&', '#', ';', '-',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
            'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
            'u', 'v', 'w', 'x', 'y', 'z'];

  if(isSearch(url))
  {
    var m = url.indexOf("=")+1;
    var n = url.length+1;
    url = url.substr(m, n);
  }

  for(var i = 0; i < url.length; i++)
  {
    var c = url.charAt(i);
    if(wl.includes(c) === false) return(false);
  }

  if(url.indexOf("--") >= 0) return(false);

  return(true);
}

// Ronseal.
function arrayBufferToString(buffer)
{
  return(String.fromCharCode.apply(null, new Uint16Array(buffer)));
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

// Ronseal.
function banUpperCase(root, folder)
{
  var folderBit = 1 << 14;
  var names = fs.readdirSync(root+folder);
  for(var i = 0; i < names.length; i++)
  {
    var name = names[i];
    var file = folder+"/"+name;
    if(name != name.toLowerCase())
    {
      if(verbose) console.log("Banned:", file);
      banned.push(file.toLowerCase());
    }
    var mode = fs.statSync(root+file).mode;
    if((mode & folderBit) === 0) continue;
    banUpperCase(root, file);
  }
}

/* 
#########
# START #
#########
*/

// Start the https service. Accept requests from localhost only,
// for security.
function start()
{
  if(!checkSite()) return;
  types = defineTypes();
  banned = [];
  banUpperCase("./public/", "");
  var service = https.createServer(options, authenticate);
service.listen(PORT, () => {
    console.log("Our app is running on port ${ PORT }");
});
/*
  service.listen(process.env.PORT);
  var address = "0.0.0.0";
  if(port != 80) address = address+":"+port+"/";
  console.log("Server running at", address);
*/
}

// Serve a request by delivering a file.
function handle(request, response)
{
  var url = request.url.toLowerCase(), file = "", type = "";

  if(url.endsWith("/")) url = url+"index.html";

  if(isSearch(url)) url = url+".html";

  if(isBanned(url))
  {
    return(final.fail(response, constants.NotFound, "URL has been banned"));
  }

  type = findType(url);
  file = "./public"+url;

  if(type == null)
  {
    return(final.fail(response, constants.BadType,
                      "File type unsupported"));
  }

  if(usesDB(request))
  {
    if(!isSafe(url))
    {
      return(final.fail(response, constants.NotFound, naughty()));
    }
    if(isSearch(url)) file = "./search.html";
    else if(url.indexOf("b.html") >= 0)
    {
      if(url.indexOf("barony") >= 0) file = "./barony.html";
      else if(url.indexOf("manor") >= 0) file = "./manor.html";
      else file = "."+url.substr(0, url.indexOf("a"))+".html";
    }
    else file = "."+url;
    fs.readFile(file, readyDB);
  }
  else if(url.indexOf(".html") >= 0) fs.readFile(file, readyHTML);
  else fs.readFile(file, ready);

  function ready(err, content)
  {
    deliver(response, type, err, content);
  }
  function readyHTML(err, content)
  {
    deliverHTML(response, type, err, content);
  }
  function readyDB(err, content)
  {
    fetch(request, response, type, err, content);
  }
}

// Deliver the file that has been read in to the browser.
function deliver(response, type, err, content)
{
  if(err) return final.fail(response, constants.NotFound,
                            "File not found");
  var typeHeader = { "Content-Type": type };
  response.writeHead(constants.OK, typeHeader);
  response.write(content);
  response.end();
}

// Delivers the HTML file that has been read in to the browser.
function deliverHTML(response, type, err, content)
{
  var contents = arrayBufferToString(content);
  final.wrapup(response, type, err, contents);
}

// Fetches the required data from the database.
function fetch(request, response, type, err, content)
{
  var url = request.url.toLowerCase();
  var contents = arrayBufferToString(content);

  if(isSearch(url))
  {
    searching.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("person") >= 0)
  {
    person.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("duchy") >= 0)
  {
    duchy.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("county") >= 0)
  {
    county.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("barony") >= 0)
  {
    barony.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("manor") >= 0)
  {
    manor.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("kingdom") >= 0)
  {
    kingdom.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("library") >= 0)
  {
    library.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("catalogue") >= 0)
  {
    catalogue.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("cinema") >= 0)
  {
    cinema.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("television") >= 0)
  {
    television.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("theology") >= 0)
  {
    theology.bridge(request, response, type, err, contents);
  }
  else if(url.indexOf("philosophy") >= 0)
  {
    philosophy.bridge(request, response, type, err, contents);
  }
  else fail(response, NotFound, "Bad database request.");
}
