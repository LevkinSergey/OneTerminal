import { CommandTypes } from './Command.types';

export interface Command {
	name: string;
	type: CommandTypes;
	description?: string;
}
