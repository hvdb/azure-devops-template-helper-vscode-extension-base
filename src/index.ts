import * as path from 'path';
import { generateSnippets } from './snippets';
import * as fs from 'fs';

const outputFolder = 'dist';
const projectFolderName = 'vs-extension';


function copyFolderSync(from: string, to: string) {
    if (!fs.existsSync(to)) {
        fs.mkdirSync(to);
    }
    if (!fs.lstatSync(path.join(from)).isSymbolicLink()) {
        fs.readdirSync(from).forEach(element => {

            if (fs.lstatSync(path.join(from, element)).isFile()) {
                fs.copyFileSync(path.join(from, element), path.join(to, element));
            } else {
                copyFolderSync(path.join(from, element), path.join(to, element));
            }
        });
    }
}

/**
 * This gets the template raw json data and generate the snippets for vscode.
 */
async function run() {
    const extensionPath = path.join(outputFolder, projectFolderName);
    // Read package.json for config
    const pkgJson = JSON.parse(fs.readFileSync('package.json').toString());
    console.log('Generate snippets');
    const templateDataDirectory = path.join(__dirname, '..', outputFolder, pkgJson.configuration.templates_dir);
    const filesNames = await generateSnippets(templateDataDirectory, extensionPath, pkgJson.configuration.prefix);
    console.log('Snippets are generated, generating extension config');
    createExtensionConfiguration(filesNames);
    console.log('Done!')
}

/**
 * This will generate the package.json needed for the extension
 * And also copy all other files needed for the plugin
 * 
 * @param filesNames Array of all the snippet files
 */
function createExtensionConfiguration(filesNames: string[]) {
    const outputPackageLocation = path.join(__dirname, '..', outputFolder, projectFolderName);
    const extensionPkgJson = JSON.parse(fs.readFileSync('package-extension.json').toString());
    const pkgJson = JSON.parse(fs.readFileSync('package.json').toString());

    var snippets: Object[] = [];
    filesNames.forEach((file) => {
        snippets.push({
            "language": "yaml",
            "path": `./snippets/${file}`
        });
    })

    extensionPkgJson.contributes.snippets = snippets;

    fs.writeFileSync(path.join(outputPackageLocation, 'package.json'), JSON.stringify(extensionPkgJson, null, 4));
    // Copy extension.js
    fs.writeFileSync(path.join(outputPackageLocation, 'extension.js'), fs.readFileSync('dist/extension.js'));
    // Copy all views
    copyFolderSync(path.join(__dirname, '..', outputFolder, 'views'), path.join(outputPackageLocation, 'views'))
    // Copy the node_modules
    copyFolderSync(path.join(__dirname, '..', outputFolder, 'node_modules'), path.join(outputPackageLocation, 'node_modules'))
    // Copy readme
    fs.writeFileSync(path.join(outputPackageLocation, 'README.md'), fs.readFileSync('README.md').toString());
    // Copy license
    fs.writeFileSync(path.join(outputPackageLocation, 'LICENSE'), fs.readFileSync('LICENSE').toString());
    // TODO: Icon

}

run();

