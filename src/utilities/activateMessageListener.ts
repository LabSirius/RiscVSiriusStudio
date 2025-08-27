import { Webview } from "vscode";
import { logger } from "../utilities/logger";
import { RVContext } from "../support/context";

export async function activateMessageListenerForRegistersView(
  webview: Webview,
  context: RVContext
) {
  webview.onDidReceiveMessage((message: any) => {
    switch (message.command) {
      case "log":
        break;
      case "event":
        context.dispatchMainViewEvent(message.object);
        break;
      default:
        console.log(message);
        break;
    }
  });
}
