/**
 * The webview↔extension message relay shared by the graphic and text simulator
 * entrypoints. Both bundles used to carry a byte-identical copy of this wiring
 * (an identical `UIManager` plus an identical `dispatch`/sender trio); they now
 * import this one module and differ only in *when* they start it (see
 * `startRelay` callers).
 *
 * The relay sits inside the webview between the VS Code host and the React
 * client: it forwards extension→webview messages to the client's `window`, and
 * folds webview→extension events into the `{ command: "event", object }` shape
 * the host consumes.
 */

/**
 * Bridges the two message directions for one webview. Holds the sender pair the
 * dispatcher uses; a single instance is created per webview via
 * {@link startRelay}.
 */
export class UIManager {

  public static instance: UIManager | undefined;

  private readonly sendMessagetoExtension: (msg: any) => void;
  private readonly sendMessageToReact: (msg: any) => void;

  private _isSimulating: boolean;
  get isSimulating(): boolean {
    return this._isSimulating;
  }

  public static createInstance(sendMessagetoExtension: (msg: any) => void, sendMessageToReact : (msg: any) => void ): UIManager {
    if (!this.instance) {
      this.instance = new UIManager(sendMessagetoExtension, sendMessageToReact);
    }
    return this.instance;
  }

  public static getInstance(): UIManager {
    if (!this.instance) {
      throw new Error('UIManager not initialized');
    } else {
      return this.instance;
    }
  }

  private constructor(sendMessagetoExtension: (msg: any) => void, sendMessageToReact : (msg: any) => void) {
    this._isSimulating = false;
    this.sendMessagetoExtension = sendMessagetoExtension;
    this.sendMessageToReact = sendMessageToReact;
  }

  public _sendMessageToReact(data: any) {
    this.sendMessageToReact(data);
  }

  public _sendMessageToExtension(data: any) {
    this.sendMessagetoExtension(data);
  }
}

/** Minimal view of the `acquireVsCodeApi()` handle the relay needs. */
interface VSCodeApi {
  postMessage: (message: any) => void;
}

/**
 * Wire up the relay for one webview against its VS Code API handle. Registers a
 * single `message` listener and creates the {@link UIManager} singleton. Callers
 * decide when to invoke this (immediately, or deferred to `load`).
 */
export function startRelay(vscode: VSCodeApi): void {
  /**
   * View→extension communication.
   * @param messageObject message to send to the extension
   */
  function sendMessageToExtension(messageObject: any) {
    vscode.postMessage(messageObject);
  }

  function sendMessageToReact(data: any) {
    // Forward the (already `from`-stripped) extension message unchanged. The
    // React client no longer keys off a `from` source tag — it validates every
    // inbound message at the boundary (`parseExtensionMessage`) — so this relay
    // stops rewriting `from` to "UIManager" (ticket 06). Omitting `from` also
    // stops the re-posted message from re-entering this dispatcher's
    // `extension`/`react` cases.
    window.postMessage(data, "*");
  }

  /**
   * Log functionality. The logger that is actually used is in the extension.
   * This function sends the message to the extension with all the information
   * required to log it.
   *
   * @param object the object to be logged
   * @param level logging level.
   */
  function log(object: any = {}, level: string = "info") {
    sendMessageToExtension({ level: level, command: "log", object: object });
  }

  function dispatch(event: MessageEvent) {
    log({ msg: "Dispatching message", data: event.data });
    const data = event.data;

    switch (data.from) {
      case "extension": {
        const { from, ...newData } = data;
        UIManager.getInstance()._sendMessageToReact(newData);
        break;
      }
      case "react": {
        const baseObject: any = { event: data.event };

        const eventValueMap: Record<string, keyof typeof data> = {
          clickInInstruction: "line",
          memorySizeChanged: "sizeMemory",
          configureMemory: "memorySize",
          registersChanged: "registers",
          memoryChanged: "memory",
        };

        const valueKey = eventValueMap[data.event];
        if (valueKey) {
          baseObject.value = data[valueKey];
        }

        UIManager.getInstance()._sendMessageToExtension({
          command: "event",
          object: baseObject,
        });

        break;
      }
    }
  }

  UIManager.createInstance(sendMessageToExtension, sendMessageToReact);
  window.addEventListener("message", (event) => {
    dispatch(event);
  });
}
