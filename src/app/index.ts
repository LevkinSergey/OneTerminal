import './index.scss'
import { OneTerminal } from './OneTerminal'
import '../appFor1C/app-to-1c'

const onecTerminal = new OneTerminal()

export const init = async () => {
  onecTerminal.init(document.getElementById('app') as HTMLElement)
}
