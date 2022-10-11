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

var optionsRegistry = {
  tabs: [
    { name: "search", label: "Search", subsections: [] },
    { name: "citation", label: "Citation", subsections: [] },
    {
      name: "narrative",
      label: "Narrative",
      subsections: [],
      comment:
        "These options apply to the narrative sentence that is generated before " +
        'the inline citation by the "Build Narrative with Citation" menu option.',
    },
    {
      name: "table",
      label: "Household Table",
      subsections: [],
      comment:
        "These options apply to Household Tables. " +
        "A Household Table can be generated when you are on a census record. " +
        "It is separate from the citation.",
    },
    {
      name: "addPerson",
      label: "Add Person",
      subsections: [],
      comment:
        "These options apply to filling fields in the Add Person screen. " +
        "Person data can be saved when you are on a person page in Ancestry, FamilySearch, etc. " +
        "It is separate from the citation.",
    },
  ],
  optionsGroups: [],
};

function registerSubsectionForOptions(tabName, name, label) {
  //console.log("registerSubsectionForOptions: tabName is: " + tabName + ", name is: " + name + ", label is: " + label);

  let tab = undefined;
  for (let thisTab of optionsRegistry.tabs) {
    if (thisTab.name == tabName) {
      tab = thisTab;
    }
  }
  //console.log("registerSubsectionForOptions: tab is: ");
  //console.log(tab);

  if (tab) {
    let existingSubsection = undefined;
    for (let subsection of tab.subsections) {
      if (subsection.name == name) {
        existingSubsection = subsection;
      }
    }

    if (existingSubsection) {
      console.log(
        "registerSubsectionForOptions, subsection already exists: " + name
      );
      return;
    }

    tab.subsections.push({ name: name, label: label, subheadings: [] });
  }
}

function registerSubheadingForOptions(tabName, subsectionName, name, label) {
  //console.log("registerSubheadingForOptions: tabName is: " + tabName + ", name is: " + name + ", label is: " + label);

  let tab = undefined;
  for (let thisTab of optionsRegistry.tabs) {
    if (thisTab.name == tabName) {
      tab = thisTab;
    }
  }
  //console.log("registerSubheadingForOptions: tab is: ");
  //console.log(tab);

  if (tab) {
    let existingSubsection = undefined;
    for (let subsection of tab.subsections) {
      if (subsection.name == subsectionName) {
        existingSubsection = subsection;
      }
    }

    if (existingSubsection) {
      let existingSubheading = undefined;
      for (let subheading of existingSubsection.subheadings) {
        if (subheading.name == name) {
          existingSubheading = subsection;
        }
      }

      if (existingSubheading) {
        console.log(
          "registerSubheadingForOptions, subheading already exists: " + name
        );
        return;
      }

      existingSubsection.subheadings.push({ name: name, label: label });
    }
  }
}

function registerOptionsGroup(optionsGroup) {
  optionsRegistry.optionsGroups.push(optionsGroup);
}

function registerSiteSearchPopupOptionsGroup(
  siteName,
  topMenuPriority,
  subMenuPriority
) {
  const optionsGroup = {
    category: "search",
    subcategory: siteName,
    tab: "search",
    subsection: siteName,
    subheading: "popup",
    options: [
      {
        optionName: "popup_priorityOnTopMenu",
        type: "number",
        label:
          "Priority of the search menu item for this site on the top-level popup menu",
        defaultValue: topMenuPriority,
      },
      {
        optionName: "popup_priorityOnSubMenu",
        type: "number",
        label:
          "Priority of the search menu item for this site on the search submenu",
        defaultValue: subMenuPriority,
        comment:
          "NOTE: One is highest priority. A priority of zero or less means never show this menu item.",
      },
    ],
  };

  registerSubheadingForOptions("search", siteName, "popup", "Popup Menu");
  registerOptionsGroup(optionsGroup);
}

export {
  registerOptionsGroup,
  registerSubsectionForOptions,
  registerSubheadingForOptions,
  registerSiteSearchPopupOptionsGroup,
  optionsRegistry,
};
