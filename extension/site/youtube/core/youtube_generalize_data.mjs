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

import { commonGeneralizeData } from "../../../base/core/generalize_data_creation.mjs";
import { YoutubeEdReader } from "./youtube_ed_reader.mjs";

// The ways that a person can be part of a video, used to write the narrative
const personActions = [
  { value: "appears", text: "Appears in the video", phrase: "appears in a YouTube video" },
  { value: "interviewed", text: "Is interviewed in the video", phrase: "is interviewed in a YouTube video" },
  { value: "subject", text: "Is the subject of the video", phrase: "is the subject of a YouTube video" },
  { value: "mentioned", text: "Is mentioned in the video", phrase: "is mentioned in a YouTube video" },
];

// This function generalizes the data extracted from the page content.
function generalizeData(input) {
  let edReader = new YoutubeEdReader(input.extractedData);
  return commonGeneralizeData("youtube", edReader);
}

// Applies what the user entered in the dialog. Videos don't have a person that can be found automatically
// (the name could be anywhere in the title or description) so the user enters it for the narrative.
function regeneralizeData(input) {
  let ed = input.extractedData;
  let gd = input.generalizedData;
  let newData = input.newData;

  // used by build citation
  ed.includeDescription = newData.includeDescription == "yes";

  const personName = newData.personName ? newData.personName.trim() : "";
  if (personName) {
    const action = personActions.find((action) => action.value == newData.personAction) || personActions[0];
    gd.userOverrideForNarrative = personName + " " + action.phrase + ".";
  } else {
    gd.userOverrideForNarrative = "";
  }
}

function getRequestedUserInput(input) {
  let ed = input.extractedData;
  let newData = input.newData;

  if (!newData) {
    newData = { personName: "", personAction: "appears", includeDescription: "no" };
  }

  const isNarrative = input.type == "narrative";
  const hasDescription = Boolean(ed.description);

  let fields = [
    {
      id: "topLabel",
      type: "label",
      label: isNarrative ? "Add the person in the video" : "Add details to the citation",
    },
    {
      id: "personName",
      type: "textInput",
      label: "Person's name: ",
      comment: "(Leave empty if the narrative should not mention a person)",
      property: "personName",
      defaultValue: newData.personName,
      hidden: !isNarrative,
    },
    {
      id: "personAction",
      type: "select",
      label: "Their part in the video:",
      property: "personAction",
      options: personActions.map((action) => ({ value: action.value, text: action.text })),
      defaultValue: newData.personAction,
      hidden: !isNarrative,
    },
    {
      id: "descriptionLabel",
      type: "label",
      label: "Description: " + ed.description,
      hidden: !hasDescription,
    },
    {
      id: "includeDescription",
      type: "select",
      label: "Add the start of the description to the citation:",
      property: "includeDescription",
      options: [
        { value: "no", text: "No" },
        { value: "yes", text: "Yes" },
      ],
      defaultValue: newData.includeDescription,
      hidden: !hasDescription,
    },
  ];

  return { resultData: newData, fields: fields };
}

export { generalizeData, regeneralizeData, getRequestedUserInput };
