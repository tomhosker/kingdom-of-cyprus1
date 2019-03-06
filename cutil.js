/*
This code is responsible for holding the "CUtil" CLASS.
*/

// Imports.
var constants = require("./constants.js");

// Local constants.
var maxloops = 1000;

// This stuff allows this class to be accessed elsewhere.
module.exports = {
  getClass: function()
  {
    return(new CUtil());
  }
};

// Holds the Cyprian utility functions.
class CUtil
{
  constructor()
  {
    this.anInteger = 0;
  }

  // "Absolute Replace" replaces a given substring.
  absRep(big, old, rep)
  {
    var count = 0;

    while((big.indexOf(old) >= 0) && (count < maxloops))
    {
      big = big.replace(old, rep);
      count++;
    }

    return(big);
  }
}
