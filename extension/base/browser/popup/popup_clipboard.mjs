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
  displayMessageWithIconThenClosePopup,
  displayMessageThenClosePopup,
  emptyMenu,
} from "./popup_menu_building.mjs";

function writeToClipboardSuccessMessage(objectName, internalSave, extraMessage = "") {
  let message1 = objectName + " saved to clipboard.";
  let message2 = extraMessage;
  if (internalSave) {
    message2 = "It is also saved internally.";
  }
  displayMessageWithIconThenClosePopup("check", message1, message2);
}

async function userWriteToClipboardWithEdit(text, objectName, internalSave) {
  // This is currently not used. It is an alternate option to use on Safari

  function addBreak(fragment) {
    let br = document.createElement("br");
    fragment.appendChild(br);
  }

  emptyMenu();

  let fragment = document.createDocumentFragment();

  addBreak(fragment);

  let label1 = document.createElement("label");
  label1.innerText = "The " + objectName + " cannot be written to the clipboard by the WikiTree Sourcer extension.";
  fragment.appendChild(label1);

  addBreak(fragment);

  let label2 = document.createElement("label");
  label2.innerText = "Review it below and press the 'Save to clipboard' button to save it to the clipboard.";
  fragment.appendChild(label);

  addBreak(fragment);
  addBreak(fragment);

  let textarea = document.createElement("textarea");
  textarea.className = "largeEditBox";
  textarea.value = text;
  fragment.appendChild(textarea);

  let saveButton = document.createElement("button");
  saveButton.className = "dialogButton";
  saveButton.innerText = "Save to clipboard";
  saveButton.onclick = async function (element) {
    let editedText = textarea.value;
    try {
      await navigator.clipboard.writeText(editedText);
      writeToClipboardSuccessMessage(objectName, internalSave);
    } catch (error) {
      console.log("Clipboard write failed in userWriteToClipboardWithEdit.");
      console.log(error);
      displayMessageThenClosePopup("Error writing to clipboard.");
    }
  };

  let cancelButton = document.createElement("button");
  cancelButton.className = "dialogButton";
  cancelButton.innerText = "Cancel";
  cancelButton.onclick = async function (element) {
    displayMessageThenClosePopup("Save canceled");
  };

  let buttonDiv = document.createElement("div");
  buttonDiv.className = "flex-parent jc-center";
  buttonDiv.appendChild(saveButton);
  buttonDiv.appendChild(cancelButton);

  fragment.appendChild(buttonDiv);

  document.getElementById("menu").appendChild(fragment);
}

async function userWriteToClipboard(text, objectName, internalSave = false, extraMessage = "") {
  function addBreak(fragment) {
    let br = document.createElement("br");
    fragment.appendChild(br);
  }

  // This is currently only used on Safari

  emptyMenu();

  let fragment = document.createDocumentFragment();

  let messageDiv1 = document.createElement("div");
  messageDiv1.className = "flex-parent jc-center";
  addBreak(messageDiv1);

  let label1 = document.createElement("label");
  label1.innerText = objectName + " generated.";
  messageDiv1.appendChild(label1);

  fragment.appendChild(messageDiv1);

  let messageDiv2 = document.createElement("div");
  messageDiv2.className = "flex-parent jc-center";
  addBreak(messageDiv2);

  let label2 = document.createElement("label");
  label2.innerText = "Press the button below to save it to the clipboard.";
  messageDiv2.appendChild(label2);

  addBreak(messageDiv2);

  fragment.appendChild(messageDiv2);

  let saveButton = document.createElement("button");
  saveButton.className = "dialogButton";
  saveButton.innerText = "Save to clipboard";
  saveButton.onclick = async function (element) {
    try {
      await navigator.clipboard.writeText(text);
      writeToClipboardSuccessMessage(objectName, internalSave, extraMessage);
    } catch (error) {
      console.log("Clipboard write failed in userWriteToClipboard.");
      console.log(error);
      displayMessageThenClosePopup("Error writing to clipboard.");
    }
  };

  let buttonDiv = document.createElement("div");
  buttonDiv.className = "flex-parent jc-center";
  buttonDiv.appendChild(saveButton);

  fragment.appendChild(buttonDiv);

  document.getElementById("menu").appendChild(fragment);
}

async function writeToClipboard(text, objectName, internalSave, extraMessage = "") {
  try {
    await navigator.clipboard.writeText(text);
    writeToClipboardSuccessMessage(objectName, internalSave, extraMessage);
    //console.log("Clipboard set");
  } catch (error) {
    console.log("Clipboard write failed. Using dialog instead.");
    //console.log(error);
    userWriteToClipboard(text, objectName, internalSave, extraMessage);
  }
}

export { writeToClipboard };
