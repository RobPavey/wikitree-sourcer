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
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { NameObj, DateObj, PlaceObj } from "../../../base/core/generalize_data_utils.mjs";

const recordTypeMatches = [
  {
    recordType: RT.Census,
    requiredFields: [["Census"]],
  },
  {
    recordType: RT.Baptism,
    requiredFields: [["Baptism"]],
  },
  {
    recordType: RT.Census,
    collectionTitleMatches: [["Federal Census"], ["Census Collection"]],
  },
  {
    recordType: RT.Birth,
    collectionTitleMatches: [["Birth Index"]],
  },
  {
    recordType: RT.Birth,
    collectionTitleMatches: [["Vital Records"]],
    requiredFields: [["Birth"]],
  },
  {
    recordType: RT.Death,
    collectionTitleMatches: [["Death Index"]],
  },
  {
    recordType: RT.Tax,
    collectionTitleMatches: [["Direct Tax"]],
  },
  {
    recordType: RT.Probate,
    collectionTitleMatches: [["Probate"]],
  },
  {
    recordType: RT.Military,
    requiredFields: [["Military Record"]],
  },
  {
    recordType: RT.Death,
    requiredFields: [["Death"]],
  },
  {
    recordType: RT.Marriage,
    requiredFields: [["Marriage"]],
  },
  {
    recordType: RT.Birth,
    requiredFields: [["Birth"]],
  },
  {
    recordType: RT.Residence,
    requiredFields: [["Residence"]],
  },
];

class AmerancEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    let inputData = {
      collectionTitle: ed.title,
      recordData: ed.recordData,
    };

    // Note: for transcript pages there is often a "Record Type" column in table.
    // For record pages the second fields in recordData is often named in a way that indicates
    // the record type.
    // For images all we have to go on is the title.
    this.recordType = this.determineRecordType(recordTypeMatches, inputData);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helper functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  makeNameObjFromAmerancFullName(fullNameString) {
    if (fullNameString) {
      if (StringUtils.isWordAllUpperCase(fullNameString)) {
        let fullName = NameUtils.convertNameFromAllCapsToMixedCase(fullNameString);
        return this.makeNameObjFromFullName(fullName);
      } else {
        let forenames = "";
        let lastName = "";
        let foundLastName = false;
        let parts = fullNameString.split(" ");
        for (let part of parts) {
          if (foundLastName || StringUtils.isWordAllUpperCase(part)) {
            foundLastName = true;
            if (lastName) {
              lastName += " ";
            }
            lastName += part;
          } else {
            if (forenames) {
              forenames += " ";
            }
            forenames += part;
          }
        }

        if (foundLastName) {
          lastName = NameUtils.convertNameFromAllCapsToMixedCase(lastName);

          let nameObj = new NameObj();
          nameObj.setLastName(lastName);
          nameObj.setForenames(forenames);
          return nameObj;
        } else {
          return this.makeNameObjFromFullName(fullNameString);
        }
      }
    }
  }

  makeDateObjFromAmerancDateString(dateString) {
    const mmddyyyyRegex = /^(\d\d?\/\d\d?\/\d\d\d\d)$/;
    if (mmddyyyyRegex.test(dateString)) {
      return this.makeDateObjFromMmddyyyyDate(dateString, "/");
    }

    const yearRangeRegex = /^(\d\d\d\d)\s*\-\s*(\d\d\d\d)$/;
    if (yearRangeRegex.test(dateString)) {
      // remove any spaces
      dateString = dateString.replace(/\s*/g, "");
      return this.makeDateObjFromYearRange(dateString);
    }

    const yearRegex = /^(\d\d\d\d)$/;
    if (yearRegex.test(dateString)) {
      return this.makeDateObjFromYear(dateString);
    }

    return this.makeDateObjFromDateString(dateString);
  }

  getPrimaryTranscriptValue(keys) {
    let transcriptTable = this.ed.transcriptTable;
    let extendedAttributes = this.ed.extendedAttributes;
    if (!transcriptTable || !extendedAttributes) {
      return;
    }

    if (!transcriptTable.length || transcriptTable.length != extendedAttributes.length) {
      return;
    }

    let primaryTranscript = undefined;
    let primaryExtendedAttributes = undefined;

    for (let index = 0; index < transcriptTable.length; index++) {
      if (extendedAttributes[index].isPrimary) {
        primaryTranscript = transcriptTable[index];
        primaryExtendedAttributes = extendedAttributes[index];
        break;
      }
    }

    if (!primaryTranscript || !primaryExtendedAttributes) {
      return;
    }

    for (let key of keys) {
      if (primaryTranscript[key]) {
        return primaryTranscript[key];
      }
    }

    for (let key of keys) {
      if (primaryExtendedAttributes[key]) {
        return primaryExtendedAttributes[key];
      }
    }
  }

  getRecordDataOrTranscriptValueForKeys(keys) {
    let value = this.getRecordDataValueForKeys(keys);
    if (!value) {
      value = this.getPrimaryTranscriptValue(keys);
    }
    return value;
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

  getNameObj() {
    let name = this.getRecordDataOrTranscriptValueForKeys(["Name", "Names"]);
    return this.makeNameObjFromAmerancFullName(name);
  }

  getGender() {
    let gender = this.getRecordDataOrTranscriptValueForKeys(["Gender", "Sex"]);
    if (gender) {
      return gender.toLowerCase();
    }
    return "";
  }

  getEventDateObj() {
    if (this.recordType == RT.Census) {
      let year = this.getRecordDataValueForKeys(["Census"]);
      if (year) {
        return this.makeDateObjFromYear(year);
      }
    } else if (this.recordType == RT.Birth) {
      let dateString = this.getRecordDataValueForKeys(["Date of Birth", "Birth"]);
      if (dateString) {
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    } else if (this.recordType == RT.Baptism) {
      let dateString = this.getRecordDataValueForKeys(["Baptism"]);
      if (dateString) {
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    } else if (this.recordType == RT.Marriage) {
      let dateString = this.getRecordDataValueForKeys(["Marriage"]);
      if (dateString) {
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    } else if (this.recordType == RT.Military) {
      let dateString = this.getRecordDataValueForKeys(["Military Record"]);
      if (dateString) {
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    } else if (this.recordType == RT.Probate) {
      let dateString = this.getRecordDataValueForKeys(["Probate Record"]);
      if (dateString) {
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    } else if (this.recordType == RT.Tax) {
      let dateString = this.getRecordDataValueForKeys(["Tax"]);
      if (dateString) {
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    } else if (this.recordType == RT.Death) {
      // the SS Death Index can have a field: Death	12/3/1887 - 1974
      let dateString = this.getRecordDataValueForKeys(["Death"]);
      if (dateString) {
        const birthAndDeathRegex = /^(\d\d?\/\d\d?\/\d\d\d\d)\s+\-\s+(\d\d\d\d)$/;
        if (birthAndDeathRegex.test(dateString)) {
          let birthDate = dateString.replace(birthAndDeathRegex, "$1");
          let deathDate = dateString.replace(birthAndDeathRegex, "$2");
          return this.makeDateObjFromYear(deathDate);
        }
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    } else if (this.recordType == RT.Residence) {
      let dateString = this.getRecordDataValueForKeys(["Residence"]);
      if (dateString) {
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    }

    let genericRecordValue = this.getRecordDataValueForKeys(["Record"]);
    if (genericRecordValue) {
      return this.makeDateObjFromAmerancDateString(genericRecordValue);
    }

    // transcript can have date in the table data
    if (this.ed.isTranscript) {
      let startDateString = this.getPrimaryTranscriptValue(["Start Date"]);
      if (startDateString) {
        return this.makeDateObjFromAmerancDateString(startDateString);
      }
      let endDateString = this.getPrimaryTranscriptValue(["End Date"]);
      if (endDateString) {
        return this.makeDateObjFromAmerancDateString(endDateString);
      }
    }

    return undefined;
  }

  getEventPlaceObj() {
    let location = this.getRecordDataOrTranscriptValueForKeys(["Location"]);
    if (location) {
      if (this.recordType == RT.Census) {
        // sometimes the location has a district name like:
        // Queens (Districts 0001-0250), Queens, New York, United States
        const districtRegex = /^.+\(.+\), (.*)$/;
        if (districtRegex.test(location)) {
          location = location.replace(districtRegex, "$1");
        }
        const notStatedRegex = /^Not Stated, (.*)$/;
        if (notStatedRegex.test(location)) {
          location = location.replace(notStatedRegex, "$1");
        }
      }
      return this.makePlaceObjFromFullPlaceName(location);
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
    let dateString = this.getRecordDataOrTranscriptValueForKeys(["Date of Birth"]);
    if (dateString) {
      return this.makeDateObjFromAmerancDateString(dateString);
    }
    if (this.recordType == RT.Death) {
      let dateString = this.getRecordDataValueForKeys(["Death"]);
      if (dateString) {
        const birthAndDeathRegex = /^(\d\d?\/\d\d?\/\d\d\d\d)\s+\-\s+(\d\d\d\d)$/;
        if (birthAndDeathRegex.test(dateString)) {
          let birthDate = dateString.replace(birthAndDeathRegex, "$1");
          return this.makeDateObjFromMmddyyyyDate(birthDate, "/");
        }
      }
    }
  }

  getBirthPlaceObj() {
    let placeString = this.getRecordDataOrTranscriptValueForKeys(["Birth Place"]);
    return this.makePlaceObjFromFullPlaceName(placeString);
  }

  getDeathDateObj() {
    if (this.recordType == RT.Death) {
      // the SS Death Index can have a field: Death	12/3/1887 - 1974
      let dateString = this.getRecordDataOrTranscriptValueForKeys(["Death"]);
      if (dateString) {
        const birthAndDeathRegex = /^(\d\d?\/\d\d?\/\d\d\d\d)\s+\-\s+(\d\d\d\d)$/;
        if (birthAndDeathRegex.test(dateString)) {
          let deathDate = dateString.replace(birthAndDeathRegex, "$2");
          return this.makeDateObjFromYear(deathDate);
        }
        return this.makeDateObjFromAmerancDateString(dateString);
      }
    }

    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    return this.getRecordDataOrTranscriptValueForKeys(["Age"]);
  }

  getAgeAtDeath() {
    return "";
  }

  getRace() {
    let race = this.getRecordDataOrTranscriptValueForKeys(["Race", "Historic Racial Identification"]);
    const quotedRegex = /^"(.*)"$/;
    if (quotedRegex.test(race)) {
      race = race.replace(quotedRegex, "$1");
      race = race.trim();
    }
    return race;
  }

  getRegistrationDistrict() {
    return "";
  }

  getRelationshipToHead() {
    return this.getRecordDataOrTranscriptValueForKeys(["Relationship"]);
  }

  getMaritalStatus() {
    return this.getRecordDataOrTranscriptValueForKeys(["Marital Status"]);
  }

  getOccupation() {
    return this.getRecordDataOrTranscriptValueForKeys(["Occupation"]);
  }

  getSpouses() {
    if (this.recordType == RT.Marriage) {
      let eventDateObj = this.getEventDateObj();
      let eventPlaceObj = this.getEventPlaceObj();
      let spouseName = this.getRecordDataValueForKeys(["Spouse"]);
      if (spouseName) {
        let spouseNameObj = this.makeNameObjFromFullName(spouseName);
        return [this.makeSpouseObj(spouseNameObj, eventDateObj, eventPlaceObj)];
      }
    }

    return undefined;
  }

  getParents() {
    let fatherName = this.getRecordDataValueForKeys(["Father"]);
    let motherName = this.getRecordDataValueForKeys(["Mother"]);
    return this.makeParentsFromFullNames(fatherName, motherName);
  }

  getHousehold() {
    if (this.recordType != RT.Census || !this.ed.isTranscript) {
      return undefined;
    }

    if (!this.ed.extendedAttributes || !this.ed.transcriptTable) {
      return undefined;
    }

    let extendedAttributes = this.ed.extendedAttributes;
    let transcriptTable = this.ed.transcriptTable;

    if (!extendedAttributes.length || extendedAttributes.length != transcriptTable.length) {
      return undefined;
    }

    const stdFieldNames = [
      { stdName: "age", siteHeadings: ["Age"] },
      { stdName: "birthPlace", siteHeadings: ["Birth Place"] },
      { stdName: "maritalStatus", siteHeadings: ["Marital Status"] },
      { stdName: "gender", siteHeadings: ["Gender"] },
      // not seen yet
      { stdName: "relationship", siteHeadings: ["Relationship"] },
      { stdName: "occupation", siteHeadings: ["Occupation"] },
    ];
    function headingToStdName(heading) {
      for (let entry of stdFieldNames) {
        if (entry.siteHeadings.includes(heading)) {
          return entry.stdName;
        }
      }
    }

    let numExpanded = 0;
    for (let index = 0; index < extendedAttributes.length; index++) {
      let attributes = extendedAttributes[index];
      if (attributes.isExpanded) {
        numExpanded++;
      }
    }

    let headings = ["name"];
    for (let index = 0; index < extendedAttributes.length; index++) {
      let attributes = extendedAttributes[index];
      if (numExpanded > 1 && !attributes.isExpanded) {
        continue;
      }
      for (let key of Object.keys(attributes)) {
        let stdHeading = headingToStdName(key);
        if (stdHeading) {
          if (!headings.includes(stdHeading)) {
            headings.push(stdHeading);
          }
        }
      }
    }

    let householdArray = [];
    for (let index = 0; index < extendedAttributes.length; index++) {
      let transcript = transcriptTable[index];
      let attributes = extendedAttributes[index];
      if (numExpanded > 1 && !attributes.isExpanded) {
        continue;
      }

      let name = transcript["Names"];
      if (!name) {
        continue;
      }

      let householdMember = {};
      if (numExpanded == 1 && attributes.isExpanded) {
        householdMember.isSelected = true;
      }

      householdMember.name = name;

      for (let key of Object.keys(attributes)) {
        let stdHeading = headingToStdName(key);
        if (stdHeading) {
          if (headings.includes(stdHeading)) {
            householdMember[stdHeading] = attributes[key];
          }
        }
      }

      householdArray.push(householdMember);
    }

    let result = {};
    result.fields = headings;
    result.members = householdArray;

    return result;
  }

  getCollectionData() {
    return undefined;
  }
}

export { AmerancEdReader };
