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

const fastQueueOptions = {
  maxConcurrency: 4,
  initialWaitBetweenRequests: 100,
  maxWaitime: 10000,
  additionalRetryWaitime: 10000,
  additionalManyRecent429sWaitime: 50000,
  slowDownFromStartCount: 7,
  slowDownFromStartMult: 5,
};

const mediumQueueOptions = {
  maxConcurrency: 2,
  initialWaitBetweenRequests: 150,
  maxWaitime: 10000,
  additionalRetryWaitime: 10000,
  additionalManyRecent429sWaitime: 50000,
  slowDownFromStartCount: 7,
  slowDownFromStartMult: 5,
};

const slowQueueOptions = {
  maxConcurrency: 1,
  initialWaitBetweenRequests: 200,
  maxWaitime: 10000,
  additionalRetryWaitime: 10000,
  additionalManyRecent429sWaitime: 50000,
  slowDownFromStartCount: 7,
  slowDownFromStartMult: 5,
};

const queueOptionsByType = {
  linked: {
    fast: fastQueueOptions,
    medium: mediumQueueOptions,
    slow: slowQueueOptions,
  },
  sources: {
    fast: fastQueueOptions,
    medium: mediumQueueOptions,
    slow: slowQueueOptions,
  },
  sharing: {
    fast: fastQueueOptions,
    medium: mediumQueueOptions,
    slow: slowQueueOptions,
  },
};

function getQueueOptions(options, type) {
  let option = options.buildAll_ancestry_fetchSpeed;
  let typeOptionTable = queueOptionsByType[type];
  if (typeOptionTable) {
    let queueOptions = typeOptionTable[option];
    if (queueOptions) {
      return queueOptions;
    }
  }
  console.error(`getQueueOptions: bad option (${option}) or type (${type})`);
  return null;
}

export { getQueueOptions };
