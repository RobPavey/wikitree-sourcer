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

import { RT } from "../../../base/core/record_type.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { NameObj, DateObj, PlaceObj, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";

var eventTypes = [
  {
    recordType: RT.BirthOrBaptism,
    breadcrumbText: {
      en: "Births and baptisms",
      bo: "Fødte og døpte",
      nn: "Fødde og døypte",
    },
  },
  {
    recordType: RT.Burial,
    breadcrumbText: {
      en: "Burials",
      bo: "Begravde",
      nn: "Gravlagde",
    },
  },
  {
    recordType: RT.Census,
    breadcrumbText: {
      en: "Census districts summary",
      bo: "Tellingskretsoversikt",
      nn: "Teljingskretsoversikt",
    },
  },
  {
    recordType: RT.Emigration,
    breadcrumbText: {
      en: "Emigration",
      bo: "Emigrasjon",
      nn: "Emigrasjon",
    },
  },
  {
    recordType: RT.Marriage,
    breadcrumbText: {
      en: "Marriages",
      bo: "Viede",
      nn: "Viede",
    },
  },
];

const fieldLabels = {
  age: {
    en: ["Age"],
    bo: ["Alder"],
    nn: ["Alder"],
  },
  ageBorn: {
    en: ["Age/born"],
    bo: ["Alder/født"],
    nn: ["Alder/fødd"],
  },
  baptismDate: {
    en: ["Baptism date"],
    bo: ["Dåpsdato"],
    nn: ["Dåpsdato"],
  },
  baptismPlace: {
    en: ["Baptism place"],
    bo: ["Dåpssted"],
    nn: ["Dåpsstad"],
  },
  birthDate: {
    en: ["Date of birth", "Birth date"],
    bo: ["Fødselsdato"],
    nn: ["Fødselsdato"],
  },
  birthYear: {
    en: ["Birth year", "Year of birth"],
    bo: ["Fødselsår"],
    nn: ["Fødselsår"],
  },
  birthPlace: {
    en: ["Birth place", "Place of birth"],
    bo: ["Fødested"],
    nn: ["Fødestad"],
  },
  burialDate: {
    en: ["Burial date"],
    bo: ["Begravelsesdato"],
    nn: ["Gravferdsdato"],
  },
  county: {
    en: ["County"],
    bo: ["Fylke"],
    nn: ["Fylke"],
  },
  deathDate: {
    en: ["Date of death", "Death date"],
    bo: ["Dødsdato"],
    nn: ["Dødsdato"],
  },
  deathYear: {
    en: ["Death year", "Year of death"],
    bo: ["Dødsår"],
    nn: ["Dødsår"],
  },
  emigrationDate: {
    en: ["Date of emigration"],
    bo: ["Utreisedato"],
    nn: ["Utreisedato"],
  },
  familyPosition: {
    en: ["Family position"],
    bo: ["Familiestilling"],
    nn: ["Familiestilling"],
  },
  gender: {
    en: ["Gender"],
    bo: ["Kjønn"],
    nn: ["Kjønn"],
  },
  givenName: {
    en: ["Given name"],
    bo: ["Fornavn"],
    nn: ["Førenamn"],
  },
  lastName: {
    en: ["Last name"],
    bo: ["Etternavn"],
    nn: ["Etternamn"],
  },
  maritalStatus: {
    en: ["Marital status"],
    bo: ["Sivilstand"],
    nn: ["Sivilstand"],
  },
  marriageDate: {
    en: ["Marriage date"],
    bo: ["Vielsesdato"],
    nn: ["Vigselsdato"],
  },
  marriagePlace: {
    en: ["Marriage place"],
    bo: ["Vielsessted"],
    nn: ["Vigselsstad"],
  },
  name: {
    en: ["Name"],
    bo: ["Navn"],
    nn: ["Namn"],
  },
  occupation: {
    en: ["Occupation"],
    bo: ["Yrke"],
    nn: ["Yrke"],
  },
  parishChurch: {
    en: ["Parish/Church"],
    bo: ["Sogn/kirke"],
    nn: ["Sokn/kyrkje"],
  },
  personNumber: {
    en: ["Person no."],
    bo: ["Personnr"],
    nn: ["Personnr"],
  },
  residentialStatus: {
    en: ["Residential status"],
    bo: ["Bostatus"],
    nn: ["Bustatus"],
  },
  role: {
    en: ["Role"],
    bo: ["Rolle"],
    nn: ["Rolle"],
  },
  serialNumber: {
    en: ["Serial no."],
    bo: ["Løpenr"],
    nn: ["Løpenr"],
  },
  year: {
    en: ["Year"],
    bo: ["År"],
    nn: ["År"],
  },
};

const panelTitles = {
  "Births and baptisms": {
    en: "Births and baptisms",
    bo: "Fødte og døpte",
    nn: "Fødde og døypte",
  },
  Burials: {
    en: "Burials",
    bo: "Begravde",
    nn: "Gravlagde",
  },
  Marriages: {
    en: "Marriages",
    bo: "Viede",
    nn: "Vigde",
  },
};

const genderValues = {
  m: "male", // mann = man
  k: "female", // kvinne = woman
};

const maritalStatusValues = {
  g: "married", // gift = married
  ug: "single", // ugift = single
  e: "widow", // enke/enkemann = widow/widower
  s: "separated", // separert = separated
  f: "divorced", // fraskilt = divorced
};

// converts the relationship to head
// See: https://homepages.rootsweb.com/~norway/census_abbreviations.html
const familyPositionValues = {
  hf: "head", // house father or husband
  hm: "wife", // house mother or wife
  hp: "head", // (selv) hovedperson = head of household
  hovedperson: "head", // (selv) hovedperson = head of household
  selv: "head", // (selv) hovedperson = head of household
  hu: "wife", // hustru = wife
  hustru: "wife", // hustru = wife
  Kone: "wife",
  s: "son",
  d: "daughter",
  tj: "servant", // tjenestetyende
  Tjener: "servant",
  "Moder til Husfaderen": "mother",
  Logerende: "lodger",
  fl: "lodger", // losjerende, hørende til familien = lodger, related to the family
  el: "lodger", // enslig losjerende = single lodger, not related to the family
  b: "visitor", // besøkende = visitor
  "hans Kone": "hisWife",
};

const residentialStatusValues = {
  b: "resides permanently",
  mt: "resides temporarily",
  f: "temporarily absent",
};

class NodaEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.parseUrl();

    // determine record type and role
    let recordType = RT.Unclassified;
    for (let eventType of eventTypes) {
      for (let crumb of this.ed.breadcrumbs) {
        if (crumb == eventType.breadcrumbText[this.urlLang]) {
          recordType = eventType.recordType;
          break;
        }
      }
      if (recordType != RT.Unclassified) {
        break;
      }
    }

    if (recordType == RT.BirthOrBaptism) {
      let baptismDate = this.getPanelDataValue("Births and baptisms", "baptismDate");
      if (baptismDate) {
        recordType = RT.Baptism;
      }
    }

    this.recordType = recordType;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  makeDateObjFromYearAndMmDd(yearString, mmDdString) {
    if (yearString && mmDdString) {
      const separator = "-";
      let parts = mmDdString.split(separator);
      if (parts.length != 2) {
        if (parts.length == 1) {
          let dateObj = new DateObj();
          dateObj.yearString = yearString;
          return dateObj;
        }
        return;
      }

      let day = parts[1];
      let month = parts[0];
      let year = yearString;

      if (day.length != 2 || month.length != 2 || year.length != 4) {
        return;
      }

      let dayNum = parseInt(day);
      let monthNum = parseInt(month);
      let yearNum = parseInt(year);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        return;
      }

      let dateString = DateUtils.getDateStringFromYearMonthDay(yearNum, monthNum, dayNum);

      if (dateString) {
        let dateObj = new DateObj();
        dateObj.dateString = dateString;
        return dateObj;
      }
    }
  }

  makeDateObjFromPanelDataYearAndMmDd(panelTitleKey, panelDataKey) {
    let mmDdString = this.getPanelDataValue(panelTitleKey, panelDataKey);
    let yearString = this.getPanelDataValue(panelTitleKey, "year");
    if (mmDdString && yearString) {
      return this.makeDateObjFromYearAndMmDd(yearString, mmDdString);
    }
  }

  makePlaceObjFromRecordPanelAndSourceData(recordDataKey, panelTitleKey, panelDataKey) {
    let recordDataPlace = this.getRecordDataValue(recordDataKey);
    let panelPlace = this.getPanelDataValue(panelTitleKey, panelDataKey);
    if (!panelPlace) {
      panelPlace = this.getPanelDataValue(panelTitleKey, "parishChurch");
    }

    let sourceInfoParishName = "";

    const sourceInfoPrefixes = {
      en: "Church book from ",
      bo: "Ministerialbok for ",
      nn: "Ministerialbok for ",
    };

    const parishWords = {
      en: "parish",
      bo: "prestegjeld",
      nn: "prestegjeld",
    };

    let sourceInfoPrefix = sourceInfoPrefixes[this.urlLang];
    let parishWord = parishWords[this.urlLang];
    let sourceInformation = this.ed.sourceInformation;

    if (sourceInformation) {
      if (sourceInfoPrefix) {
        sourceInformation = sourceInformation.substring(sourceInfoPrefix.length);
      }
      let parts = sourceInformation.split(" ");
      if (parts.length) {
        for (let partIndex = 0; partIndex < parts.length; partIndex++) {
          while (parts[partIndex].endsWith(",")) {
            parts[partIndex] = parts[partIndex].substring(0, parts[partIndex].length - 1);
          }
        }
        if (parts.length == 1) {
          sourceInfoParishName = parts[0];
        } else {
          if (parts[1] == parishWord) {
            sourceInfoParishName = parts[0];
          } else if (parts[2] == parishWord) {
            sourceInfoParishName = parts[0] + " " + parts[1];
          } else if (parts[3] == parishWord) {
            sourceInfoParishName = parts[0] + " " + parts[1] + " " + parts[2];
          }
        }
      }
    }

    let countyName = this.getSourceDataValue("county");

    let fullPlaceName = "";
    if (panelPlace) {
      fullPlaceName = panelPlace;
    }

    if (sourceInfoParishName && !fullPlaceName.includes(sourceInfoParishName)) {
      if (fullPlaceName) {
        fullPlaceName += ", ";
      }
      fullPlaceName += sourceInfoParishName;
    }

    if (countyName && !fullPlaceName.includes(countyName)) {
      if (fullPlaceName) {
        fullPlaceName += ", ";
      }
      fullPlaceName += countyName;
    }

    if (fullPlaceName) {
      fullPlaceName += ", ";
    }
    fullPlaceName += "Norway";

    let placeObj = this.makePlaceObjFromFullPlaceName(fullPlaceName);
    if (placeObj) {
      if (sourceInfoParishName) {
        placeObj.parish = sourceInfoParishName;
      }
      if (countyName) {
        placeObj.county = countyName;
      }
      placeObj.country = "Norway";
    }

    return placeObj;
  }

  parseUrl() {
    let url = this.ed.url;

    // examples:
    // "https://www.digitalarkivet.no/en/view/255/pd00000017246548",
    // "https://www.digitalarkivet.no/en/view/267/pg00000000517413",
    // "https://www.digitalarkivet.no/en/census/person/pf01052377002789",
    // "https://www.digitalarkivet.no/census/person/pf01052377002789",
    // "https://www.digitalarkivet.no/nn/census/person/pf01052377002789",
    // "https://www.digitalarkivet.no/en/view/8/pe00000000917949",
    // "https://media.digitalarkivet.no/view/1953/30",
    // "https://media.digitalarkivet.no/view/15957/43",

    const recordPrefix = "https://www.digitalarkivet.no/";
    const imagePrefix = "https://www.digitalarkivet.no/";
    if (url.startsWith(recordPrefix)) {
      this.urlType = "record";
      let remainder = url.substring(recordPrefix.length);
      if (remainder.startsWith("en/")) {
        this.urlLang = "en";
        remainder = remainder.substring(3);
      } else if (remainder.startsWith("nn/")) {
        this.urlLang = "nn";
        remainder = remainder.substring(3);
      } else {
        this.urlLang = "bo";
      }
    } else if (url.startsWith(imagePrefix)) {
      this.urlType = "image";
    }
  }

  getPanelTitle(panelTitleKey) {
    let lang = this.urlLang;
    if (!lang) {
      return "";
    }

    let panelTitleRecord = panelTitles[panelTitleKey];
    if (panelTitleRecord) {
      return panelTitleRecord[lang];
    }
    return "";
  }

  getFieldLabels(fieldLabelCode) {
    if (!fieldLabelCode) {
      return undefined;
    }
    let lang = this.urlLang;
    if (!lang) {
      return undefined;
    }

    let fieldLabelRecord = fieldLabels[fieldLabelCode];
    if (fieldLabelRecord) {
      return fieldLabelRecord[lang];
    }
    return undefined;
  }

  getValueObjUsingFieldLabels(data, fieldLabels) {
    if (!fieldLabels) {
      return undefined;
    }
    for (let fieldLabel of fieldLabels) {
      let value = data[fieldLabel];
      if (value) {
        return value;
      }
    }
  }

  getPanel(panelTitleKey) {
    let panelName = this.getPanelTitle(panelTitleKey);
    if (!panelName) {
      return undefined;
    }
    let panelGroups = this.ed.panelGroups;
    if (panelGroups) {
      for (let group of panelGroups) {
        if (group.panelTitle == panelName) {
          return group;
        }
      }
    }
    return undefined;
  }

  getPanelDataValueObj(panelTitleKey, fieldLabelKey) {
    let panel = this.getPanel(panelTitleKey);
    if (!panel) {
      return undefined;
    }
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (!fieldLabels) {
      return undefined;
    }
    let valueObj = this.getValueObjUsingFieldLabels(panel, fieldLabels);
    if (valueObj) {
      return valueObj;
    }
    return undefined;
  }

  getPanelDataValue(panelTitleKey, fieldLabelKey) {
    let valueObj = this.getPanelDataValueObj(panelTitleKey, fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getRecordDataValueObj(fieldLabelKey) {
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (fieldLabels) {
      if (this.ed.recordData) {
        let valueObj = this.getValueObjUsingFieldLabels(this.ed.recordData, fieldLabels);
        if (valueObj) {
          return valueObj;
        }
      }
    }
    return undefined;
  }

  getRecordDataValue(fieldLabelKey) {
    let valueObj = this.getRecordDataValueObj(fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getSourceDataValueObj(fieldLabelKey) {
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (fieldLabels) {
      if (this.ed.sourceData) {
        let valueObj = this.getValueObjUsingFieldLabels(this.ed.sourceData, fieldLabels);
        if (valueObj) {
          return valueObj;
        }
      }
    }
    return undefined;
  }

  getSourceDataValue(fieldLabelKey) {
    let valueObj = this.getSourceDataValueObj(fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getPersonDataValueObj(person, fieldLabelKey) {
    let fieldLabels = this.getFieldLabels(fieldLabelKey);
    if (fieldLabels) {
      if (person) {
        let valueObj = this.getValueObjUsingFieldLabels(person, fieldLabels);
        if (valueObj) {
          return valueObj;
        }
      }
    }
    return undefined;
  }

  getPersonDataValue(person, fieldLabelKey) {
    let valueObj = this.getPersonDataValueObj(person, fieldLabelKey);
    if (valueObj && valueObj.textString) {
      return valueObj.textString;
    }
    return "";
  }

  getPeopleArrayByPanelTitle(panelTitleKey) {
    let panel = this.getPanel(panelTitleKey);
    if (!panel) {
      return undefined;
    }

    return panel.people;
  }

  getFirstPeopleArray() {
    let panelGroups = this.ed.panelGroups;
    if (panelGroups) {
      for (let group of panelGroups) {
        if (group.people) {
          return group.people;
        }
      }
    }
    return undefined;
  }

  getPrimaryPerson() {
    let people = this.getFirstPeopleArray();
    if (!people || people.length == 0) {
      return undefined;
    }

    if (people.length == 1) {
      return people[0];
    }

    let serialNumber = this.getRecordDataValue("serialNumber");

    if (serialNumber) {
      for (let person of people) {
        if (person.personNameParts && person.personNameParts.length == 1) {
          if (person.personNameParts[0] == serialNumber) {
            return person;
          }
        }
      }
    }

    let personNumber = this.getRecordDataValue("personNumber");

    if (personNumber) {
      for (let person of people) {
        if (person.personLabel && person.personLabel == personNumber) {
          return person;
        }
      }
    }

    return undefined;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    return true;
  }

  getSourceType() {
    if (this.ed.pageType == "record") {
      return "record";
    } else if (this.ed.pageType == "image") {
      return "image";
    }
  }

  getNameObj() {
    let givenName = this.getRecordDataValue("givenName");
    let lastName = this.getRecordDataValue("lastName");
    if (givenName || lastName) {
      return this.makeNameObjFromForenamesAndLastName(givenName, lastName);
    }

    if (this.recordType == RT.Census) {
      if (this.ed.headingTextParts.length == 1) {
        let fullName = this.ed.headingTextParts[0];
        if (fullName) {
          return this.makeNameObjFromFullName(fullName);
        }
      }
    }
    return undefined;
  }

  getGender() {
    let genderValue = this.getRecordDataValue("gender");

    if (genderValue) {
      let gender = genderValues[genderValue];
      if (gender) {
        return gender;
      }
    }

    return "";
  }

  getEventDateObj() {
    if (this.recordType == RT.Baptism) {
      return this.makeDateObjFromPanelDataYearAndMmDd("Births and baptisms", "baptismDate");
    } else if (this.recordType == RT.Burial) {
      return this.makeDateObjFromPanelDataYearAndMmDd("Burials", "burialDate");
    } else if (this.recordType == RT.Marriage) {
      return this.makeDateObjFromPanelDataYearAndMmDd("Marriages", "marriageDate");
    } else if (this.recordType == RT.Emigration) {
      let dateString = this.getRecordDataValue("emigrationDate");
      if (dateString) {
        return this.makeDateObjFromYyyymmddDate(dateString, "-");
      }
    } else if (this.recordType == RT.Census) {
      // this is the part that comes before the year
      const sourceInfoPrefixes = {
        en: "",
        bo: "Folketelling ",
        nn: "Folketeljing ",
      };

      let sourceInfoPrefix = sourceInfoPrefixes[this.urlLang];
      let sourceInformation = this.ed.sourceInformation;

      if (sourceInformation) {
        if (sourceInfoPrefix) {
          sourceInformation = sourceInformation.substring(sourceInfoPrefix.length);
        }
        let parts = sourceInformation.split(" ");
        if (parts.length) {
          let yearString = parts[0];
          return this.makeDateObjFromYear(yearString);
        }
      }
    }

    return undefined;
  }

  getEventPlaceObj() {
    if (this.recordType == RT.Baptism) {
      return this.makePlaceObjFromRecordPanelAndSourceData("", "Births and baptisms", "baptismPlace");
    } else if (this.recordType == RT.Marriage) {
      return this.makePlaceObjFromRecordPanelAndSourceData("", "Marriages", "marriagePlace");
    }

    return undefined;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    let dateString = this.getRecordDataValue("birthDate");
    let yearString = this.getRecordDataValue("birthYear");

    const calculatedSuffixes = {
      en: " (calculated)",
      bo: " (beregnet)",
      nn: " (berekna)",
    };

    const calcString = calculatedSuffixes[this.urlLang];
    let isDateCalculated = false;
    if (yearString && yearString.endsWith(calcString)) {
      yearString = yearString.substring(0, yearString.length - calcString.length);
      isDateCalculated = true;
    }

    let dateObj = undefined;

    if (dateString && yearString) {
      dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
    } else if (dateString) {
      let parts = dateString.split("-");
      if (parts.length == 1 && dateString.length == 4) {
        dateObj = this.makeDateObjFromYear(dateString);
      } else if (parts.length == 3) {
        dateObj = this.makeDateObjFromYyyymmddDate(dateString, "-");
      } else if (parts.length == 2 && dateString.length == 5) {
        // it looks like we have just the month and day for the birth year and no year
        if (this.recordType == RT.Baptism || this.recordType == RT.BirthOrBaptism) {
          let eventDateObj = this.getEventDateObj();
          if (eventDateObj) {
            yearString = eventDateObj.getYearString();
            if (yearString) {
              dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
            }
          }
        }
      }
    } else if (yearString) {
      dateObj = this.makeDateObjFromYear(yearString);
    }

    if (dateObj && isDateCalculated) {
      dateObj.qualifier = dateQualifiers.ABOUT;
    }

    return dateObj;
  }

  getBirthPlaceObj() {
    let placeString = this.getRecordDataValue("birthPlace");

    if (placeString) {
      return this.makePlaceObjFromFullPlaceName(placeString);
    }

    return undefined;
  }

  getDeathDateObj() {
    let dateString = this.getRecordDataValue("deathDate");
    let yearString = this.getRecordDataValue("deathYear");

    const calculatedSuffixes = {
      en: " (calculated)",
      bo: " (beregnet)",
      nn: " (berekna)",
    };

    const calcString = calculatedSuffixes[this.urlLang];
    let isDateCalculated = false;
    if (yearString && yearString.endsWith(calcString)) {
      yearString = yearString.substring(0, yearString.length - calcString.length);
      isDateCalculated = true;
    }

    let dateObj = undefined;

    if (dateString && yearString) {
      dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
    } else if (dateString) {
      let parts = dateString.split("-");
      if (parts.length == 1 && dateString.length == 4) {
        dateObj = this.makeDateObjFromYear(dateString);
      } else if (parts.length == 3) {
        dateObj = this.makeDateObjFromYyyymmddDate(dateString, "-");
      } else if (parts.length == 2 && dateString.length == 5) {
        // it looks like we have just the month and day for the birth year and no year
        if (this.recordType == RT.Burial) {
          let eventDateObj = this.getEventDateObj();
          if (eventDateObj) {
            yearString = eventDateObj.getYearString();
            if (yearString) {
              dateObj = this.makeDateObjFromYearAndMmDd(yearString, dateString);
            }
          }
        }
      }
    } else if (yearString) {
      dateObj = this.makeDateObjFromYear(yearString);
    }

    if (dateObj && isDateCalculated) {
      dateObj.qualifier = dateQualifiers.ABOUT;
    }

    return dateObj;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    let ageString = this.getRecordDataValue("age");

    if (ageString) {
      if (!/^\d+$/.test(ageString)) {
        // it is not just digits
        if (ageString.endsWith(" a")) {
          ageString = ageString.substring(0, ageString.length - 2);
        }
      }
      return ageString;
    }

    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    return "";
  }

  getMaritalStatus() {
    let statusString = this.getRecordDataValue("maritalStatus");

    if (statusString) {
      let status = maritalStatusValues[statusString];
      if (status) {
        return status;
      }
    }

    return "";
  }

  getOccupation() {
    let occupationString = this.getRecordDataValue("occupation");

    if (occupationString) {
      return occupationString;
    }

    return "";
  }

  getSpouses() {
    let people = this.getFirstPeopleArray();
    if (!people) {
      return;
    }

    if (this.recordType == RT.Marriage) {
      const brideRole = "brur";
      const groomRole = "brudgom";
      let primaryRole = this.getRecordDataValue("role");
      if (!primaryRole) {
        let primaryPerson = this.getPrimaryPerson();
        if (primaryPerson) {
          primaryRole = this.getPersonDataValue(primaryPerson, "role");
        }
      }

      if (primaryRole == brideRole || primaryRole == groomRole) {
        for (let person of people) {
          let role = this.getPersonDataValue(person, "role");
          if ((role == brideRole || role == groomRole) && role != primaryRole) {
            let name = this.getPersonDataValue(person, "name");
            if (name) {
              let spouseObj = this.makeSpouseObj(name);
              if (spouseObj) {
                return [spouseObj];
              }
            }
          }
        }
      }
    }
  }

  getParents() {
    let people = this.getFirstPeopleArray();
    if (!people) {
      return;
    }

    let fatherNameString = "";
    let motherNameString = "";

    for (let person of people) {
      let role = this.getPersonDataValue(person, "role");
      if (role == "far") {
        let name = this.getPersonDataValue(person, "name");
        if (name) {
          fatherNameString = name;
        }
      } else if (role == "mor") {
        let name = this.getPersonDataValue(person, "name");
        if (name) {
          motherNameString = name;
        }
      }
    }

    return this.makeParentsFromFullNames(fatherNameString, motherNameString);
  }

  getHousehold() {
    if (this.recordType != RT.Census) {
      return;
    }

    let people = this.getFirstPeopleArray();
    if (!people) {
      return;
    }

    const possibleHeadings = [
      "name",
      "age",
      "birthDate",
      "birthPlace",
      "residentialStatus",
      "familyPosition",
      "maritalStatus",
      "occupation",
    ];

    let headingsUsed = [];

    function setMemberField(member, heading, value) {
      if (member && heading && value) {
        member[heading] = value;

        if (!headingsUsed.includes(heading)) {
          headingsUsed.push(heading);
        }
      }
    }

    let householdArray = [];
    for (let person of people) {
      let householdMember = {};

      if (person.personNameParts && person.personNameParts.length == 1) {
        let name = person.personNameParts[0];
        if (name) {
          setMemberField(householdMember, "name", name.trim());
        }
      }

      if (!householdMember.name) {
        continue;
      }

      // for 1875 census the order of columns is:
      // Household number, person number, name, Usual residence, dif structure, gender, familyPosition,
      //   marital status, occupation, birthYear, birthPlace, nationality, religion, insave/deaf/blind
      // Some of those do not seem to be transcribed, so our order should be:
      //   familyPosition, marital status, occupation, age/born, birthPlace
      // See: https://www.familysearch.org/en/wiki/Norway_Census,_1875_-_FamilySearch_Historical_Records

      let familyPosition = this.getPersonDataValue(person, "familyPosition");
      if (familyPosition) {
        let relationToHead = familyPositionValues[familyPosition];
        if (relationToHead) {
          if (relationToHead == "hisWife") {
            // this means the wife of the previous person
            // for now just set it to "wife"
            relationToHead = "wife";
          }
          setMemberField(householdMember, "relationship", relationToHead);
        } else {
          setMemberField(householdMember, "relationship", familyPosition);
        }
      }

      let maritalStatusString = this.getPersonDataValue(person, "maritalStatus");
      if (maritalStatusString) {
        let maritalStatus = maritalStatusValues[maritalStatusString];
        if (maritalStatus) {
          setMemberField(householdMember, "maritalStatus", maritalStatus);
        } else {
          setMemberField(householdMember, "maritalStatus", maritalStatusString);
        }
      }

      let occupation = this.getPersonDataValue(person, "occupation");
      setMemberField(householdMember, "occupation", occupation);

      let ageBorn = this.getPersonDataValue(person, "ageBorn");
      if (ageBorn.length == 4) {
        // birthYear
        setMemberField(householdMember, "birthDate", ageBorn);
      } else if (ageBorn.length <= 2) {
        setMemberField(householdMember, "age", ageBorn);
      }

      let birthPlace = this.getPersonDataValue(person, "birthPlace");
      setMemberField(householdMember, "birthPlace", birthPlace);

      let residentialStatusString = this.getPersonDataValue(person, "residentialStatus");
      if (residentialStatusString) {
        let residentialStatus = residentialStatusValues[residentialStatusString];
        if (residentialStatus) {
          setMemberField(householdMember, "residentialStatus", residentialStatus);
        } else {
          setMemberField(householdMember, "residentialStatus", residentialStatusString);
        }
      }

      let isSelected = person.current;
      if (isSelected) {
        householdMember.isSelected = isSelected;
      }
      householdArray.push(householdMember);
    }

    let result = {};
    result.members = householdArray;

    result.fields = headingsUsed;

    return result;
  }

  getCollectionData() {
    return undefined;
  }
}

export { NodaEdReader };
