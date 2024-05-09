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

async function updatePage(request) {
  //console.log("updatePage, request is");
  //console.log(request);

  let message = request.message;
  let permissions = request.permissions;

  let statusBoxElement = document.getElementById("statusBox");
  let statusTextElement = document.getElementById("statusText");

  if (statusBoxElement) {
    //console.log("hiding status box");
    statusBoxElement.style.display = "none";
  }

  let descriptionElement = document.getElementById("description");

  if (descriptionElement) {
    descriptionElement.innerText = message;
  }

  function displayStatusBox(message, color) {
    statusTextElement.textContent = message;
    statusBoxElement.style.display = "block";
    statusBoxElement.classList.remove("green");
    statusBoxElement.classList.remove("red");
    if (color == "green") {
      statusBoxElement.classList.add("green");
    } else if (color == "red") {
      statusBoxElement.classList.add("red");
    }
    statusBoxElement.style.display = "block";
  }

  let requestButtonElement = document.getElementById("requestButton");
  if (requestButtonElement && statusBoxElement && statusTextElement) {
    requestButtonElement.onclick = async function (element) {
      try {
        let requestResult = await chrome.permissions.request(permissions);
        if (!requestResult) {
          displayStatusBox("Permission request failed. Request was denied.");
        } else if (chrome.runtime.lastError) {
          displayStatusBox("Permission request failed. An error occurred.", "red");
        } else {
          let message = "Permission request succeeded. Return to what you were doing and it should now work.";
          message += "\nThis tab can be closed.";
          displayStatusBox(message, "green");
          requestButtonElement.style.display = "none";
        }
      } catch (error) {
        console.log("Exception caught during chrome.permissions.request.");
        console.log(error);
        let message = "Permission request failed. An exception occurred.";
        if (error && error.message) {
          message += "\n" + error.message;
        }
        displayStatusBox(message, "red");
      }
    };
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  //console.log("exception.js received a message. Request is:");
  //console.log(request);

  if (request.type == "permissionsRequest") {
    sendResponse({ success: true }); // do this to let the caller we received message

    updatePage(request);
  }
});

//console.log("permissions_page.js loaded");

// test
//updatePage({ message: "Test message", permissions: { origins: ["*://*.bdm.vic.gov.au/*"] } });
