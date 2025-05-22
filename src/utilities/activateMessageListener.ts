import { Webview, Uri } from "vscode";
 import { logger } from "../utilities/logger";
 import { RVContext } from "../support/context";
 
 export async function activateMessageListenerForRegistersView(
   webview: Webview,
   context: RVContext
 ) {
   webview.onDidReceiveMessage((message: any) => {
     switch (message.command) {
       case "log":
         console.log(message.object);
         break;
       case "event":
         console.log(message.object);
         context.dispatchMainViewEvent(message.object);
         break;
       default:
         console.log(message);
         logger().info("info", message.obj);
         break;
     }
   });
 }