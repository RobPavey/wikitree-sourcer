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

    let header = ed.indexHeader ? ed.indexHeader : "";
    if (/^Birth/i.test(header)) {
      this.recordType = RT.Baptism;
    } else if (/^Death/i.test(header)) {
      this.recordType = RT.Burial;
    } else if (
      /^Marriage/i.test(header) ||
      (/^Couple file/i.test(header) && this.getRecordDataValueForKeys(["Marriage date", "Marriage location"]))
    ) {
      this.recordType = RT.Marriage;
    }

    // Marriage records have a groom and a bride, the labels vary by collection
    this.isMarriage = this.recordType == RT.Marriage;
    this.groomPrefix = this.getRecordDataValueForKeys(["Husband"]) ? "Husband" : "Man";
    this.bridePrefix = this.getRecordDataValueForKeys(["Wife"]) ? "Wife" : "Woman";
  }

  getGroomField(suffix) {
    // e.g. "Husband's age" or "Man's father"
    return this.getRecordDataValueForKeys([this.groomPrefix + "'s " + suffix]) || "";
  }

  getBrideField(suffix) {
    return this.getRecordDataValueForKeys([this.bridePrefix + "'s " + suffix]) || "";
  }

  makeName(fullName) {
    if (!fullName) {
      return undefined;
    }
    let name = this.makeNameObjFromLastNameCommaForenames(fullName);
    if (name) {
      name.setLastName(StringUtils.toInitialCapsEachWord(name.inferLastName(), true));
      return name;
    }
    return this.makeNameObjFromFullName(fullName);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNameObj() {
    if (this.isMarriage) {
      return this.makeName(this.getRecordDataValueForKeys(["Husband", "Man's name"]));
    }
    return this.makeName(this.getRecordDataValueForKeys(["Name"]));
  }

  getGender() {
    if (this.isMarriage) {
      return "male";
    }
    return this.getRecordDataValueForKeys(["Gender"]) || "";
  }

  getEventDateObj() {
    if (this.recordType == RT.Baptism) {
      return this.makeDateObjFromDateString(this.getRecordDataValueForKeys(["Baptism date", "Birth date"]));
    } else if (this.recordType == RT.Burial) {
      return this.makeDateObjFromDateString(this.getRecordDataValueForKeys(["Burial date", "Death date"]));
    }
    return this.makeDateObjFromDateString(this.getRecordDataValueForKeys(["Marriage date"]));
  }

  getEventPlaceObj() {
    let place = this.getRecordDataValueForKeys(["Baptism location", "Burial location", "Marriage location"]);
    return place ? this.makePlaceObjFromFullPlaceName(place) : undefined;
  }

  getBirthDateObj() {
    if (this.recordType == RT.Baptism) {
      return this.makeDateObjFromDateString(this.getRecordDataValueForKeys(["Birth date"]));
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.recordType == RT.Burial) {
      return this.makeDateObjFromDateString(this.getRecordDataValueForKeys(["Death date"]));
    }
    return undefined;
  }

  getAgeAtDeath() {
    if (this.recordType == RT.Burial) {
      return (this.getRecordDataValueForKeys(["Age"]) || "").replace(/^0+(?=\d)/, "");
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
    return this.getRecordDataValueForKeys(["Civil status"]);
  }

  getOccupation() {
    if (this.isMarriage) {
      return this.getGroomField("occupation");
    }
    return "";
  }

  getSpouses() {
    if (this.isMarriage) {
      let spouseNameObj = this.makeName(this.getRecordDataValueForKeys(["Wife", "Woman's name"]));
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

    let spouseNameObj = this.makeName(this.getRecordDataValueForKeys(["Spouse"]));
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
      father = this.getRecordDataValueForKeys(["Father"]);
      mother = this.getRecordDataValueForKeys(["Mother"]);
    }
    return this.makeParentsFromNameObjs(this.makeName(father), this.makeName(mother));
  }

  getCollectionData() {
    return undefined;
  }
}

export { GenquebecEdReader };
