import * as vscode from 'vscode';
import { SAMPLES_COMMAND } from '../constants/Constants';
import { basic, references, sample, command } from '../constants/Prompt';

export const MODEL_SELECTOR: vscode.LanguageModelChatSelector = { vendor: 'copilot', family: 'gpt-3.5-turbo' };

export class PromptHandler {

    public static async handle(request: vscode.ChatRequest, context: vscode.ChatContext, response: vscode.ChatResponseStream, token: vscode.CancellationToken): Promise<void | vscode.ChatResult> {
        let messages = [];
        const [model] = await vscode.lm.selectChatModels(MODEL_SELECTOR);
        let chatResponse: any;

        switch (request.command) {
            case 'command':
                response.progress('Checking...'); //TODO: create a random progress response
                messages = [
                    vscode.LanguageModelChatMessage.User(`${basic}${command}`),
                    vscode.LanguageModelChatMessage.User(request.prompt)
                ];

                chatResponse = await model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    response.markdown(fragment);
                }
                break;
            case 'script':
                response.progress('Checking...'); //TODO: create a random progress response
                messages = [
                    vscode.LanguageModelChatMessage.User(`${basic}${sample}`),
                    vscode.LanguageModelChatMessage.User(request.prompt)
                ];

                chatResponse = await model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    response.markdown(fragment);
                }

                response.button({
                    command: SAMPLES_COMMAND,
                    title: vscode.l10n.t('Open Sample Gallery'),
                });
                break;
            default:
                messages = [
                    vscode.LanguageModelChatMessage.User(`${basic}${references}`),
                    vscode.LanguageModelChatMessage.User(request.prompt)
                ];

                chatResponse = await model.sendRequest(messages, {}, token);
                for await (const fragment of chatResponse.text) {
                    response.markdown(fragment);
                }
        }

        return { metadata: { command: '' } };
    }
}




