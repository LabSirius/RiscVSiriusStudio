import { MarkdownString, TextDocument, TextEditor, TextEditorDecorationType, window } from "vscode";
import { RVDocument } from "./rvDocument";
import internal from "stream";
import { InternalRepresentation } from "./utilities/riscvc";

const encoderDecoration: TextEditorDecorationType = window.createTextEditorDecorationType({
  after: {
    margin: '0 0 0 3em',
    textDecoration: 'none',
    // color: '#999999'
  }
});

const errorBackgroundDecoration: TextEditorDecorationType = window.createTextEditorDecorationType({
  isWholeLine: true,
  backgroundColor: 'rgba(51, 38, 38, 1)'
});

const errorMessageDecoration: TextEditorDecorationType = window.createTextEditorDecorationType({
  after: {
    color: '#FF1100',
    textDecoration: 'none'
  }
});

async function detailsMessage(ir: any | undefined): Promise<MarkdownString | undefined> {
  const markdown = new MarkdownString();
  markdown.isTrusted = true;

  if (!ir) {
    return;
  }

  const type = ir["type"] || "Unknown";
  const asm = ir["asm"] || "???";
  const encoding = ir["encoding"];
  const opcode = ir["opcode"];

  markdown.appendMarkdown(`###  RISC-V Instruction Breakdown\n`);
  markdown.appendMarkdown(`#### Instruction: \`${asm}\` (*${type}-Type*)\n`);
  markdown.appendMarkdown(`#### Hexadecimal:   \`${encoding["hexEncoding"]}\`  \n`);

  switch (type) {
    case "R":
      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("funct7     rs2     rs1     funct3   rd      opcode  \n");
      markdown.appendMarkdown(`${encoding["funct7"]}    ${encoding["rs2"]}   ${encoding["rs1"]}   ${encoding["funct3"]}      ${encoding["rd"]}   ${opcode}  \n`);
      markdown.appendMarkdown("```\n");
      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;25&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24&nbsp;&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;
    case "I":
      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[11:0]      rs1     funct3   rd      opcode  \n");
      markdown.appendMarkdown(`${encoding["imm12"]}   ${encoding["rs1"]}   ${encoding["funct3"]}      ${encoding["rd"]}   ${opcode}  \n`);
      markdown.appendMarkdown("```\n");
      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;
    case "S":
      const immHi = encoding["imm12"].substring(0, 7);  // Bits 11:5
      const immLo = encoding["imm12"].substring(7, 12);   // Bits 4:0
      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[11:5]   rs2     rs1     funct3   imm[4:0]   opcode  \n");
      markdown.appendMarkdown(`${immHi}     ${encoding["rs2"]}   ${encoding["rs1"]}   ${encoding["funct3"]}      ${immLo}      ${opcode}  \n`);
      markdown.appendMarkdown("```\n");
      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;25&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;
    case "B":
      let immSub12 = encoding["imm[12]"];
      let immSub10to5 = encoding["imm[10:5]"];
      let immSub4to1 = encoding["imm[4:1]"];
      let immSub11 = encoding["imm[11]"];
      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[12]   imm[10:5]   rs2     rs1     funct3   imm[4:1]   imm[11]   opcode  \n");
      markdown.appendMarkdown(`${immSub12}      ${immSub10to5}     ${encoding["rs2"]}   ${encoding["rs1"]}   ${encoding["funct3"]}      ${immSub4to1}      ${immSub11}      ${opcode}  \n`);
      markdown.appendMarkdown("```\n");
      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;30&nbsp;&nbsp;&nbsp;&nbsp;25&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24&nbsp;&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;
    case "U":
      const imm20 = encoding["imm21"].substring(0, 20);
      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[31:12]             rd      opcode  \n");
      markdown.appendMarkdown(`${imm20}   ${encoding["rd"]}   ${opcode}  \n`);
      markdown.appendMarkdown("```\n");
      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;
    case "J":
      const immJ20 = encoding["imm[20]"];
      const immJ10to1 = encoding["imm[10:1]"];
      const immJ11 = encoding["imm[11]"];
      const immJ19to12 = encoding["imm[19:12]"];
      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[20]  imm[10:1]   imm[11]   imm[19:12]   rd     opcode  \n");
      markdown.appendMarkdown(`${immJ20}        ${immJ10to1}  ${immJ11}         ${immJ19to12}     ${encoding["rd"]}      ${opcode}  \n`);
      markdown.appendMarkdown("```\n");
      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;30&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;18&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;
    default:
      markdown.appendMarkdown(`⚠️ No se reconoce el formato de instrucción.\n`);
  }

  return markdown;
}

export class EncoderDecorator {

  private static maxLength(document: TextDocument): number {
    let max = 0;
    for (let i = 0; i < document.lineCount; i++) {
      const lineLength = document.lineAt(i).text.length;
      max = Math.max(max, lineLength);
    }
    return max;
  }

  public async decorate(rvDoc: RVDocument) {
    const editor = rvDoc.editor;
    const ml = EncoderDecorator.maxLength(editor.document);
    async function updateDecorations() {
      const decorations = [];
      for (let i = 0; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        const ir = rvDoc.getIRForLine(i);
        let irText = ir ? ir.encoding.binEncoding : '';
        if (irText.length > 0) {
          irText = ` ${irText}`;
        }
        decorations.push({
          range: line.range,
          hoverMessage: await detailsMessage(ir),
          renderOptions: {
            after: {
              contentText: irText,
              margin: `0 0 0 ${(ml - line.text.length + 5)}ch`,
              textAlign: 'right',
              opacity: 0.5
            }
          }
        });
      }
      editor.setDecorations(encoderDecoration, decorations);
    }
    await updateDecorations();
  }

  public async decorateError(rvDoc: RVDocument) {
    const editor = rvDoc.editor;
    const backgroundDecorations = [];
    const messageDecorations = [];
    for (let i = 0; i < editor.document.lineCount; i++) {
      const line = editor.document.lineAt(i);
      if (rvDoc.error && rvDoc.error.location && (rvDoc.error.location.start.line - 1) === i) {
        backgroundDecorations.push({ range: line.range });

        messageDecorations.push({
          range: line.range,
          renderOptions: {
            after: {
              contentText: ` ERROR: ${rvDoc.error.message || "Compilation error"}`,
              margin: `0 0 0 3rem`
            }
          }
        });
      }
    }
    editor.setDecorations(errorBackgroundDecoration, backgroundDecorations);
    editor.setDecorations(errorMessageDecoration, messageDecorations);
  }

  public clearDecorations(editor: TextEditor): void {
    editor.setDecorations(encoderDecoration, []);
    editor.setDecorations(errorBackgroundDecoration, []);
    editor.setDecorations(errorMessageDecoration, []);
  }
}
