import { WebviewPanel, window, ViewColumn, Uri, Webview } from "vscode";

export class RiscCardPanel {
  public static currentPanel: WebviewPanel | undefined;

  public static riscCard(extensionUri: Uri) {
    if (RiscCardPanel.currentPanel) {
      RiscCardPanel.currentPanel.dispose();
      RiscCardPanel.currentPanel = undefined;
      return "";
    }
    RiscCardPanel.currentPanel = window.createWebviewPanel(
      "riscCard",
      "RISC-V Instruction Set",
      ViewColumn.One,
      { localResourceRoots: [Uri.joinPath(extensionUri, "node_modules")] }
    );
    const webview = RiscCardPanel.currentPanel.webview;
    webview.html = getCardContent(webview, extensionUri);
  }
}

function getCardContent(webview: Webview, extensionUri: Uri) {
  const bootstrapCSS = webview.asWebviewUri(
    Uri.joinPath(
      extensionUri,
      "node_modules",
      "bootstrap",
      "dist",
      "css",
      "bootstrap.min.css"
    )
  );
  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <link rel="stylesheet" , href="${bootstrapCSS}" />
        <title>RISC-V Instruction Set</title>
      </head>
      <body>
        <h1 class="display-1">RISC-V Instruction Set</h1>

        <h2>RV32I Instructions</h2>
        <p>By convention, <span class="badge text-bg-primary">msb</span> means most significant bit is extended while <span class="badge text-bg-primary">zero</span> means that zero is extended.</p>
        <table class="table table-hover">
          <thead class="table-light">
          <tr>
            <th>Inst</th>
            <th>Name</th>
            <th>FMT</th>
            <th>Opcode</th>
            <th>funct3</th>
            <th>funct7</th>
            <th>Description (C)</th>
          </tr>
          </thead>
          <tbody class="table-group-divider">
          <tr>
            <td class="font-monospace fs-5">add</td>
            <td>ADD</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x0</td>
            <td>0x00</td>
            <td>rd = rs1 + rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sub</td>
            <td>SUB</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x0</td>
            <td>0x20</td>
            <td>rd = rs1 - rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">xor</td>
            <td>XOR</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x4</td>
            <td>0x00</td>
            <td>rd = rs1 ^ rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">or</td>
            <td>OR</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x6</td>
            <td>0x00</td>
            <td>rd = rs1 | rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">and</td>
            <td>AND</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x7</td>
            <td>0x00</td>
            <td>rd = rs1 & rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sll</td>
            <td>Shift Left Logical</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x1</td>
            <td>0x00</td>
            <td>rd = rs1 << rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">srl</td>
            <td>Shift Right Logical</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x5</td>
            <td>0x00</td>
            <td>rd = rs1 >> rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sra</td>
            <td>Shift Right Arith <span class="badge text-bg-primary">msb</span></td>
            <td>R</td>
            <td>0110011</td>
            <td>0x5</td>
            <td>0x20</td>
            <td>rd = rs1 >> rs2</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">slt</td>
            <td>Set Less Than</td>
            <td>R</td>
            <td>0110011</td>
            <td>0x2</td>
            <td>0x00</td>
            <td>rd = (rs1 &lt; rs2) ? 1 : 0</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sltu</td>
            <td>Set Less Than (U) <span class="badge text-bg-primary">zero</span></td>
            <td>R</td>
            <td>0110011</td>
            <td>0x3</td>
            <td>0x00</td>
            <td>rd = (rs1 &lt; rs2) ? 1 : 0</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">addi</td>
            <td>ADD Immediate</td>
            <td>I</td>
            <td>0010011</td>
            <td>0x0</td>
            <td></td>
            <td>rd = rs1 + imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">xori</td>
            <td>XOR Immediate</td>
            <td>I</td>
            <td>0010011</td>
            <td>0x4</td>
            <td></td>
            <td>rd = rs1 ^ imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">ori</td>
            <td>OR Immediate</td>
            <td>I</td>
            <td>0010011</td>
            <td>0x6</td>
            <td></td>
            <td>rd = rs1 | imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">andi</td>
            <td>AND Immediate</td>
            <td>I</td>
            <td>0010011</td>
            <td>0x7</td>
            <td></td>
            <td>rd = rs1 & imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">slli</td>
            <td>Shift Left Logical Imm</td>
            <td>I</td>
            <td>0010011</td>
            <td>0x1</td>
            <td>imm[5:11]=0x00</td>
            <td>rd = rs1 << imm[4:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">srli</td>
            <td>Shift Right Logical Imm</td>
            <td>I</td>
            <td>0010011</td>
            <td>0x5</td>
            <td>imm[5:11]=0x00</td>
            <td>rd = rs1 >> imm[4:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">srai</td>
            <td>Shift Right Arith Imm <span class="badge text-bg-primary">msb</span></td>
            <td>I</td>
            <td>0010011</td>
            <td>0x5</td>
            <td>imm[5:11]=0x20</td>
            <td>rd = rs1 >> imm[4:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">slti</td>
            <td>Set Less Than Imm</td>
            <td>I</td>
            <td>0010011</td>
            <td>0x2</td>
            <td></td>
            <td>rd = (rs1 &lt; imm) ? 1 : 0</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sltiu</td>
            <td>Set Less Than Imm (U) <span class="badge text-bg-primary">zero</span></td>
            <td>I</td>
            <td>0010011</td>
            <td>0x3</td>
            <td></td>
            <td>rd = (rs1 &lt; imm) ? 1 : 0</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">lb</td>
            <td>Load Byte</td>
            <td>I</td>
            <td>0000011</td>
            <td>0x0</td>
            <td></td>
            <td>rd = M[rs1 + imm][7:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">lh</td>
            <td>Load Half</td>
            <td>I</td>
            <td>0000011</td>
            <td>0x1</td>
            <td></td>
            <td>rd = M[rs1 + imm][15:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">lw</td>
            <td>Load Word</td>
            <td>I</td>
            <td>0000011</td>
            <td>0x2</td>
            <td></td>
            <td>rd = M[rs1 + imm][31:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">lbu</td>
            <td>Load Byte (U) <span class="badge text-bg-primary">zero</span></td>
            <td>I</td>
            <td>0000011</td>
            <td>0x4</td>
            <td></td>
            <td>rd = M[rs1 + imm][7:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">lhu</td>
            <td>Load Half (U) <span class="badge text-bg-primary">zero</span></td>
            <td>I</td>
            <td>0000011</td>
            <td>0x5</td>
            <td></td>
            <td>rd = M[rs1 + imm][15:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sb</td>
            <td>Store Byte</td>
            <td>S</td>
            <td>0100011</td>
            <td>0x0</td>
            <td></td>
            <td>M[rs1 + imm][7:0] = rs2[7:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sh</td>
            <td>Store Half</td>
            <td>S</td>
            <td>0100011</td>
            <td>0x1</td>
            <td></td>
            <td>M[rs1 + imm][15:0] = rs2[15:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">sw</td>
            <td>Store Word</td>
            <td>S</td>
            <td>0100011</td>
            <td>0x2</td>
            <td></td>
            <td>M[rs1 + imm][31:0] = rs2[31:0]</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">beq</td>
            <td>Branch ==</td>
            <td>B</td>
            <td>1100011</td>
            <td>0x0</td>
            <td></td>
            <td>if (rs1 == rs2) PC += imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">bne</td>
            <td>Branch !=</td>
            <td>B</td>
            <td>1100011</td>
            <td>0x1</td>
            <td></td>
            <td>if (rs1 != rs2) PC += imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">blt</td>
            <td>Branch &lt;</td>
            <td>B</td>
            <td>1100011</td>
            <td>0x4</td>
            <td></td>
            <td>if (rs1 &lt; rs2) PC += imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">bge</td>
            <td>Branch &gt;=</td>
            <td>B</td>
            <td>1100011</td>
            <td>0x5</td>
            <td></td>
            <td>if (rs1 &gt;= rs2) PC += imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">bltu</td>
            <td>Branch &lt; (U) <span class="badge text-bg-primary">zero</span></td>
            <td>B</td>
            <td>1100011</td>
            <td>0x6</td>
            <td></td>
            <td>if (rs1 &lt; rs2) PC += imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">bgeu</td>
            <td>Branch &gt;= (U) <span class="badge text-bg-primary">zero</span></td>
            <td>B</td>
            <td>1100011</td>
            <td>0x7</td>
            <td></td>
            <td>if (rs1 &gt;= rs2) PC += imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">jal</td>
            <td>Jump And Link</td>
            <td>J</td>
            <td>1101111</td>
            <td></td>
            <td></td>
            <td>rd = PC + 4; PC += imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">jalr</td>
            <td>Jump And Link Reg</td>
            <td>I</td>
            <td>1100111</td>
            <td>0x0</td>
            <td></td>
            <td>rd = PC + 4; PC = rs1 + imm</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">lui</td>
            <td>Load Upper Imm</td>
            <td>U</td>
            <td>0110111</td>
            <td></td>
            <td></td>
            <td>rd = imm &lt;&lt; 12</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">auipc</td>
            <td>Add Upper Imm to PC</td>
            <td>U</td>
            <td>0010111</td>
            <td></td>
            <td></td>
            <td>rd = PC + (imm &lt;&lt; 12)</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">ecall</td>
            <td>Environment call</td>
            <td>I</td>
            <td>1110011</td>
            <td>0x0</td>
            <td>imm=0x0</td>
            <td>Transfer control to OS</td>
          </tr>
          <tr>
            <td class="font-monospace fs-5">ebreak</td>
            <td>Environment break</td>
            <td>I</td>
            <td>1110011</td>
            <td>0x0</td>
            <td>imm=0x1</td>
            <td>Transfer control to debugger</td>
          </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
}
