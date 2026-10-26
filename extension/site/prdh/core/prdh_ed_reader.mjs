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

// Surnames are in capitals on PRDH: "Marie Louise FORTIER"
function splitName(fullName) {
  let tokens = fullName.trim().split(/\s+/);
  let index = tokens.length;
  while (index > 0 && tokens[index - 1] == tokens[index - 1].toUpperCase() && /[A-ZÀ-Ý]/.test(tokens[index - 1])) {
    index--;
  }
  if (index == tokens.length) {
    // no capitalized surname, assume that the last word is the last name
    index = tokens.length - 1;
  }
  return {
    forenames: tokens.slice(0, index).join(" "),
    lastName: StringUtils.toInitialCapsEachWord(tokens.slice(index).join(" "), true),
  };
}

const fatherRelations = ["FATHER", "PÈRE", "PERE"];
const motherRelations = ["MOTHER", "MÈRE", "MERE"];
const spouseRelations = ["SPOUSE", "CONJOINT", "CONJOINTE", "ÉPOUX", "EPOUX", "ÉPOUSE", "EPOUSE"];

class PrdhEdReader extends ExtractedDataReader {
  constructor(ed) {
    super(ed);

    this.pageType = ed.pageType;
    if (this.pageType == "baptism") {
      this.recordType = RT.Baptism;
    } else if (this.pageType == "burial") {
      this.recordType = RT.Burial;
    } else if (this.pageType == "marriage") {
      this.recordType = RT.Marriage;
    } else if (this.pageType == "family") {
      this.recordType = RT.Marriage;
    } else if (this.pageType == "individual") {
      this.recordType = RT.FamilyTree;
    }

    this.isRecord = this.recordType == RT.Baptism || this.recordType == RT.Burial || this.recordType == RT.Marriage;
    this.isRecord = this.isRecord && this.pageType != "family";

    if (this.isRecord && ed.mentions) {
      this.primaryMention = ed.mentions[0];
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helpers
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  makeNameObjFromPrdhName(fullName) {
    if (!fullName) {
      return undefined;
    }
    let parts = splitName(fullName);
    if (!parts.forenames) {
      return this.makeNameObjFromLastName(parts.lastName);
    }
    return this.makeNameObjFromForenamesAndLastName(parts.forenames, parts.lastName);
  }

  makeNameObjFromPrdhParts(forenames, lastName) {
    if (!forenames && !lastName) {
      return undefined;
    }
    return this.makeNameObjFromForenamesAndLastName(
      forenames,
      StringUtils.toInitialCapsEachWord(lastName, true)
    );
  }

  // "Lauzon (St-Joseph-de-la-Pointe-Lévy)" is a place and the parish in that place
  makePlaceFromParish(parish) {
    if (!parish) {
      return undefined;
    }
    return this.makePlaceObjFromFullPlaceName(parish);
  }

  // e.g. "Baptism : 20-Dec-1790 Lauzon (St-Joseph-de-la-Pointe-Lévy)"
  splitDateAndPlace(labelledString) {
    if (!labelledString) {
      return {};
    }
    let match = labelledString.match(/(\d{1,2}-[A-Za-z]{3}-\d{4})\s*(.*)$/);
    if (!match) {
      return {};
    }
    return { date: match[1], place: match[2].trim() };
  }

  findMentionByRank(rank) {
    if (!this.ed.mentions) {
      return undefined;
    }
    return this.ed.mentions.find((mention) => mention.rank == rank);
  }

  // Finds the mentions that have a relation of one of the types to the given mention
  findRelatedMentions(mention, relationTypes) {
    let results = [];
    if (!mention || !this.ed.mentions) {
      return results;
    }
    for (let other of this.ed.mentions) {
      if (other.relations) {
        for (let relation of other.relations) {
          if (relationTypes.includes(relation.type.toUpperCase()) && relation.rank == mention.rank) {
            results.push(other);
          }
        }
      }
    }
    return results;
  }

  findSpouseMention(mention) {
    let spouses = this.findRelatedMentions(mention, spouseRelations);
    if (spouses.length > 0) {
      return spouses[0];
    }
    if (mention && mention.relations) {
      for (let relation of mention.relations) {
        if (spouseRelations.includes(relation.type.toUpperCase())) {
          return this.findMentionByRank(relation.rank);
        }
      }
    }
    return undefined;
  }

  getMentionGender(mention) {
    if (mention && mention.sex) {
      let letter = mention.sex.trim()[0].toLowerCase();
      if (letter == "m") {
        return "male";
      } else if (letter == "f") {
        return "female";
      }
    }
    return "";
  }

  getMentionAge(mention) {
    if (mention && /^\d+$/.test(mention.age)) {
      return mention.age.replace(/^0+(?=\d)/, "");
    }
    return "";
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  getNameObj() {
    if (this.isRecord) {
      return this.primaryMention ? this.makeNameObjFromPrdhName(this.primaryMention.name) : undefined;
    } else if (this.pageType == "individual") {
      return this.makeNameObjFromPrdhParts(this.ed.forenames, this.ed.lastName);
    } else if (this.pageType == "family") {
      return this.makeNameObjFromPrdhName(this.ed.husband);
    }
    return undefined;
  }

  getGender() {
    if (this.isRecord) {
      return this.getMentionGender(this.primaryMention);
    } else if (this.pageType == "family") {
      return "male";
    }
    return "";
  }

  getEventDateObj() {
    if (this.isRecord) {
      return this.makeDateObjFromDateString(this.ed.eventDate);
    } else if (this.pageType == "family") {
      return this.makeDateObjFromDateString(this.ed.marriageDate);
    }
    return undefined;
  }

  getEventPlaceObj() {
    if (this.isRecord) {
      return this.makePlaceFromParish(this.ed.parish);
    } else if (this.pageType == "family") {
      return this.makePlaceFromParish(this.ed.marriagePlace);
    }
    return undefined;
  }

  getBirthDateObj() {
    if (this.recordType == RT.Baptism && /birth|naissance/i.test(this.ed.birthOrDeathLabel)) {
      return this.makeDateObjFromDateString(this.ed.birthOrDeathDate);
    } else if (this.pageType == "individual") {
      return this.makeDateObjFromDateString(this.ed.birthDate);
    }
    return undefined;
  }

  getBirthPlaceObj() {
    if (this.pageType == "individual" && this.ed.birthPlace) {
      return this.makePlaceObjFromFullPlaceName(this.ed.birthPlace);
    }
    return undefined;
  }

  getDeathDateObj() {
    if (this.recordType == RT.Burial && /death|d[ée]c[èe]s/i.test(this.ed.birthOrDeathLabel)) {
      return this.makeDateObjFromDateString(this.ed.birthOrDeathDate);
    } else if (this.pageType == "individual") {
      return this.makeDateObjFromDateString(this.ed.deathDate || this.splitDateAndPlace(this.ed.death).date);
    }
    return undefined;
  }

  getDeathPlaceObj() {
    if (this.pageType == "individual" && this.ed.deathPlace) {
      return this.makePlaceObjFromFullPlaceName(this.ed.deathPlace);
    }
    return undefined;
  }

  getAgeAtDeath() {
    if (this.recordType == RT.Burial) {
      return this.getMentionAge(this.primaryMention);
    }
    return "";
  }

  getAgeAtEvent() {
    if (this.recordType == RT.Marriage) {
      return this.getMentionAge(this.primaryMention);
    }
    return "";
  }

  getMaritalStatus() {
    if (this.recordType == RT.Burial || this.recordType == RT.Marriage) {
      let status = this.primaryMention ? this.primaryMention.maritalStatus.trim().toLowerCase() : "";
      if (status == "m") {
        return "married";
      } else if (status == "c") {
        return "single";
      } else if (status == "v") {
        return "widowed";
      }
    }
    return "";
  }

  getSpouses() {
    if (this.isRecord) {
      let spouseMention = this.findSpouseMention(this.primaryMention);
      if (!spouseMention) {
        return undefined;
      }
      let spouseNameObj = this.makeNameObjFromPrdhName(spouseMention.name);
      if (this.recordType == RT.Marriage) {
        let spouse = this.makeSpouseObj(
          spouseNameObj,
          this.getEventDateObj(),
          this.getEventPlaceObj(),
          this.getMentionAge(spouseMention)
        );
        spouse.personGender = this.getMentionGender(spouseMention);
        let spouseFather = this.findRelatedMentions(spouseMention, fatherRelations)[0];
        let spouseMother = this.findRelatedMentions(spouseMention, motherRelations)[0];
        spouse.parents = this.makeParentsFromNameObjs(
          spouseFather ? this.makeNameObjFromPrdhName(spouseFather.name) : undefined,
          spouseMother ? this.makeNameObjFromPrdhName(spouseMother.name) : undefined
        );
        return [spouse];
      }
      return [this.makeSpouseObj(spouseNameObj)];
    } else if (this.pageType == "individual") {
      if (!this.ed.unions) {
        return undefined;
      }
      let spouses = [];
      for (let union of this.ed.unions) {
        let spouse = this.makeSpouseObj(
          this.makeNameObjFromPrdhParts(union.spouseForenames, union.spouseLastName),
          this.makeDateObjFromDateString(union.marriageDate),
          this.makePlaceFromParish(union.marriagePlace)
        );
        if (spouse) {
          spouses.push(spouse);
        }
      }
      return spouses.length > 0 ? spouses : undefined;
    } else if (this.pageType == "family") {
      let spouseNameObj = this.makeNameObjFromPrdhName(this.ed.wife);
      return [this.makeSpouseObj(spouseNameObj, this.getEventDateObj(), this.getEventPlaceObj())];
    }
    return undefined;
  }

  getParents() {
    if (this.isRecord) {
      let father = this.findRelatedMentions(this.primaryMention, fatherRelations)[0];
      let mother = this.findRelatedMentions(this.primaryMention, motherRelations)[0];
      return this.makeParentsFromNameObjs(
        father ? this.makeNameObjFromPrdhName(father.name) : undefined,
        mother ? this.makeNameObjFromPrdhName(mother.name) : undefined
      );
    } else if (this.pageType == "individual") {
      return this.makeParentsFromNameObjs(
        this.makeNameObjFromPrdhParts(this.ed.fatherForenames, this.ed.fatherLastName),
        this.makeNameObjFromPrdhParts(this.ed.motherForenames, this.ed.motherLastName)
      );
    } else if (this.pageType == "family") {
      // e.g. "Father : Joseph DUCLOS Mother : Louise FORTIER Family"
      let match = this.ed.husbandParents.match(/Father\s*:\s*(.*?)\s*Mother\s*:\s*(.*?)\s*(?:Family)?$/);
      if (match) {
        return this.makeParentsFromNameObjs(
          this.makeNameObjFromPrdhName(match[1]),
          this.makeNameObjFromPrdhName(match[2])
        );
      }
    }
    return undefined;
  }
}

export { PrdhEdReader };
