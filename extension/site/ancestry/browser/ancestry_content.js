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

async function setFields(fieldData, sendResponse) {
  console.log("setFields, fieldData is:");
  console.log(fieldData);

  function setSourceSelect(sourceName) {
    console.log("setSourceSelect, sourceName is:");
    console.log(sourceName);

    if (!sourceName) {
      return;
    }
    let selectNode = document.querySelector("#sourceSelect");
    if (!selectNode) {
      return;
    }

    console.log("setSourceSelect, selectNode is:");
    console.log(selectNode);

    let optionNodes = selectNode.querySelectorAll("option");
    for (let optionNode of optionNodes) {
      let optionText = optionNode.textContent.trim();
      console.log("setSourceSelect, optionText is:");
      console.log(optionText);

      if (optionText == sourceName) {
        selectNode.value = optionNode.value;
        return;
      }
    }
  }

  function setRepositorySelect(repositoryName) {
    if (!repositoryName) {
      return;
    }
    let selectNode = document.querySelector("#repositorySelect");
    if (!selectNode) {
      return;
    }

    let optionNodes = selectNode.querySelectorAll("option");
    for (let optionNode of optionNodes) {
      let optionText = optionNode.textContent.trim();
      if (optionText == repositoryName) {
        selectNode.value = optionNode.value;
        return;
      }
    }
  }

  function setValue(nodeSelector, fieldName) {
    if (fieldData[fieldName]) {
      let node = document.querySelector(nodeSelector);
      if (node) {
        node.value = fieldData[fieldName];
      }
    }
  }

  function setValueExec(nodeSelector, fieldName) {
    if (fieldData[fieldName]) {
      let node = document.querySelector(nodeSelector);
      if (node) {
        node.value = fieldData[fieldName];
        node.focus();
        document.execCommand("selectAll", false);
        document.execCommand("insertText", false, fieldData[fieldName]);
      }
    }
  }

  if (fieldData.pageType == "createCitation") {
    setSourceSelect(fieldData.sourceName);
    setValue("#citationTitle", "detail");
    setValue("#citationDate", "date");
    setValue("#citationText", "text");
    setValue("#citationNotes", "otherInfo");
    setValue("#citationHRef", "webAddress");
  } else if (fieldData.pageType == "createSource") {
    setValue("#SourceTitle", "sourceName");
    setRepositorySelect(fieldData.repositoryName);
  } else if (fieldData.pageType == "createRepository") {
    setValue("#RepositoryName", "repositoryName");
    setValue("#RepositoryAddress", "address");
    setValue("#RepositoryPhone", "phoneNumber");
    setValue("#RepositoryEmail", "email");
    setValue("#RepositoryNote", "note");
  } else if (fieldData.pageType == "personAddWebLink") {
    setValueExec("#webLink", "webAddress");
    setValueExec("#webLinkName", "linkName");
  }

  sendResponse({ success: true });
}

function addComment(fieldData) {
  console.log("addComment, fieldData is:");
  console.log(fieldData);

  // this is complicated because there is a textArea field but also a div that acts as a text area
  // We have to hide one and show the other

  let commentText = fieldData.commentText;
  let commentPlaceHolderTextArea = document.querySelector("#mainContent div.input div.addCommentArea textArea");
  if (!commentPlaceHolderTextArea) {
    return;
  }
  let commentAddCommentTextAreaDiv = document.querySelector(
    "#mainContent div.input div.addCommentArea div.commentTextAreaWrapper div.addCommentTextArea"
  );
  if (!commentAddCommentTextAreaDiv) {
    return;
  }
  let commentActionArea = document.querySelector("#mainContent div.commentWebPart_addComment div.input div.actionArea");
  if (!commentActionArea) {
    return;
  }
  let commentSubmitButton = document.querySelector(
    "#mainContent div.commentWebPart_addComment div.input button.submitBtn"
  );
  if (!commentSubmitButton) {
    return;
  }

  if (commentText) {
    console.log("commentText is: " + commentText);
    commentPlaceHolderTextArea.focus();
    commentAddCommentTextAreaDiv.textContent = commentText;
    commentPlaceHolderTextArea.classList.add("noDisplay");
    commentAddCommentTextAreaDiv.classList.remove("noDisplay");
    commentActionArea.classList.remove("noDisplay");
    commentSubmitButton.classList.remove("disabled");
    commentSubmitButton.disabled = false;
    commentSubmitButton.click();
  }
}

async function additionalMessageHandler(request, sender, sendResponse) {
  if (request.type == "setFields") {
    setFields(request.fieldData, sendResponse);
    return { wasHandled: true, returnValue: true };
  } else if (request.type == "addComment") {
    addComment(request.fieldData);
    sendResponse({ success: true });
    return { wasHandled: true, returnValue: false };
  }

  return { wasHandled: false };
}

siteContentInit(
  `ancestry`,
  `site/ancestry/core/ancestry_extract_data.mjs`,
  undefined, // overrideExtractHandler
  additionalMessageHandler
);

////////////////////////////////////////////////////////////////////////////////
// All code below this is for editing the citation on an image page
////////////////////////////////////////////////////////////////////////////////

// we store this in a global, the text is in the edit box but we need to remember the
// whole citation to save it - I guess we could reload it on save but this seems better.
var lastCitationObject = undefined;

// This could be shared but would require dynamic module load
async function saveCitation(citationText) {
  if (lastCitationObject) {
    let citationObject = lastCitationObject;
    citationObject.timeStamp = Date.now();
    citationObject.citation = citationText;

    navigator.clipboard.writeText(citationText);

    chrome.storage.local.set({ latestCitation: citationObject }, function () {
      //console.log('latestCitation is set to ' + citation);
    });
  }
}

async function getLatestCitation() {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(["latestCitation"], function (value) {
        resolve(value);
      });
    } catch (ex) {
      reject(ex);
    }
  });
}

async function getCitationText() {
  let storedObject = await getLatestCitation();
  let citationObject = storedObject.latestCitation;
  let citation = "";
  if (citationObject) {
    citation = citationObject.citation;
    lastCitationObject = citationObject;
  }
  if (!citation) {
    citation = "";
  }
  return citation;
}

async function fillTextArea(textArea) {
  //console.log("fillTextArea");

  const citation = await getCitationText();
  textArea.value = citation;
  textArea.focus();
}

function hideOrShowEditCitationPanel(documentContainingImage) {
  let bottomContainer = documentContainingImage.querySelector("div.bottom-container");

  //console.log("bottomContainer is");
  //console.log(bottomContainer);

  if (bottomContainer) {
    let existingElement = bottomContainer.querySelector("div.index-panel.edit-citation");

    //console.log("existingElement is");
    //console.log(existingElement);

    if (existingElement) {
      // we have already created the panel for the citation just need to hide or show it
      if (existingElement.className.includes("noDisplay")) {
        existingElement.className = "index-panel edit-citation";
      } else {
        existingElement.className = "index-panel noDisplay edit-citation";
      }
    } else {
      // create the panel
      let editDivElement = documentContainingImage.createElement("div");
      editDivElement.style = "width: 100%; height: 200px;";
      editDivElement.className = "index-panel edit-citation";

      let panelHeader = documentContainingImage.createElement("div");
      panelHeader.className = "index-panel-header";

      let panelContainer = documentContainingImage.createElement("div");
      panelContainer.className = "index-panel-container";
      //panelContainer.style.flex = "1";

      let titleIndex = documentContainingImage.createElement("span");
      titleIndex.className = "title-index";
      titleIndex.textContent = "Edit Citation";
      panelContainer.appendChild(titleIndex);

      let starty = undefined;
      let startheight = undefined;
      let dragging = false;

      let grapper = documentContainingImage.createElement("span");
      grapper.className = "grapper";
      grapper.setAttribute("role", "presentation");

      grapper.onmousedown = function (e) {
        //console.log("grapper.onmousedown, e is:");
        //console.log(e);
        starty = e.y;
        startheight = editDivElement.clientHeight;
        dragging = true;
      };
      documentContainingImage.body.addEventListener("mousemove", function (e) {
        if (dragging && startheight && starty) {
          //console.log("grapper.mousemove");
          let ydiff = e.y - starty;
          let height = startheight - ydiff;
          editDivElement.style.height = `${height}px`;
        }
      });
      documentContainingImage.body.addEventListener("mouseup", function () {
        if (dragging) {
          //console.log("grapper.mouseup");
          dragging = false;
        }
      });

      grapper.ontouchstart = function (e) {
        //console.log("grapper.ontouchstart, e is:");
        //console.log(e);

        const touches = e.changedTouches;
        if (touches.length == 1) {
          e.preventDefault();
          const touch = touches[0];

          starty = touch.pageY;
          startheight = editDivElement.clientHeight;
          dragging = true;
        }
      };
      documentContainingImage.body.addEventListener("touchmove", function (e) {
        if (dragging && startheight && starty) {
          //console.log("grapper.touchmove, e is:");
          //console.log(e);

          const touches = e.changedTouches;
          if (touches.length == 1) {
            e.preventDefault();

            const touch = touches[0];

            let ydiff = touch.pageY - starty;
            let height = startheight - ydiff;
            editDivElement.style.height = `${height}px`;
          }
        }
      });
      documentContainingImage.body.addEventListener("touchcancel", function (e) {
        if (dragging) {
          //console.log("grapper.touchcancel");
          dragging = false;
        }
      });
      documentContainingImage.body.addEventListener("touchend", function () {
        if (dragging) {
          //console.log("grapper.touchend");
          dragging = false;
        }
      });

      let grapperIcon = documentContainingImage.createElement("span");
      grapperIcon.className = "icon iconMenu";
      grapperIcon.style = "::before";
      grapper.appendChild(grapperIcon);

      panelContainer.appendChild(grapper);

      // save button
      let saveButton = documentContainingImage.createElement("button");
      saveButton.className = "icon iconSave saveButton link";
      saveButton.type = "button";

      let saveButtonSpan = documentContainingImage.createElement("span");
      saveButtonSpan.className = "hideVisually";

      saveButton.appendChild(saveButtonSpan);

      panelContainer.appendChild(saveButton);

      // close button at top right of title bar
      let titleButton = documentContainingImage.createElement("button");
      titleButton.className = "icon iconClose closeButton link";
      titleButton.type = "button";
      titleButton.onclick = function () {
        //console.log("editCitation titleButton clicked");
        editDivElement.className = "index-panel noDisplay";
      };

      let titleButtonSpan = documentContainingImage.createElement("span");
      titleButtonSpan.className = "hideVisually";

      titleButton.appendChild(titleButtonSpan);

      panelContainer.appendChild(titleButton);

      panelHeader.appendChild(panelContainer);
      editDivElement.appendChild(panelHeader);

      let textarea = documentContainingImage.createElement("textarea");
      textarea.style = "width: 100%; height: 100%;";
      fillTextArea(textarea);
      textarea.addEventListener("keyup", (e) => {
        e.stopPropagation();
      });
      textarea.addEventListener("keydown", (e) => {
        e.stopPropagation();
      });
      editDivElement.appendChild(textarea);

      saveButton.onclick = function () {
        //console.log("editCitation saveButton clicked");
        saveCitation(textarea.value);
      };

      // insert before index-panel if present
      let existingIndexPanel = bottomContainer.querySelector("div.index-panel");
      if (existingIndexPanel) {
        bottomContainer.insertBefore(editDivElement, existingIndexPanel);
      } else {
        bottomContainer.appendChild(editDivElement);
      }
    }
  }
}

var retryCount = 0;

function addEditCitationButton() {
  const maxRetries = 10;

  let documentContainingImage = document;
  let wrapper = document.querySelector("div.bottom-container > div.paging-panel > div.paging-wrapper");

  // sometimes the image is being viewed in an iFrame
  if (!wrapper) {
    let viewerIframe = document.querySelector("#discoveryUIImageviewerModal > iframe");
    //console.log("viewerIframe is");
    //console.log(viewerIframe);

    if (viewerIframe) {
      wrapper = viewerIframe.contentWindow.document.querySelector(
        "div.bottom-container > div.paging-panel > div.paging-wrapper"
      );

      let isHidden = viewerIframe.className.includes("hidden");

      if (isHidden) {
        //console.log("adding callback on viewerIframe.contentWindow");
        viewerIframe.addEventListener("load", function () {
          //console.log("viewerIframe load callback");
          addEditCitationButton();
        });
        return;
      }

      documentContainingImage = viewerIframe.contentWindow.document;

      let indexButton = null;
      if (wrapper) {
        indexButton = wrapper.querySelector("button.indexToggle");
      }

      //console.log("indexButton is");
      //console.log(indexButton);

      // possible retry because it can take a while to fill out the image viewer iframe
      // I'm not sure this is necessary anymore
      if (!indexButton) {
        if (retryCount < maxRetries) {
          console.log("Doing retry, retryCount = " + retryCount);
          setTimeout(addEditCitationButton, 200);
          retryCount++;
          return;
        }
      }
    }
  }

  //console.log("wrapper is");
  //console.log(wrapper);

  if (wrapper) {
    let existingElement = wrapper.querySelector("button.editCitation");

    //console.log("existingElement is");
    //console.log(existingElement);

    if (!existingElement) {
      let editCitationButton = documentContainingImage.createElement("button");
      editCitationButton.className = "editCitation";
      editCitationButton.type = "button";
      editCitationButton.style.margin = "0px 5px";
      editCitationButton.style.padding = "0px 5px";
      editCitationButton.style.backgroundColor = "#e1f0b4";
      editCitationButton.style.border = "thin solid black";
      editCitationButton.textContent = "[1] Edit Citation";
      editCitationButton.onclick = function () {
        //console.log("editCitationButton clicked");
        hideOrShowEditCitationPanel(documentContainingImage);
      };

      let editCitationButtonSpan = documentContainingImage.createElement("span");
      editCitationButtonSpan.className = "hideVisually ng-binding";

      editCitationButton.appendChild(editCitationButtonSpan);

      wrapper.appendChild(editCitationButton);
    }
  }
}

chrome.runtime.sendMessage(
  {
    type: "getOptions",
  },
  function (response) {
    // We get a response with the loaded options
    if (response && response.success) {
      const options = response.options;
      if (options) {
        if (options.citation_ancestry_addEditCitationButton) {
          addEditCitationButton();
        }
      }
    }
  }
);
