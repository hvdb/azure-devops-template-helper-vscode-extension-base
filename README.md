# Azure DevOps Template Helper VSCode Extension Base

With this repository you can create your own VSCode plugin that contains your Azure DevOps template snippets.  

## Usage

You can't (or well you can but maybe not handy) publish this to the VSCode marketplace directly as the template snippets are missing.  
You need to provide the [template.json](https://raw.githubusercontent.com/hvdb/ado-template-helper/master/template.schema.json) files as described [here](https://github.com/hvdb/azure-devops-template-helper)  

You can fork this repository, rename it add the templates and then run build scripts.  
However, merging updates will be tricky then and potential painful.  
A better option is to create a new git repository that can be inspired by this one (even forked), during the build process copy over the needed things and merge package.json. (See below at #merging)

### Configuration

Inside the `package.json` there is a `configuration` part.  
Here you need to provide the following options:

`prefix`: What prefix needs to be used for showing the snippets inside VSCode.  
`template_dir`: Directory where the templates can be found (`template.json`)  

### Build and create extension

run `npm run vscode` to compile and create the extension.  

run `npm run vscode:prepublish` to compile and generate the snippets but not the extension  

run `npm run vscode:publish` to build the extension. (`prepublish` must be executed first!)  

### Installation of the plugin

1. Make sure you have the extension downloaded/here.
2. Open VSCode and navigate to the 'Extensions tab' (⇧⌘X, Shift+Windows/Command+X)  
3. Press the `...` in the top right of the extensions window
4. `Install from VSIX...`  
    a. Select your VSCode extension
5. Done! Open a `Yaml` file and type `YOUR_DEFINED_PREFIX` and ( ⌃+Space, Ctrl/Option+Space)

Or in terminal:  
*(assumption that your extension is called `extension` and you are in the output directory)*

```bash
code --install-extension extension.vsix
```
*note: make sure [code](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line) is available on the commandline*


### Merging

I use the following scripts inside mine plugin (the one build using this base).  

```bash
#!/bin/sh

#Download the base from github and copy to the root dir.
#Merge deps
#install dependencies

# Clone base
rm -rf tmp
mkdir tmp
git clone https://github.com/hvdb/azure-devops-template-helper-vscode-extension-base.git ./tmp/azure-devops-template-helper-vscode-extension-base

# Copy sources
cp -a ./tmp/azure-devops-template-helper-vscode-extension-base/src ./

# Merge dep
node scripts/merge_pkg.js

```

```javascript
const fs = require('fs');
const path = require('path');

const base = require('../tmp/azure-devops-template-helper-vscode-extension-base/package.json');
let thisPkg = require('../package.json');

let deps = { ...base.dependencies, ...thisPkg.dependencies };
let devDeps = { ...base.devDependencies, ...thisPkg.devDependencies };

thisPkg.dependencies = deps;
thisPkg.devDependencies = devDeps;

fs.writeFileSync(path.join(__dirname, '..', 'package.json'), JSON.stringify(thisPkg, null, 4));
```

What this does is clone the base repo inside a tmp folder of your extension repository.  
Copy the sources and merge the dependencies.  
After that a NPM install should be all before running the build scripts.  

This way you can add your own templates inside your private repository if you don't want them to be publicy available.  
(Or have another proces to grab those from a different source, you get the point)

See [azure-devops-template-helper](https://github.com/hvdb/azure-devops-template-helper)