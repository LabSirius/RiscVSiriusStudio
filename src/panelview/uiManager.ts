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

  
}
