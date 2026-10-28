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
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";

// The six counties of Northern Ireland. RIP.ie covers all 32 counties of the island of Ireland.
const northernIrelandCounties = ["Antrim", "Armagh", "Derry", "Down", "Fermanagh", "Tyrone"];

// Split "Elizabeth (Betty)" or "Patrick John, (Pa John)" into the main part and the nicknames.
function separateNicknames(text) {
  let result = { main: text ? text : "", nicknames: "" };
  if (!text) {
    return result;
  }

  let nicknameList = [];
  let main = text.replace(/\(([^)]*)\)/g, function (match, inner) {
    let nickname = inner.trim();
    // some notices put the maiden name in the brackets, e.g. "ANN (née MOORE)". That is not a nickname.
    if (/^n[ée]e\b/i.test(nickname)) {
      return " ";
    }
    nickname = nickname.replace(/^(also\s+)?(better\s+)?known\s+as\s+/i, "");
    if (nickname) {
      nicknameList.push(nickname);
    }
    return " ";
  });

  // "Patrick John, (Pa John) Smith" leaves a stray comma behind
  main = main
    .replace(/\s*,\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  result.main = main;
  result.nicknames = nicknameList.join(" ");
  return result;
}

function fixCase(name) {
  // some notices have the surname in capitals, e.g. "COSGRAVE" or "O'MAHONY"
  if (name && StringUtils.isAllUppercase(name)) {
    return NameUtils.convertNameFromAllCapsToMixedCase(name);
  }
  return name;
}

class RipieEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    // A RIP.ie page is a death notice. Obituary is the closest record type: its narrative can say
    // "was in an obituary on <publication date>" and also "died on <date of death>".
    this.recordType = RT.Obituary;
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
    let ed = this.ed;
    let nameObj = undefined;
    let nicknames = "";

    if (ed.surname) {
      // JSON data: the forenames and surname are separate fields
      let forenames = separateNicknames(ed.firstname);
      nicknames = forenames.nicknames;
      nameObj = this.makeNameObjFromForenamesAndLastName(forenames.main, fixCase(ed.surname));
    } else if (ed.fullNameText) {
      // DOM data: only a combined name is available, so the surname has to be inferred
      let fullName = separateNicknames(ed.fullNameText);
      nicknames = fullName.nicknames;
      // fix the case word by word, since the name is usually mixed case with just the surname in capitals
      let fixedName = fullName.main.split(" ").map(fixCase).join(" ");
      nameObj = this.makeNameObjFromFullName(fixedName);
    }

    if (nameObj && nicknames) {
      nameObj.nicknames = nicknames;
    }
    return nameObj;
  }

  getGender() {
    return "";
  }

  getEventDateObj() {
    // For an obituary the event date is the date the notice was published
    return this.makeDateObjFromYyyymmddDate(this.ed.datePublished);
  }

  getEventPlaceObj() {
    return undefined;
  }

  getLastNameAtBirth() {
    if (this.ed.nee) {
      return fixCase(this.ed.nee);
    }
    return "";
  }

  getLastNameAtDeath() {
    // only meaningful when there is a maiden name, otherwise the surname is the same at birth and death
    if (this.ed.nee && this.ed.surname) {
      return fixCase(this.ed.surname);
    }
    return "";
  }

  getDeathDateObj() {
    return this.makeDateObjFromYyyymmddDate(this.ed.dateOfDeath);
  }

  getDeathPlaceObj() {
    // The town and county on a notice are where the person lived, not necessarily where they died
    // (e.g. "died in Esker Lodge Nursing Home, Cavan" for someone from Scotshouse, Monaghan).
    return undefined;
  }

  setCustomFields(gd) {
    let ed = this.ed;
    if (ed.town || ed.county) {
      let country = northernIrelandCounties.includes(ed.county) ? "Northern Ireland" : "Ireland";
      let placeParts = [];
      if (ed.town) {
        placeParts.push(ed.town);
      }
      if (ed.county) {
        placeParts.push(ed.county);
      }
      placeParts.push(country);
      gd.setResidencePlace(placeParts.join(", "));
    }
  }
}

export { RipieEdReader };
