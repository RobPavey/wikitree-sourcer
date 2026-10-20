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

// IMDb is a database of people and titles in the entertainment industry. A "name" page is treated
// as a biographical index entry for the person. A "title" page has no person so it generalizes with no name.
class ImdbEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    // A title page can be cited but has no person so it generalizes without a name or dates
    this.recordType = this.ed.pageType == "name" ? RT.BiographicalIndex : RT.Unclassified;
    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    if (this.ed.pageType == "name" && this.ed.name) {
      return this.makeNameObjFromFullName(this.ed.name);
    }
    return undefined;
  }

  getBirthDateObj() {
    if (this.ed.birthDate) {
      return this.makeDateObjFromYyyymmddDate(this.ed.birthDate);
    }
    if (this.ed.birthDateText) {
      return this.makeDateObjFromDateString(this.ed.birthDateText);
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.ed.birthPlace) {
      return this.makePlaceObjFromFullPlaceName(this.ed.birthPlace);
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.ed.deathDate) {
      return this.makeDateObjFromYyyymmddDate(this.ed.deathDate);
    }
    if (this.ed.deathDateText) {
      return this.makeDateObjFromDateString(this.ed.deathDateText);
    }
    return undefined;
  }

  getDeathPlaceObj() {
    if (this.ed.deathPlace) {
      return this.makePlaceObjFromFullPlaceName(this.ed.deathPlace);
    }
    return undefined;
  }

  // The bio page has the birth name, e.g. "David John McDonald" for the actor David Tennant
  getLastNameAtBirth() {
    if (this.ed.birthName) {
      const nameObj = this.makeNameObjFromFullName(this.ed.birthName);
      if (nameObj) {
        return nameObj.inferLastName();
      }
    }
    return "";
  }

  getSpouses() {
    if (!this.ed.spouses || this.ed.spouses.length == 0) {
      return undefined;
    }

    let spouses = [];
    for (let spouse of this.ed.spouses) {
      const nameObj = this.makeNameObjFromFullName(spouse.name);
      // IMDb gives the start of the relationship, which is not always a marriage date, so it is not used as one
      const spouseObj = this.makeSpouseObj(nameObj, undefined, undefined, undefined);
      if (spouseObj) {
        spouses.push(spouseObj);
      }
    }
    return spouses.length > 0 ? spouses : undefined;
  }

  getOccupation() {
    if (this.ed.jobTitles && this.ed.jobTitles.length > 0) {
      return this.ed.jobTitles.join(", ");
    }
    return "";
  }

  getCollectionData() {
    return undefined;
  }
}

export { ImdbEdReader };
