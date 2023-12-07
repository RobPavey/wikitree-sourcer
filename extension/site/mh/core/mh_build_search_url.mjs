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

import { MhUriBuilder } from "./mh_uri_builder.mjs";
import { RT } from "../../../base/core/record_type.mjs";

function buildSearchUrl(buildUrlInput) {
  const gd = buildUrlInput.generalizedData;

  var builder = new MhUriBuilder();

  // call methods on builder here

  builder.addNameAndGender(gd.inferForenames(), gd.inferLastName(), gd.personGender);

  builder.addBirth(gd.inferBirthYear(), gd.inferBirthPlace());
  builder.addDeath(gd.inferDeathYear(), gd.inferDeathPlace());

  // record types where event date/place is a residence date/place
  const residenceRecordTypes = [RT.Census, RT.Residence, RT.Directory];
  if (residenceRecordTypes.includes(gd.recordType)) {
    builder.addEvent("livedin", gd.inferEventYear(), gd.inferEventPlace());
  }

  builder.endEventList();

  // add relatives
  if (gd.parents) {
    if (gd.parents.father && gd.parents.father.name) {
      let name = gd.parents.father.name;
      builder.addFather(name.inferForenames(), name.inferLastName());
    }
    if (gd.parents.mother && gd.parents.mother.name) {
      let name = gd.parents.mother.name;
      builder.addMother(name.inferForenames(), name.inferLastName());
    }
  }

  if (gd.spouses && gd.spouses.length == 1) {
    let spouse = gd.spouses[0];
    if (spouse.name) {
      builder.addSpouse(spouse.name.inferForenames(), spouse.name.inferLastName());
    }
  }

  builder.endRelativeList();

  const url = builder.getUri();

  //console.log("URL is " + url);

  var result = {
    url: url,
  };

  return result;
}

export { buildSearchUrl };
