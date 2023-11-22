// src/extension.ts

import * as vscode from 'vscode';

function camelToSnake(camelCase: string): string {
    return camelCase.replace(/[A-Z]/g, (match, index) => (
        index === 0 ? match.toLowerCase() : `_${match.toLowerCase()}`));
}

function createCppClass(className: string, nameSpace: string, folderPath: string) {
    const date = new Date();
    const fileName = camelToSnake(className);
    // process namespace
    let nameSpaceStr='';
    let nameSpaceStrStart = '';
    let nameSpaceStrEnd = '';
    if (nameSpace != '') {
        nameSpaceStrStart = '\n';
        nameSpace.split('::').forEach(element => {
            if (element != '') {
                nameSpaceStr += `${element}_`;
                nameSpaceStrStart += `namespace ${element} {\n`;
                nameSpaceStrEnd += `} // namespace ${element}\n`;
            }
        });
    }
    const headerGuard = `${nameSpaceStr.toUpperCase()}${fileName.toUpperCase()}_H_`;

    // process cpp code
    const cppCode = `#include "${fileName}.h"
${nameSpaceStrStart}
${className}::${className}() {
  // Constructor
}

${className}::~${className}() {
  // Destructor
}
${nameSpaceStrEnd}`;

    // process header code
    const headerCode = `// Copyright(c) 2013-2028 Hongjing
// All rights reserved.
//
// Author: Yang Zhu
// Update: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}

#ifndef ${headerGuard}
#define ${headerGuard}
${nameSpaceStrStart}
class ${className} {

 public:
  ${className}();
  ~${className}();
  ${className}(${className} const&) = delete;
  ${className}& operator=(${className} const&) = delete;
  ${className}(${className}&&) = delete;
  ${className}& operator=(${className}&&) = delete;

};
${nameSpaceStrEnd}
#endif // ${headerGuard}
`;

    const cppFilePath = vscode.Uri.file(`${folderPath}/${fileName}.cpp`);
    const headerFilePath = vscode.Uri.file(`${folderPath}/${fileName}.h`);

    vscode.workspace.fs.writeFile(cppFilePath, Buffer.from(cppCode));
    vscode.workspace.fs.writeFile(headerFilePath, Buffer.from(headerCode));

    vscode.workspace.openTextDocument(cppFilePath).then(doc => {
        vscode.window.showTextDocument(doc);
    });
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('cppClassGenerator.createCppClass', (uri:vscode.Uri) => {
        vscode.window.showInputBox({ prompt: 'Enter the class name' }).then(className => {
            if (className) {
                vscode.window.showInputBox({ prompt: 'Enter the class namespace' }).then(NameSpace => {
                    let folderPath = '';
                    if (uri) {
                        folderPath = uri.fsPath || '';
                    }
                    console.log(folderPath);
                    if (NameSpace) {
                        createCppClass(className, NameSpace, folderPath);
                    } else {
                        createCppClass(className, '', folderPath);
                    }
                });
            }
        });
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}

