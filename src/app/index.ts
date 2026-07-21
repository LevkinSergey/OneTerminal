import './index.scss';
import { OneTerminal } from './OneTerminal';
import '../appFor1C/app-to-1c';
import { CommandManager } from './Command/CommandManager';

window.oneTerminal = new OneTerminal();

export const init = async () => {
	window.oneTerminal.init(document.getElementById('app') as HTMLElement);
};
