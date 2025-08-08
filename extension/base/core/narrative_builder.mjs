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
import { GeneralizedData, DateObj, PlaceObj } from "./generalize_data_utils.mjs";
import { Role } from "./record_type.mjs";
import { StringUtils } from "./string_utils.mjs";
import { DateUtils } from "./date_utils.mjs";
import {
  getChildTerm,
  getPrimaryPersonChildTerm,
  isRegistrationEventDateTheRegistrationDate,
} from "./narrative_or_sentence_utils.mjs";
import { RC } from "./record_collections.mjs";
import { buildStructuredHousehold } from "./structured_household.mjs";

class NarrativeBuilder {
  constructor(options) {
    this.options = options;

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
        value = this.options["narrative_" + this.optionsSubcategory + subsection + "_" + leafOptionName];
      }
      if (value == undefined) {
        value = this.options["narrative_" + this.optionsSubcategory + "_" + leafOptionName];
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
      [", United Kingdom", "UK"], // must come after the above countries that make up the UK
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
    while (placeString[placeString.length - 1] == "." || placeString[placeString.length - 1] == " ") {
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
          placeString = placeString.substring(0, placeString.length - countryString.length);
        } else if (options.narrative_general_country == "standard" && stdCountryString) {
          placeString = placeString.substring(0, placeString.length - countryString.length);
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
            let churchName = placeString.substring(firstCommaIndex + 1, secondCommaIndex).trim();
            let placeNoChurch =
              placeString.substring(0, firstCommaIndex) + ", " + placeString.substring(secondCommaIndex + 1).trim();

            if (/^St[ \.]+/.test(churchName) || /^All Saints/i.test(churchName)) {
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

  makePlaceObjFromString(placeString) {
    let placeObj = new PlaceObj();
    placeObj.placeString = placeString;
    return placeObj;
  }

  getPlaceWithPreposition(placeString, prepositionHint = "") {
    let placeObj = new PlaceObj();
    placeObj.placeString = placeString;
    placeObj.prepositionHint = prepositionHint;
    return this.getPlaceWithPrepositionFromPlaceObj(placeObj);
  }

  getPlaceWithPrepositionFromPlaceObj(placeObj) {
    if (!placeObj) {
      return "";
    }

    let placeString = placeObj.inferPlaceString();
    if (!placeString) {
      return "";
    }

    let improvedPlaceString = this.improveAndAbbreviatePlaceString(placeString);

    let preposition = placeObj.getPreposition(false, improvedPlaceString);

    if (preposition) {
      return preposition + " " + improvedPlaceString;
    } else {
      return improvedPlaceString;
    }
  }

  getFullPlaceWithPrepositionFromPlaceObj(placeObj) {
    if (!placeObj) {
      return "";
    }

    let placeString = placeObj.inferFullPlaceString();
    if (!placeString) {
      return "";
    }

    let improvedPlaceString = this.improveAndAbbreviatePlaceString(placeString);

    let preposition = placeObj.getPreposition(true, improvedPlaceString);

    if (preposition) {
      return preposition + " " + improvedPlaceString;
    } else {
      return improvedPlaceString;
    }
  }

  addPlaceWithPreposition(placeObj) {
    if (placeObj) {
      this.addPlaceToSentence(this.getPlaceWithPrepositionFromPlaceObj(placeObj));
    }
  }

  addFullPlaceWithPreposition(placeObj) {
    if (placeObj) {
      this.addPlaceToSentence(this.getFullPlaceWithPrepositionFromPlaceObj(placeObj));
    }
  }

  addEventPlaceWithPrepositionOrRd(gd, useFullPlace = true, placeObj) {
    if (!placeObj) {
      placeObj = gd.inferEventPlaceObj();
    }

    if (placeObj) {
      if (useFullPlace) {
        this.addFullPlaceWithPreposition(placeObj);
      } else {
        this.addPlaceWithPreposition(placeObj);
      }
    } else if (gd.registrationDistrict) {
      this.startSentence("Registration district was " + gd.registrationDistrict);
    }
  }

  addDateWithPreposition(dateObj) {
    if (dateObj) {
      let formattedDate = this.formatDateObj(dateObj, true);
      if (formattedDate) {
        this.addDateToSentence(formattedDate);
      }
    }
  }

  addSpaceToContinueSentence() {
    if (!this.narrative) {
      return;
    }

    if (this.commaNeededForSentenceContinuation) {
      this.addCommaSpaceToSentence();
    } else {
      this.removeSpacesAtEndOfSentence();
      this.narrative += " ";
    }
  }

  addCommaSpaceToSentence() {
    this.commaNeededForSentenceContinuation = false;
    // don't remove a period because it could be at the end of an abbreviation
    this.removeCommasAndSpacesAtEndOfSentence();
    this.narrative += ", ";
  }

  addToSentence(text) {
    if (text) {
      this.addSpaceToContinueSentence();

      // remove any leading spaces from text
      this.narrative += text.trimStart();
    }
  }

  addToSentenceNoSpace(text) {
    // this is rarely used - it is adding a part to the last word
    if (text) {
      // remove any leading spaces from text
      this.narrative += text.trimStart();
      this.commaNeededForSentenceContinuation = false;
    }
  }

  addPlaceToSentence(placeText) {
    this.addToSentence(placeText);
    if (placeText.includes(",")) {
      this.commaNeededForSentenceContinuation = true;
    }
  }

  addDateToSentence(dateText) {
    this.addToSentence(dateText);
    if (dateText.includes(",")) {
      this.commaNeededForSentenceContinuation = true;
    }
  }

  terminateSentenceAndAddSpace() {
    this.terminateSentence();
    if (this.narrative) {
      this.narrative += " ";
    }
  }

  terminateSentence() {
    this.commaNeededForSentenceContinuation = false;
    this.removePunctuationAtEndOfSentence();
    if (this.narrative) {
      this.narrative += ".";
    }
  }

  removePunctuationAtEndOfSentence() {
    // remove any spaces or punctuation on end of narrative
    const sentenceWithExtraPunct = /^(.*)([\s\.\,]+)$/;
    if (sentenceWithExtraPunct.test(this.narrative)) {
      this.narrative = this.narrative.replace(sentenceWithExtraPunct, "$1");
    }
  }

  removeCommasAndSpacesAtEndOfSentence() {
    // remove any spaces or commas on end of narrative (not periods)
    const sentenceWithExtraPunct = /^(.*)([\s\,]+)$/;
    if (sentenceWithExtraPunct.test(this.narrative)) {
      this.narrative = this.narrative.replace(sentenceWithExtraPunct, "$1");
    }
  }

  removeSpacesAtEndOfSentence() {
    // remove any spaces at end of the sentence
    this.narrative = this.narrative.trimEnd();
  }

  startSentence(text) {
    this.terminateSentenceAndAddSpace();
    this.narrative += text;
  }

  addFullSentence(text) {
    if (text) {
      this.terminateSentenceAndAddSpace();
      this.narrative += text;
      this.terminateSentence();
    }
  }

  getNameOrPronounOption() {
    return this.getSubcatOption("nameOrPronoun");
  }

  getPersonNameOrPronounWithFlag(isMidSentence = false) {
    let gd = this.eventGd;
    let personGender = this.personGender;

    let nameOption = this.getNameOrPronounOption();
    let result = { isValid: false };
    result.isPronoun = false;

    // the gd name can have a narrative override name, for example "Unnamed Smith".
    if (gd.name && gd.name.narrativeName) {
      result.nameOrPronoun = gd.name.narrativeName;
      result.isValid = true;
      return result;
    }

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
      if (personGender == "male") {
        result.nameOrPronoun = "He";
        result.isPronoun = true;
        return true;
      } else if (personGender == "female") {
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
        // For now, rather than the complex code in scotp we only change case if it is in all uppercase
        if (StringUtils.isAllUppercase(result.nameOrPronoun)) {
          result.nameOrPronoun = StringUtils.toInitialCapsEachWord(result.nameOrPronoun, true);
        }
      }
    }

    result.isValid = true;
    return result;
  }

  getPersonNameOrPronoun(isMidSentence = false, noUnknown = false) {
    let nameOrPronounObj = this.getPersonNameOrPronounWithFlag(isMidSentence);
    if (nameOrPronounObj.isValid) {
      return nameOrPronounObj.nameOrPronoun;
    }
    if (isMidSentence) {
      if (noUnknown) {
        return "this person";
      } else {
        return "unknown";
      }
    } else {
      if (noUnknown) {
        return "This person";
      } else {
        return "Unknown";
      }
    }
  }

  getPossessiveName(isMidSentence = false) {
    const gd = this.eventGd;
    let nameOrPronounObj = this.getPersonNameOrPronounWithFlag(isMidSentence);
    if (nameOrPronounObj.isValid) {
      if (nameOrPronounObj.isPronoun) {
        let gender = this.personGender;
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

  getPossessiveNamePlusPrimaryPerson(isMidSentence = false) {
    const gd = this.eventGd;
    let string = "";
    if (gd.role == Role.Other) {
      string = this.getPersonNameOrPronoun(isMidSentence);
      string += " was in the record for another person who";
    } else {
      string = this.getPossessiveName(isMidSentence);
      let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();
      string += " " + relationship;
    }
    let primaryPersonName = gd.inferPrimaryPersonFullName();
    if (primaryPersonName) {
      string += " " + primaryPersonName;
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
    return StringUtils.highlightString(dateString, this.options.narrative_general_dateHighlight);
  }

  getParentSeparator() {
    if (this.options.narrative_general_parentsUseAmpOrAnd == "amp") {
      return " & ";
    } else {
      return " and ";
    }
  }

  addParentageForMainSentenceGivenParentsAndGender(parentNames, personGender) {
    if (!parentNames) {
      return;
    }

    let includeParentage = this.getSubcatOption("includeParentage");
    let parentageFormat = this.getSubcatOption("parentageFormat");

    if (includeParentage == "inMainSentence") {
      if (parentNames.fatherName || parentNames.motherName) {
        let parentageString = "";
        if (parentageFormat == "theTwoCommas") {
          parentageString += "the ";
        }
        parentageString += getChildTerm(personGender) + " of ";
        if (parentNames.fatherName) {
          parentageString += parentNames.fatherName;
        }
        if (parentNames.motherName) {
          if (parentNames.fatherName) {
            parentageString += this.getParentSeparator();
          }
          parentageString += parentNames.motherName;
        }

        this.addCommaSpaceToSentence();
        this.addToSentence(parentageString);
        this.addCommaSpaceToSentence();
      }
    }
  }

  addParentageForMainSentence() {
    let gd = this.eventGd;
    let parentNames = gd.inferParentNamesForDataString();
    this.addParentageForMainSentenceGivenParentsAndGender(parentNames, this.personGender);
  }

  addSpouseParentageForMainSentence() {
    let gd = this.eventGd;
    let parentNames = gd.inferParentNamesForDataString();
    this.addParentageForMainSentenceGivenParentsAndGender(parentNames, this.personGender);
  }

  addParentageAsSeparateSentenceGivenParentsAndGender(parentNames, personGender) {
    let includeParentage = this.getSubcatOption("includeParentage");

    let sentence = "";
    if (includeParentage == "inSeparateSentence") {
      if (parentNames.fatherName || parentNames.motherName) {
        sentence = this.getPronounAndPastTenseInitialCaps() + " the ";
        sentence += getChildTerm(personGender) + " of ";
        if (parentNames.fatherName) {
          sentence += parentNames.fatherName;
        }
        if (parentNames.motherName) {
          if (parentNames.fatherName) {
            sentence += this.getParentSeparator();
          }
          sentence += parentNames.motherName;
        }
      }
    }
    this.addFullSentence(sentence);
  }

  addParentageAsSeparateSentence() {
    let gd = this.eventGd;
    let parentNames = gd.inferParentNamesForDataString();
    this.addParentageAsSeparateSentenceGivenParentsAndGender(parentNames, this.personGender);
  }

  formatDate(dateString, addPreposition, prepSuffix = "") {
    let gd = this.eventGd;

    // for cases where we don't have a date object
    let dateObj = new DateObj();
    dateObj.dateString = dateString;
    let format = this.options.narrative_general_dateFormat;
    let highlight = this.options.narrative_general_dateHighlight;
    return gd.getNarrativeDateFormat(dateObj, format, highlight, addPreposition, prepSuffix);
  }

  formatDateObj(dateObj, addPreposition, prepSuffix = "") {
    let gd = this.eventGd;

    if (dateObj) {
      let format = this.options.narrative_general_dateFormat;
      let highlight = this.options.narrative_general_dateHighlight;
      return gd.getNarrativeDateFormat(dateObj, format, highlight, addPreposition, prepSuffix);
    }
    return "";
  }

  getQuarterName(quarterNumber) {
    const quarterNames = ["Jan-Feb-Mar", "Apr-May-Jun", "Jul-Aug-Sep", "Oct-Nov-Dec"];
    if (quarterNumber != undefined && quarterNumber >= 1 && quarterNumber <= 4) {
      return quarterNames[quarterNumber - 1];
    }

    return "";
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Mmn (Mother's maiden name)
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  addMmnForMainSentence(mmn) {
    if (this.getSubcatOption("includeMmn") == "inMainSentence") {
      if (mmn) {
        this.addToSentence("(Mother's maiden name " + mmn + ")");
      }
    }
  }

  addMmnAsSeparateSentence(mmn) {
    if (this.getSubcatOption("includeMmn") == "inSeparateSentence") {
      if (mmn) {
        this.startSentence("Mother's maiden name " + mmn);
        this.terminateSentence();
      }
    }
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
          this.addToSentence("(age " + age + ")");
        } else if (format == "commasAge") {
          this.addCommaSpaceToSentence();
          this.addToSentence("age " + age + ",");
        } else if (format == "plainAge") {
          this.addToSentence("age " + age);
        } else if (format == "parensAged") {
          this.addToSentence("(aged " + age + ")");
        } else if (format == "commasAged") {
          this.addCommaSpaceToSentence();
          this.addToSentence("aged " + age + ",");
        } else if (format == "plainAged") {
          this.addToSentence("aged " + age);
        }
      } else {
        if (format == "parensAge" || format == "parensAged") {
          this.addToSentence("(" + age + ")");
        } else if (format == "commasAge" || format == "commasAged") {
          this.addCommaSpaceToSentence();
          this.addToSentence(age + ",");
        } else if (format == "plainAge" || format == "plainAged") {
          this.addToSentence(age);
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
        let sentence = this.getPronounAndPastTenseInitialCaps() + " ";

        if (typeof age == "string" && age.search(/[^0-9]/) != -1) {
          // the age has non numerical characters, it could be something like "of Full Age"
          let lcAge = age.toLowerCase();
          sentence += lcAge;
        } else {
          sentence += age + " years old";
        }

        this.addFullSentence(sentence);
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Spouse of - as in a death reg
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  addSpouseOfPartForMainSentence(spouseName) {
    if (!spouseName) {
      return;
    }

    let gd = this.eventGd;

    let spouseTerm = "spouse";
    if (gd.personGender == "male") {
      spouseTerm = "husband";
    } else if (gd.personGender == "female") {
      spouseTerm = "wife";
    }

    let spouseFormatOpt = this.getSubcatOption("spouseFormat");
    if (spouseFormatOpt == "parensSpouse") {
      this.addToSentence("(" + spouseTerm + " of " + spouseName + ")");
    } else if (spouseFormatOpt == "commasSpouse") {
      this.addCommaSpaceToSentence();
      this.addToSentence(spouseTerm + " of " + spouseName + ",");
    }
  }

  addSpouseOfForMainSentence(spouseName) {
    if (this.getSubcatOption("includeSpouse") == "inMainSentence") {
      this.addSpouseOfPartForMainSentence(spouseName);
    }
  }

  addSpouseOfAsSeparateSentence(spouseName) {
    if (this.getSubcatOption("includeSpouse") == "inSeparateSentence") {
      if (spouseName) {
        let sentence = this.getPronounAndPastTenseInitialCaps();

        let gd = this.eventGd;

        let spouseTerm = "spouse";
        if (gd.personGender == "male") {
          spouseTerm = "husband";
        } else if (gd.personGender == "female") {
          spouseTerm = "wife";
        }

        sentence += " the " + spouseTerm + " of " + spouseName;
        this.addFullSentence(sentence);
      }
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Occupation helpers
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getCleanOccupation() {
    let gd = this.eventGd;
    let occupation = gd.occupation;
    if (occupation) {
      let lcOccupation = occupation.toLowerCase();
      if (lcOccupation == "none" || lcOccupation == "no occupation") {
        occupation = "";
      }
    }
    return occupation;
  }

  getOccupationPart(occupation) {
    if (!occupation) {
      return "";
    }

    let occupationText = occupation;
    if (this.options.narrative_general_occupationFormat == "lowerCase") {
      occupationText = occupationText.toLowerCase();
    } else if (this.options.narrative_general_occupationFormat == "titleCase") {
      // Sometimes there are parens like this: "Pattern Maker (Artz)"
      // toInitialCapsEachWord keeps that OK now
      occupationText = StringUtils.toInitialCapsEachWord(occupationText);
    }

    return occupationText;
  }

  addOccupationForMainSentence(occupation, optionsSubcategory) {
    let includeOption = this.getSubcatOption("includeOccupation");

    if (occupation && includeOption == "inMainSentence") {
      let occupationText = this.getOccupationPart(occupation);
      if (occupationText) {
        this.addCommaSpaceToSentence();
        this.addToSentence(occupationText + ",");
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
              if (member.occupation) {
                occupationText = this.getOccupationPart(member.occupation);
              }
              break;
            }
          }
        } else if (relationship == "wife") {
          for (let member of gd.householdArray) {
            if (member.relationship && member.relationship.includes("head")) {
              headRelation = "husband";
              if (member.occupation) {
                occupationText = this.getOccupationPart(member.occupation);
              }
              break;
            }
          }
        }
      }
    }

    let sentence = "";
    if (occupationText) {
      if (headRelation) {
        sentence = this.getPossessivePronounInitialCaps() + " " + headRelation + " was ";
        sentence += StringUtils.getIndefiniteArticle(occupationText);
        sentence += " " + occupationText;
      } else {
        sentence = this.getPronounInitialCaps() + " was ";
        sentence += StringUtils.getIndefiniteArticle(occupationText);
        sentence += " " + occupationText;
      }
    }

    this.addFullSentence(sentence);
  }

  getAtSea(vitalPlaceObj, eventPlaceObj) {
    if (vitalPlaceObj) {
      if (eventPlaceObj && eventPlaceObj.atSea) {
        let shipName = eventPlaceObj.shipName;
        if (shipName) {
          return " aboard ''" + shipName + "''";
        }
      }
    } else {
      if (eventPlaceObj) {
        if (eventPlaceObj.atSea) {
          let shipName = eventPlaceObj.shipName;
          let atSeaString = "at sea";
          if (shipName) {
            atSeaString = "at sea aboard ''" + shipName + "''";
          }
          return " " + atSeaString;
        } else {
          let shipName = eventPlaceObj.shipName;
          if (shipName) {
            let atSeaString = "aboard //" + shipName + "''";
            return " " + atSeaString;
          }
        }
      }
    }
    return "";
  }

  addAtSea(vitalPlaceObj, eventPlaceObj) {
    this.addToSentence(this.getAtSea(vitalPlaceObj, eventPlaceObj));
  }

  addAtSeaAsSeparateSentence(vitalPlaceObj, eventPlaceObj, typeString) {
    let atSea = this.getAtSea(vitalPlaceObj, eventPlaceObj);

    if (atSea) {
      let sentence = this.getPersonNameOrPronoun();

      const toPast = { birth: "was born", marriage: "married", death: "died" };

      let pastTense = toPast[typeString];
      if (!pastTense) {
        pastTense = "was";
      }

      sentence += " " + pastTense + atSea;
      this.addFullSentence(sentence);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions to build narrative for each record type
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  buildRegistrationStringOfType(typeString) {
    let gd = this.eventGd;

    let quarter = this.getQuarterName(gd.inferEventQuarter());

    let year = gd.inferEventYear();
    let dateObj = gd.inferEventDateObj();
    let dateString = gd.inferEventDate();
    let registrationDistrict = gd.registrationDistrict;
    let eventPlaceObj = gd.inferEventPlaceObj();

    // ageAtEvent - generally we only want to include this if it is included in the record
    // we don't want to compute it as that might give the misleading idea that the record contains
    // the age.
    let ageAtEvent = gd.ageAtEvent;
    if (!ageAtEvent && typeString == "death") {
      ageAtEvent = gd.ageAtDeath;
    }

    this.optionsSubcategory = typeString + "Reg";

    let isDateTheRegistrationDate = isRegistrationEventDateTheRegistrationDate(gd);

    let hasAdditionalDate = false;
    if (isDateTheRegistrationDate) {
      if (typeString == "birth") {
        let eventDateString = gd.inferEventDate();
        let birthDateString = gd.inferBirthDate();
        if (gd.role && gd.role != Role.Primary) {
          if (gd.primaryPerson && gd.primaryPerson.birthDate) {
            birthDateString = gd.primaryPerson.birthDate.getDateString();
          }
        }
        if (birthDateString != eventDateString) {
          hasAdditionalDate = true;
        }
      } else if (typeString == "death") {
        let eventDateString = gd.inferEventDate();
        let deathDateString = gd.inferDeathDate();
        if (gd.role && gd.role != Role.Primary) {
          if (gd.primaryPerson && gd.primaryPerson.deathDate) {
            deathDateString = gd.primaryPerson.deathDate.getDateString();
          }
        }
        if (deathDateString != eventDateString) {
          hasAdditionalDate = true;
        }
      }
    }

    let isPlaceTheRegistrationPlace = false;
    let isRegCountry = gd.isRecordInCountry("United Kingdom") || gd.isRecordInCountry("Ireland");
    if (registrationDistrict && (isRegCountry || !eventPlaceObj)) {
      isPlaceTheRegistrationPlace = true;
    }

    if (!isDateTheRegistrationDate) {
      // sometimes there is no event date but there is a marriage date
      // or this can happen for FS birth reg where the birth date is known
      // but the registration date is not
      if (typeString == "marriage" && gd.marriageDate) {
        dateObj = new DateObj();
        dateObj.dateString = gd.marriageDate;
        dateString = gd.marriageDate;
        year = dateObj.getYearString();
      } else if (typeString == "birth") {
        if (gd.role && gd.role != Role.Primary) {
          if (gd.primaryPerson && gd.primaryPerson.birthDate) {
            dateObj = gd.primaryPerson.birthDate;
          }
        } else {
          dateObj = gd.inferBirthDateObj();
        }
        if (dateObj) {
          dateString = dateObj.getDateString();
        } else {
          dateString = gd.inferBirthDate();
        }
      } else if (typeString == "death") {
        dateObj = gd.inferDeathDateObj();
        dateString = gd.inferDeathDate();
      }
    }

    let spouseName = "";
    let spouseAge = "";
    let spouseParents = undefined;
    let spouseGender = "";
    if (gd.spouses && gd.spouses.length == 1) {
      let spouse = gd.spouses[0];
      if (spouse.name) {
        spouseName = spouse.name.inferFullName();
      }
      if (spouse.age) {
        spouseAge = spouse.age;
      }
      if (spouse.parents) {
        spouseParents = gd.inferSpouseParentNamesForDataString(spouse);
      }
      if (spouse.personGender) {
        spouseGender = spouse.personGender;
      } else {
        if (gd.personGender) {
          if (gd.personGender == "male") {
            spouseGender = "female";
          } else if (gd.personGender == "female") {
            spouseGender = "male";
          }
        }
      }
    }
    const toPast = { birth: "was born", marriage: "married", death: "died" };

    if (isDateTheRegistrationDate) {
      this.optionsSubsection = "Reg";
      let sentenceStructure = this.getSubcatOption("sentenceStructure");

      if (sentenceStructure == "oneSentence") {
        // One sentence format
        if (gd.role && gd.role != Role.Primary) {
          this.startSentence("The " + typeString + " of " + this.getPossessiveNamePlusPrimaryPerson());
        } else {
          let possessiveName = this.getPossessiveName();
          this.startSentence(possessiveName + " " + typeString);
          this.addAgeForMainSentence(ageAtEvent);
        }

        if (hasAdditionalDate) {
          if (typeString == "birth") {
            let birthDateObj = gd.inferBirthDateObj();
            if (birthDateObj) {
              this.addDateToSentence(this.formatDateObj(birthDateObj, true));
            }
          } else if (typeString == "death") {
            let deathDateObj = gd.inferDeathDateObj();
            if (deathDateObj) {
              this.addDateToSentence(this.formatDateObj(deathDateObj, true));
            }
          }
        }
        const mmn = gd.mothersMaidenName;
        if (mmn) {
          this.addMmnForMainSentence(mmn);
        } else {
          this.addParentageForMainSentence();
        }

        if (spouseName) {
          if (typeString == "death") {
            this.addSpouseOfForMainSentence(spouseName);
          } else {
            this.addToSentence("to " + spouseName);
          }
          this.addAgeForMainSentence(spouseAge);
        }
      } else {
        // Two sentence format
        let pastTense = toPast[typeString];
        if (gd.role && gd.role != Role.Primary) {
          this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
        } else {
          this.startSentence(this.getPersonNameOrPronoun());
          this.addAgeForMainSentence(ageAtEvent);
        }

        if (spouseName && typeString == "death") {
          this.addSpouseOfForMainSentence(spouseName);
          this.addAgeForMainSentence(spouseAge);
        }

        this.addToSentence(pastTense);

        if (spouseName && typeString == "marriage") {
          this.addToSentence(spouseName);
          this.addAgeForMainSentence(spouseAge);
        }
        let year = gd.inferEventYear();
        if (dateString != year && !quarter) {
          this.addDateToSentence(this.formatDateObj(dateObj, true));
        } else if (year) {
          if (quarter == "Jan-Feb-Mar") {
            let yearNum = DateUtils.getYearNumFromYearString(year);
            if (yearNum) {
              yearNum -= 1;
              this.addToSentence("in late " + yearNum + "/early " + year);
            } else {
              this.addToSentence("in " + year);
            }
          } else {
            this.addToSentence("in " + year);
          }
        }
        let pronoun = this.getPossessivePronounInitialCaps();
        if (!spouseName) {
          if (gd.role && gd.primaryPerson) {
            pronoun = this.getPossessivePronounForGenderInitialCaps(gd.primaryPerson.gender);
          } else {
            pronoun = this.getPossessivePronounInitialCaps();
          }
          if (pronoun == "Their") {
            pronoun = "The";
          }
        }
        this.startSentence(pronoun + " " + typeString);
      }

      this.addToSentence("was registered");

      if (sentenceStructure == "oneSentence" || sentenceStructure == "twoSentencesDate") {
        if (quarter) {
          this.addToSentence("in the " + quarter + " quarter of " + this.highlightDate(year));
        } else {
          // if the event date is just a subset of the birth or death date then leave it out
          let eventDateString = gd.inferEventDate();
          if (typeString == "birth") {
            let birthDateString = gd.inferBirthDate();
            if (
              !hasAdditionalDate ||
              !birthDateString ||
              !(eventDateString && birthDateString.endsWith(eventDateString))
            ) {
              this.addDateToSentence(this.formatDateObj(dateObj, true));
            }
          } else if (typeString == "death") {
            let deathDateString = gd.inferDeathDate();
            if (
              !hasAdditionalDate ||
              !deathDateString ||
              !(eventDateString && deathDateString.endsWith(eventDateString))
            ) {
              this.addDateToSentence(this.formatDateObj(dateObj, true));
            }
          } else {
            this.addDateToSentence(this.formatDateObj(dateObj, true));
          }
        }
      }
    } else {
      this.optionsSubsection = "Evt";

      let pastTense = toPast[typeString];

      if (gd.role && gd.role != Role.Primary) {
        this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
        this.addToSentence(pastTense);
      } else {
        this.startSentence(this.getPersonNameOrPronoun());

        if (ageAtEvent && typeString == "marriage") {
          this.addAgeForMainSentence(ageAtEvent);
        }
        this.addParentageForMainSentence();
        this.addToSentence(pastTense);
        if (ageAtEvent && typeString != "marriage") {
          this.addAgeForMainSentence(ageAtEvent);
        }
      }

      if (typeString == "marriage") {
        if (spouseName) {
          this.addToSentence(spouseName);
          this.addAgeForMainSentence(spouseAge);
          this.addParentageForMainSentenceGivenParentsAndGender(spouseParents, spouseGender);
        }
      }

      this.addDateWithPreposition(dateObj);
    }

    if (isPlaceTheRegistrationPlace && registrationDistrict) {
      let districtFormat = this.getSubcatOption("regDistrictFormat", "Reg");

      if (districtFormat == "theDistrict") {
        let addedDistrict = false;
        let eventYearNum = DateUtils.getYearNumFromYearString(gd.inferEventYear());
        if (gd.isRecordInCountry("Ireland") && eventYearNum && eventYearNum >= 1864) {
          this.addToSentence("in the " + registrationDistrict + " Superintendent Registrar's District");
        } else {
          this.addToSentence("in the " + registrationDistrict + " district");
        }
      } else if (districtFormat == "districtName") {
        this.addToSentence("in " + registrationDistrict);
      } else if (districtFormat == "districtCounty") {
        this.addToSentence("in " + registrationDistrict);
        let county = gd.inferEventCounty();
        if (county) {
          this.addCommaSpaceToSentence();
          this.addToSentence(county);
        }
      }
    } else if (eventPlaceObj) {
      this.addFullPlaceWithPreposition(eventPlaceObj);
    } else {
      // could use the birth/death/marriage place
      if (typeString == "birth") {
        let birthPlaceObj = gd.inferBirthPlaceObj();
        if (birthPlaceObj) {
          this.addFullPlaceWithPreposition(birthPlaceObj);
        }
      } else if (typeString == "death") {
        let deathPlaceObj = gd.inferDeathPlaceObj();
        if (deathPlaceObj) {
          this.addFullPlaceWithPreposition(deathPlaceObj);
        }
      }
    }

    this.terminateSentence();

    this.addParentageAsSeparateSentence();
    this.addAgeAsSeparateSentence(ageAtEvent);
    this.addMmnAsSeparateSentence(gd.mothersMaidenName);
    this.addSpouseOfAsSeparateSentence(spouseName);
    this.addAtSeaAsSeparateSentence("", gd.eventPlace, typeString);
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
    let placeObj = gd.inferBirthPlaceObj();

    this.startSentence(this.getPersonNameOrPronoun());

    let primaryPersonName = gd.inferPrimaryPersonFullName();
    if (gd.role && gd.role != Role.Primary) {
      if (gd.role == Role.Parent && primaryPersonName) {
        // This is a record for one of the parents
        // "X and X's child Z"
        if (gd.spouses && gd.spouses[0] && gd.spouses[0].name && gd.spouses[0].name.name) {
          this.addToSentence("and " + gd.spouses[0].name.name);
        }
        this.addToSentenceNoSpace("'s " + getPrimaryPersonChildTerm(gd) + " " + primaryPersonName);
      } else {
        this.addToSentence(this.getPossessiveNamePlusPrimaryPerson());
      }
      // inferBirthDate will not return the date of the primary person's birth
      dateObj = gd.inferEventDateObj();
      placeObj = gd.inferEventPlaceObj();
    } else {
      this.addParentageForMainSentence();
    }

    this.addToSentence("was born"); // "was" is OK because we never use "They" at start

    this.addDateWithPreposition(dateObj);
    this.addEventPlaceWithPrepositionOrRd(gd, false, placeObj);
    this.addAtSea(placeObj, gd.eventPlace);

    this.terminateSentence();

    this.addParentageAsSeparateSentence();
  }

  buildDeathString() {
    let gd = this.eventGd;
    let dateObj = gd.inferDeathDateObj();
    let placeObj = gd.inferDeathPlaceObj();

    if (gd.role && gd.role != Role.Primary) {
      this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
      // inferDeathDate will not return the date of the primary person's death
      dateObj = gd.inferEventDateObj();
      placeObj = gd.inferEventPlaceObj();
    } else {
      this.startSentence(this.getPersonNameOrPronoun());
      this.addParentageForMainSentence();
    }

    this.addToSentence("died");

    let ageAtEvent = gd.inferAgeAtEventAsString();
    this.addAgeForMainSentence(ageAtEvent);

    this.addDateWithPreposition(dateObj);
    if (placeObj) {
      this.addPlaceWithPreposition(placeObj);
      this.addAtSea(placeObj, gd.eventPlace);
    } else {
      let residencePlaceObj = gd.inferResidencePlaceObj();
      if (residencePlaceObj) {
        this.addToSentence("residing");
        this.addPlaceToSentence(this.getPlaceWithPrepositionFromPlaceObj(residencePlaceObj));
      }
    }
    this.terminateSentence();

    this.addAgeAsSeparateSentence(ageAtEvent);
    this.addParentageAsSeparateSentence();
  }

  buildBaptismString() {
    let gd = this.eventGd;
    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    let baptisedString = "baptised";
    if (this.options.narrative_general_spelling == "en_us") {
      baptisedString = "baptized";
    }

    let birthDate = gd.birthDate;
    if (gd.role && gd.role != Role.Primary) {
      this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
      birthDate = gd.inferPrimaryPersonBirthDateObj();
    } else {
      this.startSentence(this.getPersonNameOrPronoun());
      this.addParentageForMainSentence();
    }
    this.addToSentence("was");

    if (birthDate && this.options.narrative_baptism_includeBirthDate) {
      this.addToSentence("born");
      this.addDateToSentence(this.formatDateObj(birthDate, true));
      if (this.options.narrative_baptism_sentenceStructure == "parentsBornAndBap") {
        this.addToSentence("and");
      } else {
        this.addToSentenceNoSpace(";");
      }
    }

    this.addToSentence(baptisedString);

    this.addDateWithPreposition(dateObj);
    this.addFullPlaceWithPreposition(placeObj);

    // sometimes a baptism has a death date. (e.g. germany_baptism_1840_johanna_hartmann)
    if (this.options.narrative_baptism_includeDeathDate) {
      let deathDateObj = gd.inferDeathDateObj();
      if (deathDateObj) {
        this.addToSentence("and died");
        this.addDateToSentence(this.formatDateObj(deathDateObj, true));
      }
    }

    this.terminateSentence();

    this.addParentageAsSeparateSentence();
  }

  buildConfirmationString() {
    let gd = this.eventGd;
    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    let baptisedString = "confirmed";

    let birthDate = gd.birthDate;
    if (gd.role && gd.role != Role.Primary) {
      this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
      birthDate = gd.inferPrimaryPersonBirthDateObj();
    } else {
      this.startSentence(this.getPersonNameOrPronoun());
      this.addParentageForMainSentence();
    }
    this.addToSentence("was");

    if (birthDate && this.options.narrative_confirmation_includeBirthDate) {
      this.addToSentence("born");
      this.addDateToSentence(this.formatDateObj(birthDate, true));
      if (this.options.narrative_confirmation_sentenceStructure == "parentsBornAndConf") {
        this.addToSentence("and");
      } else {
        this.addToSentenceNoSpace(";");
      }
    }

    this.addToSentence(baptisedString);

    this.addDateWithPreposition(dateObj);
    this.addFullPlaceWithPreposition(placeObj);

    this.terminateSentence();

    this.addParentageAsSeparateSentence();
  }

  buildMarriageString() {
    let gd = this.eventGd;
    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    let ageAtEvent = gd.inferAgeAtEventAsString();

    let spouseName = "";
    let spouseAge = "";
    let spouseParents = undefined;
    let spouseGender = "";
    if (gd.spouses && gd.spouses.length == 1) {
      let spouse = gd.spouses[0];
      if (spouse.name) {
        spouseName = spouse.name.inferFullName();
      }
      if (spouse.age) {
        spouseAge = spouse.age;
      }
      if (spouse.parents) {
        spouseParents = gd.inferSpouseParentNamesForDataString(spouse);
      }
      if (spouse.personGender) {
        spouseGender = spouse.personGender;
      }
    }

    if (gd.role && gd.role != Role.Primary) {
      this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
      this.addToSentence("married");
    } else {
      this.startSentence(this.getPersonNameOrPronoun());
      this.addAgeForMainSentence(ageAtEvent);
      this.addParentageForMainSentence();
      this.addToSentence("married");
    }

    if (spouseName) {
      spouseName = StringUtils.changeAllCapsWordsToInitialCaps(spouseName);
      this.addToSentence(spouseName);
      this.addAgeForMainSentence(spouseAge);
      this.addParentageForMainSentenceGivenParentsAndGender(spouseParents, spouseGender);
    }

    if (gd.recordSubtype && gd.recordSubtype == RecordSubtype.Banns && (dateObj || place)) {
      this.startSentence("The banns were read");
    }

    if (gd.marriageDate) {
      // sometimes there is a specific marriage date
      dateObj = new DateObj();
      dateObj.dateString = gd.marriageDate;
      this.addDateToSentence(this.formatDateObj(dateObj, true));
    } else if (dateObj) {
      let prepSuffix = "";
      if (gd.recordSubtype && gd.recordSubtype == RecordSubtype.MarriageOrBanns) {
        prepSuffix = "or after";
      }
      this.addDateToSentence(this.formatDateObj(dateObj, true, prepSuffix));
    }
    this.addFullPlaceWithPreposition(placeObj);
    this.terminateSentence();

    this.addAgeAsSeparateSentence(ageAtEvent);
    this.addParentageAsSeparateSentence();
  }

  buildBurialString() {
    let gd = this.eventGd;

    let burialDateObj = gd.eventDate;
    let deathDateObj = gd.deathDate;

    if (gd.role && gd.role != Role.Primary) {
      this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
      deathDateObj = gd.inferPrimaryPersonDeathDateObj();
    } else {
      this.startSentence(this.getPersonNameOrPronoun());
    }

    let age = gd.ageAtDeath;
    if (!age) {
      age = gd.ageAtEvent;
    }
    this.addAgeForMainSentence(age);

    if (!gd.role) {
      this.addParentageForMainSentence();
    }

    if (deathDateObj && burialDateObj && deathDateObj.dateString != burialDateObj.dateString) {
      this.addToSentence("died");
      this.addDateWithPreposition(deathDateObj);
      this.addToSentence("and was buried");
      this.addDateWithPreposition(burialDateObj);
    } else if (gd.recordType == RT.DeathOrBurial) {
      this.addToSentence("died or was buried");
      this.addDateWithPreposition(burialDateObj);
    } else if (burialDateObj) {
      this.addToSentence("was buried");
      this.addDateWithPreposition(burialDateObj);
    } else if (deathDateObj) {
      this.addToSentence("died");
      this.addDateWithPreposition(deathDateObj);
      this.addToSentence("and was buried");
    } else {
      this.addToSentence("was buried");
    }

    this.addEventPlaceWithPrepositionOrRd(gd);

    this.terminateSentence();

    this.addAgeAsSeparateSentence(age);
    this.addParentageAsSeparateSentence();
  }

  buildCremationString() {
    let gd = this.eventGd;
    let cremationDateObj = gd.eventDate;
    let deathDateObj = gd.deathDate;

    let placeObj = gd.inferEventPlaceObj();

    this.startSentence(this.getPersonNameOrPronoun());

    if (deathDateObj && cremationDateObj) {
      this.addToSentence("died");
      this.addDateWithPreposition(deathDateObj);
      this.addToSentence("and was cremated");
      this.addDateWithPreposition(cremationDateObj);
    } else if (cremationDateObj) {
      this.addToSentence("was cremated");
      this.addDateWithPreposition(cremationDateObj);
    } else if (deathDateObj) {
      this.addToSentence("died");
      this.addDateWithPreposition(deathDateObj);
      this.addToSentence("and was cremated");
    } else {
      this.addToSentence("was cremated");
    }

    this.addFullPlaceWithPreposition(placeObj);
    this.terminateSentence();
  }

  buildMemorialString() {
    let gd = this.eventGd;

    let placeObj = gd.inferEventPlaceObj();

    let deathDateObj = gd.inferDeathDateObj();

    this.startSentence(this.getPersonNameOrPronoun());
    this.addToSentence("was mentioned on a memorial");

    this.addFullPlaceWithPreposition(placeObj);
    if (deathDateObj) {
      this.addToSentence("with a death date of");
      this.addToSentence(this.formatDateObj(deathDateObj, false));
    }
    this.terminateSentence();
  }

  buildObituaryString() {
    let gd = this.eventGd;

    let eventDateObj = gd.inferEventDateObj();
    let eventPlaceObj = gd.inferEventPlaceObj();
    let deathDateObj = gd.inferDeathDateObj();
    let deathPlaceObj = gd.inferDeathPlaceObj();
    let age = "";

    this.startSentence(this.getPersonNameOrPronoun());
    this.addParentageForMainSentence();

    if (gd.role && gd.role != Role.Primary) {
      let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();
      let otherName = gd.inferPrimaryPersonFullName();
      if (relationship || otherName) {
        this.addToSentence("was mentioned in the obituary of");

        if (relationship) {
          let pronoun = this.getPossessivePronounInitialCaps().toLowerCase();
          this.addToSentence(pronoun + " " + relationship);
        }

        if (otherName) {
          this.addToSentence(otherName);
        }
      } else {
        this.addToSentence("was mentioned in an obituary");
      }
    } else {
      this.addToSentence("was in an obituary");
    }

    if (eventDateObj && (!deathDateObj || eventDateObj.getDateString() != deathDateObj.getDateString())) {
      this.addDateWithPreposition(eventDateObj);
    }
    if (eventPlaceObj) {
      let useEventPlaceAsWell = true;
      if (deathPlaceObj) {
        let eventPlaceFullString = eventPlaceObj.inferFullPlaceString();
        let deathPlaceString = deathPlaceObj.inferPlaceString();
        if (deathPlaceString == eventPlaceFullString) {
          useEventPlaceAsWell = false;
        }
      }
      if (useEventPlaceAsWell) {
        this.addPlaceWithPreposition(eventPlaceObj);
      }
    }

    if (deathDateObj) {
      this.startSentence(this.getPersonPronounOrNameIfNoGender() + " died");

      age = gd.ageAtDeath;
      if (!age) {
        age = gd.ageAtEvent;
      }
      this.addAgeForMainSentence(age);
      this.addDateWithPreposition(deathDateObj);
      this.addPlaceWithPreposition(deathPlaceObj);
    }
    this.terminateSentence();

    this.addAgeAsSeparateSentence(age);
    this.addParentageAsSeparateSentence();
  }

  buildBirthOrBaptismString() {
    // This can happen in Ancestry, especially for child births or baptisms
    // Can also happen in BDM indexes (e.g. Tasmania) where the index doesn't say if it is
    // a birth registration or a baptism
    let gd = this.eventGd;
    let eventDateObj = gd.inferEventDateObj();
    let eventPlaceObj = gd.inferEventPlaceObj();
    let birthDateObj = gd.inferBirthDateObj();
    let birthPlaceObj = gd.inferBirthPlaceObj();

    let hasDifferentBirthDate = false;
    if (gd.birthDate && eventDateObj && eventDateObj.getDateString() != birthDateObj.getDateString()) {
      hasDifferentBirthDate = true;
    }

    let hasDifferentBirthPlace = false;
    if (
      gd.birthPlace &&
      eventPlaceObj &&
      eventPlaceObj.inferFullPlaceString() != birthPlaceObj.inferFullPlaceString()
    ) {
      hasDifferentBirthPlace = true;
    }

    let baptisedString = "baptised";
    if (this.options.narrative_general_spelling == "en_us") {
      baptisedString = "baptized";
    }

    if (gd.role && gd.role != Role.Primary) {
      this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
    } else {
      this.startSentence(this.getPersonNameOrPronoun());
      this.addParentageForMainSentence();
    }

    if (hasDifferentBirthDate) {
      this.addToSentence("was born");
      this.addDateWithPreposition(birthDateObj);
      this.addToSentence("and " + baptisedString + " or registered");
      this.addDateWithPreposition(eventDateObj);
      if (hasDifferentBirthPlace) {
        this.addFullPlaceWithPreposition(eventPlaceObj);
        this.addToSentence("(born");
        if (birthPlaceObj.originalPlaceString) {
          this.addPlaceToSentence(this.getPlaceWithPreposition(birthPlaceObj.originalPlaceString));
        } else {
          this.addFullPlaceWithPreposition(birthPlaceObj);
        }
        this.addToSentenceNoSpace(")");
      } else if (eventPlaceObj) {
        this.addFullPlaceWithPreposition(eventPlaceObj);
      } else if (birthPlaceObj) {
        this.addCommaSpaceToSentence();
        this.addToSentence("born");
        this.addFullPlaceWithPreposition(birthPlaceObj);
      }
    } else {
      this.addToSentence("was born or " + baptisedString);
      this.addDateWithPreposition(eventDateObj);
      if (hasDifferentBirthPlace) {
        this.addFullPlaceWithPreposition(eventPlaceObj);
        this.addToSentence("(born");
        this.addFullPlaceWithPreposition(birthPlaceObj);
        this.addToSentenceNoSpace(")");
      } else if (eventPlaceObj) {
        this.addFullPlaceWithPreposition(eventPlaceObj);
      } else if (birthPlaceObj) {
        this.addFullPlaceWithPreposition(birthPlaceObj);
      }
    }

    // sometimes a baptism has a death date. (e.g. germany_baptism_1840_johanna_hartmann)
    if (gd.deathDate) {
      this.addToSentence("and died");
      this.addDateToSentence(this.formatDateObj(gd.inferDeathDateObj(), true));
    }

    this.terminateSentence();

    this.addParentageAsSeparateSentence();
  }

  buildCensusString() {
    let gd = this.eventGd;
    let options = this.options;
    let builder = this;
    let collection = this.getCollection();

    let structuredHousehold = buildStructuredHousehold(gd);
    let selectedStructuredMember = undefined;
    let relatedToPerson = undefined;
    if (structuredHousehold) {
      selectedStructuredMember = structuredHousehold.selectedMember;
      if (selectedStructuredMember) {
        if (selectedStructuredMember.relationTo) {
          relatedToPerson = selectedStructuredMember.relationTo;
        } else if (
          structuredHousehold.head &&
          structuredHousehold.head.personIndex < selectedStructuredMember.personIndex
        ) {
          // sometimes this is a pauper and the "head" is also a pauper
          // maybe some relationships are not valid to be head
          // for now just check if they are the same
          if (
            selectedStructuredMember.gdMember.relationship &&
            selectedStructuredMember.gdMember.relationship != structuredHousehold.head.gdMember.relationship
          ) {
            relatedToPerson = structuredHousehold.head;
          }
        }
      }
    }

    function getHeadOfHouseholdNameIfNotSelected(gd) {
      let member = gd.getHeadOfHouseholdMemberIfNotSelected();
      if (member) {
        return member.name;
      }
      return "";
    }

    function getInYearCensusPart(year) {
      let result = "In the " + builder.highlightDate(year);
      let usedSubtype = false;
      if (gd.recordSubtype) {
        if (gd.recordSubtype == RecordSubtype.HouseholdClericalSurveys) {
          result += " household clerical survey";
          usedSubtype = true;
        }
      }
      if (!usedSubtype) {
        if (year == "1939") {
          result += " register";
        } else {
          result += " census";
        }
      }
      return result;
    }

    function getCensusDatePart(year) {
      let part1Option = options.narrative_census_censusDatePartFormat;
      let result = "";
      if (part1Option == "inCensusTitle") {
        if (collection && collection.title) {
          result = "In the " + collection.title;
        } else {
          result = getInYearCensusPart(year);
        }
      } else if (part1Option == "inYearCensus") {
        result = getInYearCensusPart(year);
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
          // want to start with an upper case letter
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
        let headName = getHeadOfHouseholdNameIfNotSelected(gd);
        if (relatedToPerson) {
          headName = relatedToPerson.gdMember.name;
        }

        let relationshipToString = "";
        if (relationship) {
          if (relationship == "head") {
            relationshipToString = "head of household";
          } else if (relationship == "wife") {
            if (selectedStructuredMember && selectedStructuredMember.husband) {
              relationshipToString = "wife of " + selectedStructuredMember.husband.gdMember.name;
            }
          } else if (relationship == "son" || relationship == "daughter") {
            if (selectedStructuredMember && selectedStructuredMember.father) {
              relationshipToString = relationship + " of " + selectedStructuredMember.father.gdMember.name;
              // We could add mother also but there is no guarantee that she is the
              // mother - she could be a later wife
            } else if (selectedStructuredMember && selectedStructuredMember.mother) {
              relationshipToString = relationship + " of " + selectedStructuredMember.mother.gdMember.name;
            }
          }

          if (!relationshipToString) {
            if (headName) {
              relationshipToString = relationship + " of " + headName;
            } else {
              relationshipToString = relationship;
            }
          }
        }

        if (relationship && maritalStatus) {
          if (relationship.includes("head")) {
            result += " the " + maritalStatus + " " + relationshipToString;
          } else {
            let article = headName ? "the" : "a";
            if (relationship == "wife") {
              result += " " + article + " " + relationshipToString;
            } else {
              result += " " + article + " " + maritalStatus + " " + relationshipToString;
            }
          }
        } else if (relationship) {
          if (headName || relationship == "head") {
            result += " the " + relationshipToString;
          } else {
            // "was the scholar at ..." does not sound right
            result += " a " + relationshipToString;
          }
        } else if (maritalStatus) {
          if (options.narrative_census_wasPartFormat == "was") {
            result += " recorded as";
          }
          result += " " + maritalStatus;
        }
      } else if (structuredHousehold) {
        let listParts = [];
        let startIndex = 0;
        let endIndex = structuredHousehold.members.length - 1;
        if (selectedStructuredMember) {
          if (relatedToPerson) {
            startIndex = relatedToPerson.personIndex;
          } else if (selectedStructuredMember.lastHead) {
            startIndex = selectedStructuredMember.lastHead.personIndex;
          }

          for (let memberIndex = selectedStructuredMember.personIndex + 1; memberIndex <= endIndex; memberIndex++) {
            let member = structuredHousehold.members[memberIndex];
            if (member.isHead) {
              endIndex = memberIndex - 1;
              break;
            }
          }
        }

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

          let headMember = gd.getHeadOfHouseholdMemberIfNotSelected();

          if (relationship.includes("head") || relationship == "wife") {
            isHeadOrWife = true;

            for (let memberIndex = startIndex; memberIndex <= endIndex; memberIndex++) {
              let member = gd.householdArray[memberIndex];
              if (member.isSelected) continue;
              let thisMemberIsHead = false;
              if ((member.relationship && member.relationship.includes("head")) || member == headMember) {
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

              if (member.relationship == "son" || member.relationship == "daughter") {
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
            let children = undefined;
            if (selectedStructuredMember && selectedStructuredMember.father) {
              hasFather = true;
              children = selectedStructuredMember.father.children;
            }
            if (selectedStructuredMember && selectedStructuredMember.mother) {
              hasMother = true;
              if (!children) {
                children = selectedStructuredMember.mother.children;
              }
            }

            if (children) {
              for (let child of children) {
                let member = child.gdMember;
                if (!member.isSelected) {
                  siblingCount++;
                  if (member.relationship == "son") {
                    if (!firstSiblingType) {
                      firstSiblingType = "brother";
                    }
                  } else if (member.relationship == "daughter") {
                    if (!firstSiblingType) {
                      firstSiblingType = "sister";
                    }
                  }
                }
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
              if (childMaritalStatus != "none" && childMaritalStatus != "mixed") {
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

              if (childMaritalStatus != "none" && childMaritalStatus != "mixed") {
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
            let pronoun = builder.getPossessivePronounInitialCaps().toLowerCase();
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

            let headName = getHeadOfHouseholdNameIfNotSelected(gd);

            if (relationship.includes("head")) {
              result += " the head of household";
            } else if (headName) {
              result += " a " + relationship + " in the household of " + headName;
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

    function isClosedEntry() {
      if (year == "1939") {
        if (gd.name && gd.name.forenames) {
          let lcForenames = gd.name.forenames.toLowerCase();
          if (lcForenames == "closed entry") {
            return true;
          }
        }
        if (gd.householdArray) {
          for (let person of gd.householdArray) {
            if (person.isSelected && person.isClosed) {
              return true;
            }
          }
        }
      }
      return false;
    }

    let year = gd.inferEventYear();
    let placeObj = gd.inferEventPlaceObj();

    if (!placeObj && gd.registrationDistrict) {
      placeObj = this.makePlaceObjFromString(gd.registrationDistrict);
    }

    if (!year || !placeObj) {
      this.narrative = "";
      return; // do default generate
    }

    this.narrative = getCensusDatePart(year);
    if (options.narrative_census_sentenceStructure == "comma") {
      this.addCommaSpaceToSentence();
    }

    if (isClosedEntry()) {
      this.addToSentence("a person with a closed entry");
    } else {
      this.addToSentence(this.getPersonNameOrPronoun(true));
    }

    let ageNum = undefined;
    let ageAtEvent = "";
    if (year == "1939" && gd.birthDate && gd.birthDate.dateString) {
      // 1939 register was taken on 29 September 1939 (could store this in collections)
      ageNum = GeneralizedData.getAgeAtDate(gd.birthDate.dateString, "9 September 1939");
      if (ageNum != undefined && ageNum != NaN) {
        ageAtEvent = ageNum.toString();
      }
    } else {
      ageAtEvent = this.getNarrativeAgeString(gd.ageAtEvent);
      if (ageAtEvent) {
        if (/^\d+$/.test(ageAtEvent)) {
          ageNum = parseInt(ageAtEvent);
        } else {
          ageNum = 0; // could be "1/12" for example or "1 month"
        }
      }
    }

    let occupation = this.getCleanOccupation();

    let relationship = gd.relationshipToHead;
    if (relationship) {
      relationship = relationship.toLowerCase();

      // For example FS can have "other" for a grandson when that detail was not transcribed
      // "x was the other of y" doesn't make a good narrative sentence.
      // Example: https://www.familysearch.org/ark:/61903/1:1:M6TZ-886
      if (relationship == "other") {
        relationship = "";
      }
    }

    let maritalStatus = gd.maritalStatus;
    if (maritalStatus == "widow") {
      maritalStatus = "widowed";
    } else if (maritalStatus == "single") {
      maritalStatus = gd.getTermForUnmarried();

      if (ageNum != undefined && ageNum != NaN && ageNum <= 14) {
        // if less than marriageble age it seems odd to describe them as single
        maritalStatus = "";
      }
    }

    this.addAgeForMainSentence(ageAtEvent);
    this.addOccupationForMainSentence(occupation);

    this.addToSentence("was");
    if (options.narrative_census_wasPartFormat == "wasEnumerated") {
      this.addToSentence("enumerated");
    } else if (options.narrative_census_wasPartFormat == "wasRecorded") {
      this.addToSentence("recorded");
    }

    addHouseholdPartForMainSentence();

    this.addFullPlaceWithPreposition(placeObj);
    this.terminateSentence();

    addHouseholdPartAsSeparateSentence();
    this.addAgeAsSeparateSentence(ageAtEvent);
    this.addOccupationAsSeparateSentence(occupation, relationship);
  }

  buildSlaveScheduleString() {
    let gd = this.eventGd;

    let eventDateObj = gd.inferEventDateObj();
    let eventPlaceObj = gd.inferEventPlaceObj();

    this.narrative = this.getPersonNameOrPronoun();

    this.addToSentence("was recorded");
    this.addAgeForMainSentence(gd.ageAtEvent);
    this.addToSentence("in a slave schedule");

    this.addDateWithPreposition(eventDateObj);
    this.addFullPlaceWithPreposition(eventPlaceObj);

    if (gd.typeSpecificData) {
      let role = gd.typeSpecificData.role;
      if (role == "Enslaved Person") {
        let wasFugitive = gd.typeSpecificData.wasFugitive;
        let race = gd.typeSpecificData.race;
        this.addSpaceToContinueSentence();
        if (race) {
          this.addToSentence("as a");
          if (wasFugitive) {
            this.addToSentence("fugitive");
          }
          if (this.personGender) {
            this.addToSentence(this.personGender);
          }
          this.addToSentence(race.toLowerCase() + " enslaved person");
        } else {
          this.addToSentence("as");
          if (this.personGender) {
            if (wasFugitive) {
              this.addToSentence("a fugitive");
            } else {
              this.addToSentence("a");
            }
            this.addToSentence(this.personGender);
          } else {
            if (wasFugitive) {
              this.addToSentence("a fugitive");
            } else {
              this.addToSentence("an");
            }
          }
          this.addToSentence("enslaved person");
        }
      } else if (role == "Slave Owner") {
        this.addSpaceToContinueSentence();
        this.addToSentence("as a slave owner");
        let numEnslavedPeople = gd.typeSpecificData.numEnslavedPeople;
        if (numEnslavedPeople) {
          this.addToSentence("of " + numEnslavedPeople + " enslaved people");
        }
      } else if (role) {
        this.addSpaceToContinueSentence();
        this.addToSentence("as a " + role);
      }
    }

    this.addAgeAsSeparateSentence(gd.ageAtEvent);

    this.terminateSentence();
  }

  buildPopulationRegisterString() {
    let gd = this.eventGd;

    let eventDateObj = gd.inferEventDateObj();
    let eventPlaceObj = gd.inferEventPlaceObj();

    this.narrative = this.getPersonNameOrPronoun();

    let occupationText = this.getOccupationPart(gd.occupation);
    if (occupationText) {
      this.addCommaSpaceToSentence();
      this.addToSentence(occupationText + ",");
    }

    this.addToSentence("was recorded in a population register");

    if (eventDateObj) {
      if (eventDateObj.fromDate && eventDateObj.toDate) {
        this.narrative +=
          " between " +
          this.formatDateObj(eventDateObj.fromDate, false) +
          " and " +
          this.formatDateObj(eventDateObj.toDate, false);
      } else {
        this.addDateWithPreposition(eventDateObj);
      }
    }

    this.addFullPlaceWithPreposition(eventPlaceObj);

    let birthDateObj = gd.inferBirthDateObj();
    let birthPlaceObj = gd.inferBirthPlaceObj();

    if (birthDateObj) {
      this.startSentence(this.getPronounAndPastTenseInitialCaps() + " born");
      this.addDateWithPreposition(birthDateObj);
      this.addPlaceWithPreposition(birthPlaceObj);
    } else if (birthPlaceObj) {
      this.startSentence(this.getPronounAndPastTenseInitialCaps() + " born");
      this.addPlaceWithPreposition(birthPlaceObj);
    }

    this.terminateSentence();
  }

  buildProbateString() {
    let gd = this.eventGd;

    let eventDateObj = gd.inferEventDateObj();
    let deathDateObj = gd.inferDeathDateObj();
    let eventPlaceObj = gd.inferEventPlaceObj();
    let deathPlaceObj = gd.inferDeathPlaceObj();
    let residencePlaceObj = gd.inferResidencePlaceObj();

    let possessiveName = this.getPossessiveName();

    let dateIsWrittenDate = false;
    if (gd.getTypeSpecficDataValue("dateIsWrittenDate")) {
      dateIsWrittenDate = true;
    }

    if (deathDateObj && eventDateObj) {
      let pronoun = this.getPossessivePronounInitialCaps().toLowerCase();
      this.startSentence(this.getPersonNameOrPronoun() + " died");
      this.addDateWithPreposition(deathDateObj);
      if (deathPlaceObj) {
        this.addFullPlaceWithPreposition(deathPlaceObj);
      } else if (residencePlaceObj) {
        this.addToSentence("residing");
        this.addPlaceToSentence(this.getPlaceWithPrepositionFromPlaceObj(residencePlaceObj));
      }
      if (dateIsWrittenDate) {
        this.addToSentence("and " + pronoun + " estate was in the probate process");
      } else {
        this.addToSentence("and " + pronoun + " estate passed probate");
      }
      this.addDateWithPreposition(eventDateObj);
      this.addFullPlaceWithPreposition(eventPlaceObj);
    } else if (deathDateObj) {
      this.startSentence(this.getPersonNameOrPronoun() + " died");
      this.addDateWithPreposition(deathDateObj);
      if (deathPlaceObj) {
        this.addFullPlaceWithPreposition(deathPlaceObj);
      } else if (residencePlaceObj) {
        this.addToSentence("residing");
        this.addPlaceToSentence(this.getPlaceWithPrepositionFromPlaceObj(residencePlaceObj));
      }
    } else if (eventDateObj) {
      if (gd.role && gd.role != Role.Primary) {
        let possessiveName = this.getPossessiveNamePlusPrimaryPerson();
        if (dateIsWrittenDate) {
          this.startSentence("The will of " + possessiveName + " was written");
        } else {
          this.startSentence("The estate of " + possessiveName + " passed probate");
        }
      } else {
        if (dateIsWrittenDate) {
          this.startSentence(possessiveName + " will was written");
        } else {
          this.startSentence(possessiveName + " estate passed probate");
        }
      }
      this.addDateWithPreposition(eventDateObj);
      if (eventPlaceObj) {
        this.addFullPlaceWithPreposition(eventPlaceObj);
      } else if (residencePlaceObj) {
        this.startSentence(this.getPossessivePronounInitialCaps() + " last residence was");
        this.addPlaceToSentence(residencePlaceObj.inferFullPlaceString());
      }
    } else if (this.getPersonNameOrPronoun()) {
      this.startSentence(this.getPersonNameOrPronoun() + " was in a probate record");
    }

    this.terminateSentence();
  }

  buildScottishWillString() {
    let gd = this.eventGd;
    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    let possessiveName = this.getPossessiveName();

    let role = gd.role;

    if (!gd.recordSubtype || gd.recordSubtype == "Probate") {
      if (role && role != Role.Primary) {
        if (role == Role.Witness) {
          this.startSentence(this.getPersonNameOrPronoun() + " witnessed a will that passed probate");
        } else {
          let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();
          this.startSentence(possessiveName + " " + relationship + "'s will passed probate");
        }
      } else {
        if (gd.courtName && gd.courtName != "non-Scottish Court") {
          this.startSentence("Probate of " + possessiveName + " estate endorsed");
        } else {
          this.startSentence("Probate of " + possessiveName + " estate recorded");
        }
      }
    } else if (gd.recordSubtype == "Testament") {
      if (gd.originalConfirmationGrantedDate) {
        this.startSentence("Confirmation was originally granted on " + possessiveName + " estate");
        this.addDateToSentence(this.formatDate(gd.originalConfirmationGrantedDate, true));
        this.addToSentence("and an additional confirmation was granted");
      } else {
        this.startSentence("Confirmation was granted on " + possessiveName + " estate");
      }
    } else if (gd.recordSubtype == "Inventory" || gd.recordSubtype == "AdditionalInventory") {
      this.startSentence("Confirmation was granted on " + possessiveName + " estate");
      if (gd.originalConfirmationGrantedDate) {
        this.addDateToSentence(this.formatDate(gd.originalConfirmationGrantedDate, true));
        this.addToSentence("and an additional inventory was granted");
      }
    } else {
      this.startSentence("Confirmation was granted on " + possessiveName + " estate");
    }

    this.addDateWithPreposition(dateObj);

    if (gd.recordSubtype == "AdditionalInventory") {
      if (gd.grantedDate) {
        this.addCommaSpaceToSentence();
        this.addToSentence("additional inventory granted on");
        this.addDateToSentence(this.formatDate(gd.grantedDate, false));
      } else if (gd.givenUpDate) {
        this.addCommaSpaceToSentence();
        this.addToSentence("additional inventory given up on");
        this.addDateToSentence(this.formatDate(gd.givenUpDate, false));
      }
    }

    if (gd.courtName) {
      if (gd.courtName.startsWith("non-Scot")) {
        this.addToSentence("at a non-Scottish court");
      } else {
        this.addToSentence("at " + gd.courtName);
      }
    } else if (placeObj) {
      this.addFullPlaceWithPreposition(placeObj);
    }

    this.terminateSentence();
  }

  buildWillString() {
    let gd = this.eventGd;

    if (gd.inferEventCountry() == "Scotland" || (gd.courtName && gd.courtName.startsWith("non-Scot"))) {
      this.buildScottishWillString();
      return;
    }

    let dateObj = gd.inferEventDateObj();
    let deathDateObj = gd.inferDeathDateObj();
    let placeObj = gd.inferEventPlaceObj();
    let residencePlaceObj = gd.inferResidencePlaceObj();
    let residenceDateObj = gd.inferResidenceDateObj();
    let typeSpecificData = gd.typeSpecificData;

    let possessiveName = this.getPossessiveName();

    let role = gd.role;

    if (deathDateObj) {
      if (role && role != Role.Primary) {
        let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();
        this.startSentence(possessiveName + " " + relationship + " died");
      } else {
        this.startSentence(this.getPersonNameOrPronoun(true) + " died");
      }

      let hasProbateDate = false;
      if (dateObj) {
        if (dateObj.getDateString() != deathDateObj.getDateString()) {
          // there is a probate date (probably)
          hasProbateDate = true;
        }
      }

      this.addDateWithPreposition(deathDateObj);

      let deathPlaceObj = gd.inferDeathPlaceObj();

      if (deathPlaceObj) {
        this.addFullPlaceWithPreposition(deathPlaceObj);
      } else if (residencePlaceObj) {
        this.addToSentence("residing");
        this.addPlaceToSentence(this.getPlaceWithPrepositionFromPlaceObj(residencePlaceObj));
      } else if (placeObj && !hasProbateDate) {
        this.addFullPlaceWithPreposition(placeObj);
      }

      if (hasProbateDate) {
        this.startSentence(this.getPossessivePronounInitialCaps() + " will passed probate");

        this.addDateWithPreposition(dateObj);
        this.addFullPlaceWithPreposition(placeObj);
      }
    } else {
      let hasOnlyResidenceDate = !dateObj && residenceDateObj ? true : false;
      let hasOnlyResidencePlace = !dateObj && residenceDateObj ? true : false;
      let text = "passed probate or was recorded";
      if (typeSpecificData) {
        if (!hasOnlyResidenceDate) {
          if (typeSpecificData.dateIsWrittenDate) {
            text = "written";
          } else if (typeSpecificData.willDate) {
            text = "written on " + typeSpecificData.willDate + " and passed probate";
          }
        }
      } else if (hasOnlyResidenceDate) {
        text = "was recorded";
      }

      if (role && role != Role.Primary) {
        if (role == Role.Witness) {
          this.narrative = this.getPersonNameOrPronoun() + " witnessed a will that " + text;
        } else {
          let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();
          this.narrative = possessiveName + " " + relationship + "'s will " + text;
        }
      } else {
        this.narrative = possessiveName + " will " + text;
      }

      if (hasOnlyResidenceDate && hasOnlyResidencePlace) {
        this.startSentence("Residence");
        this.addDateWithPreposition(residenceDateObj);
        this.addFullPlaceWithPreposition(residencePlaceObj);
      } else {
        if (dateObj) {
          this.addDateWithPreposition(dateObj);
        } else if (residenceDateObj) {
          this.addDateWithPreposition(residenceDateObj);
        }

        if (placeObj) {
          this.addFullPlaceWithPreposition(placeObj);
        } else {
          this.addFullPlaceWithPreposition(residencePlaceObj);
        }
      }
    }

    this.terminateSentence();
  }

  buildDivorceString() {
    let gd = this.eventGd;

    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    this.startSentence(this.getPersonNameOrPronoun());

    let spouseName = "";
    if (gd.spouses && gd.spouses.length == 1) {
      let spouse = gd.spouses[0];
      if (spouse.name) {
        spouseName = spouse.name.inferFullName();
      }
    }

    if (spouseName) {
      spouseName = StringUtils.changeAllCapsWordsToInitialCaps(spouseName);
      this.addToSentence("was divorced from " + spouseName);
    } else {
      this.addToSentence("was in a divorce record");
    }

    this.addDateWithPreposition(dateObj);
    this.addFullPlaceWithPreposition(placeObj);
    this.terminateSentence();
  }

  buildMilitaryString() {
    let gd = this.eventGd;
    let role = gd.role;

    let eventDate = gd.inferEventDate();
    let deathDate = gd.inferDeathDate();
    let placeObj = gd.inferEventPlaceObj();

    if (role && role != Role.Primary) {
      let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();
      let possessiveName = this.getPossessiveName();
      this.startSentence(possessiveName + " " + relationship);
    } else {
      this.startSentence(this.getPersonNameOrPronoun(false));
    }

    if (deathDate) {
      let branch = gd.militaryBranch;
      if (!branch) {
        if (gd.militaryRegiment) {
          branch = gd.militaryRegiment;
        } else {
          branch = "military";
        }
      } else {
        branch = branch.toLowerCase();
      }

      this.addToSentence("was in the " + branch + " and died");
      this.addDateToSentence(this.formatDate(deathDate, true));

      let deathPlaceObj = gd.inferDeathPlaceObj();
      if (deathPlaceObj) {
        placeObj = deathPlaceObj;
      } else {
        if (gd.burialPlace) {
          placeObj = this.makePlaceObjFromString(gd.burialPlace);
          this.addToSentence("and was buried");
        }
      }
    } else {
      let addedCustomNarrative = false;
      if (gd.recordSubtype) {
        if (gd.recordSubtype == RecordSubtype.WWIDraftRegistration) {
          this.addToSentence("registered for the World War I draft");
          addedCustomNarrative = true;
        } else if (gd.recordSubtype == RecordSubtype.WWIIDraftRegistration) {
          this.addToSentence("registered for the World War II draft");
          addedCustomNarrative = true;
        } else if (gd.recordSubtype == RecordSubtype.WWIIPrisonerOfWar) {
          this.addToSentence("was a prisoner of war in World War II");
          addedCustomNarrative = true;
        }
      }

      if (!addedCustomNarrative) {
        this.addToSentence("was in a military record");
        if (gd.collectionData && gd.collectionData.collectionTitle) {
          let title = gd.collectionData.collectionTitle;
          this.addToSentence("(" + title + ")");
        }
      }
      if (eventDate) {
        this.addDateToSentence(this.formatDate(eventDate, true));
      }
    }

    this.addFullPlaceWithPreposition(placeObj);
    this.terminateSentence();

    let number = gd.serviceNumber;
    let unit = gd.unit;
    if (unit) {
      this.addToSentence(this.getPronounAndPastTenseInitialCaps() + " in the " + unit);
      if (number) {
        this.addToSentence("(service number " + number + ")");
      }
      this.terminateSentence();
    } else if (number) {
      this.addToSentence(this.getPossessivePronounInitialCaps() + " service number was " + number);
      this.terminateSentence();
    }
  }

  buildPassengerListString() {
    let gd = this.eventGd;

    let eventDate = gd.inferEventDate();
    let eventPlaceObj = gd.inferEventPlaceObj();

    let arrivalDate = gd.arrivalDate;
    let arrivalPlace = gd.arrivalPlace;
    let departureDate = gd.departureDate;
    let departurePlace = gd.departurePlace;
    let ageAtEvent = gd.ageAtEvent;

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
      this.startSentence(this.getPersonNameOrPronoun());
      this.addAgeForMainSentence(ageAtEvent);
      this.addToSentence("arrived");

      if (gd.shipName) {
        this.addToSentence("on the ship " + gd.shipName);
      }

      if (arrivalDate) {
        this.addDateToSentence(this.formatDate(arrivalDate, true));
      }

      if (arrivalPlace) {
        this.addPlaceToSentence(this.getPlaceWithPreposition(arrivalPlace));
      }

      if (departurePlace) {
        this.addToSentence("having departed from ");
        this.addPlaceToSentence(departurePlace);
        if (departureDate) {
          this.addDateToSentence(this.formatDate(departureDate, true));
        }
      }
    } else if (isDeparture) {
      this.startSentence(this.getPersonNameOrPronoun() + " departed");

      if (departurePlace) {
        this.addToSentence("from");
        this.addPlaceToSentence(departurePlace);
      }

      if (gd.shipName) {
        this.addToSentence("on the ship " + gd.shipName);
      }

      if (departureDate) {
        this.addDateToSentence(this.formatDate(departureDate, true));
      }

      if (arrivalPlace) {
        this.addToSentence("bound to");
        this.addPlaceToSentence(arrivalPlace);
      }
    } else {
      this.startSentence(this.getPersonNameOrPronoun() + " was a passenger");

      if (gd.shipName) {
        this.addToSentence("on the ship " + gd.shipName);
      }

      if (eventDate) {
        this.addDateToSentence(this.formatDate(eventDate, true));
      }

      this.addFullPlaceWithPreposition(eventPlaceObj);
    }

    this.terminateSentence();
    this.addAgeAsSeparateSentence(ageAtEvent);
  }

  buildNewspaperString() {
    let gd = this.eventGd;

    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    this.startSentence(this.getPersonNameOrPronoun(false, true));

    this.addToSentence("was mentioned in");

    if (gd.newspaperName) {
      this.addToSentence("the " + gd.newspaperName);
    } else {
      this.addToSentence("a newspaper article");
    }

    this.addDateWithPreposition(dateObj);
    this.addFullPlaceWithPreposition(placeObj);

    this.terminateSentence();
  }

  buildBookString() {
    let gd = this.eventGd;

    let dateObj = gd.inferEventDateObj();

    this.startSentence("This person was mentioned in");

    if (gd.bookTitle) {
      this.addToSentence("the book ''" + gd.bookTitle + "''");
    } else {
      this.addToSentence("a book");
    }

    this.addDateWithPreposition(dateObj);
    this.terminateSentence();
  }

  buildJournalString() {
    let gd = this.eventGd;

    let dateObj = gd.inferEventDateObj();

    this.startSentence("This person was mentioned in");

    if (gd.journalName) {
      this.addToSentence("the journal ''" + gd.journalName + "''");
    } else {
      this.addToSentence("a book");
    }

    this.addDateWithPreposition(dateObj);
    this.terminateSentence();
  }

  buildEncyclopediaString() {
    let gd = this.eventGd;

    this.startSentence("This person was mentioned in");

    if (gd.sourceOfData == "wikipedia") {
      this.addToSentence("a Wikipedia entry");
    } else {
      this.addToSentence("an encyclopedia entry");
    }

    this.terminateSentence();
  }

  buildFreedomOfCityString() {
    let gd = this.eventGd;

    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    let formattedDate = undefined;
    if (dateObj) {
      formattedDate = this.formatDateObj(dateObj, true);
    }

    let role = gd.role;
    if (role && role != Role.Primary) {
      let possessiveName = this.getPossessiveName();
      const nameOrPronoun = this.getPersonNameOrPronoun(false, true);
      let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();

      this.startSentence(possessiveName + " " + relationship);
      this.addToSentence(" was admitted into the Freedom of the City");

      if (formattedDate) {
        this.startSentence("Either " + nameOrPronoun + " or " + possessiveName + " child was admitted");
      }
    } else {
      const nameOrPronoun = this.getPersonNameOrPronoun(false, true);
      this.startSentence(nameOrPronoun);

      if (gd.admissionDate) {
        this.addToSentence("was admitted into the Freedom of the City");

        if (gd.parents && gd.parents.father) {
          let possessive = this.getPossessiveName(true);
          this.startSentence("Either " + nameOrPronoun + " or " + possessive + " father was admitted");
        }
      } else {
        this.addToSentence("was mentioned in the Freedom of the City papers");
      }
    }

    if (formattedDate) {
      this.addDateToSentence(formattedDate);
    }

    this.addFullPlaceWithPreposition(placeObj);

    this.terminateSentence();
  }

  buildConvictTransportationString() {
    let gd = this.eventGd;

    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    let formattedDate = undefined;
    if (dateObj) {
      formattedDate = this.formatDateObj(dateObj, true);
    }

    let role = gd.role;
    if (role && role != Role.Primary) {
      let possessiveName = this.getPossessiveName();
      let relationship = gd.getRelationshipOfPrimaryPersonToThisPerson();

      this.startSentence(possessiveName + " " + relationship);
    } else {
      const nameOrPronoun = this.getPersonNameOrPronoun(false, true);
      this.startSentence(nameOrPronoun);
    }

    if (gd.convictionDate || gd.convictionPlace) {
      this.addToSentence("was convicted");
      if (gd.convictionDate) {
        this.addDateToSentence(this.formatDate(gd.convictionDate, true));
      }
      if (gd.convictionPlace) {
        this.addPlaceToSentence(this.getPlaceWithPreposition(gd.convictionPlace));
      }

      if (gd.sentence) {
        this.addToSentence(" and sentenced to " + gd.sentence + " transportation");
      }

      if (gd.transitDate) {
        this.addToSentence("and transported");
        this.addDateToSentence(this.formatDate(gd.transitDate, true));
      }
    } else {
      this.addToSentence("was transported");
      if (formattedDate) {
        this.addDateToSentence(formattedDate);
      }
    }

    if (gd.departurePlace) {
      this.addToSentence("from");
      this.addPlaceToSentence(gd.departurePlace);
    }

    if (gd.arrivalPlace) {
      this.addToSentence("to");
      this.addPlaceToSentence(gd.arrivalPlace);
    } else if (placeObj && placeObj.inferPlaceString() != gd.convictionPlace) {
      this.addToSentence("to");
      this.addPlaceToSentence(placeObj.inferPlaceString());
    }

    if (gd.shipName) {
      this.addToSentence("on the ship ''" + gd.shipName + "''");
    }

    this.terminateSentence();
  }

  buildValuationRollString() {
    let gd = this.eventGd;

    let dateObj = gd.inferEventDateObj();
    let placeObj = gd.inferEventPlaceObj();

    let formattedDate = undefined;
    if (dateObj) {
      formattedDate = this.formatDateObj(dateObj, true);
    }

    const nameOrPronoun = this.getPersonNameOrPronoun(false, true);
    this.startSentence(nameOrPronoun);

    if (gd.status) {
      this.addToSentence("was recorded as a " + gd.status + " in a valuation roll");
    } else {
      this.addToSentence("was recorded in a valuation roll");
    }

    if (formattedDate) {
      this.addDateToSentence(formattedDate);
    }

    this.addFullPlaceWithPreposition(placeObj);

    this.terminateSentence();
  }

  buildDefaultString() {
    const narratives = [
      {
        recordType: RT.NonpopulationCensus,
        string: "was enumerated in a non-population schedule",
      },
      { recordType: RT.ElectoralRegister, string: "was registered to vote" },
      { recordType: RT.CriminalRegister, string: "was in a criminal register" },
      { recordType: RT.Imprisonment, string: "was imprisoned" },
      { recordType: RT.InstitutionInmate, string: "was an inmate" },
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
      { recordType: RT.LandPetition, string: "was in a land petition record" },
      { recordType: RT.LandGrant, string: "was in a land grant record" },
      { recordType: RT.MetisScrip, string: "was in a Métis script record" },
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
      { recordType: RT.LegalRecord, string: "was in a legal record" },
      { recordType: RT.RateBook, string: "was in a rate book" },
      {
        recordType: RT.FamHistOrPedigree,
        string: "was in a family history or pedigree",
      },
      {
        recordType: RT.FamilyTree,
        string: "was in a family tree",
      },
      {
        recordType: RT.Naturalization,
        string: "was in a naturalization record",
      },
      {
        recordType: RT.OtherChurchEvent,
        string: "was recorded in a church event",
      },
      {
        recordType: RT.ChurchRecords,
        string: "was in a church record",
      },
      { recordType: RT.Heraldry, string: "was in a heraldic record" },
      { recordType: RT.GovernmentDocument, string: "was in a government document" },
      { recordType: RT.Diary, string: "was in a diary entry" },
      { recordType: RT.Inquest, string: "was the subject of an inquest" },
      { recordType: RT.Deed, string: "was recorded in a deed" },
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
    let placeObj = gd.inferEventPlaceObj();

    if (gd.role && gd.role != Role.Primary) {
      this.startSentence(this.getPossessiveNamePlusPrimaryPerson());
    } else {
      this.startSentence(this.getPersonNameOrPronoun(false, true));
    }

    this.addToSentence(narrativeCore);
    this.addDateWithPreposition(dateObj);
    this.addFullPlaceWithPreposition(placeObj);
    this.terminateSentence();
  }

  setupForRecordType() {
    let gd = this.eventGd;

    switch (gd.recordType) {
      case RT.BirthRegistration: {
        this.buildFunction = this.buildBirthRegistrationString;
        this.optionsSubcategory = "birthReg";
        break;
      }
      case RT.Birth: {
        this.buildFunction = this.buildBirthString;
        this.optionsSubcategory = "birth";
        break;
      }
      case RT.DeathRegistration: {
        this.buildFunction = this.buildDeathRegistrationString;
        this.optionsSubcategory = "deathReg";
        break;
      }
      case RT.Death: {
        this.buildFunction = this.buildDeathString;
        this.optionsSubcategory = "death";
        break;
      }
      case RT.MarriageRegistration: {
        this.buildFunction = this.buildMarriageRegistrationString;
        this.optionsSubcategory = "marriageReg";
        break;
      }
      case RT.Baptism: {
        this.buildFunction = this.buildBaptismString;
        this.optionsSubcategory = "baptism";
        break;
      }
      case RT.Confirmation: {
        this.buildFunction = this.buildConfirmationString;
        this.optionsSubcategory = "confirmation";
        break;
      }
      case RT.Marriage: {
        this.buildFunction = this.buildMarriageString;
        this.optionsSubcategory = "marriage";
        break;
      }
      case RT.Burial:
      case RT.DeathOrBurial: {
        this.buildFunction = this.buildBurialString;
        this.optionsSubcategory = "burial";
        break;
      }
      case RT.Cremation: {
        this.buildFunction = this.buildCremationString;
        this.optionsSubcategory = "cremation";
        break;
      }
      case RT.Memorial: {
        this.buildFunction = this.buildMemorialString;
        this.optionsSubcategory = "memorial";
        break;
      }
      case RT.Obituary: {
        this.buildFunction = this.buildObituaryString;
        this.optionsSubcategory = "obituary";
        break;
      }
      case RT.BirthOrBaptism: {
        this.buildFunction = this.buildBirthOrBaptismString;
        this.optionsSubcategory = "birthOrBaptism";
        break;
      }
      case RT.Census: {
        this.buildFunction = this.buildCensusString;
        this.optionsSubcategory = "census";
        break;
      }
      case RT.PopulationRegister: {
        this.buildFunction = this.buildPopulationRegisterString;
        break;
      }
      case RT.Probate: {
        this.buildFunction = this.buildProbateString;
        break;
      }
      case RT.Will: {
        this.buildFunction = this.buildWillString;
        this.optionsSubcategory = "will";
        break;
      }
      case RT.Divorce: {
        this.buildFunction = this.buildDivorceString;
        break;
      }
      case RT.Military: {
        this.buildFunction = this.buildMilitaryString;
        this.optionsSubcategory = "military";
        break;
      }
      case RT.PassengerList: {
        this.buildFunction = this.buildPassengerListString;
        this.optionsSubcategory = "passengerList";
        break;
      }
      case RT.Newspaper: {
        this.buildFunction = this.buildNewspaperString;
        this.optionsSubcategory = "newspaper";
        break;
      }
      case RT.SlaveSchedule: {
        this.buildFunction = this.buildSlaveScheduleString;
        this.optionsSubcategory = "slaveSchedule";
        break;
      }
      case RT.Book: {
        this.buildFunction = this.buildBookString;
        this.optionsSubcategory = "book";
        break;
      }
      case RT.Journal: {
        this.buildFunction = this.buildJournalString;
        this.optionsSubcategory = "journal";
        break;
      }
      case RT.Encyclopedia: {
        this.buildFunction = this.buildEncyclopediaString;
        this.optionsSubcategory = "encyclopedia";
        break;
      }
      case RT.FreedomOfCity: {
        this.buildFunction = this.buildFreedomOfCityString;
        this.optionsSubcategory = "encyclopedia";
        break;
      }
      case RT.ConvictTransportation: {
        this.buildFunction = this.buildConvictTransportationString;
        this.optionsSubcategory = "convictTransportation";
        break;
      }
      case RT.ValuationRoll: {
        this.buildFunction = this.buildValuationRollString;
        this.optionsSubcategory = "valuationRoll";
        break;
      }
    }
  }

  buildNarrativeString() {
    // The problem with using apostrophe after the name is that there are rules for when the name
    // ends in s. If we are going to substitute the pref name on insertion then we do not know whether
    // it ends in s. There could be a special code like {prefName} vs {prefNamePossessive}

    this.narrative = "";

    this.setupForRecordType();
    if (this.buildFunction) {
      this.buildFunction();
    }

    if (!this.narrative) {
      this.buildDefaultString();
    }
  }

  getFieldsUsed() {
    let fieldsUsed = {};

    this.setupForRecordType();

    function setUsed(field, value) {
      fieldsUsed[field] = value && value != "no";
    }

    setUsed("age", this.getSubcatOption("includeAge"));
    setUsed("parentage", this.getSubcatOption("includeParentage"));
    setUsed("mmn", this.getSubcatOption("includeMmn"));

    // other possible fields that can be used in narratives
    // spouse name
    // birth date
    // occupation
    // registration district

    return fieldsUsed;
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
  let wtGeneralizedData = GeneralizedData.createFromPlainObject(input.wtGeneralizedData);

  let builder = new NarrativeBuilder(options);
  builder.profileGd = wtGeneralizedData;
  builder.eventGd = eventGeneralizedData;

  if (wtGeneralizedData && wtGeneralizedData.personGender) {
    builder.personGender = wtGeneralizedData.personGender;
  } else if (eventGeneralizedData.personGender) {
    builder.personGender = eventGeneralizedData.personGender;
  } else {
    builder.personGender = eventGeneralizedData.inferPersonGender();
  }

  builder.buildNarrativeString();

  return builder.narrative;
}

function getFieldsUsedInNarrative(eventGd, options) {
  let builder = new NarrativeBuilder(options);
  builder.eventGd = eventGd;
  if (eventGd.personGender) {
    builder.personGender = eventGd.personGender;
  } else {
    builder.personGender = eventGd.inferPersonGender();
  }

  return builder.getFieldsUsed();
}

export { NarrativeBuilder, buildNarrative, getFieldsUsedInNarrative };
