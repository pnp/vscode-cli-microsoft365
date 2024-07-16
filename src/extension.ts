import * as vscode from 'vscode';
import { WebViewPanels } from './panels/WebViewPanels';
import { PromptHandler } from './PromptHandler';
import { CHAT_PARTICIPANT_ID, SAMPLES_COMMAND } from '../constants/Constants';
import * as m365Commands from '../data/m365Model.json';


export function activate(context: vscode.ExtensionContext) {

    // TODO: temporary removing the CLI for M365 chat participant
    // const chatParticipant = vscode.chat.createChatParticipant(CHAT_PARTICIPANT_ID, PromptHandler.handle);
	// chatParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'assets', 'chat_logo.png');

    const cliM365Provider = new WebViewPanels(context, {});
    const view = vscode.window.registerWebviewViewProvider('cliM365', cliM365Provider);
    context.subscriptions.push(view);

    const openSamplesWebviewCommand = vscode.commands.registerCommand(SAMPLES_COMMAND, () => cliM365Provider.getHtmlWebviewForSamplesView());
    context.subscriptions.push(openSamplesWebviewCommand);

    const openManualWebviewCommand = vscode.commands.registerCommand('cliM365.showManual', async () => {
        const editor = vscode.window.activeTextEditor;

        let selectedCommand: string = '';
        if (editor)
            selectedCommand = editor.document.getText(editor.selection);

        selectedCommand = selectedCommand.replace('m365 ','').trim();

        const commandName = await vscode.window.showInputBox({
            placeHolder: 'e.g. spo list get',
            prompt: 'Enter command name',
            value: selectedCommand
        });

        if (!commandName)
            return;

        if (!m365Commands.commands.some(command => command.name === commandName)) {
            vscode.window.showErrorMessage(`the command ${commandName} does not exist`);
            return;
        }

        cliM365Provider.getHtmlWebviewForDocsView(commandName);
    });
    context.subscriptions.push(openManualWebviewCommand);
}

export function deactivate() { }