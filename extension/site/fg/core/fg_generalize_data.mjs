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

import { GeneralizedData, dateQualifiers } from "../../../base/core/generalize_data_utils.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function generalizeData(input) {

  let data = input.extractedData;

  let result = new GeneralizedData;

  result.sourceOfData = "fg";

  if (!data.success) {
    return result; //the extract failed
  }

  result.sourceType = "record";

  // If no burial location perhaps it should be a death?
  result.recordType = RT.Memorial;

  result.setEventDate(data.deathDate);
  result.setEventPlace(data.cemeteryFullAddress);

  if (result.eventPlace) {
    result.eventPlace.streetAddress = data.cemeteryName;
  }

  result.setFullName(data.name);

  result.lastNameAtDeath = result.inferLastName();
  result.deathDate = result.eventDate;

  if (data.ageAtDeath) {
    result.ageAtDeath = data.ageAtDeath;
  }
  
  result.setBirthDate(data.birthDate);
  result.setBirthPlace(data.birthPlace);

  // should we use a collection to allow search for same record on Ancestry?

  result.hasValidData = true;

  return result;
}

export { generalizeData, GeneralizedData, dateQualifiers };
