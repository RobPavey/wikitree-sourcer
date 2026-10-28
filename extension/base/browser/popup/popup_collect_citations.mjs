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

import {
  addMenuItem,
  closePopup,
  addBackMenuItem,
  addMessageMenuItem,
  addButtonMenuItem,
  beginMainMenu,
  endMainMenu,
  addBreak,
} from "./popup_menu_building.mjs";
import { savePersonData } from "./popup_person_data.mjs";
import { options } from "../options/options_loader.mjs";
import { addSearchMenus } from "./popup_search.mjs";

import { getSites } from "../common/site_registry_storage.mjs";
import {
  startNewCollectedCitations,
  getCollectedCitations,
  getPreviousCollectedCitations,
  stopCollectingCitations,
  restoreCollectedCitations,
  removeLastCitationFromCollectedCitations,
} from "../common/collected_citations.mjs";

import { dateQualifiers, GeneralizedData, NameObj } from "../../core/generalize_data_utils.mjs";
import { DateUtils } from "../../core/date_utils.mjs";
import { RT, Role } from "../../core/record_type.mjs";
import { RC } from "../../core/record_collections.mjs";
import { groupSourcesIntoFacts } from "../../core/group_sources_into_facts.mjs";
import { buildNarrative } from "../../core/narrative_builder.mjs";

function inferBestEventDateForCompare(gd) {
  let eventDate = "";
  if (gd) {
    eventDate = gd.inferEventDate();

    if (gd.recordType == RT.Census) {
      let collection = undefined;
      if (gd.collectionData && gd.collectionData.id) {
        collection = RC.findCollection(gd.sourceOfData, gd.collectionData.id);
      }

      if (collection && collection.dates && collection.dates.exactDate) {
        eventDate = collection.dates.exactDate;
      }
    }
    if (gd.eventDate && gd.eventDate.quarter) {
      // for comparison we should use the last day of the quarter because
      // a birth date for a birth reg (for example) is guaranteed to be before the last
      // day of the quarter but could be before OR after the first day of the quarter
      let quarter = gd.eventDate.quarter;
      if (quarter >= 1 && quarter <= 4) {
        const endDays = ["31 Mar", "30 Jun", "30 Sep", "31 Dec"];
        let dayMonth = endDays[quarter - 1];
        let year = gd.eventDate.getYearString();
        if (dayMonth && year) {
          eventDate = dayMonth + " " + year;
        }
      }
    }

    if (!eventDate) {
      if (gd.recordType == RT.Burial) {
        // The burial date will be after the death date, we are not currently considering
        // date qualifiers in sorting though
        if (!gd.role || gd.role == Role.Primary) {
          let deathDate = gd.inferDeathDate();
          if (deathDate) {
            eventDate = deathDate;
          }
        } else {
          if (gd.inferPrimaryPersonDeathDate()) {
            let deathDate = gd.inferPrimaryPersonDeathDate();
            if (deathDate) {
              eventDate = deathDate;
            }
          }
        }
      } else if (gd.recordType == RT.Birth) {
        if (!gd.role || gd.role == Role.Primary) {
          let birthDate = gd.inferBirthDate();
          if (birthDate) {
            eventDate = birthDate;
          }
        }
      } else {
        // sometimes an event date can be inferred from a related person
        eventDate = gd.inferEventDate(true);
      }
    }
  }

  return eventDate;
}

// this can be used both for sorting sources and facts
function compareGds(gdA, gdB) {
  let recordTypeSortPriority = {
    [RT.Birth]: 1,
    [RT.BirthOrBaptism]: 2,
    [RT.Baptism]: 3,

    [RT.Census]: 50,

    [RT.Death]: 90,
    [RT.DeathOrBurial]: 91,
    [RT.Burial]: 92,
    [RT.Memorial]: 93,
    [RT.Will]: 95,
    [RT.Probate]: 96,
  };

  function getEventPriority(generalizedData) {
    let priority = 50;
    if (generalizedData) {
      let rtPriority = recordTypeSortPriority[generalizedData.recordType];
      if (rtPriority) {
        priority = rtPriority;
      }
    }
    return priority;
  }

  let eventDateA = "";
  if (gdA) {
    eventDateA = inferBestEventDateForCompare(gdA);
  }
  let eventDateB = "";
  if (gdB) {
    eventDateB = inferBestEventDateForCompare(gdB);
  }

  if (eventDateA && eventDateB) {
    let result = DateUtils.compareDateStrings(eventDateA, eventDateB);
    let datesAreSame = DateUtils.areDateStringsEquivalent(eventDateA, eventDateB);
    if (datesAreSame) {
      // dates are equal, sort by record type
      let priorityA = getEventPriority(gdA);
      let priorityB = getEventPriority(gdB);
      if (priorityA != priorityB) {
        // if they are the same priority we keep the order from compareDateStrings
        result = priorityA - priorityB;
      }
    }
    if (result != 0) {
      return result;
    }
  }

  // if one has a date and the other doesn't then the one with the date comes first
  if (eventDateA) {
    return -1;
  } else if (eventDateB) {
    return 1;
  }

  return 0;
}

function sortCitationObjects(citations) {
  function compareFunction(a, b) {
    return compareGds(a.generalizedData, b.generalizedData);
  }

  // sort the citations
  citations.sort(compareFunction);
}

function getTitleForHoverText(sites, citationObj, gd) {
  let title = "";
  if (citationObj.sourceNameWithinRepository) {
    title = citationObj.sourceNameWithinRepository;
  } else if (citationObj.sourceTitle) {
    title = citationObj.sourceTitle;
  }

  let siteName = gd.sourceOfData;
  if (siteName) {
    let site = sites[siteName];
    if (site && site.repositoryName) {
      siteName = site.repositoryName;
    }
  }

  if (siteName) {
    if (title) {
      title += "\n";
    }

    title += siteName;
  }

  let dateString = gd.inferEventDate();
  if (dateString) {
    if (title) {
      title += "\n";
    }

    title += dateString;
  }

  return title;
}

function getAllCitationsFunction(data) {
  let citationObjs = data.citations;
  let gd = data.generalizedData;

  // each citation object already has a type
  // for now treat them all as narrative/inline but eventually we will want to separate source
  // ones out

  // separate the source citations from the inline or narratives ones.
  let inlineCitationObjs = [];
  let sourceCitationObjs = [];
  for (let citationObj of citationObjs) {
    if (citationObj.type == "source") {
      sourceCitationObjs.push(citationObj);
    } else {
      inlineCitationObjs.push(citationObj);
    }
  }

  // The citations are already sorted by event date

  let groupingData = { sources: inlineCitationObjs };
  groupSourcesIntoFacts(groupingData, "narrative", options);

  let citationsString = "";
  for (let fact of groupingData.facts) {
    if (fact.sources.length > 1) {
      // may need to regenerate narrative from the combined generalizedObject.
      // see if any of the sources are type narrative.
      let combinedRefs = "";
      let needsNarrative = false;
      for (let source of fact.sources) {
        let refIndex = source.citation.indexOf("<ref>");
        if (refIndex != -1) {
          combinedRefs += source.citation.substring(refIndex);
        }
        if (source.type == "narrative") {
          needsNarrative = true;
        }
      }
      let citationString = combinedRefs;
      if (needsNarrative) {
        let input = {
          eventGeneralizedData: fact.generalizedData,
          options: options,
        };
        let narrative = buildNarrative(input);
        citationString = narrative + combinedRefs;
      }
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += citationString;
      citationsString += "\n";
    } else {
      if (citationsString) {
        citationsString += "\n";
      }
      citationsString += fact.sources[0].citation;
      citationsString += "\n";
    }
  }

  let separateSourceCitationsString = "";

  for (let citationObj of sourceCitationObjs) {
    if (separateSourceCitationsString) {
      separateSourceCitationsString += "\n";
    }
    separateSourceCitationsString += citationObj.citation;
    separateSourceCitationsString += "\n";
  }

  // If there is a marriage citation then we should add the details to the personGD in
  // case we are adding a spouse

  data.allCitationsCount = inlineCitationObjs.length;
  data.allCitationsString = citationsString;
  data.allSeparateSourceCitationsString = separateSourceCitationsString;
  data.allCitationsType = "narrative";

  return { success: true };
}

function buildPersonDataFromFields(data, fields) {
  const savePersonGd = data.savePersonGd;
  // put the selected field options in the gd
  if (fields.lnab.options.length) {
    let bestOption = fields.lnab.options[fields.lnab.selectedValue];
    savePersonGd.lastNameAtBirth = bestOption.text;
  }
  if (fields.cln.options.length) {
    let bestOption = fields.cln.options[fields.cln.selectedValue];
    savePersonGd.lastNameAtDeath = bestOption.text;
  }
  if (fields.forenames.options.length) {
    let bestOption = fields.forenames.options[fields.forenames.selectedValue];
    let nameObj = new NameObj();
    nameObj.setForenames(bestOption.text);
    if (savePersonGd.lastNameAtBirth) {
      nameObj.setLastName(savePersonGd.lastNameAtBirth);
    } else if (savePersonGd.lastNameAtDeath) {
      nameObj.setLastName(savePersonGd.lastNameAtDeath);
    }
    savePersonGd.name = nameObj;
  }

  if (fields.birthDate.options.length) {
    let bestOption = fields.birthDate.options[fields.birthDate.selectedValue];
    savePersonGd.birthDate = bestOption.valueObj;
  }

  if (fields.birthLocation.options.length) {
    let bestOption = fields.birthLocation.options[fields.birthLocation.selectedValue];
    savePersonGd.setBirthPlace(bestOption.text);
  }

  if (fields.deathDate.options.length) {
    let bestOption = fields.deathDate.options[fields.deathDate.selectedValue];
    savePersonGd.deathDate = bestOption.valueObj;
  }

  if (fields.deathLocation.options.length) {
    let bestOption = fields.deathLocation.options[fields.deathLocation.selectedValue];
    savePersonGd.setDeathPlace(bestOption.text);
  }

  if (fields.sex.options.length) {
    let bestOption = fields.sex.options[fields.sex.selectedValue];
    savePersonGd.setPersonGender(bestOption.text);
  }

  // add any marriages to the save person data to help fill the marriage details
  for (let citation of data.citations) {
    if (citation.generalizedData && citation.generalizedData.spouses) {
      let spouses = citation.generalizedData.spouses;
      if (!savePersonGd.spouses) {
        savePersonGd.spouses = spouses;
      } else {
        for (let spouse of spouses) {
          // it doesn't really matter if we add duplicates, when we fill the fields we just look
          // for a marriage where the name matches the name of the person we are adding a spouse to.
          // Ideally, we would pick the citation with the most accurate marriage date and place.
          let isDuplicate = false;
          for (let existingSpouse of savePersonGd.spouses) {
            if (existingSpouse.name && spouse.name && spouse.name.name == existingSpouse.name.name) {
              isDuplicate = true;
              break;
            }
          }
          if (!isDuplicate) {
            savePersonGd.spouses.push(spouse);
          }
        }
      }
    }
  }

  // Create the personData object that savePersonData expects
  const personData = {
    extractedData: {},
    generalizedData: savePersonGd,
    citations: data.citations,
  };

  return personData;
}

async function saveCollectedCitationsPersonData(data, fields) {
  // Create the personData object that savePersonData expects
  const personData = buildPersonDataFromFields(data, fields);

  await stopCollectingCitations();

  savePersonData(personData, getAllCitationsFunction);
}

async function setupSelectValuesSubmenu(backFunction, addActionFunction) {
  let backToHereFunction = function () {
    setupSelectValuesSubmenu(backFunction, addActionFunction);
  };

  let sites = await getSites();
  if (!sites) {
    console.log("setupSavePersonDataFromCollectedCitationsSubmenu: no siteData found");
  }

  let menu = beginMainMenu();

  addBackMenuItem(menu, function () {
    backFunction();
  });

  let collectedCitations = await getCollectedCitations();
  if (collectedCitations && collectedCitations.citations) {
    let numCitations = collectedCitations.citations.length;
    // Note if there is only one citation there is really no point giving the option to select values
    // to use for Save Person Data - though if we have an option for "none" in search it makes sense.
    let verb = numCitations == 1 ? "is" : "are";
    let plural = numCitations == 1 ? "" : "s";
    let message = `There ${verb} ${numCitations} collected citation${plural}, select values to use`;
    addMessageMenuItem(menu, message);

    function addSelectField(field) {
      let selector = document.createElement("select");
      selector.id = field.id;
      selector.className = "dialogSelector";

      for (const option of field.options) {
        let optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.text = option.text;
        optionElement.title = option.title;
        selector.appendChild(optionElement);
      }

      if (field.defaultValue) {
        selector.value = field.defaultValue;
      }

      selector.addEventListener("change", function (event) {
        let option = field.options[event.target.value];
        if (option) {
          field.selectedValue = option.value;
        }
      });

      let label = document.createElement("label");
      label.className = "dialogInput";
      label.appendChild(document.createTextNode(field.label));
      addBreak(label);
      label.appendChild(selector);
      let div = document.createElement("div");
      div.className = "dialogLine";
      div.appendChild(label);

      menu.list.appendChild(div);

      return selector;
    }

    function addOptionForField(field, gd, text, title, valueObj) {
      if (text) {
        let value = field.options.length;
        let option = { valueObj: valueObj, value: value, text: text, title: title, gd: gd };
        field.options.push(option);
        if (!field.defaultValue) {
          field.defaultValue = value;
        }
      }
    }

    function chooseBestLnab(field) {
      // we want the last name at birth if possible
      // if no death then name of spouse or name in latest record

      // first look for births/baptisms etc
      let birthOptions = [];
      for (let index = 0; index < field.options.length; index++) {
        let option = field.options[index];
        let gd = option.gd;
        if (!gd.role || gd.role == Role.Primary) {
          if (
            gd.recordType == RT.Birth ||
            gd.recordType == RT.BirthRegistration ||
            gd.recordType == RT.Baptism ||
            gd.recordType == RT.BirthOrBaptism
          ) {
            birthOptions.push({ index: index, option: option });
          }
        }
      }
      if (birthOptions.length) {
        if (birthOptions.length == 1) {
          field.defaultValue = birthOptions[0].index;
          return;
        }

        let uniqueNames = {};
        for (let birthOption of birthOptions) {
          let name = birthOption.option.text;
          if (!uniqueNames[name]) {
            uniqueNames[name] = { name: name, count: 1, score: 0, index: birthOption.index };
          } else {
            uniqueNames[name].count++;
          }
          if (birthOption.option.gd.recordType == RT.BirthRegistration) {
            uniqueNames[name].score += 2;
          } else if (birthOption.option.gd.recordType == RT.Birth) {
            uniqueNames[name].score += 1;
          }
        }

        let bestName = "";
        let bestCount = 1;
        let bestScore = 0;
        // chose the name with the most occurences
        for (let key of Object.keys(uniqueNames)) {
          let uniqueName = uniqueNames[key];
          if (uniqueName.count > bestCount) {
            bestName = key;
            bestCount = uniqueName.count;
            bestScore = uniqueName.score;
          } else if (uniqueName.count > 1 && uniqueName.count == bestCount) {
            if (uniqueName.score > bestScore) {
              bestName = key;
              bestScore = uniqueName.score;
            }
          }
        }

        if (bestName) {
          field.defaultValue = uniqueNames[bestName].index;
          return;
        }

        // use score
        bestScore = 0;
        for (let key of Object.keys(uniqueNames)) {
          let uniqueName = uniqueNames[key];
          if (uniqueName.score > bestScore) {
            bestName = key;
            bestScore = uniqueName.score;
          }
        }
        if (bestName) {
          field.defaultValue = uniqueNames[bestName].index;
          return;
        } else {
          field.defaultValue = Object.values(uniqueNames)[0].index;
        }
      }

      // using births didn't work

      // if this is a woman look for the first marriage
      for (let index = 0; index < field.options.length; index++) {
        let option = field.options[index];
        if (option.text) {
          if (option.gd.recordType == RT.Marriage || option.gd.recordType == RT.MarriageRegistration) {
            if (option.gd.personGender == "female") {
              field.defaultValue = index;
              return;
            }
          }
        }
      }

      // use the earliest option with a last name
      for (let index = 0; index < field.options.length; index++) {
        let option = field.options[index];
        if (option.text) {
          field.defaultValue = index;
          return;
        }
      }
    }

    function chooseBestCln(field) {
      // we want the last name at death is possible
      // if no death then name of spouse or name in latest record

      // first look for deaths/burials etc
      let deathOptions = [];
      for (let index = 0; index < field.options.length; index++) {
        let option = field.options[index];
        let gd = option.gd;
        if (!gd.role || gd.role == Role.Primary) {
          if (
            gd.recordType == RT.Death ||
            gd.recordType == RT.DeathRegistration ||
            gd.recordType == RT.Burial ||
            gd.recordType == RT.Probate
          ) {
            deathOptions.push({ index: index, option: option });
          }
        }
      }
      if (deathOptions.length) {
        if (deathOptions.length == 1) {
          field.defaultValue = deathOptions[0].index;
          return;
        }

        let uniqueNames = {};
        for (let deathOption of deathOptions) {
          let name = deathOption.option.text;
          if (!uniqueNames[name]) {
            uniqueNames[name] = { name: name, count: 1, score: 0, index: deathOption.index };
          } else {
            uniqueNames[name].count++;
          }
          if (deathOption.option.gd.recordType == RT.DeathRegistration) {
            uniqueNames[name].score += 2;
          } else if (deathOption.option.gd.recordType == RT.Death) {
            uniqueNames[name].score += 1;
          } else if (deathOption.option.gd.recordType == RT.Probate) {
            uniqueNames[name].score += 1;
          }
        }

        let bestName = "";
        let bestCount = 1;
        let bestScore = 0;
        // chose the name with the most occurences
        for (let key of Object.keys(uniqueNames)) {
          let uniqueName = uniqueNames[key];
          if (uniqueName.count > bestCount) {
            bestName = key;
            bestCount = uniqueName.count;
            bestScore = uniqueName.score;
          } else if (uniqueName.count > 1 && uniqueName.count == bestCount) {
            if (uniqueName.score > bestScore) {
              bestName = key;
              bestScore = uniqueName.score;
            }
          }
        }

        if (bestName) {
          field.defaultValue = uniqueNames[bestName].index;
          return;
        }

        // use score
        bestScore = 0;
        for (let key of Object.keys(uniqueNames)) {
          let uniqueName = uniqueNames[key];
          if (uniqueName.score > bestScore) {
            bestName = key;
            bestScore = uniqueName.score;
          }
        }
        if (bestName) {
          field.defaultValue = uniqueNames[bestName].index;
          return;
        }
      }

      // using deaths didn't work

      // if this is a woman look for the last marriage
      for (let index = field.options.length - 1; index >= 0; index--) {
        let option = field.options[index];
        if (option.text) {
          if (option.gd.recordType == RT.Marriage || option.gd.recordType == RT.MarriageRegistration) {
            // We would want the spouse last name (if this is a woman)
            if (option.gd.personGender == "female") {
              if (option.gd.spouses && option.gd.spouses.length == 1) {
                let nameObj = option.gd.spouses[0].name;
                if (nameObj) {
                  field.defaultValue = index;
                  return;
                }
              }
            }
          }
        }
      }

      // using deaths didn't work
      // use the latest option with a last name
      for (let index = field.options.length - 1; index >= 0; index--) {
        let option = field.options[index];
        // sometimes records can have an old last name for a woman
        if (option.gd.personGender == "female") {
          if (option.gd.recordType == RT.Military) {
            // can be a record of who the soldier married some time ago with her maiden name
            continue;
          }
        }
        if (option.text) {
          field.defaultValue = index;
          return;
        }
      }
    }

    function chooseBestForenames(field) {
      // there are different criteria we could use
      // - We could choose the fornames that occur most in the options
      //   But if most are "John" and 1 or 2 are "John William" and some are "John W"
      //   Then we should choose "John William"

      // if there is only one optin choose that
      if (field.options.length == 1) {
        field.defaultValue = 0;
        return;
      }

      // build a list of unique names and for each record the count of uses

      let uniqueNames = {};
      for (let index = 0; index < field.options.length; index++) {
        let option = field.options[index];
        let name = option.text;
        if (!uniqueNames[name]) {
          uniqueNames[name] = { name: name, count: 1, score: 0, index: index };
        } else {
          uniqueNames[name].count++;
        }
      }

      // assign a score to each name and record ones with equal scores
      let bestScoringNames = [];
      let bestScore = 0;
      for (let uniqueNameKey of Object.keys(uniqueNames)) {
        let uniqueNameObj = uniqueNames[uniqueNameKey];
        let name = uniqueNameObj.name;
        let score = 0;
        let nameParts = name.split(" ");
        score += nameParts.length;
        for (let part of nameParts) {
          if (part.length > 2) {
            score += 1;
          }
        }
        if (score == bestScore) {
          bestScoringNames.push(uniqueNameObj);
        } else if (score > bestScore) {
          bestScoringNames = [uniqueNameObj];
          bestScore = score;
        }
      }

      if (bestScoringNames.length == 1) {
        field.defaultValue = bestScoringNames[0].index;
        return;
      }

      let bestName = null;
      let bestCount = 0;
      // chose the name with the most occurences
      for (let uniqueName of bestScoringNames) {
        if (uniqueName.count > bestCount) {
          bestName = uniqueName;
          bestCount = uniqueName.count;
        }
      }

      if (bestName) {
        field.defaultValue = bestName.index;
      }
    }

    function chooseBestOption(field) {
      if (field.type == "lnab") {
        chooseBestLnab(field);
        return;
      } else if (field.type == "cln") {
        chooseBestCln(field);
        return;
      } else if (field.type == "forenames") {
        chooseBestForenames(field);
        return;
      }

      let bestOptionIndex = 0;
      let bestOption = field.options[0];
      for (let index = 1; index < field.options.length; index++) {
        let useThisOption = false;
        let option = field.options[index];
        if (field.type == "string") {
          if (option.text.length > bestOption.text.length) {
            useThisOption = true;
          }
        } else if (field.type == "date") {
          let dateObj = option.valueObj;
          let bestDateObj = bestOption.valueObj;

          if (dateObj && bestDateObj) {
            const bestQualifier = bestDateObj.qualifier ?? dateQualifiers.NONE;
            const thisQualifier = dateObj.qualifier ?? dateQualifiers.NONE;
            let parsedDate = DateUtils.parseDateString(dateObj.getDateString());
            let parsedBestDate = DateUtils.parseDateString(bestDateObj.getDateString());

            if (bestDateObj.isSubsetOf(dateObj)) {
              if (dateObj.dateString != bestDateObj.dateString) {
                if (parsedDate.hasDay && !parsedBestDate.hasDay) {
                  useThisOption = true;
                } else if (parsedDate.hasMonth && !parsedBestDate.hasMonth) {
                  useThisOption = true;
                }
              } else {
                // same string, if one is less qualified use that
                // they are different. If one is less qualified use that
                if (bestQualifier == dateQualifiers.ABOUT) {
                  if (thisQualifier != dateQualifiers.ABOUT) {
                    useThisOption = true;
                  }
                } else if (bestQualifier == dateQualifiers.BEFORE || bestQualifier == dateQualifiers.AFTER) {
                  if (thisQualifier == dateQualifiers.NONE || thisQualifier == dateQualifiers.EXACT) {
                    useThisOption = true;
                  }
                }
              }
            } else {
              // they are different. If one has more detail (like day) then use that
              // // else if one is less qualified use that
              if (parsedDate.hasDay && !parsedBestDate.hasDay) {
                useThisOption = true;
              }
              if (!parsedDate.hasDay && parsedBestDate.hasDay) {
                useThisOption = false;
              } else if (bestQualifier == dateQualifiers.ABOUT) {
                if (thisQualifier != dateQualifiers.ABOUT) {
                  useThisOption = true;
                }
              } else if (bestQualifier == dateQualifiers.BEFORE || bestQualifier == dateQualifiers.AFTER) {
                if (thisQualifier == dateQualifiers.NONE || thisQualifier == dateQualifiers.EXACT) {
                  useThisOption = true;
                }
              }
            }
          } else {
            // One doesn't have a valueObj.
            console.log("chooseBestOption: comparing two options");
            console.log("option = ", option);
            console.log("bestOption = ", bestOption);
          }
        }
        if (useThisOption) {
          bestOption = option;
          bestOptionIndex = index;
        }
      }

      field.defaultValue = bestOptionIndex;
    }

    // Fields:
    // Forenames
    // LNAB
    // CLN
    // BirthDate + qualifier
    // Birth location
    // Death date + qualifier
    // Death location
    // Sex at birth

    let fields = {
      forenames: { id: "forenamesSelector", label: "Forenames", type: "forenames" },
      lnab: { id: "lnabSelector", label: "Last Name at Birth", type: "lnab" },
      cln: { id: "clnSelector", label: "Current/Married Last Name", type: "cln" },
      birthDate: { id: "birthDateSelector", label: "Birth Date", type: "date" },
      birthLocation: { id: "birthLocationSelector", label: "Birth Location", type: "string" },
      deathDate: { id: "deathDateSelector", label: "Death Date", type: "date" },
      deathLocation: { id: "deathLocationSelector", label: "Death Location", type: "string" },
      sex: { id: "sexSelector", label: "Sex at Birth", type: "string" },
    };

    for (let field of Object.values(fields)) {
      field.selectedValue = "";
      field.options = [];
    }

    // since collectedCitations was read from local storage we need to convert GDs into class
    // objects
    for (let citationObj of collectedCitations.citations) {
      if (citationObj.generalizedData) {
        citationObj.generalizedData = GeneralizedData.createFromPlainObject(citationObj.generalizedData);
      }
    }

    // sort the citations by event date
    sortCitationObjects(collectedCitations.citations);

    // for each citation, if it has a value a field then add it as an option for that field
    for (let citationObj of collectedCitations.citations) {
      let gd = citationObj.generalizedData;
      if (gd) {
        let title = getTitleForHoverText(sites, citationObj, gd);

        addOptionForField(fields.forenames, gd, gd.inferForenames(), title);
        addOptionForField(fields.lnab, gd, gd.inferLastNameAtBirth(), title);
        addOptionForField(fields.cln, gd, gd.inferLastNameAtDeath(), title);

        let birthDateObj = gd.inferBirthDateObj();
        if (birthDateObj) {
          let dateString = birthDateObj.getDateString();
          if (dateString) {
            if (birthDateObj.qualifier) {
              dateString = birthDateObj.getQualifiedDateString(dateString, birthDateObj.qualifier);
            }
            addOptionForField(fields.birthDate, gd, dateString, title, birthDateObj);
          }
        }

        addOptionForField(fields.birthLocation, gd, gd.inferBirthPlace(), title);

        let deathDateObj = gd.inferDeathDateObj();
        if (deathDateObj) {
          let dateString = deathDateObj.getDateString();
          if (dateString) {
            if (deathDateObj.qualifier) {
              dateString = deathDateObj.getQualifiedDateString(dateString, deathDateObj.qualifier);
            }
            addOptionForField(fields.deathDate, gd, dateString, title, deathDateObj);
          }
        }

        addOptionForField(fields.deathLocation, gd, gd.inferDeathPlace(), title);

        addOptionForField(fields.sex, gd, gd.inferPersonGender(), title);
      }
    }

    let savePersonGd = new GeneralizedData();

    // choose the best option for each field,
    // create the UI field and make the best option selected option,
    // and set that in savePersonGd
    for (let field of Object.values(fields)) {
      if (field.options.length) {
        // work out the best option
        chooseBestOption(field);

        field.selectedValue = field.defaultValue;

        // create the field in menu
        addSelectField(field);
      }
    }

    let data = {
      savePersonGd: savePersonGd,
      citations: collectedCitations.citations,
    };

    addActionFunction(menu, fields, data, backToHereFunction);
  }
  endMainMenu(menu);
}

function addCollectedCitationsSavePersonDataMenuItem(menu, fields, data) {
  addButtonMenuItem(menu, "Save Person Data and Stop Collecting Citations", function (element) {
    saveCollectedCitationsPersonData(data, fields);
  });
}

async function setupSavePersonDataFromCollectedCitationsSubmenu(backFunction) {
  setupSelectValuesSubmenu(backFunction, addCollectedCitationsSavePersonDataMenuItem);
}

async function setupSearchUsingCollectedCitationsSubmenu(data, fields, backFunction) {
  let backToHereFunction = function () {
    setupSearchUsingCollectedCitationsSubmenu(data, fields, backFunction);
  };

  const personData = buildPersonDataFromFields(data, fields);

  let menu = beginMainMenu();

  addBackMenuItem(menu, function () {
    backFunction();
  });

  await addSearchMenus(menu, personData, backToHereFunction);

  endMainMenu(menu);
}

function addCollectedCitationsSearchMenuItem(menu, fields, data, backFunction) {
  addButtonMenuItem(menu, "Search using Collected Citations", function (element) {
    setupSearchUsingCollectedCitationsSubmenu(data, fields, backFunction);
  });
}

async function setupSearchFromCollectedCitationsSubmenu(backFunction) {
  setupSelectValuesSubmenu(backFunction, addCollectedCitationsSearchMenuItem);
}

async function setupCollectCitationsSubmenu(data, collectedCitations, backFunction) {
  let backToHereFunction = function () {
    setupCollectCitationsSubmenu(data, collectedCitations, backFunction);
  };

  let menu = beginMainMenu();

  addBackMenuItem(menu, function () {
    backFunction();
  });

  let numCollectedCitations = collectedCitations?.citations?.length ?? 0;

  let previousCollectedCitations = await getPreviousCollectedCitations();
  let numPreviousCollectedCitations = previousCollectedCitations?.citations?.length ?? 0;

  if (numCollectedCitations) {
    addMenuItem(menu, "Save Person Data Using Collected Data...", function (element) {
      setupSavePersonDataFromCollectedCitationsSubmenu(backToHereFunction);
    });
    addMenuItem(menu, "Search Using Collected Data...", function (element) {
      setupSearchFromCollectedCitationsSubmenu(backToHereFunction);
    });
  }
  addMenuItem(menu, `Stop Collecting Citations (${numCollectedCitations})`, async function (element) {
    await stopCollectingCitations();
    closePopup();
  });

  if (numCollectedCitations) {
    addMenuItem(menu, "Remove last citation...", async function (element) {
      await removeLastCitationFromCollectedCitations();
      closePopup();
    });
  }

  if (numPreviousCollectedCitations) {
    addMenuItem(
      menu,
      `Restore previous collected citations (${numPreviousCollectedCitations})`,
      async function (element) {
        await restoreCollectedCitations();
        closePopup();
      }
    );
  }

  endMainMenu(menu);
}

async function addCollectCitationsMenuItem(menu, data, backFunction) {
  if (!options.citation_general_showCollectCitations) {
    return;
  }

  let collectingCitations = false;
  let collectedCitations = await getCollectedCitations();
  if (collectedCitations) {
    collectingCitations = true;
  }

  if (collectingCitations) {
    const numCitations = collectedCitations.citations ? collectedCitations.citations.length : 0;
    addMenuItem(menu, `Collecting Citations (${numCitations})...`, function (element) {
      setupCollectCitationsSubmenu(data, collectedCitations, backFunction);
    });
  } else {
    addMenuItem(menu, "Start Collecting Citations", async function (element) {
      await startNewCollectedCitations();
      closePopup();
    });
  }
}

export { addCollectCitationsMenuItem };
