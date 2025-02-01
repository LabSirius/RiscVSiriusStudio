import { Disposable, ExtensionContext } from "vscode";

export class Container {
  static #instance: Container | undefined;

  private readonly _context: ExtensionContext;

  private _disposables: Disposable[];



  static create(context: ExtensionContext) {
    if (Container.#instance !== null) {
      throw new Error("Container is already initialized");
    }
    Container.#instance = new Container(context);
  }

  private constructor(context: ExtensionContext) {
    this._context = context;
    this._disposables = [];
  }
}