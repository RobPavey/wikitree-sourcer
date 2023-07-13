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

import { RT } from "./record_type.mjs";

// This is the base class for the EdReader for each site (that uses this pattern)
// The main reason for the base class is so that if the derived class doesn't define one of these functions
// there will not be an error, since the common code in commonGeneralizeData calls many of these functions
class ExtractedDataReader {
  constructor(ed) {
    this.ed = ed;

    this.recordType = RT.Unclassified;
  }

  getEventDateObj() {
    return undefined;
  }

  getBirthDateObj() {
    return undefined;
  }

  getDeathDateObj() {
    return undefined;
  }

  getEventPlaceObj() {
    return undefined;
  }

  getNameObj() {
    return undefined;
  }

  getLastNameAtBirth() {
    return "";
  }

  getLastNameAtDeath() {
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getAgeAtEvent() {
    return "";
  }

  getAgeAtDeath() {
    return "";
  }

  getGender() {
    return "";
  }

  getSpouseObj(eventDateObj, eventPlaceObj) {
    return undefined;
  }

  getParents() {
    return undefined;
  }

  getSearchDatabaseUrl() {
    return "";
  }
}

export { ExtractedDataReader };
