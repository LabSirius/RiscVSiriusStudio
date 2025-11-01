import { ConfigurationChangeEvent, Disposable, workspace } from "vscode";

export type EncoderUpdatePolicy = 'On change' | 'On save' | 'Manual';

export class ConfigurationManager {
  public constructor() { }

  public getEncoderUpdatePolicy(): EncoderUpdatePolicy {
    const editorCfg = workspace.getConfiguration('rv-simulator').editor;
    return editorCfg.encoderUpdatePolicy;
  }

   public getConfiguration() {
    return workspace.getConfiguration('rv-simulator');
  }

  public onConfigurationChanged(listener: (e: ConfigurationChangeEvent) => any): Disposable {
    return workspace.onDidChangeConfiguration(listener);
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