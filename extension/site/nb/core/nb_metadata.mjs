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

import { cleanText } from "./nb_notice_types.mjs";

function normalizeIdentifier(value) {
  if (typeof value !== "string") return "";
  if (/^[a-f0-9]{32}$/i.test(value)) return value.toLowerCase();
  if (/^URN:NBN:no-nb_[a-z0-9_-]+$/i.test(value)) return value.replace(/^urn:nbn:no-nb_/i, "URN:NBN:no-nb_");
  return "";
}
function canonicalNbUrl(record) {
  const urn = normalizeIdentifier(record.urn);
  const itemId = urn.startsWith("URN:") ? urn : normalizeIdentifier(record.itemId);
  return "https://www.nb.no/items/" + itemId + "?page=" + record.pageIndex;
}
function sameSelection(selection, record) {
  const identifier = normalizeIdentifier(selection.itemId);
  return Boolean(
    selection.success &&
      identifier &&
      selection.pageIndex === record.pageIndex &&
      [record.itemId, record.urn].some((value) => normalizeIdentifier(value) === identifier)
  );
}
function normalizeMetadata(selection, item, manifest) {
  const identifiers = item?.metadata?.identifiers || {};
  const aliases = [item?.id, identifiers.sesamId, identifiers.urn].map(normalizeIdentifier).filter(Boolean);
  if (
    !selection.success ||
    !item ||
    !normalizeIdentifier(item.id) ||
    !aliases.includes(normalizeIdentifier(selection.itemId))
  )
    throw new Error("NB returned metadata for a different item. Reopen Sourcer on the intended page.");
  if (item.accessInfo?.isDigital === false)
    throw new Error("Open a digitized NB newspaper or book in the viewer to cite an image location.");
  const metadata = item.metadata || {};
  const media = metadata.mediaTypes || [];
  const materialType = media.includes("aviser") ? "newspaper" : media.includes("bøker") ? "book" : "";
  if (!materialType) throw new Error("NB citation assistance currently supports newspapers and books only.");
  if (!cleanText(metadata.title)) throw new Error("NB has not supplied a publication title. Please try again later.");
  const origin = metadata.originInfo || {};
  const canvases = manifest?.sequences?.[0]?.canvases || [];
  if (canvases.length && selection.pageIndex >= canvases.length)
    throw new Error("This viewer image is outside the publication. Open a valid page and reopen Sourcer.");
  const people = Array.isArray(metadata.people) ? metadata.people : [];
  const creators = people
    .filter((person) => (person.roles || []).some((role) => ["aut", "cre", "edt"].includes(role.name)))
    .map((person) => ({
      name: cleanText(person.name),
      editor: (person.roles || []).some((role) => role.name === "edt"),
    }))
    .filter((person) => person.name);
  const itemId = normalizeIdentifier(identifiers.sesamId) || normalizeIdentifier(item.id);
  const urn =
    normalizeIdentifier(identifiers.urn) ||
    (normalizeIdentifier(selection.itemId).startsWith("URN:") ? normalizeIdentifier(selection.itemId) : "");
  return {
    ...selection,
    itemId,
    url: canonicalNbUrl({ itemId, urn, pageIndex: selection.pageIndex }),
    materialType,
    title: cleanText(metadata.title),
    publicationDate: cleanText(origin.issuedUntouched || origin.issued),
    publisher: cleanText(origin.publisher),
    publicationPlace: cleanText(metadata.geographic?.city),
    edition: cleanText(origin.edition),
    urn,
    creators,
    pageCount: canvases.length || metadata.pageCount || 0,
    canvasLabel: cleanText(canvases[selection.pageIndex]?.label),
    manifestAvailable: Boolean(canvases.length),
  };
}
async function loadNbMetadata(selection, fetchJson, getCurrentSelection) {
  if (!selection.success) throw new Error(selection.overrideFailureMessage || "Open an NB newspaper or book viewer.");
  const base = "https://api.nb.no/catalog/v1/";
  const item = await fetchJson(base + "items/" + selection.itemId);
  let manifest;
  try {
    manifest = await fetchJson(base + "iiif/" + selection.itemId + "/manifest");
  } catch {
    /* Bibliography and exact viewer link still work without a manifest. */
  }
  const record = normalizeMetadata(selection, item, manifest);
  const current = await getCurrentSelection();
  if (!sameSelection(current, record))
    throw new Error("The NB item or page changed while loading. Reopen Sourcer to cite the current page.");
  return record;
}
function selectionFromUrl(url) {
  try {
    const address = new URL(url);
    const match = /^\/items\/([a-f0-9]{32}|URN:NBN:no-nb_[a-z0-9_-]+)\/?$/i.exec(decodeURIComponent(address.pathname));
    const rawPage = address.searchParams.get("page");
    const page = rawPage === null ? "0" : rawPage;
    if (
      !/^https?:$/.test(address.protocol) ||
      !/^(www\.)?nb\.no$/i.test(address.hostname) ||
      !match ||
      !/^\d+$/.test(page) ||
      !Number.isSafeInteger(Number(page))
    )
      return { success: false };
    return { success: true, itemId: normalizeIdentifier(match[1]), pageIndex: Number(page) };
  } catch {
    return { success: false };
  }
}
export { normalizeMetadata, loadNbMetadata, selectionFromUrl, canonicalNbUrl, sameSelection };
