import {
    WebviewPanel,
    window,
    ViewColumn
  } from "vscode";  

export class RiscCardPanel{
  public static currentPanel: WebviewPanel | undefined;
  
  public static riscCard() {
    if (RiscCardPanel.currentPanel) {
      RiscCardPanel.currentPanel.dispose();
      RiscCardPanel.currentPanel = undefined;
      return '';
    }
    RiscCardPanel.currentPanel = window.createWebviewPanel(
      'riscCard',
      'RISC-V Instruction Set',
      ViewColumn.One,
      {}
    );
    RiscCardPanel.currentPanel.webview.html = getCardContent();
  }

}

function getCardContent() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RISC-V Instruction Set</title>
    <style>
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }
        .center-text {
            text-align: center;
        }
    </style>
</head>
<body>

<h1>RISC-V Instruction Set</h1>

<h2>RV32I Base Integer Instructions</h2>

<table>
    <tr>
        <th>Inst</th>
        <th>Name</th>
        <th>FMT</th>
        <th>Opcode</th>
        <th>funct3</th>
        <th>funct7</th>
        <th>Description (C)</th>
        <th>Note</th>
    </tr>
    <tr>
        <td>add</td>
        <td>ADD</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x0</td>
        <td>0x00</td>
        <td>rd = rs1 + rs2</td>
        <td></td>
    </tr>
    <tr>
        <td>sub</td>
        <td>SUB</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x0</td>
        <td>0x20</td>
        <td>rd = rs1 - rs2</td>
        <td></td>
    </tr>
    <tr>
        <td>xor</td>
        <td>XOR</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x4</td>
        <td>0x00</td>
        <td>rd = rs1 ^ rs2</td>
        <td></td>
    </tr>
    <tr>
        <td>or</td>
        <td>OR</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x6</td>
        <td>0x00</td>
        <td>rd = rs1 | rs2</td>
        <td></td>
    </tr>
    <tr>
        <td>and</td>
        <td>AND</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x7</td>
        <td>0x00</td>
        <td>rd = rs1 & rs2</td>
        <td></td>
    </tr>
    <tr>
        <td>sll</td>
        <td>Shift Left Logical</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x1</td>
        <td>0x00</td>
        <td>rd = rs1 << rs2</td>
        <td></td>
    </tr>
    <tr>
        <td>srl</td>
        <td>Shift Right Logical</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x5</td>
        <td>0x00</td>
        <td>rd = rs1 >> rs2</td>
        <td></td>
    </tr>
    <tr>
        <td>sra</td>
        <td>Shift Right Arith</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x5</td>
        <td>0x20</td>
        <td>rd = rs1 >> rs2</td>
        <td>msb-extends</td>
    </tr>
    <tr>
        <td>slt</td>
        <td>Set Less Than</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x2</td>
        <td>0x00</td>
        <td>rd = (rs1 &lt; rs2) ? 1 : 0</td>
        <td></td>
    </tr>
    <tr>
        <td>sltu</td>
        <td>Set Less Than (U)</td>
        <td>R</td>
        <td>0110011</td>
        <td>0x3</td>
        <td>0x00</td>
        <td>rd = (rs1 &lt; rs2) ? 1 : 0</td>
        <td>zero-extends</td>
    </tr>
    <tr>
        <td>addi</td>
        <td>ADD Immediate</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x0</td>
        <td></td>
        <td>rd = rs1 + imm</td>
        <td></td>
    </tr>
    <tr>
        <td>xori</td>
        <td>XOR Immediate</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x4</td>
        <td></td>
        <td>rd = rs1 ^ imm</td>
        <td></td>
    </tr>
    <tr>
        <td>ori</td>
        <td>OR Immediate</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x6</td>
        <td></td>
        <td>rd = rs1 | imm</td>
        <td></td>
    </tr>
    <tr>
        <td>andi</td>
        <td>AND Immediate</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x7</td>
        <td></td>
        <td>rd = rs1 & imm</td>
        <td></td>
    </tr>
    <tr>
        <td>slli</td>
        <td>Shift Left Logical Imm</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x1</td>
        <td>imm[5:11]=0x00 </td>
        <td>rd = rs1 << imm[4:0]</td>
        <td></td>
    </tr>
    <tr>
        <td>srli</td>
        <td>Shift Right Logical Imm</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x5</td>
        <td>imm[5:11]=0x00 </td>
        <td>rd = rs1 >> imm[4:0]</td>
        <td>zero-extends</td>
    </tr>
    <tr>
        <td>srai</td>
        <td>Shift Right Arith Imm</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x5</td>
        <td>imm[5:11]=0x20 </td>
        <td>rd = rs1 >> imm[4:0]</td>
        <td>msb-extends</td>
    </tr>
    <tr>
        <td>slti</td>
        <td>Set Less Than Imm</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x2</td>
        <td></td>
        <td>rd = (rs1 &lt; imm) ? 1 : 0</td>
        <td></td>
    </tr>
    <tr>
        <td>sltiu</td>
        <td>Set Less Than Imm (U)</td>
        <td>I</td>
        <td>0010011</td>
        <td>0x3</td>
        <td></td>
        <td>rd = (rs1 &lt; imm) ? 1 : 0</td>
        <td>zero-extends</td>
    </tr>
    <tr>
        <td>lb</td>
        <td>Load Byte</td>
        <td>I</td>
        <td>0000011</td>
        <td>0x0</td>
        <td></td>
        <td>rd = M[rs1 + imm][7:0]</td>
        <td></td>
    </tr>
    <tr>
        <td>lh</td>
        <td>Load Half</td>
        <td>I</td>
        <td>0000011</td>
        <td>0x1</td>
        <td></td>
        <td>rd = M[rs1 + imm][15:0]</td>
        <td></td>
    </tr>
    <tr>
        <td>lw</td>
        <td>Load Word</td>
        <td>I</td>
        <td>0000011</td>
        <td>0x2</td>
        <td></td>
        <td>rd = M[rs1 + imm][31:0]</td>
        <td></td>
    </tr>
    <tr>
        <td>lbu</td>
        <td>Load Byte (U)</td>
        <td>I</td>
        <td>0000011</td>
        <td>0x4</td>
        <td></td>
        <td>rd = M[rs1 + imm][7:0]</td>
        <td>zero-extends</td>
    </tr>
    <tr>
        <td>lhu</td>
        <td>Load Half (U)</td>
        <td>I</td>
        <td>0000011</td>
        <td>0x5</td>
        <td></td>
        <td>rd = M[rs1 + imm][15:0]</td>
        <td>zero-extends</td>
    </tr>
    <tr>
        <td>sb</td>
        <td>Store Byte</td>
        <td>S</td>
        <td>0100011</td>
        <td>0x0</td>
        <td></td>
        <td>M[rs1 + imm][7:0] = rs2[7:0]</td>
        <td></td>
    </tr>
    <tr>
        <td>sh</td>
        <td>Store Half</td>
        <td>S</td>
        <td>0100011</td>
        <td>0x1</td>
        <td></td>
        <td>M[rs1 + imm][15:0] = rs2[15:0]</td>
        <td></td>
    </tr>
    <tr>
        <td>sw</td>
        <td>Store Word</td>
        <td>S</td>
        <td>0100011</td>
        <td>0x2</td>
        <td></td>
        <td>M[rs1 + imm][31:0] = rs2[31:0]</td>
        <td></td>
    </tr>
    <tr>
        <td>beq</td>
        <td>Branch ==</td>
        <td>B</td>
        <td>1100011</td>
        <td>0x0</td>
        <td></td>
        <td>if (rs1 == rs2) PC += imm</td>
        <td></td>
    </tr>
    <tr>
        <td>bne</td>
        <td>Branch !=</td>
        <td>B</td>
        <td>1100011</td>
        <td>0x1</td>
        <td></td>
        <td>if (rs1 != rs2) PC += imm</td>
        <td></td>
    </tr>
    <tr>
        <td>blt</td>
        <td>Branch &lt;</td>
        <td>B</td>
        <td>1100011</td>
        <td>0x4</td>
        <td></td>
        <td>if (rs1 &lt; rs2) PC += imm</td>
        <td></td>
    </tr>
    <tr>
        <td>bge</td>
        <td>Branch &gt;=</td>
        <td>B</td>
        <td>1100011</td>
        <td>0x5</td>
        <td></td>
        <td>if (rs1 &gt;= rs2) PC += imm</td>
        <td></td>
    </tr>
    <tr>
        <td>bltu</td>
        <td>Branch &lt; (U)</td>
        <td>B</td>
        <td>1100011</td>
        <td>0x6</td>
        <td></td>
        <td>if (rs1 &lt; rs2) PC += imm</td>
        <td>zero-extends</td>
    </tr>
    <tr>
        <td>bgeu</td>
        <td>Branch &gt;= (U)</td>
        <td>B</td>
        <td>1100011</td>
        <td>0x7</td>
        <td></td>
        <td>if (rs1 &gt;= rs2) PC += imm</td>
        <td>zero-extends</td>
    </tr>
    <tr>
        <td>jal</td>
        <td>Jump And Link</td>
        <td>J</td>
        <td>1101111</td>
        <td></td>
        <td></td>
        <td>rd = PC + 4; PC += imm</td>
        <td></td>
    </tr>
    <tr>
        <td>jalr</td>
        <td>Jump And Link Reg</td>
        <td>I</td>
        <td>1100111</td>
        <td>0x0</td>
        <td></td>
        <td>rd = PC + 4; PC = rs1 + imm</td>
        <td></td>
    </tr>
    <tr>
        <td>lui</td>
        <td>Load Upper Imm</td>
        <td>U</td>
        <td>0110111</td>
        <td></td>
        <td></td>
        <td>rd = imm &lt;&lt; 12</td>
        <td></td>
    </tr>
    <tr>
        <td>auipc</td>
        <td>Add Upper Imm to PC</td>
        <td>U</td>
        <td>0010111</td>
        <td></td>
        <td></td>
        <td>rd = PC + (imm &lt;&lt; 12)</td>
        <td></td>
    </tr>
    <tr>
        <td>ecall</td>
        <td>Environment call</td>
        <td>I</td>
        <td>1110011</td>
        <td>0x0</td>
        <td>imm=0x0 </td>
        <td>Transfer control to OS</td>
        <td></td>
    </tr>
    <tr>
        <td>ebreak</td>
        <td>Environment break</td>
        <td>I</td>
        <td>1110011</td>
        <td>0x0</td>
        <td>imm=0x1</td>
        <td>Transfer control to debugger</td>
        <td></td>
    </tr>
</table>

</body>
</html>




`;
}