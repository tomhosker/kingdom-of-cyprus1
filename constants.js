/*
This holds all the site's constants.
*/

// Constants.
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var maxloops = 1000;
var lquote = "&#8216;", rquote = "&#8217;", emdash = "&#8212;",
    ldquote = "&#8220;", rdquote = "&#8221;";
var villeinRank = 1, ploughmanRank = 2, journeymanRank = 3,
    foremanRank = 4, masterCraftsmanRank = 5, bailiffRank = 6,
    grandMasterCraftsmanRank = 7,
    goodmanRank = 8, husbandmanRank = 9, yeomanRank = 10,
    viceMasterRank = 11, masterRank = 12, knightRank = 13,
    baronRank = 14, viscountRank = 15, earlRank = 16,
    marquessRank = 17, dukeInPaphosRank = 18, vicedukeRank = 18,
    dukeRank = 19;
var standardProfilePhotoWidth = "350px",
    smallerProfilePhotoWidth = "270px",
    vsmallProfilePhotoWidth = "200px",
    galleryHeight = "300px";
// NPU = ne plus ultra. NPI = ne plus intra.
var canonNPU = 999, subCanonNPI = 10000;
var gradesF = ["N", "C", "B", "A", "A*"], gradesS = ["DR", "G", "VG"];

// This exports the above.
module.exports = {
  OK: OK, NotFound: NotFound, BadType: BadType, Error: Error,
  maxloops: maxloops,
  lquote: lquote, rquote: rquote, emdash: emdash, ldquote: ldquote,
  rdquote: rdquote,
  villeinRank: villeinRank, ploughmanRank: ploughmanRank,
  journeymanRank: journeymanRank, foremanRank: foremanRank,
  masterCraftsmanRank: masterCraftsmanRank,
  grandMasterCraftsmanRank: grandMasterCraftsmanRank,
  goodmanRank: goodmanRank, husbandmanRank: husbandmanRank,
  yeomanRank: yeomanRank, viceMasterRank: viceMasterRank,
  masterRank: masterRank, knightRank: knightRank,
  baronRank: baronRank, viscountRank: viscountRank,
  earlRank: earlRank, marquessRank: marquessRank,
  dukeInPaphosRank: dukeInPaphosRank, dukeRank: dukeRank,
  standardProfilePhotoWidth: standardProfilePhotoWidth,
  smallerProfilePhotoWidth: smallerProfilePhotoWidth,
  vsmallProfilePhotoWidth: vsmallProfilePhotoWidth,
  galleryHeight: galleryHeight,
  canonNPU: canonNPU, subCanonNPI: subCanonNPI,
  gradesF: gradesF, gradesS: gradesS
};
