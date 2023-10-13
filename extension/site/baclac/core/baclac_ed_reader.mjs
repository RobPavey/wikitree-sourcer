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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { NameObj, DateObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";

// Document types
const typeData = {
  cangaz: {
    // Canada Gazette
    foundIn: "Library / Canada Gazette, 1841 to 1997",
    recordType: RT.Newspaper,
    noName: true,
  },
  census: {
    // Census
    foundIn: "Genealogy / Census",
    recordType: RT.Census,
  },
  kia: {
    // Second World War Service Files – War Dead
    foundIn: "Genealogy / Military / Second World War Service Files – War Dead, 1939 to 1947",
    recordType: RT.Military,
    defaultEventDate: "1939-1947",
  },
  pffww: {
    // First World War Personnel Records
    foundIn: "Genealogy / Military / First World War Personnel Records",
    recordType: RT.Military,
    defaultEventDate: "1914-1918",
  },
};

function getAppFromUrl(url) {
  if (!url) {
    return undefined;
  }

  // example URL:
  // https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=census&IdNumber=23720052
  let appString = url.replace(/.*\?app\=([^\&]+)\&.*/, "$1");
  if (appString && appString != url) {
    return appString;
  }
}

class BaclacEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.typeData = undefined;

    let app = getAppFromUrl(ed.url);
    if (app) {
      this.urlApp = app;
      this.typeData = typeData[app];
    }

    if (!this.typeData) {
      let foundIn = this.getRecordDataValue("Found in");
      if (foundIn) {
        for (let type in typeData) {
          if (type.foundIn == foundIn) {
            this.typeData = type;
          }
        }
      }
    }

    if (this.typeData) {
      this.recordType = this.typeData.recordType;
    } else {
      this.recordType = RT.Unclassified;
    }
  }

  getRecordDataValue(label) {
    if (!this.ed.recordData) {
      return undefined;
    }

    return this.ed.recordData[label];
  }

  makeDateObjFromBaclacDateString(dateString) {
    if (/^\d\d\d\d\-\d\d\-\d\d$/.test(dateString)) {
      return this.makeDateObjFromYyyymmddDate(dateString, "-");
    } else if (/^\w+\s\d\d?\s\d\d\d\d\s\d\d?\:\d\d[AP]M$/.test(dateString)) {
      return this.makeDateObjFromMonthDdYyyyTimeDate(dateString);
    }
  }

  makeNameObjFromFullNameWithComma(fullNameString) {
    if (fullNameString) {
      let cleanName = NameUtils.convertNameFromAllCapsToMixedCase(fullNameString);

      let nameObj = new NameObj();

      let commaIndex = cleanName.indexOf(",");
      if (commaIndex != -1) {
        let parts = cleanName.split(",");
        if (parts.length == 2) {
          let lastName = parts[0].trim();
          let forenames = parts[1].trim();
          let fullName = forenames + " " + lastName;
          nameObj.setFullName(fullName);
          nameObj.setForenames(forenames);
          nameObj.setLastName(lastName);
        }
      } else {
        nameObj.setFullName(cleanName);
      }

      return nameObj;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    if (!this.ed.recordData) {
      return false;
    }

    if (!this.typeData) {
      return false;
    }

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    if (!this.typeData.noName) {
      let nameString = this.ed.name;
      return this.makeNameObjFromFullNameWithComma(nameString);
    }
  }

  getGender() {
    let gender = this.getRecordDataValue("Gender");
    if (gender) {
      return gender.toLowerCase();
    }
    return "";
  }

  getEventDateObj() {
    if (this.recordType == RT.Newspaper) {
      let eventDateString = this.getRecordDataValue("Date");
      if (eventDateString) {
        return this.makeDateObjFromBaclacDateString(eventDateString);
      }
    } else if (this.recordType == RT.Census) {
      let censusYearString = this.getRecordDataValue("Census year");

      if (censusYearString) {
        let censusYear = censusYearString;
        let parenIndex = censusYear.indexOf("(");
        if (parenIndex != -1) {
          censusYear = censusYear.substring(0, parenIndex).trim();
        }

        censusYear = censusYear.replace(/^.*(\d\d\d\d)$/, "$1");
        if (censusYear.length != 4) {
          return undefined;
        }

        return this.makeDateObjFromYear(censusYear);
      }
    } else if (this.recordType == RT.Military) {
      let eventDateString = this.getRecordDataValue("Enlistment date");
      if (eventDateString) {
        return this.makeDateObjFromBaclacDateString(eventDateString);
      } else {
        let defaultEventDate = this.typeData.defaultEventDate;
        if (defaultEventDate) {
          return this.makeDateObjFromDateString(defaultEventDate);
        }
      }
    }
  }

  getEventPlaceObj() {
    let placeString = "";
    function addPart(part) {
      if (part) {
        if (placeString) {
          placeString += ", ";
        }
        placeString += part;
      }
    }

    if (this.recordType == RT.Census) {
      let province = this.getRecordDataValue("Province");
      let district = this.getRecordDataValue("District name");
      let subDistrict = this.getRecordDataValue("Sub-district name");

      if (!subDistrict) {
        subDistrict = this.getRecordDataValue("Sub-district description");
        if (subDistrict && subDistrict.length > 30) {
          // if it is something like this then don't include in place name:
          // Townships 30, 31 and 32, ranges 1, 2, 3, 4, 5 and 6, west of fourth meridian
          subDistrict = "";
        }
      }

      addPart(subDistrict);
      addPart(district);
      addPart(province);
      addPart("Canada");
    } else if (this.recordType == RT.Military) {
      let eventPlace = this.getRecordDataValue("Place of enlistment");
      addPart(eventPlace);
    }

    let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
    if (!placeObj) {
      placeObj = new PlaceObj();
    }
    placeObj.country = "Canada";

    return placeObj;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    if (!this.typeData.noName) {
      let dateOfDeath = this.getRecordDataValue("Date of death");
      if (dateOfDeath) {
        let nameString = this.ed.name;
        let nameObj = this.makeNameObjFromFullNameWithComma(nameString);
        if (nameObj && nameObj.lastName) {
          return nameObj.lastName;
        }
      }
    }
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    let dateOfBirth = this.getRecordDataValue("Date of birth");
    return this.makeDateObjFromBaclacDateString(dateOfBirth);
  }

  getBirthPlaceObj() {
    let placeString = this.getRecordDataValue("Place of birth");
    let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
    return placeObj;
  }

  getDeathDateObj() {
    let dateOfDeath = this.getRecordDataValue("Date of death");
    return this.makeDateObjFromBaclacDateString(dateOfDeath);
  }

  getDeathPlaceObj() {
    let placeString = this.getRecordDataValue("Place of death");
    let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
    return placeObj;
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

  getUnit() {
    return this.getRecordDataValue("Unit");
  }

  getServiceNumber() {
    return this.getRecordDataValue("Service number");
  }

  getMilitaryBranch() {
    // can't return "Air" as narrative would say "was in the air"
    return "";
  }

  getMilitaryRegiment() {
    return "";
  }

  getSpouseObj(eventDateObj, eventPlaceObj) {
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

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Functions to support build citation
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getSourceTitle() {
    if (this.recordType == RT.Census) {
      let censusYearString = this.getRecordDataValue("Census year");
      if (censusYearString) {
        return censusYearString;
      }
    }

    let foundInString = this.getRecordDataValue("Found in");
    if (foundInString) {
      let lastSlashIndex = foundInString.lastIndexOf(" / ");
      if (lastSlashIndex != -1) {
        let title = foundInString.substring(lastSlashIndex + 3);
        if (title) {
          return title;
        }
      }
    }
  }

  getSourceReference(options) {
    let reference = "";

    let sepOption = options.citation_general_sourceReferenceSeparator;
    let itemSep = ";";
    let valueSep = ":";
    if (sepOption == "commaColon") {
      itemSep = ",";
      valueSep = ":";
    } else if (sepOption == "commaSpace") {
      itemSep = ",";
      valueSep = "";
    }

    function addSourceReferencePart(label, value) {
      if (label && value) {
        if (reference) {
          reference += itemSep + " ";
        }
        reference += label + valueSep + " " + value;
      }
    }

    addSourceReferencePart("Reference", this.getRecordDataValue("Reference"));
    addSourceReferencePart("Page", this.getRecordDataValue("Page number"));
    addSourceReferencePart("Line", this.getRecordDataValue("Line number"));
    addSourceReferencePart("Family number", this.getRecordDataValue("Family number"));
    addSourceReferencePart("Microfilm reel number", this.getRecordDataValue("Microfilm reel number"));
    addSourceReferencePart("Image number", this.getRecordDataValue("Image number"));

    return reference;
  }

  getRecordLink() {
    if (this.ed.permalink) {
      return this.ed.permalink;
    }

    if (this.urlApp) {
      let id = this.getRecordDataValue("Item ID number");
      if (id) {
        let link = "http://central.bac-lac.gc.ca/.redirect?app=" + this.urlApp + "&id=" + id + "&lang=eng";
        return link;
      }
    }

    return this.ed.url;
  }
}

export { BaclacEdReader };
