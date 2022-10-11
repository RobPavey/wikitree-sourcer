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

import { RT, RecordSubtype } from "./record_type.mjs";
import { GeneralizedData, WtsDate } from "./generalize_data_utils.mjs";
import { Role } from "./record_type.mjs";
import { WTS_String } from "./wts_string.mjs";
import { WTS_Date } from "./wts_date.mjs";
import {
  getChildTerm,
  getPrimaryPersonChildTerm,
  getPrimaryPersonSpouseTerm,
} from "./narrative_or_sentence_utils.mjs";
import { RC } from "./record_collections.mjs";

class NarrativeBuilder {
  constructor(options) {
    this.options = options;

    this.recordType = RT.Unclassified;

    this.eventDate = "";
    this.eventPlace = "";
  }

  getOptions() {
    return this.options;
  }

  getSubcatOption(leafOptionName, subsectionOverride) {
    let value = undefined;
    if (this.optionsSubcategory) {
      let subsection = subsectionOverride;
      if (!subsection) {
        subsection = this.optionsSubsection;
      }
      if (subsection) {
        value =
          this.options[
            "narrative_" +
              this.optionsSubcategory +
              subsection +
              "_" +
              leafOptionName
          ];
      }
      if (value == undefined) {
        value =
          this.options[
            "narrative_" + this.optionsSubcategory + "_" + leafOptionName
          ];
      }
    }
    if (value == undefined || value == "default") {
      value = this.options["narrative_general_" + leafOptionName];
    }
    return value;
  }

  getCollection() {
    let gd = this.eventGd;
    let collection = undefined;
    if (gd.collectionData && gd.collectionData.id) {
      collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);
    }
    return collection;
  }

  getNarrativeAgeString(ageString) {
    let result = "";
    if (ageString) {
      result = ageString.replace(/years?/i, "").trim();
      if (/^\d+\/12$/.test(result)) {
        result = result.replace(/\/12/, "").trim();
        if (result == "1") {
          result += " month";
        } else {
          result += " months";
        }
      }
    }
    return result;
  }

  improveAndAbbreviatePlaceString(placeString) {
    let gd = this.eventGd;
    let options = this.options;

    const countryStrings = [
      [", England", ", England, United Kingdom"],
      [", Wales", ", Wales, United Kingdom"],
      [", Scotland", ", Scotland, United Kingdom"],
      [
        ", Jersey",
        ", Jersey, United Kingdom",
        ", Jersey, Channel Islands",
        ", Jersey, Channel Islands, United Kingdom",
      ],
      [
        ", Guernsey",
        ", Guernsey, United Kingdom",
        ", Guernsey, Channel Islands",
        ", Guernsey, Channel Islands, United Kingdom",
      ],
      [", United Kingdom", "UK"], // must come after the above countires that make up the UK
      [", Ireland"],
      [", United States", ", United States of America", ", USA"],
      [", Canada"],
      [", New Zealand"],
      [", Australia"],
      [", France"],
      [", Germany"],
      [", Austria"],
      [", Italy"],
      [", Spain"],
      [", Switzerland"],
      [", Netherlands"],
      [", Sweden"],
      [", Norway"],
      [", Denmark"],
      [", Czech Republic"],
      [", Hungary"],
      [", Mexico"],
      [", Peru"],
      [", China"],
      [", Japan"],
      [", Thailand"],
      [", Vietnam"],
      [", Taiwan"],
      [", French Polynesia"],
      [", South Africa"],
      [", Zimbabwe"],
    ];

    // remove trailing . or spaces
    while (
      placeString[placeString.length - 1] == "." ||
      placeString[placeString.length - 1] == " "
    ) {
      if (placeString.length > 1) {
        placeString = placeString.substring(0, placeString.length - 1);
      }
    }

    // if there is a word character immediately after a comma then add a space
    placeString = placeString.replace(/,(\w)/g, ", $1");

    // optionally remove, abbreviate or standardize country
    if (options.narrative_general_country != "full") {
      var countryIndex = -1;
      var countryString = null;
      var stdCountryString = null;
      for (var country = 0; country < countryStrings.length; country++) {
        let firstVariant = true;
        let firstVariantName = null;
        for (var variant of countryStrings[country]) {
          if (firstVariant) {
            firstVariant = false;
            firstVariantName = variant;
          }

          if (placeString.endsWith(variant)) {
            countryIndex = country;
            countryString = variant;
            if (firstVariantName && firstVariantName != variant) {
              stdCountryString = firstVariantName;
            }
            break;
          }
        }
        if (countryIndex != -1) {
          break;
        }
      }
      if (countryIndex != -1) {
        // we found a country, decide whether to remove it
        var removeCountry = false;

        if (options.narrative_general_country == "none") {
          removeCountry = true;
        }

        if (removeCountry) {
          placeString = placeString.substring(
            0,
            placeString.length - countryString.length
          );
        } else if (
          options.narrative_general_country == "standard" &&
          stdCountryString
        ) {
          placeString = placeString.substring(
            0,
            placeString.length - countryString.length
          );
          placeString += stdCountryString;
        }
      }
    }

    if (options.narrative_general_placeChurchFirst == "yes") {
      const recordTypesWithChurchNames = [RT.Baptism, RT.Marriage, RT.Burial];
      const siteNamesWhereChurchCanBeAfterTown = ["ancestry"];

      if (
        recordTypesWithChurchNames.includes(gd.recordType) &&
        siteNamesWhereChurchCanBeAfterTown.includes(gd.sourceOfData)
      ) {
        // attempt to change "Huddersfield, St Peter," to "St. Peter's church, Huddersfield,"
        let firstCommaIndex = placeString.indexOf(",");
        if (firstCommaIndex != -1 && placeString.length > firstCommaIndex + 2) {
          let secondCommaIndex = placeString.indexOf(",", firstCommaIndex + 1);
          if (secondCommaIndex != -1) {
            let churchName = placeString
              .substring(firstCommaIndex + 1, secondCommaIndex)
              .trim();
            let placeNoChurch =
              placeString.substring(0, firstCommaIndex) +
              ", " +
              placeString.substring(secondCommaIndex + 1).trim();

            if (
              /^St[ \.]+/.test(churchName) ||
              /^All Saints/i.test(churchName)
            ) {
              if (churchName.endsWith("s")) {
                churchName += "'";
              } else {
                churchName += "'s";
              }
              churchName += " church";
              placeString = churchName + ", " + placeNoChurch;
            }
          }
        }
      }
    }

    return placeString;
  }

  getPlaceWithPreposition(placeString) {
    if (!placeString) {
      return placeString;
    }

    placeString = this.improveAndAbbreviatePlaceString(placeString);
    let preposition = WTS_String.getPrepositionForPlaceString(placeString);
    return preposition + " " + placeString;
  }

  getNameOrPronounOption() {
    return this.getSubcatOption("nameOrPronoun");
  }

  getPersonNameOrPronounWithFlag(isMidSentence = false) {
    let gd = this.eventGd;

    let nameOption = this.getNameOrPronounOption();
    let result = { isValid: false };
    result.isPronoun = false;

    function tryFirstName() {
      let name = gd.inferFirstName();
      if (name) {
        result.nameOrPronoun = name;
        return true;
      }
      return false;
    }

    function tryForenames() {
      let name = gd.inferForenames();
      if (name) {
        result.nameOrPronoun = name;
        return true;
      }
      return false;
    }

    function tryFullName() {
      let name = gd.inferFullName();
      if (name) {
        result.nameOrPronoun = name;
        return true;
      }
      return false;
    }

    function tryPronoun() {
      let gender = gd.personGender;
      if (gender == "male") {
        result.nameOrPronoun = "He";
        result.isPronoun = true;
        return true;
      } else if (gender == "female") {
        result.nameOrPronoun = "She";
        result.isPronoun = true;
        return true;
      }
      return false;
    }

    if (nameOption == "firstName") {
      if (!tryFirstName()) {
        if (!tryFullName()) {
          tryPronoun();
        }
      }
    } else if (nameOption == "forenames") {
      if (!tryForenames()) {
        if (!tryFullName()) {
          tryPronoun();
        }
      }
    } else if (nameOption == "fullName") {
      if (!tryFullName()) {
        tryPronoun();
      }
    } else if (nameOption == "pronoun") {
      if (!tryPronoun()) {
        if (!tryFirstName()) {
          tryFullName();
        }
      }
    }

    if (!result.nameOrPronoun) {
      return result;
    }

    if (result.isPronoun) {
      if (isMidSentence) {
        result.nameOrPronoun = result.nameOrPronoun.toLowerCase();
      }
    } else {
      // In narrative we always want names in initial caps (note might need special case
      // for mixed cased names like McLeod or MacLeod, the prefname can be a surname if no known first name)
      // However, sometimes the generalize has already done a better job of this so it should not be done again
      // NOTE: we could perhaps centralise the code in scotp that does name casing.
      if (gd.sourceOfData != "scotp") {
        result.nameOrPronoun = WTS_String.toInitialCapsEachWord(
          result.nameOrPronoun,
          true
        );
      }
    }

    result.isValid = true;
    return result;
  }

  getPersonNameOrPronoun(isMidSentence = false) {
    let nameOrPronounObj = this.getPersonNameOrPronounWithFlag(isMidSentence);
    if (nameOrPronounObj.isValid) {
      return nameOrPronounObj.nameOrPronoun;
    }
    if (isMidSentence) {
      return "unknown";
    } else {
      return "Unknown";
    }
  }

  getPossessiveName(isMidSentence = false) {
    const gd = this.eventGd;
    let nameOrPronounObj = this.getPersonNameOrPronounWithFlag(isMidSentence);
    if (nameOrPronounObj.isValid) {
      if (nameOrPronounObj.isPronoun) {
        let gender = gd.personGender;
        if (gender == "male") {
          return isMidSentence ? "his" : "His";
        } else if (gender == "female") {
          return isMidSentence ? "her" : "Her";
        }
      }
      // http://www.sussex.ac.uk/informatics/punctuation/apostrophe/possessives
      return nameOrPronounObj.nameOrPronoun + "'s";
    }
    return isMidSentence ? "their" : "Their";
  }

  getPossessiveNamePlusChild(isMidSentence = false) {
    const gd = this.eventGd;
    let string = this.getPossessiveName(isMidSentence);
    string += " " + getPrimaryPersonChildTerm(gd);
    if (gd.primaryPerson) {
      string += " " + gd.primaryPerson;
    }
    return string;
  }

  getPossessiveNamePlusSpouse(isMidSentence = false) {
    const gd = this.eventGd;
    let string = this.getPossessiveName(isMidSentence);
    string += " " + getPrimaryPersonSpouseTerm(gd);
    if (gd.primaryPerson) {
      string += " " + gd.primaryPerson;
    }
    return string;
  }

  getPronounInitialCaps() {
    if (this.personGender == "male") {
      return "He";
    } else if (this.personGender == "female") {
      return "She";
    } else {
      return "They";
    }
  }

  getPronounAndPastTenseInitialCaps() {
    if (this.personGender == "male") {
      return "He was";
    } else if (this.personGender == "female") {
      return "She was";
    } else {
      return "They were";
    }
  }

  getPossessivePronounForGenderInitialCaps(gender) {
    if (gender == "male") {
      return "His";
    } else if (gender == "female") {
      return "Her";
    } else {
      return "Their";
    }
  }

  getPossessivePronounInitialCaps() {
    return this.getPossessivePronounForGenderInitialCaps(this.personGender);
  }

  getPersonPronounOrNameIfNoGender(isMidSentence = false) {
    let result = this.getPronounInitialCaps();

    if (result == "They") {
      const gd = this.eventGd;
      let name = gd.inferFirstName();
      if (name) {
        return name;
      }
      name = gd.inferForenames();
      if (name) {
        return name;
      }
      name = gd.inferFullName();
      if (name) {
        return name;
      }
    }

    if (isMidSentence) {
      result = result.toLowerCase();
    }

    return result;
  }

  highlightDate(dateString) {
    return WTS_String.highlightString(
      dateString,
      this.options.narrative_general_dateHighlight
    );
  }

  getParentSeparator() {
    if (this.options.narrative_general_parentsUseAmpOrAnd == "amp") {
      return " & ";
    } else {
      return " and ";
    }
  }

  addParentageForMainSentence() {
    let includeParentage = this.getSubcatOption("includeParentage");
    let parentageFormat = this.getSubcatOption("parentageFormat");

    if (includeParentage == "inMainSentence") {
      let parentNames = this.eventGd.inferParentNamesForDataString();

      if (parentNames.fatherName || parentNames.motherName) {
        if (!this.narrative.endsWith(",")) {
          this.narrative += ",";
        }
        this.narrative += " ";
        if (parentageFormat == "theTwoCommas") {
          this.narrative += "the ";
        }
        this.narrative += getChildTerm(this.eventGd.personGender) + " of ";
        if (parentNames.fatherName) {
          this.narrative += parentNames.fatherName;
        }
        if (parentNames.motherName) {
          if (parentNames.fatherName) {
            this.narrative += this.getParentSeparator();
          }
          this.narrative += parentNames.motherName;
        }
        this.narrative += ",";
      }
    }
  }

  addParentageAsSeparateSentence() {
    let includeParentage = this.getSubcatOption("includeParentage");

    if (includeParentage == "inSeparateSentence") {
      let parentNames = this.eventGd.inferParentNamesForDataString();

      if (parentNames.fatherName || parentNames.motherName) {
        this.narrative +=
          " " + this.getPronounAndPastTenseInitialCaps() + " the ";
        this.narrative += getChildTerm(this.eventGd.personGender) + " of ";
        if (parentNames.fatherName) {
          this.narrative += parentNames.fatherName;
        }
        if (parentNames.motherName) {
          if (parentNames.fatherName) {
            this.narrative += this.getParentSeparator();
          }
          this.narrative += parentNames.motherName;
        }
        this.narrative += ".";
      }
    }
  }

  formatDate(dateString, addPreposition, prepSuffix = "") {
    // for cases where we don't have a date object
    let dateObj = new WtsDate();
    dateObj.dateString = dateString;
    let format = this.options.narrative_general_dateFormat;
    let highlight = this.options.narrative_general_dateHighlight;
    return this.eventGd.getNarrativeDateFormat(
      dateObj,
      format,
      highlight,
      addPreposition,
      prepSuffix
    );
  }

  formatDateObj(dateObj, addPreposition, prepSuffix = "") {
    if (dateObj) {
      let format = this.options.narrative_general_dateFormat;
      let highlight = this.options.narrative_general_dateHighlight;
      return this.eventGd.getNarrativeDateFormat(
        dateObj,
        format,
        highlight,
        addPreposition,
        prepSuffix
      );
    }
    return "";
  }

  getQuarterName(quarterNumber) {
    const quarterNames = [
      "Jan-Feb-Mar",
      "Apr-May-Jun",
      "Jul-Aug-Sep",
      "Oct-Nov-Dec",
    ];
    if (
      quarterNumber != undefined &&
      quarterNumber >= 1 &&
      quarterNumber <= 4
    ) {
      return quarterNames[quarterNumber - 1];
    }

    return "";
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Age
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  addAgePartForMainSentence(age) {
    if (age) {
      let includeAgeText = true;
      if (typeof age == "string" && age.toLowerCase().indexOf("age") != -1) {
        // it could be something like "of Full Age"
        includeAgeText = false;
        age = age.toLowerCase();
      }

      let format = this.getSubcatOption("ageFormat");
      if (includeAgeText) {
        if (format == "parensAge") {
          this.narrative += " (age " + age + ")";
        } else if (format == "commasAge") {
          if (!this.narrative.endsWith(",")) {
            this.narrative += ",";
          }
          this.narrative += " age " + age + ",";
        } else if (format == "plainAge") {
          this.narrative += " age " + age;
        } else if (format == "parensAged") {
          this.narrative += " (aged " + age + ")";
        } else if (format == "commasAged") {
          if (!this.narrative.endsWith(",")) {
            this.narrative += ",";
          }
          this.narrative += " aged " + age + ",";
        } else if (format == "plainAged") {
          this.narrative += " aged " + age;
        }
      } else {
        if (format == "parensAge" || format == "parensAged") {
          this.narrative += " (" + age + ")";
        } else if (format == "commasAge" || format == "commasAged") {
          if (!this.narrative.endsWith(",")) {
            this.narrative += ",";
          }
          this.narrative += " " + age + ",";
        } else if (format == "plainAge" || format == "plainAged") {
          this.narrative += " " + age;
        }
      }
    }
  }

  addAgeForMainSentence(age) {
    if (this.getSubcatOption("includeAge") == "inMainSentence") {
      this.addAgePartForMainSentence(age);
    }
  }

  addAgeAsSeparateSentence(age) {
    if (this.getSubcatOption("includeAge") == "inSeparateSentence") {
      if (age) {
        this.narrative += " " + this.getPronounAndPastTenseInitialCaps() + " ";

        if (age.search(/[^0-9]/) != -1) {
          // the age has non numerical characters, it could be something like "of Full Age"
          let lcAge = age.toLowerCase();
          this.narrative += lcAge;
        } else {
          this.narrative += age + " years old";
        }

        this.narrative += ".";
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Occupation helpers
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getCleanOccupation() {
    let occupation = this.eventGd.occupation;
    if (occupation) {
      let lcOccupation = occupation.toLowerCase();
      if (lcOccupation == "none" || lcOccupation == "no occupation") {
        occupation = "";
      }
    }
    return occupation;
  }

  getOccupationPart(occupation) {
    let occupationText = occupation;
    if (this.options.narrative_general_occupationFormat == "lowerCase") {
      occupationText = occupationText.toLowerCase();
    } else if (this.options.narrative_general_occupationFormat == "titleCase") {
      // Sometimes there are parens like this: "Pattern Maker (Artz)"
      // toInitialCapsEachWord keeps that OK now
      occupationText = WTS_String.toInitialCapsEachWord(occupationText);
    }

    return occupationText;
  }

  addOccupationForMainSentence(occupation, optionsSubcategory) {
    let includeOption = this.getSubcatOption("includeOccupation");

    if (occupation && includeOption == "inMainSentence") {
      let occupationText = this.getOccupationPart(occupation);
      if (occupationText) {
        if (!this.narrative.endsWith(",")) {
          this.narrative += ",";
        }
        this.narrative += " " + occupationText + ",";
      }
    }
  }

  addOccupationAsSeparateSentence(occupation, relationship) {
    let gd = this.eventGd;
    let occupationText = "";
    let headRelation = "";

    let includeOption = this.getSubcatOption("includeOccupation");

    if (includeOption == "inSeparateSentence") {
      if (occupation) {
        occupationText = this.getOccupationPart(occupation);
      }
    } else if (includeOption == "inSeparateSentenceHead") {
      if (occupation) {
        occupationText = this.getOccupationPart(occupation);
      } else if (relationship && gd.householdArray) {
        // try to get parent occupation
        const childRelationships = ["son", "daughter"];
        if (childRelationships.includes(relationship)) {
          for (let member of gd.householdArray) {
            if (member.relationship && member.relationship.includes("head")) {
              if (member.gender == "male") {
                headRelation = "father";
              }
              if (member.gender == "female") {
                headRelation = "mother";
              }
              occupationText = this.getOccupationPart(member.occupation);
              break;
            }
          }
        } else if (relationship == "wife") {
          for (let member of gd.householdArray) {
            if (member.relationship && member.relationship.includes("head")) {
              headRelation = "husband";
              occupationText = this.getOccupationPart(member.occupation);
              break;
            }
          }
        }
      }
    }

    if (occupationText) {
      if (headRelation) {
        this.narrative +=
          " " +
          this.getPossessivePronounInitialCaps() +
          " " +
          headRelation +
          " was ";
        this.narrative += WTS_String.getIndefiniteArticle(occupationText);
        this.narrative += " " + occupationText;
        this.narrative += ".";
      } else {
        this.narrative += " " + this.getPronounInitialCaps() + " was ";
        this.narrative += WTS_String.getIndefiniteArticle(occupationText);
        this.narrative += " " + occupationText;
        this.narrative += ".";
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions to build narrative for each record type
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  buildRegistrationStringOfType(typeString) {
    let quarter = this.getQuarterName(this.eventGd.inferEventQuarter());

    let year = this.eventGd.inferEventYear();
    let dateObj = this.eventGd.inferEventDateObj();
    let dateString = this.eventGd.inferEventDate();
    let registrationDistrict = this.eventGd.registrationDistrict;
    let eventPlace = this.eventGd.inferFullEventPlace();

    let ageAtEvent = this.eventGd.inferAgeAtEvent();

    let gd = this.eventGd;

    this.optionsSubcategory = typeString + "Reg";

    // Note - we may need a better way to distinguish between the date being the birth/marriage/death date and
    // it being the registration date/quarter.
    // It might require either a separate record type or a flag in the GD
    let isDateTheRegistrationDate = false;
    if (
      registrationDistrict &&
      (this.eventGd.isRecordInCountry("United Kingdom") || !eventPlace)
    ) {
      isDateTheRegistrationDate = true;
    } else if ((quarter || year == dateString) && year) {
      isDateTheRegistrationDate = true;
    }

    if (!isDateTheRegistrationDate) {
      // sometimes there is no event date but there is a marriage date
      if (!dateObj) {
        if (typeString == "marriage" && this.eventGd.marriageDate) {
          dateObj = new WtsDate();
          dateObj.dateString = this.eventGd.marriageDate;
          dateString = this.eventGd.marriageDate;
          year = dateObj.getYearString();
        }
      }
    }

    let spouseName = "";
    let spouseAge = "";
    if (this.eventGd.spouses && this.eventGd.spouses.length == 1) {
      let spouse = this.eventGd.spouses[0];
      if (spouse.name) {
        spouseName = spouse.name.inferFullName();
      }
      if (spouse.age) {
        spouseAge = spouse.age;
      }
    }
    const toPast = { birth: "was born", marriage: "married", death: "died" };

    if (isDateTheRegistrationDate) {
      this.optionsSubsection = "Reg";
      let sentenceStructure = this.getSubcatOption("sentenceStructure");

      if (sentenceStructure == "oneSentence") {
        // One sentence format
        if (gd.role && gd.role == Role.Parent) {
          this.narrative +=
            "The " + typeString + " of " + this.getPossessiveNamePlusChild();
        } else if (gd.role && gd.role == Role.Spouse) {
          this.narrative +=
            "The " + typeString + " of " + this.getPossessiveNamePlusSpouse();
        } else {
          let possessiveName = this.getPossessiveName();
          this.narrative += possessiveName + " " + typeString;
          this.addAgeForMainSentence(ageAtEvent);
        }

        if (spouseName) {
          this.narrative += " to " + spouseName;
          this.addAgeForMainSentence(spouseAge);
        }
      } else {
        // Two sentence format
        let pastTense = toPast[typeString];
        if (gd.role && gd.role == Role.Parent) {
          this.narrative += this.getPossessiveNamePlusChild();
        } else if (gd.role && gd.role == Role.Spouse) {
          this.narrative += this.getPossessiveNamePlusSpouse();
        } else {
          this.narrative += this.getPersonNameOrPronoun();
          this.addAgeForMainSentence(ageAtEvent);
        }

        this.narrative += " " + pastTense;
        if (spouseName) {
          this.narrative += " " + spouseName;
          this.addAgeForMainSentence(spouseAge);
        }
        let year = this.eventGd.inferEventYear();
        if (year) {
          if (quarter == "Jan-Feb-Mar") {
            let yearNum = WTS_Date.getYearNumFromYearString(year);
            if (yearNum) {
              yearNum -= 1;
              this.narrative += " in late " + yearNum + "/early " + year;
            } else {
              this.narrative += " in " + year;
            }
          } else {
            this.narrative += " in " + year;
          }
        }
        this.narrative += ". ";
        let pronoun = "Their";
        if (!spouseName) {
          if (this.eventGd.role) {
            pronoun = this.getPossessivePronounForGenderInitialCaps(
              this.eventGd.primaryPersonGender
            );
          } else {
            pronoun = this.getPossessivePronounInitialCaps();
          }
          if (pronoun == "Their") {
            pronoun = "The";
          }
        }
        this.narrative += pronoun + " " + typeString;
      }

      this.narrative += " was registered";

      if (
        sentenceStructure == "oneSentence" ||
        sentenceStructure == "twoSentencesDate"
      ) {
        if (quarter) {
          this.narrative +=
            " in the " + quarter + " quarter of " + this.highlightDate(year);
        } else {
          this.narrative += " in " + this.highlightDate(year);
        }
      }
    } else {
      this.optionsSubsection = "Evt";

      let pastTense = toPast[typeString];

      if (gd.role && gd.role == Role.Parent) {
        this.narrative += this.getPossessiveNamePlusChild();
        this.narrative += " " + pastTense;
      } else if (gd.role && gd.role == Role.Spouse) {
        this.narrative += this.getPossessiveNamePlusSpouse();
        this.narrative += " " + pastTense;
      } else {
        this.narrative += this.getPersonNameOrPronoun();
        this.addParentageForMainSentence();

        if (ageAtEvent && typeString == "marriage") {
          this.addAgeForMainSentence(ageAtEvent);
        }
        this.narrative += " " + pastTense;
        if (ageAtEvent && typeString != "marriage") {
          this.addAgeForMainSentence(ageAtEvent);
        }
      }

      if (typeString == "marriage") {
        if (spouseName) {
          this.narrative += " " + spouseName;
          this.addAgeForMainSentence(spouseAge);
        }
      }

      if (dateObj) {
        this.narrative += " " + this.formatDateObj(dateObj, true);
      }
    }

    if (isDateTheRegistrationDate && registrationDistrict) {
      let districtFormat = this.getSubcatOption("regDistrictFormat", "Reg");

      if (districtFormat == "theDistrict") {
        this.narrative += " in the " + registrationDistrict + " district";
      } else if (districtFormat == "districtName") {
        this.narrative += " in " + registrationDistrict;
      } else if (districtFormat == "districtCounty") {
        this.narrative += " in " + registrationDistrict;
        let county = this.eventGd.inferEventCounty();
        if (county) {
          this.narrative += ", " + county;
        }
      }
    } else if (eventPlace) {
      this.narrative += " " + this.getPlaceWithPreposition(eventPlace);
    }

    this.narrative += ".";

    this.addParentageAsSeparateSentence();
    this.addAgeAsSeparateSentence(ageAtEvent);
  }

  buildBirthRegistrationString() {
    this.buildRegistrationStringOfType("birth");
  }

  buildDeathRegistrationString() {
    this.buildRegistrationStringOfType("death");
  }

  buildMarriageRegistrationString() {
    this.buildRegistrationStringOfType("marriage");
  }

  buildBirthString() {
    let gd = this.eventGd;
    let dateObj = gd.inferBirthDateObj();
    let place = gd.inferBirthPlace();
    this.optionsSubcategory = "birth";

    this.narrative = this.getPersonNameOrPronoun();

    if (gd.role && gd.role == Role.Parent && gd.primaryPerson) {
      // This is a record for one of the parents
      // "X and X's child Z"
      if (
        gd.spouses &&
        gd.spouses[0] &&
        gd.spouses[0].name &&
        gd.spouses[0].name.name
      ) {
        this.narrative += " and " + gd.spouses[0].name.name;
      }
      this.narrative +=
        "'s " + getPrimaryPersonChildTerm(gd) + " " + gd.primaryPerson;
      // inferBirthDate will not return the date of the primary person's birth
      dateObj = gd.inferEventDateObj();
      place = gd.inferEventPlace();
    } else {
      this.addParentageForMainSentence();
    }

    this.narrative += " was born"; // "was" is OK because we never use "They" at start

    if (dateObj) {
      this.narrative += " " + this.formatDateObj(dateObj, true);
    }
    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }
    this.narrative += ".";

    this.addParentageAsSeparateSentence();
  }

  buildDeathString() {
    let gd = this.eventGd;
    let dateObj = gd.inferDeathDateObj();
    let place = gd.inferDeathPlace();
    this.optionsSubcategory = "death";

    if (gd.role && gd.role == Role.Parent) {
      this.narrative += this.getPossessiveNamePlusChild();
      // inferDeathDate will not return the date of the primary person's death
      dateObj = gd.inferEventDateObj();
      place = gd.inferEventPlace();
    } else if (gd.role && gd.role == Role.Spouse) {
      this.narrative += this.getPossessiveNamePlusSpouse();
      // inferDeathDate will not return the date of the primary person's death
      dateObj = gd.inferEventDateObj();
      place = gd.inferEventPlace();
    } else {
      this.narrative += this.getPersonNameOrPronoun();
      this.addParentageForMainSentence();
    }

    this.narrative += " died";

    let ageAtEvent = this.eventGd.inferAgeAtEvent();
    this.addAgeForMainSentence(ageAtEvent);

    if (dateObj) {
      this.narrative += " " + this.formatDateObj(dateObj, true);
    }
    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    } else {
      let residencePlace = this.eventGd.inferResidencePlace();
      if (residencePlace) {
        this.narrative +=
          " residing " + this.getPlaceWithPreposition(residencePlace);
      }
    }
    this.narrative += ".";

    this.addAgeAsSeparateSentence(ageAtEvent);
    this.addParentageAsSeparateSentence();
  }

  buildBaptismString() {
    let gd = this.eventGd;
    let dateObj = gd.inferEventDateObj();
    let place = gd.inferFullEventPlace();
    this.optionsSubcategory = "baptism";

    let baptisedString = "baptised";
    if (this.options.narrative_general_spelling == "en_us") {
      baptisedString = "baptized";
    }

    if (gd.role && gd.role == Role.Parent) {
      this.narrative += this.getPossessiveNamePlusChild();
      this.narrative += " was ";
    } else {
      this.narrative += this.getPersonNameOrPronoun();
      this.addParentageForMainSentence();
      this.narrative += " was ";
    }

    if (gd.birthDate && this.options.narrative_baptism_includeBirthDate) {
      this.narrative += "born " + this.formatDateObj(gd.birthDate, true);
      if (
        this.options.narrative_baptism_sentenceStructure == "parentsBornAndBap"
      ) {
        this.narrative += " and ";
      } else {
        this.narrative += "; ";
      }
    }

    this.narrative += baptisedString;

    if (dateObj) {
      this.narrative += " " + this.formatDateObj(dateObj, true);
    }
    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }

    // sometimes a baptism has a death date. (e.g. germany_baptism_1840_johanna_hartmann)
    if (this.options.narrative_baptism_includeDeathDate) {
      let deathDateObj = gd.inferDeathDateObj();
      if (deathDateObj) {
        this.narrative += " and died " + this.formatDateObj(deathDateObj, true);
      }
    }

    this.narrative += ".";

    this.addParentageAsSeparateSentence();
  }

  buildMarriageString() {
    let gd = this.eventGd;
    let dateObj = this.eventGd.inferEventDateObj();
    let place = this.eventGd.inferFullEventPlace();
    let ageAtEvent = this.eventGd.inferAgeAtEvent();

    this.optionsSubcategory = "marriage";

    let spouseName = "";
    let spouseAge = "";
    if (this.eventGd.spouses && gd.spouses.length == 1) {
      let spouse = gd.spouses[0];
      if (spouse.name) {
        spouseName = spouse.name.inferFullName();
      }
      if (spouse.age) {
        spouseAge = spouse.age;
      }
    }

    if (gd.role && gd.role == Role.Parent) {
      this.narrative += this.getPossessiveNamePlusChild();
      this.narrative += " married";
    } else {
      this.narrative += this.getPersonNameOrPronoun();
      this.addAgeForMainSentence(ageAtEvent);
      this.addParentageForMainSentence();
      this.narrative += " married";
    }

    if (spouseName) {
      spouseName = WTS_String.toInitialCapsEachWord(spouseName, true);
      this.narrative += " " + spouseName;
      this.addAgeForMainSentence(spouseAge);
    }

    if (
      gd.recordSubtype &&
      gd.recordSubtype == RecordSubtype.Banns &&
      (dateObj || place)
    ) {
      this.narrative += ". The banns were read";
    }

    if (this.eventGd.marriageDate) {
      // sometimes there is a specific marriage date
      dateObj = new WtsDate();
      dateObj.dateString = this.eventGd.marriageDate;
      this.narrative += " " + this.formatDateObj(dateObj, true);
    } else if (dateObj) {
      let prepSuffix = "";
      if (
        gd.recordSubtype &&
        gd.recordSubtype == RecordSubtype.MarriageOrBanns
      ) {
        prepSuffix = "or after";
      }
      this.narrative += " " + this.formatDateObj(dateObj, true, prepSuffix);
    }
    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }
    this.narrative += ".";

    this.addAgeAsSeparateSentence(ageAtEvent);
    this.addParentageAsSeparateSentence();
  }

  buildBurialString() {
    let gd = this.eventGd;
    this.optionsSubcategory = "burial";

    let burialDate = gd.eventDate;
    let deathDate = gd.deathDate;

    let place = gd.inferFullEventPlace();

    if (gd.role && gd.role == Role.Parent) {
      this.narrative += this.getPossessiveNamePlusChild();
    } else {
      this.narrative += this.getPersonNameOrPronoun();
    }

    let age = this.eventGd.ageAtDeath;
    if (!age) {
      age = this.eventGd.ageAtEvent;
    }
    this.addAgeForMainSentence(age);

    if (!gd.role) {
      this.addParentageForMainSentence();
    }

    if (
      deathDate &&
      burialDate &&
      deathDate.dateString != burialDate.dateString
    ) {
      this.narrative += " died";
      this.narrative += " " + this.formatDateObj(deathDate, true);
      this.narrative += " and was buried";
      this.narrative += " " + this.formatDateObj(burialDate, true);
    } else if (gd.recordType == RT.DeathOrBurial) {
      this.narrative += " died or was buried";
      this.narrative += " " + this.formatDateObj(burialDate, true);
    } else if (burialDate) {
      this.narrative += " was buried";
      this.narrative += " " + this.formatDateObj(burialDate, true);
    } else if (deathDate) {
      this.narrative += " died";
      this.narrative += " " + this.formatDateObj(deathDate, true);
      this.narrative += " and was buried";
    } else {
      this.narrative += " was buried";
    }

    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }
    this.narrative += ".";

    this.addAgeAsSeparateSentence(age);
    this.addParentageAsSeparateSentence();
  }

  buildCremationString() {
    let cremationDate = this.eventGd.eventDate;
    let deathDate = this.eventGd.deathDate;
    this.optionsSubcategory = "cremation";

    let place = this.eventGd.inferFullEventPlace();

    this.narrative = this.getPersonNameOrPronoun();

    if (deathDate && cremationDate) {
      this.narrative += " died";
      this.narrative += " " + this.formatDateObj(deathDate, true);
      this.narrative += " and was cremated";
      this.narrative += " " + this.formatDateObj(cremationDate, true);
    } else if (cremationDate) {
      this.narrative += " was cremated";
      this.narrative += " " + this.formatDateObj(cremationDate, true);
    } else if (deathDate) {
      this.narrative += " died";
      this.narrative += " " + this.formatDateObj(deathDate, true);
      this.narrative += " and was cremated";
    } else {
      this.narrative += " was cremated";
    }

    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }
    this.narrative += ".";
  }

  buildMemorialString() {
    let gd = this.eventGd;
    this.optionsSubcategory = "memorial";

    let place = gd.inferFullEventPlace();

    let deathDate = gd.inferDeathDate();

    this.narrative += this.getPersonNameOrPronoun();
    this.narrative += " was mentioned on a memorial";

    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }
    if (deathDate) {
      this.narrative +=
        " with a death date of " + this.formatDate(deathDate, false);
    }
    this.narrative += ".";
  }

  buildObituaryString() {
    let gd = this.eventGd;
    this.optionsSubcategory = "obituary";

    let eventPlace = gd.inferFullEventPlace();
    let eventDateObj = gd.inferEventDateObj();
    let deathDateObj = gd.inferDeathDateObj();
    let deathPlace = gd.inferDeathPlace();
    let age = "";

    this.narrative += this.getPersonNameOrPronoun();
    this.addParentageForMainSentence();

    if (gd.role) {
      let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();
      let otherName = gd.primaryPerson;
      if (relationship || otherName) {
        this.narrative += " was mentioned in the obituary of";

        if (relationship) {
          let pronoun = this.getPossessivePronounInitialCaps().toLowerCase();
          this.narrative += " " + pronoun + " " + relationship;
        }

        if (otherName) {
          this.narrative += " " + otherName;
        }
      } else {
        this.narrative += " was mentioned in an obituary";
      }
    } else {
      this.narrative += " was in an obituary";
    }

    if (
      eventDateObj &&
      (!deathDateObj ||
        eventDateObj.getDateString() != deathDateObj.getDateString())
    ) {
      this.narrative += " " + this.formatDateObj(eventDateObj, true);
    }
    if (eventPlace && eventPlace != deathPlace) {
      this.narrative += " " + this.getPlaceWithPreposition(eventPlace);
    }

    if (deathDateObj) {
      this.narrative +=
        ". " + this.getPersonPronounOrNameIfNoGender() + " died";

      age = this.eventGd.ageAtDeath;
      if (!age) {
        age = this.eventGd.ageAtEvent;
      }
      this.addAgeForMainSentence(age);

      this.narrative += " " + this.formatDateObj(deathDateObj, true);

      if (deathPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(deathPlace);
      }
    }
    this.narrative += ".";

    this.addAgeAsSeparateSentence(age);
    this.addParentageAsSeparateSentence();
  }

  buildBirthOrBaptismString() {
    // This can happen in Ancestry, especially for child births or baptisms
    let gd = this.eventGd;
    let dateObj = gd.inferEventDateObj();
    let place = gd.inferFullEventPlace();
    this.optionsSubcategory = "birthOrBaptism";

    let baptisedString = "baptised";
    if (this.options.narrative_general_spelling == "en_us") {
      baptisedString = "baptized";
    }

    if (gd.role && gd.role == Role.Parent) {
      this.narrative += this.getPossessiveNamePlusChild();
      this.narrative += " was born or " + baptisedString;
    } else {
      this.narrative += this.getPersonNameOrPronoun();
      this.addParentageForMainSentence();
      this.narrative += " was born or " + baptisedString;
    }

    if (dateObj) {
      this.narrative += " " + this.formatDateObj(dateObj, true);
    }
    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }

    // sometimes a baptism has a death date. (e.g. germany_baptism_1840_johanna_hartmann)
    if (gd.deathDate) {
      this.narrative +=
        " and died " + this.formatDateObj(gd.inferDeathDateObj(), true);
    }

    this.narrative += ".";

    this.addParentageAsSeparateSentence();
  }

  buildCensusString() {
    let gd = this.eventGd;
    let options = this.options;
    let builder = this;
    let collection = this.getCollection();
    this.optionsSubcategory = "census";

    function getHeadOfHouseholdMemberIfNotSelected(household) {
      let hasRelationships = false;
      if (household && household.length > 1) {
        for (let member of household) {
          if (!member.isSelected && member.relationship) {
            hasRelationships = true; // the selected person can have a relationship when the rest do not
          }
          if (!member.isSelected && member.relationship == "head") {
            return member;
          }
        }

        if (hasRelationships) {
          // There is no head (this should not be called if this person is the head)
          // Occasionally the first person of the household has a relationship of "wife" or "widow"
          if (!household[0].isSelected) {
            if (
              household[0].relationship == "wife" ||
              household[0].relationship == "widow"
            ) {
              return household[0];
            }
          }
        } else {
          if (!household[0].isSelected) {
            return household[0];
          }
        }
      }
      return undefined;
    }

    function getHeadOfHouseholdNameIfNotSelected(household) {
      let member = getHeadOfHouseholdMemberIfNotSelected(household);
      if (member) {
        return member.name;
      }
      return "";
    }

    function getCensusDatePart(year) {
      let part1Option = options.narrative_census_censusDatePartFormat;
      let result = "";
      if (part1Option == "inCensusTitle") {
        if (collection && collection.title) {
          result = "In the " + collection.title;
        } else {
          result = "In the " + builder.highlightDate(year);
          if (year == "1939") {
            result += " register";
          } else {
            result += " census";
          }
        }
      } else if (part1Option == "inYearCensus") {
        result = "In the " + builder.highlightDate(year);
        if (year == "1939") {
          result += " register";
        } else {
          result += " census";
        }
      } else if (part1Option == "inYear") {
        result = "In " + builder.highlightDate(year);
      } else if (part1Option == "onDate") {
        let date = "";
        if (collection && collection.dates && collection.dates.exactDate) {
          date = collection.dates.exactDate;
        } else {
          date = gd.inferEventDate();
        }
        if (date) {
          let dateString = builder.formatDate(date, true);
          // want to start with an upper cae letter
          if (dateString && dateString.length > 1) {
            dateString = dateString[0].toUpperCase() + dateString.substring(1);
          }
          result = dateString;
        }
      }
      return result;
    }

    function getHouseholdPart() {
      let result = "";
      if (options.narrative_census_householdPartFormat == "relationship") {
        if (relationship && maritalStatus) {
          if (relationship.includes("head")) {
            result += " the " + maritalStatus + " head of household";
          } else {
            let headName = getHeadOfHouseholdNameIfNotSelected(
              gd.householdArray
            );
            if (headName) {
              if (relationship.includes("wife")) {
                result += " the " + relationship + " of " + headName;
              } else {
                result +=
                  " the " +
                  maritalStatus +
                  " " +
                  relationship +
                  " of " +
                  headName;
              }
            } else {
              result += " a " + maritalStatus + " " + relationship;
            }
          }
        } else if (relationship) {
          if (relationship.includes("head")) {
            result += " the head of household";
          } else {
            let headName = getHeadOfHouseholdNameIfNotSelected(
              gd.householdArray
            );
            if (headName) {
              result += " the " + relationship + " of " + headName;
            } else {
              result += " a " + relationship;
            }
          }
        } else if (maritalStatus) {
          result += " recorded as " + maritalStatus;
        }
      } else {
        let listParts = [];

        if (relationship && gd.householdArray) {
          let hasWife = false;
          let hasHusband = false;
          let childCount = 0;
          let childType = "none";
          let childMaritalStatus = "none";
          let siblingCount = 0;
          let firstSiblingType = "";
          let hasFather = false;
          let hasMother = false;
          let isHeadOrWife = false;

          let headMember = getHeadOfHouseholdMemberIfNotSelected(
            gd.householdArray
          );

          if (relationship.includes("head") || relationship == "wife") {
            isHeadOrWife = true;

            for (let member of gd.householdArray) {
              if (member.isSelected) continue;
              let thisMemberIsHead = false;
              if (
                (member.relationship && member.relationship.includes("head")) ||
                member == headMember
              ) {
                thisMemberIsHead = true;
              }

              if (relationship == "wife") {
                if (thisMemberIsHead) {
                  hasHusband = true;
                } else if (member.relationship == "father-in-law") {
                  hasFather = true;
                } else if (member.relationship == "mother-in-law") {
                  hasMother = true;
                }
              } else {
                if (member.relationship == "wife") {
                  hasWife = true;
                } else if (member.relationship == "father") {
                  hasFather = true;
                } else if (member.relationship == "mother") {
                  hasMother = true;
                }
              }

              if (
                member.relationship == "son" ||
                member.relationship == "daughter"
              ) {
                childCount++;
                if (childType == "none") {
                  childType = member.relationship;
                } else if (childType != member.relationship) {
                  childType = "mixed"; // not all children are sons or daughters
                }

                if (member.maritalStatus) {
                  if (childMaritalStatus == "none") {
                    childMaritalStatus = member.maritalStatus;
                  } else if (childMaritalStatus != member.maritalStatus) {
                    childMaritalStatus = "mixed";
                  }
                } else {
                  if (childMaritalStatus != "none") {
                    childMaritalStatus = "mixed";
                  }
                }
              }
            }
          } else if (relationship == "son" || relationship == "daughter") {
            for (let member of gd.householdArray) {
              if (member.isSelected) continue;
              let thisMemberIsHead = false;
              if (
                (member.relationship && member.relationship.includes("head")) ||
                member == headMember
              ) {
                thisMemberIsHead = true;
              }

              if (thisMemberIsHead) {
                if (member.gender == "male") {
                  hasFather = true;
                } else if (member.gender == "female") {
                  hasMother = true;
                }
              } else if (member.relationship == "wife") {
                hasMother = true;
              } else if (member.relationship == "son") {
                if (!firstSiblingType) {
                  firstSiblingType = "brother";
                }
                siblingCount++;
              } else if (member.relationship == "daughter") {
                if (!firstSiblingType) {
                  firstSiblingType = "sister";
                }
                siblingCount++;
              }
            }
          }

          if (isHeadOrWife) {
            if (hasWife) {
              listParts.push("wife");
            }
            if (hasHusband) {
              listParts.push("husband");
            }
          } else {
            if (hasFather && hasMother) {
              listParts.push("parents");
            } else if (hasFather) {
              listParts.push("father");
            } else if (hasMother) {
              listParts.push("mother");
            }
          }
          if (childCount) {
            if (childMaritalStatus == "single") {
              childMaritalStatus = "unmarried"; // "with her unmarried son" is clearer than "with her single son"
            }
            if (childCount == 1) {
              let text = "";
              if (
                childMaritalStatus != "none" &&
                childMaritalStatus != "mixed"
              ) {
                text += childMaritalStatus + " ";
              }
              if (childType != "none" && childType != "mixed") {
                text += childType;
              } else {
                text += "child";
              }
              listParts.push(text);
            } else {
              let text = "" + childCount;

              if (
                childMaritalStatus != "none" &&
                childMaritalStatus != "mixed"
              ) {
                text += " " + childMaritalStatus;
              }

              if (childType != "none" && childType != "mixed") {
                text += " " + childType + "s";
              } else {
                text += " children";
              }
              listParts.push(text);
            }
          }
          if (siblingCount) {
            if (siblingCount == 1) {
              listParts.push(firstSiblingType);
            } else {
              listParts.push(siblingCount + " " + "siblings");
            }
          }
          if (isHeadOrWife) {
            if (hasFather && hasMother) {
              listParts.push("parents");
            } else if (hasFather) {
              listParts.push("father");
            } else if (hasMother) {
              listParts.push("mother");
            }
          }

          let numParts = listParts.length;
          if (numParts > 0) {
            let pronoun = builder
              .getPossessivePronounInitialCaps()
              .toLowerCase();
            result += " with " + pronoun + " ";
            if (numParts == 1) {
              result += listParts[0];
            } else {
              for (let partIndex = 0; partIndex < numParts; partIndex++) {
                if (partIndex == numParts - 1) {
                  result += " and ";
                } else if (partIndex > 0) {
                  result += ", ";
                }
                result += listParts[partIndex];
              }
            }
          } else if (relationship) {
            // fall back to "a visitor in the household of ..."
            if (options.narrative_census_wasPartFormat != "was") {
              result += " as";
            }

            let headName = getHeadOfHouseholdNameIfNotSelected(
              gd.householdArray
            );

            if (relationship.includes("head")) {
              result += " the head of household";
            } else if (headName) {
              result +=
                " a " + relationship + " in the household of " + headName;
            } else {
              result += " a " + relationship;
            }
          }
        }
      }

      return result;
    }

    function addHouseholdPartForMainSentence() {
      if (options.narrative_census_includeHousehold == "inMainSentence") {
        if (
          options.narrative_census_wasPartFormat != "was" &&
          options.narrative_census_householdPartFormat == "relationship"
        ) {
          builder.narrative += " as";
        }

        builder.narrative += getHouseholdPart();
      }
    }

    function addHouseholdPartAsSeparateSentence() {
      if (options.narrative_census_includeHousehold == "inSeparateSentence") {
        builder.narrative += " " + builder.getPronounInitialCaps() + " was";
        builder.narrative += getHouseholdPart();
        builder.narrative += ".";
      }
    }

    let year = this.eventGd.inferEventYear();
    let place = this.eventGd.inferFullEventPlace();

    if (!place) {
      place = this.eventGd.registrationDistrict;
    }

    if (!year || !place) {
      this.narrative = "";
      return; // do default generate
    }

    this.narrative = getCensusDatePart(year);
    if (options.narrative_census_sentenceStructure == "comma") {
      this.narrative += ",";
    }
    this.narrative += " ";

    this.narrative += this.getPersonNameOrPronoun(true);

    let ageNum = undefined;
    let ageAtEvent = "";
    if (
      year == "1939" &&
      this.eventGd.birthDate &&
      this.eventGd.birthDate.dateString
    ) {
      // 1939 register was taken on 29 September 1939 (could store this in collections)
      ageNum = GeneralizedData.getAgeAtDate(
        this.eventGd.birthDate.dateString,
        "9 September 1939"
      );
      if (ageNum != undefined && ageNum != NaN) {
        ageAtEvent = ageNum.toString();
      }
    } else {
      ageAtEvent = this.getNarrativeAgeString(this.eventGd.ageAtEvent);
      if (ageAtEvent) {
        if (/^\d+$/.test(ageAtEvent)) {
          ageNum = parseInt(ageAtEvent);
        } else {
          ageNum = 0; // could be "1/12" for example or "1 month"
        }
      }
    }

    let occupation = this.getCleanOccupation();

    let relationship = this.eventGd.relationshipToHead;
    if (relationship) {
      relationship = relationship.toLowerCase();
    }

    let maritalStatus = this.eventGd.maritalStatus;
    if (maritalStatus == "widow") {
      maritalStatus = "widowed";
    } else if (maritalStatus == "single") {
      maritalStatus = this.eventGd.getTermForUnmarried();

      if (ageNum != undefined && ageNum != NaN && ageNum <= 14) {
        // if less than marriageble age it seems odd to describe them as single
        maritalStatus = "";
      }
    }

    this.addAgeForMainSentence(ageAtEvent);
    this.addOccupationForMainSentence(occupation);

    this.narrative += " was";
    if (options.narrative_census_wasPartFormat == "wasEnumerated") {
      this.narrative += " enumerated";
    } else if (options.narrative_census_wasPartFormat == "wasRecorded") {
      this.narrative += " recorded";
    }

    addHouseholdPartForMainSentence();

    this.narrative += " " + this.getPlaceWithPreposition(place) + ".";

    addHouseholdPartAsSeparateSentence();
    this.addAgeAsSeparateSentence(ageAtEvent);
    this.addOccupationAsSeparateSentence(occupation, relationship);
  }

  buildProbateString() {
    let eventDateObj = this.eventGd.inferEventDateObj();
    let deathDateObj = this.eventGd.inferDeathDateObj();
    let eventPlace = this.eventGd.inferFullEventPlace();
    let deathPlace = this.eventGd.inferDeathPlace();
    let residencePlace = this.eventGd.inferResidencePlace();

    let possessiveName = this.getPossessiveName();

    if (deathDateObj && eventDateObj) {
      let pronoun = this.getPossessivePronounInitialCaps().toLowerCase();
      this.narrative +=
        this.getPersonNameOrPronoun() +
        " died " +
        this.formatDateObj(deathDateObj, true);
      if (deathPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(deathPlace);
      } else if (residencePlace) {
        this.narrative +=
          " residing " + this.getPlaceWithPreposition(residencePlace);
      }
      this.narrative += " and " + pronoun + " estate passed probate";
      if (eventDateObj) {
        this.narrative += " " + this.formatDateObj(eventDateObj, true);
      }
      if (eventPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(eventPlace);
      }
    } else if (deathDateObj) {
      this.narrative += this.getPersonNameOrPronoun() + " died";
      if (deathDateObj) {
        this.narrative += " " + this.formatDateObj(deathDateObj, true);
      }
      if (deathPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(deathPlace);
      } else if (residencePlace) {
        this.narrative +=
          " residing " + this.getPlaceWithPreposition(residencePlace);
      }
    } else {
      this.narrative += possessiveName + " estate passed probate";
      if (eventDateObj) {
        this.narrative += " " + this.formatDateObj(eventDateObj, true);
      }
      if (eventPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(eventPlace);
      } else if (residencePlace) {
        this.narrative +=
          ". " +
          this.getPossessivePronounInitialCaps() +
          " last residence was " +
          residencePlace;
      }
    }

    this.narrative += ".";
  }

  buildScottishWillString() {
    let gd = this.eventGd;
    let dateObj = gd.inferEventDateObj();
    let place = gd.inferFullEventPlace();

    let possessiveName = this.getPossessiveName();

    let role = gd.role;

    if (!gd.recordSubtype || gd.recordSubtype == "Probate") {
      if (role && role != Role.Primary) {
        if (role == Role.Child) {
          this.narrative = possessiveName + " parent's will passed probate";
        } else if (role == Role.Parent) {
          this.narrative = possessiveName + " child's will passed probate";
        } else if (role == Role.Spouse) {
          this.narrative = possessiveName + " spouse's will passed probate";
        } else if (role == Role.Witness) {
          this.narrative =
            this.getPersonNameOrPronoun() +
            " witnessed a will that passed probate";
        }
      } else {
        if (gd.courtName && gd.courtName != "non-Scottish Court") {
          this.narrative = "Probate of " + possessiveName + " estate endorsed";
        } else {
          this.narrative = "Probate of " + possessiveName + " estate recorded";
        }
      }
    } else if (gd.recordSubtype == "Testament") {
      if (gd.originalConfirmationGrantedDate) {
        this.narrative =
          "Confirmation was originally granted on " +
          possessiveName +
          " estate";
        this.narrative +=
          " " + this.formatDate(gd.originalConfirmationGrantedDate, true);
        this.narrative += " and an additional confirmation was granted";
      } else {
        this.narrative =
          "Confirmation was granted on " + possessiveName + " estate";
      }
    } else if (
      gd.recordSubtype == "Inventory" ||
      gd.recordSubtype == "AdditionalInventory"
    ) {
      this.narrative =
        "Confirmation was granted on " + possessiveName + " estate";
      if (gd.originalConfirmationGrantedDate) {
        this.narrative +=
          " " + this.formatDate(gd.originalConfirmationGrantedDate, true);
        this.narrative += " and an additional inventory was granted";
      }
    } else {
      this.narrative =
        "Confirmation was granted on " + possessiveName + " estate";
    }

    if (dateObj) {
      this.narrative += " " + this.formatDateObj(dateObj, true);
    }

    if (gd.recordSubtype == "AdditionalInventory") {
      if (gd.grantedDate) {
        this.narrative +=
          ", additional inventory granted on " +
          this.formatDate(gd.grantedDate, false);
      } else if (gd.givenUpDate) {
        this.narrative +=
          ", additional inventory given up on " +
          this.formatDate(gd.givenUpDate, false);
      }
    }

    if (gd.courtName) {
      if (gd.courtName.startsWith("non-Scot")) {
        this.narrative += " at a non-Scottish court";
      } else {
        this.narrative += " at " + gd.courtName;
      }
    } else if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }

    this.narrative += ".";
  }

  buildWillString() {
    let gd = this.eventGd;
    this.optionsSubcategory = "will";

    if (
      gd.inferEventCountry() == "Scotland" ||
      (gd.courtName && gd.courtName.startsWith("non-Scot"))
    ) {
      this.buildScottishWillString();
      return;
    }

    let dateObj = gd.inferEventDateObj();
    let deathDateObj = gd.inferDeathDateObj();
    let place = gd.inferFullEventPlace();
    let residencePlace = gd.inferResidencePlace();

    let possessiveName = this.getPossessiveName();

    let role = gd.role;

    if (deathDateObj) {
      if (role && role != Role.Primary) {
        if (role == Role.Child) {
          this.narrative = possessiveName + " parent died";
        } else if (role == Role.Parent) {
          this.narrative = possessiveName + " child died";
        } else if (role == Role.Spouse) {
          this.narrative = possessiveName + " spouse died";
        }
      } else {
        this.narrative += this.getPersonNameOrPronoun(true);
        this.narrative += " died";
      }

      let hasProbateDate = false;
      if (dateObj) {
        if (dateObj.getDateString() != deathDateObj.getDateString()) {
          // there is a probate date (probably)
          hasProbateDate = true;
        }
      }

      this.narrative += " " + this.formatDateObj(deathDateObj, true);

      let deathPlace = gd.inferDeathPlace();

      if (deathPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(deathPlace);
      } else if (residencePlace) {
        this.narrative +=
          " residing " + this.getPlaceWithPreposition(residencePlace);
      } else if (place && !hasProbateDate) {
        this.narrative += " " + this.getPlaceWithPreposition(place);
      }

      if (hasProbateDate) {
        this.narrative +=
          ". " +
          this.getPossessivePronounInitialCaps() +
          " will passed probate";

        if (dateObj) {
          this.narrative += " " + this.formatDateObj(dateObj, true);
        }
        if (place) {
          this.narrative += " " + this.getPlaceWithPreposition(place);
        }
      }
    } else {
      if (role && role != Role.Primary) {
        if (role == Role.Child) {
          this.narrative = possessiveName + " parent's will passed probate";
        } else if (role == Role.Parent) {
          this.narrative = possessiveName + " child's will passed probate";
        } else if (role == Role.Spouse) {
          this.narrative = possessiveName + " spouse's will passed probate";
        } else if (role == Role.Witness) {
          this.narrative =
            this.getPersonNameOrPronoun() +
            " witnessed a will that passed probate";
        }
      } else {
        this.narrative = possessiveName + " will passed probate";
      }

      if (dateObj) {
        this.narrative += " " + this.formatDateObj(dateObj, true);
      }
      if (place) {
        this.narrative += " " + this.getPlaceWithPreposition(place);
      }
    }

    this.narrative += ".";
  }

  buildDivorceString() {
    let dateObj = this.eventGd.inferEventDateObj();
    let place = this.eventGd.inferFullEventPlace();

    this.narrative = this.getPersonNameOrPronoun();

    let spouseName = "";
    if (this.eventGd.spouses && this.eventGd.spouses.length == 1) {
      let spouse = this.eventGd.spouses[0];
      if (spouse.name) {
        spouseName = spouse.name.inferFullName();
      }
    }

    if (spouseName) {
      spouseName = WTS_String.toInitialCapsEachWord(spouseName, true);

      this.narrative += " was divorced from " + spouseName;
    } else {
      this.narrative += " was in a divorce record";
    }

    if (dateObj) {
      this.narrative += " " + this.formatDateObj(dateObj, true);
    }
    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }
    this.narrative += ".";
  }

  buildMilitaryString() {
    let eventDate = this.eventGd.inferEventDate();
    let deathDate = this.eventGd.inferDeathDate();
    let place = this.eventGd.inferFullEventPlace();
    this.optionsSubcategory = "military";

    this.narrative = this.getPersonNameOrPronoun();
    if (deathDate) {
      let branch = this.eventGd.militaryBranch;
      if (!branch) {
        if (this.eventGd.militaryRegiment) {
          branch = this.eventGd.militaryRegiment;
        } else {
          branch = "military";
        }
      } else {
        branch = branch.toLowerCase();
      }
      this.narrative += " was in the " + branch + " and died";
      this.narrative += " " + this.formatDate(deathDate, true);

      let deathPlace = this.eventGd.inferDeathPlace();
      if (deathPlace) {
        place = deathPlace;
      }
    } else {
      this.narrative += " was in a military record";
      if (eventDate) {
        this.narrative += " " + this.formatDate(eventDate, true);
      }
    }

    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }
    this.narrative += ".";

    let number = this.eventGd.serviceNumber;
    let unit = this.eventGd.unit;
    if (unit) {
      this.narrative +=
        " " + this.getPronounAndPastTenseInitialCaps() + " in the " + unit;
      if (number) {
        this.narrative += " (service number " + number + ")";
      }
      this.narrative += ".";
    } else if (number) {
      this.narrative +=
        " " +
        this.getPossessivePronounInitialCaps() +
        " service number was " +
        number +
        ".";
    }
  }

  buildPassengerListString() {
    this.optionsSubcategory = "passengerList";

    let eventDate = this.eventGd.inferEventDate();
    let eventPlace = this.eventGd.inferFullEventPlace();

    let arrivalDate = this.eventGd.arrivalDate;
    let arrivalPlace = this.eventGd.arrivalPlace;
    let departureDate = this.eventGd.departureDate;
    let departurePlace = this.eventGd.departurePlace;

    let isArrival = false;
    let isDeparture = false;
    if (eventDate) {
      if (arrivalDate && arrivalDate == eventDate) {
        isArrival = true;
      } else if (departureDate && departureDate == eventDate) {
        isDeparture = true;
      }
    }

    if (isArrival) {
      this.narrative = this.getPersonNameOrPronoun() + " arrived";

      if (this.eventGd.shipName) {
        this.narrative += " on the ship " + this.eventGd.shipName;
      }

      if (arrivalDate) {
        this.narrative += " " + this.formatDate(arrivalDate, true);
      }

      if (arrivalPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(arrivalPlace);
      }

      if (departurePlace) {
        this.narrative += " having departed from " + departurePlace;
        if (departureDate) {
          this.narrative += " " + this.formatDate(departureDate, true);
        }
      }
    } else if (isDeparture) {
      this.narrative = this.getPersonNameOrPronoun() + " departed";

      if (departurePlace) {
        this.narrative += " from " + departurePlace;
      }

      if (this.eventGd.shipName) {
        this.narrative += " on the ship " + this.eventGd.shipName;
      }

      if (departureDate) {
        this.narrative += " " + this.formatDate(departureDate, true);
      }
    } else {
      this.narrative = this.getPersonNameOrPronoun() + " was a passenger";

      if (this.eventGd.shipName) {
        this.narrative += " on the ship " + this.eventGd.shipName;
      }

      if (eventDate) {
        this.narrative += " " + this.formatDate(eventDate, true);
      }

      if (eventPlace) {
        this.narrative += " " + this.getPlaceWithPreposition(eventPlace);
      }
    }
  }

  buildDefaultString() {
    const narratives = [
      {
        recordType: RT.NonpopulationCensus,
        string: "was enumerated in a non-population schedule",
      },
      { recordType: RT.ElectoralRegister, string: "was registered to vote" },
      { recordType: RT.CriminalRegister, string: "was in a criminal register" },
      { recordType: RT.FreemasonMembership, string: "was a freemason" },
      { recordType: RT.Certificate, string: "was issued a certificate" },
      { recordType: RT.Directory, string: "was in a directory" },
      { recordType: RT.Employment, string: "was employed" },
      { recordType: RT.WorkhouseRecord, string: "was in a workhouse record" },
      { recordType: RT.CrewList, string: "was in a crew" },
      { recordType: RT.ConvictTransportation, string: "was transported" },
      { recordType: RT.MedicalPatient, string: "was a patient" },
      { recordType: RT.QuarterSession, string: "was in quarter session" },
      { recordType: RT.Tax, string: "was in a tax record" },
      { recordType: RT.ValuationRoll, string: "was in a valuation roll" },
      { recordType: RT.LandTax, string: "was in a land tax record" },
      { recordType: RT.Apprenticeship, string: "was a master or apprentice" },
      {
        recordType: RT.SocialSecurity,
        string: "was in a Social Security record",
      },
      { recordType: RT.SchoolRecords, string: "was at school" },
      { recordType: RT.Residence, string: "was recorded as a resident" },
      { recordType: RT.Immigration, string: "immigrated" },
      { recordType: RT.Emigration, string: "emigrated" },
      { recordType: RT.Pension, string: "was in a pension record" },
      { recordType: RT.PassportApplication, string: "applied for a passport" },
      { recordType: RT.Newspaper, string: "was in a newspaper" },
      { recordType: RT.LegalRecord, string: "was in a legal record" },
      { recordType: RT.RateBook, string: "was in a rate book" },
      {
        recordType: RT.FamHistOrPedigree,
        string: "was in a family history or pedigree",
      },
      {
        recordType: RT.Naturalization,
        string: "was in a naturalization record",
      },
      {
        recordType: RT.OtherChurchEvent,
        string: "was recorded in a church event",
      },
      { recordType: RT.Heraldry, string: "was in a heraldic record" },
    ];

    let gd = this.eventGd;

    let narrativeCore = "was in a record";
    for (let entry of narratives) {
      if (entry.recordType == gd.recordType) {
        narrativeCore = entry.string;
        break;
      }
    }

    let dateObj = gd.inferEventDateObj();
    let place = gd.inferFullEventPlace();

    if (gd.role && gd.role == Role.Parent) {
      this.narrative += this.getPossessiveNamePlusChild();
    } else {
      this.narrative += this.getPersonNameOrPronoun();
    }

    this.narrative += " " + narrativeCore;
    if (dateObj) {
      let formattedDate = this.formatDateObj(dateObj, true);
      if (formattedDate) {
        this.narrative += " " + formattedDate;
      }
    }

    if (place) {
      this.narrative += " " + this.getPlaceWithPreposition(place);
    }

    this.narrative += ".";
  }

  buildNarrativeString() {
    // The problem with using apostrophe after the name is that there are rules for when the name
    // ends in s. If we are going to substitute the pref name on insertion then we do not know whether
    // it ends in s. There could be a special code like {prefName} vs {prefNamePossessive}

    this.narrative = "";

    switch (this.eventGd.recordType) {
      case RT.BirthRegistration: {
        this.buildBirthRegistrationString();
        break;
      }
      case RT.Birth: {
        this.buildBirthString();
        break;
      }
      case RT.DeathRegistration: {
        this.buildDeathRegistrationString();
        break;
      }
      case RT.Death: {
        this.buildDeathString();
        break;
      }
      case RT.MarriageRegistration: {
        this.buildMarriageRegistrationString();
        break;
      }
      case RT.Baptism: {
        this.buildBaptismString();
        break;
      }
      case RT.Marriage: {
        this.buildMarriageString();
        break;
      }
      case RT.Burial:
      case RT.DeathOrBurial: {
        this.buildBurialString();
        break;
      }
      case RT.Cremation: {
        this.buildCremationString();
        break;
      }
      case RT.Memorial: {
        this.buildMemorialString();
        break;
      }
      case RT.Obituary: {
        this.buildObituaryString();
        break;
      }
      case RT.BirthOrBaptism: {
        this.buildBirthOrBaptismString();
        break;
      }
      case RT.Census: {
        this.buildCensusString();
        break;
      }
      case RT.Probate: {
        this.buildProbateString();
        break;
      }
      case RT.Will: {
        this.buildWillString();
        break;
      }
      case RT.Divorce: {
        this.buildDivorceString();
        break;
      }
      case RT.Military: {
        this.buildMilitaryString();
        break;
      }
      case RT.PassengerList: {
        this.buildPassengerListString();
        break;
      }
    }

    if (!this.narrative) {
      this.buildDefaultString();
    }
  }
}

function buildNarrative(input) {
  if (!input || !input.eventGeneralizedData) {
    return "";
  }

  let eventGd = input.eventGeneralizedData;
  let options = input.options;

  //console.log("buildNarrative: eventGd is");
  //console.log(eventGd);

  let eventGeneralizedData = GeneralizedData.createFromPlainObject(eventGd);
  let wtGeneralizedData = GeneralizedData.createFromPlainObject(
    input.wtGeneralizedData
  );

  let builder = new NarrativeBuilder(options);
  builder.profileGd = wtGeneralizedData;
  builder.eventGd = eventGeneralizedData;

  if (wtGeneralizedData && wtGeneralizedData.personGender) {
    builder.personGender = wtGeneralizedData.personGender;
  } else if (eventGeneralizedData.personGender) {
    builder.personGender = eventGeneralizedData.personGender;
  }

  builder.buildNarrativeString();

  return builder.narrative;
}

export { NarrativeBuilder, buildNarrative };
