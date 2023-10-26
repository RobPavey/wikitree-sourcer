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

class ArchiveEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    this.recordType = RT.Book;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }

    if (!this.ed.metadata) {
      return false; //the extract failed
    }

    return true;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    let lastName = "";
    let forenames = "";

    let authorString = this.ed.metadata["by"];
    if (authorString) {
      let authors = authorString.split(";");
      if (authors && authors.length > 0) {
        let firstAuthorString = authors[0];
        if (firstAuthorString) {
          let parts = firstAuthorString.split(",");
          if (parts && parts.length > 1) {
            lastName = parts[0];
            forenames = parts[1];
            return this.makeNameObjFromForenamesAndLastName(forenames, lastName);
          } else {
            return this.makeNameObjFromFullName(firstAuthorString);
          }
        }
      }
    }
  }

  getEventDateObj() {
    let dateString = this.ed.metadata["Publication date"];

    if (dateString) {
      return this.makeDateObjFromDateString(dateString);
    }

    return undefined;
  }

  setCustomFields(gd) {
    if (this.ed.title) {
      gd.bookTitle = this.ed.title;
    }

    if (this.ed.metadata["by"]) {
      gd.bookAuthor = this.ed.metadata["by"];
    }
  }
}

export { ArchiveEdReader };
