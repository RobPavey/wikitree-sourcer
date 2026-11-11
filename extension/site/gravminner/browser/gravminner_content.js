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

// Gravminner uses an Angular form rather than URL search parameters.
function isGravminnerSearchUrl(value) {
  try {
    const url = new URL(value);
    return (
      /^https?:$/.test(url.protocol) &&
      /^(www\.)?slektogdata\.no$/.test(url.hostname) &&
      /^\/gravminner\/finn-en-grav\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function runGravminnerSearch(fieldData) {
  let state = "form";
  let deadline = Date.now() + 30000;
  let form;
  let internalSubmit = false;
  let unhandledSubmit = false;
  let preparedAt = 0;
  let writing = false;
  let checking = false;
  let geographyAttempted = false;
  let geographyChangedAt = 0;
  let previousResponse = "";
  let observer;
  let timer;
  let banner;
  const firstFields = [
    "firstName",
    "surname",
    "maidenName",
    "bornFromYear",
    "bornToYear",
    "deathFromYear",
    "deathToYear",
  ];
  const inputSelector = (key) => 'input[formcontrolname="' + key + '"]';

  function showMessage(text) {
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "sourcer-gravminner-search";
      banner.setAttribute("role", "status");
      banner.style.cssText = "padding:12px;margin:12px 0;border:1px solid #426b86;background:#f2f7fa;color:#182c39";
      const message = document.createElement("span");
      banner.appendChild(message);
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.textContent = "Stop automatic search";
      cancel.style.marginLeft = "12px";
      cancel.addEventListener("click", cancelSearch);
      banner.appendChild(cancel);
      const container = form || document.querySelector("ng-component") || document.body;
      container.prepend(banner);
    }
    if (banner.firstChild.textContent !== text) banner.firstChild.textContent = text;
  }

  function finish(message) {
    if (state === "done") return;
    state = "done";
    if (observer) observer.disconnect();
    clearInterval(timer);
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("change", onInput, true);
    document.removeEventListener("submit", onSubmit, true);
    document.removeEventListener("submit", preventUnboundSubmit);
    window.removeEventListener("pagehide", onLeave);
    window.removeEventListener("popstate", check);
    if (banner) {
      const button = banner.querySelector("button");
      button.removeEventListener("click", cancelSearch);
      button.remove();
      if (message) banner.firstChild.textContent = message;
      else banner.remove();
    }
  }

  function cancelSearch() {
    finish("Automatic search stopped. You can edit the form and search normally.");
  }
  function onLeave() {
    finish();
  }
  function onSubmit(event) {
    if (event.target === form && !internalSubmit) finish();
  }
  // Angular prevents the native form navigation when its ngSubmit handler is attached.
  // Firefox can expose the server-rendered form before those handlers exist.
  function preventUnboundSubmit(event) {
    if (event.target === form && internalSubmit && !event.defaultPrevented) {
      event.preventDefault();
      unhandledSubmit = true;
    }
  }
  function onInput(event) {
    if (writing || state === "done") return;
    const target = event.target;
    if (!target.closest || !target.closest("form")) return;
    if (state === "geography" && target.matches("select.select")) {
      // Angular may temporarily remove dependent selects while options load.
      geographyChangedAt = Date.now();
    } else {
      finish("Automatic search stopped because you edited the form. Press Søk when ready.");
    }
  }

  function submit() {
    const button = form.querySelector('button[type="submit"]');
    if (!button || button.disabled || !form.checkValidity()) {
      finish("The search form is not ready. Check its fields and press Søk when ready.");
      return;
    }
    state = "results";
    unhandledSubmit = false;
    internalSubmit = true;
    try {
      button.click();
    } finally {
      internalSubmit = false;
    }
    if (unhandledSubmit) {
      state = "prepare";
      preparedAt = Date.now();
    } else {
      deadline = Date.now() + 30000;
    }
  }

  function fill() {
    // Clear only search text/year/date filters. Leave the site's geography defaults alone.
    writing = true;
    try {
      for (const input of form.querySelectorAll("input[formcontrolname]")) {
        const key = input.getAttribute("formcontrolname");
        if (input.type === "text" || input.type === "number") {
          input.value = firstFields.includes(key) && fieldData[key] !== undefined ? String(fieldData[key]) : "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (input.type === "checkbox" && key === "exactMatch") {
          input.checked = false;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    } finally {
      writing = false;
    }
  }

  function check() {
    if (state === "done" || checking) return;
    checking = true;
    try {
      if (!isGravminnerSearchUrl(document.URL)) {
        finish();
        return;
      }
      if (state !== "geography" && Date.now() >= deadline) {
        showMessage("The search page did not become ready in time. You can search normally using the form.");
        finish("The search page did not become ready in time. You can search normally using the form.");
        return;
      }
      if (state === "form") {
        form = document.querySelector(inputSelector("firstName"))?.closest("form");
        if (
          !form ||
          !firstFields.every((key) => form.querySelector(inputSelector(key))) ||
          !form.querySelector('input[formcontrolname="exactMatch"]') ||
          !form.querySelector('button[type="submit"]')
        )
          return;
        if (!fieldData.firstName && !fieldData.surname) {
          showMessage("No person name was available. Enter a name and search normally.");
          finish("No person name was available. Enter a name and search normally.");
          return;
        }
        showMessage("WikiTree Sourcer is preparing your Gravminner search…");
        fill();
        preparedAt = Date.now();
        state = "prepare";
      } else if (state === "prepare") {
        const currentForm = document.querySelector(inputSelector("firstName"))?.closest("form");
        const retained =
          currentForm === form &&
          firstFields.every((key) => form.querySelector(inputSelector(key))?.value === String(fieldData[key] ?? ""));
        if (!retained) {
          // Client bootstrap replaced/reset the server-rendered form. No handled search has run yet.
          if (banner) banner.remove();
          banner = undefined;
          form = undefined;
          state = "form";
          return;
        }
        if (Date.now() - preparedAt >= 1000) submit();
      } else if (state === "results") {
        if (document.querySelector("#search-title")) {
          finish();
          return;
        }
        const scope = form.closest("ng-component") || document;
        const message = Array.from(scope.querySelectorAll("h3, [role=alert], .alert, .error"))
          .filter((node) => !banner?.contains(node))
          .map((node) => node.textContent.trim())
          .filter(Boolean)
          .join(" ");
        if (/^Fant ingen graver\b/i.test(message)) {
          finish();
          return;
        }
        if (message === previousResponse) return;
        if (/fylke/i.test(message) && /kommune/i.test(message) && /velge|velg|kreves/i.test(message)) {
          if (geographyAttempted) {
            finish("Gravminner still requires more information. Check the form and press Søk when ready.");
            return;
          }
          previousResponse = message;
          state = "geography";
          showMessage(
            "Choose the county and municipality to search in. Sourcer will search automatically when the choices have loaded."
          );
        } else if (message) {
          finish("Gravminner returned a message. Check it below and search manually if needed.");
        }
      } else if (state === "geography") {
        const selects = Array.from(form.querySelectorAll("select.select"));
        const ready =
          selects.length === 4 &&
          selects
            .slice(0, 3)
            .every(
              (select) =>
                !select.disabled &&
                select.value &&
                select.value !== "0" &&
                Array.from(select.options).some((option) => option.value === select.value && !option.disabled)
            );
        if (ready && Date.now() - geographyChangedAt >= 300 && !form.querySelector(".select-wrapper img")) {
          geographyAttempted = true;
          showMessage("WikiTree Sourcer is searching Gravminner…");
          submit();
        }
      }
    } catch (error) {
      showMessage("Sourcer could not complete the search. You can use the Gravminner form normally.");
      finish("Sourcer could not complete the search. You can use the Gravminner form normally.");
      console.warn("Gravminner search stopped:", error);
    } finally {
      checking = false;
    }
  }

  document.addEventListener("input", onInput, true);
  document.addEventListener("change", onInput, true);
  document.addEventListener("submit", onSubmit, true);
  document.addEventListener("submit", preventUnboundSubmit);
  window.addEventListener("pagehide", onLeave);
  window.addEventListener("popstate", check);
  observer = new MutationObserver(check);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  timer = setInterval(check, 250);
  check();
}

async function checkForGravminnerSearch() {
  if (!isGravminnerSearchUrl(document.URL) || document.referrer) return;
  try {
    const stored = await chrome.storage.local.get("searchData");
    const searchData = stored.searchData;
    if (!searchData || !isGravminnerSearchUrl(searchData.url)) return;
    const age = Date.now() - searchData.timeStamp;
    if (!Number.isFinite(age) || age < 0 || age >= 50000) return;
    // Only the target search page claims this request; other sites' payloads stay untouched.
    await chrome.storage.local.remove("searchData");
    runGravminnerSearch(searchData.fieldData || {});
  } catch (error) {
    console.warn("Could not start Gravminner search:", error);
  }
}

siteContentInit("gravminner");
checkForGravminnerSearch();
