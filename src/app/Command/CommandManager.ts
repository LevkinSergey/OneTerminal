import { Command } from './Command.interface';
import { CommandTypes } from './Command.types';

export interface CommandManagerProps {}

export class CommandManager {
	private commands: Command[] = [];

	constructor(props?: CommandManagerProps) {
		this.registerPredefinedCommands();
	}

	private registerPredefinedCommands() {
		this.register('help', 'predefined', 'Вывести доступные команды');
		this.register('exit', 'predefined');
	}

	register(name: string, type: CommandTypes, description: string = '') {
		this.commands.push({ name, description, type });
	}

	clearCurrentDirCommands() {
		this.clearCommandsWithType('currentDir');
	}

	private clearCommandsWithType(type: CommandTypes) {
		this.commands = this.commands.filter(command => command.type !== type);
	}
}
