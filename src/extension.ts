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
  Webview,
  WebviewView,
} from 'vscode';

import { SimulatorPanel } from './panels/SimulatorPanel';
import { activateMessageListener, activateMessageListenerForRegistersView, getHtmlForRegistersWebview, RegisterPanelView } from './panels/RegisterPanel';
import { DataMemPanelView } from './panels/DataMemPanel';
import { RiscCardPanel } from './panels/RiscCardPanel';
import { logger } from './utilities/logger';
import { RVExtensionContext } from './support/context';
import { encodeIR, ProgramMemoryProvider } from './progmemview/progmemprovider';
import { applyDecoration, removeDecoration } from './utilities/editor-utils';
import { BinaryEncodingProvider } from './support/hoverProvider';

export async function activate(context: ExtensionContext) {
  console.log('%cActivating extension RiscV', 'color: blue');
  const startTime = Date.now();


  const rvContext = new RVExtensionContext();
  const extensionUri = context.extensionUri;
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      'rv-simulator.registers',
      {
        resolveWebviewView: async (webviewView, context, token) => {
          console.log("Por aqui");
          webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [extensionUri],
            // Other possibilities:
            // enableCommandsUris
          };

          webviewView.title = "Some title";
          webviewView.webview.html = await getHtmlForRegistersWebview(webviewView.webview, extensionUri);
          await activateMessageListenerForRegistersView(webviewView.webview);
        },
      },
      {
        webviewOptions: { retainContextWhenHidden: true }
      }
    )
  );

  // // Registers view
  // context.subscriptions.push(
  //   window.registerWebviewViewProvider(
  //     'rv-simulator.registers',
  //     RegisterPanelView.render(context.extensionUri, {}),
  //     { webviewOptions: { retainContextWhenHidden: true } }
  //   )
  // );

  const programMemoryProvider = new ProgramMemoryProvider(rvContext);
  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      ProgramMemoryProvider.scheme,
      programMemoryProvider
    )
  );

  const binaryEncodingProvider = new BinaryEncodingProvider(rvContext);
  binaryEncodingProvider.registerHoverProviders();

  // Data memory view
  // context.subscriptions.push(
  //   window.registerWebviewViewProvider(
  //     'rv-simulator.datamem',
  //     DataMemPanelView.render(context.extensionUri, {}),
  //     { webviewOptions: { retainContextWhenHidden: true } }
  //   )
  // );

  const statusBarItem = window.createStatusBarItem('RVSiriusStudioBarItem', 1);
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
          editor,
          rvContext,
          statusBarItem,
          programMemoryProvider
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
    commands.registerCommand('rv-simulator.irExportJSON', () => {
      exportIRJSON(context.extensionUri, rvContext);
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
    const stackPointerAddress = workspace
      .getConfiguration()
      .get('rv-simulator.dataMemoryView.stackPointerInitialAddress') as number;
    const memSize = workspace
      .getConfiguration()
      .get('rv-simulator.dataMemoryView.memorySize') as number;
    // TODO: Check that the stack pointer address is less than the las address of the DM
    rvContext.setMemorySize(memSize);
    rvContext.setSpAddress(stackPointerAddress);
  });

  /**
   * This will build the program every time the file is saved.
   */
  workspace.onDidSaveTextDocument((document) => {
    if (!window.activeTextEditor) {
      console.error('Saving a document without an active text editor');
      return;
    }
    updateContext(
      context.extensionUri,
      window.activeTextEditor,
      rvContext,
      statusBarItem,
      programMemoryProvider
    );
  });

  workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
    if (!window.activeTextEditor) {
      console.error('Changing a document without an active text editor');
      return;
    }
    updateContext(
      context.extensionUri,
      window.activeTextEditor,
      rvContext,
      statusBarItem,
      programMemoryProvider

    );
  });

  window.onDidChangeActiveTextEditor((editor: TextEditor | undefined) => {
    if (!editor) {
      return;
    }
    updateContext(
      context.extensionUri,
      editor,
      rvContext,
      statusBarItem,
      programMemoryProvider
    );
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
        const programMemoryDocument = rvContext.getProgramMemoryDocument();
        if (programMemoryDocument === undefined) {
          return;
        }

        window
          .showTextDocument(programMemoryDocument, {
            viewColumn: editor.viewColumn! + 1,
            preview: true,
            preserveFocus: true
          })
          .then((programMemoryEditor) => {
            const currentSourceLine = editor.selection.active.line;
            const memoryEditorLine = rvContext
              .getSourceCodeMap()
              .get(currentSourceLine);
            if (memoryEditorLine === undefined) {
              // remove decorations
              removeDecoration(programMemoryEditor);
              return;
            }
            applyDecoration(memoryEditorLine, programMemoryEditor);
          });
      }
    }
  );
  const activationTime = Date.now() - startTime;
  console.log(`%cExtension initialization finished. Took ${activationTime / 1000} secs.`, "color: blue;");
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