/*
This code is responsible for holding the "CDates" CLASS.
*/

// Imports.
var constants = require("./constants.js");
var hebcal = require("hebcal");

// Local constants.
var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var monthLengths2 = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var daysInAWeek = 7, leapYearInterval = 4, monthsInAYear = 12,
    centuryInterval = 100;
var yearDiff = 5773, roshHashanahMonth = 6, cyprianMonthLength = 28;
var allSaintsEve = [31, 9], allSaints = [1, 10], allSouls = [2, 10],
    earliestAdventSunday = [27, 10], christmas = [25, 11];
var daysInLent = 46, easterToAscension = 39, easterToPentecost = 49,
    daysOfChristmas = 12, daysInFirstWeekOfLent = 4;

// Off the shelf functions.
function gitHubGetEaster(year)
{
  var f = Math.floor,
  G = year%19,
  C = f(year/100),
  H = (C-f(C/4)-f((8*C+13)/25)+19*G+15)%30,
  I = H-f(H/28)*(1-f(29/(H+1))*f((21-G)/11)),
  J = (year+f(year/4)+I+2-C+f(C/4))%7,
  L = I-J,
  month = 3+f((L+40)/44),
  day = L+28-31*f(month/4);
  return([day, month-1]);
}
function sakamotoGetWeekday(y, m, d)
{
  var t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  if(m < 3) y = y-1;
  var result = (y +(y/4)-(y/100)+(y/400)+t[m-1]+d)%7;
  return(Math.floor(result));
}

// This stuff allows this class to be accessed elsewhere.
module.exports = {
  getClass: function()
  {
    return(new CDates());
  }
};

// Holds the calendars used in the Kingdom.
class CDates
{
  constructor()
  {
    this.gregorian = new CGregorian();
    this.cyprian = null;
    this.sacred = null;
  }

  updateCyprian()
  {
    this.cyprian = new CyprianDate();
  }

  updateSacred()
  {
    this.sacred = new SacredDate(this.gregorian);
  }
}

// Handles the data relating to the Gregorian calendar.
class CGregorian
{
  constructor()
  {
    this.date = new Date();
    this.day = this.date.getDate();
    this.month = this.date.getMonth();
    this.year = this.date.getFullYear();
    this.weekday = this.date.getDay();
    this.monthString = this.buildMonthString();
    this.dateString = this.buildDateString();
  }

  buildMonthString()
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return(months[this.month]);
  }

  buildDateString()
  {
    var dayString = this.day.toString();
    var result = "";

    if(dayString.length === 1) dayString = "0"+dayString;

    result = dayString+" "+this.monthString+" "+this.year;

    return(result);
  }
}

// Handles today's Cyprian date.
class CyprianDate
{
  constructor()
  {
    this.hebdate = new hebcal.HDate();
    this.day = this.hebdate.day;
    this.month = this.hebdate.month-1;
    this.year = this.buildYear();
    this.weekday = this.buildWeekday();
    this.monthString = this.buildMonthString();
    this.dateString = this.buildDateString();
  }

  buildYear()
  {
    var y = this.hebdate.year-yearDiff;

    if(this.hebdate.month >= roshHashanahMonth) y = y-1;

    return(y);
  }

  buildWeekday()
  {
    var weekdays = ["Seventh-day", "First-day", "Second-day", "Third-day",
                    "Fourth-day", "Fifth-day", "Sixth-day"];

    if(this.day <= cyprianMonthLength)
    {
      return(weekdays[this.day%daysInAWeek]);
    }
    else
    {
      if(this.day === cyprianMonthLength+1) return("Eighth-day");
      else return("Ninth-day");
    }
  }

  buildMonthString()
  {
    var months = ["Pri", "Sec", "Ter", "Qua", "Qui", "Sex",
                  "Sep", "Oct", "Nov", "Dec", "Uno", "Duo", "Int"];

    return(months[this.month]);
  }

  buildDateString()
  {
    var dayString = this.day.toString();
    var result = "";

    if(dayString.length === 1) dayString = "0"+dayString;

    result = dayString+" "+this.monthString+" "+
             "<span class=\"frak\">T</span><sub>"+this.year+"</sub>";

    return(result);
  }
}

// Handles today's liturgical date.
class SacredDate
{
  constructor(gregorian)
  {
    this.gregorian = gregorian;
    this.easter = this.buildEaster();
    this.epiphany = this.buildEpiphany();
    this.ashWednesday = this.buildAshWednesday();
    this.pentecost = this.buildPentecost();
    this.adventSunday = this.buildAdventSunday();
    this.seasonal = this.buildSeasonal();
    this.season = this.buildSeason();
    this.dateString = this.season.dateString;
    this.colour = this.season.colour;
  }

  static isLeapYear(y)
  {
    if(y%centuryInterval === 0) return(false);
    else if(y%leapYearInterval === 0) return(true);
    else return(false);
  }

  // Calculates Date B, which is N days before Date A.
  static subtractDays(a, n, y)
  {
    var ml = monthLengths;
    var j0 = 1;
    var count = 0;

    if(SacredDate.isLeapYear(y)) ml = monthLengths2;

    for(var i = a[1]; i >= 0; i--)
    {
      if(i === a[1]) j0 = a[0];
      else j0 = ml[i];

      for(var j = j0; j >= 1; j--)
      {
        if(count === n) return([j, i]);
        count++;
      }
    }
    return([0, 0]);
  }

  // Calculates Date B, which is N days after Date A.
  static addDays(a, n, y)
  {
    var ml = monthLengths;
    var j0 = 1;
    var count = 0;

    if(SacredDate.isLeapYear(y)) ml = monthLengths2;

    for(var i = a[1]; i < monthsInAYear; i++)
    {
      if(i === a[1]) j0 = a[0];
      else j0 = 1;

      for(var j = j0; j <= ml[i]; j++)
      {
        if(count === n) return([j, i]);
        count++;
      }
    }
    return([0, 0]);
  }

  static fallsOn(a, b)
  {
    if(a[0] !== b[0]) return(false);
    else if(a[1] !== b[1]) return(false);
    else return(true);
  }

  static isBefore(a, b)
  {
    if(a[1] > b[1]) return(false);
    else if((a[1] === b[1]) && (a[0] >= b[0])) return(false);
    else return(true);
  }

  static daysAfter(a, b, y)
  {
    var count = 0;
    var j0 = 1, jn = 1;
    var ml = monthLengths;

    if(SacredDate.isLeapYear(y)) ml = monthLengths2;

    for(var i = a[1]; i <= b[1]; i++)
    {
      if(i === a[1]) j0 = a[0];
      else j0 = 1;

      if(i === b[1]) jn = b[0];
      else jn = ml[i]

      for(var j = j0; j <= jn; j++)
      {
        count++;
      }
    }

    return(count);
  }

  static nToNth(n)
  {
    var suffix = "th", nString = n.toString(), result = "";

    if(nString.endsWith("1")) suffix = "st";
    else if(nString.endsWith("2")) suffix = "nd";
    else if(nString.endsWith("3")) suffix = "rd";

    result = nString+suffix;

    return(result);
  }

  buildEaster()
  {
    var y = this.gregorian.year;

    return(gitHubGetEaster(y));
  }

  buildEpiphany()
  {
    var y = this.gregorian.year;
    var weekday01Jan = sakamotoGetWeekday(y, 1, 1);
    var delay = daysInAWeek-weekday01Jan;
    var result = [delay+1, 0];

    return(result);
  }

  buildAshWednesday()
  {
    var y = this.gregorian.year;
    var result = SacredDate.subtractDays(this.easter, daysInLent, y);

    return(result);
  }

  buildPentecost()
  {
    var y = this.gregorian.year;
    var result = SacredDate.addDays(this.easter, easterToPentecost, y);

    return(result);
  }

  buildAdventSunday()
  {
    var christmasWeekday = sakamotoGetWeekday(this.gregorian.year,
                                              christmas[1]+1,
                                              christmas[0]);
    var n = 0;
    var result = [];

    if(christmasWeekday !== 0) n = daysInAWeek-christmasWeekday;

    result = SacredDate.addDays(earliestAdventSunday, n,
                                this.gregorian.year);

    return(result);
  }

  buildSeasonal()
  {
    var seasonal = "After Pentecost";
    var today = [this.gregorian.day, this.gregorian.month];

    if(SacredDate.fallsOn(this.adventSunday, today) ||
       (SacredDate.isBefore(this.adventSunday, today) &&
        SacredDate.isBefore(today, christmas)))
    {
      seasonal = "Advent";
    }
    else if(SacredDate.fallsOn(christmas, today) ||
            (SacredDate.isBefore(christmas, today) &&
             SacredDate.isBefore(today, this.epiphany)) ||
            SacredDate.fallsOn(this.epiphany, today))
    {
      seasonal = "Christmas";
    }
    else if(SacredDate.isBefore(this.epiphany, today) &&
            SacredDate.isBefore(today, this.ashWednesday))
    {
      seasonal = "After Epiphany";
    }
    else if(SacredDate.fallsOn(this.ashWednesday, today) ||
            (SacredDate.isBefore(this.ashWednesday, today) &&
             SacredDate.isBefore(today, this.easter)))
    {
      seasonal = "Lent";
    }
    else if(SacredDate.fallsOn(this.easter, today) ||
            (SacredDate.isBefore(this.easter, today) &&
             SacredDate.isBefore(today, this.pentecost)) ||
            SacredDate.fallsOn(today, this.pentecost))
    {
      seasonal = "Easter";
    }

    return(seasonal);
  }

  buildSeason()
  {
    if(this.seasonal === "Advent")
    {
      return(new Advent(this.gregorian, this.adventSunday));
    }
    else if(this.seasonal === "Christmas")
    {
      return(new Christmas(this.gregorian, this.epiphany));
    }
    else if(this.seasonal === "After Epiphany")
    {
      return(new AfterEpiphany(this.gregorian, this.epiphany));
    }
    else if(this.seasonal === "Lent")
    {
      return(new Lent(this.gregorian, this.ashWednesday, this.easter));
    }
    else if(this.seasonal === "Easter")
    {
      return(new Easter(this.gregorian, this.easter, this.pentecost));
    }
    else return(new AfterPentecost(this.gregorian, this.pentecost));
  }
}

// Handles the data specific to Advent.
class Advent
{
  constructor(gregorian, adventSunday)
  {
    this.gregorian = gregorian;
    this.adventSunday = adventSunday;
    this.week = this.buildWeek();
    this.dateString = this.buildDateString();
    this.colour = "violet";
  }

  buildWeek()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var daysAfterAdventSunday = SacredDate.daysAfter(this.adventSunday,
                                  today, this.gregorian.year);
    var weekNo = daysAfterAdventSunday-(daysAfterAdventSunday%daysInAWeek);

    weekNo = weekNo/daysInAWeek;
    weekNo = weekNo+1;

    return(weekNo);
  }

  buildDateString()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var weekday = this.gregorian.weekday;
    var result = weekday+" of the "+SacredDate.nToNth(this.week)+
                         " week of Advent";

    if(SacredDate.fallsOn(this.adventSunday, today))
    {
      result = "Advent Sunday";
    }

    return(result);
  }
}

// Handles the data specific to the season of Christmas.
class Christmas
{
  constructor(gregorian, epiphany)
  {
    this.gregorian = gregorian;
    this.epiphany = epiphany;
    this.dayOfChristmas = this.buildDayOfChristmas();
    this.dateString = this.buildDateString();
    this.colour = "white";
  }

  buildDayOfChristmas()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var daysAfterChristmas = SacredDate.daysAfter(christmas, today,
                               this.gregorian.year);
    var doc = 0;

    if((daysAfterChristmas >= 0) &&
       (daysAfterChristmas <= daysOfChristmas-1))
    {
      doc = daysAfterChristmas+1;
    }

    return(doc);
  }

  buildDateString()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var result = SacredDate.nToNth(this.dayOfChristmas)+" day of Christmas";

    if(SacredDate.fallsOn(christmas, today))
    {
      result = "The Feast of the Incarnation";
    }
    else if(SacredDate.fallsOn(this.epiphany, today))
    {
      result = "The Feast of the Epiphany";
    }
    else if(this.dayOfChristmas === 0)
    {
      result = this.gregorian.weekday+" before Epiphany";
    }

    return(result);
  }
}

// Handles the data specific to the period of Ordinary Time after the
// season of Christmas.
class AfterEpiphany
{
  constructor(gregorian, epiphany)
  {
    this.gregorian = gregorian;
    this.epiphany = epiphany;
    this.week = this.buildWeek();
    this.dateString = this.buildDateString();
    this.colour = "green";
  }

  buildWeek()
  {
    // This assumes that we're using the definition of Epiphany wherein it
    // always falls on a Sunday.
    var today = [this.gregorian.day, this.gregorian.month];
    var result = SacredDate.daysAfter(this.epiphany, today,
                                      this.gregorian.year);

    result = result-(result%daysInAWeek);
    result = result/daysInAWeek;
    result = result+1;

    return(result);
  }

  buildDateString()
  {
    var result = this.gregorian.weekday+" of the "+
                 SacredDate.nToNth(this.week)+" week after Epiphany";

    return(result);
  }
}

// Handles the data specific to Lent.
class Lent
{
  constructor(gregorian, ashWednesday, easter)
  {
    this.gregorian = gregorian;
    this.ashWednesday = ashWednesday;
    this.easter = easter;
    this.palmSunday = this.buildPalmSunday();
    this.goodFriday = this.buildGoodFriday();
    this.week = this.buildWeek();
    this.dateString = this.buildDateString();
    this.colour = this.buildColour();
  }

  buildPalmSunday()
  {
    var y = this.gregorian.year;
    var result = SacredDate.subtractDays(this.easter, daysInAWeek, y);

    return(result);
  }

  buildGoodFriday()
  {
    var y = this.gregorian.year;
    var result = SacredDate.subtractDays(this.easter, 2, y);

    return(result);
  }

  buildWeek()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var daysAfterAshWednesday =
          SacredDate.daysAfter(this.ashWednesday, today,
                               this.gregorian.year);
    var result = 0;

    if(daysAfterAshWednesday < daysInFirstWeekOfLent) result = 1;
    else
    {
      result = daysAfterAshWednesday-daysInFirstWeekOfLent;
      result = result-(result%daysInAWeek);
      result = result/daysInAWeek;
      result = result+2;
    }

    return(result);
  }

  buildDateString()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var result = this.gregorian.weekday+" of the "+
                 SacredDate.nToNth(this.week)+" week of Lent";

    if(SacredDate.fallsOn(this.ashWednesday, today))
    {
      result = "Ash Wednesday";
    }
    else if(SacredDate.fallsOn(this.palmSunday, today))
    {
      result = "Palm Sunday";
    }
    else if(SacredDate.fallsOn(this.goodFriday, today))
    {
      result = "Good Friday";
    }
    else if(SacredDate.isBefore(this.palmSunday, today))
    {
      result = "Holy "+this.gregorian.weekday;
    }

    return(result);
  }

  buildColour()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var result = "violet";

    if(SacredDate.fallsOn(this.palmSunday, today) ||
       SacredDate.isBefore(this.palmSunday, today))
    {
      result = "red";
    }

    return(result);
  }
}

// Handles the data specific to the season of Easter.
class Easter
{
  constructor(easter, pentecost)
  {
    this.easter = easter;
    this.pentecost = pentecost;
    this.ascension = buildAscension();
    this.week = buildWeek();
    this.dateString = buildDateString();
    this.colour = buildColour();
  }

  buildAscension()
  {
    var y = this.gregorian.year;
    var result = SacredDate.addDays(this.easter, easterToAscension, y);

    return(result);
  }

  buildWeek()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var daysAfterPentecost = SacredDate.daysAfter(this.pentecost, today,
                               this.gregorian.year);
    var result = 0;

    result = daysAfterPentecost-(daysAfterPentecost%daysInAWeek);
    result = result/daysInAWeek;
    result = result+1;

    return(result);
  }

  buildDateString()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var result = this.gregorian.weekday+" of the "+
                 SacredDate.nToNth(this.week)+" week of Easter";

    if(SacredDate.fallsOn(this.easter, today, this.gregorian.year))
    {
      result = "The Feast of the Resurrection";
    }
    else if(SacredDate.fallsOn(this.ascension, today, this.gregorian.year))
    {
      result = "The Feast of the Ascension";
    }
    else if(SacredDate.fallsOn(this.pentecost, today, this.gregorian.year))
    {
      result = "The Feast of Pentecost";
    }

    return(result);
  }

  buildColour()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var result = "white";

    if(SacredDate.fallsOn(this.pentecost, today, this.gregorian.year))
    {
      result = "red";
    }

    return(result);
  }
}

// Handles the data specific to the period of Ordinary Time after the
// season of Pentecost.
class AfterPentecost
{
  constructor(gregorian, pentecost)
  {
    this.gregorian = gregorian;
    this.pentecost = pentecost;
    this.week = this.buildWeek();
    this.dateString = this.buildDateString();
    this.colour = "green";
  }

  buildWeek()
  {
    var today = [this.gregorian.day, this.gregorian.month];
    var result = SacredDate.daysAfter(this.pentecost, today,
                                      this.gregorian.year);

    result = result-(result%daysInAWeek);
    result = result/daysInAWeek;
    result = result+1;

    return(result);
  }

  buildDateString()
  {
    var result = this.gregorian.weekday+" of the "+
                 SacredDate.nToNth(this.week)+" week after Pentecost";

    return(result);
  }
}
