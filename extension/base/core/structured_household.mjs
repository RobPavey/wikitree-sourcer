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

import { RT, RecordSubtype } from "./record_type.mjs";
import { GeneralizedData, DateObj, GD } from "./generalize_data_utils.mjs";
import { Role } from "./record_type.mjs";
import { StringUtils } from "./string_utils.mjs";
import { DateUtils } from "./date_utils.mjs";
import { getChildTerm, getPrimaryPersonChildTerm } from "./narrative_or_sentence_utils.mjs";
import { RC } from "./record_collections.mjs";

class StructuredHousehold {
  constructor(gd) {
    this.gd = gd;
    if (!gd) {
      return;
    }

    this.members = gd.householdArray;
    this.fields = gd.householdArrayFields;
  }

  buildStructure() {
    if (!this.gd || !this.members) {
      return;
    }

    let household = {};
    household.members = [];
    household.head = undefined;

    let lastHead = undefined;
    let lastWifeOfHead = undefined;
    let numPeopleSinceHead = 0;
    let lastHouseholdMember = undefined;

    function addChildOfHouseholdMember(parent, child) {
      if (parent && child) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(child);
        if (parent.gender == "male") {
          child.father = parent;
        } else if (parent.gender == "female") {
          child.mother = parent;
        }
      }
    }

    function addChildOfLastHead(householdMember) {
      addChildOfHouseholdMember(lastHead, householdMember);
      if (lastHead && lastHead.wife) {
        addChildOfHouseholdMember(lastHead.wife, householdMember);
      }
    }

    function confirmGender(householdMember, gender) {
      if (!householdMember.gender) {
        householdMember.gender = gender;
      }
    }

    function setHead(householdMember) {
      lastHead = householdMember;
      householdMember.isHead = true;
      numPeopleSinceHead = 0;
      if (!household.head) {
        household.head = householdMember;
      }
    }

    let personIndex = 0;
    for (let member of this.members) {
      let householdMember = {};
      household.members.push(householdMember);
      householdMember.gdMember = member;
      householdMember.gender = member.gender;
      householdMember.personIndex = personIndex;
      if (lastHead) {
        householdMember.lastHead = lastHead;
      }

      let relMeaning = GD.getStandardizedRelationshipMeaning(member.relationship);

      if (member.isSelected) {
        household.selectedMember = householdMember;
      }

      if (relMeaning) {
        confirmGender(householdMember, relMeaning.impliedGender);
      }

      let relationship = member.relationship;
      if (relationship == "head") {
        setHead(householdMember);
      } else if (relationship == "wife") {
        confirmGender(householdMember, "female");
        if (lastHead && numPeopleSinceHead == 1) {
          lastWifeOfHead = householdMember;
          lastHead.wife = householdMember;
          householdMember.husband = lastHead;
          confirmGender(lastHead, "male");
          householdMember.relationTo = lastHead;
        } else {
          if (numPeopleSinceHead == 0) {
            // this is the first person in household
            setHead(householdMember);
          } else {
            // could be the wife of a son
            if (lastHouseholdMember.gdMember.relationship == "son") {
              lastHouseholdMember.wife = householdMember;
              householdMember.husband = lastHouseholdMember;
              householdMember.relationTo = lastHouseholdMember;
            }
          }
        }
      } else if (relationship == "husband") {
        if (numPeopleSinceHead == 0) {
          // this is the first person in household
          setHead(householdMember);
        } else {
          // could be the husband of a daughter
          if (lastHouseholdMember.gdMember.relationship == "daughter") {
            lastHouseholdMember.wife = householdMember;
            householdMember.husband = lastHouseholdMember;
            householdMember.relationTo = lastHouseholdMember;
          }
        }
      } else if (relationship == "son") {
        confirmGender(householdMember, "male");
        addChildOfLastHead(householdMember);
        householdMember.relationTo = lastHead;
      } else if (relationship == "daughter") {
        confirmGender(householdMember, "female");
        addChildOfLastHead(householdMember);
        householdMember.relationTo = lastHead;
      } else if (relationship == "child") {
        addChildOfLastHead(householdMember);
        householdMember.relationTo = lastHead;
      } else if (relationship == "father") {
        confirmGender(householdMember, "male");
        addChildOfHouseholdMember(householdMember, lastHead);
        householdMember.relationTo = lastHead;
      } else if (relationship == "mother") {
        confirmGender(householdMember, "female");
        addChildOfHouseholdMember(householdMember, lastHead);
        householdMember.relationTo = lastHead;
      } else if (relationship == "father-in-law") {
        confirmGender(householdMember, "male");
        addChildOfHouseholdMember(householdMember, lastWifeOfHead);
        householdMember.relationTo = lastHead;
      } else if (relationship == "mother-in-law") {
        confirmGender(householdMember, "female");
        addChildOfHouseholdMember(householdMember, lastWifeOfHead);
        householdMember.relationTo = lastHead;
      } else if (relationship == "wife's son") {
        confirmGender(householdMember, "male");
        addChildOfHouseholdMember(lastWifeOfHead, householdMember);
        householdMember.relationTo = lastHead;
      } else if (relationship == "wife's daughter") {
        confirmGender(householdMember, "female");
        addChildOfHouseholdMember(lastWifeOfHead, householdMember);
        householdMember.relationTo = lastHead;
      } else if (!relationship) {
        // this can mean head if it is the first person
        if (personIndex == 0) {
          setHead(householdMember);
        }
      } else {
        if (relMeaning.nonFamily) {
          // this could be a boarder with a wife and children
          // In some censuses they might all be recorded as boarders but in others
          // his wife would be recorded as "wife" or "his wife" and same for children.
          let isWife = false;
          if (numPeopleSinceHead == 1) {
            if (householdMember.gender == "female" && lastHead && lastHead.gender == "male") {
              // this could be a lodger who is the wife of the previous lodger
              if (householdMember.gdMember.maritalStatus == "married" && lastHead.gdMember.maritalStatus) {
                isWife = true;
              }
            }
          }

          if (lastHead && isWife) {
            lastWifeOfHead = householdMember;
            lastHead.wife = householdMember;
            householdMember.husband = lastHead;
            householdMember.relationTo = lastHead;
          } else {
            setHead(householdMember);
          }
        }
      }

      numPeopleSinceHead++;
      personIndex++;
      lastHouseholdMember = householdMember;
    }

    return household;
  }
}

function buildStructuredHousehold(gd) {
  let sh = new StructuredHousehold(gd);

  return sh.buildStructure();
}

function addSpouseOrParentsForSelectedHouseholdMember(gd) {
  let members = gd.householdArray;
  if (!members || members.length <= 1) {
    return;
  }

  let structuredHousehold = buildStructuredHousehold(gd);

  let member = structuredHousehold.selectedMember;
  if (!member) {
    return;
  }

  if (member.father) {
    let parent = gd.addFather();
    parent.name.setFullName(member.father.gdMember.name);
  }

  if (member.mother) {
    let parent = gd.addMother();
    parent.name.setFullName(member.mother.gdMember.name);
  }

  function addMarriageDate(spouse, eventDate, primaryMember, spouseMember) {
    let yearsMarried = NaN;
    if (primaryMember && primaryMember.yearsMarried) {
      yearsMarried = Number(primaryMember.yearsMarried);
    }
    if (isNaN(yearsMarried)) {
      if (spouseMember && spouseMember.yearsMarried) {
        yearsMarried = Number(spouseMember.yearsMarried);
      }
    }
    if (!isNaN(yearsMarried)) {
      let marriageDateString = GeneralizedData.getSubtractAgeFromDate(eventDate, yearsMarried);
      let marriageYear = StringUtils.getLastWord(marriageDateString);
      if (marriageYear) {
        spouse.marriageDate.yearString = marriageYear;
      }
    }
  }

  if (member.wife) {
    let spouse = gd.addSpouse();
    spouse.name.setFullName(member.wife.gdMember.name);
    addMarriageDate(spouse, gd.inferEventDate(), member.gdMember, member.wife.gdMember);
  } else if (member.husband) {
    let spouse = gd.addSpouse();
    spouse.name.setFullName(member.husband.gdMember.name);
    addMarriageDate(spouse, gd.inferEventDate(), member.gdMember, member.husband.gdMember);
  }
}

export { StructuredHousehold, buildStructuredHousehold, addSpouseOrParentsForSelectedHouseholdMember };
