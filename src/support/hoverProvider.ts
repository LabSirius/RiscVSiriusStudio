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
      strMarkdown = 
      `<html>
      <body>
        <div>
          <h4>R-Type Instruction</h4>
          <table class="table">
            <tr><td><b>Opcode:</b></td><td>${instruction.opcode}</td></tr>
            <tr><td><b>Rs1:</b></td><td>${instruction.encoding.rs1}</td></tr>
            <tr><td><b>Rs2:</b></td><td>${instruction.encoding.rs2}</td></tr>
            <tr><td><b>Rd:</b></td><td>${instruction.encoding.rd}</td></tr>
            <tr><td><b>Funct3:</b></td><td>${instruction.encoding.funct3}</td></tr>
            <tr><td><b>Funct7:</b></td><td>${instruction.encoding.funct7}</td></tr>
          </table>
        </div>
      </body>
      </html>`;
      break;
    case 'I':
      strMarkdown = 
      `<html>
      <body>
        <div>
          <h4>I-Type Instruction</h4>
          <table class="table">
            <tr><td><b>Opcode:</b></td><td>${instruction.opcode}</td></tr>
            <tr><td><b>Rs1:</b></td><td>${instruction.encoding.rs1}</td></tr>
            <tr><td><b>Rd:</b></td><td>${instruction.encoding.rd}</td></tr>
            <tr><td><b>Funct3:</b></td><td>${instruction.encoding.funct3}</td></tr>
            <tr><td><b>Imm:</b></td><td>${instruction.imm12}</td></tr>
          </table>
        </div>
      </body>
      </html>`;
      break;
    case 'S':
      strMarkdown = 
      `<html>
        <head>
          ${bootstrapCSS}
        </head>
        <body>
          <div>
            <h4>S-Type Instruction</h4>
            <table class="table">
            <tr><td><b>Opcode:</b></td><td>${instruction.opcode}</td></tr>
            <tr><td><b>Rs1:</b></td><td>${instruction.encoding.rs1}</td></tr>
            <tr><td><b>Rs2:</b></td><td>${instruction.encoding.rs2}</td></tr>
            <tr><td><b>Funct3:</b></td><td>${instruction.encoding.funct3}</td></tr>
            <tr><td><b>Imm:</b></td><td>${instruction.imm12}</td></tr>
            </table>
          </div>
        </body>
      </html>`;
      break;
    case 'B':
      strMarkdown = 
      `<html>
        <head>
          ${bootstrapCSS}
        </head>
        <body>
          <div>
            <h4>B-Type Instruction</h4>
            <table class="table">
            <tr><td><b>Opcode:</b></td><td>${instruction.opcode}</td></tr>
            <tr><td><b>Rs1:</b></td><td>${instruction.encoding.binEncoding.substring(12,17)}</td></tr>
            <tr><td><b>Rs2:</b></td><td>${instruction.encoding.binEncoding.substring(7,12)}</td></tr>
            <tr><td><b>Funct3:</b></td><td>${instruction.encoding.funct3}</td></tr>
            <tr><td><b>Imm:</b></td><td>${instruction.imm13}</td></tr>
            </table>
          </div>
        </body>
      </html>`;
      break;
    case 'U':
      strMarkdown = 
      `<html>
      <body>
      <div>
        <h4>U-Type Instruction</h4>
        <table class="table">
        <tr><td><b>Opcode:</b></td><td>${instruction.opcode}</td></tr>
        <tr><td><b>Rd:</b></td><td>${instruction.encoding.rd}</td></tr>
        <tr><td><b>Imm:</b></td><td>${instruction.imm21}</td></tr>
        </table>
      </div>
      </body>
      </html>`;
      break;
    case 'J':
      strMarkdown = 
      `<html>
        <head>
        ${bootstrapCSS}
        </head>
          <body>
            <div>
              <h4>J-Type Instruction</h4>
              <table class="table">
              <tr><td><b>Opcode:</b></td><td>${instruction.opcode}</td></tr>
              <tr><td><b>Rd:</b></td><td>${instruction.encoding.rd}</td></tr>
              <tr><td><b>Imm:</b></td><td>${instruction.imm21}</td></tr>
              </table>
            </div>
          </body>
      </html>`;
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
