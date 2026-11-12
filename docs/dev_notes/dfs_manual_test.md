# Danish Family Search: manual Firefox test

## Load the development version

1. Open a terminal in the `wikitree-sourcer` repository and run:

   ```powershell
   node scripts/build_firefox.js none
   ```

   This refreshes the generated Firefox extension files without creating a ZIP.
   Repeat this command after implementation changes.

2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Choose **Load Temporary Add-on…** and select
   `browser_variants/firefox/manifest.json` inside this repository. If that development
   add-on is already loaded, use **Reload** after rebuilding instead.
4. Avoid having a second Sourcer version enabled during testing, so its menus and
   content scripts cannot interfere with this copy. Temporary add-ons disappear
   when Firefox closes.
5. Sign in at <https://www.danishfamilysearch.dk/> in Firefox. A login in the built-in
   browser or another browser does not sign Firefox in.
6. Open Sourcer on a DFS record. Allow the requested Danish Family Search website
   access when prompted. If the popup still shows the previous state, reload the
   record page and reopen Sourcer.

Use a text editor or an unsaved WikiTree edit preview to inspect copied output.
No WikiTree profile changes or DFS transcription edits are needed for these tests.
Do not press the DFS **Gem**, **Gem navne**, or **Ny fuldtastning** buttons.

## Record and citation tests

### 1. Census person and household

Open <https://www.danishfamilysearch.dk/cid5500978> and open Sourcer.

- The focal person must be **Hans Andreasen Hansen**, age **5**, census **1845**,
  in **Hesselager, Gudme, Svendborg**.
- Build an inline citation and paste it into your editor. It should contain the
  person, register/year, **Opslag Nr. 11**, entry **241**, the record URL, and
  **DDA-7202 / B7106** provenance. The accessed date should be today.
- When citing just Hans Andreasen Hansen, expect **in the household of Hans
  Andreasen**. Citing Hans Andreasen himself should not add this phrase. The phrase
  is omitted when the citation includes a household table.
- Build a household table. With normal table inclusion settings, it should retain
  all **11** displayed people. Two different **Kirsten Hansdatter** entries must
  remain separate. **Maren Nielsdatter** and **Rasmus Larsen** must remain present
  as servants, subject to your chosen table filtering options.
- Confirm the highlighted/selected table person is Hans Andreasen Hansen, rather
  than the first household member, Hans Andreasen.
- Save Person Data and inspect the saved person display: it should describe Hans
  Andreasen Hansen. The census-derived birth year **1840** should be approximate.

### 2. Individual church transcription

Open <https://www.danishfamilysearch.dk/kbid953766>.

- Sourcer should identify **Hans Christian Hansen**, born **23 February 1840**,
  with father **Chresten Hansen** and mother **Anne født Krongaard**.
- The citation should refer to the **Løjt** church book, **Opslag Nr. 29**, entry
  **6**, and the `/kbid953766` record URL.
- Build a narrative citation and check the birth event and parent names.
- The remark **Død 13 Octbr. 1841.** must not automatically become a structured
  death event in saved person data.

### 3. Indexed church image and image-only citation

Open
<https://www.danishfamilysearch.dk/churchbook/sogn701/churchlisting143098/opslag15978995>.

- A **WikiTree Sourcer person** selector should appear above the displayed index.
- Initially it should offer an image-only citation. The image citation should
  identify the Stubbekøbing register and **Opslag 9**, without choosing a person
  or inventing a narrative.
- Select **Hans Arnold Hansen — 17 Feb 1840**, then reopen Sourcer. The citation
  and person actions should now use that entry, not Christian Gotlieb Asmussen,
  who appears earlier in the index.
- Navigate to another image with the DFS next-image control. The selector must
  reset to image-only. It must not retain Hans Arnold Hansen.

### 4. School protocol

Open
<https://www.danishfamilysearch.dk/sogn804/skole66/source152527/opslag17728149>.

- Select **Hans Hansen**, **May 1811**, age **8**, then reopen Sourcer.
- Build a citation. It should identify the school protocol **1811–1820**,
  **Dreslette, Båg, Odense**, and **Opslag 17**.
- Save Person Data. The record type should be school records; it must not treat
  May 1811 as Hans's birth date.
- Select a different pupil and reopen Sourcer. Confirm the selected pupil's name
  and age change, with no details carried over from Hans.

### 5. Military levy roll

Open
<https://www.danishfamilysearch.dk/kilder/laegdsruller/kreds2/bsid17267/opslag12157806>.

- Select **Hans Hansen**, **1791**, age **19**, then reopen Sourcer.
- The citation should identify **Hovedrulle (Halsted) 1791**,
  **2. Udskrivningskreds**, and **Opslag 180**, with the selected name and age.
- Check the narrative and saved person data. They must not assert military
  service, a unit, rank, or service number that is absent from the transcription.

## Search tests

Use a WikiTree profile or saved person with a known name and birth year. For the
record examples above, Hans Hansen born about 1840 is convenient.

1. In Sourcer's options, find **Search → Danish Family Search** and turn off
   **Submit the search automatically** for the first test.
2. From the person/profile, choose **Search Danish Family Search**. The DFS search
   form should open with the intended names and birth-year bounds, and all four
   record-group boxes selected. It should stop for review and show a Sourcer
   message. A fresh request must not repeat after reloading the form.
3. Repeat using each submenu: church books, censuses, school protocols, and military
   levy rolls. Only the requested group should be selected.
4. Use **Search with specified parameters…**. Set a source-year range, birthplace,
   and locality. Check that those values reach the corresponding DFS form fields.
   County/parish dropdowns should remain unrestricted unless you edit them yourself.
5. Test remembered filters: manually run a DFS search using a county/parish, sex,
   or occupation filter. Start a new Sourcer search from the profile. Those old
   filters must be cleared, including when DFS initially opens its remembered
   results page instead of the form.
6. Turn **Submit the search automatically** back on. Repeat an all-groups search
   and a single-group search. Each should reach results after one final Search
   submission, without loops, repeated resetting, or repeated results reloads.
7. Follow a result to its record/image. Build a citation and check that the cited
   URL reopens the same source when signed in.

Birth-year bounds may be wider than a single year when the source date is approximate.
The year limits advertised by DFS are not hard-coded restrictions in Sourcer.

## Login and unsupported-page tests

- Sign out of DFS in Firefox and open one of the individual record URLs. DFS may
  redirect you to its login/register page. That is expected, and no additional
  Sourcer message is required there. Sourcer must not offer a record citation for
  the login-page content.
- Start a Sourcer search while signed out. Expect:
  **Sign in to Danish Family Search, then retry the Sourcer action.**
- Sign in again. The interrupted search must not automatically replay. Start the
  Sourcer search again and confirm it now works.
- Open an unrelated DFS account or forum page. It should not offer record actions
  for navigation text or account details.

## If a test fails

Report the test number, page URL, Firefox version, and the steps immediately before
the failure. Include the copied citation/table or a screenshot showing the selected
person and unexpected result. Do not include login details, cookies, or passwords.

Automated DFS and full regression suites passed during implementation. The Firefox
package also passed `web-ext lint` with zero errors, warnings, or notices. These
checks do not replace the installed-extension tests above. Safari remains untested.
