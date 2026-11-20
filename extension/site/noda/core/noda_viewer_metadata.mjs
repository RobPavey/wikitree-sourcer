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

// Public metadata used by Digitalarkivet's parish viewer. No application state or
// image pixels are needed to identify and cite the selected image.
const viewerOrigin = "https://nye.digitalarkivet.no";
const uuidPattern = "[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}";

function viewerSelectionFromUrl(value) {
  try {
    const url = new URL(value);
    const match = new RegExp("^/source/([1-9]\\d*)/parish/(" + uuidPattern + ")/?$", "i").exec(url.pathname);
    if (url.origin !== viewerOrigin || !match) return { success: false };
    return { success: true, sourceId: match[1], imageUuid: match[2].toLowerCase(), url: url.href };
  } catch {
    return { success: false };
  }
}

function sameViewerSelection(a, b) {
  return Boolean(a?.success && b?.success && a.sourceId === b.sourceId && a.imageUuid === b.imageUuid);
}

function localized(value) {
  if (typeof value === "string") return value;
  for (const language of ["en", "no", "nb", "nn", "none"]) {
    const text = value?.[language];
    if (Array.isArray(text) && text.some((part) => typeof part === "string" && part.trim()))
      return text.filter((part) => typeof part === "string").join("; ");
  }
  return "";
}

function metadataText(value) {
  const document = new DOMParser().parseFromString(value, "text/html");
  document.querySelectorAll("script, style").forEach((element) => element.remove());
  return document.body.textContent;
}

function normalizeViewerMetadata(selection, responses, htmlToText = metadataText) {
  if (!sameViewerSelection(selection, viewerSelectionFromUrl(selection.url)))
    throw new Error("Open an individual Digitalarkivet parish image.");
  const { manifest, fileInfo, pagination } = responses;
  if (fileInfo && fileInfo.uuid?.toLowerCase() !== selection.imageUuid)
    throw new Error("Digitalarkivet returned details for a different image. Reopen Sourcer.");
  if (manifest) {
    const expected = `${viewerOrigin}/api/media-file/image/presentation/manifest/${selection.sourceId}.json`;
    if (
      manifest.id !== expected ||
      !Array.isArray(manifest.items) ||
      !manifest.items.some(
        (canvas) => canvas.id === `${viewerOrigin}/api/media-file/image/presentation/canvas/${selection.imageUuid}.json`
      )
    )
      throw new Error("Digitalarkivet returned a different source or image. Reopen Sourcer.");
  }
  const clean = (value) => {
    const text = localized(value);
    return (/[<&]/.test(text) ? htmlToText(text) : text).replace(/\s+/g, " ").trim();
  };
  const field = (...labels) => {
    const entry = manifest?.metadata?.find((item) =>
      Object.values(item.label || {})
        .flat()
        .some((label) => typeof label === "string" && labels.includes(label.trim().toLowerCase()))
    );
    return clean(entry?.value);
  };
  const page = pagination?.[selection.imageUuid];
  const filters = Array.isArray(page?.filter) ? page.filter : [];
  const sections = [
    ...new Set(
      filters
        .filter((item) => item.field === "list_type")
        .map((item) => {
          const names = {
            dp: "Births and baptisms",
            gr: "Burials",
            vi: "Marriages",
            kr: "Chronological list",
            an: "Administrative and notes pages",
          };
          return names[item.value] || clean(item.label);
        })
        .filter(Boolean)
    ),
  ];
  const years = [
    ...new Set(
      filters
        .filter((item) => ["start_year", "end_year"].includes(item.field))
        .map((item) => String(item.value))
        .filter((value) => /^\d{4}$/.test(value))
    ),
  ].sort();
  const urn = typeof fileInfo?.urnId === "string" && /^[a-z]{2}\d+$/i.test(fileInfo.urnId) ? fileInfo.urnId : "";
  return {
    ...selection,
    pageType: "image",
    lang: "en",
    newViewer: true,
    permanentId: urn,
    imagePageUrl: urn ? `https://goto.digitalarkivet.no/${urn}` : selection.url,
    sourceInformation: clean(manifest?.label),
    fileTitle: clean(fileInfo?.info),
    viewerMetadata: {
      institution: field("conservation institution", "bevaringsinstitusjon"),
      archiveName: field("archive", "arkiv"),
      archiveReference: field("archive reference", "arkivreferanse"),
      protocol: field("protokollnumber", "protocol number", "protokollnummer"),
      period: field("time period", "tidsrom"),
      printedPage: clean(page?.page),
      contents: [sections.join("; "), years.length > 1 ? `${years[0]}–${years.at(-1)}` : years[0]]
        .filter(Boolean)
        .join(", "),
    },
    metadataUnavailable: !manifest && !fileInfo && !pagination,
  };
}

async function loadViewerMetadata(selection, fetchJson, getCurrentSelection, htmlToText) {
  if (!sameViewerSelection(selection, viewerSelectionFromUrl(selection.url)))
    throw new Error("Open an individual Digitalarkivet parish image.");
  const paths = [
    `/api/media-file/image/presentation/manifest/${selection.sourceId}.json`,
    `/api/media-file/viewer/${selection.sourceId}/file-info/${selection.imageUuid}`,
    `/api/media-file/viewer/${selection.sourceId}/pagination`,
  ];
  const results = await Promise.allSettled(paths.map((path) => fetchJson(viewerOrigin + path)));
  const [manifest, fileInfo, pagination] = results.map((result) =>
    result.status === "fulfilled" ? result.value : undefined
  );
  const record = normalizeViewerMetadata(selection, { manifest, fileInfo, pagination }, htmlToText);
  await assertViewerSelection(selection, getCurrentSelection);
  return record;
}

async function assertViewerSelection(selection, getCurrentSelection) {
  if (!sameViewerSelection(selection, await getCurrentSelection()))
    throw new Error("The Digitalarkivet image changed. Reopen Sourcer to cite the current image.");
}

function addViewerSourceReference(ed, builder) {
  const metadata = ed.viewerMetadata;
  const reference = metadata.archiveReference || metadata.archiveName || ed.fileTitle;
  builder.addSourceReferenceField("Repository", metadata.institution);
  builder.addSourceReferenceText(reference);
  const includes = (text, value) =>
    text.toLowerCase().replace(/[–—]/g, "-").includes(value.toLowerCase().replace(/[–—]/g, "-"));
  const titleAndReference = [ed.sourceInformation, reference].filter(Boolean).join("; ");
  if (metadata.protocol && !includes(titleAndReference, metadata.protocol))
    builder.addSourceReferenceField("Protocol", metadata.protocol);
  if (metadata.period && !includes(titleAndReference, metadata.period))
    builder.addSourceReferenceField("Period", metadata.period);
  builder.addSourceReferenceField("Contents", metadata.contents);
  if (metadata.printedPage && !["s. ", "p. "].some((prefix) => reference?.endsWith(prefix + metadata.printedPage)))
    builder.addSourceReferenceField("Page", metadata.printedPage);
}

export {
  viewerSelectionFromUrl,
  sameViewerSelection,
  normalizeViewerMetadata,
  loadViewerMetadata,
  assertViewerSelection,
  addViewerSourceReference,
};
