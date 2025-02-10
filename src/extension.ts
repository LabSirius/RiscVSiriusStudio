import {
  commands,
  ConfigurationChangeEvent,
  ExtensionContext,
  TextDocumentChangeEvent,
  TextEditor,
  TextEditorSelectionChangeEvent,
  Uri,
  window,
  workspace,
  ThemeColor,
  StatusBarItem,
} from 'vscode';

import { SimulatorPanel } from './panels/SimulatorPanel';
import { DataMemPanelView } from './panels/DataMemPanel';
import { RVContext, RVExtensionContext } from './support/context';
import { encodeIR, ProgramMemoryProvider } from './progmemview/progmemprovider';

export async function activate(context: ExtensionContext) {
  console.log('Activating extension RiscV');
  const startTime = Date.now();

  const rvContext = RVContext.create(context);
  /*
    rvContext.lineTracker.onDidChangeActiveLines(async () => {
      console.log('LineTracker: line changed ', rvContext.lineTracker.currentLine);
      if (window.activeTextEditor) {
        annotateSourceLines(window.activeTextEditor);
      }
    });
  */

  // const programMemoryProvider = new ProgramMemoryProvider(rvContext);
  // context.subscriptions.push(
  //   workspace.registerTextDocumentContentProvider(
  //     ProgramMemoryProvider.scheme,
  //     programMemoryProvider
  //   )
  // );

  // const binaryEncodingProvider = new BinaryEncodingProvider(rvContext);
  // binaryEncodingProvider.registerHoverProviders();



  const activationTime = Date.now() - startTime;
  console.log(`%cExtension initialization finished. Took ${activationTime / 1000} secs.`, "color: blue;");
}

export function deactivate() {
  console.log('Deactivating extension');
}

/**
 *
 * Computes the internal representation for the current line under the cursor.
 *
 * @param rvContext extension context.
 */
function irForCurrentLine(rvContext: RVExtensionContext) {
  const editor = window.activeTextEditor;
  if (editor) {
    if (!rvContext.validIR()) {
      console.log(
        'Cannot be done as parser has not succeeded to produce a valid ir'
      );
      return undefined;
    }
    // Assume there is a valid internal representation of the source code.
    const currentLine = editor.selection.active.line;
    const ir = rvContext.getIRForInstructionAt(currentLine);
    return ir;
  } else {
    throw Error('No editor open.');
  }
}

function updateContext(
  uri: Uri,
  editor: TextEditor,
  rvContext: RVExtensionContext,
  statusBarItem: StatusBarItem,
  programMemoryProvider: ProgramMemoryProvider
) {
  if (RVExtensionContext.isValidFile(editor.document)) {
    rvContext.setSourceDocument(editor.document);
    let uri: Uri;
    if (rvContext.validIR()) {
      uri = encodeIR(editor.document.uri, true);
      reportBuildStatus(statusBarItem, 'Passed');
    } else {
      uri = encodeIR(editor.document.uri, false);
      reportBuildStatus(statusBarItem, 'Failure');
    }
    programMemoryProvider.onDidChangeEmitter.fire(uri);
    workspace.openTextDocument(uri).then((programMemoryDocument) => {
      window.showTextDocument(programMemoryDocument, {
        viewColumn: editor.viewColumn! + 1,
        preview: true,
        preserveFocus: true
      });
      rvContext.setProgramMemoryDocument(programMemoryDocument);
    });
  } else {
    // Skip as the document is not a riscv file.
  }
}

/**
 * Report the result of the program's parsing.
 * @param statusBarItem where the error is reported
 * @param status whether the parsing was successful ("Passed") or it resulted in
 * an error ("Failure")
 */
function reportBuildStatus(
  statusBarItem: StatusBarItem,
  status: 'Passed' | 'Failure'
) {
  if (status === 'Passed') {
    statusBarItem.text = 'RISCV: success build';
    statusBarItem.backgroundColor = new ThemeColor('statusBar.background');
    statusBarItem.show();
  } else {
    statusBarItem.text = 'RISCV: error';
    statusBarItem.backgroundColor = new ThemeColor(
      'statusBarItem.errorBackground'
    );
    statusBarItem.show();
  }
}

function simulateProgram(
  editor: TextEditor | undefined,
  extensionUri: Uri,
  rvContext: RVExtensionContext
) {
  if (editor) {
    const document = editor.document;
    rvContext.setSourceDocument(document);
    if (!rvContext.validIR()) {
      window.showErrorMessage('Build process failed. Cannot simulate program');
      return;
    }
    const simulator = SimulatorPanel.getPanel(extensionUri);
    if (simulator) {
      window.showInformationMessage('Starting simulation');
      rvContext.startSimulation(
        simulator,
        DataMemPanelView.render(extensionUri, {}),
        RegisterPanelView.render(extensionUri, {}),
        {
          sort: workspace
            .getConfiguration()
            .get('rv-simulator.registersView.sort'),
          initialSp: workspace
            .getConfiguration()
            .get(
              'rv-simulator.dataMemoryView.stackPointerInitialAddress'
            ) as number
        }
      );
    }
  }
}

function exportProgMemJSON(extensionUri: Uri, rvContext: RVExtensionContext) {
  const program = rvContext.exportJSON();
  workspace
    .openTextDocument({ language: 'json', content: program })
    .then((document) => {
      window.showTextDocument(document).then((editor) => {
        commands.executeCommand('editor.action.formatDocument');
      });
    });
}

/**
 * Exports the internal representation generated by the parser to a document and opens it.
 * @param extensionUri uri of the extension
 * @param rvContext extension context
 */
function exportIRJSON(extensionUri: Uri, rvContext: RVExtensionContext) {
  const ir = rvContext.getIR();
  const irString = JSON.stringify(ir);
  if (ir !== undefined) {
    workspace.openTextDocument({ language: 'json', content: irString });
  }
}