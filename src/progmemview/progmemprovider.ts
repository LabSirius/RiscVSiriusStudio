import {
  CancellationToken,
  EventEmitter,
  ProviderResult,
  TextDocumentContentProvider,
  Uri
} from 'vscode';
import { RVExtensionContext } from '../support/context';

export class ProgramMemoryProvider implements TextDocumentContentProvider {
  onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  static scheme = 'progmem';
  context: RVExtensionContext;
  constructor(context: RVExtensionContext) {
    this.context = context;
  }

  provideTextDocumentContent(
    uri: Uri,
    token: CancellationToken
  ): ProviderResult<string> {
    const dataUri = decodeIR(uri);

    if (!dataUri) {
      return 'Cannot generate program memory due to build errors!';
    }
    if (!this.context.validIR()) {
      throw new Error('Provider has an invalid IR');
    }
    this.context.clearFileAssociations();
    const instructions = this.context.getIR().instructions as any[];
    const lastInstruction = instructions.at(instructions.length - 1);
    const largestAddress = parseInt(lastInstruction.inst).toString(16).length;
    const padTitle =
      'Addr.'.length < largestAddress ? largestAddress : 'Addr.'.length;
    let lines = [] as string[];
    lines.push(
      'Addr.'.padEnd(padTitle, ' ') +
        '\t' +
        'Binary encoding'.padEnd(32, ' ') +
        '\t' +
        'Hex encoding'.padEnd(12, ' ')
    );
    instructions.forEach((instruction: any, index) => {
      const memAddress = parseInt(instruction.inst)
        .toString(16)
        .padStart(padTitle, '0');
      const binEncoding = instruction.encoding.binEncoding;
      const hexEncoding = instruction.encoding.hexEncoding;
      this.context.getProgramMemoryMap().set(lines.length, index);
      this.context.setProgramMemoryForSourceCodeLine(
        instruction.location.start.line - 1,
        index + 1
      );
      lines.push(`${memAddress}\t${binEncoding}\t${hexEncoding}`);
    });
    return lines.join('\n');
  }
}

export function encodeIR(uri: Uri, ir: any): Uri {
  const query = JSON.stringify([uri.toString(), ir]);
  return Uri.parse(`${ProgramMemoryProvider.scheme}:riscv.rvbin?${query}`);
}

function decodeIR(uri: Uri): any {
  const obj = JSON.parse(uri.query)[1];
  return obj;
}
