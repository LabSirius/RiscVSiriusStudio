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

async function detailsInstruction(instruction: any): Promise<MarkdownString | undefined> {
  console.log('Instruction', instruction);
  let strMarkdown = '';
  switch (instruction.type) {
    case 'R':
      strMarkdown = `- Type: ${instruction.type}\n- Opcode: ${instruction.opcode}\n- Funct3: ${instruction.encoding.funct3}\n- Funct7: ${instruction.encoding.funct7} \n- Rd: ${instruction.encoding.rd}\n- Rs1: ${instruction.encoding.rs1}\n- Rs2: ${instruction.encoding.rs2}`;
      break;
    case 'I':
      strMarkdown = `- Type: ${instruction.type}\n- Opcode: ${instruction.opcode}\n- Funct3: ${instruction.encoding.funct3}\n- Rd: ${instruction.encoding.rd}\n- Rs1: ${instruction.encoding.rs1}\n- Imm: ${instruction.encoding.imm12}`;
      break;
    case 'S':
      strMarkdown = `- Type: ${instruction.type}\n- Opcode: ${instruction.opcode}\n- Funct3: ${instruction.encoding.funct3}\n- Rs1: ${instruction.encoding.rs1}\n- Rs2: ${instruction.encoding.rs2}\n- Imm: ${instruction.encoding.imm12}`;
      break;
    case 'B':
      strMarkdown = `- Type: ${instruction.type}\n- Opcode: ${instruction.opcode}\n- Funct3: ${instruction.encoding.funct3}\n- Rs1: ${instruction.encoding.binEncoding.substring(12,17)}\n- Rs2: ${instruction.encoding.binEncoding.substring(7,12)}\n- Imm: ${instruction.encoding.imm13}`;
      break;
    case 'U':
      strMarkdown = `- Type: ${instruction.type}\n- Opcode: ${instruction.opcode}\n- Rd: ${instruction.encoding.rd}\n- Imm: ${instruction.encoding.imm21}`;
      break;
    case 'J':
      strMarkdown = `- Type: ${instruction.type}\n- Opcode: ${instruction.opcode}\n - Rd: ${instruction.encoding.rd}\n- Imm: ${instruction.encoding.imm21}`;
      break;
    default:
      return undefined;
  }
  const markdown = new MarkdownString(
    strMarkdown,
    true
  );
  console.log('Instruction', instruction);
  markdown.isTrusted = true;
  markdown.supportHtml = true;
  return markdown;
}
