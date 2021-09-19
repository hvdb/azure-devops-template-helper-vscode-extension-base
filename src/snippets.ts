import * as path from 'path';
import * as fs from 'fs';
import { createSnippet } from 'azure-devops-template-helper';

function create(filePath: string, templateName: string, outputSnippetsFolder: string, snippetPrefix: string): string {
    if (fs.existsSync(filePath)) {
        const templateDefinition = fs.readFileSync(filePath).toString();
        if (templateDefinition) {
            const snippet = createSnippet(JSON.parse(templateDefinition), snippetPrefix);
            if (snippet) {
                const templateFileName = `${templateName}.json`;
                fs.writeFileSync(path.join(outputSnippetsFolder, templateFileName), snippet);
                return templateFileName;
            }
        }
    }
    return '';
}

export async function generateSnippets(templateDataDirectory: string, projectFolderName: string, snippetPrefix: string) {
    let filesNames: string[] = [];

    const folders: string[] = fs.readdirSync(templateDataDirectory);
    const outputSnippetsFolder = path.join(__dirname, '..', projectFolderName, 'snippets');
    if (!fs.existsSync(outputSnippetsFolder)) {
        fs.mkdirSync(outputSnippetsFolder, { recursive: true });
    }
    folders.forEach(function (folder) {
        filesNames.push(create(path.join(templateDataDirectory, folder, 'template.json'), folder, outputSnippetsFolder, snippetPrefix));
    });

    return filesNames;
}
