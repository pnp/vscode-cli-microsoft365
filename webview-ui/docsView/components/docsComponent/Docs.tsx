import * as React from 'react';
import * as global from '../../../../data/global.json';
import './Docs.css';
import { IDocsProps } from './IDocsProps';
import { IDocsState } from './IDocsState';
import ReactMarkdown from 'react-markdown';
import { vscode } from '../../utilities/vscode';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';


export default class Docs extends React.Component<IDocsProps, IDocsState> {

  constructor(props: IDocsProps) {
    super(props);
  }

  public render(): React.ReactElement<IDocsProps> {
    let docs = this.props.docsMarkDown;
    const { docsCommandName, docsUrl } = this.props;
    docs = docs.replaceAll('\n', ' \n');
    const globalContent = global.content.join(' \n');
    docs = this._clearDocsOfDefinitionList(docs);
    docs = docs
      .replaceAll('<Global />', globalContent)
      .replaceAll('import Global from \'/docs/cmd/_global.mdx\';', '')
      .replaceAll('import Tabs from \'@theme/Tabs\';', '')
      .replaceAll('import TabItem from \'@theme/TabItem\';', '')
      .replaceAll('<Tabs>', '')
      .replaceAll('</Tabs>', ' \n')
      .replaceAll('<TabItem value="JSON">', 'JSON representation: \n')
      .replaceAll('<TabItem value="Text">', 'Text representation: \n')
      .replaceAll('<TabItem value="CSV">', 'CSV representation: \n')
      .replaceAll('<TabItem value="Markdown">', 'Markdown representation: \n')
      .replaceAll('</TabItem>', ' \n');

    return (
      <div>
        <div className='docs-header'>
          <VSCodeButton appearance="primary" onClick={() => this._handleShowRelatedSamplesButtonClick(docsCommandName)}>
            Show related samples
            <span slot='start' className='codicon codicon-file-code'></span>
          </VSCodeButton>
          <VSCodeButton appearance="primary" onClick={() => this._handleOpenDocsWebPageButtonClick(docsUrl)}>
            Go to docs web page
            <span slot="start" className="codicon codicon-go-to-file"></span>
          </VSCodeButton>
        </div>
        <div className='docs-content'>
          <ReactMarkdown
            components={{
              pre({ ...props }) {
                const handleCopyCode = (codeChunk: React.ReactElement) => {
                  const code = codeChunk.props.children[0];
                  if (typeof code === 'string') {
                    navigator.clipboard.writeText(code);
                  }
                };

                return (
                  <div className='copy-code'>
                    <VSCodeButton appearance="icon" onClick={() => handleCopyCode({ ...props }?.children[0] as React.ReactElement)}>
                      <span className='codicon codicon-copy'></span>
                    </VSCodeButton>
                    <pre {...props}></pre>
                  </div>
                );
              }
            }}
          >{docs}</ReactMarkdown>
        </div>
      </div>
    );
  }

  private _clearDocsOfDefinitionList(docs: string): string {
    if (docs.indexOf('```md definition-list') === -1)
      return docs;

    const tmp = docs.split('```md definition-list');
    const tmp2 = tmp[1].split('```');
    const result = tmp[0] + tmp2[0];
    tmp2.splice(0, 1);
    return result + tmp2.join('```');
  }

  private _handleShowRelatedSamplesButtonClick(name: string): void {
    vscode.postMessage({
      command: 'showSamples',
      value: name,
    });
  }

  private _handleOpenDocsWebPageButtonClick(url: string): void {
    vscode.postMessage({
      command: 'openLink',
      value: url,
    });
  }
}
