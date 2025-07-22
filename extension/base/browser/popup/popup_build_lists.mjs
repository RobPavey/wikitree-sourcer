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
  addBackMenuItem,
  addMenuItem,
  addItalicMessageMenuItem,
  beginMainMenu,
  endMainMenu,
} from "./popup_menu_building.mjs";

import { writeToClipboard, clearClipboard } from "./popup_clipboard.mjs";

//////////////////////////////////////////////////////////////////////////////////////////
// Building lists
//////////////////////////////////////////////////////////////////////////////////////////

async function buildListAction(data, listType, spouse) {
  try {
    clearClipboard();

    // build the list
    let gd = data.generalizedData;
    let listText = "";
    function buildList(personArray) {
      if (personArray && personArray.length) {
        for (let index = 0; index < personArray.length; index++) {
          if (index > 0) {
            if (index < personArray.length - 1) {
              listText += ", ";
            } else {
              listText += " and ";
            }
          }
          let person = personArray[index];
          if (person.name) {
            let forenames = person.name.inferForenames();
            if (forenames) {
              listText += forenames;
            }
          } else {
            listText += "<unknown>";
          }
          let birthDate = "";
          let deathDate = "";
          if (person.birthDate && person.birthDate.yearString) {
            birthDate = person.birthDate.yearString;
          }
          if (person.deathDate && person.deathDate.yearString) {
            deathDate = person.deathDate.yearString;
          }
          if (birthDate || deathDate) {
            listText += " (" + birthDate + "-" + deathDate + ")";
          }
        }
      }
    }

    if (listType == "fullSiblings") {
      buildList(gd.siblings);
    } else if (listType == "halfSiblings") {
      buildList(gd.halfSiblings);
    } else if (listType == "allSiblings") {
      if (gd.siblings && gd.halfSiblings) {
        buildList(gd.siblings.concat(gd.halfSiblings));
      }
    } else if (listType == "children") {
      if (spouse) {
        buildList(spouse.children);
      } else {
        // all children
        let childArray = [];
        for (let spouse of gd.spouses) {
          if (spouse.children && spouse.children.length) {
            childArray = childArray.concat(spouse.children);
          }
        }
        buildList(childArray);
      }
    }

    // save to clipboard
    let message = "List";

    writeToClipboard(listText, message, false);
  } catch (e) {
    console.log("buildListAction caught exception:");
    console.log(e);
    keepPopupOpenForDebug();

    const message = "An exception occurred building list and writing to clipboard.";
    let message2 = "";
    if (e && e.message) {
      message2 = e.message;
    }
    displayMessageWithIcon("warning", message, message2);
  }
}

function addBuildListSubmenuMenuItem(menu, data, text, listType, spouse) {
  addMenuItem(menu, text, function (element) {
    buildListAction(data, listType, spouse);
  });
}

function setupBuildListsSubMenu(data, backFunction, siblingsNeedExpand) {
  let menu = beginMainMenu();

  addBackMenuItem(menu, backFunction);

  let gd = data.generalizedData;
  if (gd.spouses && gd.spouses.length) {
    let numSpousesWithChildren = 0;
    for (let spouse of gd.spouses) {
      if (spouse.children && spouse.children.length) {
        let spouseName = "unknown parent";
        if (spouse.name && spouse.name.name) {
          spouseName = spouse.name.name;
        }
        addBuildListSubmenuMenuItem(menu, data, "List of children with " + spouseName, "children", spouse);
        numSpousesWithChildren++;
      }
    }
    if (numSpousesWithChildren > 1) {
      addBuildListSubmenuMenuItem(menu, data, "List of all children", "children");
    }
  }

  if (gd.siblings && gd.siblings.length) {
    addBuildListSubmenuMenuItem(menu, data, "Full siblings list", "fullSiblings");
  }
  if (gd.halfSiblings && gd.halfSiblings.length) {
    addBuildListSubmenuMenuItem(menu, data, "Half siblings list", "halfSiblings");
    if (gd.siblings && gd.siblings.length) {
      addBuildListSubmenuMenuItem(menu, data, "All siblings list", "allSiblings");
    }
  }

  if (siblingsNeedExpand && !gd.siblings && !gd.halfSiblings) {
    addItalicMessageMenuItem(menu, "No siblings found - check that Siblings list is expanded");
  }

  endMainMenu(menu);
}

function addBuildListsMenuItem(menu, data, backFunction, siblingsNeedExpand) {
  let gd = data.generalizedData;
  let listsAvailable = false;
  if (gd.siblings && gd.siblings.length) {
    listsAvailable = true;
  } else if (gd.halfSiblings && gd.halfSiblings.length) {
    listsAvailable = true;
  } else if (gd.spouses && gd.spouses.length) {
    for (let spouse of gd.spouses) {
      if (spouse.children && spouse.children.length) {
        listsAvailable = true;
        break;
      }
    }
  }

  if (listsAvailable) {
    addMenuItem(menu, "Build Lists...", function () {
      setupBuildListsSubMenu(data, backFunction, siblingsNeedExpand);
    });
  }
}
export { addBuildListsMenuItem };
