import {
  commands,
  ConfigurationChangeEvent,
  ExtensionContext,
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
  TextEditorSelectionChangeEvent,
  Uri,
  window,
  workspace,
  ProgressLocation,
  ThemeColor,
  StatusBarItem
} from 'vscode';

import { SimulatorPanel } from './panels/SimulatorPanel';
import { RegisterPanelView } from './panels/RegisterPanel';
import { DataMemPanelView } from './panels/DataMemPanel';
import { RiscCardPanel } from './panels/RiscCardPanel';
import { logger } from './utilities/logger';
import { RVExtensionContext } from './support/context';
import { setTimeout } from 'timers/promises';
import { encodeIR, ProgramMemoryProvider } from './progmemview/progmemprovider';
import { applyDecoration } from './utilities/editor-utils';

export function activate(context: ExtensionContext) {
  console.log('Activating extension');
  logger().info('Activating extension');
  const rvContext = new RVExtensionContext();

  // Registers view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      'rv-simulator.registers',
      RegisterPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  const programMemoryProvider = new ProgramMemoryProvider();
  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      ProgramMemoryProvider.scheme,
      programMemoryProvider
    )
  );

  // Data memory view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      'rv-simulator.datamem',
      DataMemPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  const statusBarItem = window.createStatusBarItem('RVSiriusStudioBarItem', 1);
  // statusBarItem.backgroundColor = new ThemeColor(
  //   "statusBarItem.errorBackground"
  // );
  statusBarItem.text = 'RiscVSiriusStudio';
  statusBarItem.show();

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.simulate', () => {
      const editor = window.activeTextEditor;
      simulateProgram(editor, context.extensionUri, rvContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.build', () => {
      const editor = window.activeTextEditor;
      if (editor) {
        updateContext(
          context.extensionUri,
          editor.document,
          rvContext,
          statusBarItem
        );
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.progMemExportJSON', () => {
      exportProgMemJSON(context.extensionUri, rvContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.irForCurrentLine', () => {
      irForCurrentLine(rvContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand('rv-simulator.ShowCard', () => {
      RiscCardPanel.riscCard(context.extensionUri);
    })
  );

  /**
   * Reflect changes of vscode files to the extension context.
   *
   */

  workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    console.log('Configuration change occurred.');
    const codeSync = workspace
      .getConfiguration()
      .get('rv-simulator.programMemoryView.codeSynchronization');
    const instFormat = workspace
      .getConfiguration()
      .get('rv-simulator.programMemoryView.instructionFormat');
    const stackPointerAddress = workspace
      .getConfiguration()
      .get('rv-simulator.dataMemoryView.stackPointerInitialAddress') as number;
    const memSize = workspace
      .getConfiguration()
      .get('rv-simulator.dataMemoryView.memorySize') as number;
    const sort = workspace
      .getConfiguration()
      .get('rv-simulator.registersView.sort');
    // TODO: Check that the stack pointer address is less than the las address of the DM
    rvContext.setMemorySize(memSize);
    rvContext.setSpAddress(stackPointerAddress);
  });

  /**
   * This will build the program every time the file is saved.
   */
  workspace.onDidSaveTextDocument((document) => {
    // console.log('Save editor event');
    updateContext(context.extensionUri, document, rvContext, statusBarItem);
  });

  /**
   * This will build the program every time the document changes
   */
  workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
    const document = event.document;
    updateContext(context.extensionUri, document, rvContext, statusBarItem);
  });

  /**
   * Update the program memory editor with the user interaction on the source
   * code editor.
   */
  window.onDidChangeTextEditorSelection(
    (event: TextEditorSelectionChangeEvent) => {
      const editor = event.textEditor;
      const document = editor.document;
      // This event will trigger for any workspace file.
      if (RVExtensionContext.isValidFile(document)) {
        updateContext(context.extensionUri, document, rvContext, statusBarItem);
        if (!rvContext.validIR()) {
          return;
        }
        // open or refresh the associated program memory file
        const jsonIR = JSON.stringify(rvContext.getIR());
        const uri = encodeIR(document.uri, jsonIR);
        workspace.openTextDocument(uri).then((programMemoryDocument) => {
          window
            .showTextDocument(programMemoryDocument, {
              viewColumn: editor.viewColumn! + 1,
              preview: true,
              preserveFocus: true
            })
            .then((programMemoryEditor) => {
              const currentSourceLine = editor.selection.active.line;
              const encodingForCurrentLine = encodingForSourceLine(
                rvContext,
                currentSourceLine,
                programMemoryDocument
              );
              applyDecoration(encodingForCurrentLine, programMemoryEditor);
            });
        });
      }
    }
  );
}

/**
 * Returns the line number in the program memory with the encoding of the
 * instruction at sourceLine
 */
function encodingForSourceLine(
  rvContext: RVExtensionContext,
  sourceLine: number,
  programMemoryDocument: TextDocument
) {
  const lineIr = rvContext.getIRForInstructionAt(sourceLine);
  const instAddress = parseInt(lineIr.inst).toString(16);
  for (let l = 0; l < programMemoryDocument.lineCount; l++) {
    const line = programMemoryDocument.lineAt(l);
    const address = line.text.substring(0, line.text.indexOf('\t'));
    if (address.endsWith(instAddress)) {
      return l;
    }
  }
  throw new Error('Corresponding address not found');
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
  document: TextDocument,
  rvContext: RVExtensionContext,
  statusBarItem: StatusBarItem
) {
  const fileName = document.fileName;
  if (RVExtensionContext.isValidFile(document)) {
    rvContext.setAndBuildCurrentFile(fileName, document.getText());
    if (rvContext.validIR()) {
      reportBuildStatus(statusBarItem, 'Passed');
    } else {
      reportBuildStatus(statusBarItem, 'Failure');
    }
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
    const fileName = document.fileName;
    rvContext.setAndBuildCurrentFile(fileName, document.getText());
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

function sendMessageToRegistersView(msg: any) {
  console.log('sending message to registersview', msg);
  const registers = RegisterPanelView.currentview?.getWebView();
  if (registers) {
    registers.postMessage(msg);
  }
}
