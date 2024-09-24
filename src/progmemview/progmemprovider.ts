import {
  CancellationToken,
  EventEmitter,
  ProviderResult,
  TextDocumentContentProvider,
  Uri
} from 'vscode';

export class ProgramMemoryProvider implements TextDocumentContentProvider {
  private onDidChangeEmitter = new EventEmitter<Uri>();
  onDidChange = this.onDidChangeEmitter.event;

  static scheme = 'progmem';

  provideTextDocumentContent(
    uri: Uri,
    token: CancellationToken
  ): ProviderResult<string> {
    // console.log('URI ', uri);
    const dataUri = decodeIR(uri);
    const ir = JSON.parse(dataUri);
    const instructions = ir.instructions as any[];
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
    ir.instructions.forEach((instruction: any) => {
      const memAddress = parseInt(instruction.inst)
        .toString(16)
        .padStart(padTitle, '0');
      const binEncoding = instruction.encoding.binEncoding;
      const hexEncoding = instruction.encoding.hexEncoding;
      lines.push(`${memAddress}\t${binEncoding}\t${hexEncoding}`);
    });
    return lines.join('\n');
  }
}

export function encodeIR(uri: Uri, json: any): Uri {
  const query = JSON.stringify([uri.toString(), json]);
  return Uri.parse(`${ProgramMemoryProvider.scheme}:riscv.rvbin?${query}`);
}

function decodeIR(uri: Uri): any {
  const obj = JSON.parse(uri.query)[1];
  return obj;
}
