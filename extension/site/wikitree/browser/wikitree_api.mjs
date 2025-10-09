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

const appId = "Sourcer";

function wtApiCall(body) {
  body.set("appId", appId);

  //console.log("wtApiCall: body is:");
  //console.log(body);

  return new Promise((resolve, reject) => {
    fetch("https://api.wikitree.com/api.php", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body,
    })
      .then(async (response) => {
        if (response.status !== 200) {
          console.log("Looks like there was a problem. Status Code: " + response.status);
          return;
        }
        const data = await response.json();
        //console.log(data);

        resolve(data);
      })
      .catch((error) => {
        console.log("Fetch Error:", error);
        reject(error);
      });
  });
}

function wtApiGetPerson(id, fields) {
  const body = new URLSearchParams({
    action: "getPerson",
    key: id,
    fields: fields,
  });

  return wtApiCall(body);
}

function wtApiGetPeople(ids, fields) {
  const body = new URLSearchParams({
    action: "getPeople",
    keys: ids,
    fields: fields,
  });

  return wtApiCall(body);
}

function wtApiGetRelatives(ids, fields, getParents, getChildren, getSiblings, getSpouses) {
  const body = new URLSearchParams({
    action: "getRelatives",
    keys: ids,
    fields: fields,
    getParents: getParents,
    getChildren: getChildren,
    getSiblings: getSiblings,
    getSpouses: getSpouses,
  });

  return wtApiCall(body);
}

function wtApiGetBio(id) {
  const body = new URLSearchParams({
    action: "getBio",
    key: id,
  });

  return wtApiCall(body);
}

export { wtApiGetPerson, wtApiGetPeople, wtApiGetRelatives, wtApiGetBio };
