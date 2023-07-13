/*
MIT License

Copyright (c) 2020 Robert M Pavey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// The idea here is to be able to get from a county name that may have come from another site
// to the right county name to use in a search for a particular record type

// One challenge for going from a general couty name to a search county is that the
// list of search counties contains both "ABERDEEN" and "ABERDEEN CITY", not sure
// how it can decide which to use.

// these are the county names from the statutory births page:
// https://www.scotlandspeople.gov.uk/advanced-search#{%22category%22:%22statutory%22,%22record%22:%22statutory-births%22}
// AFAIK They are the same as the counties for all statutory, church and census pages
// With the exception that only the statutory list contains "MINOR RECORDS"
const statutoryCountyNames = [
  "ABERDEEN",
  "ABERDEEN CITY",
  "ANGUS",
  "ARGYLL",
  "AYR",
  "BANFF",
  "BERWICK",
  "BUTE",
  "CAITHNESS",
  "CLACKMANNAN",
  "DUMFRIES",
  "DUNBARTON",
  "DUNDEE CITY",
  "EAST LOTHIAN",
  "EDINBURGH CITY",
  "FIFE",
  "FORFAR",
  "GLASGOW CITY",
  "INVERNESS",
  "KINCARDINE",
  "KINROSS",
  "KIRKCUDBRIGHT",
  "LANARK",
  "MIDLOTHIAN",
  "MINOR RECORDS",
  "MORAY",
  "NAIRN",
  "ORKNEY",
  "PEEBLES",
  "PERTH",
  "RENFREW",
  "ROSS AND CROMARTY",
  "ROXBURGH",
  "SELKIRK",
  "SHETLAND",
  "STIRLING",
  "SUTHERLAND",
  "WEST LOTHIAN",
  "WIGTOWN",
];

// these are the County/City names from the valuation rolls page:
// https://www.scotlandspeople.gov.uk/advanced-search#{%22category%22:%22valuation%22}
// When a search is done these names (URI encoded) are put in the search query for the key
// "county_burgh"
const valuationCountyNames = [
  "ABERDEEN COUNTY",
  "ANGUS (FORFAR) COUNTY",
  "ARGYLL COUNTY",
  "AYR COUNTY",
  "BANFF COUNTY",
  "BERWICK COUNTY",
  "BUTE COUNTY",
  "CAITHNESS COUNTY",
  "CLACKMANNAN COUNTY",
  "DUMFRIES COUNTY",
  "DUNBARTON COUNTY",
  "EAST LOTHIAN COUNTY",
  "FIFE COUNTY",
  "INVERNESS COUNTY",
  "KINCARDINE COUNTY",
  "KINROSS COUNTY",
  "KIRKCUDBRIGHT COUNTY",
  "LANARK COUNTY",
  "MIDLOTHIAN COUNTY",
  "MORAY (ELGIN) COUNTY",
  "NAIRN COUNTY",
  "ORKNEY COUNTY",
  "PEEBLES COUNTY",
  "PERTH COUNTY",
  "RENFREW COUNTY",
  "ROSS AND CROMARTY COUNTY",
  "ROXBURGH COUNTY",
  "SELKIRK COUNTY",
  "SHETLAND COUNTY",
  "STIRLING COUNTY",
  "SUTHERLAND COUNTY",
  "WEST LOTHIAN COUNTY",
  "WIGTOWN COUNTY",
];

// these are the County/City names from the "Poor relief and migration records" page:
// https://www.scotlandspeople.gov.uk/advanced-search#{%22category%22:%22poor-relief%22,%22record%22:%22poor-relief-hie%22}
// When a search is done these names (URI encoded) are put in the search query for the key "county"
// e.g.: &county=ARGYLL
const emigrationCountyNames = ["ARGYLL", "CAITHNESS", "INVERNESS", "MIDLOTHIAN", "ROSS AND CROMARTY", "SUTHERLAND"];

function getCountyListForRecordType(scotpRecordType) {
  let countyList = undefined;

  switch (scotpRecordType) {
    case "stat_births":
    case "stat_marriages":
    case "stat_deaths":
    case "stat_civilpartnerships":

    case "census":
    case "census_lds":

    case "opr_births":
    case "opr_deaths":
    case "opr_marriages":

    case "cr_banns":
    case "cr_baptisms":
    case "cr_burials":
    case "cr_other":

    case "ch3_baptisms": // Presbyterian
    case "ch3_burials": // Presbyterian
    case "ch3_banns": // Presbyterian
    case "ch3_other": // Presbyterian
      countyList = statutoryCountyNames;
      break;

    case "vr":
      countyList = valuationCountyNames;
      break;

    case "hie": // Poor relief and migration records - Highlands and Island Emigration
      countyList = emigrationCountyNames;
      break;
  }

  return countyList;
}

function getSearchCountyFromPlaceObj(scotpRecordType, placeObj) {
  let countyList = getCountyListForRecordType(scotpRecordType);

  if (!countyList) {
    return "";
  }

  let placeCountyName = placeObj.inferCounty();
  //console.log("getSearchCountyFromPlaceObj: placeCountyName : " + placeCountyName);

  if (!placeCountyName) {
    return "";
  }

  // convert to uppercase to match names in list
  placeCountyName = placeCountyName.toUpperCase();

  // remove "shire" from input name if present
  placeCountyName = placeCountyName.replace(/\-SHIRE$/, "");
  placeCountyName = placeCountyName.replace(/\SHIRE$/, "");

  if (scotpRecordType == "vr") {
    placeCountyName += " COUNTY";
  }

  if (countyList.includes(placeCountyName)) {
    // we are done unless there is a possible city match where the city name and county name are the same
    // the only time this is a case is for ABERDEEN
    if (countyList === statutoryCountyNames) {
      let placeString = placeObj.placeString;
      if (!placeString) {
        return placeCountyName;
      }

      placeString = placeString.toUpperCase();

      if (placeCountyName == "ABERDEEN") {
        if (placeString.includes("ABERDEEN, ABERDEEN")) {
          return "ABERDEEN CITY";
        }
        // it could still be a place string like "Old Machar, Aberdeen" which would be Aberdeen City
        // but leave it for now.
      } else if (placeCountyName == "ANGUS") {
        if (placeString.includes("DUNDEE, ")) {
          return "DUNDEE CITY";
        }
      } else if (placeCountyName == "MIDLOTHIAN") {
        if (placeString.includes("EDINBURGH, ")) {
          return "EDINBURGH CITY";
        }
      } else if (placeCountyName == "LANARK") {
        if (placeString.includes("GLASGOW, ")) {
          return "GLASGOW CITY";
        }
      }

      return placeCountyName;
    } else {
      return placeCountyName;
    }
  }

  // now deal with special cases
  if (countyList === statutoryCountyNames) {
    // have to deal with cities. There are three cases: "DUNDEE CITY", "EDINBURGH CITY", "GLASGOW CITY",
    let placeString = placeObj.placeString;
    if (!placeString) {
      return "";
    }

    placeString = placeString.toUpperCase();
    if (placeString.includes("DUNDEE, ") || placeString.endsWith("DUNDEE")) {
      return "DUNDEE CITY";
    }
    if (placeString.includes("EDINBURGH, ") || placeString.endsWith("EDINBURGH")) {
      return "EDINBURGH CITY";
    }
    if (placeString.includes("GLASGOW, ") || placeString.endsWith("GLASGOW")) {
      return "GLASGOW CITY";
    }
  } else if (scotpRecordType == "vr") {
    // have to deal with: "ANGUS (FORFAR) COUNTY" and "MORAY (ELGIN) COUNTY"
    // there are only two cases so handle them individually
    if (placeCountyName == "ANGUS COUNTY" || placeCountyName == "FORFAR COUNTY") {
      return "ANGUS (FORFAR) COUNTY";
    }
    if (placeCountyName == "MORAY COUNTY" || placeCountyName == "ELGIN COUNTY") {
      return "MORAY (ELGIN) COUNTY";
    }
  }

  return "";
}

export { getSearchCountyFromPlaceObj };
