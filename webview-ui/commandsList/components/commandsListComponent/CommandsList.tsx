import * as React from 'react';
import * as m365Commands from '../../../../data/m365Model.json';
import { ICommand } from '../../../../models/ICommand';
import './CommandsList.css';
import { ICommandsListProps } from './ICommandsListProps';
import { ICommandsListState } from './ICommandsListState';
import { vscode } from '../../utilities/vscode';
import { VSCodeDivider } from '@vscode/webview-ui-toolkit/react';
import CommandsAction from '../commandsActionComponent/CommandsAction';
import CommandsSearch from '../commandsSearchComponent/CommandsSearch';
import { ICommandGroup } from './model/ICommandGroup';
import { ICommandTree } from './model/ICommandTree';


export default class CommandsList extends React.Component<ICommandsListProps, ICommandsListState> {

  constructor(props: ICommandsListProps) {
    super(props);

    const commands = m365Commands.commands as ICommand[];

    this.state = {
      commandsListView: commands,
      commandsTreeView: this._getTreeView(commands),
      isTreeViewEnabled: false,
      previousSearchInput: ''
    };
  }

  public componentDidMount(): void {
    const previousState = vscode.getState() as ICommandsListState;

    if (previousState
       && previousState.commandsListView
       && previousState.commandsTreeView
       && previousState.commandsTreeView.commandGroups) {
      this.setState({
        isTreeViewEnabled: previousState.isTreeViewEnabled,
        previousSearchInput: previousState.previousSearchInput,
        commandsListView: previousState.commandsListView,
        commandsTreeView: previousState.commandsTreeView
      });
    }
  }

  public render(): React.ReactElement<ICommandsListProps> {
    const { commandsListView,
      isTreeViewEnabled,
      commandsTreeView,
      previousSearchInput } = this.state;

    return (
      <div>
        <div className='cli-commands-list-controls'>
          <CommandsAction isTreeViewEnabled={isTreeViewEnabled} showListView={() => this._handleShowListViewButtonClick()} showTreeView={() => this._handleShowTreeViewButtonClick()} />
          <VSCodeDivider />
          <CommandsSearch initialSearchInput={previousSearchInput} onSearch={event => this._handleSearch(event)} />
        </div>
        <div className='cli-commands-list-wrapper'>
          {isTreeViewEnabled ?
            <div className='cli-commands-tree'>
              <div>
                <div className='cli-commands-tree-inner-command-groups'>
                  {commandsTreeView.commandGroups.map((group: ICommandGroup) => this._createTreeView(group, commandsListView, ''))}
                </div>
                <ul>
                  {commandsTreeView.commands.map(command => (<li key={commandsListView.indexOf(command)} onClick={() => this._handleCommandClick(command.name)}>{command.name}</li>))}
                </ul>
              </div>
            </div> :
            <div className='cli-commands-list'>
              <ul>
                {commandsListView.map(command => (<li key={commandsListView.indexOf(command)} onClick={() => this._handleCommandClick(command.name)}>{command.name}</li>))}
              </ul>
            </div>
          }
        </div>
      </div>);
  }

  private _createTreeView(commandGroup: ICommandGroup, commandsListView: ICommand[], parentCommandPath: string): JSX.Element {
    const chevronExpandedIcon = commandGroup.isExpanded ? 'codicon-chevron-down' : 'codicon-chevron-right';
    const commandKey = parentCommandPath !== '' ? `${parentCommandPath}-${commandGroup.name}` : commandGroup.name;
    return (
      <div key={commandGroup.name}>
        <div className='cli-commands-tree-group' data-command-key={commandKey} onClick={() => this._handleGroupNameClick(commandKey)}>
          <span className={'codicon ' + chevronExpandedIcon}></span>
          <span className='pnp-commands-tree-group-name'>{commandGroup.name}</span>
        </div>
        <div className='cli-commands-tree-commands'>
          {commandGroup.isExpanded ?
            <div>
              <div className='cli-commands-tree-inner-command-groups'>
                {commandGroup.commandGroups.map(group => this._createTreeView(group, commandsListView, commandKey))}
              </div>
              <ul>
                {commandGroup.commands.map(command => (<li key={commandsListView.indexOf(command)} onClick={() => this._handleCommandClick(`${commandKey.replaceAll('-', ' ')} ${command.name.split(' ')[1]}`)}>{command.name}</li>))}
              </ul>
            </div> : ''
          }
        </div>
      </div>
    );
  }

  private _handleGroupNameClick(groupPath: string): void {
    const groupPathSegments = groupPath.split('-');
    const commandsTreeView = this.state.commandsTreeView;
    let treeView = commandsTreeView.commandGroups;
    groupPathSegments.forEach((segment, index) => {
      const commandGroup = treeView.filter(group => group.name === segment)[0];
      treeView = commandGroup.commandGroups;

      if (index === groupPathSegments.length - 1) {
        commandGroup.isExpanded = !commandGroup.isExpanded;
      }
    });

    this.setState({ commandsTreeView: commandsTreeView });

    const state = vscode.getState() as ICommandsListState ?? {} as ICommandsListState;
    state.commandsTreeView = commandsTreeView;
    vscode.setState(state);
  }

  private _handleShowListViewButtonClick(): void {
    const treeView = this.state.commandsTreeView;
    const listView = this.state.commandsListView;
    const collapse = (group: ICommandGroup) => {
      group.isExpanded = false;
      group.commandGroups.forEach(group => collapse(group));
    };
    treeView.commandGroups.forEach(group => collapse(group));
    this.setState({
      isTreeViewEnabled: false,
      commandsTreeView: treeView
    });
    const state = vscode.getState() as ICommandsListState;
    state.isTreeViewEnabled = false;
    state.commandsTreeView = treeView;
    state.commandsListView = listView;
    vscode.setState(state);
  }

  private _handleShowTreeViewButtonClick(): void {
    this.setState({ isTreeViewEnabled: true });
    const treeView = this.state.commandsTreeView;
    const listView = this.state.commandsListView;
    const state = vscode.getState() as ICommandsListState;
    state.isTreeViewEnabled = true;
    state.commandsTreeView = treeView;
    state.commandsListView = listView;
    vscode.setState(state);
  }

  private _handleSearch(event: any): void {
    const searchInput: string = (event.target as HTMLInputElement)?.value;
    this._search(searchInput);
  }

  private _search(searchInput: string): void {
    const commands: ICommand[] = m365Commands.commands as ICommand[];
    const searchResult: ICommand[] = commands.filter(command => command.name.toLowerCase().includes(searchInput.toLowerCase()));
    const searchResultTreeView: ICommandTree = this._getTreeView(searchResult);
    this.setState({
      commandsListView: searchResult,
      commandsTreeView: searchResultTreeView,
      previousSearchInput: searchInput
    });
    const state = vscode.getState() as ICommandsListState;
    state.commandsListView = searchResult;
    state.commandsTreeView = searchResultTreeView;
    state.previousSearchInput = searchInput;
    vscode.setState(state);
  }

  private _handleCommandClick(commandName: string): void {
    vscode.postMessage({
      command: 'showCommandManual',
      value: commandName,
    });
  }

  private _getTreeView(commands: ICommand[]): ICommandTree {
    const rootCommands: ICommand[] = commands.filter(command => command.name.split(' ').length === 1);
    let groups: string[] = commands.map(command => command.name.split(' ')[0]).filter((value, index, self) => self.indexOf(value) === index);
    groups = groups.filter(group => !rootCommands.some(command => command.name === group));
    const commandGroups: ICommandGroup[] = groups.map(group => {
      const groupCommands: ICommand[] = commands.filter(command => command.name.startsWith(`${group} `) && command.name.split(' ').length <= 2);
      const innerGroups: ICommand[] = commands.filter(command => command.name.startsWith(`${group} `) && command.name.split(' ').length > 2);

      return {
        name: group,
        isExpanded: false,
        commands: groupCommands,
        commandGroups: this._getTreeView(innerGroups.map(innerGroup => { return { ...innerGroup, name: this._getNextCommandGroupName(innerGroup.name) }; })).commandGroups
      } as ICommandGroup;
    });

    return {
      commands: rootCommands,
      commandGroups: commandGroups
    };
  }

  private _getNextCommandGroupName(currentName: string): string {
    const nameSegments = currentName.split(' ');
    nameSegments.shift();
    return nameSegments.join(' ');
  }
}