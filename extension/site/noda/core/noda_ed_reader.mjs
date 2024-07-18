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
import { NameObj, DateObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";
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
  baptismDate: {
    en: "Baptism date",
    bo: "Dåpsdato",
    nn: "Dåpsdato",
  },
  baptismPlace: {
    en: "Baptism place",
    bo: "Dåpssted",
    nn: "Dåpsstad",
  },
  burialDate: {
    en: "Burial date",
    bo: "Begravelsesdato",
    nn: "Gravferdsdato",
  },
  county: {
    en: "County",
    bo: "Fylke",
    nn: "Fylke",
  },
  emigrationDate: {
    en: "Date of emigration",
    bo: "Utreisedato",
    nn: "Utreisedato",
  },
  gender: {
    en: "Gender",
    bo: "Kjønn",
    nn: "Kjønn",
  },
  givenName: {
    en: "Given name",
    bo: "Fornavn",
    nn: "Førenamn",
  },
  lastName: {
    en: "Last name",
    bo: "Etternavn",
    nn: "Etternamn",
  },
  marriageDate: {
    en: "Marriage date",
    bo: "Vielsesdato",
    nn: "Vigselsdato",
  },
  marriagePlace: {
    en: "Marriage place",
    bo: "Vielsessted",
    nn: "Vigselsstad",
  },
  parishChurch: {
    en: "Parish/Church",
    bo: "Sogn/kirke",
    nn: "Sokn/kyrkje",
  },
  year: {
    en: "Year",
    bo: "År",
    nn: "År",
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
  m: "male",
  k: "female",
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

  getFieldLabel(fieldLabelCode) {
    if (!fieldLabelCode) {
      return "";
    }
    let lang = this.urlLang;
    if (!lang) {
      return "";
    }

    let fieldLabelRecord = fieldLabels[fieldLabelCode];
    if (fieldLabelRecord) {
      return fieldLabelRecord[lang];
    }
    return "";
  }

  getPanelDataValueObj(panelTitleKey, fieldLabelKey) {
    let fieldLabel = this.getFieldLabel(fieldLabelKey);
    let panelName = this.getPanelTitle(panelTitleKey);
    if (!fieldLabel || !panelName) {
      return undefined;
    }
    let panelGroups = this.ed.panelGroups;
    if (panelGroups) {
      for (let group of panelGroups) {
        if (group.panelTitle == panelName) {
          let valueObj = group[fieldLabel];
          if (valueObj) {
            return valueObj;
          }
          break;
        }
      }
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
    let fieldLabel = this.getFieldLabel(fieldLabelKey);
    if (fieldLabel) {
      if (this.ed.recordData) {
        let valueObj = this.ed.recordData[fieldLabel];
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
    let fieldLabel = this.getFieldLabel(fieldLabelKey);
    if (fieldLabel) {
      if (this.ed.sourceData) {
        let valueObj = this.ed.sourceData[fieldLabel];
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
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
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
    return "";
  }

  getOccupation() {
    return "";
  }

  getSpouses() {
    return undefined;
  }

  getParents() {
    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    return undefined;
  }
}

export { NodaEdReader };
