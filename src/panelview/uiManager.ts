export class UIManager {

  public static instance: UIManager | undefined;

  private readonly sendMessagetoExtension: (msg: any) => void;
  private readonly sendMessageToPanelView: (msg: any) => void;

  private _isSimulating: boolean;
  get isSimulating(): boolean {
    return this._isSimulating;
  }

  public static createInstance(sendMessagetoExtension: (msg: any) => void, sendMessageToPanelView : (msg: any) => void ): UIManager {
    if (!this.instance) {
      this.instance = new UIManager(sendMessagetoExtension, sendMessageToPanelView);
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

  private constructor(sendMessagetoExtension: (msg: any) => void, sendMessageToPanelView : (msg: any) => void) {
    this._isSimulating = false;
    this.sendMessagetoExtension = sendMessagetoExtension;
    this.sendMessageToPanelView = sendMessageToPanelView;
  }

  public _sendMessageToPanelView(data: any) {
    this.sendMessageToPanelView(data);
  }

  
}
