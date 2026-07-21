import { AppTo1C } from './appFor1C/app-to-1c';

declare global {
  interface Window {
    appTo1C: AppTo1C;
    isWebClient: boolean;
  }
}
