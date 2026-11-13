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

/* Runs in the isolated content-script world. No credentials or site editing APIs. */
function dfsSearchUrl(value) {
  try {
    const u = new URL(value);
    return (
      /^https?:$/.test(u.protocol) &&
      /^(www\.)?danishfamilysearch\.(dk|com)$/.test(u.hostname) &&
      /^\/search\/?$/.test(u.pathname)
    );
  } catch {
    return false;
  }
}
function dfsMessage(message) {
  let banner = document.getElementById("sourcer-dfs-message");
  if (!banner) {
    banner = document.createElement("p");
    banner.id = "sourcer-dfs-message";
    banner.setAttribute("role", "status");
    (document.querySelector('[id$="pnl_search"]') || document.body).prepend(banner);
  }
  if (banner.textContent !== message) banner.textContent = message;
}
function updateDfsPersonSelector() {
  const ed = extractData(document, document.URL);
  let selector = document.getElementById("sourcer-dfs-person");
  if (!ed.success || !ed.entries?.length) {
    if (selector) selector.parentElement.remove();
    return;
  }
  if (selector && selector.dataset.indexSignature === ed.indexSignature) return;
  if (selector) selector.parentElement.remove();
  const label = document.createElement("label");
  label.id = "sourcer-dfs-person-label";
  label.textContent = "WikiTree Sourcer person: ";
  selector = document.createElement("select");
  selector.id = "sourcer-dfs-person";
  selector.dataset.indexSignature = ed.indexSignature;
  const add = (value, text) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    selector.appendChild(option);
  };
  add("", "Image citation only — select a person for record actions");
  ed.entries.forEach((p, index) =>
    add(p.id, [index + 1 + ".", p.Navn, p.Dato, p.Alder && "age " + p.Alder].filter(Boolean).join(" "))
  );
  label.appendChild(selector);
  document.querySelector('table[id*="opslagshow"][id$="griddata_ctl00"]').before(label);
}

var dfsSearchBusy = false;
var dfsAwaitingReset;
async function checkForDfsSearch() {
  if (dfsSearchBusy) return;
  if (dfsAwaitingReset?.isConnected) return;
  dfsAwaitingReset = undefined;
  dfsSearchBusy = true;
  try {
    const stored = (await chrome.storage.local.get("searchData")).searchData;
    if (!stored || !dfsSearchUrl(stored.url)) return;
    const age = Date.now() - stored.timeStamp;
    if (!Number.isFinite(age) || age < 0 || age >= 60000) return;
    if (stored.refineData?.dfsLoginBlocked) return;
    const user = document.querySelector('[id$="header_hyp_userinfo"]');
    if (
      !user ||
      !/\/user\/?(?:$|[?#])/.test(user.getAttribute("href") || "") ||
      document.querySelector('input[type="password"]')
    ) {
      await chrome.storage.local.set({
        searchData: { ...stored, refineData: { ...stored.refineData, dfsLoginBlocked: true } },
      });
      dfsMessage("Sign in to Danish Family Search, then retry the Sourcer action.");
      return;
    }
    if (!dfsSearchUrl(document.URL)) return;
    const button = document.querySelector('[id$="btn_search"]');
    if (!button) {
      // This site remembers the result page even when opening /search/ anew.
      const refine = document.querySelector('[id$="btn_refinesearch"]');
      if (refine && !stored.refineData?.dfsOpenedForm) {
        await chrome.storage.local.set({
          searchData: { ...stored, refineData: { ...stored.refineData, dfsOpenedForm: true } },
        });
        refine.click();
      }
      return;
    }
    // Use the site's reset postback to clear Telerik geographic/sex/occupation state,
    // rather than editing its hidden ClientState or ASP.NET fields.
    if (!stored.refineData?.dfsReset) {
      const reset = document.querySelector('[id$="btn_reset"]');
      if (!reset) {
        dfsMessage("Sourcer could not reset this form. Retry the search.");
        return;
      }
      await chrome.storage.local.set({
        searchData: { ...stored, refineData: { ...stored.refineData, dfsReset: true } },
      });
      dfsAwaitingReset = reset;
      reset.click();
      return;
    }
    const fieldData = stored.fieldData || {};
    const defaults = {
      firstname: "",
      lastname: "",
      bornyearfrom: "1500",
      bornyearto: "2000",
      sourceyearfrom: "1500",
      sourceyearto: "2000",
      bornplacename: "",
      placename: "",
      gadenavn: "",
      gadematrikel: "",
    };
    const targets = [];
    for (const [key, fallback] of Object.entries(defaults)) {
      const field = document.querySelector('[id$="_txt_' + key + '"]');
      if (!field) {
        dfsMessage("The search form has changed. Please search manually.");
        return;
      }
      targets.push([field, fieldData[key] ?? fallback]);
    }
    const groups = ["census", "churchbook", "skoleprotokol", "laegsruller"];
    const chosen = stored.selectData?.groups || groups;
    const checkboxes = groups.map((group) => document.querySelector('[id$="_chk_' + group + '"]'));
    if (checkboxes.some((box) => !box) || !chosen.length || chosen.some((group) => !groups.includes(group))) {
      dfsMessage("The record group controls have changed. Please search manually.");
      return;
    }
    // Claim before modifying the form or submitting. Subsequent page loads cannot replay it.
    const latest = (await chrome.storage.local.get("searchData")).searchData;
    if (JSON.stringify(latest) !== JSON.stringify(stored)) return;
    await chrome.storage.local.remove("searchData");
    for (const [field, value] of targets) {
      field.value = String(value);
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    }
    groups.forEach((group, i) => {
      checkboxes[i].checked = chosen.includes(group);
    });
    for (const suffix of ["chk_firstnameprecise", "chk_lastnameprecise"]) {
      const box = document.querySelector('[id$="_' + suffix + '"]');
      if (box) box.checked = false;
    }
    if (stored.selectData?.autoSubmit === false)
      dfsMessage("Search fields filled by WikiTree Sourcer. Review them and click Search.");
    else {
      dfsMessage("WikiTree Sourcer is searching Danish Family Search…");
      button.click();
    }
  } catch (error) {
    dfsMessage("Sourcer could not complete the search. Please retry or search manually.");
    console.warn("Danish Family Search:", error);
  } finally {
    dfsSearchBusy = false;
  }
}

siteContentInit("dfs");
updateDfsPersonSelector();
checkForDfsSearch();
// Telerik replaces grids and form panels during asynchronous postbacks.
var dfsUpdateQueued = false;
var dfsObserver = new MutationObserver(() => {
  if (dfsUpdateQueued) return;
  dfsUpdateQueued = true;
  setTimeout(() => {
    dfsUpdateQueued = false;
    updateDfsPersonSelector();
    checkForDfsSearch();
  }, 100);
});
dfsObserver.observe(document.documentElement, { childList: true, subtree: true });
