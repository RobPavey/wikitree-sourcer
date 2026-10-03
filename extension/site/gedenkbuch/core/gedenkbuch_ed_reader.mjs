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

class GedenkbuchEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  // Note: there are default implementations in ExtractedDataReader and, if using a data-driven
  // style, you may not need to override them here.
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNameObj() {
    let parts = this.ed.name.split(",");
    return this.makeNameObjFromForenamesAndLastName(parts[1].trim(), parts[0].trim());
  }

  getBirthDateObj() {
    let dateString = this.ed.birth_date;

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getBirthPlaceObj() {
    let placeString = this.ed.birth_place;

    if (placeString || this.recordType == RT.Birth || this.recordType == RT.BirthRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getDeathDateObj() {
    let dateString = this.ed.death_date;

    if (dateString) {
      let dateObj = this.makeDateObjFromDateString(dateString);
      if (dateObj) {
        return dateObj;
      }
    }

    return undefined;
  }

  getDeathPlaceObj() {
    let placeString = this.ed.death_place;

    if (placeString || this.recordType == RT.Birth || this.recordType == RT.BirthRegistration) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

  getResidencePlaceObj() {
    let placeString = this.ed.residence;

    if (placeString) {
      let placeObj = this.makePlaceObjFromFullPlaceName(placeString);
      if (placeObj) {
        return placeObj;
      }
    }
    return undefined;
  }

}

export { GedenkbuchEdReader };
