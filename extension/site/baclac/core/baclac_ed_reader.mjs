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
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameObj, DateObj, PlaceObj, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";

// Document types
const typeData = {
  cabcon: {
    // Cabinet Conclusions
    foundIn: "Archives / Cabinet Conclusions",
    recordType: RT.GovernmentDocument,
  },
  cangaz: {
    // Canada Gazette
    foundIn: "Library / Canada Gazette, 1841 to 1997",
    recordType: RT.Newspaper,
    noName: true,
  },
  canposoffpub: {
    // Canadian Post Office Publications
    foundIn: "Library / Canadian Post Office Publications",
    recordType: RT.Directory,
    noName: true,
  },
  citregmtlcircou: {
    // Citizenship Registration, Montreal Circuit Court
    foundIn: "Genealogy / Immigrants & Citizenship /Citizenship Registration, Montreal Circuit Court , 1851 to 1945",
    recordType: RT.Naturalization,
    defaultEventPlace: "Montreal, Canada",
  },
  census: {
    // Census
    foundIn: "Genealogy / Census",
    recordType: RT.Census,
  },
  coumarwwi: {
    // Courts Martial of First World War
    foundIn: "Genealogy / Military / Courts Martial of First World War",
    recordType: RT.Military,
    defaultEventDate: "1914-1919",
  },
  diawlmking: {
    // Diaries of William Lyon Mackenzie King
    foundIn: "Archives / Diaries of William Lyon Mackenzie King",
    recordType: RT.Diary,
    noName: true,
  },
  fonandcol: {
    // Collections and Fonds
    foundIn: "Archives / Collections and Fonds",
    recordType: RT.Unclassified,
  },
  immbef1865: {
    // Immigrants before 1865
    foundIn: "Genealogy / Immigrants & Citizenship / Immigrants before 1865",
    recordType: RT.Immigration,
    defaultEventDate: "1865",
    defaultEventDateQualifier: dateQualifiers.BEFORE,
  },
  immfrochi: {
    // Immigrants from China, 1885 to 1952
    foundIn: "Genealogy / Immigration & Citizenship / Immigrants from China, 1885 to 1952",
    recordType: RT.Immigration,
    defaultEventDate: "1885-1952",
  },
  immrusemp: {
    // Immigrants from the Russian Empire, 1898 to 1922
    foundIn: "Genealogy / Immigrants & Citizenship / Immigrants from the Russian Empire, 1898 to 1922",
    recordType: RT.Immigration,
    defaultEventDate: "1898-1922",
  },
  indaffannrep: {
    // Indian Affairs Annual Reports, 1864 to 1990
    foundIn: "Library / Indian Affairs Annual Reports, 1864 to 1990",
    recordType: RT.GovernmentDocument,
    noName: true,
  },
  kia: {
    // Second World War Service Files – War Dead
    foundIn: "Genealogy / Military / Second World War Service Files – War Dead, 1939 to 1947",
    recordType: RT.Military,
    defaultEventDate: "1939-1947",
  },
  lanboauppcan: {
    // Land Boards of Upper Canada, 1765 to 1804
    foundIn: "Genealogy / Land / Land Boards of Upper Canada, 1765 to 1804",
    recordType: RT.LandGrant,
    defaultEventDate: "1765-1804",
    extraPlaceString: "Upper Canada, Canada",
  },
  lanpetlowcan: {
    // Land Petitions of Lower Canada, 1764 to 1841
    foundIn: "Genealogy / Land / Land Petitions of Lower Canada, 1764 to 1841",
    recordType: RT.LandPetition,
    defaultEventDate: "1764-1841",
    extraPlaceString: "Lower Canada, Canada",
  },
  lanpetuppcan: {
    // Land Petitions of Upper Canada, 1763-1865
    foundIn: "Genealogy / Land / Land Petitions of Upper Canada, 1763-1865<",
    recordType: RT.LandPetition,
    defaultEventDate: "1763-1865",
    extraPlaceString: "Upper Canada, Canada",
  },
  nwmp: {
    // North West Mounted Police (NWMP)—Personnel Records, 1873–190
    foundIn: "Genealogy / Military / North West Mounted Police (NWMP)—Personnel Records, 1873–1904",
    recordType: RT.Military,
    defaultEventDate: "1873-1904",
  },
  ordincou: {
    // Orders-in-Council
    foundIn: "Archives / Orders-in-Council",
    recordType: RT.GovernmentDocument,
    noName: true,
  },
  pffww: {
    // First World War Personnel Records
    foundIn: "Genealogy / Military / First World War Personnel Records",
    recordType: RT.Military,
    defaultEventDate: "1914-1918",
  },
  porros: {
    // Black Loyalist Refugees—Port Roseway Associates, 1782 to 1807
    foundIn: "Genealogy / Military / Black Loyalist Refugees—Port Roseway Associates, 1782 to 1807",
    recordType: RT.Military,
    defaultEventDate: "1782-1807",
  },
  roynavled: {
    // Royal Canadian Navy Service Ledger Sheets, 1910 to 1941
    foundIn: "Genealogy / Military / Royal Canadian Navy Service Ledger Sheets, 1910 to 1941",
    recordType: RT.Military,
    defaultEventDate: "1910-1941",
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
        for (let typeKey in typeData) {
          let type = typeData[typeKey];
          if (type.foundIn == foundIn) {
            this.typeData = type;
            break;
          }
        }
      }
    }

    if (this.typeData) {
      this.recordType = this.typeData.recordType;

      if (app == "fonandcol") {
        if (ed.name.includes("Scrip") && ed.name.includes("Métis")) {
          this.recordType = RT.MetisScrip;
        }
      }
    } else {
      this.recordType = RT.Unclassified;
    }
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
      // Some immigration records have names in all lowercase.
      if (StringUtils.isAllLowercase(fullNameString)) {
        fullNameString = fullNameString.toUpperCase();
      }

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

  getLabeledValueFromMetisScripTitle(labelString) {
    let titleParts = this.ed.name.split(" = ");
    titleParts = titleParts[0].split("; ");
    for (let part of titleParts) {
      if (part.startsWith(labelString)) {
        return part.substring(labelString.length).trim();
      }
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
      if (this.urlApp == "fonandcol") {
        let title = this.ed.name;
        const scripPrefix = "Scrip affidavit for ";
        if (title.startsWith(scripPrefix)) {
          let remainder = title.substring(scripPrefix.length);
          let semiColonIndex = remainder.indexOf(";");
          if (semiColonIndex != -1) {
            remainder = remainder.substring(0, semiColonIndex);
          }
          nameString = remainder;
        }
      } else if (this.urlApp == "cabcon") {
        let preNameString = "National Parole Board, ";
        if (nameString.includes(preNameString)) {
          let index = nameString.indexOf(preNameString);
          if (index != -1) {
            nameString = nameString.substring(index + preNameString.length).trim();
          }
        }
      }

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
      }
      let eventYearString = this.getRecordDataValue("Year");
      if (eventYearString) {
        return this.makeDateObjFromYear(eventYearString);
      }
    } else if (this.recordType == RT.Immigration) {
      let eventDateString = this.getRecordDataValue("Date of registration");
      if (eventDateString) {
        return this.makeDateObjFromBaclacDateString(eventDateString);
      }
    } else if (this.recordType == RT.LandGrant || this.recordType == RT.LandPetition) {
      let yearString = this.getRecordDataValue("Year");
      if (yearString) {
        // sometimes there are two dates with a " & " between them
        if (yearString.includes(" & ")) {
          let parts = yearString.split(" & ");
          if (parts.length > 0 && parts[0].length == 4) {
            yearString = parts[0].trim();
          } else {
            yearString = "";
          }
        }
        return this.makeDateObjFromYear(yearString);
      }
    } else if (this.recordType == RT.Naturalization) {
      let yearString = this.getRecordDataValue("Year of naturalization");
      if (yearString) {
        return this.makeDateObjFromYear(yearString);
      }
    } else if (this.recordType == RT.MetisScrip) {
      let dateString = this.getLabeledValueFromMetisScripTitle("date of issue: ");
      return this.makeDateObjFromDateString(dateString);
    } else if (this.recordType == RT.GovernmentDocument) {
      let dateString = this.getRecordDataValueForKeys(["Meeting date"]);
      return this.makeDateObjFromDateString(dateString);
    } else if (this.urlApp == "diawlmking") {
      // Example title: "Item 3064 : Nov 12, 1904 (Page 3)"
      if (/^Item \d+\s\:\s\w\w\w\s\d\d\,\s*\d\d\d\d\s.*$/.test(this.ed.name)) {
        let dateString = this.ed.name.replace(/^Item \d+\s\:\s(\w\w\w\s\d\d\,\s*\d\d\d\d)\s.*$/, "$1");
        if (dateString && dateString != this.ed.name) {
          return this.makeDateObjFromDateString(dateString);
        }
      }
      let yearString = this.getRecordDataValue("Year");
      if (yearString) {
        return this.makeDateObjFromYear(yearString);
      }
    } else if (this.urlApp == "canposoffpub") {
      let title = this.ed.name;
      let preDateString = "Canada official postal guide, ";
      if (title.includes(preDateString)) {
        let index = title.indexOf(preDateString);
        if (index != -1) {
          let dateString = title.substring(index + preDateString.length).trim();
          return this.makeDateObjFromDateString(dateString);
        }
      }
    } else if (this.urlApp == "indaffannrep") {
      let eventDateString = this.getRecordDataValueForKeys(["Date approved", "Date considered", "Date introduced"]);
      if (eventDateString) {
        return this.makeDateObjFromBaclacDateString(eventDateString);
      }
    }

    // no event date found yet
    let defaultEventDate = this.typeData.defaultEventDate;
    if (defaultEventDate) {
      return this.makeDateObjFromDateString(defaultEventDate);
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

      // there is sometimes a "Sub-district description" and no "Sub-district name"
      // but the description doesn't work as part of the placeString except under a few cases
      if (!subDistrict) {
        let description = this.getRecordDataValue("Sub-district description");
        if (description && description.length < 30) {
          if (/^Town of [^\,]+$/.test(description)) {
            let townName = description.replace(/^Town of ([^\,]+)$/, "$1");
            if (townName && townName != description) {
              if (townName != district) {
                subDistrict = townName;
              }
            }
          }
        }
      }

      addPart(subDistrict);
      addPart(district);
      addPart(province);
      addPart("Canada");
    } else if (this.recordType == RT.LandGrant || this.recordType == RT.LandPetition) {
      let district = this.getRecordDataValueForKeys(["District", "Place of registration"]);
      addPart(district);
    } else if (this.recordType == RT.Military) {
      let eventPlace = this.getRecordDataValue("Place of enlistment");
      addPart(eventPlace);
    }

    if (this.typeData.extraPlaceString) {
      addPart(this.typeData.extraPlaceString);
    }

    let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
    if (!placeObj) {
      placeObj = new PlaceObj();

      if (this.typeData.defaultEventPlace) {
        placeObj.placeString = this.typeData.defaultEventPlace;
      } else {
        placeObj.placeString = "Canada";
      }
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
    if (dateOfBirth) {
      return this.makeDateObjFromBaclacDateString(dateOfBirth);
    }
    let yearOfBirth = this.getRecordDataValue("Year of birth");
    if (yearOfBirth) {
      let dateObj = this.makeDateObjFromYear(yearOfBirth);
      return dateObj;
    }
    let estYearOfBirth = this.getRecordDataValue("Estimate year of birth");
    if (estYearOfBirth) {
      let age = this.getAgeAtEvent();
      if (!age) {
        let dateObj = this.makeDateObjFromYear(estYearOfBirth);
        if (dateObj) {
          dateObj.qualifier = dateQualifiers.ABOUT;
          return dateObj;
        }
      }
    }

    if (this.recordType == RT.MetisScrip) {
      let dateString = this.getLabeledValueFromMetisScripTitle("born: ");
      return this.makeDateObjFromDateString(dateString);
    }
  }

  getBirthPlaceObj() {
    let placeString = this.getRecordDataValue("Place of birth");
    if (placeString) {
      return this.makePlaceObjFromFullPlaceName(placeString);
    }
    let countryString = this.getRecordDataValue("Birth country");
    if (countryString) {
      return this.makePlaceObjFromCountryName(countryString);
    }
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
    let ageString = this.getRecordDataValue("Age");
    if (ageString) {
      const yearSuffix = " years";
      if (ageString.endsWith(yearSuffix)) {
        ageString = ageString.substring(0, ageString.length - yearSuffix.length);
      }
    }
    return ageString;
  }

  getAgeAtDeath() {
    return "";
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    return this.getRecordDataValue("Relationship");
  }

  getMaritalStatus() {
    let status = this.getRecordDataValue("Marital Status");
    if (status) {
      if (status == "Not indicated") {
        status = "";
      }
    }
    return status;
  }

  getOccupation() {
    return this.getRecordDataValue("Occupation");
  }

  getUnit() {
    let unit = this.getRecordDataValue("Unit");
    if (!unit) {
      if (this.urlApp == "nwmp") {
        unit = "North West Mounted Police";
      }
    }
    return unit;
  }

  getRank() {
    return this.getRecordDataValue("Rank");
  }

  getServiceNumber() {
    return this.getRecordDataValueForKeys(["Service number", "Regimental number"]);
  }

  getMilitaryBranch() {
    // can't return "Air" as narrative would say "was in the air"
    return "";
  }

  getMilitaryRegiment() {
    return "";
  }

  getSpouses() {
    return undefined;
  }

  getParents() {
    if (this.recordType == RT.MetisScrip) {
      let fatherName = this.getLabeledValueFromMetisScripTitle("father: ");
      let motherName = this.getLabeledValueFromMetisScripTitle("mother: ");

      // Example: father: François St. Germain (French Canadian); mother: Louise Morand (Métis)
      function cleanName(nameString) {
        if (nameString.endsWith(")")) {
          let lastOpenParenIndex = nameString.lastIndexOf("(");
          if (lastOpenParenIndex != -1) {
            nameString = nameString.substring(0, lastOpenParenIndex).trim();
          }
        }
        return nameString;
      }

      return this.makeParentsFromFullNames(cleanName(fatherName), cleanName(motherName));
    }

    return undefined;
  }

  getHousehold() {
    return undefined;
  }

  getCollectionData() {
    if (this.recordType == RT.Census) {
      let censusYearString = this.getRecordDataValue("Census year");
      if (censusYearString) {
        let collectionId = censusYearString;

        let collectionData = {
          id: collectionId,
        };

        function addRef(fieldName, value) {
          if (value) {
            collectionData[fieldName] = value;
          }
        }

        addRef("district", this.getRecordDataValue("District name"));
        addRef("districtNumber", this.getRecordDataValue("District number"));
        addRef("subDistrict", this.getRecordDataValue("Sub-district name"));
        addRef("subDistrictNumber", this.getRecordDataValue("Sub-district number"));
        addRef("divisionNumber", this.getRecordDataValue("Division"));
        addRef("familyNumber", this.getRecordDataValue("Family number"));
        addRef("page", this.getRecordDataValue("Page number"));

        return collectionData;
      }
    }

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
    addSourceReferencePart("Bundle", this.getRecordDataValue("Bundle"));
    addSourceReferencePart("Microfilm reel number", this.getRecordDataValue("Microfilm reel number"));
    addSourceReferencePart("Microfilm", this.getRecordDataValue("Microfilm"));
    addSourceReferencePart("Image number", this.getRecordDataValue("Image number"));
    addSourceReferencePart("Item ID number", this.getRecordDataValue("Item ID number"));

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
