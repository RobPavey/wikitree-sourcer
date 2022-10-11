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

function handleExceptionMessage(request, sendResponse) {
  console.log(
    "WikiTree Sourcer, background script: received exception message"
  );

  let message = request.message;
  let input = request.input;
  let errorName = request.errorName;
  let errorMessage = request.errorMessage;
  let errorStack = request.errorStack;

  let requestReport = request.requestReport;

  console.log("WikiTree Sourcer, background script: errorStack is:");
  console.log(errorStack);

  chrome.tabs.create(
    { url: "/base/browser/exception/exception.html" },
    function (createdTab) {
      //console.log('Created Tab');
      //console.log(createdTab);

      if (createdTab && createdTab.id) {
        chrome.tabs.onUpdated.addListener(function exceptionTabListener(
          tabId,
          changeInfo,
          tab
        ) {
          //console.log("Exception tab updated, tabId is: " + tabId);

          // make sure the status is 'complete' and it's the right tab
          if (tabId == createdTab.id && changeInfo.status == "complete") {
            // remove the listener now that we know the tab has completed loading
            chrome.tabs.onUpdated.removeListener(exceptionTabListener);

            chrome.tabs.sendMessage(
              tabId,
              {
                type: "exception",
                message: message,
                errorName: errorName,
                errorMessage: errorMessage,
                errorStack: errorStack,
                input: input,
                requestReport: requestReport,
              },
              function (response) {
                let success = true;
                if (!response) {
                  // we were unable to send a message to the exception tab
                  // This happens in Safari (at least when the exception happens early in popup)
                  // So remove the new tab since we were not able to fill it out.
                  console.log(
                    "WikiTree Sourcer, background script: could not sent message to exception tab. Closing tab."
                  );
                  console.log(request);
                  chrome.tabs.remove(tabId, function () {
                    sendResponse({
                      success: false,
                      createdTab: createdTab,
                      changeInfo: changeInfo,
                      tabId: tabId,
                      tab: tab,
                      responseFromMessageToNewTab: response,
                      lastError: chrome.runtime.lastError,
                    });
                  });
                } else {
                  // we send a detailed response back to the caller for debugging this mechanism
                  sendResponse({
                    success: true,
                    createdTab: createdTab,
                    changeInfo: changeInfo,
                    tabId: tabId,
                    tab: tab,
                    responseFromMessageToNewTab: response,
                    lastError: chrome.runtime.lastError,
                  });
                }
              }
            );
          }
        });
      }
    }
  );
}

export { handleExceptionMessage };
