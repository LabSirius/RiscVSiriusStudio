import {
  TextDocument,
  Hover,
  Position,
  CancellationToken,
  MarkdownString,
  Disposable,
  languages
} from 'vscode';
import { ProgramMemoryProvider } from '../progmemview/progmemprovider';
import { RVExtensionContext } from './context';

export class BinaryEncodingProvider {
  private hoverProviderDisposable: Disposable | undefined;
  private context: RVExtensionContext;

  constructor(context: RVExtensionContext) {
    this.context = context;
    console.log('Called provider for binary encoding');
  }
  clear() {
    if (this.hoverProviderDisposable !== null) {
      this.hoverProviderDisposable?.dispose();
      this.hoverProviderDisposable = undefined;
    }
  }
  registerHoverProviders() {
    this.hoverProviderDisposable?.dispose();
    this.hoverProviderDisposable = languages.registerHoverProvider(
      { scheme: ProgramMemoryProvider.scheme },
      {
        provideHover: (
          document: TextDocument,
          position: Position,
          token: CancellationToken
        ) => this.provideHover(document, position, token)
      }
    );
  }

  async provideHover(
    document: TextDocument,
    position: Position,
    token: CancellationToken
  ): Promise<Hover | undefined> {
    const instructionIndex = this.context
      .getProgramMemoryMap()
      .get(position.line);
    if (instructionIndex === undefined) {
      console.error('undefined instruction index for ', position.line);
      return undefined;
    }
    const instruction = this.context.getIR().instructions[instructionIndex];
    const message = (
      await Promise.all([detailsInstruction(instruction)])
    ).filter(<T>(m?: T): m is T => Boolean(m));
    return new Hover(message);
  }
}

async function detailsInstruction(
  instruction: any
): Promise<MarkdownString | undefined> {
  const markdown = new MarkdownString(
    `- Type: ${instruction.type}\n- Opcode: ${instruction.opcode}
    `,
    true
  );
  markdown.isTrusted = true;
  markdown.supportHtml = true;
  return markdown;
}
