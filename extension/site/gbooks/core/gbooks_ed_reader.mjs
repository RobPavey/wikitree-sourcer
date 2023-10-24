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

class GbooksEdReader extends ExtractedDataReader {
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

    return true;
  }

  getSourceType() {
    return "record";
  }

  getEventDateObj() {
    if (this.ed.date) {
      return this.makeDateObjFromDateString(this.ed.date);
    }
  }

  setCustomFields(gd) {
    if (this.ed.title) {
      gd.bookTitle = this.ed.title;
    } else if (this.ed.headTitle) {
      gd.bookTitle = this.ed.headTitle;
    }

    if (this.ed.subtitle) {
      gd.bookSubtitle = this.ed.subtitle;
    }

    if (this.ed.author) {
      gd.bookAuthor = this.ed.author;
    } else if (this.ed.aboutThisEdition && this.ed.aboutThisEdition["Author"]) {
      gd.bookAuthor = this.ed.aboutThisEdition["Author"];
    }
  }

  getCollectionData() {
    return undefined;
  }
}

export { GbooksEdReader };
