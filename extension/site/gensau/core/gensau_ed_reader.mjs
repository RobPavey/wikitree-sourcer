/*
MIT License

Copyright (c) 2020-2025 Robert M Pavey and the wikitree-sourcer contributors.

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

function cleanForenames(edReader, inputString) {
  let resultString = inputString;

  // forenames can contain a preferred name in parens,
  // Sourcer generalize code expects this to be in double quotes
  const regex = /\(([^)]+)\)/;
  if (regex.test(resultString)) {
    resultString = resultString.replace('"$1"');
  }

  // sometimes there is a comma followed by a prefix: e.g. "Patricia, Mrs"
  // we move the prefix to the start so that it is handled correctly
  let parts = resultString.split(",");
  if (parts.length == 2) {
    resultString = parts[1].trim() + " " + parts[0].trim();
  }

  return resultString;
}

function cleanDate(edReader, inputString) {
  let resultString = inputString;

  // Occasionally a birth reg gets a Birth Year like "1857-09"
  // which is a year and month. By default Sourcer would treat that as a year range
  // change it to "09 1957" which will get treated correctly
  const regex = /^(\d\d\d\d)-(\d\d?)$/;
  if (regex.test(resultString)) {
    let yearString = resultString.replace(regex, "$1");
    let monthString = resultString.replace(regex, "$2");
    if (yearString && monthString) {
      resultString = monthString + " " + yearString;
    }
  }

  return resultString;
}

const recordTypes = [
  // BDM
  {
    recordType: RT.BirthRegistration,
    collectionIds: ["Birth Registrations"],
  },
  {
    recordType: RT.DeathRegistration,
    collectionIds: ["Death Registrations"],
  },
  {
    recordType: RT.MarriageRegistration,
    collectionIds: ["Marriage Registrations"],
    inferGenderByNameMatch: {
      forenames: { edKeys: ["titleGivenNames"] },
      lastName: { edKeys: ["titleSurname"] },
      maleForenames: { recordDataKeys: ["Groom Given Names"] },
      maleLastName: { recordDataKeys: ["Groom Surname"] },
      femaleForenames: { recordDataKeys: ["Bride Given Names"] },
      femaleLastName: { recordDataKeys: ["Bride Surname"] },
    },
    rules: {
      eventDate: {
        recordDataKeys: ["Marriage Date", "Marriage Year"],
      },
      eventPlace: {
        recordDataKeys: ["Marriage Place"],
      },
    },
  },
  // Newspaper
  {
    recordType: RT.Birth,
    collectionIds: ["Newspaper Births"],
  },
  {
    recordType: RT.Death,
    collectionIds: ["Newspaper Deaths"],
  },
  {
    recordType: RT.Marriage,
    collectionIds: ["Newspaper Marriages"],
    documentTypes: ["Marriage"],
    rules: {
      eventDate: {
        recordDataKeys: ["Date"],
      },
    },
  },
  {
    recordType: RT.Newspaper,
    collectionIds: ["Newspaper Marriages"],
  },
  {
    recordType: RT.Divorce,
    collectionIds: ["Newspaper Divorces"],
  },
  // Cemeteries Burial Records
  {
    recordType: RT.Burial,
    collectionIds: ["South Australia Cemeteries"],
  },
  // Church Records
  {
    recordType: RT.Burial,
    collectionIds: ["South Australian Church records - Burials"],
  },
  {
    recordType: RT.Baptism,
    collectionIds: ["South Australian Church records - Baptisms"],
  },
  {
    recordType: RT.Marriage,
    collectionIds: ["South Australian Church records - Marriages"],
    rules: {
      eventDate: {
        recordDataKeys: ["Marriage Date", "Year of marriage"],
      },
    },
  },
  {
    recordType: RT.OtherChurchEvent,
    collectionIds: ["South Australian Church records - Other"],
  },
  // Admission Records
  {
    recordType: RT.SchoolRecords,
    collectionIds: ["South Australian School Admissions"],
    rules: {
      eventPlace: {
        recordDataKeys: ["Address", "Town"],
      },
    },
  },
  {
    recordType: RT.MedicalPatient,
    collectionIds: ["Hospital, Asylum and Lying-in Home Admissions"],
    rules: {
      eventDate: {
        recordDataKeys: ["Admission Date", "Admission Year"],
      },
      eventPlace: {
        recordDataKeys: ["Hospital", "Residence"],
      },
    },
  },
  // Other Records
  {
    recordType: RT.Unclassified,
    collectionIds: ["Biographical Index of South Australians"],
  },
  {
    recordType: RT.Unclassified,
    collectionIds: ["Biographical Index of South Australians - Supplementary"],
  },
  {
    recordType: RT.Certificate,
    collectionIds: ["Certificates-Australia and Overseas"],
  },
  {
    recordType: RT.Unclassified,
    collectionIds: ["Irish Born South Australians (IBSA)"],
  },
  {
    recordType: RT.PassengerList,
    collectionIds: ["Ship Passenger Arrivals in South Australia"],
  },
  {
    recordType: RT.Unclassified,
    collectionIds: ["Ships to South Australia"],
  },
  {
    recordType: RT.PassengerList,
    collectionIds: ["Shipping Passenger Departures from South Australia"],
  },
  {
    recordType: RT.Probate,
    collectionIds: ["South Australian Public Trustees/Deceased Estates"],
  },
];

const unclassifiedTypeData = {
  recordType: RT.Unclassified,
};

const defaultRecordTypeData = {
  rules: {
    forenames: {
      prioritizeEdKeys: true,
      recordDataKeys: ["Given Names", "First Names"],
      edKeys: ["titleGivenNames"],
      cleanFunction: cleanForenames,
    },
    lastName: {
      prioritizeEdKeys: true,
      recordDataKeys: ["Surname"],
      edKeys: ["titleSurname"],
      convertNameFromAllCapsToMixedCase: true,
    },
    gender: {
      recordDataKeys: ["Gender", "Sex"],
      valueMapping: {
        male: ["M"],
        female: ["F"],
      },
    },
    birthDate: {
      recordDataKeys: ["Date of Birth", "Birth Date", "Birth Year"],
      cleanFunction: cleanDate,
    },
    birthPlace: {
      recordDataKeys: ["Birth Place"],
    },
    deathDate: {
      recordDataKeys: ["Death Date", "Death Year"],
    },
    deathPlace: {
      recordDataKeys: ["Death Place"],
    },
    ageAtEvent: {
      recordDataKeys: ["Age"],
    },
    occupation: {
      recordDataKeys: ["Occupation"],
    },
    registrationDistrict: {
      recordDataKeys: ["District"],
    },
    arrivalDate: {
      recordDataKeys: ["Arrival Date"],
    },
    departureDate: {
      recordDataKeys: ["Departure Date"],
    },
    shipName: {
      recordDataKeys: ["Ship Name"],
    },
    spouseForenames: {
      recordDataKeys: ["Spouse Given Names"],
    },
    spouseLastName: {
      recordDataKeys: ["Spouse Surname"],
      convertNameFromAllCapsToMixedCase: true,
    },
    brideForenames: {
      recordDataKeys: ["Bride Given Names"],
    },
    brideLastName: {
      recordDataKeys: ["Bride Surname"],
      convertNameFromAllCapsToMixedCase: true,
    },
    brideAge: {
      recordDataKeys: ["Bride Age"],
    },
    groomForenames: {
      recordDataKeys: ["Groom Given Names"],
    },
    groomLastName: {
      recordDataKeys: ["Groom Surname"],
      convertNameFromAllCapsToMixedCase: true,
    },
    groomAge: {
      recordDataKeys: ["Groom Age"],
    },
    fatherFullName: {
      recordDataKeys: ["Father"],
      convertNameFromAllCapsToMixedCase: true,
    },
    motherFullName: {
      recordDataKeys: ["Mother"],
      convertNameFromAllCapsToMixedCase: true,
    },
  },
  advancedPlaceRules: {
    addImpliedPartsToBlankPlace: true,
    impliedCountryName: "Australia",
    impliedStateName: "South Australia",
  },
};

class GensauEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.defaultRecordTypeData = defaultRecordTypeData;
    let databaseName = ed.databaseName;
    let documentType = ed.recordData["Notice"];
    if (databaseName) {
      let recordTypeData = this.getRecordTypeMatch(recordTypes, {
        collectionId: databaseName,
        documentType: documentType,
      });
      if (recordTypeData) {
        this.recordTypeData = recordTypeData;
        this.recordType = recordTypeData.recordType;
      } else {
        this.recordTypeData = unclassifiedTypeData;
      }
    } else {
      this.recordTypeData = unclassifiedTypeData;
    }
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
    return "record";
  }

  getGender() {
    let gender = super.getGender();
    if (gender) {
      return gender;
    }

    if (this.recordTypeData.inferGenderByNameMatch) {
      let infer = this.recordTypeData.inferGenderByNameMatch;

      let forenames = this.getValueUsingRule(infer.forenames);
      let lastName = this.getValueUsingRule(infer.lastName);
      let maleForenames = this.getValueUsingRule(infer.maleForenames);
      let maleLastName = this.getValueUsingRule(infer.maleLastName);
      let femaleForenames = this.getValueUsingRule(infer.femaleForenames);
      let femaleLastName = this.getValueUsingRule(infer.femaleLastName);

      if (forenames && lastName) {
        if (maleForenames && maleLastName && maleForenames == forenames && maleLastName == lastName) {
          return "male";
        }
        if (femaleForenames && femaleLastName && femaleForenames == forenames && femaleLastName == lastName) {
          return "female";
        }
        if (maleForenames && maleForenames == forenames) {
          return "male";
        }
        if (femaleForenames && femaleForenames == forenames) {
          return "female";
        }
        if (maleLastName && maleLastName == lastName) {
          return "male";
        }
        if (femaleLastName && femaleLastName == lastName) {
          return "female";
        }
      } else if (forenames) {
        if (maleForenames && maleForenames == forenames) {
          return "male";
        }
        if (femaleForenames && femaleForenames == forenames) {
          return "female";
        }
      } else if (lastName) {
        if (maleLastName && maleLastName == lastName) {
          return "male";
        }
        if (femaleLastName && femaleLastName == lastName) {
          return "female";
        }
      }
    }

    let nameObj = this.getNameObj();
    if (nameObj) {
      if (nameObj.nonPrefixHonorific) {
        let honorific = nameObj.nonPrefixHonorific;
        if (honorific.startsWith("Mrs") || honorific.startsWith("Miss") || honorific.startsWith("Ms")) {
          return "female";
        }
      }
    }

    return "";
  }

  getCollectionData() {
    let id = "";
    let year = "";

    if (this.recordType == RT.BirthRegistration) {
      id = "Births";
      let birthDataObj = this.getBirthDateObj();
      if (birthDataObj) {
        year = birthDataObj.getYearString();
      }
    } else if (this.recordType == RT.DeathRegistration) {
      id = "Deaths";
      let deathDataObj = this.getDeathDateObj();
      if (deathDataObj) {
        year = deathDataObj.getYearString();
      }
    } else if (this.recordType == RT.MarriageRegistration) {
      id = "Marriages";
      let eventDataObj = this.getEventDateObj();
      if (eventDataObj) {
        year = eventDataObj.getYearString();
      }
    }

    if (id) {
      let registrationNumber = this.ed.recordData["Book/Page"];

      let collectionData = { id: id, year: year, registrationNumber: registrationNumber };
      return collectionData;
    }
    return undefined;
  }
}

export { GensauEdReader };
