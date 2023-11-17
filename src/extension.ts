// src/extension.ts

import * as vscode from 'vscode';

function createCppClass(className: string, NameSpace: string, folderPath: string) {
    const date = new Date();
    let NameSpaceStrStart = '';
    let NameSpaceStrEnd = '';
    if (NameSpace != '') {
        NameSpaceStrStart = '\n';
        NameSpace.split('::').forEach(element => {
            if (element != '') {
                NameSpaceStrStart += `namespace ${element} {\n`;
                NameSpaceStrEnd += `} // namespace ${element}\n`;
            }
        });
    }

    const cppCode = `#include "${className}.h"
${NameSpaceStrStart}
${className}::${className}() {
  // Constructor
}

${className}::~${className}() {
  // Destructor
}
${NameSpaceStrEnd}`;

    const headerCode = `// Copyright(c) 2013-2028 Hongjing
// All rights reserved.
//
// Author: Yang Zhu
// Update: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}

#ifndef ${className.toUpperCase()}_H_
#define ${className.toUpperCase()}_H_
${NameSpaceStrStart}
class ${className} {

 public:
  ${className}();
  ~${className}();
  ${className}(${className} const&) = delete;
  ${className}& operator=(${className} const&) = delete;
  ${className}(${className}&&) = delete;
  ${className}& operator=(${className}&&) = delete;

};
${NameSpaceStrEnd}
#endif // ${className.toUpperCase()}_H_
`;

    const cppFilePath = vscode.Uri.file(`${folderPath}/${className}.cpp`);
    const headerFilePath = vscode.Uri.file(`${folderPath}/${className}.h`);

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

