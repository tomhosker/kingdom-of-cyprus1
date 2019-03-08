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

  // Get classes.
  getTable() { return(new Table()); }
  getCSet() { return(new CSet()); }
  getDataDictionary() { return(new DataDictionary()); }

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

  // "Conditional Replace" replaces a sub-string with (0) or (1).
  conRep(bigstring, lilstring, rep0, rep1)
  {
    var count = 0;

    if(rep0 !== null)
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

  // Linkifies a book's title, if appropriate.
  linkify(title, link)
  {
    if(link === null) return("<em>"+title+"</em>");
    else return("<em><a href=\""+link+"\">"+title+"</a></em>");
  }

  // Turns a 0 or 1 into a no or a yes.
  digitToYesNo(digit)
  {
    if(digit === 0) return("no");
    else return("yes");
  }

  // Replaces a null value with an appropriate string.
  deNullify(s)
  {
    if(s === null) return("None.");
    else return(s);
  }

  // Returns a linked version of a person's short title.
  makeLinkedST(id, shortTitle, rankTier, style)
  {
    var result = "<a href=\"persona"+id+"b.html\">"+shortTitle+"</a>";

    if((rankTier >= constants.marquessRank) && (style !== null))
    {
      result = style+" "+result;
    }

    return(result);
  }
}

// Ronseal.
class Table
{
  constructor()
  {
    this.htmlClass = "";
    this.columns = [];
    this.rows = [];
    this.htmlPrintout = "";
  }

  static buildColumnsPrintout(columns)
  {
    var result = "<tr> ";

    for(var i = 0; i < columns.length; i++)
    {
      result = result+"<th>"+columns[i]+"</th> ";
    }
    result = result+"</tr>\n"

    return(result);
  }

  static buildRowPrintout(row)
  {
    var result = "<tr> ";

    for(var i = 0; i < row.length; i++)
    {
      result = result+"<td>"+row[i]+"</td> ";
    }
    result = result+"</tr>\n"

    return(result);
  }

  setHTMLClass(inputClass)
  {
    this.htmlClass = inputClass;
  }

  setColumns(inputColumns)
  {
    this.columns = inputColumns;
  }

  addRow(row)
  {
    if(row.length === this.columns.length) this.rows.push(row);
    else console.log("Table with mismatch adding: "+row);
  }

  buildHTMLPrintout()
  {
    var result = "";
    var classString = "";

    if(this.htmlClass !== "") classString = " class=\""+this.htmlClass+"\"";

    if(this.rows.length === 0) result = "<em>None as yet.</em>";
    else
    {
      result = "<table"+classString+">\n"+
               Table.buildColumnsPrintout(this.columns);
      for(var i = 0; i < this.rows.length; i++)
      {
        result = result+Table.buildRowPrintout(this.rows[i]);
      }
      result = result+"</table>\n"
    }
    this.htmlPrintout = result;

    return(result);
  }
}

// Holds a customised kind of set.
class CSet
{
  constructor()
  {
    this.array = [];
  }

  add(element)
  {
    for(var i = 0; i < this.array.length; i++)
    {
      if(this.array[i] === element) return;
    }
    this.array.push(element);
  }

  get(i)
  {
    return(this.array[i]);
  }

  getLength()
  {
    return(this.array.length);
  }
}

// Holds data retrieved from a database.
class DataDictionary
{
  constructor()
  {
    this.keys = new CSet();
    this.values = [];
  }

  add(key, value)
  {
    this.keys.add(key);
    this.values.push(value);

    if(this.keys.getLength() !== this.values.length)
    {
      throw "Mismatched numbers of keys and values. "+
            "Is the key you're adding unique?";
    }
  }

  access(key)
  {
    for(var i = 0; i < this.keys.getLength(); i++)
    {
      if(this.keys.get(i) === key) return(this.values[i]);
    }
    return(null);
  }
}
