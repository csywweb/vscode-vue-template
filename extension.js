// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function generateTemplateName(dirName) {
    if (!dirName) {
        throw new Error('dir name should not be null');
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const nameArr = dirName.split('_');
    let templateName = '';
    
    for (const name of nameArr) {
        templateName += capitalizeFirstLetter(name);
    }
    
    return templateName;
}

function generateComponent(componentName, fullPath) {
    if (fs.existsSync(fullPath)) {
        console.log(`${componentName} already exists, please choose another name.`);
        return;
    }

    const templateName = generateTemplateName(componentName);
    console.log(`templateName name: ${templateName}`);


    fs.mkdirSync(fullPath);

    const template = path.resolve(__dirname, './file_template/template.txt');
    const sassTemplate = path.resolve(__dirname, './file_template/scss.scss');

    const jsFile = path.resolve(`${fullPath}/index.vue`);
    const sassFile = path.resolve(`${fullPath}/index.scss`);

	const sassFileContent = fs.readFileSync(sassTemplate, { encoding: 'utf-8' });
    fs.writeFileSync(sassFile, sassFileContent.replace(/ClassName/g, componentName));

    const jsFileContent = fs.readFileSync(template, { encoding: 'utf-8' });
	const jsFileContentFilterClassName = jsFileContent.replace(/ClassName/g, componentName);
	const jsFileContentFilterTemplateName = jsFileContentFilterClassName.replace(/templateName/g, templateName);

    fs.writeFileSync(jsFile, jsFileContentFilterTemplateName);


    exec(`cd ${fullPath} && git add .`, (err) => {
        if (err) {
            console.log('command fail:', 'git add .');
        } else {
            console.log('command success:', 'git add .');
        }
    });

   vscode.window.showInformationMessage('component created successfully!');
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vue-template" is now active!');

	// The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    const template = vscode.commands.registerCommand('extension.createTemplate', function (param) {
        // 文件夹绝对路径
        const folderPath = param.fsPath;

        const options = {
            prompt: "请输入组件名: ",
            placeHolder: "组件名"
        }
        
        // 调出系统输入框获取组件名
        vscode.window.showInputBox(options).then(value => {
            if (!value) return;

            const componentName = value;
            const fullPath = `${folderPath}/${componentName}`;

            // 生成模板代码，不是本文的重点，先忽略
            generateComponent(componentName, fullPath);
        });
    });

	context.subscriptions.push(template);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
