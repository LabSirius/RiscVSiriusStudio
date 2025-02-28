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


async function detailsMessage(ir: any | undefined): Promise<MarkdownString | undefined> {
  const markdown = new MarkdownString();
  markdown.isTrusted = true;

  if (!ir) {
    markdown.appendMarkdown(`### Instrucción no definida\n`);
    return markdown;
  }

  console.log("IR: ", ir);



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
      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;25&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24&nbsp;&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");

      break;

    case "I":
      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[11:0]      rs1     funct3   rd      opcode  \n");
      markdown.appendMarkdown(`${encoding["imm12"]}   ${encoding["rs1"]}   ${encoding["funct3"]}      ${encoding["rd"]}   ${opcode}  \n`);
      markdown.appendMarkdown("```\n");

      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;


    case "S":

      let immHi = encoding["imm12"].substring(0, 7);  // Bits 11:5 (los primeros 7 bits)
      let immLo = encoding["imm12"].substring(7, 12); // Bits 4:0 (los últimos 5 bits)

      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[11:5]   rs2     rs1     funct3   imm[4:0]   opcode  \n");
      markdown.appendMarkdown(`${immHi}     ${encoding["rs2"]}   ${encoding["rs1"]}   ${encoding["funct3"]}      ${immLo}      ${opcode}  \n`);
      markdown.appendMarkdown("```\n");

      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;25&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;



    case "B":
      let imm13 = encoding["imm13"];
      let immSub12 = imm13[0];
      let immSub10to5 = imm13.substring(1, 7);
      let immSub4to1 = imm13.substring(7, 11);
      let immSub11 = imm13[11];

      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[12]   imm[10:5]   rs2     rs1     funct3   imm[4:1]   imm[11]   opcode  \n");
      markdown.appendMarkdown(`${immSub12}      ${immSub10to5}     ${encoding["rs2"]}   ${encoding["rs1"]}   ${encoding["funct3"]}      ${immSub4to1}      ${immSub11}      ${opcode}  \n`);
      markdown.appendMarkdown("```\n");

      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;30&nbsp;&nbsp;&nbsp;&nbsp;25&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;24&nbsp;&nbsp;&nbsp;&nbsp;20&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;19&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;15&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;14&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;

    case "U":
      let imm20 = encoding["imm21"].substring(0, 20); // Bits 31:12

      markdown.appendMarkdown("```\n\n");
      markdown.appendMarkdown("imm[31:12]             rd      opcode  \n");
      markdown.appendMarkdown(`${imm20}   ${encoding["rd"]}   ${opcode}  \n`);
      markdown.appendMarkdown("```\n");

      markdown.appendMarkdown("##### 31&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;12&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  \n\n");
      break;

    case "J":
      let immJ20 = encoding["imm[20]"];
      let immJ10to1 = encoding["imm[10:1]"];
      let immJ11 = encoding["imm[11]"];
      let immJ19to12 = encoding["imm[19:12]"];

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
    console.log("####################");
    console.log("Decorating ", editor.document.uri.toString());
    console.log("####################");

    const ml = EncoderDecorator.maxLength(editor.document);

    async function updateDecorations() {
      debugger;
      const decorations = [];
      for (let i = 0; i < editor.document.lineCount; i++) {
        const line = editor.document.lineAt(i);
        const ir = rvDoc.getIRForLine(i);
        let irText = ir ? ir.encoding.binEncoding : '';
        if (irText.length > 0) {
          const memAddress: number = ir ? ir.inst : 0;
          const memAddressHex: string = "0x" + memAddress.toString(16);
          irText = `${memAddressHex.padEnd(5, " ")}  ${irText}`;
        }

        decorations.push({
          range: line.range,
          hoverMessage: await detailsMessage(ir),
          renderOptions: {
            // isWholeLine: true,
            after: {
              contentText: irText,
              margin: `0 0 0 ${(ml - line.text.length + 5) * 10}px`,
              // fontWeight: 'bold',
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

  public clearDecorations(editor: TextEditor) {
    editor.setDecorations(encoderDecoration, []);
  }
}
