import {
  ExtensionContext,
} from 'vscode';

import { RVContext } from './support/context';

export async function activate(context: ExtensionContext) {
  const startTime = Date.now();
  const rvContext = RVContext.create(context);
  const activationTime = Date.now() - startTime;
}

export function deactivate() {
  console.log('Deactivating extension');
}
