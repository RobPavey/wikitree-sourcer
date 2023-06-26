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

import { displayMessage, displayMessageWithIcon } from "/base/browser/popup/popup_menu_building.mjs";

var requestsTracker = {
  requestStates: [],
  expectedResponseCount: 0,
  receivedResponseCount: 0,
  failureCount: 0,
  callbackFunction: undefined,
  requestFunction: undefined,
  requestFunctionName: "", // used in console error messages
};

function resetStaticCounts() {
  requestsTracker.expectedResponseCount = 0;
  requestsTracker.receivedResponseCount = 0;
  requestsTracker.failureCount = 0;
}

function displayStatusMessage() {
  const baseMessage = "WikiTree Sourcer fetching additional records ...\n\n(This might take several seconds)...\n";

  let message = baseMessage;
  for (let requestState of requestsTracker.requestStates) {
    message += "\n'" + requestState.request.name + "' " + requestState.status;
  }
  displayMessage(message);
}

function parallelRequestsDisplayErrorsMessage(actionName) {
  let baseMessage = "During " + actionName + " some linked records could not be retreived.";
  baseMessage += "\nThis could be due to internet connectivity issues or server issues.";
  baseMessage += "\nPlease try again.\n";

  let message = baseMessage;
  for (let requestState of requestsTracker.requestStates) {
    message += "\n'" + requestState.request.name + "' " + requestState.status;
  }
  displayMessageWithIcon("warning", message);
}

function handleRequestResponse(request, response, doRequest, resolve) {
  //console.log("received response in parallel_requests handleRequestResponse:");
  //console.log(response);

  //console.log("received response:");
  //console.log(response);

  // find linkedRecord for this url
  let matchingRequestState = undefined;
  for (let requestState of requestsTracker.requestStates) {
    if (requestState.request == request) {
      matchingRequestState = requestState;
      break;
    }
  }

  //console.log("in parallel_requests handleRequestResponse, matchingRequestState is:");
  //console.log(matchingRequestState);

  if (response.success) {
    if (matchingRequestState) {
      matchingRequestState.response = response;
      matchingRequestState.status = "fetched";
    }
    requestsTracker.receivedResponseCount++;
  } else {
    // ??
    console.log(
      "receiveFetchedRecord: Failed response from ancestry extractRecordFromUrl. recordUrl is: " + response.recordUrl
    );

    if (!matchingRequestState.timeouts) {
      matchingRequestState.timeouts = 0;
    }

    if (response.allowRetry && matchingRequestState.timeouts < requestsTracker.maxRetries) {
      matchingRequestState.timeouts++;
      matchingRequestState.status = "retry " + matchingRequestState.timeouts + " ...";
      setTimeout(function () {
        doRequest(request, requestsTracker.requestFunction);
      }, 1000);
    } else {
      matchingRequestState.status = "failed";
      requestsTracker.failureCount++;
      requestsTracker.receivedResponseCount++;
      console.log(
        "handleRequestResponse: timed out. receivedResponseCount is: " + requestsTracker.receivedResponseCount
      );
    }
  }

  displayStatusMessage();

  if (requestsTracker.receivedResponseCount == requestsTracker.expectedResponseCount) {
    // if there were any failures then remember that for caller
    let callbackInput = { failureCount: requestsTracker.failureCount, responses: [] };
    for (let requestState of requestsTracker.requestStates) {
      callbackInput.responses.push(requestState.response);
    }
    resetStaticCounts();

    resolve(callbackInput);
  }
}

// This function does a series of asynchronouse requests in parallel and returns
// when they are all complete. It is passed an array of request objects and an
// async function to call for each request
function doRequestsInParallel(requests, requestFunction, maxRetries = 3) {
  // requests is an array of objects, each has the following fields
  //   name : a name that can be used in the status display
  //   input : data to be passed to the request function (varies by site/action)
  // requestFunction is an async function that performs the request and returns a response
  //   The response object must have a property "success" that is true or false.
  // maxRetires is the number of times a request function will be retried in the
  //    case that the responseObject has a property allowRetries set to true.
  // return value is a Promise. The resolve object has the following properties
  //   failureCount
  //   responses: array of response objects

  resetStaticCounts();
  requestsTracker.expectedResponseCount = requests.length;
  requestsTracker.maxRetries = maxRetries;
  requestsTracker.requestFunction = requestFunction; // only needed for retries

  requestsTracker.requestStates = [];
  for (let request of requests) {
    let requestState = {
      request: request,
      status: "fetching...",
    };
    requestsTracker.requestStates.push(requestState);
  }

  return new Promise((resolve) => {
    async function doRequest(request, requestFunction) {
      let response = await requestFunction(request.input);
      handleRequestResponse(request, response, doRequest, resolve);
    }

    for (let request of requests) {
      doRequest(request, requestFunction);
    }

    displayStatusMessage();
  });
}

export { doRequestsInParallel, parallelRequestsDisplayErrorsMessage };
