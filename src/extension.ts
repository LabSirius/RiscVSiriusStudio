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
  StatusBarItem,
} from "vscode";

import { SimulatorPanel } from "./panels/SimulatorPanel";
import { RegisterPanelView } from "./panels/RegisterPanel";
import { ProgMemPanelView } from "./panels/ProgMemPanel";
import { DataMemPanelView } from "./panels/DataMemPanel";
import { InstructionPanelView } from "./panels/InstructionPanel";
import { RiscCardPanel } from "./panels/RiscCardPanel";
import { logger } from "./utilities/logger";
import { RVExtensionContext } from "./support/context";
import { setTimeout } from "timers/promises";

export function activate(context: ExtensionContext) {
  console.log("Activating extension");
  logger().info("Activating extension");
  const rvContext = new RVExtensionContext();

  // Registers view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.registers",
      RegisterPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Program memory view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.progmem",
      ProgMemPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Data memory view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.datamem",
      DataMemPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // Instruction view
  context.subscriptions.push(
    window.registerWebviewViewProvider(
      "rv-simulator.instruction",
      InstructionPanelView.render(context.extensionUri, {}),
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  const statusBarItem = window.createStatusBarItem("RVSiriusStudioBarItem", 1);
  // statusBarItem.backgroundColor = new ThemeColor(
  //   "statusBarItem.errorBackground"
  // );
  statusBarItem.text = "RiscVSiriusStudio";
  statusBarItem.show();

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.simulate", () => {
      const editor = window.activeTextEditor;
      simulateProgram(editor, context.extensionUri, rvContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.build", () => {
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
    commands.registerCommand("rv-simulator.progMemExportJSON", () => {
      exportProgMemJSON(context.extensionUri, rvContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.irForCurrentLine", () => {
      irForCurrentLine(rvContext);
    })
  );

  context.subscriptions.push(
    commands.registerCommand("rv-simulator.ShowCard", () => {
      RiscCardPanel.riscCard(context.extensionUri);
    })
  );

  /**
   * Reflect changes of vscode files to the extension context.
   *
   */

  workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    console.log("Configuration change occurred.");
    const codeSync = workspace
      .getConfiguration()
      .get("rv-simulator.programMemoryView.codeSynchronization");
    const instFormat = workspace
      .getConfiguration()
      .get("rv-simulator.programMemoryView.instructionFormat");
    sendMessageToProgMemView({
      operation: "settingsChanged",
      settings: { codeSync: codeSync, instFormat: instFormat },
    });
    const sort = workspace
      .getConfiguration()
      .get("rv-simulator.registersView.sort");

    sendMessageToRegistersView({
      operation: "settingsChanged",
      settings: { sort: sort },
    });
    const memSize = workspace
      .getConfiguration()
      .get("rv-simulator.dataMemoryView.memorySize") as number;
    rvContext.setMemorySize(memSize);
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
    // console.log('Change text document event');
    const document = event.document;
    updateContext(context.extensionUri, document, rvContext, statusBarItem);
  });

  window.onDidChangeTextEditorSelection(
    (event: TextEditorSelectionChangeEvent) => {
      const editor = event.textEditor;
      const document = editor.document;
      // This event will trigger for any workspace file.
      if (RVExtensionContext.isValidFile(document)) {
        if (!rvContext.validIR()) {
          updateContext(
            context.extensionUri,
            document,
            rvContext,
            statusBarItem
          );
        }
        const ir = irForCurrentLine(rvContext);
        if (typeof ir !== "undefined") {
          rvContext.reflectInstruction(
            InstructionPanelView.render(context.extensionUri, {}),
            ProgMemPanelView.render(context.extensionUri, {}),
            ir
          );
          // console.log('Editor selection ', ir);
        }
      }
    }
  );
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
        "Cannot be done as parser has not succeeded to produce a valid ir"
      );
      return undefined;
    }
    // Assume there is a valid internal representation of the source code.
    const currentLine = editor.selection.active.line;
    const ir = rvContext.getIRForInstructionAt(currentLine);
    return ir;
  } else {
    throw Error("No editor open.");
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
      statusBarItem.text = "RISCV: success build";
      statusBarItem.backgroundColor = new ThemeColor("statusBar.background");
      statusBarItem.show();
      rvContext.uploadIR(ProgMemPanelView.render(uri, {}));
    } else {
      statusBarItem.text = "RISCV: error";
      statusBarItem.backgroundColor = new ThemeColor(
        "statusBarItem.errorBackground"
      );
      statusBarItem.show();
    }
  } else {
    // Skip as the document is not a riscv file.
    // console.log('Called on invalid document');
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
      window.showErrorMessage("Build process failed. Cannot simulate program");
      return;
    }
    const simulator = SimulatorPanel.getPanel(extensionUri);
    if (simulator) {
      window.showInformationMessage("Starting simulation");
      rvContext.startSimulation(
        simulator,
        ProgMemPanelView.render(extensionUri, {}),
        DataMemPanelView.render(extensionUri, {}),
        RegisterPanelView.render(extensionUri, {}),
        InstructionPanelView.render(extensionUri, {})
      );
    }
  }
}

function exportProgMemJSON(
  extensionUri: string,
  rvContext: RVExtensionContext
) {
  const program = rvContext.exportJSON();
  workspace
    .openTextDocument({ language: "json", content: program })
    .then((document) => {
      window.showTextDocument(document).then((editor) => {
        commands.executeCommand("editor.action.formatDocument");
      });
    });
}

function sendMessageToProgMemView(msg: any) {
  console.log("sending message to progmemview", msg);
  const progmem = ProgMemPanelView.currentview?.getWebView();
  if (progmem) {
    progmem.postMessage(msg);
  }
}

function sendMessageToRegistersView(msg: any) {
  console.log("sending message to registersview", msg);
  const registers = RegisterPanelView.currentview?.getWebView();
  if (registers) {
    registers.postMessage(msg);
  }
}
