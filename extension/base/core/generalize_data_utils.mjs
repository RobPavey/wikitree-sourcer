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
    return "";
  },

  standardizeMaritalStatus: function (string) {
    if (!string) {
      return "";
    }
    let lc = string.toLowerCase();
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
    // Note that "-" is turned into "", this is typical on some site for young children
    return "";
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
      mistress: "mistress",
      mstres: "mistress",
      "nurse child": "nurse child",
      "nrs-ch": "nurse child",
      owner: "owner",
      patient: "patient",
      ptient: "patient",
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
      "wife's mother": "wife's mother",
      "wif-ma": "wife's mother",
      "wife's son": "wife's son",
      wifson: "wife's son",
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
      classObj[key] = obj[key];
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

  setDateAndQualifierFromString(dateString, isYearString) {
    const prefixes = [
      { prefix: "about", qualifier: dateQualifiers.ABOUT },
      { prefix: "abt", qualifier: dateQualifiers.ABOUT },
      { prefix: "after", qualifier: dateQualifiers.AFTER }, // must come before aft
      { prefix: "aft", qualifier: dateQualifiers.AFTER },
      { prefix: "before", qualifier: dateQualifiers.BEFORE }, // must come before bef
      { prefix: "bef", qualifier: dateQualifiers.BEFORE },
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
    let qualifier = this.qualifier;

    let parsedDate = DateUtils.parseDateString(dateString);
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

      if (country.hasStates) {
        return result;
      }

      result.country = country.stdName;
    }

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
      let stdCountyName = CD.standardizeCountyNameForCountry(possibleCountyName, country);
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
            stdCountyName = CD.standardizeCountyNameForCountry(combinedName, country);
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
        }
        if (otherCountry) {
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
    // remove any '.' characters in name
    name = name.replace(/\./g, "");
    name = name.replace(/\s+/g, " ");
    name = name.trim();
    return name;
  }

  removeTitle(name, isFull = false) {
    if (!name) {
      return 0;
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

    const titles = ["mr", "mrs", "miss", "ms", "mx"];
    let lcFirstWord = firstWord.toLowerCase();
    if (titles.includes(lcFirstWord)) {
      // remove the title
      return StringUtils.getWordsAfterFirstWord(name);
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
    if (name) {
      this.name = this.cleanName(name);
      this.name = this.moveNicknamesFromNameString(this.name);
      this.name = this.removeTitle(this.name, true);
    }
  }

  setLastName(name) {
    if (name) {
      this.lastName = this.cleanName(name);
    }
  }

  setForenames(name) {
    if (name) {
      // sometimes the given names can contain "&quot;"
      name = name.replace(/\&quot\;/g, '"');

      this.forenames = this.cleanName(name);
      this.forenames = this.removeTitle(this.forenames);
      this.moveNicknamesFromForenames();
    }
  }

  setFirstName(name) {
    if (name) {
      this.firstName = this.cleanName(name);
      this.firstName = this.removeTitle(this.firstName);
    }
  }

  setFirstNames(name) {
    if (name) {
      this.firstNames = this.cleanName(name);
      this.firstNames = this.removeTitle(this.firstNames);
    }
  }

  setMiddleName(name) {
    if (name) {
      this.middleName = this.cleanName(name);
    }
  }

  setMiddleNames(name) {
    if (name) {
      this.middleNames = this.cleanName(name);
    }
  }

  getMiddleName() {
    if (this.middleName) {
      return this.middleName;
    }
    if (this.middleNames) {
      return StringUtils.getFirstWord(this.middleNames);
    }
    if (this.forenames) {
      let middleNames = StringUtils.getWordsAfterFirstWord(this.forenames);
      if (middleNames) {
        return StringUtils.getFirstWord(middleNames);
      }
    }
    if (this.name) {
      let forenames = StringUtils.getWordsBeforeLastWord(this.name);
      if (forenames) {
        let middleNames = StringUtils.getWordsAfterFirstWord(forenames);
        if (middleNames) {
          return StringUtils.getFirstWord(middleNames);
        }
      }
    }
  }

  inferFullName() {
    if (this.name) {
      return this.name;
    }

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
      return name;
    }
  }

  inferLastName() {
    if (this.lastName) {
      return this.lastName;
    }
    if (this.name) {
      if (this.forenames && this.forenames == this.name) {
        return ""; // full name is just forenames, no last name known
      }
      return StringUtils.getLastWord(this.name);
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
      return StringUtils.getFirstWord(this.name);
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
      return StringUtils.getWordsBeforeLastWord(this.name);
    }
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
      let index = this.name.indexOf(this.lastName);
      if (index != -1) {
        return this.name.substring(index + this.lastName.length).trim();
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
    // personGender: a lowerface string, either "male", "female" or not defined
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
      if (key == "eventDate" || key == "birthDate" || key == "deathDate") {
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
      return this.name.inferLastName();
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

  inferLastNameAtDeath() {
    function getSpouseLnab(spouse) {
      if (spouse.lastNameAtBirth) {
        return spouse.lastNameAtBirth;
      }
      if (spouse.name) {
        return spouse.name.inferLastName();
      }
    }

    // this is a woman and had spouses it may be that the CLN has not been set to husband's name
    let lnabAndLnadPresentAndDifferent = false;
    if (this.lastNameAtDeath && this.lastNameAtBirth && this.lastNameAtDeath != this.lastNameAtBirth) {
      lnabAndLnadPresentAndDifferent = true;
    }

    if (this.personGender == "female" && this.spouses && !lnabAndLnadPresentAndDifferent) {
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
                  // If this is close to last marriage ignore it as it probably referes to the same one
                  // (if could be generated from the "years married" in the 1911 census for example)
                  // Otherwise count it and set name to blank
                  if (diff > 380) {
                    lastSpouseLastName = "";
                  }
                }
              }
            }
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

  inferBirthPlace() {
    if (this.birthPlace) {
      return this.birthPlace.placeString;
    } else if (this.recordType == RT.BirthRegistration) {
      // An eventPlace can contain the county/country so is prefered to a registrationDistrict
      if (this.eventPlace) {
        return this.eventPlace.placeString;
      } else if (this.registrationDistrict) {
        return this.registrationDistrict;
      }
    } else if (this.recordType == RT.Baptism || this.recordType == RT.Birth) {
      if (this.eventPlace && !this.role) {
        return this.eventPlace.placeString;
      }
    }
  }

  inferBirthCounty() {
    let birthPlace = undefined;
    if (this.birthPlace) {
      birthPlace = this.birthPlace;
    } else if (
      this.recordType == RT.BirthRegistration ||
      this.recordType == RT.Baptism ||
      this.recordType == RT.Birth
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

  inferDeathPlace() {
    if (this.deathPlace) {
      return this.deathPlace.placeString;
    } else if (this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
      // An eventPlace can contain the county/country so is prefered to a registrationDistrict
      if (this.eventPlace && !this.role) {
        return this.eventPlace.placeString;
      } else if (this.registrationDistrict) {
        return this.registrationDistrict;
      }
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

  inferEventPlace() {
    if (this.eventPlace) {
      return this.eventPlace.placeString;
    }
  }

  inferFullEventPlace() {
    if (this.eventPlace) {
      let place = this.eventPlace.placeString;
      let streetAddress = this.eventPlace.streetAddress;
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
  }

  inferAgeAtDeath() {
    if (this.ageAtDeath) {
      return this.ageAtDeath;
    }

    let birthDateString = this.inferBirthDate();
    let deathDateString = this.inferDeathDate();

    if (birthDateString && deathDateString) {
      return GeneralizedData.getAgeAtDate(birthDateString, deathDateString);
    }

    return undefined;
  }

  inferAgeAtEvent() {
    if (this.ageAtEvent) {
      return this.ageAtEvent;
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
        type: RT.Census,
        defaultTitle: "Census",
        addYear: true,
      },
      {
        type: RT.NonpopulationCensus,
        defaultTitle: "Non-population Census",
        addYear: true,
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
        type: RT.SocialSecurity,
        defaultTitle: "Social Security",
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

  inferPossibleLifeYearRange(maxLifespan = possibleLifeSpan) {
    let birthYear = this.inferBirthYear();
    let deathYear = this.inferDeathYear();
    let eventYear = this.inferEventYear();

    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    let birthYearNum = DateUtils.getYearNumFromYearString(birthYear);
    let deathYearNum = DateUtils.getYearNumFromYearString(deathYear);
    let eventYearNum = DateUtils.getYearNumFromYearString(eventYear);

    let range = {
      startYear: undefined,
      endYear: undefined,
    };

    if (birthYearNum) {
      range.startYear = birthYearNum;

      if (deathYearNum) {
        range.endYear = deathYearNum;
      } else {
        range.endYear = birthYearNum + maxLifespan;
      }
    } else if (deathYearNum && deathYearNum > maxLifespan) {
      range.startYear = deathYearNum - maxLifespan;
      range.endYear = deathYearNum;
    } else if (eventYearNum) {
      range.startYear = eventYearNum - maxLifespan;
      range.endYear = eventYearNum + maxLifespan;
    }

    if (range.endYear > currentYear) {
      range.endYear = currentYear;
    }

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

  didPersonLiveInCountryList(searchCountryArray) {
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
