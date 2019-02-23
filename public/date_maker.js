// Constants.
var weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday",
                    "Thursday", "Friday", "Saturday"];
var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var allSaintsEve = [31, 9];
var allSaints = [1, 10];
var allSouls = [2, 10];
var christmas = [25, 11];

// Set up variables.
var date = new Date();
var weekday = date.getDay();
var day = date.getDate();
var monthNo = date.getMonth();
var year = date.getFullYear();

/****************************
*** Sacred Calendar stuff ***
****************************/

// Calculate moveable feasts, etc.
var easter = getEaster(year);
var epiphany = getEpiphany(year);
var ashWednesday = getAshWednesday(year);
var palmSunday = getPalmSunday(year);
var goodFriday = getGoodFriday(year);
var ascension = getAscension(year);
var pentecost = getPentecost(year);
var adventSunday = getAdventSunday(year);

// Copied from GitHub.
function getEaster(year)
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

// Sakamoto's formula.
function getWeekday(y, m, d)
{
  var t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  if(m < 3) y = y-1;
  var result = (y +(y/4)-(y/100)+(y/400)+t[m-1]+d)%7;
  return(Math.floor(result));
}

// Ronseal.
function getEpiphany(year)
{
  weekday01Jan = getWeekday(year, 1, 1);
  delay = 7-weekday01Jan;
  return([delay+1, 0]);
}

// Ronseal.
function isLeapYear(year)
{
  if(year%100 === 0) return(false);
  else if(year%4 === 0) return(true);
  else return(false);
}

// Calculates the number of days from the first of one
// month to the first of another.
function diffInDaysM(a, b, year)
{
  var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31,
                      30, 31];
  var monthLenghts2 = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31,
                       30, 31];
  if(isLeapYear(year)) monthLengths = monthLengths2;

  var count = 0;
  for(var i = a; i < b; i++)
  {
    count = count+monthLengths[i];
  }
  return(count);
}

// Calculates the difference in days between two dates.
// Note that A MUST fall before B.
function diffInDays(a, b, year)
{
  var aDays = a[0];
  var aMonths = a[1];
  var bDays = b[0];
  var bMonths = b[1];

  var diffFromMonths = diffInDaysM(aMonths, bMonths, year);
  var diffFromDays = bDays-aDays;
  return(diffFromMonths+diffFromDays);
}

// Calculates Date B, which is N days before Date A.
function subtractDays(a, n, year)
{
  var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31,
                      30, 31];
  var monthLenghts2 = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31,
                       30, 31];
  if(isLeapYear(year)) monthLengths = monthLengths2;

  for(var i = 0; i < 12; i++)
  {
    for(var j = 0; j <= monthLengths[i]; j++)
    {
      if(diffInDays([j, i], a, year) === n) return([j, i]);
    }
  }
  return([0, 0]);
}

// Calculates Date B, which is N days after Date A.
function addDays(a, n, year)
{
  var monthLengths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31,
                      30, 31];
  var monthLenghts2 = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31,
                       30, 31];
  if(isLeapYear(year)) monthLengths = monthLengths2;

  for(var i = 0; i < 12; i++)
  {
    for(var j = 0; j <= monthLengths[i]; j++)
    {
      if(diffInDays(a, [j, i], year) === n) return([j, i]);
    }
  }
  return([0, 0]);
}

// Ronseal.
function getAshWednesday(year)
{
  return(subtractDays(easter, 46, year));
}

// Ronseal.
function getPalmSunday(year)
{
  return(subtractDays(easter, 7, year));
}

// Ronseal.
function getGoodFriday(year)
{
  return(subtractDays(easter, 2, year));
}

// Ronseal.
function getAscension(year)
{
  return(addDays(easter, 39, year));
}

// Ronseal.
function getPentecost(year)
{
  return(addDays(easter, 49, year));
}

// Determines whether the "first" date is before the
// "second" one.
function isBefore(first, second)
{
  var firstDays = first[0];
  var firstMonths = first[1];
  var secondDays = second[0];
  var secondMonths = second[1];

  if(firstMonths > secondMonths) return(false);
  else if(firstMonths === secondMonths)
  {
    if(firstDays < secondDays) return(true);
    else return(false);
  }
  else return(true);
}

// Ronseal.
function getAdventSunday(year)
{
  var weekdayOfChristmas = getWeekday(year, 12, 25);
  var dayNo = 0;

  if(weekdayOfChristmas === 0) dayNo = 27;
  else if(weekdayOfChristmas === 1) dayNo = 3;
  else if(weekdayOfChristmas === 2) dayNo = 2;
  else if(weekdayOfChristmas === 3) dayNo = 1;
  else if(weekdayOfChristmas === 4) dayNo = 30;
  else if(weekdayOfChristmas === 5) dayNo = 29;
  else if(weekdayOfChristmas === 6) dayNo = 28;

  if(dayNo < 27) monthNo = 11;
  else monthNo = 10;

  return([dayNo, monthNo]);
}

// Returns the number of whole weeks since Advent Sunday,
// plus one.
function getWeekOfAdvent(today, year)
{
  var result = diffInDays(adventSunday, today, year);
  result = result/7;
  result = Math.floor(result);
  return(result+1);
}

// Returns the "Day of Christmas".
function getDOC(today)
{
  var dayNo = today[0];
  if(dayNo === 26) return("2nd day of Christmas");
  else if(dayNo === 27) return("3rd day of Christmas");
  else if(dayNo === 28) return("4th day of Christmas");
  else if(dayNo === 29) return("5th day of Christmas");
  else if(dayNo === 30) return("6th day of Christmas");
  else if(dayNo === 31) return("7th day of Christmas");
  else if(dayNo === 1) return("8th day of Christmas");
  else if(dayNo === 2) return("9th day of Christmas");
  else if(dayNo === 3) return("10th day of Christmas");
  else if(dayNo === 4) return("11th day of Christmas");
  else if(dayNo === 5) return("12th day of Christmas");
  else if(dayNo === 6) return("1st day after Christmas");
  else if(dayNo === 7) return("2nd day after Christmas");
  else if(dayNo === 8) return("3rd day after Christmas");
  else return("1st day after Christmas");
}

// Returns the number of whole weeks since Epiphany, plus one.
function getWeekAfterEpiphany(today, year)
{
  var result = diffInDays(epiphany, today, year);
  result = result/7;
  result = Math.floor(result);
  return(result+1);
}

// Returns the number of week of Lent.
function getWeekOfLent(today, year)
{
  var result = diffInDays(ashWednesday, today, year);
  if(result <= 3) return(1);
  else
  {
    result = result-3;
    result = result/7;
    result = Math.floor(result);
    result = result+1;
    return(result+1);
  }
}

// Returns the number of whole weeks since Easter, plus one.
function getWeekOfEaster(today, year)
{
  var result = diffInDays(easter, today, year);
  result = result/7;
  result = Math.floor(result);
  return(result+1);
}

// Returns the number of whole weeks since Pentecost, plus one.
function getWeekAfterPentecost(today, year)
{
  var result = diffInDays(pentecost, today, year);
  result = result/7;
  result = Math.floor(result);
  return(result+1);
}

// Converts "n" to "nth", etc.
function convertToNth(n)
{
  if(n === 1) return("1st");
  else if(n === 2) return("2nd");
  else if(n === 3) return("3rd");
  else if(n === 21) return("21st");
  else if(n === 22) return("22nd");
  else if(n === 23) return("23rd");
  else return(String(n)+"th");
}

// Determines whether two dates are equal.
function fallsOn(first, second)
{
  if(first[0] != second[0]) return(false);
  else if(first[1] != second[1]) return(false);
  return(true);
}

// Ronseal.
function getSacred(weekday, day, monthNo, year)
{
  // Inputs and outputs.
  var today = [day, monthNo];
  var sacred = "";
  var sacredWeekNo = 0;
  var sacredWeek = "";
  var sacredSeason = "";

  // Checks for feasts and other important days.
  if(fallsOn(today, epiphany))
  {
    sacred = "The Feast of the Epiphany";
  }
  else if(fallsOn(today, ashWednesday))
  {
    sacred = "Ash Wednesday";
  }
  else if(fallsOn(today, palmSunday))
  {
    sacred = "Palm Sunday";
  }
  else if(fallsOn(today, goodFriday)) sacred = "Good Friday";
  else if(fallsOn(today, easter))
  {
    sacred = "The Feast of the Resurrection";
  }
  else if(fallsOn(today, pentecost))
  {
    sacred = "The Feast of Pentecost";
  }
  else if(fallsOn(today, allSaintsEve))
  {
    sacred = "The Eve of the Feast of All Saints";
  }
  else if(fallsOn(today, allSaints))
  {
    sacred = "The Feast of All Saints";
  }
  else if(fallsOn(today, allSouls)) sacred = "All Souls' Day";
  else if(fallsOn(today, adventSunday))
  {
    sacred = "Advent Sunday";
  }
  else if(fallsOn(today, christmas))
  {
    sacred = "The Feast of the Incarnation";
  }
  // Categorise into season, and calculate week number.
  else
  {
    if(isBefore(adventSunday, today) &&
       isBefore(today, christmas))
    {
      sacredSeason = "of Advent";
      sacredWeekNo = getWeekOfAdvent(today, year);
    }
    else if(isBefore(christmas, today) ||
            isBefore(today, epiphany))
    {
      return(getDOC(today));
    }
    else if(isBefore(epiphany, today) &&
            isBefore(today, ashWednesday))
    {
      sacredSeason = "after Epiphany";
      sacredWeekNo = getWeekAfterEpiphany(today, year);
    }
    else if(isBefore(ashWednesday, today) &&
            isBefore(today, easter))
    {
      sacredSeason = "of Lent";
      sacredWeekNo = getWeekOfLent(today, year);
    }
    else if(isBefore(easter, today) &&
            isBefore(today, pentecost))
    {
      sacredSeason = "of Easter";
      sacredWeekNo = getWeekOfEaster(today, year);
    }
    else
    {
      sacredSeason = "after Pentecost";
      sacredWeekNo = getWeekAfterPentecost(today, year);
    }

    sacredWeek = convertToNth(sacredWeekNo);
    sacred = weekdayNames[weekday]+" of the "+sacredWeek+
             " week "+sacredSeason;
  }
  return(sacred);
}

// Ronseal.
function getSacredColour(weekday, day, monthNo, year)
{
  // Inputs and outputs.
  var today = [day, monthNo];
  var colour = "green";

  // Checks for feasts and other important days.
  if(fallsOn(today, epiphany)) colour = "white";
  else if(fallsOn(today, ashWednesday)) colour = "violet";
  else if(fallsOn(today, palmSunday)) colour = "red";
  else if(fallsOn(today, goodFriday)) colour = "red";
  else if(fallsOn(today, easter)) colour = "white";
  else if(fallsOn(today, pentecost)) colour = "white";
  else if(fallsOn(today, allSaintsEve)) colour = "green";
  else if(fallsOn(today, allSaints)) colour = "white";
  else if(fallsOn(today, allSouls)) colour = "violet";
  else if(fallsOn(today, adventSunday)) colour = "violet";
  else if(fallsOn(today, christmas)) colour = "white";
  // Categorise into season, and calculate week number.
  else
  {
    if(isBefore(adventSunday, today) &&
       isBefore(today, christmas))
    {
      colour = "violet";
    }
    else if(isBefore(christmas, today) ||
            isBefore(today, epiphany))
    {
      colour = "white";
    }
    else if(isBefore(epiphany, today) &&
            isBefore(today, ashWednesday))
    {
      colour = "green";
    }
    else if(isBefore(ashWednesday, today) &&
            isBefore(today, palmSunday))
    {
      colour = "violet";
    }
    else if(isBefore(palmSunday, today) &&
            isBefore(today, easter))
    {
      colour = "red";
    }
    else if(isBefore(easter, today) &&
            isBefore(today, pentecost))
    {
      colour = "white";
    }
    else
    {
      colour = "green";
    }
  }
  return(colour);
}

/****************************
*** Make the replacements ***
****************************/

dayString = "";
if(day < 10) dayString = "0"+day.toString();
else dayString = day.toString();

document.getElementById("date").innerHTML = 
  dayString+" "+monthNames[date.getMonth()]+" "+year;

document.getElementById("sacredDate").innerHTML =
  getSacred(weekday, day, date.getMonth(), year);

document.getElementById("sacredColour").innerHTML =
  getSacredColour(weekday, day, date.getMonth(), year);

document.getElementById("cyprianDate").innerHTML =
  String(hebyear);
