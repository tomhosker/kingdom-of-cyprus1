/*
This holds all the site's constants.
*/

// Constants.
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var maxloops = 1000;
var yearDiff = 5773, roshHashanahMonth = 6;
var lquote = "&#8216;", rquote = "&#8217;", emdash = "&#8212;";

// This exports the above.
module.exports = {
  OK: OK, NotFound: NotFound, BadType: BadType, Error: Error,
  maxloops: maxloops,
  yearDiff: yearDiff, roshHashanahMonth: roshHashanahMonth,
  lquote: lquote, rquote: rquote, emdash: emdash
};
