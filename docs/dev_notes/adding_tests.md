## Adding tests for a site

The test system could be considered either unit tests, regression tests or integration tests technically.

They test each stage of a site's implementation: extract, generalize, citation, table, and search.

Each site has a number of test cases. You can run each stage of the tests separately and even an individual test case for a stage.

### Example use of the run_test script

To run all the tests on all sites:    `node scripts/run_test.js`

To run the tests for a single site (fg):  `node scripts/run_test.js fg`

To run the extract tests for a single site (fg):  `node scripts/run_test.js fg extract`

To run the extract tests for a single site (fg) and a single test case:  `node scripts/run_test.js fg extract john_sinclair_d_1906`

### How the scripts work

The scripts run each stage with defined input files and options. The output goes to a test file.
The test file is compared against a stored reference file and if they differ the test fails.

When you add a new test the ref files are created automatically since it is considered to pass the first time you run it.

When you make a change that affects the output of a stage then the test will fail. What I usually do in this case is:
1. In the error report it shows the pathnames of the ref and test files. In vscode I click on each of these to open them in the Explorer Open Editors list.
2. I click on the first one in the oprn editors list and then ctrl or cmd + click on the second one so that the two files are selected
3. I right-click on one of them and di `Compare Selected`
4. This shows a side by side diff
5. If it all looks good I select ALL in the test file and copy it, then select all in the ref file and paste.
6. Then save and run the test again to check it passes.

### Adding new tests

For most sites the input to the extract is a saved HTML file. An exception is FamilySearch where most of the test cases use a .json file as input.

The input to generalize is the output ref file from extract.

The input to citation is both the output ref files from extract and the oupt from generalize.

The input to table is the output ref file from generalize.

The input to search is usually one of the output ref files from *a different site's* generalize step.

So to add a new test for a typical site:

1. In Chrome do `File > Save Page As...` and save the page to `unit_tests/<sitename>/saved_pages`. You should use a consistent naming convention for the test files for a given site. This becomes the test case name. **Remember to delete the files folder that is saved along with the HTML file**. This is not needed and we don't want it in git.
2. Edit the file `unit_tests/<sitename>/<sitename>_test_content_and_citation.mjs` and add the test case into the `regressionData` array. If this is the first test case look at `fg` for an example.
3. Run `node scripts/run_test.js <sitename>. This will run the extract, generalize and sitation stages.

If the site supports household tables look at a site like `fmp` for an example.

If the site supports search then edit `unit_tests/<sitename>/<sitename>_test_build_search_url.mjs` and pick an existing test case from another site (e.g. `wikitree`) as an example place to search from.
  

