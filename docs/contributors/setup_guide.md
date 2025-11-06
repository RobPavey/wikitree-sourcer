# Setup guide for contributors to the wikitree-sourcer project

## Initial setup

To get set up with building and running the unit tests locally you will need to fork and clone the repository and install node.js

### Install git on your machine

There are some instructions here: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

I recommend VSCode as a dev environment. Here are some notes on using git in vscode: https://www.jcchouinard.com/install-git-in-vscode/

### Create a fork of the repository

On the [wikitree-sourcer](https://github.com/RobPavey/wikitree-sourcer) github page look at the top-right of the page for a button that says "Fork". This will create a fork of the repo on your own GitHub account.

It works best if you uncheck the checkbox that says "Copy the main branch only". This way you will be able to work in the `develop` branch locally and be able to sync changes from other developers working in that branch.

### Clone the forked repository onto your local machine

In a terminal window (Mac) or command window (PC) change directory to where you want to put your development folder. NOTE: you can use the terminal window in vscode also.

Then do:

`git clone https://github.com/<your-github-id>/wikitree-sourcer.git wikitree-sourcer`

This will create a folder called wikitree-sourcer in your current folder. If desired you can call it something else by changing the last parameter.

In vscode you can then do "Open Folder" on the new folder.

### Get the latest from the develop branch

It is best to be up to date with the latest work in the develop branch of the main repo. Significant changes are made in the develop branch and that is merged to the main branch before a release. Releases are always done from the main branch. So the main branch is kept clean for making bug fix releases without incuding work that is still in development.

`git checkout develop`

### Setup your editor/IDE ###

I use Visual Studio Code (vscode). I have it setup to run `prettier` to format the code whenever I save.

There is a .prettier file in the project that controls the formatting/indentation of the files. It is important that we all use the same formatting rules so that the files to not keep changing formatting each time a different person edits them.

I beleive there is a rule setup using `husky` that means it automatically runs prettier upon commit. But this doesn't seem to work for everyone.

### Install node.js

It can be downloaded here: https://nodejs.org/en/download/

This will also install "npm" (the package manager) which you will need.

### Install the node packages

This is done using npm. Change directory to the project folder (the folder that contains the `extensions` and `scripts` folders) and type this command:

`npm ci`

This does an npm "clean install" it uses the versions of packages from the package-lock.json file.

You will get a lot of messages but at the end you should see something like this:

```
added 464 packages, and audited 465 packages in 3s

125 packages are looking for funding
  run `npm fund` for details

2 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

Note that these node.js packages are only used for the test harness, not in the extension itself. So we are not too concerned about some packages being unsupported versions.

### Run the unit tests

In the terminal window with the current directory set to the project folder enter this command:

`node scripts/run_test.js`

This runs all of the unit tests. There are parameters to limit it by site and type of test.

If everything worked, the last line of the output should be:

`++++ All tests passed ++++`

If you get lots of errors try running it on a subset of tests like this:

`node scripts/run_test.js fg extract`

so that you can more easily see the errors.

### Putting changes back into the main repo

This is done via a Pull Request. Pull Requests should target the develop branch of the main repo.
