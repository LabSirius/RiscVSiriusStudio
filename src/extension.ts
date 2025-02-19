import {
  ExtensionContext,
} from 'vscode';

import { RVContext } from './support/context';

export async function activate(context: ExtensionContext) {
  console.log('Activating extension RiscV');
  const startTime = Date.now();
  const rvContext = RVContext.create(context);
  const activationTime = Date.now() - startTime;
  console.log(`%cExtension initialization finished. Took ${activationTime / 1000} secs.`, "color: blue;");
}

export function deactivate() {
  console.log('Deactivating extension');
}
