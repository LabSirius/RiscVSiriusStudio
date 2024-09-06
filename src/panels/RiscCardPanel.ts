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
      {
        enableScripts: true,
        localResourceRoots: [Uri.joinPath(extensionUri, "node_modules")],
      }
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
  const bootstrapJS = webview.asWebviewUri(
    Uri.joinPath(
      extensionUri,
      "node_modules",
      "bootstrap",
      "dist",
      "js",
      "bootstrap.bundle.min.js"
    )
  );

  return /*html*/ `
  <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" , href="${bootstrapCSS}" />
    <script src="${bootstrapJS}"></script>
    <title>RISC-V Instruction Set</title>
  </head>
  <body>
    <h1 class="display-1">RISC-V Instruction Set</h1>
    <h2>RV32I Instructions</h2>
    <p>By convention, <span class="badge text-bg-primary">msb</span> means most significant bit is extended while <span class="badge text-bg-primary">zero</span> means that zero is extended.</p>
    <div class="accordion" id="accordionInstructions">
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseR" aria-expanded="true" aria-controls="collapseR">
          <span class="lead fw-bold">R-type instructions</span>
          </button>
        </h2>
        <div id="collapseR" class="accordion-collapse collapse" data-bs-parent="#accordionInstructions">
          <div class="accordion-body">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">add</td>
                  <td>ADD</td>
                  <td>0110011</td>
                  <td>0x0</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = rs1 + rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">sub</td>
                  <td>SUB</td>
                  <td>0110011</td>
                  <td>0x0</td>
                  <td>0x20</td>
                  <td class="font-monospace">rd = rs1 - rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">xor</td>
                  <td>XOR</td>
                  <td>0110011</td>
                  <td>0x4</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = rs1 ^ rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">or</td>
                  <td>OR</td>
                  <td>0110011</td>
                  <td>0x6</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = rs1 | rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">and</td>
                  <td>AND</td>
                  <td>0110011</td>
                  <td>0x7</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = rs1 & rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">sll</td>
                  <td>Shift Left Logical</td>
                  <td>0110011</td>
                  <td>0x1</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = rs1 << rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">srl</td>
                  <td>Shift Right Logical</td>
                  <td>0110011</td>
                  <td>0x5</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = rs1 >> rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">sra</td>
                  <td>Shift Right Arith <span class="badge text-bg-primary">msb</span></td>
                  <td>0110011</td>
                  <td>0x5</td>
                  <td>0x20</td>
                  <td class="font-monospace">rd = rs1 >> rs2</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">slt</td>
                  <td>Set Less Than</td>
                  <td>0110011</td>
                  <td>0x2</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = (rs1 &lt; rs2) ? 1 : 0</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">sltu</td>
                  <td>Set Less Than (U) <span class="badge text-bg-primary">zero</span></td>
                  <td>0110011</td>
                  <td>0x3</td>
                  <td>0x00</td>
                  <td class="font-monospace">rd = (rs1 &lt; rs2) ? 1 : 0</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseI" aria-expanded="false" aria-controls="collapseI">
          <span class="lead fw-bold">I-type instructions</span>
          </button>
        </h2>
        <div id="collapseI" class="accordion-collapse collapse" data-bs-parent="#accordionInstructions">
          <div class="accordion-body">
            <span class="h5">Arithmetic and logical instructions.</span>
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">addi</td>
                  <td>ADD Immediate</td>
                  <td>0010011</td>
                  <td>0x0</td>
                  <td></td>
                  <td class="font-monospace">rd = rs1 + imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">xori</td>
                  <td>XOR Immediate</td>
                  <td>0010011</td>
                  <td>0x4</td>
                  <td></td>
                  <td class="font-monospace">rd = rs1 ^ imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">ori</td>
                  <td>OR Immediate</td>
                  <td>0010011</td>
                  <td>0x6</td>
                  <td></td>
                  <td class="font-monospace">rd = rs1 | imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">andi</td>
                  <td>AND Immediate</td>
                  <td>0010011</td>
                  <td>0x7</td>
                  <td></td>
                  <td class="font-monospace">rd = rs1 & imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">slli</td>
                  <td>Shift Left Logical Imm</td>
                  <td>0010011</td>
                  <td>0x1</td>
                  <td>imm[5:11]=0x00</td>
                  <td class="font-monospace">rd = rs1 << imm[4:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">srli</td>
                  <td>Shift Right Logical Imm</td>
                  <td>0010011</td>
                  <td>0x5</td>
                  <td>imm[5:11]=0x00</td>
                  <td class="font-monospace">rd = rs1 >> imm[4:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">srai</td>
                  <td>Shift Right Arith Imm <span class="badge text-bg-primary">msb</span></td>
                  <td>0010011</td>
                  <td>0x5</td>
                  <td>imm[5:11]=0x20</td>
                  <td class="font-monospace">rd = rs1 >> imm[4:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">slti</td>
                  <td>Set Less Than Imm</td>
                  <td>0010011</td>
                  <td>0x2</td>
                  <td></td>
                  <td class="font-monospace">rd = (rs1 &lt; imm) ? 1 : 0</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">sltiu</td>
                  <td>Set Less Than Imm (U) <span class="badge text-bg-primary">zero</span></td>
                  <td>0010011</td>
                  <td>0x3</td>
                  <td></td>
                  <td class="font-monospace">rd = (rs1 &lt; imm) ? 1 : 0</td>
                </tr>
              </tbody>
            </table>
            <span class="h5">Load instructions.</span>
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">lb</td>
                  <td>Load Byte</td>
                  <td>0000011</td>
                  <td>0x0</td>
                  <td></td>
                  <td class="font-monospace">rd = M[rs1 + imm][7:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">lh</td>
                  <td>Load Half</td>
                  <td>0000011</td>
                  <td>0x1</td>
                  <td></td>
                  <td class="font-monospace">rd = M[rs1 + imm][15:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">lw</td>
                  <td>Load Word</td>
                  <td>0000011</td>
                  <td>0x2</td>
                  <td></td>
                  <td class="font-monospace">rd = M[rs1 + imm][31:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">lbu</td>
                  <td>Load Byte (U) <span class="badge text-bg-primary">zero</span></td>
                  <td>0000011</td>
                  <td>0x4</td>
                  <td></td>
                  <td class="font-monospace">rd = M[rs1 + imm][7:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">lhu</td>
                  <td>Load Half (U) <span class="badge text-bg-primary">zero</span></td>
                  <td>0000011</td>
                  <td>0x5</td>
                  <td></td>
                  <td class="font-monospace">rd = M[rs1 + imm][15:0]</td>
                </tr>
              </tbody>
            </table>
            <span class="h5">Jump instructions.</span>
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">jalr</td>
                  <td>Jump And Link Reg</td>
                  <td>1100111</td>
                  <td>0x0</td>
                  <td></td>
                  <td class="font-monospace">rd = PC + 4; PC = rs1 + imm</td>
                </tr>
              </tbody>
            </table>
            <span class="h5">Control transfer instructions.</span>
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">ecall</td>
                  <td>Environment call</td>
                  <td>1110011</td>
                  <td>0x0</td>
                  <td>imm=0x0</td>
                  <td class="font-monospace">Transfer control to OS</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">ebreak</td>
                  <td>Environment break</td>
                  <td>1110011</td>
                  <td>0x0</td>
                  <td>imm=0x1</td>
                  <td class="font-monospace">Transfer control to debugger</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseS" aria-expanded="false" aria-controls="collapseS">
          <span class="lead fw-bold">S-type instructions</span>
          </button>
        </h2>
        <div id="collapseS" class="accordion-collapse collapse" data-bs-parent="#accordionInstructions">
          <div class="accordion-body">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">sb</td>
                  <td>Store Byte</td>
                  <td>0100011</td>
                  <td>0x0</td>
                  <td></td>
                  <td class="font-monospace">M[rs1 + imm][7:0] = rs2[7:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">sh</td>
                  <td>Store Half</td>
                  <td>0100011</td>
                  <td>0x1</td>
                  <td></td>
                  <td class="font-monospace">M[rs1 + imm][15:0] = rs2[15:0]</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">sw</td>
                  <td>Store Word</td>
                  <td>0100011</td>
                  <td>0x2</td>
                  <td></td>
                  <td class="font-monospace">M[rs1 + imm][31:0] = rs2[31:0]</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseB" aria-expanded="false" aria-controls="collapseB">
          <span class="lead fw-bold">B-type instructions</span>
          </button>
        </h2>
        <div id="collapseB" class="accordion-collapse collapse" data-bs-parent="#accordionInstructions">
          <div class="accordion-body">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">beq</td>
                  <td>Branch ==</td>
                  <td>1100011</td>
                  <td>0x0</td>
                  <td></td>
                  <td class="font-monospace">if (rs1 == rs2) PC += imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">bne</td>
                  <td>Branch !=</td>
                  <td>1100011</td>
                  <td>0x1</td>
                  <td></td>
                  <td class="font-monospace">if (rs1 != rs2) PC += imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">blt</td>
                  <td>Branch &lt;</td>
                  <td>1100011</td>
                  <td>0x4</td>
                  <td></td>
                  <td class="font-monospace">if (rs1 &lt; rs2) PC += imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">bge</td>
                  <td>Branch &gt;=</td>
                  <td>1100011</td>
                  <td>0x5</td>
                  <td></td>
                  <td class="font-monospace">if (rs1 &gt;= rs2) PC += imm</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">bltu</td>
                  <td>Branch &lt; (U) <span class="badge text-bg-primary">zero</span></td>
                  <td>1100011</td>
                  <td>0x6</td>
                  <td></td>
                  <td>if (rs1 &lt; rs2) PC += imm</td>
                  </tr class="font-monospace">
                <tr>
                  <td class="font-monospace fs-6">bgeu</td>
                  <td>Branch &gt;= (U) <span class="badge text-bg-primary">zero</span></td>
                  <td>1100011</td>
                  <td>0x7</td>
                  <td></td>
                  <td class="font-monospace">if (rs1 &gt;= rs2) PC += imm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseJ" aria-expanded="false" aria-controls="collapseJ">
          <span class="lead fw-bold">J-type instructions</span>
          </button>
        </h2>
        <div id="collapseJ" class="accordion-collapse collapse" data-bs-parent="#accordionInstructions">
          <div class="accordion-body">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">jal</td>
                  <td>Jump And Link</td>
                  <td>1101111</td>
                  <td></td>
                  <td></td>
                  <td class="font-monospace">rd = PC + 4; PC += imm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseU" aria-expanded="false" aria-controls="collapseU">
          <span class="lead fw-bold">U-type instructions</span>
          </button>
        </h2>
        <div id="collapseU" class="accordion-collapse collapse" data-bs-parent="#accordionInstructions">
          <div class="accordion-body">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>Inst</th>
                  <th>Name</th>
                  <th>Opcode</th>
                  <th>funct3</th>
                  <th>funct7</th>
                  <th>Description (C)</th>
                </tr>
              </thead>
              <tbody class="table-group-divider">
                <tr>
                  <td class="font-monospace fs-6">lui</td>
                  <td>Load Upper Imm</td>
                  <td>0110111</td>
                  <td></td>
                  <td></td>
                  <td class="font-monospace">rd = imm &lt;&lt; 12</td>
                </tr>
                <tr>
                  <td class="font-monospace fs-6">auipc</td>
                  <td>Add Upper Imm to PC</td>
                  <td>0010111</td>
                  <td></td>
                  <td></td>
                  <td class="font-monospace">rd = PC + (imm &lt;&lt; 12)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}
