import { ICommand } from '../../../../models/ICommand';
import { ICommandTree } from './model/ICommandTree';


export interface ICommandsListState {
    commandsListView: ICommand[];
    commandsTreeView: ICommandTree;
    isTreeViewEnabled: boolean;
    previousSearchInput: string;
}