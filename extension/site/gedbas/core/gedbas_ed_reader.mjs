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

class GedbasEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
  }

  getSourceType() {
    return "database";
  }

  getNameObj() {
    if (!this.ed.primaryPerson.Name) return undefined;
    return this.makeNameObjFromFullName(this.ed.primaryPerson.Name.value);
  }

  getBirthDateObj() {
    let dateString = this.ed.primaryPerson.Geburt.date

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getBirthPlaceObj() {
    let placeString = this.ed.primaryPerson.Geburt.place;

    if (placeString || this.recordType == RT.Birth || this.recordType == RT.BirthRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getDeathDateObj() {
    let dateString = this.ed.primaryPerson.Tod.date;

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getDeathPlaceObj() {
    let placeString = this.ed.primaryPerson.Tod.place;

    if (placeString || this.recordType == RT.Death || this.recordType == RT.DeathRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getOccupation() {
    if (!this.ed.primaryPerson.Beruf) return undefined;
    return this.ed.primaryPerson.Beruf.value;
  }

  getSpouses() {
    let spouses = [];
    for (let family of this.ed.families) {
      let nameObj = this.makeNameObjFromFullName(family.partner.name);
      let marriageDate = this.makeDateObjFromDateString(family.marriageDate);
      let marriagePlace = this.makePlaceObjFromFullPlaceName(family.marriagePlace);
      spouses.push(this.makeSpouseObj(nameObj, marriageDate, marriagePlace, undefined));
    }
    return spouses;
  }

  getParents() {
    if (this.ed.parents.length == 0) return undefined;

    let parentData = this.ed.parents[0];
    return this.makeParentsFromFullNames(
      parentData.father.name,
      parentData.mother.name,
    )
  }
}

export { GedbasEdReader };
