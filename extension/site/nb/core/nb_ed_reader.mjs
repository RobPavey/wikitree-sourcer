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

import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { getNoticeType } from "./nb_notice_types.mjs";
import { readNbDate } from "./nb_dates.mjs";

// Values come only from NB bibliography or input transcribed from the current passage.
const baseRecordTypeData = {
  rules: {
    fullName: { edKeys: ["personName"] },
    eventDate: { edKeys: ["publicationDate"] },
    deathDate: { edKeys: ["confirmedDeathDate"] },
    deathPlace: { edKeys: ["confirmedDeathPlace"] },
  },
};
class NbEdReader extends ExtractedDataReader {
  constructor(ed, passage = {}) {
    super({ ...ed, ...passage });
    this.baseRecordTypeData = baseRecordTypeData;
    const type = getNoticeType(ed.materialType, passage.category);
    this.setRecordData({ recordType: type.recordType, overrideRefTitle: type.heading });
  }
  hasValidData() {
    return Boolean(this.ed.success && this.ed.title && ["newspaper", "book"].includes(this.ed.materialType));
  }
  makeDateObjFromDateString(value) {
    return readNbDate(value);
  }
  setCustomFields(gd) {
    super.setCustomFields(gd);
    if (this.ed.personName) gd.isAboutNamedPerson = true;
    if (this.ed.materialType === "newspaper") gd.newspaperName = this.ed.title;
  }
}
export { NbEdReader };
