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
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";

class ItcadggEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);
    //Debugging to check ed variable
    //console.log("DEBUG: ItcadggEdReader received ed =", ed);
    //console.log("DEBUG: edData=", JSON.stringify(ed, null, 2))
    this.recordType = RT.Death;
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

  getParents() {
    if (!this.ed.extracted_data.name) return undefined;

    const fullName = this.ed.extracted_data.name.trim();
    //console.log("DEBUG: fullName =", fullName);
    // Step 1: Extract father/patronymic if present at the end (last DI ...)
    let fatherName;
    let parents = {};
    let namePart = fullName;

    // Match the last " DI " with something after it
    const lastDiIndex = fullName.toUpperCase().lastIndexOf(" DI ");
    if (lastDiIndex !== -1) {
      fatherName = StringUtils.toInitialCapsEachWord(fullName.slice(lastDiIndex + 4).trim());
      namePart = fullName.slice(0, lastDiIndex).trim();
    }
    //console.log("DEBUG: fatherName =", fatherName);
    //console.log("DEBUG: namePart after removing father =", namePart);
    let fatherNameObj = undefined;
    fatherNameObj = this.makeNameObjFromForenamesAndLastName(fatherName, "");
    parents.father = { name: fatherNameObj };
    //console.log("DEBUG: parents =", parents);

    return parents;
  }

  getNameObj() {
    if (!this.ed.extracted_data.name) return undefined;

    const fullName = this.ed.extracted_data.name.trim();
    //console.log("DEBUG: fullName =", fullName);
    // Step 1: Extract father at the end (last DI ...)
    let fatherName;
    let namePart = fullName;

    // Match the last " DI " with something after it
    const lastDiIndex = fullName.toUpperCase().lastIndexOf(" DI ");
    if (lastDiIndex !== -1) {
      fatherName = StringUtils.toInitialCapsEachWord(fullName.slice(lastDiIndex + 4).trim());
      namePart = fullName.slice(0, lastDiIndex).trim();
    }
    //console.log("DEBUG: fatherName =", fatherName);
    //console.log("DEBUG: namePart after removing father =", namePart);

    // Step 2: Split remaining name into words
    const parts = namePart.split(" ");

    // Step 3: Determine last name, considering Italian surname particles
    const lastNameParticles = ["DI", "DE", "D’", "DEL", "DELLA", "LO"];
    let lastName = parts[0]; // first word = start of last name
    let firstNamesStartIndex = 1;

    // If the first word is a particle, include the next word
    if (lastNameParticles.includes(parts[0].toUpperCase()) && parts.length > 1) {
      lastName += " " + parts[1];
      firstNamesStartIndex = 2;
    }

    // Remaining words = first names
    const firstNames = parts.slice(firstNamesStartIndex).join(" ");
    //console.log("DEBUG: lastName =", lastName);
    //console.log("DEBUG: firstNames =", firstNames);
    // Step 4: Build name object
    const nameObj = this.makeNameObjFromForenamesAndLastName(
      StringUtils.toInitialCapsEachWord(firstNames),
      StringUtils.toInitialCapsEachWord(lastName)
    );

    return nameObj;
  }

  getGender() {
    // The dataset is for fallen soldiers — overwhelmingly male
    return "male";
  }

  getEventDateObj() {
    // The "event" here can be considered the date of death
    let date = this.ed.extracted_data.death_date;
    return this.makeDateObjFromDateString(date);
  }

  getEventPlaceObj() {
    // The event place corresponds to the place of death
    return this.getDeathPlaceObj(this.ed.extracted_data.death_place);
  }

  getBirthDateObj() {
    let date = this.ed.extracted_data.birth_date;
    return this.makeDateObjFromDateString(date);
  }

  getBirthPlaceObj() {
    const birthFullPlace = [
      this.ed.extracted_data.birth_place,
      this.ed.extracted_data.birth_province,
      this.ed.extracted_data.birth_region,
    ]
      .filter(Boolean)
      .join(", ");
    return this.makePlaceObjFromFullPlaceName(birthFullPlace);
  }

  getDeathDateObj() {
    let date = this.ed.extracted_data.death_date;
    return this.makeDateObjFromDateString(date);
  }

  getDeathPlaceObj() {
    // Only "Luogo Morte" is given, no province/region available
    return this.makePlaceObjFromFullPlaceName(this.ed.extracted_data.death_place);
  }

  getCollectionData() {
    // Provide context for citation
    let id = "Death";
    let collectionData = { id: id };
    collectionData.collectionID = "itcadgg";
    collectionData.title = "Albo dei Caduti Italiani della Grande Guerra";
    collectionData.url = this.ed.image_link ? this.ed.image_link : this.ed.url;

    //return {
    //  collectionID: "itcadgg",
    //  title: "Albo dei Caduti Italiani della Grande Guerra",
    //  url: this.ed.image_link ? this.ed.image_link : this.ed.url,
    //  recordType: RT.Military,
    //  id: "Deaths"
    //};
    return collectionData;
  }
}

export { ItcadggEdReader };
