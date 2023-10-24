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
import { NameObj } from "../../../base/core/generalize_data_utils.mjs";

class HathiEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    this.recordType = RT.Book;
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
    let nameString = "";
    if (this.ed.creator) {
      nameString += this.ed.creator;
    } else if (this.ed.author) {
      nameString += this.ed.author;
    }

    return this.makeNameObjFromFullNameWithComma(nameString);
  }

  getEventDateObj() {
    if (this.ed.publisher) {
      let string = this.ed.publisher;
      let year = string.replace(/^.*(\d\d\d\d)\.$/, "$1");
      if (year && year.length == 4) {
        return this.makeDateObjFromDateString(year);
      }
    }
  }

  setCustomFields(gd) {
    if (this.ed.name) {
      gd.bookTitle = this.ed.name;
    } else if (this.ed.metaTitle) {
      gd.bookTitle = this.ed.metaTitle;
    } else if (this.ed.dcTitle) {
      gd.bookTitle = this.ed.dcTitle;
    } else if (this.ed.title) {
      gd.bookTitle = this.ed.title;
    }

    if (this.ed.subtitle) {
      gd.bookSubtitle = this.ed.subtitle;
    }

    if (this.ed.author) {
      gd.bookAuthor = this.ed.author;
    }
  }

  getCollectionData() {
    return undefined;
  }
}

export { HathiEdReader };
