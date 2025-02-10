import { workspace } from "vscode";

export type EncoderUpdatePolicy = 'On change' | 'On save' | 'Manual';

export class ConfigurationManager {
  public constructor() {
    console.log("ConfigurationManager constructor");
  }

  public getEncoderUpdatePolicy(): EncoderUpdatePolicy {
    const editorCfg = workspace.getConfiguration('rv-simulator').editor;
    return editorCfg.encoderUpdatePolicy;
  }


  // private getMemorySettings() {
  //   return workspace.getConfiguration('rv-simulator.dataMemoryView');
  // }

  // private getRegisterSettings() {
  //   return workspace.getConfiguration('rv-simulator.registersView');
  // }

  // public getMemorySize(): number {
  //   return this.getMemorySettings().get('memorySize');
  // }

  // public getStackPointerAddress(): number {
  //   return this.getMemorySettings().get('stackPointerInitialAddress');
  // }
}