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
import { StringUtils } from "../../../base/core/string_utils.mjs";

class GenquebecEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.fields = ed.fields ? ed.fields : {};

    let header = ed.indexHeader ? ed.indexHeader : "";
    if (/^Birth/i.test(header)) {
      this.recordType = RT.Baptism;
    } else if (/^Death/i.test(header)) {
      this.recordType = RT.Burial;
    } else if (
      /^Marriage/i.test(header) ||
      (/^Couple file/i.test(header) && (this.fields["Marriage date"] || this.fields["Marriage location"]))
    ) {
      this.recordType = RT.Marriage;
    }

    // Marriage records have a groom and a bride, the labels vary by collection
    this.isMarriage = this.recordType == RT.Marriage;
    this.groomPrefix = this.fields["Husband"] ? "Husband" : "Man";
    this.bridePrefix = this.fields["Wife"] ? "Wife" : "Woman";
  }

  getField(...labels) {
    for (let label of labels) {
      if (this.fields[label]) {
        return this.fields[label];
      }
    }
    return "";
  }

  getGroomField(suffix) {
    // e.g. "Husband's age" or "Man's father"
    return this.getField(this.groomPrefix + "'s " + suffix);
  }

  getBrideField(suffix) {
    return this.getField(this.bridePrefix + "'s " + suffix);
  }

  makeName(fullName) {
    if (!fullName) {
      return undefined;
    }
    let commaIndex = fullName.indexOf(",");
    if (commaIndex >= 0) {
      let lastName = fullName.substring(0, commaIndex).trim();
      let forenames = fullName.substring(commaIndex + 1).trim();
      return this.makeNameObjFromForenamesAndLastName(
        forenames,
        StringUtils.toInitialCapsEachWord(lastName, true)
      );
    }
    return this.makeNameObjFromFullName(fullName);
  }

  makeDate(dateString) {
    if (!dateString) {
      return undefined;
    }
    let match = dateString.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
    if (match) {
      let months = {
        Jan: "January",
        Feb: "February",
        Mar: "March",
        Apr: "April",
        May: "May",
        Jun: "June",
        Jul: "July",
        Aug: "August",
        Sep: "September",
        Oct: "October",
        Nov: "November",
        Dec: "December",
      };
      if (months[match[2]]) {
        dateString = match[1] + " " + months[match[2]] + " " + match[3];
      }
    }
    return this.makeDateObjFromDateString(dateString);
  }

  makePlace(placeString) {
    return placeString ? this.makePlaceObjFromFullPlaceName(placeString) : undefined;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNameObj() {
    if (this.isMarriage) {
      return this.makeName(this.getField("Husband", "Man's name"));
    }
    return this.makeName(this.getField("Name"));
  }

  getGender() {
    if (this.isMarriage) {
      return "male";
    }
    return this.getField("Gender");
  }

  getEventDateObj() {
    if (this.recordType == RT.Baptism) {
      return this.makeDate(this.getField("Baptism date", "Birth date"));
    } else if (this.recordType == RT.Burial) {
      return this.makeDate(this.getField("Burial date", "Death date"));
    }
    return this.makeDate(this.getField("Marriage date"));
  }

  getEventPlaceObj() {
    return this.makePlace(this.getField("Baptism location", "Burial location", "Marriage location"));
  }

  getBirthDateObj() {
    if (this.recordType == RT.Baptism) {
      return this.makeDate(this.getField("Birth date"));
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.recordType == RT.Burial) {
      return this.makeDate(this.getField("Death date"));
    }
    return undefined;
  }

  getAgeAtDeath() {
    if (this.recordType == RT.Burial) {
      return this.getField("Age").replace(/^0+(?=\d)/, "");
    }
    return "";
  }

  getAgeAtEvent() {
    if (this.isMarriage) {
      // "maj" and "min" mean of full age/minor, which are not ages
      let age = this.getGroomField("age");
      return /\d/.test(age) ? age : "";
    }
    return "";
  }

  getMaritalStatus() {
    if (this.isMarriage) {
      return this.getGroomField("civil status");
    }
    return this.getField("Civil status");
  }

  getOccupation() {
    if (this.isMarriage) {
      return this.getGroomField("occupation");
    }
    return "";
  }

  getSpouses() {
    if (this.isMarriage) {
      let spouseNameObj = this.makeName(this.getField("Wife", "Woman's name"));
      let age = this.getBrideField("age");
      if (!/\d/.test(age)) {
        age = "";
      }
      let spouse = this.makeSpouseObj(spouseNameObj, this.getEventDateObj(), this.getEventPlaceObj(), age);
      if (spouse) {
        spouse.personGender = "female";
        spouse.parents = this.makeParentsFromNameObjs(
          this.makeName(this.getBrideField("father")),
          this.makeName(this.getBrideField("mother"))
        );
      }
      return [spouse];
    }

    let spouseNameObj = this.makeName(this.getField("Spouse"));
    if (spouseNameObj) {
      return [this.makeSpouseObj(spouseNameObj)];
    }
    return undefined;
  }

  getParents() {
    let father = "";
    let mother = "";
    if (this.isMarriage) {
      father = this.getGroomField("father");
      mother = this.getGroomField("mother");
    } else {
      father = this.getField("Father");
      mother = this.getField("Mother");
    }
    return this.makeParentsFromNameObjs(this.makeName(father), this.makeName(mother));
  }

  getCollectionData() {
    return undefined;
  }
}

export { GenquebecEdReader };
