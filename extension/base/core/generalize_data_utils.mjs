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

import { CD } from "./country_data.mjs";
import { RC } from "./record_collections.mjs";
import { StringUtils } from "./string_utils.mjs";
import { DateUtils } from "./date_utils.mjs";
import { RT, RecordSubtype, Role } from "./record_type.mjs";

const possibleLifeSpan = 120;

const dateQualifiers = {
  NONE: 0,
  EXACT: 1,
  ABOUT: 2,
  BEFORE: 3,
  AFTER: 4,
};

function isString(value) {
  if (value && (typeof value === "string" || value instanceof String)) {
    return true;
  }
  return false;
}

const GD = {
  extractYearStringFromDateString: function (date) {
    var result = undefined;
    if (date != undefined && date != "") {
      const year = date.replace(/^.*(\d\d\d\d)$/, "$1");
      if (year.length == 4) {
        result = year;
      }
    }
    // Not a standard form date string, try parsing
    if (!result) {
      let parsedDate = DateUtils.parseDateString(date);
      if (!parsedDate.isValid || !parsedDate.yearNum) {
        return result;
      }

      result = parsedDate.yearNum.toString();
    }

    return result;
  },

  extractYearNumFromDateString: function (date) {
    var result = 0;
    let yearString = extractYearStringFromDateString(date);
    if (yearString) {
      var yearNum = parseInt(yearString);
      if (yearNum == NaN) {
        yearNum = 0;
      }
      result = yearNum;
    }
    return result;
  },

  standardizeGender: function (string) {
    if (!string) {
      return "";
    }
    let lc = string.toLowerCase();
    if (lc == "male" || lc == "m" || lc == "m (male)") {
      return "male";
    }
    if (lc == "female" || lc == "f" || lc == "f (female)") {
      return "female";
    }
    if (lc.startsWith("m")) {
      return "male";
    }
    if (lc.startsWith("f")) {
      return "female";
    }

    // language variants, we could check country but there is no guarantee that caller has set country before
    // calling this.

    // Norway
    if (lc == "mannlig" || lc == "m" || lc == "mann") {
      return "male";
    }
    if (lc == "kvinnelig" || lc == "k" || lc == "kvin") {
      return "female";
    }

    // check for english gender in parens
    let plc = lc.replace(/\w+\s+\((\w+)\)\s*/, "$1");
    if (plc && plc != lc) {
      if (plc == "male" || plc == "m") {
        return "male";
      }
      if (plc == "female" || plc == "f") {
        return "female";
      }
    }

    return "";
  },

  standardizeMaritalStatus: function (string) {
    if (!string) {
      return "";
    }
    let lc = string.toLowerCase();

    function standardizeLc(lc) {
      if (lc == "married" || lc == "m" || lc.startsWith("mar")) {
        return "married";
      }
      if (
        lc == "single" ||
        lc == "s" ||
        lc == "unmarried" ||
        lc == "u" ||
        lc.startsWith("unm") ||
        lc.startsWith("sin") ||
        lc.startsWith("nev")
      ) {
        return "single";
      }
      if (lc == "widowed" || lc == "w" || lc == "wd" || lc.startsWith("wid")) {
        return "widowed";
      }
      if (lc == "divorced" || lc == "d" || lc.startsWith("div")) {
        return "divorced";
      }
      if (lc == "separated" || lc.startsWith("sep")) {
        return "separated";
      }

      return "";
    }

    let status = standardizeLc(lc);
    if (status) {
      return status;
    }

    // check for english status in parens, this is common for non-english language records on Ancestry
    let plc = lc.replace(/\w+\s+\((\w+)\)\s*/, "$1");
    if (plc && plc != lc) {
      let status = standardizeLc(plc);
      if (status) {
        return status;
      }
    }

    // Note that "-" is turned into "", this is typical on some site for young children
    return status;
  },

  standardizeRelationshipToHead: function (string) {
    if (!string) {
      return "";
    }

    const exactMap = {
      head: "head",
      husband: "husband",
      husbnd: "husband",
      self: "head",
      "self (head)": "head",
      wife: "wife",
      w: "wife",
      "farmers wife": "wife",
      // children
      son: "son",
      s: "son",
      "farmers son": "son",
      daughter: "daughter",
      dau: "daughter",
      d: "daughter",
      "farmers daughter": "daughter",

      // step children
      stepdaughter: "stepdaughter",
      "step-daughter": "stepdaughter",
      "step daughter": "stepdaughter",
      "step-dau": "stepdaughter",
      "step dau": "stepdaughter",
      stepdau: "stepdaughter",
      stpdau: "stepdaughter",
      "step-d": "stepdaughter",
      "step d": "stepdaughter",

      stepson: "stepson",
      "step-son": "stepson",
      "step son": "stepson",
      stpson: "stepson",
      "step-s": "stepson",
      "step s": "stepson",

      "step-child": "stepchild",
      "step child": "stepchild",
      stepchild: "stepchild",

      // in-law children
      "daughter-in-law": "daughter-in-law",
      "dau-in-law": "daughter-in-law",
      daulaw: "daughter-in-law",
      "son-in-law": "son-in-law",
      sonlaw: "son-in-law",

      // grandchildren
      grandchild: "grandchild",
      "grand child": "grandchild",
      granddaughter: "granddaughter",
      "grand daughter": "granddaughter",
      grndau: "granddaughter",
      "step-granddaughter": "step-granddaughter",
      "grand son": "grandson",
      grandson: "grandson",
      grnson: "grandson",
      "step-grandson": "step-grandson",
      "step-grandchild": "step-grandchild",

      // parents
      father: "father",
      mother: "mother",

      // in-law parents
      "father-in-law": "father-in-law",
      "fa-law": "father-in-law",
      "mother-in-law": "mother-in-law",
      "ma-law": "mother-in-law",

      // step parents
      stepfather: "stepfather",
      "step-father": "stepfather",
      stpdad: "stepfather",
      steppa: "stepfather",
      stppa: "stepfather",
      stepmother: "stepmother",
      "step-mother": "stepmother",
      stpmum: "stepmother",
      stepma: "stepmother",
      stpma: "stepmother",

      // grandparents
      grandfather: "grandfather",
      "grand father": "grandfather",
      granpa: "grandfather",
      grandmother: "grandmother",
      "grand mother": "grandmother",
      granma: "grandmother",

      // siblings
      brother: "brother",
      brothr: "brother",
      sister: "sister",
      "brother-in-law": "brother-in-law",
      "brother in law": "brother-in-law",
      brolaw: "brother-in-law",
      "half brother": "half brother",
      hlfbro: "half brother",
      "half sister": "half sister",
      hlfsis: "half sister",
      "sister-in-law": "sister-in-law",
      "sister in law": "sister-in-law",
      sislaw: "sister-in-law",
      stepbrother: "stepbrother",
      "step-brother": "stepbrother",
      stpbro: "stepbrother",
      stepsister: "stepsister",
      "step-sister": "stepsister",
      stpsis: "stepsister",

      // other family
      aunt: "aunt",
      cousin: "cousin",
      "great aunt": "great aunt",
      gtaunt: "great aunt",
      "great uncle": "great uncle",
      gtuncl: "great uncle",
      niece: "niece",
      nephew: "nephew",
      uncle: "uncle",

      // adopted
      "adopted daughter": "adopted daughter",
      "adopted dau": "adopted daughter",
      "adopted d": "adopted daughter",
      "adopted son": "adopted son",
      "adopted a": "adopted son",

      // other relationships
      apprentice: "apprentice",
      appren: "apprentice",
      assistant: "assistant",
      asstnt: "assistant",
      boarder: "boarder",
      boardr: "boarder",
      governess: "governess",
      gvrnss: "governess",
      "hired man": "hired man",
      inmate: "inmate",
      lodger: "lodger",
      maid: "maid",
      mistress: "mistress",
      mstres: "mistress",
      "nurse child": "nurse child",
      "nrs-ch": "nurse child",
      owner: "owner",
      patient: "patient",
      ptient: "patient",
      pauper: "pauper",
      prisoner: "prisoner",
      prisnr: "prisoner",
      pupil: "pupil",
      relative: "relative",
      reltiv: "relative",
      scholar: "scholar",
      servant: "servant",
      servnt: "servant",
      serv: "servant",
      slave: "slave",
      stranger: "stranger",
      strngr: "stranger",
      traveller: "traveller",
      trvelr: "traveller",
      visitor: "visitor",
      visitr: "visitor",

      "wife's daughter": "wife's daughter",
      "wife's dau": "wife's daughter",
      wifdau: "wife's daughter",
      "wife's father": "wife's father",
      "wif-fa": "wife's father",
      "wife's mother": "wife's mother",
      "wif-ma": "wife's mother",
      "wife's son": "wife's son",
      wifson: "wife's son",
      "wife's child": "wife's child",
    };

    // allows for transcription errors also (like "Mead" for head)
    const fuzzyList = [
      { standard: "head", starts: ["head", "mead"], notContains: ["master"] },

      // these more fuzzy ones should come last
      {
        standard: "daughter",
        starts: ["dau"],
        notContains: ["step", "law", "-", " "],
      },
      { standard: "step-daughter", starts: ["dau"], andContains: ["step"] },
      { standard: "step-daughter", starts: ["step"], andContains: ["dau"] },
    ];

    let lc = string.toLowerCase();

    let exactValue = exactMap[lc];
    if (exactValue) {
      return exactValue;
    }

    // From Ancestry (esp 1911 census) there can be values like:
    //  "Sister In Law (Sister-in-law)"
    //  "Sister In Law, Visitor (Visitor)"
    let commaSplit = lc.split(",");
    if (commaSplit.length > 1) {
      for (let part of commaSplit) {
        part = part.trim();
        exactValue = exactMap[part];
        if (exactValue) {
          return exactValue;
        }
      }
    }
    let parenSplit = lc.split("(");
    if (parenSplit.length > 1) {
      for (let part of parenSplit) {
        part = part.replace(")", "").trim();
        exactValue = exactMap[part];
        if (exactValue) {
          return exactValue;
        }
      }
    }

    let match = "";
    for (let fuzzy of fuzzyList) {
      if (fuzzy.starts) {
        for (let start of fuzzy.starts) {
          if (lc.startsWith(start)) {
            match = fuzzy.standard;
            break;
          }
        }
      }
      if (match && fuzzy.notContains) {
        for (let cont of fuzzy.notContains) {
          if (lc.includes(cont)) {
            match = "";
            break;
          }
        }
      }
      if (match && fuzzy.andContains) {
        let doesContainOne = false;
        for (let cont of fuzzy.andContains) {
          if (lc.includes(cont)) {
            doesContainOne = true;
            break;
          }
        }
        if (!doesContainOne) {
          match = "";
        }
      }

      if (match) {
        return match;
      }
    }

    console.log("standardizeRelationshipToHead: unrecognized: " + lc);

    return lc;
  },

  getStandardizedRelationshipMeaning(relationshipToHead) {
    const relationshipMap = {
      head: {},
      husband: { impliedGender: "male" },
      wife: { impliedGender: "female" },

      // children
      son: { impliedGender: "male" },
      daughter: { impliedGender: "female" },

      // step children
      stepson: { impliedGender: "male" },
      stepdaughter: { impliedGender: "female" },
      stepchild: {},

      "wife's son": { impliedGender: "male" },
      "wife's daughter": { impliedGender: "female" },
      "wife's child": {},

      // in-law children
      "son-in-law": { impliedGender: "male" },
      "daughter-in-law": { impliedGender: "female" },

      // grandchildren
      grandson: { impliedGender: "male" },
      granddaughter: { impliedGender: "female" },
      grandchild: {},

      // step grandchildren
      "step-grandson": { impliedGender: "male" },
      "step-granddaughter": { impliedGender: "female" },
      "step-grandchild": {},

      // parents
      father: { impliedGender: "male" },
      mother: { impliedGender: "female" },

      // in-law parents
      "father-in-law": { impliedGender: "male" },
      "mother-in-law": { impliedGender: "female" },

      "wife's father": { impliedGender: "male" },
      "wife's mother": { impliedGender: "female" },

      // step parents
      stepfather: { impliedGender: "male" },
      stepmother: { impliedGender: "female" },

      // grandparents
      grandfather: { impliedGender: "male" },
      grandmother: { impliedGender: "female" },

      // siblings
      brother: { impliedGender: "male" },
      sister: { impliedGender: "female" },

      "brother-in-law": { impliedGender: "male" },
      "sister-in-law": { impliedGender: "female" },

      "half brother": { impliedGender: "male" },
      "half sister": { impliedGender: "female" },

      stepbrother: { impliedGender: "male" },
      stepsister: { impliedGender: "female" },

      // other family
      uncle: { impliedGender: "male" },
      aunt: { impliedGender: "female" },

      cousin: {},

      "great uncle": { impliedGender: "male" },
      "great aunt": { impliedGender: "female" },

      nephew: { impliedGender: "male" },
      niece: { impliedGender: "female" },

      // other relationships
      apprentice: { nonFamily: true },
      assistant: { nonFamily: true },
      boarder: { nonFamily: true },
      lodger: { nonFamily: true },

      governess: { nonFamily: true, impliedGender: "female" },
      "hired man": { nonFamily: true, impliedGender: "male" },
      inmate: { nonFamily: true },
      mistress: { nonFamily: true, impliedGender: "female" },
      "nurse child": { nonFamily: true },
      owner: { nonFamily: true },
      patient: { nonFamily: true },
      pauper: { nonFamily: true },
      prisoner: { nonFamily: true },
      pupil: { nonFamily: true },
      relative: { nonFamily: true },
      scholar: { nonFamily: true },
      servant: { nonFamily: true },
      maid: { nonFamily: true, impliedGender: "female" },
      slave: { nonFamily: true },
      stranger: { nonFamily: true },
      traveller: { nonFamily: true },
      visitor: { nonFamily: true },
    };

    let meaning = relationshipMap[relationshipToHead];
    if (!meaning) {
      meaning = {};
    }
    return meaning;
  },

  standardizeOccupation: function (string) {
    // we could handle all the abbreviations here: https://www.freecen.org.uk/cms/information-for-transcribers/abbreviations

    if (!string || string == "-") {
      return "";
    }

    let newValue = string;

    const parenMap = {
      "em'ee": "employee",
    };

    // see if there is a value in parentheses at end
    let lastOpenParenIndex = string.lastIndexOf("(");
    if (lastOpenParenIndex != -1) {
      let closeParenIndex = string.indexOf(")", lastOpenParenIndex);
      if (closeParenIndex != -1) {
        let parenString = string.substring(lastOpenParenIndex + 1, closeParenIndex).trim();
        let remainderString = string.substring(closeParenIndex + 1).trim();
        parenString = parenString.toLowerCase();
        let match = parenMap[parenString];
        if (match) {
          newValue = string.substring(0, lastOpenParenIndex).trim();
          newValue += " (" + match + ")";
          if (remainderString) {
            newValue += " " + remainderString;
          }
        }
      }
    }

    return newValue;
  },

  inferCountyNameFromPlaceString: function (placeString) {
    //console.log("inferCountyNameFromPlaceString, placeString is : " + placeString);

    // it can be hard to get the county from the string.
    let country = undefined;
    let placeNameMinusCountry = placeString;

    let countryExtract = CD.extractCountryFromPlaceName(placeString);
    if (countryExtract) {
      country = countryExtract.country;
      placeNameMinusCountry = countryExtract.remainder;

      if (country.hasStates) {
        return "";
      }
    } else {
      return ""; // no country recognized
    }

    //console.log("inferCountyNameFromPlaceString, placeNameMinusCountry is : " + placeNameMinusCountry);

    let countyName = undefined;
    let lastCommaIndex = placeNameMinusCountry.lastIndexOf(",");
    if (lastCommaIndex != -1) {
      countyName = placeNameMinusCountry.substring(lastCommaIndex + 1).trim();
    } else {
      countyName = placeNameMinusCountry;
    }

    //console.log("inferCountyNameFromPlaceString, countyName is : " + countyName);

    if (country) {
      let stdCountyName = CD.standardizeCountyNameForCountry(countyName, country);
      //console.log("inferCountyNameFromPlaceString, stdCountyName is : " + stdCountyName);
      if (stdCountyName) {
        return stdCountyName;
      }
    }
  },

  inferStateNameFromPlaceString: function (placeString) {
    //console.log("inferStateNameFromPlaceString, placeString is : " + placeString);

    // it can be hard to get the county from the string.
    let country = undefined;
    let placeNameMinusCountry = placeString;

    let countryExtract = CD.extractCountryFromPlaceName(placeString);
    if (countryExtract) {
      country = countryExtract.country;
      placeNameMinusCountry = countryExtract.remainder;

      if (!country.hasStates) {
        return "";
      }
    } else {
      return ""; // no country recognized
    }

    //console.log("inferCountyNameFromPlaceString, placeNameMinusCountry is : " + placeNameMinusCountry);

    let stateName = undefined;
    let lastCommaIndex = placeNameMinusCountry.lastIndexOf(",");
    if (lastCommaIndex != -1) {
      stateName = placeNameMinusCountry.substring(lastCommaIndex + 1).trim();
    } else {
      stateName = placeNameMinusCountry;
    }

    //console.log("inferCountyNameFromPlaceString, countyName is : " + countyName);

    if (stateName) {
      let stdStateName = CD.standardizeStateNameForCountry(stateName, country);
      //console.log("inferCountyNameFromPlaceString, stdCountyName is : " + stdCountyName);
      if (stdStateName) {
        return stdStateName;
      }
    }
  },
};

class DateObj {
  constructor() {
    // Fields are only set if from the record/profile, methods can infer/extract
    // possible fields are:
    // dateString: the date string from the record/profile
    // yearString: a string, only set if that is what the record/profile specifies
    // quarter: a number from 1-4
    // qualifier: the dateQualifiers enum
  }

  static createFromPlainObject(obj) {
    if (!obj) {
      return undefined;
    }

    let classObj = new DateObj();
    const keys = Object.keys(obj);
    for (let key of keys) {
      if (key == "fromDate" || key == "toDate") {
        classObj[key] = DateObj.createFromPlainObject(obj[key]);
      } else {
        classObj[key] = obj[key];
      }
    }

    return classObj;
  }

  getYearString() {
    if (this.yearString) {
      return this.yearString;
    }

    if (this.dateString) {
      return GD.extractYearStringFromDateString(this.dateString);
    }
  }

  getDateString() {
    if (this.dateString) {
      return this.dateString;
    }
    if (this.yearString) {
      return this.yearString;
    }
  }

  setDateAndQualifierFromString(dateString, isYearString = false) {
    const prefixes = [
      { prefix: "about", qualifier: dateQualifiers.ABOUT },
      { prefix: "abt", qualifier: dateQualifiers.ABOUT },
      { prefix: "after", qualifier: dateQualifiers.AFTER }, // must come before aft
      { prefix: "aft", qualifier: dateQualifiers.AFTER },
      { prefix: "before", qualifier: dateQualifiers.BEFORE }, // must come before bef
      { prefix: "bef", qualifier: dateQualifiers.BEFORE },
      { prefix: "circa", qualifier: dateQualifiers.ABOUT },
    ];

    if (!dateString) {
      return;
    }

    let qualifier = dateQualifiers.NONE;
    let lcDateString = dateString.toLowerCase();

    if (lcDateString == "deceased") {
      dateString = "";
      qualifier = dateQualifiers.ABOUT;
    } else {
      for (let prefixEntry of prefixes) {
        if (lcDateString.startsWith(prefixEntry.prefix)) {
          qualifier = prefixEntry.qualifier;
          dateString = dateString.substring(prefixEntry.prefix.length).trim();
          while (dateString.startsWith(".")) {
            dateString = dateString.substring(1).trim();
          }
          break;
        }
      }
    }

    if (qualifier != dateQualifiers.NONE) {
      this.qualifier = qualifier;
    }

    if (isYearString) {
      this.yearString = dateString;
    } else {
      this.dateString = dateString;
    }
  }

  getQualifiedDateString(dateString, qualifier, preposition) {
    let prep = "";
    if (preposition) {
      prep = preposition + " ";
    }

    switch (qualifier) {
      case dateQualifiers.ABOUT:
        return prep + "about " + dateString;
      case dateQualifiers.AFTER:
        return "after " + dateString;
      case dateQualifiers.BEFORE:
        return "before " + dateString;
    }

    return prep + dateString;
  }

  getFormattedStringForCitationOrNarrative(format, highlightOption, addPreposition, prepSuffix = "") {
    let dateString = this.getDateString();

    if (!dateString) {
      return "";
    }

    let qualifier = this.qualifier;

    let parsedDate = DateUtils.parseDateString(dateString);

    //console.log("getFormattedStringForCitationOrNarrative, parsedDate is:");
    //console.log(parsedDate);

    if (!parsedDate.isValid) {
      if (addPreposition) {
        let preposition = "on";
        if (dateString.length <= 4 || /^[a-zA-Z].*$/.test(dateString)) {
          preposition = "in";
        }

        if (prepSuffix) {
          preposition += " " + prepSuffix;
        }
        return this.getQualifiedDateString(dateString, qualifier, preposition);
      } else {
        return this.getQualifiedDateString(dateString, qualifier);
      }
    }

    let newString = "";
    if (format == "short") {
      newString = DateUtils.getStdShortFormDateString(parsedDate);
    } else if (format == "long") {
      newString = DateUtils.getStdLongFormDateString(parsedDate);
    } else if (format == "theNth") {
      newString = DateUtils.getStdNthFormDateString(parsedDate);
    } else if (format == "monthComma") {
      newString = DateUtils.getUsLongFormDateString(parsedDate);
    } else if (format == "monthCommaNth") {
      newString = DateUtils.getUsNthFormDateString(parsedDate);
    } else {
      console.log("unknown date format: " + format);
      newString = DateUtils.getStdLongFormDateString(parsedDate);
    }

    newString = StringUtils.highlightString(newString, highlightOption);

    let preposition = "on";
    if (!parsedDate.hasDay) {
      preposition = "in";
    }

    if (prepSuffix) {
      preposition += " " + prepSuffix;
    }

    if (!addPreposition) {
      preposition = "";
    }

    return this.getQualifiedDateString(newString, qualifier, preposition);
  }

  getNarrativeFormat(format, highlightOption, addPreposition, prepSuffix = "") {
    return this.getFormattedStringForCitationOrNarrative(format, highlightOption, addPreposition, prepSuffix);
  }

  getDataStringFormat(addPreposition, prepSuffix = "") {
    return this.getFormattedStringForCitationOrNarrative("short", "none", addPreposition, prepSuffix);
  }
}

// NOTE: Is Location of Place the best term? All the sites (including wikitree) use "Place"
class PlaceObj {
  constructor() {
    // Fields are only set if from the record/profile, methods can infer/extract
    // possible fields are:
    // placeString: the place string from the record/profile
    // country: a string, only set if that is what the record/profile specifies
    // qualifier: the placeQualifiers enum
  }

  static createFromPlainObject(obj) {
    if (!obj) {
      return undefined;
    }

    let classObj = new PlaceObj();
    const keys = Object.keys(obj);
    for (let key of keys) {
      classObj[key] = obj[key];
    }

    return classObj;
  }

  separatePlaceIntoParts() {
    // it can be hard to get the county from the string.
    let country = undefined;
    let placeNameMinusCountry = this.placeString;

    let result = {};

    if (!placeNameMinusCountry) {
      return result;
    }

    let countryExtract = CD.extractCountryFromPlaceName(this.placeString);
    if (countryExtract) {
      country = countryExtract.country;
      placeNameMinusCountry = countryExtract.remainder;

      result.country = country.stdName;
    }

    if (country && !country.hasStates && !country.hasCounties) {
      return result;
    }

    // treat states and counties the same for now
    let placeNameMinusCounty = "";

    let possibleCountyName = undefined;
    let lastCommaIndex = placeNameMinusCountry.lastIndexOf(",");
    if (lastCommaIndex != -1) {
      possibleCountyName = placeNameMinusCountry.substring(lastCommaIndex + 1).trim();
      placeNameMinusCounty = placeNameMinusCountry.substring(0, lastCommaIndex).trim();
    } else {
      possibleCountyName = placeNameMinusCountry;
    }

    result.localPlace = placeNameMinusCountry;
    if (country) {
      let stdCountyName = "";
      if (country && country.hasStates) {
        stdCountyName = CD.standardizeStateNameForCountry(possibleCountyName, country);
      } else {
        stdCountyName = CD.standardizeCountyNameForCountry(possibleCountyName, country);
      }
      if (stdCountyName) {
        result.county = stdCountyName;
        result.localPlace = placeNameMinusCounty;
      } else if (possibleCountyName) {
        // it is possible that the county name has a comma in in like "Yorkshire, East Riding"
        let lastCommaIndex = placeNameMinusCounty.lastIndexOf(",");
        if (lastCommaIndex != -1) {
          let possibleExtraCountyName = placeNameMinusCounty.substring(lastCommaIndex + 1).trim();
          if (possibleExtraCountyName) {
            let combinedName = possibleExtraCountyName + ", " + possibleCountyName;
            if (country && country.hasStates) {
              stdCountyName = CD.standardizeStateNameForCountry(combinedName, country);
            } else {
              stdCountyName = CD.standardizeCountyNameForCountry(combinedName, country);
            }
            if (stdCountyName) {
              placeNameMinusCounty = placeNameMinusCounty.substring(0, lastCommaIndex).trim();
              result.county = stdCountyName;
              result.localPlace = placeNameMinusCounty;
            }
          }
        }
      }
    }

    return result;
  }

  inferCounty() {
    if (this.county) {
      return this.county;
    }

    if (!this.placeString) {
      return "";
    }

    return GD.inferCountyNameFromPlaceString(this.placeString);
  }

  inferTown() {
    // it can be hard to get the county from the string, the town is harder
    // this is not always going to work but can be useful if you can check it later
    let country = undefined;
    let placeNameMinusCountry = this.placeString;

    let countryExtract = CD.extractCountryFromPlaceName(this.placeString);
    if (countryExtract) {
      country = countryExtract.country;
      placeNameMinusCountry = countryExtract.remainder;

      if (country.hasStates) {
        return "";
      }
    }

    let countyName = undefined;
    let placeNameMinusCounty = undefined;
    let lastCommaIndex = placeNameMinusCountry.lastIndexOf(",");
    if (lastCommaIndex != -1) {
      countyName = placeNameMinusCountry.substring(lastCommaIndex + 1).trim();
      placeNameMinusCounty = placeNameMinusCountry.substring(0, lastCommaIndex).trim();
    } else {
      countyName = placeNameMinusCountry;
    }

    if (country) {
      let stdCountyName = CD.standardizeCountyNameForCountry(countyName, country);
      if (!stdCountyName) {
        // the county is not recognized, so it could be the twon name
        placeNameMinusCounty = placeNameMinusCountry;
      }
    }

    // best guess is that the town name is what is after the last comma in placeNameMinusCounty
    let townName = "";
    if (placeNameMinusCounty) {
      lastCommaIndex = placeNameMinusCounty.lastIndexOf(",");
      if (lastCommaIndex != -1) {
        townName = placeNameMinusCounty.substring(lastCommaIndex + 1).trim();
      } else {
        townName = placeNameMinusCounty;
      }
    }

    return townName;
  }

  getCommonPlace(otherPlace) {
    if (!otherPlace || !otherPlace.placeString) {
      return this.placeString;
    }

    if (!this.placeString) {
      return otherPlace.placeString;
    }

    if (this.placeString == otherPlace.placeString) {
      return this.placeString;
    }

    let thisCountry = CD.extractCountryFromPlaceName(this.placeString);
    let otherCountry = CD.extractCountryFromPlaceName(otherPlace.placeString);
    if (thisCountry && otherCountry) {
      if (thisCountry.country.stdName != otherCountry.country.stdName) {
        return "";
      }
    }

    let thisCounty = this.inferCounty();
    let otherCounty = otherPlace.inferCounty();
    if (thisCounty && otherCounty) {
      if (thisCounty == otherCounty) {
        let place = thisCounty;
        if (thisCountry) {
          place += ", " + thisCountry.country.stdName;
        } else if (otherCountry) {
          place += ", " + otherCountry.country.stdName;
        }
        return place;
      }
    }

    if (thisCountry) {
      return thisCountry.country.stdName;
    }
    if (otherCountry) {
      return otherCountry.country.stdName;
    }

    // would could also find the first difference in strings starting from end.
    // would only work if spaces/commas were consistent
    return "";
  }

  inferPlaceString() {
    if (this.placeString) {
      return this.placeString;
    }

    function addTerm(term) {
      if (term) {
        if (placeString) {
          placeString += ", ";
        }
        placeString += term;
      }
    }
    let placeString = "";
    addTerm(this.county);
    addTerm(this.country);
    return placeString;
  }

  inferFullPlaceString() {
    let place = this.inferPlaceString();
    let streetAddress = this.streetAddress;
    if (streetAddress && place) {
      // sometimes we have something like this (from FMP for example)
      // "placeString": "3, Brown Street, Leigh, Lancashire, England"
      // "streetAddress": "3 Brown Street"
      // e.g. : https://www.findmypast.co.uk/transcript?id=GBC/1921/RG15/18439/0547/07&expand=true
      const streetLc = streetAddress.toLowerCase().replace(/\,/g, "");
      const placeLc = place.toLowerCase().replace(/\,/g, "");
      if (!placeLc.startsWith(streetLc)) {
        place = streetAddress + ", " + place;
      }
    }

    return place;
  }

  getPreposition(isForFullPlaceIncludingStreetAddress = false, placeStringOverride = "") {
    let prepositionHint = this.prepositionHint;
    if (prepositionHint) {
      return prepositionHint;
    }

    let placeString = this.placeString;
    if (placeStringOverride) {
      placeString = placeStringOverride;
    }
    if (!placeString) {
      return "";
    }

    let lcPlaceString = placeString.toLowerCase();

    function getFirstPartOfPlaceString(string) {
      let firstPart = string;
      let firstCommaIndex = string.indexOf(",");
      if (firstCommaIndex != -1) {
        firstPart = string.substring(0, firstCommaIndex);
      }
      return firstPart;
    }

    const onEndings = [
      "street",
      "st",
      "st.",
      "road",
      "rd",
      "rd.",
      "lane",
      "ln",
      "ln.",
      "avenue",
      "ave",
      "ave.",
      "av",
      "av.",
    ];

    if (this.streetAddress && isForFullPlaceIncludingStreetAddress) {
      let preposition = "at";
      let lcStreetAddress = this.streetAddress.toLowerCase();
      let firstChar = placeString[0];
      if (firstChar >= "0" && firstChar <= "9") {
        return preposition;
      }

      let firstPartOfStreetAddress = getFirstPartOfPlaceString(lcStreetAddress);
      let wordCount = StringUtils.countWords(firstPartOfStreetAddress);
      if (wordCount > 1) {
        let lastWord = StringUtils.getLastWord(firstPartOfStreetAddress);
        if (onEndings.includes(lastWord)) {
          preposition = "on";
        }
      }

      return preposition;
    }

    let firstChar = placeString[0];
    if (firstChar >= "0" && firstChar <= "9") {
      return "at";
    } else {
      // if it is a town we want "in" but if it is a house or building then we want "at"
      // so we get last word or first part and compare it to a set of strings
      let preposition = "in";
      let firstPart = getFirstPartOfPlaceString(lcPlaceString);
      let wordCount = StringUtils.countWords(firstPart);
      if (wordCount > 1) {
        let lastWord = StringUtils.getLastWord(firstPart);
        const atEndings = [
          "workhouse",
          "house",
          "manor",
          "farm",
          "church",
          "churchyard",
          "hospital",
          "apartments",
          "apts",
          "apts.",
          "cemetery",
          "graveyard",
        ];
        if (onEndings.includes(lastWord)) {
          preposition = "on";
        } else if (atEndings.includes(lastWord)) {
          preposition = "at";
        } else if (/^\d+/.test(lastWord)) {
          // In much of Europe the house number comes after the street name
          // the last work of the first part is a number. So it could be
          // "district 15" in which case we would want to use "in" but it could be
          // "reichstrasse 125" in which case we want to use "at"
          const inPlaces = ["district", "ward", "township", "precinct", "zone"];
          let lcFirstPart = firstPart.toLowerCase();
          let parts = lcFirstPart.split(" ");
          let isLargerPlace = false;
          // note we avoid the last part which will be the number
          for (let partIndex = 0; partIndex < parts.length - 1; partIndex++) {
            let part = parts[partIndex];
            if (inPlaces.includes(part)) {
              isLargerPlace = true;
              break;
            }
          }
          if (isLargerPlace) {
            preposition = "in";
          } else {
            preposition = "at";
          }
        }
      }
      return preposition;
    }
  }
}

class NameObj {
  constructor() {
    // Note, all strings have all white space replaced with single spaces and are trimmed
    // possible fields are:
    // name : the "full" name from the record/profile
    // forenames
    // firstName
    // firstNames
    // middleName
    // middleNames
    // prefName
    // prefNames
    // nicknames
    // otherLastNames
    // lastName
  }

  static createFromPlainObject(obj) {
    if (!obj) {
      return undefined;
    }

    let classObj = new NameObj();
    const keys = Object.keys(obj);
    for (let key of keys) {
      classObj[key] = obj[key];
    }

    return classObj;
  }

  cleanName(name) {
    if (!name) {
      return name;
    }

    // For a name like "Leslie A. Baldner" we want to remove the periods -> "Leslie A Baldner"
    name = name.replace(/\s(\w)\.\s/g, " $1 ");

    // For a name like "Cecil Henry. Druce." we want to also remove the periods -> "Cecil Henry Druce"
    name = name.replace(/([^\.])\.\s/g, "$1 ");
    name = name.replace(/([^\.])\.$/g, "$1");

    name = name.replace(/\s+/g, " ");
    name = name.trim();
    return name;
  }

  removeTitle(name, isFull = false) {
    if (!name) {
      return "";
    }

    let wordCount = StringUtils.countWords(name);

    if (isFull) {
      if (wordCount < 3) {
        return name;
      }
    } else {
      if (wordCount < 2) {
        return name;
      }
    }

    let firstWord = StringUtils.getFirstWord(name);

    const titles = [
      "mr",
      "mrs",
      "miss",
      "ms",
      "mx",
      "sir",
      "dr",
      // military
      "master",
      "captain",
      "capt",
      "lieutenant",
      "lt",
      "1lt",
      "2lt",
      "sergeant",
      "sgt",
      "sg",
      "ssg",
      "ssgt",
      "tsgt",
      "msgt",
      "1sgt",
      "1sg",
      "2sgt",
      "2sg",
      "sfc",
      "gysgt",
      "cpl",
      "lcpl",
      "pfc",
      "pv2",
      "cwo",
      "spc",
      "spc2",
      "spc3",
      "spc4",
      "airman",
      "a1c",
      "a2c",
      "po1",
      "po2",
      "po3",
      "cpo",
      "admiral",
      "general",
      "ensign",
      "rfmn", // rifleman
      // religious
      "abbess",
      "abbot",
      "archbishop",
      "archdeacon",
      "bishop",
      "brother",
      "br",
      "deacon",
      "father",
      "fa",
      "fr",
      "mother",
      "novice",
      "patriarch",
      "rev",
      "reverend",
      "sister",
      "sr",
    ];

    const titlesThatAreNotPrefixes = ["mr", "mrs", "miss", "ms", "mx"];

    let lcFirstWord = firstWord.toLowerCase();
    while (lcFirstWord.endsWith(".")) {
      lcFirstWord = lcFirstWord.substring(0, lcFirstWord.length - 1);
    }
    lcFirstWord = lcFirstWord.replace(/\//g, "");

    if (titles.includes(lcFirstWord)) {
      // remove the title unless it would leave the name empty
      let remainder = StringUtils.getWordsAfterFirstWord(name);
      if (remainder) {
        if (!titlesThatAreNotPrefixes.includes(lcFirstWord)) {
          if (this.prefix) {
            if (!this.prefix.includes(firstWord)) {
              this.prefix += " " + firstWord;
            }
          } else {
            this.prefix = firstWord;
          }
        }
        return remainder;
      }
    }

    return name;
  }

  removeSuffix(name, isFull = false) {
    if (!name) {
      return "";
    }

    let wordCount = StringUtils.countWords(name);

    if (isFull) {
      if (wordCount < 3) {
        return name;
      }
    } else {
      if (wordCount < 2) {
        return name;
      }
    }

    let lastWord = StringUtils.getLastWord(name);

    const suffixes = [
      "jr",
      "sr",
      "iii",
      "bt",
      "esq",
      "kg",
      "kb",
      "gcb",
      "kcb",
      "cb",
      "gcie",
      "kcie",
      "cie",
      "gcmg",
      "kcmg",
      "cmg",
    ];

    let lcLastWord = lastWord.toLowerCase();
    while (lcLastWord.endsWith(".")) {
      lcLastWord = lcLastWord.substring(0, lcLastWord.length - 1);
    }
    lcLastWord = lcLastWord.replace(/\//g, "");

    if (suffixes.includes(lcLastWord)) {
      // remove the title unless it would leave the name empty
      let remainder = StringUtils.getWordsBeforeLastWord(name);

      // Sometime there is a trailing comma, e.g.: "Charles W Elliott, Jr
      if (remainder) {
        remainder = remainder.replace(/\,\s*$/, "");
      }

      if (remainder) {
        if (this.suffix) {
          if (!this.suffix.includes(lastWord)) {
            this.suffix = lastWord + " " + this.suffix;
          }
        } else {
          this.suffix = lastWord;
        }
        // call recursively in case there are more suffixes
        return this.removeSuffix(remainder, isFull);
      }
    }

    return name;
  }

  moveNicknamesFromNameString(nameString) {
    let newString = nameString;
    // if the nameString contain a name in quotes then it is a nickname
    let namesArray = nameString.split(/["]/);
    if (namesArray.length == 1) {
      // no double quotes - try single - but be aware that names like O'Neal could cause problems
      namesArray = nameString.split(/[']/);
      // check that there is a space before open quote and after close quote
      if (namesArray.length > 2) {
        if (!namesArray[0].endsWith(" ") || !namesArray[2].startsWith(" ")) {
          namesArray = [];
        }
      }
    }
    // to have matched quotes the length should > 2 and an odd number
    if (namesArray.length > 2 && (namesArray.length | 1) == namesArray.length) {
      let nicknames = "";
      newString = "";
      for (let index = 0; index < namesArray.length; index++) {
        let namePart = namesArray[index];
        if ((index | 1) == index) {
          // odd index - in quotes
          if (namePart) {
            if (nicknames) {
              nicknames += " ";
            }
            nicknames += namePart.trim();
          }
        } else {
          // even index - not in quotes
          if (namePart) {
            if (newString) {
              newString += " ";
            }
            newString += namePart.trim();
          }
        }
      }
      if (nicknames) {
        this.nicknames = nicknames;
        nameString = newString;
      }
    }

    return nameString;
  }

  moveNicknamesFromForenames() {
    this.forenames = this.moveNicknamesFromNameString(this.forenames);
  }

  setFullName(name) {
    if (name && isString(name)) {
      this.name = this.cleanName(name);
      this.name = this.moveNicknamesFromNameString(this.name);
      this.name = this.removeTitle(this.name, true);
      this.name = this.removeSuffix(this.name, true);
    }
  }

  setLastName(name) {
    if (name && isString(name)) {
      this.lastName = this.cleanName(name);
    }
  }

  setForenames(name) {
    if (name && isString(name)) {
      // sometimes the given names can contain "&quot;"
      name = name.replace(/\&quot\;/g, '"');

      this.forenames = this.cleanName(name);
      this.forenames = this.removeTitle(this.forenames);
      this.moveNicknamesFromForenames();
    }
  }

  setFirstName(name) {
    if (name && isString(name)) {
      this.firstName = this.cleanName(name);
      this.firstName = this.removeTitle(this.firstName);
    }
  }

  setFirstNames(name) {
    if (name && isString(name)) {
      this.firstNames = this.cleanName(name);
      this.firstNames = this.removeTitle(this.firstNames);
    }
  }

  setMiddleName(name) {
    if (name && isString(name)) {
      this.middleName = this.cleanName(name);
    }
  }

  setMiddleNames(name) {
    if (name && isString(name)) {
      this.middleNames = this.cleanName(name);
    }
  }

  setPrefix(prefix) {
    let cleanPrefix = this.cleanName(prefix);
    if (cleanPrefix) {
      this.prefix = cleanPrefix;
    }
  }

  setSuffix(suffix) {
    let cleanSuffix = this.cleanName(suffix);
    if (cleanSuffix) {
      this.suffix = cleanSuffix;
    }
  }

  separateFullNameIntoForenamesAndLastName(fullName) {
    // See https://en.wikipedia.org/wiki/List_of_family_name_affixes
    // To be better this could take country names into account
    const lastNamePrefixes = [
      " ab ",
      " ap ",
      " da ",
      " de ",
      " di ",
      " du ",
      " ibn ",
      " la ",
      " le ",
      " lu ",
      " te ",
      " ter ",
      " ten ",
      " van ",
      " van de ",
      " van den ",
      " van der ",
      " von ",
      " zu ",
    ];

    let result = {};

    let numWordsInName = StringUtils.countWords(fullName);
    if (numWordsInName > 1) {
      result.forenames = StringUtils.getWordsBeforeLastWord(fullName);
      result.lastName = StringUtils.getLastWord(fullName);
    } else {
      result.forenames = fullName;
      result.lastName = "";
    }

    if (numWordsInName > 2) {
      // it could be something like Margarete Van Wye
      let lastNameIndex = -1;
      let lcFullName = fullName.toLowerCase();
      for (let prefix of lastNamePrefixes) {
        let prefixIndex = lcFullName.indexOf(prefix);
        if (prefixIndex != -1 && prefixIndex > 0) {
          if (lastNameIndex == -1) {
            lastNameIndex = prefixIndex;
          } else if (prefixIndex < lastNameIndex) {
            lastNameIndex = prefixIndex;
          }
        }
      }

      if (lastNameIndex != -1) {
        result.forenames = fullName.substring(0, lastNameIndex).trim();
        result.lastName = fullName.substring(lastNameIndex).trim();
      }
    }

    return result;
  }

  inferFullName() {
    let fullName = "";

    if (this.name) {
      fullName = this.name;
    } else {
      if (this.middleName || this.firstName || this.middleNames || this.firstNames || this.forenames || this.lastName) {
        let name = "";
        if (this.forenames) {
          name = this.forenames;
        } else {
          if (this.firstNames) {
            name = this.firstNames;
          } else if (this.firstName) {
            name = this.firstName;
          }

          if (this.middleNames) {
            name += " " + this.middleNames;
          } else if (this.middleName) {
            name += " " + this.middleName;
          }
        }

        if (this.lastName) {
          if (name) {
            name += " ";
          }
          name += this.lastName;
        }
        fullName = name;
      }
    }

    if (fullName) {
      if (this.prefix) {
        fullName = this.prefix + " " + fullName;
      }
      if (this.suffix) {
        fullName = fullName + " " + this.suffix;
      }
    }

    return fullName;
  }

  inferLastName() {
    if (this.lastName) {
      return this.lastName;
    }
    if (this.name) {
      if (this.forenames && this.forenames == this.name) {
        return ""; // full name is just forenames, no last name known
      }
      let numWordsInName = StringUtils.countWords(this.name);
      if (numWordsInName > 1) {
        let parts = this.separateFullNameIntoForenamesAndLastName(this.name);
        if (parts && parts.lastName) {
          return parts.lastName;
        } else {
          return "";
        }
      }
      // it is a single word name. Should it be considered first or last?
      // it may depend on the country or the event type, for now we consider it a
      // first name as in a baptism like this:
      // https://www.ancestry.com/discoveryui-content/view/51567:1345
      return "";
    }
  }

  inferFirstName() {
    if (this.firstName) {
      return this.firstName;
    }
    if (this.firstNames) {
      return StringUtils.getFirstWord(this.firstNames);
    }
    if (this.forenames) {
      return StringUtils.getFirstWord(this.forenames);
    }
    if (this.name) {
      if (this.lastName && this.lastName == this.name) {
        return ""; // full name is just last name, no forenames known
      }

      let numWordsInName = StringUtils.countWords(this.name);
      if (numWordsInName > 1) {
        return StringUtils.getFirstWord(this.name);
      }
      // it is a single word name. Should it be considered first or last?
      // it may depend on the country or the event type, for now we consider it a
      // first name as in a baptism like this:
      // https://www.ancestry.com/discoveryui-content/view/51567:1345
      return this.name;
    }
  }

  inferMiddleName() {
    if (this.middleName) {
      return this.middleName;
    }
    if (this.middleNames) {
      return StringUtils.getFirstWord(this.middleNames);
    }
    if (this.forenames) {
      return StringUtils.getSecondWord(this.forenames);
    }
    if (this.name) {
      return StringUtils.getMiddleWord(this.name);
    }
  }

  inferSecondForename() {
    let result = "";

    if (this.firstNames) {
      result = StringUtils.getSecondWord(this.firstNames);
      if (result) {
        return result;
      }
    }

    if (this.forenames) {
      result = StringUtils.getSecondWord(this.forenames);
      if (result) {
        return result;
      }
    }
    if (this.middleName) {
      return this.middleName;
    }
    if (this.middleNames) {
      return StringUtils.getFirstWord(this.middleNames);
    }
    if (this.name) {
      if (this.lastName && this.lastName == this.name) {
        return ""; // full name is just last name, no forenames known
      }

      return StringUtils.getMiddleWord(this.name);
    }
  }

  inferMiddleNames() {
    if (this.middleNames) {
      return this.middleNames;
    }
    if (this.middleName) {
      return this.middleName;
    }
    if (this.forenames) {
      return StringUtils.getWordsAfterFirstWord(this.forenames);
    }
    if (this.firstNames) {
      return StringUtils.getWordsAfterFirstWord(this.firstNames);
    }
    if (this.name) {
      if (this.lastName && this.lastName == this.name) {
        return ""; // full name is just last name, no forenames known
      }
      return StringUtils.getMiddleWords(this.name);
    }
  }

  inferForenames() {
    if (this.forenames) {
      return this.forenames;
    }
    if (this.middleName || this.firstName || this.middleNames || this.firstNames) {
      let forenames = "";
      if (this.firstNames) {
        forenames = this.firstNames;
      } else if (this.firstName) {
        forenames = this.firstName;
      }
      if (this.middleNames) {
        forenames += " " + this.middleNames;
      } else if (this.middleName) {
        forenames += " " + this.middleName;
      }
      return forenames;
    }
    if (this.name) {
      if (this.lastName && this.lastName == this.name) {
        return ""; // full name is just last name, no forenames known
      }
      let numWordsInName = StringUtils.countWords(this.name);
      if (numWordsInName > 1) {
        return StringUtils.getWordsBeforeLastWord(this.name);
      }
      // it is a single word name. Should it be considered first or last?
      // it may depend on the country or the event type, for now we consider it a
      // first name as in a baptism like this:
      // https://www.ancestry.com/discoveryui-content/view/51567:1345
      return this.name;
    }
  }

  inferForenamesPlusPreferredAndNicknames(includeMiddleNames = true, includePrefName = true, includeNicknames = true) {
    let forenames = this.inferForenames();
    if (!includeMiddleNames) {
      forenames = this.inferFirstName();
    }
    let nameArray = [];
    if (forenames) {
      nameArray = forenames.split(" ");
    }

    function addName(name) {
      if (name) {
        let newNameArray = name.split(" ");
        for (let newName of newNameArray) {
          if (!nameArray.includes(newName)) {
            nameArray.push(newName);
          }
        }
      }
    }

    if (includePrefName) {
      addName(this.prefName);
      addName(this.prefNames);
    }
    if (includeNicknames) {
      addName(this.nicknames);
    }

    return nameArray.join(" ");
  }

  inferPrefix() {
    if (this.prefix) {
      return this.prefix;
    }
  }

  inferSuffix() {
    if (this.suffix) {
      return this.suffix;
    }

    if (this.lastName && this.name && !this.name.endsWith(this.lastName)) {
      // it is possible that this.name includes a suffix. But it is also possible that
      // this.name isn't in the form "last-name first-name" like this Hungarian FS profile:
      // https://www.familysearch.org/tree/person/details/GZLH-57H

      let lastNameIndex = this.name.indexOf(this.lastName);
      if (lastNameIndex != -1) {
        let textAfterLastName = this.name.substring(lastNameIndex + this.lastName.length).trim();
        if (textAfterLastName) {
          let forenames = this.inferForenames();
          if (forenames) {
            let forenamesIndex = this.name.indexOf(forenames);
            if (forenamesIndex == -1 && this.firstName) {
              forenamesIndex = this.name.indexOf(this.firstName);
            }
            if (forenamesIndex == -1 && this.firstNames) {
              forenamesIndex = this.name.indexOf(this.firstNames);
            }
            if (forenamesIndex == -1 && this.forenames) {
              forenamesIndex = this.name.indexOf(this.forenames);
            }

            if (forenamesIndex != -1 && forenamesIndex < lastNameIndex) {
              let suffix = this.name.substring(lastNameIndex + this.lastName.length).trim();
              if (suffix && !forenames.includes(suffix)) {
                return suffix;
              }
            }
          }
        }
      }
    }
  }
}

class GeneralizedData {
  constructor() {
    // NOTE: Adding a new field here will likely invalidate all generalize test data
    // so we don't actually initialize an fields here.
    // The only fields set are ones that come from the record/profile
    // Supported fields are:
    // hasValidData : not sure if we need it - used in popup to determine whether to show menu items
    // sourceOfData : must be one of the supported site names
    // sourceType: A string either "record" or "profile"
    // recordType: A string, if a record this is something like "BirthRegistration" or "Census"
    // birthDate: a DateObj object
    // deathDate: a DateObj object
    // eventDate: a DateObj object
    // residenceDate: a DateObj object
    // ageAtEvent: a string
    // ageAtDeath: a string
    // lastNameAtBirth: string
    // lastNameAtDeath: string
    // mothersMaidenName: string
    // name: NameObj object, the name from the record/profile. For a profile this would include the LNAB as lastName
    // birthPlace: a PlaceObj object
    // deathPlace: a PlaceObj object
    // eventPlace: a PlaceObj object
    // residencePlace: a PlaceObj object
    // registrationDistrict: a string
    // personGender: a lowercase string, either "male", "female" or not defined
    // parents: an object with father and mother fields
    // spouses: an array of objects
    // primaryPerson: used if role is not Primary
    //    name: a NameObj object
    //    gender
    //    birthDate: a DateObj object
    //    deathDate: a DateObj object
  }

  static createParentsFromPlainObject(parents) {
    let classParents = {};
    if (parents.father) {
      let father = parents.father;
      classParents.father = {};
      if (father.name) {
        classParents.father.name = NameObj.createFromPlainObject(father.name);
      }
      if (father.lastNameAtBirth) {
        classParents.father.lastNameAtBirth = father.lastNameAtBirth;
      }
      if (father.lastNameAtDeath) {
        classParents.father.lastNameAtDeath = father.lastNameAtDeath;
      }
    }
    if (parents.mother) {
      let mother = parents.mother;
      classParents.mother = {};
      if (mother.name) {
        classParents.mother.name = NameObj.createFromPlainObject(mother.name);
      }
      if (mother.lastNameAtBirth) {
        classParents.mother.lastNameAtBirth = mother.lastNameAtBirth;
      }
      if (mother.lastNameAtDeath) {
        classParents.mother.lastNameAtDeath = mother.lastNameAtDeath;
      }
    }
    return classParents;
  }

  static createFromPlainObject(obj) {
    if (!obj) {
      return undefined;
    }

    let classObj = new GeneralizedData();
    const keys = Object.keys(obj);
    for (let key of keys) {
      if (key == "eventDate" || key == "birthDate" || key == "deathDate" || key == "residenceDate") {
        classObj[key] = DateObj.createFromPlainObject(obj[key]);
      } else if (key == "name") {
        classObj[key] = NameObj.createFromPlainObject(obj[key]);
      } else if (key == "birthPlace" || key == "deathPlace" || key == "eventPlace" || key == "residencePlace") {
        classObj[key] = PlaceObj.createFromPlainObject(obj[key]);
      } else if (key == "parents") {
        classObj[key] = this.createParentsFromPlainObject(obj.parents);
      } else if (key == "spouses") {
        classObj[key] = [];
        for (let spouse of obj.spouses) {
          let newSpouse = {};
          if (spouse.name) {
            newSpouse.name = NameObj.createFromPlainObject(spouse.name);
          }
          if (spouse.lastNameAtBirth) {
            newSpouse.lastNameAtBirth = spouse.lastNameAtBirth;
          }
          if (spouse.lastNameAtBirth) {
            newSpouse.lastNameAtBirth = spouse.lastNameAtBirth;
          }
          if (spouse.marriageDate) {
            newSpouse.marriageDate = DateObj.createFromPlainObject(spouse.marriageDate);
          }
          if (spouse.marriagePlace) {
            newSpouse.marriagePlace = PlaceObj.createFromPlainObject(spouse.marriagePlace);
          }
          if (spouse.age) {
            newSpouse.age = spouse.age;
          }
          if (spouse.personGender) {
            newSpouse.personGender = spouse.personGender;
          }
          if (spouse.parents) {
            newSpouse.parents = this.createParentsFromPlainObject(spouse.parents);
          }
          classObj[key].push(newSpouse);
        }
      } else if (key == "primaryPerson") {
        classObj[key] = {};
        if (obj.primaryPerson.name) {
          classObj[key].name = NameObj.createFromPlainObject(obj.primaryPerson.name);
        }
        if (obj.primaryPerson.birthDate) {
          classObj[key].birthDate = DateObj.createFromPlainObject(obj.primaryPerson.birthDate);
        }
        if (obj.primaryPerson.deathDate) {
          classObj[key].deathDate = DateObj.createFromPlainObject(obj.primaryPerson.deathDate);
        }
        if (obj.primaryPerson.age) {
          classObj[key].age = obj.primaryPerson.age;
        }
        if (obj.primaryPerson.gender) {
          classObj[key].gender = obj.primaryPerson.gender;
        }
      } else if (key == "personGeneralizedData") {
        classObj[key] = GeneralizedData.createFromPlainObject(obj[key]);
      } else {
        classObj[key] = obj[key];
      }
    }

    return classObj;
  }

  static makeDateStringFromDate(date) {
    const monthStrings = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dateString = "" + date.getUTCDate() + " " + monthStrings[date.getUTCMonth()] + " " + date.getUTCFullYear();

    return dateString;
  }

  static getAgeAtDate(birthDate, otherDate) {
    let years = DateUtils.getWholeYearsBetweenDateStrings(birthDate, otherDate);
    return years;
  }

  static getSubtractAgeFromDate(dateString, age) {
    let parsedDate = DateUtils.parseDateString(dateString);
    if (!parsedDate.isValid) {
      return dateString;
    }

    parsedDate.yearNum -= age;

    return DateUtils.getStdShortFormDateString(parsedDate);
  }

  static getSubtractAgeFromDateYear(dateYear, age) {
    return dateYear - age;
  }

  extractNamePartsFromForenames(nameParts) {
    // we assume that the full name has all white space replaced with single spaces and is trimmed
    let firstSpaceIndex = nameParts.forenames.indexOf(" ");
    if (firstSpaceIndex == -1) {
      // no spaces,
      nameParts.firstName = nameParts.forenames;
      return;
    }

    nameParts.firstName = nameParts.forenames.substring(0, firstSpaceIndex);
    nameParts.middleNames = nameParts.forenames.substring(firstSpaceIndex + 1);

    firstSpaceIndex = nameParts.middleNames.indexOf(" ");
    if (firstSpaceIndex != -1) {
      // no spaces,
      nameParts.middleName = nameParts.middleNames.substring(0, firstSpaceIndex);
    } else {
      nameParts.middleName = nameParts.middleNames;
    }
  }

  extractNamePartsFromFullName(nameParts) {
    if (!nameParts.fullName) {
      return;
    }

    // we assume that the full name has all white space replaced with single spaces and is trimmed
    let lastSpaceIndex = nameParts.fullName.lastIndexOf(" ");
    if (lastSpaceIndex == -1) {
      // no spaces,
      nameParts.lastName = nameParts.fullName;
      return nameParts;
    }

    nameParts.forenames = nameParts.fullName.substring(0, lastSpaceIndex);
    nameParts.lastName = nameParts.fullName.substring(lastSpaceIndex + 1);

    this.extractNamePartsFromForenames(nameParts);

    return;
  }

  extractNamesFromForenames() {
    this.extractNamePartsFromForenames(this.name);
  }

  extractNamesFromFullName() {
    this.extractNamePartsFromFullName(this.name);
    this.eventLastName = this.lastName;
    delete this.lastName; // for the GeneralizedData itself we use eventLastName rather than lastName
  }

  createNameIfNeeded() {
    if (!this.name) {
      this.name = new NameObj();
    }
  }

  setFullName(string) {
    if (string) {
      this.createNameIfNeeded();
      this.name.setFullName(string);
    }
  }

  setLastNameAndForenames(lastName, forenames) {
    if (lastName) {
      this.createNameIfNeeded();
      this.name.setLastName(lastName);
    }
    if (forenames) {
      this.createNameIfNeeded();
      this.name.setForenames(forenames);
    }
  }

  isUsableDateString(string) {
    if (string) {
      let lcString = string.toLowerCase().trim();
      if (lcString != "unknown") {
        return true;
      }
    }
    return false;
  }

  createBirthDateIfNeeded() {
    if (!this.birthDate) {
      this.birthDate = new DateObj();
    }
  }

  setBirthDate(string) {
    if (this.isUsableDateString(string)) {
      this.createBirthDateIfNeeded();
      this.birthDate.setDateAndQualifierFromString(string);
    }
  }

  setBirthYear(string) {
    if (this.isUsableDateString(string)) {
      this.createBirthDateIfNeeded();
      this.birthDate.setDateAndQualifierFromString(string, true);
    }
  }

  setBirthQuarter(value) {
    if (typeof value !== "undefined") {
      this.createEventDateIfNeeded();
      this.birthDate.quarter = value;
    }
  }

  setBirthDateFromYearMonthDay(year, month, day) {
    let dateString = DateUtils.getDateStringFromYearMonthDay(year, month, day);

    if (dateString) {
      this.createBirthDateIfNeeded();
      this.birthDate.dateString = dateString;
    }
  }

  createBirthPlaceIfNeeded() {
    if (!this.birthPlace) {
      this.birthPlace = new PlaceObj();
    }
  }

  setBirthPlace(value) {
    if (value) {
      this.createBirthPlaceIfNeeded();
      this.birthPlace.placeString = value;
    }
  }

  createDeathDateIfNeeded() {
    if (!this.deathDate) {
      this.deathDate = new DateObj();
    }
  }

  setDeathDate(string) {
    if (this.isUsableDateString(string)) {
      this.createDeathDateIfNeeded();
      this.deathDate.setDateAndQualifierFromString(string);
    }
  }

  setDeathYear(string) {
    if (this.isUsableDateString(string)) {
      this.createDeathDateIfNeeded();
      this.deathDate.setDateAndQualifierFromString(string, true);
    }
  }

  setDeathQuarter(value) {
    if (typeof value !== "undefined") {
      this.createEventDateIfNeeded();
      this.deathDate.quarter = value;
    }
  }

  createDeathPlaceIfNeeded() {
    if (!this.deathPlace) {
      this.deathPlace = new PlaceObj();
    }
  }

  setDeathPlace(value) {
    if (value) {
      this.createDeathPlaceIfNeeded();
      this.deathPlace.placeString = value;
    }
  }

  createEventDateIfNeeded() {
    if (!this.eventDate) {
      this.eventDate = new DateObj();
    }
  }

  setEventDate(string) {
    if (this.isUsableDateString(string)) {
      this.createEventDateIfNeeded();
      this.eventDate.setDateAndQualifierFromString(string);
    }
  }

  setEventYear(string) {
    if (this.isUsableDateString(string)) {
      this.createEventDateIfNeeded();
      this.eventDate.yearString = string;
    }
  }

  setEventQuarter(value) {
    if (typeof value !== "undefined") {
      this.createEventDateIfNeeded();
      this.eventDate.quarter = value;
    }
  }

  createEventPlaceIfNeeded() {
    if (!this.eventPlace) {
      this.eventPlace = new PlaceObj();
    }
  }

  setEventPlace(value) {
    if (value) {
      this.createEventPlaceIfNeeded();
      this.eventPlace.placeString = value;
    }
  }

  setEventCountry(value) {
    if (value) {
      this.createEventPlaceIfNeeded();
      this.eventPlace.country = value;
    }
  }

  setEventCounty(value) {
    if (value) {
      this.createEventPlaceIfNeeded();
      this.eventPlace.county = value;
    }
  }

  createResidenceDateIfNeeded() {
    if (!this.residenceDate) {
      this.residenceDate = new DateObj();
    }
  }

  setResidenceDate(value) {
    if (value) {
      this.createResidenceDateIfNeeded();
      this.residenceDate.dateString = value;
    }
  }

  createResidencePlaceIfNeeded() {
    if (!this.residencePlace) {
      this.residencePlace = new PlaceObj();
    }
  }

  setResidencePlace(value) {
    if (value) {
      this.createResidencePlaceIfNeeded();
      this.residencePlace.placeString = value;
    }
  }

  setFieldIfValueExists(fieldName, value) {
    if (fieldName && value) {
      this[fieldName] = value;
    }
  }

  setPersonGender(value) {
    value = GD.standardizeGender(value);
    if (value) {
      this.personGender = value;
    }
  }

  setMaritalStatus(value) {
    value = GD.standardizeMaritalStatus(value);
    if (value) {
      this.maritalStatus = value;
    }
  }

  setRelationshipToHead(value) {
    value = GD.standardizeRelationshipToHead(value);
    if (value) {
      this.relationshipToHead = value;
    }
  }

  setOccupation(value) {
    value = GD.standardizeOccupation(value);
    if (value) {
      this.occupation = value;
    }
  }

  setAgeAtEvent(value) {
    if (value) {
      this.ageAtEvent = value;
    }
  }

  setHousehold(household) {
    if (household && household.fields && household.members) {
      this.householdArrayFields = household.fields;
      this.householdArray = household.members;

      // sometimes there are fields that are not in the table but are
      // available for the selected person
      for (let member of this.householdArray) {
        if (member.isSelected) {
          if (!member.maritalStatus && this.maritalStatus) {
            member.maritalStatus = this.maritalStatus;
          }
          if (!member.age && this.ageAtEvent) {
            member.age = this.ageAtEvent;
          }
          if (!member.relationship && this.relationshipToHead) {
            member.relationship = this.relationshipToHead;
          }
          if (!member.occupation && this.occupation) {
            member.occupation = this.occupation;
          }
          if (!member.gender && this.personGender) {
            member.gender = this.personGender;
          }
          if (!member.race && this.race) {
            member.race = this.race;
          }
          if (!member.birthPlace) {
            let birthPlace = this.inferBirthPlace();
            if (birthPlace) {
              member.birthPlace = birthPlace;
            }
          }
          break;
        }
      }
    }
  }

  setTypeSpecficDataValue(key, value) {
    if (key && value) {
      if (!this.typeSpecificData) {
        this.typeSpecificData = {};
      }
      this.typeSpecificData[key] = value;
    }
  }

  getTypeSpecficDataValue(key) {
    if (key) {
      if (this.typeSpecificData) {
        return this.typeSpecificData[key];
      }
    }
  }

  addSpouse() {
    if (this.spouses == undefined) {
      this.spouses = [];
    }

    let spouse = {};
    spouse.name = new NameObj();
    spouse.marriageDate = new DateObj();
    spouse.marriagePlace = new PlaceObj();

    this.spouses.push(spouse);

    return spouse;
  }

  addSpouseObj(spouseObj) {
    if (!spouseObj) {
      return;
    }

    if (this.spouses == undefined) {
      this.spouses = [];
    }

    this.spouses.push(spouseObj);
  }

  addMother() {
    if (this.parents == undefined) {
      this.parents = {};
    }

    if (this.parents.mother == undefined) {
      this.parents.mother = {};
    }

    if (this.parents.mother.name == undefined) {
      this.parents.mother.name = new NameObj();
    }

    return this.parents.mother;
  }

  addMotherObj(motherObj) {
    if (!motherObj) {
      return;
    }

    if (this.parents == undefined) {
      this.parents = {};
    }

    this.parents.mother = motherObj;
  }

  addMotherName(name) {
    if (name) {
      let mother = this.addMother();
      mother.name.name = name;
    }
  }

  addFather() {
    if (this.parents == undefined) {
      this.parents = {};
    }

    if (this.parents.father == undefined) {
      this.parents.father = {};
    }

    if (this.parents.father.name == undefined) {
      this.parents.father.name = new NameObj();
    }

    return this.parents.father;
  }

  addFatherObj(fatherObj) {
    if (!fatherObj) {
      return;
    }

    if (this.parents == undefined) {
      this.parents = {};
    }

    this.parents.father = fatherObj;
  }

  addFatherName(name) {
    if (name) {
      let father = this.addFather();
      father.name.name = name;
    }
  }

  addSpouseOrParentsForSelectedHouseholdMember() {
    let members = this.householdArray;
    if (!members || members.length <= 1) {
      return;
    }

    let structuredHousehold = GD.buildStructuredHousehold(this);

    // if there is more than one head or more than one wife then do nothing.
    // Example: Norway: https://www.digitalarkivet.no/en/census/person/pf01052316000238
    let headCount = 0;
    let wifeCount = 0;
    for (let member of members) {
      if (member.relationship == "head") {
        headCount++;
      } else if (member.relationship == "wife") {
        wifeCount++;
      }
    }
    if (headCount > 1 || wifeCount > 1) {
      return;
    }

    let gd = this;

    function findHouseholdMemberByRelationship(relationship) {
      for (let member of members) {
        if (member.relationship == relationship) {
          return member;
        }
      }
      return undefined;
    }

    function addParentWithRelationship(relationship, addParent) {
      let member = findHouseholdMemberByRelationship(relationship);
      if (member) {
        let parent = addParent();
        parent.name.setFullName(member.name);
      }
    }

    function addFather() {
      return gd.addFather();
    }

    function addMother() {
      return gd.addMother();
    }

    function addMarriageDate(spouse, eventDate, primaryMember, spouseMember) {
      let yearsMarried = NaN;
      if (primaryMember && primaryMember.yearsMarried) {
        yearsMarried = Number(primaryMember.yearsMarried);
      }
      if (isNaN(yearsMarried)) {
        if (spouseMember && spouseMember.yearsMarried) {
          yearsMarried = Number(spouseMember.yearsMarried);
        }
      }
      if (!isNaN(yearsMarried)) {
        let marriageDateString = GeneralizedData.getSubtractAgeFromDate(eventDate, yearsMarried);
        let marriageYear = StringUtils.getLastWord(marriageDateString);
        if (marriageYear) {
          spouse.marriageDate.yearString = marriageYear;
        }
      }
    }

    if (this.relationshipToHead) {
      if (this.relationshipToHead == "head") {
        // look for spouse
        if (!this.maritalStatus || this.maritalStatus == "married") {
          let wife = findHouseholdMemberByRelationship("wife");
          if (wife) {
            // could there be more than one member with relationship of wife?
            // seems like an error but could happen. Might be safest to check this wife member comes
            // immediately after this person.
            let thisIndex = this.householdArray.findIndex(function (element) {
              return element.isSelected;
            });
            let wifeIndex = this.householdArray.indexOf(wife);

            if (thisIndex != -1 && wifeIndex == thisIndex + 1) {
              // add a spouse
              let spouse = this.addSpouse();
              spouse.name.setFullName(wife.name);
              let head = findHouseholdMemberByRelationship("head");
              if (head) {
                addMarriageDate(spouse, this.inferEventDate(), head, wife);
              }
            }
          }
        }

        addParentWithRelationship("father", addFather);
        addParentWithRelationship("mother", addMother);
      } else if (this.relationshipToHead == "wife") {
        // look for spouse
        if (!this.maritalStatus || this.maritalStatus == "married") {
          let head = findHouseholdMemberByRelationship("head");
          if (head) {
            // could there be more than one member with relationship of head or wife?
            // seems like an error but could happen. Might be safest to check this wife member comes
            // immediately after the head person.
            let thisIndex = this.householdArray.findIndex(function (element) {
              return element.isSelected;
            });
            let headIndex = this.householdArray.indexOf(head);

            if (headIndex != -1 && thisIndex == headIndex + 1) {
              // add a spouse
              let spouse = this.addSpouse();
              spouse.name.setFullName(head.name);
              let wife = findHouseholdMemberByRelationship("wife");
              if (wife) {
                addMarriageDate(spouse, this.inferEventDate(), wife, head);
              }
            }
          }
        }

        addParentWithRelationship("father-in-law", addFather);
        addParentWithRelationship("mother-in-law", addMother);
      } else if (this.relationshipToHead == "son" || this.relationshipToHead == "daughter") {
        // we have to be careful, see https://www.findmypast.co.uk/transcript?id=GBC/1851/0016942518&expand=true
        // for an example of a daughter who is not related to the head
        // If there are any non-family members before this person in the household then don't add parents.
        // For now be super restricive. If there is any member who is not a head, wife, son or daughter
        // before the selected person then do not assume head is a parent.
        let closeFamilyRelationships = ["head", "wife", "son", "daughter"];
        let isFamilyMember = true;
        for (let member of members) {
          if (member.isSelected) {
            break;
          }
          if (!closeFamilyRelationships.includes(member.relationship)) {
            isFamilyMember = false;
            break;
          }
        }

        if (isFamilyMember) {
          let head = findHouseholdMemberByRelationship("head");
          if (head) {
            if (head.gender == "male") {
              addParentWithRelationship("head", addFather);

              let headIndex = this.householdArray.findIndex(function (element) {
                return element.relationship == "head";
              });
              let wifeIndex = this.householdArray.findIndex(function (element) {
                return element.relationship == "wife";
              });
              if (wifeIndex != -1 && wifeIndex == headIndex + 1) {
                addParentWithRelationship("wife", addMother);
              }
            } else if (head.gender == "female") {
              addParentWithRelationship("head", addMother);
            } else {
              // some census transcriptions (e.g. Ancestry) do not have the gender.
              // In household tables it digs deeper to get this.
              // We can't assume which the head is - father or mother - unless there is a wife.
              let headIndex = this.householdArray.findIndex(function (element) {
                return element.relationship == "head";
              });
              let wifeIndex = this.householdArray.findIndex(function (element) {
                return element.relationship == "wife";
              });
              if (wifeIndex != -1 && wifeIndex == headIndex + 1) {
                addParentWithRelationship("head", addFather);
                addParentWithRelationship("wife", addMother);
              }
            }
          }
        }
      } else if (this.relationshipToHead == "wife's son" || this.relationshipToHead == "wife's daughter") {
        let closeFamilyRelationships = ["head", "wife", "son", "daughter", "wife's son", "wife's daughter"];
        let isFamilyMember = true;
        for (let member of members) {
          if (member.isSelected) {
            break;
          }
          if (!closeFamilyRelationships.includes(member.relationship)) {
            isFamilyMember = false;
            break;
          }
        }

        if (isFamilyMember) {
          let head = findHouseholdMemberByRelationship("head");
          if (head && head.gender == "male") {
            let headIndex = this.householdArray.findIndex(function (element) {
              return element.relationship == "head";
            });
            let wifeIndex = this.householdArray.findIndex(function (element) {
              return element.relationship == "wife";
            });
            if (wifeIndex != -1 && wifeIndex == headIndex + 1) {
              addParentWithRelationship("wife", addMother);
            }
          }
        }
      }
    }
  }

  createPrimaryPersonIfNeeded() {
    if (!this.primaryPerson) {
      this.primaryPerson = {};
      this.primaryPerson.name = new NameObj();
    }
  }

  setPrimaryPersonFullName(string) {
    if (string) {
      this.createPrimaryPersonIfNeeded();
      this.primaryPerson.name.setFullName(string);
    }
  }

  setPrimaryPersonLastNameAndForenames(lastName, forenames) {
    if (lastName) {
      this.createPrimaryPersonIfNeeded();
      this.primaryPerson.name.setLastName(lastName);
    }
    if (forenames) {
      this.createPrimaryPersonIfNeeded();
      this.primaryPerson.name.setForenames(forenames);
    }
  }

  setPrimaryPersonGender(value) {
    value = GD.standardizeGender(value);
    if (value) {
      this.createPrimaryPersonIfNeeded();
      this.primaryPerson.gender = value;
    }
  }

  createPrimaryPersonBirthDateIfNeeded() {
    this.createPrimaryPersonIfNeeded();
    if (!this.primaryPerson.birthDate) {
      this.primaryPerson.birthDate = new DateObj();
    }
  }

  setPrimaryPersonBirthDate(string) {
    if (this.isUsableDateString(string)) {
      this.createPrimaryPersonBirthDateIfNeeded();
      this.primaryPerson.birthDate.setDateAndQualifierFromString(string);
    }
  }

  setPrimaryPersonBirthYear(string) {
    if (this.isUsableDateString(string)) {
      this.createPrimaryPersonBirthDateIfNeeded();
      this.primaryPerson.birthDate.setDateAndQualifierFromString(string, true);
    }
  }

  createPrimaryPersonDeathDateIfNeeded() {
    this.createPrimaryPersonIfNeeded();
    if (!this.primaryPerson.deathDate) {
      this.primaryPerson.deathDate = new DateObj();
    }
  }

  setPrimaryPersonDeathDate(string) {
    if (this.isUsableDateString(string)) {
      this.createPrimaryPersonDeathDateIfNeeded();
      this.primaryPerson.deathDate.setDateAndQualifierFromString(string);
    }
  }

  setPrimaryPersonDeathYear(string) {
    if (this.isUsableDateString(string)) {
      this.createPrimaryPersonDeathDateIfNeeded();
      this.primaryPerson.deathDate.setDateAndQualifierFromString(string, true);
    }
  }

  setPrimaryPersonAge(string) {
    if (string) {
      this.createPrimaryPersonIfNeeded();
      this.primaryPerson.age = string;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Infer functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // return an array of last names
  inferPersonLastNamesArray(person) {
    var lastNames = [];

    if (person.lastNameAtBirth) {
      lastNames.push(person.lastNameAtBirth);
    }
    if (person.lastNameAtDeath) {
      if (person.lastNameAtDeath != person.lastNameAtBirth) {
        lastNames.push(person.lastNameAtDeath);
      }
    }
    if (person.name) {
      let lastName = person.name.inferLastName();
      if (lastName && !lastNames.includes(lastName)) {
        lastNames.push(lastName);
      }
      let otherLastNames = person.name.otherLastNames;
      if (otherLastNames) {
        let otherLastNamesArray = otherLastNames.split(",");
        for (let otherName of otherLastNamesArray) {
          otherName = otherName.trim();
          if (otherName) {
            lastNames.push(otherName);
          }
        }
      }
    }
    if (person.spouses && person.personGender == "female") {
      for (let spouse of person.spouses) {
        if (spouse.name) {
          let lastName = spouse.name.inferLastName();
          if (lastName && !lastNames.includes(lastName)) {
            lastNames.push(lastName);
          }
        }
      }
    }

    return lastNames;
  }

  inferLastNames() {
    return this.inferPersonLastNames(this);
  }

  inferPersonLastNames(person) {
    let lastNames = "";
    let lastNamesArray = this.inferPersonLastNamesArray(person);
    if (lastNamesArray.length > 0) {
      for (let name of lastNamesArray) {
        if (lastNames != "") {
          lastNames += " ";
        }
        lastNames += name;
      }
    }
    return lastNames;
  }

  // return a string of space separated forenames
  inferForenames() {
    let forenames = "";

    if (this.name) {
      forenames = this.name.inferForenames();
    }

    return forenames;
  }

  inferFullName() {
    let fullName = "";

    if (this.name) {
      fullName = this.name.inferFullName();
    }

    return fullName;
  }

  inferFirstName() {
    let firstName = "";

    if (this.name) {
      firstName = this.name.inferFirstName();
    }

    return firstName;
  }

  inferSecondForename() {
    let secondForename = "";

    if (this.name) {
      secondForename = this.name.inferSecondForename();
    }

    return secondForename;
  }

  inferMiddleName() {
    let middleName = "";

    if (this.name) {
      middleName = this.name.inferMiddleName();
    }

    return middleName;
  }

  inferMiddleNames() {
    let middleNames = "";

    if (this.name) {
      middleNames = this.name.inferMiddleNames();
    }

    return middleNames;
  }

  inferLastName() {
    let lastName = "";

    if (this.name) {
      return this.name.inferLastName(this);
    }

    if (this.lastNameAtBirth) {
      return this.lastNameAtBirth;
    }
    if (this.lastNameAtDeath) {
      return this.lastNameAtDeath;
    }

    return lastName;
  }

  inferLastNameAtBirth() {
    if (this.lastNameAtBirth) {
      return this.lastNameAtBirth;
    }

    if (this.name) {
      return this.name.inferLastName();
    }

    return "";
  }

  inferLastNameAtDeath(options = undefined) {
    function getSpouseLnab(spouse) {
      if (spouse.lastNameAtBirth) {
        return spouse.lastNameAtBirth;
      }
      if (spouse.name) {
        return spouse.name.inferLastName();
      }
    }

    let useHusbandsLastName = true;
    if (options) {
      if (options.addMerge_general_useHusbandsLastName == "never") {
        useHusbandsLastName = false;
      } else if (options.addMerge_general_useHusbandsLastName == "countrySpecific") {
        useHusbandsLastName = false;
        let countryList = this.inferCountries();
        let numUsing = 0;
        let numNotUsing = 0;
        for (let countryName of countryList) {
          if (CD.wifeChangesName(countryName)) {
            numUsing++;
          } else {
            numNotUsing++;
          }
        }
        if (numUsing > 0 && numNotUsing == 0) {
          useHusbandsLastName = true;
        } else if (numUsing > 0) {
          let birthPlace = this.inferBirthPlace();
          if (birthPlace) {
            let country = CD.matchCountryFromPlaceName(birthPlace);
            if (country) {
              if (CD.wifeChangesName(country.stdName)) {
                useHusbandsLastName = true;
              }
            }
          }
        }
      }
    }

    // If this.lastNameAtDeath is set and is the same as this.lastNameAtBirth that might
    // indicate that the person did not change their name at marriage. The only reason we consider adjusting
    // it is that we might be coming from from a WikiTree profile where a contributor forgot
    // to change the lnab.
    if (this.lastNameAtDeath) {
      if (this.sourceOfData != "wikitree" || !useHusbandsLastName) {
        return this.lastNameAtDeath;
      }
    }

    // this is a woman and had spouses it may be that the CLN has not been set to husband's name
    let lnabAndLnadPresentAndDifferent = false;
    if (this.lastNameAtDeath && this.lastNameAtBirth && this.lastNameAtDeath != this.lastNameAtBirth) {
      lnabAndLnadPresentAndDifferent = true;
    }

    if (useHusbandsLastName && this.personGender == "female" && this.spouses && !lnabAndLnadPresentAndDifferent) {
      let lastSpouseLastName = "";
      let lastMarriageDate = undefined;
      for (let spouse of this.spouses) {
        if (spouse.marriageDate) {
          let marriageDate = spouse.marriageDate.getDateString();
          let marriageParsedDate = DateUtils.parseDateString(marriageDate);
          if (marriageParsedDate.isValid) {
            if (!lastMarriageDate) {
              lastMarriageDate = marriageParsedDate;
              lastSpouseLastName = getSpouseLnab(spouse);
            } else {
              let diff = DateUtils.getDaysBetweenParsedDates(lastMarriageDate, marriageParsedDate);
              if (diff > 0) {
                lastMarriageDate = marriageParsedDate;
                let spouseLnab = getSpouseLnab(spouse);
                if (spouseLnab) {
                  lastSpouseLastName = spouseLnab;
                } else {
                  // sometimes an Ancestry profile might have multiple marriages, some with no spouse name
                  // If this is close to last marriage ignore it as it probably refers to the same one
                  // (if could be generated from the "years married" in the 1911 census for example)
                  // Otherwise count it and set name to blank
                  if (diff > 380) {
                    lastSpouseLastName = "";
                  }
                }
              }
            }
          } else {
            if (!lastMarriageDate) {
              lastSpouseLastName = getSpouseLnab(spouse);
            }
          }
        } else {
          if (!lastMarriageDate) {
            lastSpouseLastName = getSpouseLnab(spouse);
          }
        }
      }

      if (lastSpouseLastName) {
        return lastSpouseLastName;
      }
    }

    if (this.lastNameAtDeath) {
      return this.lastNameAtDeath;
    }

    return this.inferLastName();
  }

  inferOtherLastNames(ignoreNames, options = undefined) {
    // ignoreNames must include names such as lastNameAtBirth or lastNameAtDeath

    let useHusbandsLastName = true;
    if (options) {
      if (options.addMerge_general_useHusbandsLastName == "never") {
        useHusbandsLastName = false;
      } else if (options.addMerge_general_useHusbandsLastName == "countrySpecific") {
        useHusbandsLastName = false;
        let countryList = this.inferCountries();
        let numUsing = 0;
        let numNotUsing = 0;
        for (let countryName of countryList) {
          if (CD.wifeChangesName(countryName)) {
            numUsing++;
          } else {
            numNotUsing++;
          }
        }
        if (numUsing > 0 && numNotUsing == 0) {
          useHusbandsLastName = true;
        } else if (numUsing > 0) {
          let birthPlace = this.inferBirthPlace();
          if (birthPlace) {
            let country = CD.matchCountryFromPlaceName(birthPlace);
            if (country) {
              if (CD.wifeChangesName(country.stdName)) {
                useHusbandsLastName = true;
              }
            }
          }
        }
      }
    }

    if (!useHusbandsLastName || this.personGender != "female") {
      // currently the only way we get other last names is from husbands' names
      return [];
    }

    function getSpouseLnab(spouse) {
      if (spouse.lastNameAtBirth) {
        return spouse.lastNameAtBirth;
      }
      if (spouse.name) {
        return spouse.name.inferLastName();
      }
    }

    let otherLastNames = [];

    if (this.spouses) {
      for (let spouse of this.spouses) {
        let spouseLnab = getSpouseLnab(spouse);
        if (spouseLnab) {
          if (!ignoreNames.includes(spouseLnab) && !otherLastNames.includes(spouseLnab))
            otherLastNames.push(spouseLnab);
        }
      }
    }

    return otherLastNames;
  }

  inferPrefix() {
    let prefix = "";

    if (this.name) {
      prefix = this.name.inferPrefix();
    }

    return prefix;
  }

  inferSuffix() {
    let suffix = "";

    if (this.name) {
      suffix = this.name.inferSuffix();
    }

    return suffix;
  }

  inferPersonGender() {
    if (this.personGender) {
      return this.personGender;
    }

    if (this.personGeneralizedData) {
      if (this.personGeneralizedData.personGender) {
        return this.personGeneralizedData.personGender;
      }
    }
  }

  inferBirthDateObj() {
    if (this.birthDate) {
      return this.birthDate;
    }
    if (this.deathDate) {
      if (this.ageAtDeath) {
        let deathDateString = this.deathDate.getDateString();

        let dateString = GeneralizedData.getSubtractAgeFromDate(deathDateString, this.ageAtDeath);
        let yearString = StringUtils.getLastWord(dateString);
        let dateObj = new DateObj();
        dateObj.yearString = yearString;
        dateObj.qualifier = dateQualifiers.ABOUT;
        return dateObj;
      }
    }
    if (this.eventDate && !this.role) {
      if (this.recordType == RT.BirthRegistration || this.recordType == RT.Birth) {
        return this.eventDate;
      }
    }
    if (this.eventDate && this.ageAtEvent) {
      let eventDateString = this.eventDate.getDateString();
      let dateString = GeneralizedData.getSubtractAgeFromDate(eventDateString, this.ageAtEvent);
      let yearString = StringUtils.getLastWord(dateString);
      let dateObj = new DateObj();
      dateObj.yearString = yearString;
      dateObj.qualifier = dateQualifiers.ABOUT;
      return dateObj;
    }
    if (this.eventDate && !this.role) {
      if (this.recordType == RT.Baptism) {
        let dateObj = new DateObj();
        dateObj.dateString = this.eventDate.dateString;
        dateObj.qualifier = dateQualifiers.BEFORE;
        return dateObj;
      }
    }
  }

  inferBirthYear() {
    let dateObj = this.inferBirthDateObj();
    if (dateObj) {
      return dateObj.getYearString();
    }
  }

  inferBirthDate() {
    let dateObj = this.inferBirthDateObj();
    if (dateObj) {
      return dateObj.getDateString();
    }
  }

  inferBirthDateQualifier() {
    let dateObj = this.inferBirthDateObj();
    if (dateObj) {
      return dateObj.qualifier;
    }
  }

  inferDeathDateObj() {
    if (this.deathDate) {
      return this.deathDate;
    }
    if (this.eventDate && !this.role) {
      if (this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
        return this.eventDate;
      }
      if (this.recordType == RT.Burial) {
        let dateObj = new DateObj();
        dateObj.dateString = this.eventDate.dateString;
        dateObj.qualifier = dateQualifiers.BEFORE;
        return dateObj;
      }
    }
  }

  inferDeathYear() {
    let dateObj = this.inferDeathDateObj();
    if (dateObj) {
      return dateObj.getYearString();
    }
  }

  inferDeathDate() {
    let dateObj = this.inferDeathDateObj();
    if (dateObj) {
      return dateObj.getDateString();
    }
  }

  inferDeathDateQualifier() {
    let dateObj = this.inferDeathDateObj();
    if (dateObj) {
      return dateObj.qualifier;
    }
  }

  inferBirthPlaceObj() {
    if (this.birthPlace) {
      return this.birthPlace;
    } else if (this.recordType == RT.BirthRegistration) {
      // An eventPlace can contain the county/country so is prefered to a registrationDistrict
      if (this.eventPlace) {
        return this.eventPlace;
      } else if (this.registrationDistrict) {
        let placeObj = new PlaceObj();
        placeObj.placeString = this.registrationDistrict;
        return placeObj;
      }
    } else if (this.recordType == RT.Baptism || this.recordType == RT.Birth) {
      if (this.eventPlace && !this.role) {
        return this.eventPlace;
      }
    }
  }

  inferBirthPlace() {
    let placeObj = this.inferBirthPlaceObj();
    if (placeObj) {
      return placeObj.placeString;
    }
  }

  inferBirthCounty() {
    let birthPlace = undefined;
    if (this.birthPlace) {
      birthPlace = this.birthPlace;
    } else if (
      this.recordType == RT.BirthRegistration ||
      this.recordType == RT.Baptism ||
      this.recordType == RT.Birth ||
      this.recordType == RT.BirthOrBaptism
    ) {
      if (this.eventPlace && !this.role) {
        birthPlace = this.eventPlace;
      }
    }

    if (birthPlace) {
      return birthPlace.inferCounty();
    }

    return undefined;
  }

  inferBirthCountry() {
    let placeNames = [];

    let birthPlace = this.inferBirthPlace();
    if (birthPlace) {
      placeNames.push(birthPlace);
    }

    if (
      this.recordType == RT.BirthRegistration ||
      this.recordType == RT.Birth ||
      this.recordType == RT.Baptism ||
      this.recordType == RT.BirthOrBaptism
    ) {
      let eventPlace = this.inferEventPlace();
      if (eventPlace && !this.role) {
        placeNames.push(eventPlace);
      }

      // Collection
      if (this.collectionData) {
        let collection = RC.findCollection(this.sourceOfData, this.collectionData.id);
        let country = RC.getCountryFromCollection(collection);
        if (country) {
          placeNames.push(country);
        }
      }
    }

    return this.inferCountryFromPlaceNames(placeNames);
  }

  inferDeathPlaceObj() {
    if (this.deathPlace) {
      return this.deathPlace;
    } else if (this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
      // An eventPlace can contain the county/country so is prefered to a registrationDistrict
      if (this.eventPlace && !this.role) {
        return this.eventPlace;
      } else if (this.registrationDistrict) {
        let placeObj = new PlaceObj();
        placeObj.placeString = this.registrationDistrict;
        return placeObj;
      }
    }
  }

  inferDeathPlace() {
    let placeObj = this.inferDeathPlaceObj();
    if (placeObj) {
      return placeObj.placeString;
    }
  }

  inferDeathCounty() {
    let deathPlace = undefined;
    if (this.deathPlace) {
      deathPlace = this.deathPlace;
    } else if (this.recordType == RT.DeathRegistration || this.recordType == RT.Burial || this.recordType == RT.Death) {
      if (this.eventPlace && !this.role) {
        deathPlace = this.eventPlace;
      }
    }

    if (deathPlace) {
      return deathPlace.inferCounty();
    }

    return undefined;
  }

  inferDeathCountry() {
    let placeNames = [];

    let deathPlace = this.inferDeathPlace();
    if (deathPlace) {
      placeNames.push(deathPlace);
    }

    if (this.recordType == RT.DeathRegistration || this.recordType == RT.Burial || this.recordType == RT.Death) {
      let eventPlace = this.inferEventPlace();
      if (eventPlace && !this.role) {
        placeNames.push(eventPlace);
      }

      // Collection
      if (this.collectionData) {
        let collection = RC.findCollection(this.sourceOfData, this.collectionData.id);
        let country = RC.getCountryFromCollection(collection);
        if (country) {
          placeNames.push(country);
        }
      }
    }

    return this.inferCountryFromPlaceNames(placeNames);
  }

  inferResidenceDateObj() {
    if (this.residenceDate) {
      return this.residenceDate;
    }
  }

  inferResidenceDate() {
    if (this.residenceDate) {
      return this.residenceDate.getDateString();
    }
  }

  inferResidencePlaceObj() {
    if (this.residencePlace) {
      return this.residencePlace;
    }
  }

  inferResidencePlace() {
    if (this.residencePlace) {
      return this.residencePlace.placeString;
    }
  }

  inferResidenceCounty() {
    if (this.residencePlace) {
      return this.residencePlace.inferCounty();
    }

    return undefined;
  }

  inferGeneralPlace() {
    if (this.sourceType == "record") {
      return this.inferEventPlace();
    }

    if (this.deathPlace && this.birthPlace) {
      return this.birthPlace.getCommonPlace(this.deathPlace);
    }

    if (this.birthPlace) {
      return this.birthPlace.placeString;
    }

    if (this.deathPlace) {
      return this.deathPlace.placeString;
    }

    if (this.residencePlace) {
      return this.residencePlace.placeString;
    }

    return "";
  }

  inferEventDateObj() {
    if (this.eventDate) {
      return this.eventDate;
    }
  }

  inferEventDate() {
    if (this.eventDate) {
      return this.eventDate.getDateString();
    }
  }

  inferEventYear() {
    if (this.eventDate) {
      return this.eventDate.getYearString();
    }
  }

  inferEventDateQualifier() {
    if (this.eventDate) {
      return this.eventDate.qualifier;
    }
  }

  inferEventQuarter() {
    if (this.eventDate) {
      return this.eventDate.quarter;
    }
  }

  inferEventPlaceObj() {
    if (this.eventPlace) {
      return this.eventPlace;
    }
  }

  inferEventPlace() {
    if (this.eventPlace) {
      return this.eventPlace.inferPlaceString();
    }
  }

  inferFullEventPlace() {
    if (this.eventPlace) {
      return this.eventPlace.inferFullPlaceString();
    }
  }

  inferAgeAtDeath() {
    if (this.ageAtDeath !== undefined) {
      let ageAtDeath = this.ageAtDeath;
      if (typeof ageAtDeath == "string") {
        let ageNum = parseInt(ageAtDeath);
        if (ageNum != NaN) {
          ageAtDeath = ageNum;
        } else {
          ageAtDeath = undefined;
        }
      }

      if (ageAtDeath !== undefined) {
        return ageAtDeath;
      }
    }

    let birthDateString = this.inferBirthDate();
    let deathDateString = this.inferDeathDate();

    if (birthDateString && deathDateString) {
      return GeneralizedData.getAgeAtDate(birthDateString, deathDateString);
    }

    return undefined;
  }

  inferAgeAtDeathAsString() {
    if (this.ageAtDeath !== undefined) {
      let ageAtDeath = this.ageAtDeath;
      if (typeof ageAtDeath == "string") {
        return ageAtDeath;
      }

      return ageAtDeath.toString();
    }

    let ageAtDeathNum = this.inferAgeAtDeath();
    if (ageAtDeathNum !== undefined) {
      return ageAtDeathNum.toString();
    }
    return "";
  }

  inferAgeAtEvent() {
    if (this.ageAtEvent !== undefined) {
      let ageAtEvent = this.ageAtEvent;
      if (typeof ageAtEvent == "string") {
        let ageNum = parseInt(ageAtEvent);
        if (ageNum != NaN) {
          ageAtEvent = ageNum;
        } else {
          ageAtEvent = undefined;
        }
      }

      if (ageAtEvent !== undefined) {
        return ageAtEvent;
      }
    }

    if (this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
      if (this.ageAtDeath) {
        return this.ageAtDeath;
      }

      let birthDateString = this.inferBirthDate();
      let deathDateString = this.inferDeathDate();

      if (birthDateString && deathDateString) {
        return GeneralizedData.getAgeAtDate(birthDateString, deathDateString);
      }
    }

    return undefined;
  }

  inferAgeAtEventAsString() {
    if (this.ageAtEvent !== undefined) {
      let ageAtEvent = this.ageAtEvent;
      if (typeof ageAtEvent == "string") {
        return ageAtEvent;
      }

      return ageAtEvent.toString();
    }

    let ageAtEventNum = this.inferAgeAtEvent();
    if (ageAtEventNum !== undefined) {
      return ageAtEventNum.toString();
    }
    return "";
  }

  inferPlaceNames() {
    let placeNames = [];

    let birthPlace = this.inferBirthPlace();
    if (birthPlace) {
      placeNames.push(birthPlace);
    }

    let deathPlace = this.inferDeathPlace();
    if (deathPlace) {
      placeNames.push(deathPlace);
    }

    let eventPlace = this.inferEventPlace();
    if (eventPlace) {
      placeNames.push(eventPlace);
    }

    let residencePlace = this.inferResidencePlace();
    if (residencePlace) {
      placeNames.push(residencePlace);
    }

    // Collection
    if (this.collectionData) {
      let collection = RC.findCollection(this.sourceOfData, this.collectionData.id);
      let country = RC.getCountryFromCollection(collection);
      if (country) {
        placeNames.push(country);
      }
    }

    // add marriage places
    if (this.sourceType == "profile" && this.spouses) {
      for (let spouse of this.spouses) {
        if (spouse.marriagePlace && spouse.marriagePlace.placeString) {
          placeNames.push(spouse.marriagePlace.placeString);
        }
      }
    }

    return placeNames;
  }

  inferCountries() {
    //console.log("inferCountries, this is:");
    //console.log(this);

    let placeNames = this.inferPlaceNames();

    // determine the country or countries from placeNames array
    if (placeNames.length > 0) {
      let countryArray = CD.buildCountryArrayFromPlaceArray(placeNames);
      if (countryArray) {
        return countryArray;
      }
    }

    return [];
  }

  inferCountryFromPlaceNames(placeNames) {
    // determine the country from placeNames array
    if (placeNames.length > 0) {
      let countryArray = CD.buildCountryArrayFromPlaceArray(placeNames);
      if (countryArray && countryArray.length > 0) {
        if (countryArray.length > 1) {
          //console.log("inferCountryFromPlaceNames, there are " + countryArray.length + " countries!");
          //console.log(countryArray);
        }
        return countryArray[0];
      }
    }

    return undefined;
  }

  inferCountriesFromPlaceNames(placeNames) {
    // determine the country from placeNames array
    if (placeNames.length > 0) {
      let countryArray = CD.buildCountryArrayFromPlaceArray(placeNames);
      if (countryArray && countryArray.length > 0) {
        return countryArray;
      }
    }

    return undefined;
  }

  inferEventCountry() {
    let placeNames = [];

    let eventPlace = this.inferEventPlace();
    if (eventPlace) {
      placeNames.push(eventPlace);
    }

    if (this.eventPlace) {
      let country = this.eventPlace.country;
      if (country) {
        if (!placeNames.includes(country)) {
          placeNames.push(country);
        }
      }
    }

    // Collection
    if (this.collectionData) {
      let collection = RC.findCollection(this.sourceOfData, this.collectionData.id);
      let country = RC.getCountryFromCollection(collection);
      if (country) {
        placeNames.push(country);
      }
    }

    return this.inferCountryFromPlaceNames(placeNames);
  }

  inferCounties() {
    //console.log("inferCounties, this is:");
    //console.log(this);

    let placeNames = this.inferPlaceNames();

    //console.log("inferCounties, placeNames is:");
    //console.log(placeNames);

    // determine the country or countries from placeNames array
    if (placeNames.length > 0) {
      let countyArray = [];
      for (let placeString of placeNames) {
        let countyName = GD.inferCountyNameFromPlaceString(placeString);
        //console.log("inferCounties, countyName is:");
        //console.log(countyName);

        if (countyName && !countyArray.includes(countyName)) {
          countyArray.push(countyName);
        }
      }
      if (countyArray.length > 0) {
        return countyArray;
      }
    }

    return [];
  }

  inferEventCounty() {
    let eventCounty = "";

    if (this.eventPlace) {
      eventCounty = this.eventPlace.inferCounty();
    }

    return eventCounty;
  }

  inferLastNameOnDate(targetDate, allowMultiple = false) {
    let targetParsedDate = DateUtils.parseDateString(targetDate);
    let bestMatchName = "";
    let howCloseIsBestMatch = -1;
    for (let spouse of this.spouses) {
      if (spouse.marriageDate) {
        let marriageDate = spouse.marriageDate.getDateString();
        let marriageParsedDate = DateUtils.parseDateString(marriageDate);
        let diff = DateUtils.getDaysBetweenParsedDates(marriageParsedDate, targetParsedDate);
        if (diff >= 0) {
          let howClose = diff;
          if (!bestMatchName || howClose <= howCloseIsBestMatch) {
            bestMatchName = spouse.lastNameAtBirth;
            howCloseIsBestMatch = howClose;
          }
        }
      }
    }

    if (bestMatchName) {
      return bestMatchName;
    } else if (this.lastNameAtBirth) {
      // there are some marriages and this collection seems to be before all of them
      return this.lastNameAtBirth;
    }

    if (allowMultiple) {
      return this.inferLastNames();
    }

    return this.inferLastName();
  }

  inferLastNameGivenParametersAndCollection(parameters, collection, allowMultiple = false) {
    let lastNamesArray = this.inferPersonLastNamesArray(this);
    if (lastNamesArray.length < 1) {
      return "";
    }
    if (lastNamesArray.length == 1) {
      return lastNamesArray[0];
    }

    if (parameters && lastNamesArray.length > parameters.lastNameIndex) {
      return lastNamesArray[parameters.lastNameIndex];
    }

    if (collection) {
      if (collection.isDeath && this.lastNameAtDeath) {
        return this.lastNameAtDeath;
      } else if (collection.isBirth && this.lastNameAtBirth) {
        return this.lastNameAtBirth;
      }

      if (collection.dates && (collection.dates.year || collection.dates.exactDate)) {
        // this collection is for a specific year
        if (this.personGender == "female" && this.spouses) {
          let targetDate = collection.dates.exactDate;
          if (!targetDate) {
            targetDate = collection.dates.year.toString();
          }
          return this.inferLastNameOnDate(targetDate, allowMultiple);
        }
      }
    }

    if (allowMultiple) {
      return this.inferLastNames();
    }

    return lastNamesArray[0];
  }

  inferLastNamesArrayGivenParametersAndCollection(parameters, collection) {
    let lastNamesArray = this.inferPersonLastNamesArray(this);
    if (lastNamesArray.length < 1) {
      return [];
    }
    if (lastNamesArray.length == 1) {
      return lastNamesArray;
    }

    if (parameters && lastNamesArray.length > parameters.lastNameIndex) {
      return [lastNamesArray[parameters.lastNameIndex]];
    }

    if (collection) {
      if (collection.isDeath && this.lastNameAtDeath) {
        return [this.lastNameAtDeath];
      } else if (collection.isBirth && this.lastNameAtBirth) {
        return [this.lastNameAtBirth];
      }

      if (collection.dates && (collection.dates.year || collection.dates.exactDate)) {
        // this collection is for a specific year
        if (this.personGender == "female" && this.spouses) {
          let targetDate = collection.dates.exactDate;
          if (!targetDate) {
            targetDate = collection.dates.year.toString();
          }
          let targetParsedDate = DateUtils.parseDateString(targetDate);
          let bestMatchName = "";
          let howCloseIsBestMatch = -1;
          for (let spouse of this.spouses) {
            if (spouse.marriageDate) {
              let marriageDate = spouse.marriageDate.getDateString();
              if (marriageDate) {
                let marriageParsedDate = DateUtils.parseDateString(marriageDate);
                let diff = DateUtils.getDaysBetweenParsedDates(marriageParsedDate, targetParsedDate);
                if (diff >= 0) {
                  let howClose = diff;
                  if (!bestMatchName || howClose <= howCloseIsBestMatch) {
                    bestMatchName = spouse.lastNameAtBirth;
                    howCloseIsBestMatch = howClose;
                  }
                }
              }
            }
          }

          if (bestMatchName) {
            return [bestMatchName];
          } else if (this.lastNameAtBirth) {
            // there are some marriages and this collection seems to be before all of them
            return [this.lastNameAtBirth];
          }
        }
      }
    }

    return lastNamesArray;
  }

  getRelationshipOfPrimaryPersonToThisPerson() {
    let relationship = "";
    if (this.role) {
      let primaryPersonGender = this.inferPrimaryPersonGender();
      if (this.role == Role.Parent) {
        relationship = "child";
        if (primaryPersonGender == "male") {
          relationship = "son";
        } else if (primaryPersonGender == "female") {
          relationship = "daughter";
        }
      } else if (this.role == Role.Child) {
        relationship = "parent";
        if (primaryPersonGender == "male") {
          relationship = "father";
        } else if (primaryPersonGender == "female") {
          relationship = "mother";
        }
      } else if (this.role == Role.Spouse) {
        relationship = "spouse";
        if (primaryPersonGender == "male") {
          relationship = "husband";
        } else if (primaryPersonGender == "female") {
          relationship = "wife";
        }
      } else if (this.role == Role.Sibling) {
        relationship = "sibling";
        if (primaryPersonGender == "male") {
          relationship = "brother";
        } else if (primaryPersonGender == "female") {
          relationship = "sister";
        }
      } else if (this.role == Role.Grandparent) {
        relationship = "grandchild";
        if (primaryPersonGender == "male") {
          relationship = "grandson";
        } else if (primaryPersonGender == "female") {
          relationship = "granddaughter";
        }
      } else if (this.role == Role.Grandchild) {
        relationship = "grandparent";
        if (primaryPersonGender == "male") {
          relationship = "grandfather";
        } else if (primaryPersonGender == "female") {
          relationship = "grandmother";
        }
      } else if (this.role == Role.ParentOfSpouse) {
        relationship = "in-law";
        if (primaryPersonGender == "male") {
          relationship = "son-in-law";
        } else if (primaryPersonGender == "female") {
          relationship = "daughter-in-law";
        }
      } else if (this.role == Role.SpouseOfChild) {
        relationship = "in-law";
        if (primaryPersonGender == "male") {
          relationship = "father-in-law";
        } else if (primaryPersonGender == "female") {
          relationship = "mother-in-law";
        }
      } else if (this.role == Role.Other) {
        relationship = "another person";
      } else {
        relationship = "another person";
      }
    }
    return relationship;
  }

  getRefTitle(collectionTitle, overrideTable) {
    //console.log("generalised_data_utils getRefTitle, this is:");
    //console.log(this);

    const defaultTable = [
      {
        type: undefined,
        defaultTitle: "Unclassified",
      },
      {
        type: RT.Unclassified,
        defaultTitle: "Unclassified",
      },
      {
        type: RT.BirthRegistration,
        defaultTitle: "Birth Registration",
      },
      {
        type: RT.Birth,
        defaultTitle: "Birth",
      },
      {
        type: RT.MarriageRegistration,
        defaultTitle: "Marriage Registration",
      },
      {
        type: RT.Death,
        defaultTitle: "Death",
      },
      {
        type: RT.DeathRegistration,
        defaultTitle: "Death Registration",
      },
      {
        type: RT.Baptism,
        defaultTitle: "Baptism",
      },
      {
        type: RT.Burial,
        defaultTitle: "Burial",
      },
      {
        type: RT.Certificate,
        defaultTitle: "Certificate",
      },
      {
        type: RT.Cremation,
        defaultTitle: "Cremation",
      },
      {
        type: RT.Marriage,
        defaultTitle: "Marriage",
        titleMatches: [
          { title: "Marriage Banns", matches: ["Marriage Banns"] },
          { title: "Marriage Bond", matches: ["Marriage Bond"] },
        ],
        subtypes: [{ title: "Marriage Banns", subtype: RecordSubtype.Banns }],
      },
      {
        type: RT.BirthOrBaptism,
        defaultTitle: "Birth or Baptism",
      },
      {
        type: RT.DeathOrBurial,
        defaultTitle: "Death or Burial",
      },
      {
        type: RT.Inquest,
        defaultTitle: "Inquest",
      },
      {
        type: RT.Census,
        defaultTitle: "Census",
        addYear: true,
        subtypes: [{ title: "LDS Census", subtype: RecordSubtype.LdsCensus }],
      },
      {
        type: RT.NonpopulationCensus,
        defaultTitle: "Non-population Census",
        addYear: true,
      },
      {
        type: RT.PopulationRegister,
        defaultTitle: "Population Register",
      },
      {
        type: RT.ElectoralRegister,
        defaultTitle: "Electoral Register",
        addYear: true,
        titleMatches: [{ title: "Voter Register", matches: ["Voter Register"] }],
      },
      {
        type: RT.Probate,
        defaultTitle: "Probate",
      },
      {
        type: RT.Deed,
        defaultTitle: "Deed",
      },
      {
        type: RT.Will,
        defaultTitle: "Will",
      },
      {
        type: RT.Divorce,
        defaultTitle: "Divorce",
      },
      {
        type: RT.Memorial,
        defaultTitle: "Memorial",
      },

      {
        type: RT.CriminalRegister,
        defaultTitle: "Criminal Register",
      },
      {
        type: RT.FreemasonMembership,
        defaultTitle: "Freemason Membership",
      },
      {
        type: RT.FreedomOfCity,
        defaultTitle: "Freedom of the City",
      },
      {
        type: RT.Directory,
        defaultTitle: "Directory",
        addYear: true,
      },
      {
        type: RT.Employment,
        defaultTitle: "Employment",
      },
      {
        type: RT.WorkhouseRecord,
        defaultTitle: "Workhouse Record",
      },
      {
        type: RT.CrewList,
        defaultTitle: "Crew List",
      },
      {
        type: RT.PassengerList,
        defaultTitle: "Passenger List",
      },
      {
        type: RT.ConvictTransportation,
        defaultTitle: "Convict Transportation",
      },
      {
        type: RT.Military,
        defaultTitle: "Military",
      },
      {
        type: RT.MedicalPatient,
        defaultTitle: "Medical Patient",
      },
      {
        type: RT.QuarterSession,
        defaultTitle: "Quarter Session",
      },
      {
        type: RT.LandTax,
        defaultTitle: "Land Tax",
      },
      {
        type: RT.LandGrant,
        defaultTitle: "Land Grant",
      },
      {
        type: RT.LandPetition,
        defaultTitle: "Land Petition",
      },
      {
        type: RT.MetisScrip,
        defaultTitle: "Métis Scrip",
      },
      {
        type: RT.Tax,
        defaultTitle: "Tax Record",
      },
      {
        type: RT.ValuationRoll,
        defaultTitle: "Valuation Roll",
      },
      {
        type: RT.Apprenticeship,
        defaultTitle: "Apprenticeship",
      },
      {
        type: RT.SlaveSchedule,
        defaultTitle: "Slave Schedule",
      },
      {
        type: RT.SocialSecurity,
        defaultTitle: "Social Security record",
        addYear: true,
      },
      {
        type: RT.SchoolRecords,
        defaultTitle: "School Records",
        addYear: true,
        titleMatches: [{ title: "School Yearbook", matches: ["School Yearbook"] }],
      },
      {
        type: RT.Residence,
        defaultTitle: "Residence",
      },
      {
        type: RT.Obituary,
        defaultTitle: "Obituary",
      },
      {
        type: RT.Immigration,
        defaultTitle: "Immigration",
      },
      {
        type: RT.Pension,
        defaultTitle: "Pension",
      },
      {
        type: RT.PassportApplication,
        defaultTitle: "Passport Application",
        addYear: true,
      },
      {
        type: RT.Newspaper,
        addYear: true,
        defaultTitle: "Newspaper",
      },
      {
        type: RT.LegalRecord,
        addYear: true,
        defaultTitle: "Legal Record",
      },
      {
        type: RT.RateBook,
        addYear: true,
        defaultTitle: "Rate Book",
      },
      {
        type: RT.FamHistOrPedigree,
        defaultTitle: "Family History or Pedigree",
      },
      {
        type: RT.FamilyTree,
        defaultTitle: "Family Tree",
      },
      {
        type: RT.Heraldry,
        defaultTitle: "Heraldic Record",
      },
      {
        type: RT.Bastardy,
        defaultTitle: "Bastardy Record",
      },
      {
        type: RT.OtherChurchEvent,
        defaultTitle: "Other Church Event",
        subtypes: [{ title: "Church Member Registration", subtype: RecordSubtype.MemberRegistration }],
      },
      {
        type: RT.Confirmation,
        defaultTitle: "Confirmation",
      },
      {
        type: RT.GovernmentRecord,
        defaultTitle: "Government Record",
      },
      {
        type: RT.Diary,
        defaultTitle: "Diary Entry",
      },
      {
        type: RT.Book,
        defaultTitle: "Book",
      },
      {
        type: RT.Journal,
        defaultTitle: "Journal",
      },
      {
        type: RT.Encyclopedia,
        defaultTitle: "Encyclopedia",
        sourceMatches: [{ title: "Wikipedia entry", matches: ["wikipedia"] }],
      },
    ];

    function lookup(gd, collectionTitle, table) {
      for (let obj of table) {
        if (gd.recordType == obj.type) {
          if (obj.subtypes) {
            for (let subtype of obj.subtypes) {
              if (gd.recordSubtype && gd.recordSubtype == subtype.subtype) {
                let title = subtype.title;
                // if we would like to add a year to this title
                if (obj.addYear) {
                  let year = gd.inferEventYear();
                  if (year) {
                    title = year + " " + title;
                  }
                }
                return title;
              }
            }
          }
          if (obj.titleMatches) {
            for (let titleMatch of obj.titleMatches) {
              for (let match of titleMatch.matches) {
                if (collectionTitle && collectionTitle.includes(match)) {
                  let title = titleMatch.title;
                  // if we would like to add a year to this title
                  if (obj.addYear) {
                    let year = gd.inferEventYear();
                    if (year) {
                      title = year + " " + title;
                    }
                  }
                  return title;
                }
              }
            }
          }
          if (obj.sourceMatches) {
            for (let sourceMatch of obj.sourceMatches) {
              for (let match of sourceMatch.matches) {
                if (gd.sourceOfData == match) {
                  let title = sourceMatch.title;
                  return title;
                }
              }
            }
          }
          let title = obj.defaultTitle;
          // if we would like to add a year to this title
          if (title) {
            if (obj.addYear) {
              let year = gd.inferEventYear();
              if (year) {
                title = year + " " + title;
              }
            }
            return title;
          }
        }
      }
    }

    let refTitle = undefined;

    if (this.overrideRefTitle) {
      refTitle = this.overrideRefTitle;
    }

    if (!refTitle && overrideTable) {
      refTitle = lookup(this, collectionTitle, overrideTable);
    }

    if (!refTitle) {
      refTitle = lookup(this, collectionTitle, defaultTable);
    }

    if (this.role) {
      let relationship = this.getRelationshipOfPrimaryPersonToThisPerson();
      if (refTitle == "Unclassified" || !refTitle) {
        refTitle = "Record";
      }

      refTitle += " of " + relationship;
      let primaryPersonName = this.inferPrimaryPersonFullName();
      if (primaryPersonName) {
        refTitle += " " + primaryPersonName;
      }
    } else if (refTitle == "Unclassified" || !refTitle) {
      let fullName = this.inferFullName();
      refTitle = "Record";
      if (fullName) {
        refTitle += " of " + fullName;
      }
    }

    return refTitle;
  }

  isRecordInCountry(stdCountryName) {
    let country = this.inferEventCountry();
    if (country) {
      if (country == stdCountryName || CD.isPartOf(country, stdCountryName)) {
        return true;
      }
    }

    return false;
  }

  inferParentNamesForDataString() {
    // we used to only use the forenames if the last names were the same, this can be confusing for an example
    // like: https://www.ancestry.com/discoveryui-content/view/12946595:60143
    // Where the mother has a middle name (possibly maiden name) that looks like a surname.
    // Also, user's may want to make the parent links to their profiles so a full name is better for that.

    let fatherName = "";
    let motherName = "";

    if (this.parents) {
      if (this.parents.father && this.parents.father.name) {
        fatherName = this.parents.father.name.inferFullName();
      }
      if (this.parents.mother && this.parents.mother.name) {
        motherName = this.parents.mother.name.inferFullName();
      }
    }

    return { fatherName: fatherName, motherName: motherName };
  }

  inferSpouseParentNamesForDataString(spouseObj) {
    // we used to only use the forenames if the last names were the same, this can be confusing for an example
    // like: https://www.ancestry.com/discoveryui-content/view/12946595:60143
    // Where the mother has a middle name (possibly maiden name) that looks like a surname.
    // Also, user's may want to make the parent links to their profiles so a full name is better for that.

    let fatherName = "";
    let motherName = "";

    if (spouseObj.parents) {
      if (spouseObj.parents.father && spouseObj.parents.father.name) {
        fatherName = spouseObj.parents.father.name.inferFullName();
      }
      if (spouseObj.parents.mother && spouseObj.parents.mother.name) {
        motherName = spouseObj.parents.mother.name.inferFullName();
      }
    }

    return { fatherName: fatherName, motherName: motherName };
  }

  inferParentForenamesAndLastName() {
    let fatherForenames = "";
    let fatherLastName = "";
    let motherForenames = "";
    let motherLastName = "";

    if (this.parents) {
      if (this.parents.father && this.parents.father.name) {
        fatherForenames = this.parents.father.name.inferForenames();
        fatherLastName = this.parents.father.name.inferLastName();
      }
      if (this.parents.mother && this.parents.mother.name) {
        motherForenames = this.parents.mother.name.inferForenames();
        motherLastName = this.parents.mother.name.inferLastName();
      }
    }

    if (!motherLastName && this.mothersMaidenName) {
      motherLastName = this.mothersMaidenName;
    }

    return {
      fatherForenames: fatherForenames,
      fatherLastName: fatherLastName,
      motherForenames: motherForenames,
      motherLastName: motherLastName,
    };
  }

  setDatesUsingQualifierAndYearNum(dates, yearNum, dateQualifier) {
    if (!yearNum) {
      return;
    }

    var fromYear = yearNum;
    var toYear = yearNum;

    switch (dateQualifier) {
      case dateQualifiers.NONE:
        fromYear = yearNum - 2;
        toYear = yearNum + 2;
        break;
      case dateQualifiers.EXACT:
        fromYear = yearNum;
        toYear = yearNum;
        break;
      case dateQualifiers.ABOUT:
        fromYear = yearNum - 5;
        toYear = yearNum + 5;
        break;
      case dateQualifiers.BEFORE:
        fromYear = yearNum - 5;
        toYear = yearNum;
        break;
      case dateQualifiers.AFTER:
        fromYear = yearNum;
        toYear = yearNum + 5;
        break;
    }

    // add an extra 1 year either side because the target records that we are searching for
    // can have inaccuracies
    fromYear = fromYear - 1;
    toYear = toYear + 1;

    dates.startYear = fromYear;
    dates.endYear = toYear;
  }

  setDatesUsingQualifier(dates, yearString, dateQualifier) {
    if (!yearString || yearString == "") {
      return;
    }

    let yearNum = DateUtils.getYearNumFromYearString(yearString);
    if (!yearNum) {
      return;
    }

    var fromYear = yearNum;
    var toYear = yearNum;

    switch (dateQualifier) {
      case dateQualifiers.NONE:
        fromYear = yearNum - 2;
        toYear = yearNum + 2;
        break;
      case dateQualifiers.EXACT:
        fromYear = yearNum;
        toYear = yearNum;
        break;
      case dateQualifiers.ABOUT:
        fromYear = yearNum - 5;
        toYear = yearNum + 5;
        break;
      case dateQualifiers.BEFORE:
        fromYear = yearNum - 5;
        toYear = yearNum;
        break;
      case dateQualifiers.AFTER:
        fromYear = yearNum;
        toYear = yearNum + 5;
        break;
    }

    // add an extra 1 year either side because the target records that we are searching for
    // can have inaccuracies
    fromYear = fromYear - 1;
    toYear = toYear + 1;

    dates.startYear = fromYear;
    dates.endYear = toYear;
  }

  couldPersonHaveBeenBornInDateRange(startYear, endYear, maxLifeSpan = possibleLifeSpan) {
    if (!startYear) {
      startYear = 0;
    }
    if (!endYear) {
      endYear = 3000;
    }

    let birthYearNum = DateUtils.getYearNumFromYearString(this.inferBirthYear());
    if (birthYearNum) {
      return birthYearNum >= startYear && birthYearNum <= endYear;
    }

    let deathYearNum = DateUtils.getYearNumFromYearString(this.inferDeathYear());
    if (deathYearNum) {
      let lastestBirthYearNum = deathYearNum;
      let earliestBirthYearNum = deathYearNum - maxLifeSpan;
      return lastestBirthYearNum >= startYear && earliestBirthYearNum <= endYear;
    }

    let eventYearNum = DateUtils.getYearNumFromYearString(this.inferEventYear());
    if (eventYearNum) {
      let lastestBirthYearNum = eventYearNum + maxLifeSpan;
      let earliestBirthYearNum = eventYearNum - maxLifeSpan;
      return lastestBirthYearNum >= startYear && earliestBirthYearNum <= endYear;
    }

    return true; // if we don't know the birth year then it could be in range
  }

  couldPersonHaveMarriedInDateRange(startYear, endYear, maxLifeSpan = possibleLifeSpan) {
    if (!startYear) {
      startYear = 0;
    }
    if (!endYear) {
      endYear = 3000;
    }

    let birthYearNum = DateUtils.getYearNumFromYearString(this.inferBirthYear());
    let deathYearNum = DateUtils.getYearNumFromYearString(this.inferDeathYear());
    let ageAtDeath = this.inferAgeAtDeath();

    //console.log("couldPersonHaveMarriedInDateRange: birthYearNum is: " + birthYearNum + ", deathYearNum is: " + deathYearNum);
    //console.log("couldPersonHaveMarriedInDateRange: ageAtDeath is: " + ageAtDeath);
    //console.log("couldPersonHaveMarriedInDateRange: startYear is: " + startYear + ", endYear is: " + endYear);

    if (ageAtDeath && ageAtDeath < 14) {
      //console.log("couldPersonHaveMarriedInDateRange: ageAtDeath < 14");
      return false;
    }

    if (birthYearNum && deathYearNum) {
      return deathYearNum >= startYear + 16 && birthYearNum <= endYear - 16;
    } else if (birthYearNum) {
      return birthYearNum <= endYear - 16;
    } else if (deathYearNum) {
      return deathYearNum >= startYear + 16;
    }

    let eventYearNum = DateUtils.getYearNumFromYearString(this.inferEventYear());
    //console.log("couldPersonHaveMarriedInDateRange: eventYearNum is: " + eventYearNum);

    if (eventYearNum) {
      let lastestDeathYearNum = eventYearNum + maxLifeSpan;
      let earliestBirthYearNum = eventYearNum - maxLifeSpan;
      return lastestDeathYearNum >= startYear && earliestBirthYearNum <= endYear;
    }

    return true; // if we don't know the birth or death year then it could be in range
  }

  couldPersonHaveDiedInDateRange(startYear, endYear, maxLifespan = possibleLifeSpan) {
    if (!startYear) {
      startYear = 0;
    }
    if (!endYear) {
      endYear = 3000;
    }

    let deathYearNum = DateUtils.getYearNumFromYearString(this.inferDeathYear());
    if (deathYearNum) {
      return deathYearNum >= startYear && deathYearNum <= endYear;
    }

    let birthYearNum = DateUtils.getYearNumFromYearString(this.inferBirthYear());
    if (birthYearNum) {
      let lastestDeathYearNum = birthYearNum + maxLifespan;
      let earliestDeathYearNum = birthYearNum;
      return lastestDeathYearNum >= startYear && earliestDeathYearNum <= endYear;
    }

    let eventYearNum = DateUtils.getYearNumFromYearString(this.inferEventYear());
    if (eventYearNum) {
      let lastestDeathYearNum = eventYearNum + maxLifespan;
      let earliestDeathYearNum = eventYearNum - maxLifespan;
      return lastestDeathYearNum >= startYear && earliestDeathYearNum <= endYear;
    }

    return true; // if we don't know the death year then it could be in range
  }

  couldPersonHaveLivedInDateRange(startYear, endYear, maxLifespan = possibleLifeSpan) {
    if (!startYear) {
      startYear = 0;
    }
    if (!endYear) {
      endYear = 3000;
    }

    let birthYearNum = DateUtils.getYearNumFromYearString(this.inferBirthYear());
    let deathYearNum = DateUtils.getYearNumFromYearString(this.inferDeathYear());

    //console.log("couldPersonHaveLivedInDateRange: birthYearNum is: " + birthYearNum + ", deathYearNum is: " + deathYearNum);
    //console.log("couldPersonHaveLivedInDateRange: startYear is: " + startYear + ", endYear is: " + endYear);

    if (birthYearNum && deathYearNum) {
      return deathYearNum >= startYear && birthYearNum <= endYear;
    } else if (birthYearNum) {
      return birthYearNum <= endYear;
    } else if (deathYearNum) {
      return deathYearNum >= startYear;
    }

    let eventYearNum = DateUtils.getYearNumFromYearString(this.inferEventYear());
    //console.log("couldPersonHaveLivedInDateRange: eventYearNum is: " + eventYearNum);

    if (eventYearNum) {
      let lastestDeathYearNum = eventYearNum + maxLifespan;
      let earliestBirthYearNum = eventYearNum - maxLifespan;
      return lastestDeathYearNum >= startYear && earliestBirthYearNum <= endYear;
    }

    return true; // if we don't know the birth or death year then it could be in range
  }

  inferPossibleLifeYearRange(maxLifespan = possibleLifeSpan, runDate = undefined, exactness = 0) {
    let birthYear = this.inferBirthYear();
    let deathYear = this.inferDeathYear();
    let eventYear = this.inferEventYear();

    let currentDate = new Date();
    if (runDate) {
      currentDate = new Date(runDate);
    }
    let currentYear = currentDate.getFullYear();

    let birthYearNum = DateUtils.getYearNumFromYearString(birthYear);
    let deathYearNum = DateUtils.getYearNumFromYearString(deathYear);
    let eventYearNum = DateUtils.getYearNumFromYearString(eventYear);

    let startYearNum = 0;
    let endYearNum = 0;

    if (birthYearNum) {
      startYearNum = birthYearNum;

      if (deathYearNum) {
        endYearNum = deathYearNum;
      } else {
        endYearNum = birthYearNum + maxLifespan;
      }
    } else if (deathYearNum && deathYearNum > maxLifespan) {
      startYearNum = deathYearNum - maxLifespan;
      endYearNum = deathYearNum;
    } else if (eventYearNum) {
      startYearNum = eventYearNum - maxLifespan;
      endYearNum = eventYearNum + maxLifespan;
    }

    if (startYearNum) {
      startYearNum -= exactness;
    }

    if (endYearNum) {
      endYearNum += exactness;
    }

    if (endYearNum > currentYear) {
      endYearNum = currentYear;
    }

    let range = {
      startYear: startYearNum,
      endYear: endYearNum,
    };

    return range;
  }

  inferPrimaryPersonFullName() {
    let fullName = "";

    if (this.primaryPerson && this.primaryPerson.name) {
      fullName = this.primaryPerson.name.inferFullName();
    }

    return fullName;
  }

  inferPrimaryPersonGender() {
    let gender = "";

    if (this.primaryPerson && this.primaryPerson.gender) {
      gender = this.primaryPerson.gender;
    }

    return gender;
  }

  inferPrimaryPersonBirthDate() {
    let date = "";
    if (this.primaryPerson && this.primaryPerson.birthDate) {
      date = this.primaryPerson.birthDate.getDateString();
    }
    return date;
  }

  inferPrimaryPersonBirthDateObj() {
    let date = undefined;
    if (this.primaryPerson && this.primaryPerson.birthDate) {
      date = this.primaryPerson.birthDate;
    }
    return date;
  }

  inferPrimaryPersonDeathDate() {
    let date = "";
    if (this.primaryPerson && this.primaryPerson.deathDate) {
      date = this.primaryPerson.deathDate.getDateString();
    }
    return date;
  }

  inferPrimaryPersonDeathDateObj() {
    let date = undefined;
    if (this.primaryPerson && this.primaryPerson.deathDate) {
      date = this.primaryPerson.deathDate;
    }
    return date;
  }

  inferPrimaryPersonAge() {
    let age = "";
    if (this.primaryPerson && this.primaryPerson.age) {
      age = this.primaryPerson.age;
    }
    return age;
  }

  didPersonLiveInCountryList(searchCountryArray, treatNoCountryAsAllCountries = true) {
    let countryArray = this.inferCountries();

    //console.log("didPersonLiveInCountryList: searchCountryArray is: ");
    //console.log(searchCountryArray);
    //console.log("didPersonLiveInCountryList: countryArray is: ");
    //console.log(countryArray);

    if (countryArray.length > 0) {
      for (let country of countryArray) {
        for (let searchCountry of searchCountryArray) {
          if (country == searchCountry || CD.isPartOf(country, searchCountry)) {
            return true;
          }
        }
      }
    } else {
      // we have no country information for the person so they could have lived anywhere
      //console.log("didPersonLiveInCountryList: no countries, returning true");
      return treatNoCountryAsAllCountries;
    }

    return false;
  }

  getTermForUnmarried() {
    let term = "single";
    if (this.isRecordInCountry("United Kingdom")) {
      let eventYear = this.inferEventYear();
      let yearNum = parseInt(eventYear);
      if (!isNaN(yearNum) && yearNum < 1891) {
        // In UK the term Unmarried was used until it was replace with single in 1891
        term = "unmarried";
      }
    } else if (this.isRecordInCountry("United States")) {
      let eventYear = this.inferEventYear();
      let yearNum = parseInt(eventYear);
      if (!isNaN(yearNum) && yearNum == 1950) {
        // In US 1950 census the term Nev (for Never Married) was used (as was "Separated")
        term = "never married";
      }
    }
    return term;
  }

  hasHouseholdTable() {
    let fieldNames = this.householdArrayFields;
    let objectArray = this.householdArray;

    if (fieldNames && objectArray) {
      return true;
    }

    return false;
  }

  getNarrativeDateFormat(dateObj, format, highlightOption, addPreposition, prepSuffix = "") {
    let newFormat = format;
    if (format == "country" || format == "countryNth") {
      let countryArray = this.inferCountries();
      if (countryArray.length == 1 && countryArray[0] == "United States") {
        if (format == "country") {
          newFormat = "monthComma";
        } else {
          newFormat = "monthCommaNth";
        }
      } else {
        if (format == "country") {
          newFormat = "long";
        } else {
          newFormat = "theNth";
        }
      }
    }

    return dateObj.getNarrativeFormat(newFormat, highlightOption, addPreposition, prepSuffix);
  }
}

export { GeneralizedData, GD, NameObj, DateObj, PlaceObj, dateQualifiers, RT };
