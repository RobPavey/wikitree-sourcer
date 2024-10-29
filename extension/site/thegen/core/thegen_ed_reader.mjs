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
import { CD } from "../../../base/core/country_data.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";

const recordTypeMatches = [
  {
    recordType: RT.BirthRegistration,
    collectionTitleMatches: [["Civil Registration Births"]],
  },
  {
    recordType: RT.MarriageRegistration,
    collectionTitleMatches: [["Civil Registration Marriages"]],
  },
  {
    recordType: RT.DeathRegistration,
    collectionTitleMatches: [["Civil Registration Deaths"]],
  },
  {
    recordType: RT.Burial,
    collectionTitleMatches: [["BMDs"]],
    requiredFields: [["Date of Burial"]],
  },
  {
    recordType: RT.Burial,
    collectionTitleMatches: [["Parish Transcript Burials"]],
  },
  {
    recordType: RT.Marriage,
    collectionTitleMatches: [["Parish Transcript Marriages, Licences and Banns"]],
  },

  {
    recordType: RT.Census,
    collectionTitleMatches: [["Census"], ["1939 Register"]],
  },
  {
    recordType: RT.LandTax,
    collectionTitleMatches: [["Tithe Records"]],
  },

  // ones with vague type, possibly images
  {
    recordType: RT.Birth,
    collectionTitleMatches: [["Births"]],
  },
];

const keysForRecordType = {
  BirthRegistration: {
    date: ["Registered"],
    place: ["District"],
  },
  MarriageRegistration: {
    date: ["Registered"],
    place: ["District"],
  },
  DeathRegistration: {
    date: ["Registered"],
    place: ["District"],
    age: ["Age"],
  },
  Marriage: {
    date: ["Date"],
    place: ["Potential Places of Event"],
  },
  Burial: {
    date: ["Date of Burial"],
    place: ["Registration Town/County", "Parish"],
    age: ["Age"],
  },
  LandTax: {
    date: ["Original Date"],
    place: ["Parish"],
  },
};

class ThegenEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.determineRecordTypeForThegen();
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  determineRecordTypeForThegen() {
    // Note: for transcript pages there is often a "Record Type" column in table.
    // For record pages the second field in recordData is often named in a way that indicates
    // the record type.
    // For images all we have to go on is the title.

    let ed = this.ed;

    let inputData = {};

    if (ed.pageType == "record") {
      if (ed.breadcrumb) {
        let breadcrumbs = ed.breadcrumb.split("»");
        if (breadcrumbs.length == 3) {
          inputData.collectionTitle = breadcrumbs[1].trim();
        }
      }

      if (ed.title) {
        if (!inputData.collectionTitle) {
          inputData.collectionTitle = ed.title;
        }
      }

      inputData.recordData = ed.recordData;

      if (ed.recordData) {
        if (ed.recordData["Type"]) {
          inputData.documentType = ed.recordData["Type"];
        }
      }
    } else if (ed.pageType == "image") {
      if (ed.navData) {
        if (ed.navData["Title"]) {
          inputData.collectionTitle = ed.navData["Title"];
        } else if (ed.navData["Year"]) {
          inputData.collectionTitle = ed.navData["Year"];
        }

        if (ed.navData["Master Event"]) {
          inputData.documentType = ed.navData["Master Event"];
        }
      }
    }

    this.recordType = this.determineRecordType(recordTypeMatches, inputData);

    // useful in other functions to avoid duplicating code
    this.collectionTitle = inputData.collectionTitle;
    this.documentType = inputData.documentType;
  }

  getSelectedCensusRow() {
    let tableData = this.ed.tableData;
    if (!tableData) {
      return;
    }

    for (let row of tableData.rows) {
      if (row.isSelected) {
        return row;
      }
    }
  }

  getSelectedCensusRowValueForKeys(keys) {
    let row = this.getSelectedCensusRow();
    if (!row) {
      if (this.ed.tableData && this.ed.tableData.rows && this.ed.tableData.rows.length) {
        row = this.ed.tableData.rows[0];
      } else {
        return "";
      }
    }

    for (let key of keys) {
      let value = row[key];
      if (value) {
        return value;
      }
    }
  }

  getRecordDataValueForType(dataType) {
    let keyData = keysForRecordType[this.recordType];
    if (keyData) {
      let keys = keyData[dataType];
      if (keys) {
        return this.getRecordDataValueForKeys(keys);
      }
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
    if (this.recordType == RT.Census) {
      let forenames = this.getSelectedCensusRowValueForKeys(["Forename"]);
      let surname = this.getSelectedCensusRowValueForKeys(["Surname"]);
      return this.makeNameObjFromForenamesAndLastName(forenames, surname);
    }

    let nameString = this.getRecordDataValueForKeys(["Name", "Full Name"]);
    if (!nameString) {
      if (this.recordType == RT.Marriage) {
        nameString = this.getRecordDataValueForKeys(["Groom's Name"]);
      } else if (this.recordType == RT.LandTax) {
        nameString = this.getRecordDataValueForKeys(["Occupier", "Landowner"]);
      }
    }

    return this.makeNameObjFromFullName(nameString);
  }

  getGender() {
    if (this.recordType == RT.Census) {
      let gender = this.getSelectedCensusRowValueForKeys(["Gender"]);
      if (gender) {
        return gender.toLowerCase();
      }
    }

    return "";
  }

  getEventDateObj() {
    let dateString = this.getRecordDataValueForType("date");

    if (dateString) {
      let calcIndex = dateString.indexOf("(Calc");
      if (calcIndex != -1) {
        dateString = dateString.substring(0, calcIndex).trim();
      }
      return this.makeDateObjFromDateString(dateString);
    }

    if (this.recordType == RT.Census) {
      if (this.collectionTitle == "1939 Register") {
        return this.makeDateObjFromYear("1939");
      }

      const censusTitleRegex = /^Census .* (\d\d\d\d)$/;
      if (this.collectionTitle && censusTitleRegex.test(this.collectionTitle)) {
        let yearString = this.collectionTitle.replace(censusTitleRegex, "$1");
        if (yearString) {
          return this.makeDateObjFromYear(yearString);
        }
      }
    }
    return undefined;
  }

  getEventPlaceObj() {
    if (this.recordType == RT.Census) {
      let address = this.getRecordDataValueForKeys(["Address"]);
      let parish = this.getRecordDataValueForKeys(["Parish", "Parish (Inferred)"]);
      let enumDistrict = this.getRecordDataValueForKeys(["Enumeration District"]);
      let ledgerCode = this.getRecordDataValueForKeys(["Ledger Code"]);

      let county = "";
      const censusTitleRegex = /^Census Transcript Household (.+) (\d\d\d\d)$/;
      if (this.collectionTitle && censusTitleRegex.test(this.collectionTitle)) {
        county = this.collectionTitle.replace(censusTitleRegex, "$1");
      }

      let country = "";
      if (county) {
        let possibleCountries = ["England", "Wales", "Scotland"];
        for (let possibleCountry of possibleCountries) {
          let countryObj = CD.matchCountryFromPlaceName(possibleCountry);
          if (countryObj) {
            let countryCounty = CD.standardizeCountyNameForCountry(county, countryObj);
            if (countryCounty) {
              country = possibleCountry;
              break;
            }
          }
        }
      }

      if (!country && this.collectionTitle == "1939 Register") {
        country = "England";
        if (ledgerCode) {
          // See https://www.findmypast.com/articles/1939-register-enumeration-districts
          if (ledgerCode.startsWith("X") || ledgerCode.startsWith("Z")) {
            country = "Wales";
          }
        }
      }

      let placeString = "";
      function addPlacePart(part) {
        if (part) {
          if (placeString) {
            placeString += ", ";
          }
          placeString += part;
        }
      }

      addPlacePart(address);
      addPlacePart(parish);
      if (this.collectionTitle == "1939 Register") {
        addPlacePart(enumDistrict);
      }
      addPlacePart(county);
      addPlacePart(country);

      return this.makePlaceObjFromFullPlaceName(placeString);
    } else {
      let place = this.getRecordDataValueForType("place");

      let county = this.getRecordDataValueForKeys(["County"]);
      let placeIncludesCounty = false;
      if (place) {
        if (county) {
          if (place.endsWith(county)) {
            placeIncludesCounty = county;
          }
        } else {
          let placeParts = place.split(",");
          if (placeParts.length > 1) {
            county = placeParts[placeParts.length - 1].trim();
            placeIncludesCounty = true;
          }
        }
      }

      let country = "";
      if (county) {
        let possibleCountries = ["England", "Wales", "Scotland"];
        for (let possibleCountry of possibleCountries) {
          let countryObj = CD.matchCountryFromPlaceName(possibleCountry);
          if (countryObj) {
            let countryCounty = CD.standardizeCountyNameForCountry(county, countryObj);
            if (countryCounty) {
              country = possibleCountry;
              break;
            }
          }
        }
        if (!country) {
          // special cases like "Yorkshire East Riding"
          if (county.startsWith("Yorkshire")) {
            country = "England";
          }
        }
      }

      let placeString = "";
      function addPlacePart(part) {
        if (part) {
          if (placeString) {
            placeString += ", ";
          }
          placeString += part;
        }
      }

      addPlacePart(place);
      if (county && !placeIncludesCounty) {
        addPlacePart(county);
      }
      addPlacePart(country);
      return this.makePlaceObjFromFullPlaceName(placeString);
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
    if (this.recordType == RT.Census) {
      if (this.collectionTitle == "1939 Register") {
        let birthDate = this.getSelectedCensusRowValueForKeys(["Birth Date"]);
        return this.makeDateObjFromDateString(birthDate);
      }

      let birthYear = this.getSelectedCensusRowValueForKeys(["Year Born"]);
      return this.makeDateObjFromYear(birthYear);
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.recordType == RT.Census) {
      let birthYear = this.getSelectedCensusRowValueForKeys(["Birth Place"]);
      return this.makeDateObjFromYear(birthYear);
    }
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    let age = this.getRecordDataValueForType("age");
    if (age) {
      return age;
    }
    return "";
  }

  getAgeAtDeath() {
    if (this.recordType == RT.DeathRegistration || this.recordType == RT.Death || this.recordType == RT.Burial) {
      let age = this.getRecordDataValueForType("age");
      if (age) {
        return age;
      }
    }
    return "";
  }

  getRegistrationDistrict() {
    if (this.recordType == RT.Census) {
      let district = this.getRecordDataValueForKeys(["Registration District", "Borough or District"]);
      return district;
    }
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

export { ThegenEdReader };
