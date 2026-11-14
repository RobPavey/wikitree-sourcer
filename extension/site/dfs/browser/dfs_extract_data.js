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

/* Danish Family Search: read published transcriptions, never the indexing forms. */
function extractData(document, url) {
  const result = { success: false, url };
  let address;
  try {
    address = new URL(url);
  } catch {
    return result;
  }
  if (!/^https?:$/.test(address.protocol) || !/^(www\.)?danishfamilysearch\.(dk|com)$/i.test(address.hostname))
    return result;
  const clean = (node) => (node ? node.textContent.replace(/\s+/g, " ").trim() : "");
  const find = (suffix, root = document) => root.querySelector('[id$="' + suffix + '"]');
  const text = (suffix, root) => clean(find(suffix, root));
  const login = find("header_hyp_userinfo");
  if (
    !login ||
    !/\/user\/?(?:$|[?#])/.test(login.getAttribute("href") || "") ||
    document.querySelector('input[type="password"]')
  ) {
    result.overrideFailureMessage = "Sign in to Danish Family Search, then retry the Sourcer action.";
    return result;
  }
  const detail = /^\/(cid|kbid)(\d+)\/?$/.exec(address.pathname);
  const image =
    /\/opslag\d+\/?$/.test(address.pathname) &&
    /\/(churchbook|churchlisting\d+|census|census\d+|skole\d+|source\d+|laegdsruller)\//.test(address.pathname);
  if (!detail && !image) {
    result.overrideFailureMessage = "Open a Danish Family Search transcription or register image.";
    return result;
  }
  result.url = address.origin + address.pathname;
  // Only leaf label/value rows; nested tables contain other participants and household members.
  function fields(root) {
    const values = {};
    if (!root) return values;
    for (const row of root.querySelectorAll("tr")) {
      if (row.querySelector("table") || row.closest('[id*="gridhusstand"], [id*="griddata"]')) continue;
      const cells = Array.from(row.children).filter((e) => /^(TD|TH)$/.test(e.tagName));
      if (cells.length !== 2 || cells.some((c) => c.querySelector("input, select, textarea, button"))) continue;
      const key = clean(cells[0]);
      if (key && !Object.prototype.hasOwnProperty.call(values, key)) values[key] = clean(cells[1]);
    }
    return values;
  }
  function gridRows(table) {
    if (!table) return [];
    const rows = Array.from(table.rows);
    const header = rows.find((r) => r.querySelector("th")) || rows[0];
    const headings = Array.from(header?.cells || []).map(clean);
    return rows
      .filter((r) => r !== header && r.id && /__\d+$/.test(r.id))
      .map((row) => {
        const data = {};
        Array.from(row.cells).forEach((cell, i) => {
          if (headings[i]) data[headings[i]] = clean(cell);
        });
        const link = row.querySelector("a[href]");
        const href = link?.getAttribute("href") || "";
        data.id =
          /viewTextinfo\(\d+,\s*(\d+)/.exec(href)?.[1] || /\/(?:cid|kbid|person)(\d+)/.exec(href)?.[1] || row.id;
        if (/^\//.test(href)) data.url = new URL(href, result.url).href;
        return data;
      });
  }
  if (detail) {
    const census = detail[1] === "cid";
    const prefix = census ? "census_showdetails" : "churchbook_showdetails";
    const root = find(prefix + "_radpage1");
    if (!root) return result;
    const primary = census ? root : find("churchbookdetails_table_mainperson", root);
    result.fields = fields(primary || find("churchbookdetails_table_personinfo", root));
    result.fullName = census ? text("censusdetails_hyp_name", root) : text("churchbookdetails_hyp_mainname", root);
    result.fullName ||= result.fields.Navn;
    result.recordId = detail[1] + detail[2];
    result.group = census ? "census" : "churchbook";
    result.entryType = census ? "Folketælling" : text("churchbookdetails_lbl_entrytype", root);
    result.eventDate = census ? text("censusdetails_lbl_censusyear", root) : text("churchbookdetails_lbl_date", root);
    result.entryNumber = text(census ? "censusdetails_lbl_recordno" : "churchbookdetails_lbl_sourceno", root);
    result.sourceReference = text(
      census ? "censusdetails_lbl_sourcereference" : "churchbookdetails_lbl_sourcereference",
      root
    );
    result.provenance = text(census ? "censusdetails_lbl_kipinfo" : "churchbookdetails_lbl_kipinfo", root);
    result.remarks = text(census ? "censusdetails_lbl_comments" : "churchbookdetails_lbl_comments", root);
    const stem = census ? "censusdetails" : "churchbookdetails";
    result.locality = ["placename", "areaname", "regionname", "territoryname"]
      .map((k) => text(stem + "_lbl_" + k, root))
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .join(", ");
    result.sourceTitle = census ? "Folketælling " + result.eventDate : text(prefix + "_hyp_source");
    result.imageReference = text(prefix + "_hyp_sourceopslag");
    result.imagePageUrl = find(prefix + "_hyp_sourceopslag")?.href;
    result.fatherFullName = text("churchbookdetails_hyp_fathername", root);
    result.motherFullName = text("churchbookdetails_hyp_mothername", root);
    result.spouseFullName = text("churchbookdetails_hyp_spousename", root);
    result.household = gridRows(root.querySelector('table[id*="gridhusstand"]'));
    if (
      census &&
      result.household.length &&
      !result.household.some((p) => p.id === detail[2] && p.Navn === result.fullName)
    ) {
      result.overrideFailureMessage = "Wait for the selected census record to finish loading, then reopen Sourcer.";
      return result;
    }
    result.success = Boolean(result.fullName && result.eventDate && result.entryType);
    return result;
  }
  const table = document.querySelector('table[id*="opslagshow"][id$="griddata_ctl00"]');
  const imageLink = find("hyp_imagepath");
  const imageChoice = find("cmb_opslag_Input");
  if (!imageLink || !imageChoice) return result;
  result.sourceTitle = text("hyp_protokol") || text("hyp_level5") || text("hyp_level4");
  // A final breadcrumb can be the image rather than the register.
  if (/^Opslag/i.test(result.sourceTitle)) result.sourceTitle = text("hyp_level4");
  result.imageReference = imageChoice.value;
  const displayedImage = /\/opslag(\d+)/.exec(
    find("hyp_opslag")?.getAttribute("href") || find("hyp_level5")?.getAttribute("href") || ""
  );
  if (displayedImage && !address.pathname.endsWith("opslag" + displayedImage[1])) return result;
  result.imageUrl = imageLink.href;
  result.entries = gridRows(table);
  result.indexSignature = JSON.stringify([address.pathname, result.imageReference, result.entries]);
  result.entryType = find("cmb_opslagstype_Input")?.value || "";
  result.group = /laegdsruller/.test(address.pathname)
    ? "laegsruller"
    : /Skoleprotokol/i.test(result.sourceTitle + result.entryType)
    ? "skoleprotokol"
    : /churchbook|churchlisting/.test(address.pathname)
    ? "churchbook"
    : /census/.test(address.pathname)
    ? "census"
    : "other";
  result.locality = ["hyp_level2", "hyp_level1", "hyp_amt"]
    .map((s) => text(s).replace(/ sogn$/i, ""))
    .filter(Boolean)
    .join(", ");
  result.district = text("hyp_udskrivningskreds");
  result.levyNumber = find("txt_laegdnr")?.value || "";
  const selector = document.getElementById("sourcer-dfs-person");
  const selected =
    selector?.dataset.indexSignature === result.indexSignature
      ? result.entries.find((e) => e.id === selector.value)
      : undefined;
  result.imageOnly = !selected;
  if (selected) {
    result.fields = selected;
    result.fullName = selected.Navn;
    result.eventDate = selected.Dato;
    result.recordId = selected.id;
    result.entryNumber = selected["Løbenr."] || selected["Løbe nr."];
  }
  result.success = Boolean(result.sourceTitle && result.imageReference);
  return result;
}
