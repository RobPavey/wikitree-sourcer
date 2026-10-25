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
import { formatIssueDate, getPublicationTitle } from "./wol_ed_utils.mjs";

// The library has the text of the magazines (Watchtower, Awake! etc.), books, yearbooks and brochures of
// Jehovah's Witnesses. A document is an article in a magazine or a chapter etc. in a book. Most are not about a person but a
// life story article (that has "As told by <name>") is, so that name is used as the name in the generalized data.
class WolEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.recordType = this.isPeriodical() ? RT.Journal : RT.Book;
  }

  // A magazine has an issue date
  isPeriodical() {
    return this.ed.issue ? true : false;
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
    if (this.ed.bylineType == "told by" && this.ed.bylineName) {
      return this.makeNameObjFromFullName(this.ed.bylineName);
    }
    return undefined;
  }

  getEventDateObj() {
    if (this.isPeriodical()) {
      const dateString = formatIssueDate(this.ed.issue);
      if (dateString) {
        return this.makeDateObjFromDateString(dateString);
      }
    }
    return undefined;
  }

  setCustomFields(gd) {
    const publicationTitle = getPublicationTitle(this.ed);
    if (this.recordType == RT.Journal) {
      if (publicationTitle) {
        gd.journalName = publicationTitle;
      }
      if (this.ed.title) {
        gd.journalArticle = this.ed.title;
      }
      if (this.ed.bylineName) {
        gd.journalAuthor = this.ed.bylineName;
      }
    } else {
      if (publicationTitle) {
        gd.bookTitle = publicationTitle;
      }
      if (this.ed.bylineName) {
        gd.bookAuthor = this.ed.bylineName;
      }
    }
  }
}

export { WolEdReader };
