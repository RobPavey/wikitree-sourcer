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

function waitForButtonClicks(dialog, buttons) {
  return new Promise((resolve) => {
    const handleClick = (event) => {
      for (let button of buttons) {
        let buttonId = "button" + button;
        let buttonElement = dialog.querySelector("#" + buttonId);
        buttonElement.removeEventListener("click", handleClick);
      }
      resolve(event.target.id); // Resolve with the ID of the clicked button
    };

    for (let button of buttons) {
      let buttonId = "button" + button;
      let buttonElement = dialog.querySelector("#" + buttonId);
      buttonElement.addEventListener("click", handleClick);
    }
  });
}

async function showDialog(heading, message, buttons, type) {
  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }

  let dialogHeader = dialog.querySelector("div.dialogHeader");
  if (!dialogHeader) {
    console.log("dialogHeader not found");
    return;
  }
  let dialogMessageDiv = dialog.querySelector("div.dialogMessage");
  if (!dialogMessageDiv) {
    console.log("dialogMessageDiv not found");
    return;
  }
  let dialogBusyDiv = dialog.querySelector("div.dialogBusy");
  if (!dialogBusyDiv) {
    console.log("dialogBusyDiv not found");
    return;
  }
  let dialogButtonRow = dialog.querySelector("div.dialogButtonRow");
  if (!dialogButtonRow) {
    console.log("dialogButtonRow not found");
    return;
  }

  // add header
  {
    // remove all children
    while (dialogHeader.firstChild) {
      dialogHeader.removeChild(dialogHeader.firstChild);
    }
    let wrapperDiv = document.createElement("div");
    if (type == "error") {
      wrapperDiv.className = "dialogErrorHeader";
    } else if (type == "warning") {
      wrapperDiv.className = "dialogWarningHeader";
    } else if (type == "progress") {
      wrapperDiv.className = "dialogProgressHeader";
    } else if (type == "success") {
      wrapperDiv.className = "dialogSuccessHeader";
    }
    dialogHeader.appendChild(wrapperDiv);
    let label = document.createElement("label");
    label.innerText = heading;
    label.className = "dialogHeaderLabel";
    wrapperDiv.appendChild(label);
  }

  // add message
  {
    // remove all children
    while (dialogMessageDiv.firstChild) {
      dialogMessageDiv.removeChild(dialogMessageDiv.firstChild);
    }

    let label = document.createElement("label");
    label.innerText = message;
    dialogMessageDiv.appendChild(label);
  }

  {
    while (dialogBusyDiv.firstChild) {
      dialogBusyDiv.removeChild(dialogBusyDiv.firstChild);
    }

    if (type == "progress") {
      let busy = document.createElement("div");
      busy.id = "busyContainer";
      busy.className = "busyContainer";
      dialogBusyDiv.appendChild(busy);

      let loader = document.createElement("div");
      loader.className = "spinner";
      busy.appendChild(loader);
    }
  }

  // add buttons
  {
    // remove all children
    while (dialogButtonRow.firstChild) {
      dialogButtonRow.removeChild(dialogButtonRow.firstChild);
    }
    for (let button of buttons) {
      let buttonElement = document.createElement("button");
      buttonElement.innerText = button;
      buttonElement.className = "dialogButton";
      buttonElement.id = "button" + button;
      dialogButtonRow.appendChild(buttonElement);
    }
  }

  dialog.showModal();

  let clickedButtonId = await waitForButtonClicks(dialog, buttons);

  dialog.close();

  return clickedButtonId;
}

async function showErrorDialog(message) {
  return await showDialog("Error", message, ["OK"], "error");
}

async function showWarningDialog(message) {
  return await showDialog("Warning", message, ["Continue", "Cancel"], "warning");
}

async function showSuccessDialog(message) {
  return await showDialog("Success", message, ["OK"], "success");
}

var progressDialogResponse = "";
async function showProgressDialog(message) {
  progressDialogResponse = "";
  showDialog("Progress", message, ["Stop", "Cancel"], "progress");

  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }

  let stopButtonId = "buttonStop";
  let stopButtonElement = dialog.querySelector("#" + stopButtonId);
  if (stopButtonElement) {
    stopButtonElement.addEventListener("click", (event) => {
      progressDialogResponse = "stop";
    });
  }

  let cancelButtonId = "buttonCancel";
  let cancelButtonElement = dialog.querySelector("#" + cancelButtonId);
  if (cancelButtonElement) {
    cancelButtonElement.addEventListener("click", (event) => {
      progressDialogResponse = "cancel";
    });
  }
}

function updateProgressDialog(message) {
  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }

  let dialogMessageDiv = dialog.querySelector("div.dialogMessage");
  if (!dialogMessageDiv) {
    console.log("dialogList not found");
    return;
  }

  // add message
  {
    // remove all children
    while (dialogMessageDiv.firstChild) {
      dialogMessageDiv.removeChild(dialogMessageDiv.firstChild);
    }

    let label = document.createElement("label");
    label.innerText = message;
    dialogMessageDiv.appendChild(label);
  }
}

function closeProgressDialog() {
  let dialog = document.getElementById("dialog");
  if (!dialog) {
    console.log("dialog not found");
    return;
  }
  dialog.close();
}

export {
  progressDialogResponse,
  showErrorDialog,
  showWarningDialog,
  showSuccessDialog,
  showProgressDialog,
  updateProgressDialog,
  closeProgressDialog,
};
