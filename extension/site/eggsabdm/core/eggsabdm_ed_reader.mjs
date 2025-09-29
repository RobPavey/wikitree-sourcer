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

import { RT, Role } from "../../../base/core/record_type.mjs";
import { DateUtils } from "../../../base/core/date_utils.mjs";
import { ExtractedDataReader } from "../../../base/core/extracted_data_reader.mjs";
import { NameUtils } from "../../../base/core/name_utils.mjs";
import { StringUtils } from "../../../base/core/string_utils.mjs";
import { EggsaCommon } from "../../eggsagrvs/core/eggsa_common.mjs";
import * as EggsaBdmCommon from "./eggsabdm_common.mjs";

////////////////////////////////////////////////////////////////////////////////////////////////////
// Helper functions
////////////////////////////////////////////////////////////////////////////////////////////////////

function extractAllCapsAtFront(str) {
  const parts = str.split(" ");
  for (var i = 0; i < parts.length; ++i) {
    const word = parts[i];
    if (word.length == 1 || word.includes(".") || /^\(?.[.:]?\)?$/.test(word) || !StringUtils.isWordAllUpperCase(word))
      break;
  }
  const allCaps = parts.slice(0, i).join(" ");
  const rest = parts.slice(i).join(" ");
  return [allCaps, rest];
}

const separators = [" (and) ", " and ", " &amp; ", " & ", " + ", " (en) ", " en "];

function findPeopleSeparator(parents) {
  for (const sep of separators) {
    if (parents.includes(sep)) return sep;
  }
  return false;
}

function extractPeopleData(ed) {
  // Using the ed fields (see below under each case) to construct a people array of
  // (not all fields are necessary filled in):
  //  {
  //    age:
  //    baptised:
  //    birth:
  //    burial:
  //    death:
  //    firstNames:
  //    fullName:
  //    lastName:
  //    lnab:
  //    marriage:
  //    occupation:
  //    otherLastNames: []
  //    role:
  //  }
  // as well as setting these common ed fields:
  //    eventDate
  //    eventPlace
  //
  // Other common ed fields already set:
  //     "eggsaPageType": "Baptism"
  //     "success": true,
  //     "source": "Source: Nederduits Gereformeerde Gemeente (NGK), Swartland (Malmesbury),..",
  //     "url": "https://www.eggsa.org/cgi-bin/dosearchBaptisms.pl",

  const person = {};
  const people = [person];
  switch (ed.eggsaPageType) {
    case "Baptism":
      // Baptism ed fields:
      //     "baptismDateStr": "1811, den 29en September  1811",
      //     "bornDateStr": "19: Julij 1811",
      //     "father": "Jacobus Hendrik SMIT Alew:Z.",
      //     "mother": "Margaretha Willemina  LOUW",
      //     "nameStr": "Hendrik Jacobus",
      //     "parentsStr": "",
      //     "witnessStr": "Margaretha Willemina  Louw, Alewijn Johannis  Smit Jac: z.",

      // dates and place
      if (ed.baptismDateStr) {
        let [date, place] = ed.baptismDateStr.split(/,? at /);
        if (place) ed.eventPlace = place;
        person.baptism = EggsaBdmCommon.cleanDateStr(date);
        ed.eventDate = person.baptism;
      }
      if (ed.bornDateStr) {
        person.birth = EggsaBdmCommon.cleanDateStr(ed.bornDateStr);
      }

      // people
      person.role = EggsaBdmCommon.Role.CHILD;
      person.firstNames = ed.nameStr;

      if (ed.father) {
        const [fatherFirstNames, fatherLastName] = EggsaCommon.getFirstAndLastNames(ed.father);

        person.lastName = fatherLastName;
        person.lnab = fatherLastName;
        person.fullName = `${person.firstNames} ${person.lnab}`;
        people.push({
          firstNames: fatherFirstNames,
          lastName: fatherLastName,
          fullName: `${fatherFirstNames} ${fatherLastName}`,
          role: EggsaBdmCommon.Role.FATHER,
        });
      }
      if (ed.mother) {
        const [motherFirstNames, motherLastName] = EggsaCommon.getFirstAndLastNames(ed.mother);

        if (!ed.father) person.lnab = motherLastName;
        people.push({
          firstNames: motherFirstNames,
          lastName: motherLastName,
          fullName: `${motherFirstNames} ${motherLastName}`,
          role: EggsaBdmCommon.Role.MOTHER,
        });
      }

      if (!ed.father & !ed.mother && ed.parentsStr) {
        // Attempt to extract the father and mother from the parents string
        let fatherFirst = "";
        let fatherLast = "";
        let motherFirst = "";
        let motherLast = "";
        const separator = findPeopleSeparator(ed.parentsStr);
        if (separator) {
          // there seems to be mostly two people (father <sep> mother)with only one surname attached to the mother's name
          let [father, mother] = ed.parentsStr.split(separator);
          if (mother) {
            [motherFirst, motherLast] = EggsaCommon.getFirstAndLastNames(mother);
          }
          fatherFirst = father;
          fatherLast = motherLast;

          // console.log(`father: ${father}`);
          // console.log(`mother: ${mother}`);
          // console.log(`Separator: ${separator}`);
          // console.log(`fatherFirst: ${fatherFirst}, fatherLast: ${fatherLast}`);
          // console.log(`motherFirst: ${motherFirst}, motherLast: ${motherLast}`);
        } else {
          // The parents: field contain only one name (as far as we could tell - we know this is not always the case
          // because of inconsistent formatting, e.g. there are cases where the names are separated by ',', but there
          // are other cases where commas appear, not separating names, so we can't add ',' to the separator list.
          // Also, last names are not alwaya capitalised, in which case we'll just take the last word in the string as the
          // last name and possibly add any prefix we find in front of it
          [fatherFirst, fatherLast] = EggsaCommon.getFirstAndLastNames(ed.parentsStr);
        }

        if (fatherFirst != "" || fatherLast != "") {
          // We found at least one parent (note, this might be the mother if there is no father)
          if (!person.lastName) {
            person.lastName = fatherLast;
            if (fatherLast) person.fullName = `${person.firstNames} ${fatherLast}`;
          }
          people.push({
            firstNames: fatherFirst,
            lastName: fatherLast,
            fullName: `${fatherFirst} ${fatherLast}`,
            role: motherFirst != "" || motherLast != "" ? EggsaBdmCommon.Role.FATHER : EggsaBdmCommon.Role.PARENT,
          });
        }

        if (motherFirst != "" || motherLast != "") {
          // the above will never be true if there is only one parent
          people.push({
            firstNames: motherFirst,
            lastName: motherLast,
            fullName: `${motherFirst} ${motherLast}`,
            role: EggsaBdmCommon.Role.MOTHER,
          });
        }
      }
      // TODO?? add witnesses to people ????
      break;

    case "Marriage":
      // Marriage ed fields
      //     "brideStr": "Maria Glaudina Gunter Pieter Alb.dr.",
      //     "brideAgeStr": "15",
      //     "groomStr": "Barend Jacobus van der Merwe Schalkz.",
      //     "groomAgeStr": "20",
      //     "marriageDateStr": "Jany 31st",

      const groom = person;
      const [groomFirstNames, groomLastName] = EggsaCommon.getFirstAndLastNames(ed.groomStr);
      groom.firstNames = groomFirstNames;
      groom.lastName = groomLastName;
      groom.fullName = `${groomFirstNames} ${groomLastName}`;
      groom.role = EggsaBdmCommon.Role.GROOM;

      const [brideFirstNames, brideLastName] = EggsaCommon.getFirstAndLastNames(ed.brideStr);
      const bride = {
        firstNames: brideFirstNames,
        lastName: brideLastName,
        fullName: `${brideFirstNames} ${brideLastName}`,
        role: EggsaBdmCommon.Role.BRIDE,
      };
      if (brideLastName != groomLastName) {
        bride.otherLastNames = [groomLastName];
      }
      people.push(bride);
      if (ed.marriageDateStr) {
        groom.marriage = EggsaBdmCommon.cleanDateStr(ed.marriageDateStr);
        bride.marriage = groom.marriage;
        ed.eventDate = groom.marriage;
      }
      if (ed.groomAgeStr) groom.age = ed.groomAgeStr;
      if (ed.brideAgeStr) bride.age = ed.brideAgeStr;

      if (ed.occupation) groom.occupation = ed.occupation;

      break;

    case "Burial":
      // Burial ed fields
      //     "ageAtDeathStr": "68 years",
      //     "bornDateStr": "",
      //     "burialDateStr": "24 May 1968",
      //     "deathDateStr": "20 May 1968",
      //     "nameStr": "STUCKENBERG Hans T. J.",
      //     "placeOfDeath": "",
      //     "residence": "58-5th Avenue, Walmer",
      //     "witnessStr": "",

      let [lastName, firstNames] = extractAllCapsAtFront(ed.nameStr);
      if (lastName) {
        lastName = EggsaCommon.toMixedCaseWithPossiblePrefix(lastName);
      }
      if (ed.lnab) person.lnab = EggsaCommon.toMixedCaseWithPossiblePrefix(ed.lnab);
      person.firstNames = firstNames;
      person.lastName = lastName;
      person.fullName = `${firstNames} ${lastName}`;
      person.role = EggsaBdmCommon.Role.PRIMARY;
      if (ed.ageAtDeathStr) person.age = ed.ageAtDeathStr;
      if (ed.bornDateStr) person.birth = EggsaBdmCommon.cleanDateStr(ed.bornDateStr);
      if (ed.burialDateStr) person.burial = EggsaBdmCommon.cleanDateStr(ed.burialDateStr);
      if (ed.deathDateStr) person.death = EggsaBdmCommon.cleanDateStr(ed.deathDateStr);
      if (ed.placeOfDeath) ed.eventPlace = ed.placeOfDeath;

      ed.eventDate = person.burial ? person.burial : person.death;
      if (ed.occupation) person.occupation = ed.occupation;

      break;
  }
  ed.people = people;
}

const roleMap = new Map([
  [EggsaBdmCommon.Role.BRIDE, undefined],
  [EggsaBdmCommon.Role.CHILD, undefined],
  [EggsaBdmCommon.Role.FATHER, Role.Parent],
  [EggsaBdmCommon.Role.GROOM, undefined],
  [EggsaBdmCommon.Role.MOTHER, Role.Parent],
  [EggsaBdmCommon.Role.PARENT, Role.Parent],
  [EggsaBdmCommon.Role.PRIMARY, undefined],
  [EggsaBdmCommon.Role.WITNESS, Role.Witness],
]);

////////////////////////////////////////////////////////////////////////////////////////////////////
// The class
////////////////////////////////////////////////////////////////////////////////////////////////////

class EggsabdmEdReader extends ExtractedDataReader {
  constructor(ed, primaryPersonIndex = 0) {
    super(ed);
    this.primaryPersonIndex = primaryPersonIndex;
    // console.log("EggsabdmEdReader before", this.ed);

    switch (ed.eggsaPageType) {
      case "Baptism":
        this.recordType = RT.Baptism;
        break;
      case "Marriage":
        this.recordType = RT.Marriage;
        break;
      case "Burial":
        this.recordType = RT.Burial;
        break;
    }
    extractPeopleData(this.ed);

    const person = this.getSelectedPerson();
    if (person) {
      const role = roleMap.get(person.role);
      if (role) {
        this.role = role;
      }
    }

    // console.log("EggsabdmEdReader after", this.ed);

    //DateUtils.getStdShortFormDateString(DateUtils.parseDateString())
  }

  getSelectedPerson() {
    return this.ed.people[this.primaryPersonIndex];
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  // Overrides of the relevant get functions used in commonGeneralizeData
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  hasValidData() {
    if (!this.ed.success) {
      return false; //the extract failed, GeneralizedData is not even normally called in this case
    }
    const people = this.ed.people;
    if (!people || people.length == 0 || (people.length == 1 && people[0] == {})) {
      return false;
    }
    return true;
  }

  getPrimaryPersonOptions() {
    if (this.ed.people.length > 1) {
      return this.ed.people.map((p) => p.fullName);
    }
    return undefined;
  }

  getSourceType() {
    return "record";
  }

  getNameObj() {
    const person = this.getSelectedPerson();
    if (!person) return undefined;
    let nameObj;
    if (person.firstNames || person.lastNames) {
      nameObj = this.makeNameObjFromForenamesAndLastName(person.firstNames, person.lastName);
    } else {
      nameObj = this.makeNameObjFromFullName(person.fullName);
    }
    if (person.otherLastNames) {
      nameObj.otherLastNames = person.otherLastNames.join(",");
    }
    return nameObj;
  }

  getGender() {
    const person = this.getSelectedPerson();
    return NameUtils.predictGenderFromGivenNames(person.firstNames);
    // return "";
  }

  getEventDateObj() {
    if (this.ed.eventDate) return this.makeDateObjFromDateString(this.ed.eventDate);
    return undefined;
  }

  getEventPlaceObj() {
    if (this.ed.eventPlace) return this.makePlaceObjFromFullPlaceName(this.ed.eventPlace);
    return undefined;
  }

  getLastNameAtBirth() {
    return this.getSelectedPerson()?.lnab || "";
  }

  getLastNameAtDeath() {
    if (this.recordType == RT.Burial) return this.getSelectedPerson()?.lastName || "";
    return "";
  }

  getMothersMaidenName() {
    return "";
  }

  getBirthDateObj() {
    const dateString = this.getSelectedPerson()?.birth;
    if (dateString) return this.makeDateObjFromDateString(dateString);
    return undefined;
  }

  getBirthPlaceObj() {
    return undefined;
  }

  getDeathDateObj() {
    const dateString = this.getSelectedPerson()?.death;
    if (dateString) return this.makeDateObjFromDateString(dateString);
    return undefined;
  }

  getDeathPlaceObj() {
    return undefined;
  }

  getAgeAtEvent() {
    const person = this.getSelectedPerson();
    if (person?.age) return person.age;
    DateUtils.getWholeYearsBetweenDateStrings();
    if (person?.birth && person?.death) {
      return DateUtils.getWholeYearsBetweenDateStrings(person.birth, person.death);
    }
    return "";
  }

  getAgeAtDeath() {
    if (this.recordType == RT.Burial) {
      const person = this.getSelectedPerson();
      if (person?.age) return person.age;
    }
    return "";
  }

  getRelationshipToHead() {
    return "";
  }

  getOccupation() {
    const person = this.getSelectedPerson();
    if (person?.occupation) return person.occupation;
    return "";
  }

  getSpouses() {
    if (this.recordType == RT.Marriage) {
      const spouse = this.ed.people.filter(
        (p, i) =>
          i != this.primaryPersonIndex && [EggsaBdmCommon.Role.GROOM, EggsaBdmCommon.Role.BRIDE].includes(p.role)
      );
      // we assume there is only one or no spouse
      if (spouse.length) {
        const sp = spouse[0];
        return [
          this.makeSpouseObj(
            this.makeNameObjFromForenamesAndLastName(sp.firstNames, sp.lastName),
            this.getEventDateObj()
          ),
        ];
      }
    }
    return undefined;
  }

  getParents() {
    const person = this.getSelectedPerson();
    if (person?.role == EggsaBdmCommon.Role.CHILD) {
      let father, mother;
      for (const parent of this.ed.people) {
        if (parent.role == EggsaBdmCommon.Role.FATHER) {
          father = parent;
        } else if (parent.role == EggsaBdmCommon.Role.MOTHER) {
          mother = parent;
        }
      }
      if (father || mother) {
        return this.makeParentsFromForenamesAndLastNames(
          father.firstNames,
          father.lastName,
          mother.firstNames,
          mother.lastName
        );
      }
    }
    return undefined;
  }
}

export { EggsabdmEdReader };
