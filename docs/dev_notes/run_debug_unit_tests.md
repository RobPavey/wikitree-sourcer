# Running and debugging via the run_test script

## Reason for the unit tests

The unit tests are more properly regression tests. The main reason for having them is to be able to test that a code change has not changed existing functionality in a negative way.

They also provide a way of running and debugging much of the code outside of the browser.

Note that the unit tests only test code in the `core` subfolders and not the code in the `browser` subfolders.

## The run_test script

From a terminal window with the current directory set to the root wikitree-sourcer folder enter this command:

`node scripts/run_test.js`

This will run all of the unit tests. This involves running all of the test cases in each site's unit tests. If all is good the output will end with:

```+++ All tests passed +++```

You can also run just the tests for one site. For example to run all the tests for FamilySearch (fs) enter this:

`node scripts/run_test.js fs`

To focus it more narrowly you can run just one phase of the tests. The phases are `extract`, `generalize`, `citation`, `table`, `build_all_citations` and `search`.
So for example to run just the `extract` phase for FamilySearch enter this:

`node scripts/run_test.js fs extract`

You can narrow it down to one specific unit test. So to run the extract phase on the FamilySearch unit test case named `england_baptism_1838_george_newberry` enter this:

`node scripts/run_test.js fs extract england_baptism_1838_george_newberry`

This last example is useful for debugging a specific error.

The run_test script reports any test files where the newly generated 'test' result is different to the stored 'ref' result. You can then compare the ref and test in VS Code. For example you might get this output:

```
#### TESTS FAILED ####
FAILED: fs_extract_data in test: aus_tas_birth_reg_1883_alfred_widdowson (Result differs from reference)
  ref file: ./unit_tests/fs/extracted_data/ref/aus_tas_birth_reg_1883_alfred_widdowson.json
  test file: ./unit_tests/fs/extracted_data/test/aus_tas_birth_reg_1883_alfred_widdowson.json
```
If you are running the script in the terminal pane of VS Code, you can then Ctrl+Click (Windows) or Cmd+Click (Mac) on each of those json file paths to open them them in the "Open Editors" section. Then click on one in the open editors and then Ctrl/Cmd click on the other, then right-click on one of them and do "Compare selected". This will show you what changed. If it looks correct you can copy the contents of the test file into the ref file (in the diff windows).

Sometimes you make a change that you know will affect all the ref files for a site/phase. Once you have checked a few you can use the run_test script with the `-force` parameter to automatically replace the ref files with the new test files.

## Using the Visual Studio Code debugger with the run_test script

To run one specific test case in the debugger you use the launch.json file to pass the parameters to the run_test script.

Look in the .vscode folder in the root folder of your project and see if there is a launch.json file there. If not create one. Either way set the contents to:

```
{
  // Use IntelliSense to learn about possible attributes.
  // Hover to view descriptions of existing attributes.
  // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/scripts/run_test.js",
      "args": ["fs", "extract", "england_baptism_1838_george_newberry"]
    }
  ]
}
```
You can then set breakpoints in the `fs/core/fs_extract_data.mjs` file and run in the debugger. In VSCode on Mac I use the `RUN AND DEBUG` tab in the top left section (click on the "play" style right arrow) to start the debugger. You can also use the dropdown menus and do `Run > Start Debugging`. There is probably a shortcut also.

To debug your own specific examples change the three values in the `args` array.

# Viewing the results of the citation tests

The .json output files produced by the build_citation tests don't give a good idea of how it will look on a WikiTree profile.

Riel wrote a PHP script to help with this. To use it you will need PHP installed. To do this I installed HomeBrew and then used that to install PHP.

The script file is scripts/show_test_ref_citations.php, there are instructions at the top of that file.

