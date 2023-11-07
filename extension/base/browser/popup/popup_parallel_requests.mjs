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
  displayBusyMessageWithSkipButton,
  displayMessageWithIconAndWaitForContinue,
} from "/base/browser/popup/popup_menu_building.mjs";

var requestsTracker = {
  requestStates: [],
  expectedResponseCount: 0,
  receivedResponseCount: 0,
  failureCount: 0,
  callbackFunction: undefined,
  requestFunction: undefined,
  requestFunctionName: "", // used in console error messages
};

function findRequestStateForRequest(request) {
  // find linkedRecord for this url
  let matchingRequestState = undefined;
  for (let requestState of requestsTracker.requestStates) {
    if (requestState.request == request) {
      matchingRequestState = requestState;
      break;
    }
  }
  return matchingRequestState;
}

const maxWaitime = 3200;
const additionalRetryWaitime = 3200;
const additionalManyRecent429sWaitime = 5000;
var requestQueue = [];
var queueResponseTracker = {
  totalSuccess: 0,
  total429: 0,
  totalOtherError: 0,
  num429SinceSuccess: 0,
  waitBetweenRequests: 200,
  abortRequests: false,
  lastFewResponses: [],
};

function clearRequestQueue() {
  requestQueue = [];
}

function updateQueueTimingForResponse(response) {
  let responseArray = queueResponseTracker.lastFewResponses;
  if (responseArray.length >= 5) {
    responseArray.shift();
  }
  responseArray.push(response);

  if (response.success) {
    queueResponseTracker.totalSuccess++;
    queueResponseTracker.num429SinceSuccess = 0;
  } else {
    if (response.statusCode == 429) {
      queueResponseTracker.total429++;
      queueResponseTracker.num429SinceSuccess++;
      if (queueResponseTracker.num429SinceSuccess > 5) {
        queueResponseTracker.abortRequests = true;
      }

      if (queueResponseTracker.waitBetweenRequests < maxWaitime) {
        queueResponseTracker.waitBetweenRequests *= 2;
      }
    } else {
      queueResponseTracker.totalOtherError++;
    }
  }
}

async function monitorRequestQueue(doRequest, resolve) {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // if initial queue length is more than a certain amount
  // then increase the sleep time to try to avoid triggering the
  // error 429 "Too many requests".
  if (requestQueue.length) {
    queueResponseTracker.waitBetweenRequests *= 4;
  }

  while (requestsTracker.receivedResponseCount != requestsTracker.expectedResponseCount) {
    if (requestQueue.length > 0) {
      let nextRequest = requestQueue.shift();

      let matchingRequestState = findRequestStateForRequest(nextRequest);
      //console.log("matchingRequestState is:");
      //console.log(matchingRequestState);

      // if this request has had several retries already and the lastst one was a 429
      // then wait an additional time befor queueing it
      if (matchingRequestState.retryCount > 1 && matchingRequestState.statusCode == 429) {
        matchingRequestState.status = "waiting...";
        displayStatusMessage(resolve);
        await sleep(additionalRetryWaitime);
      }

      // if we have had several 429s in the last few responses then wait a bit extra
      let responseArray = queueResponseTracker.lastFewResponses;
      let numRecent429s = 0;
      for (let prevResponse of responseArray) {
        if (prevResponse.statusCode == 429) {
          numRecent429s++;
        }
      }
      //console.log("responseArray.length = " + responseArray.length + ", numRecent429s = " + numRecent429s);
      if (numRecent429s >= 3) {
        matchingRequestState.status = "waiting...";
        displayStatusMessage(resolve);
        await sleep(additionalManyRecent429sWaitime);
      }

      doRequest(nextRequest);
    }

    await sleep(queueResponseTracker.waitBetweenRequests);
    if (queueResponseTracker.abortRequests) {
      break;
    }
  }
}

function resetStaticCounts() {
  requestsTracker.expectedResponseCount = 0;
  requestsTracker.receivedResponseCount = 0;
  requestsTracker.failureCount = 0;
}

function displayStatusMessage(resolve) {
  const baseMessage = "WikiTree Sourcer fetching additional records ...\n\n(This might take several seconds)...\n";

  let message2 = "";
  for (let requestState of requestsTracker.requestStates) {
    message2 += "\n'" + requestState.request.name + "' " + requestState.status;
  }

  displayBusyMessageWithSkipButton(baseMessage, message2, function () {
    queueResponseTracker.skippedByUser = true;
    queueResponseTracker.abortRequests = true;
    terminateParallelRequests(resolve);
  });
}

async function parallelRequestsDisplayErrorsMessage(actionName) {
  let baseMessage = "During " + actionName + " some linked records could not be retreived.";
  if (queueResponseTracker.skippedByUser) {
    baseMessage += "\nThe server responded with 'Too many requests' (error 429).";
  } else if (queueResponseTracker.abortRequests) {
    baseMessage += "\nThe server responded with 'Too many requests' (error 429).";
  } else {
    baseMessage += "\nThis could be due to internet connectivity issues or server issues.";
  }
  baseMessage += "\nPress continue to use what could be retreived.\n";

  let message2 = "";
  for (let requestState of requestsTracker.requestStates) {
    message2 += "\n'" + requestState.request.name + "' " + requestState.status;
  }
  await displayMessageWithIconAndWaitForContinue("warning", baseMessage, message2);
}

function updateStatusForRequest(request, status, resolve) {
  let matchingRequestState = findRequestStateForRequest(request);

  if (matchingRequestState) {
    matchingRequestState.status = status;
    displayStatusMessage(resolve);
  }
}

function terminateParallelRequests(resolve) {
  // if there were any failures then remember that for caller
  let callbackInput = { failureCount: requestsTracker.failureCount, responses: [] };
  for (let requestState of requestsTracker.requestStates) {
    callbackInput.responses.push(requestState.response);
  }
  resetStaticCounts();

  //console.log("About to call resolve in handleRequestResponse");
  resolve(callbackInput);
}

function handleRequestResponse(request, response, doRequest, resolve) {
  //console.log("received response in parallel_requests handleRequestResponse:");
  //console.log(response);
  //console.log(request);

  if (queueResponseTracker.abortRequests) {
    return;
  }

  let matchingRequestState = findRequestStateForRequest(request);

  //console.log("in parallel_requests handleRequestResponse, matchingRequestState is:");
  //console.log(matchingRequestState);

  if (response.success) {
    if (matchingRequestState) {
      matchingRequestState.status = "completed";
      matchingRequestState.response = response;
    }
    requestsTracker.receivedResponseCount++;
  } else {
    //console.log("handleRequestResponse: Failed response, request name is: " + request.name);
    //console.log("handleRequestResponse: matchingRequestState is:");
    //console.log(matchingRequestState);

    // see if we can retry
    if (response.allowRetry && matchingRequestState.retryCount < 4) {
      //console.log("doing a retry");
      requestQueue.push(matchingRequestState.request);
      matchingRequestState.status = "retry";
      matchingRequestState.retryCount++;
      matchingRequestState.status = "retry " + matchingRequestState.retryCount;
      if (response.statusCode) {
        matchingRequestState.status += " (error " + response.statusCode + ")";
        matchingRequestState.statusCode = response.statusCode;
      }
    } else {
      //console.log("handleRequestResponse: setting status to failed");
      matchingRequestState.status = "failed";
      if (response.statusCode) {
        matchingRequestState.status += " (error " + response.statusCode + ")";
        matchingRequestState.statusCode = response.statusCode;
      }
      requestsTracker.failureCount++;
      requestsTracker.receivedResponseCount++;
    }
  }

  displayStatusMessage(resolve);

  updateQueueTimingForResponse(response);
  if (queueResponseTracker.abortRequests) {
    // aborting, for every requestState that is not "failed" or "completed"
    // add one to failureCount
    for (let requestState of requestsTracker.requestStates) {
      let status = requestState.status;
      if (status != "failed" && status != "completed") {
        requestsTracker.failureCount++;
      }
    }
  }

  if (
    requestsTracker.receivedResponseCount == requestsTracker.expectedResponseCount ||
    queueResponseTracker.abortRequests
  ) {
    terminateParallelRequests(resolve);
  }
}

// This function does a series of asynchronous requests in parallel and returns
// when they are all completed. It is passed an array of request objects and an
// async function to call for each request
function doRequestsInParallel(requests, requestFunction, timeBetweenRequests = 1) {
  // requests is an array of objects, each has the following fields
  //   name : a name that can be used in the status display
  //   input : data to be passed to the request function (varies by site/action)
  // requestFunction is an async function that performs the request and returns a response
  //   Two parameters are passed to requestFunction:
  //      input: the input fields of the request
  //      statusUpdateFunction: a function taking a single string parameter
  //   The response object must have a property "success" that is true or false.
  // return value is a Promise. The resolve object has the following properties
  //   failureCount
  //   responses: array of response objects

  if (requests.length == 0) {
    let callbackInput = { failureCount: 0, responses: [] };
    return callbackInput;
  }

  if (timeBetweenRequests > 0) {
    queueResponseTracker.waitBetweenRequests = timeBetweenRequests;
  }

  resetStaticCounts();
  requestsTracker.expectedResponseCount = requests.length;

  requestsTracker.requestStates = [];
  for (let request of requests) {
    let requestState = {
      request: request,
      status: "queued...",
      retryCount: 0,
    };
    requestsTracker.requestStates.push(requestState);
  }

  return new Promise((resolve) => {
    async function doRequest(request) {
      try {
        let response = await requestFunction(request.input, function (status) {
          updateStatusForRequest(request, status, resolve);
        });
        handleRequestResponse(request, response, doRequest, resolve);
      } catch (error) {
        let response = { success: false, error: error };
        handleRequestResponse(request, response, doRequest, resolve);
      }
    }

    clearRequestQueue();
    for (let request of requests) {
      requestQueue.push(request);
    }

    displayStatusMessage(resolve);

    monitorRequestQueue(doRequest, resolve);
  });
}

export { doRequestsInParallel, parallelRequestsDisplayErrorsMessage };
