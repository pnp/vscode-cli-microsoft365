import { ICommand } from '../../../../../models/ICommand';
import { ICommandGroup } from '../model/ICommandGroup';


export interface ICommandTree {
    commandGroups: ICommandGroup[];
    commands: ICommand[];
}