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

class JstorEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    // "book", "academic-content", "journal article"

    if (ed.contentType == "book") {
      this.recordType = RT.Book;
    } else if (ed.contentType == "academic-content" || ed.contentType == "journal article") {
      this.recordType = RT.Journal;
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
    if (this.ed.authors) {
      nameString += this.ed.authors;
    }

    return this.makeNameObjFromFullName(nameString);
  }

  getEventDateObj() {
    if (this.ed.publishedDate) {
      let string = this.ed.publishedDate;
      let year = string.replace(/^.*(\d\d\d\d)$/, "$1");
      if (year && year.length == 4) {
        return this.makeDateObjFromDateString(year);
      }
    } else if (this.ed.journalDetails) {
      // e.g. "Vol. 50, No. 1 (Oct., 1944), pp. 82-90 (9 pages)"
      // or "Vol. 23, No. 3 (Jul., 1915), pp. 294-296 (3 pages)"
      let details = this.ed.journalDetails;
      let dateString = details.replace(/^[^\(]*\(([^\)]+)\).*$/, "$1");
      if (dateString && dateString != details) {
        dateString = dateString.replace(/(\w\w\w)\.\,\s*(\d\d\d\d)/, "$1 $2").trim();
        if (dateString) {
          return this.makeDateObjFromDateString(dateString);
        }
      }
    }
  }

  setCustomFields(gd) {
    if (this.recordType == RT.Book) {
      if (this.ed.bookTitle) {
        gd.bookTitle = this.ed.bookTitle;
      } else if (this.ed.title) {
        gd.bookTitle = this.ed.title;
      }
      if (this.ed.authors) {
        gd.bookAuthor = this.ed.authors;
      }
    } else if (this.recordType == RT.Journal) {
      if (this.ed.journalName) {
        gd.journalName = this.ed.journalName;
      }
      if (this.ed.title) {
        gd.journalArticle = this.ed.title;
      }
      if (this.ed.authors) {
        gd.journalAuthor = this.ed.authors;
      }
    }
  }
}

export { JstorEdReader };
