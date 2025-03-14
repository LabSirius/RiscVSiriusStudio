import { Button } from "@vscode/webview-ui-toolkit";
import _ from "lodash-es";

var paragraph = _.template(`<p class="m-0 p-0 h4"><%- text %></p>`);
var highlightText = _.template(
  `<span class="m-0 p-0 text-primary"><%- text %></span>`
);
var text = _.template(`<span class="m-0 p-0 h4"><%- text %></span>`);

export class InstructionView {
  private typeView: InstructionTypeView;
  private binView: BinaryInstructionView;
  private asmView: AssemblerView;

  private instruction: any | undefined;

  public constructor() {
    this.typeView = new InstructionTypeView();
    this.binView = new BinaryInstructionView();
    this.asmView = new AssemblerView();
  }

  public newInstruction(instruction: any) {
    this.instruction = instruction;
    this.binView.newInstruction(instruction);
    this.asmView.setInstruction(instruction);
    this.setType(instruction.type);
  }
  public setBin(fields?: string[]) {
    this.binView.setInstruction(fields);
  }
  public setType(type: string) {
    this.typeView.setType(type);
  }
}

class BinaryInstructionView {
  private output: HTMLElement;
  private instruction: any | undefined;
  private fields: any;

  public constructor() {
    this.output = document.getElementById("instruction-bin") as HTMLElement;
  }

  public newInstruction(instruction: any) {
    this.instruction = instruction;
    const binEncoding = this.instruction.encoding.binEncoding;
    const match = extractGroups(binEncoding, instruction.type);
    if (match) {
      this.fields = match;
    } else {
      throw new Error("Cannot match instruction");
    }
    this.setInstruction();
  }

  public setInstruction(fields?: string[]) {
    const select = {
      R: formatRInstructionAsHTML,
      I: formatIInstructionAsHTML,
      S: formatSInstructionAsHTML,
      B: formatBInstructionAsHTML,
      U: formatUInstructionAsHTML,
      J: formatJInstructionAsHTML,
    };

    if (fields) {
      this.output.innerHTML = select[this.instruction.type](
        this.fields,
        fields
      );
    } else {
      this.output.innerHTML = select[this.instruction.type](this.fields, []);
    }
  }
}

function format(str: string, highlight: boolean) {
  return highlight ? highlightText({ text: str }) : text({ text: str });
}

function formatRInstructionAsHTML(instruction: any, highlight: string[]) {
  const funct7 = format(instruction["funct7"], highlight.includes("funct7"));
  const rs2 = format(instruction["rs2"], highlight.includes("rs2"));
  const rs1 = format(instruction["rs1"], highlight.includes("rs1"));
  const funct3 = format(instruction["funct3"], highlight.includes("funct3"));
  const rd = format(instruction["rd"], highlight.includes("rd"));
  const opcode = format(instruction["opcode"], highlight.includes("opcode"));

  const inst = `<p class="h4">${funct7}-${rs2}-${rs1}-${funct3}-${rd}-${opcode}</p>`;
  return inst;
}

function formatIInstructionAsHTML(instruction: any, highlight: string[]) {
  const imm = format(instruction["imm"], highlight.includes("imm"));
  const rs1 = format(instruction["rs1"], highlight.includes("rs1"));
  const funct3 = format(instruction["funct3"], highlight.includes("funct3"));
  const rd = format(instruction["rd"], highlight.includes("rd"));
  const opcode = format(instruction["opcode"], highlight.includes("opcode"));
  const inst = `<p class="h4">${imm}-${rs1}-${funct3}-${rd}-${opcode}</p>`;
  return inst;
}

function formatSInstructionAsHTML(instruction: any, highlight: string[]) {
  const imm15_5 = format(instruction["imm15_5"], highlight.includes("imm"));
  const rs1 = format(instruction["rs1"], highlight.includes("rs1"));
  const funct3 = format(instruction["funct3"], highlight.includes("funct3"));
  const imm4_0 = format(instruction["imm4_0"], highlight.includes("imm"));
  const opcode = format(instruction["opcode"], highlight.includes("opcode"));
  const inst = `<p class="h4">${imm15_5}-${rs1}-${funct3}-${imm4_0}-${opcode}</p>`;
  return inst;
}

function formatBInstructionAsHTML(instruction: any, highlight: string[]) {
  const immP1 = format(instruction["immP1"], highlight.includes("imm"));
  const rs1 = format(instruction["rs1"], highlight.includes("rs1"));
  const funct3 = format(instruction["funct3"], highlight.includes("funct3"));
  const immP2 = format(instruction["immP2"], highlight.includes("imm"));
  const opcode = format(instruction["opcode"], highlight.includes("opcode"));
  const inst = `<p class="h4">${immP1}-${rs1}-${funct3}-${immP2}-${opcode}</p>`;
  return inst;
}

function formatUInstructionAsHTML(instruction: any, highlight: string[]) {
  const imm = format(instruction["imm"], highlight.includes("imm"));
  const rd = format(instruction["rd"], highlight.includes("rd"));
  const opcode = format(instruction["opcode"], highlight.includes("opcode"));
  const inst = `<p class="h4">${imm}-${rd}-${opcode}</p>`;
  return inst;
}

function formatJInstructionAsHTML(instruction: any, highlight: string[]) {
  const imm = format(instruction["imm"], highlight.includes("imm"));
  const rd = format(instruction["rd"], highlight.includes("rd"));
  const opcode = format(instruction["opcode"], highlight.includes("opcode"));
  const inst = `<p class="h4">${imm}-${rd}-${opcode}</p>`;
  return inst;
}

function extractGroups(
  inputString: string,
  instType: string
): Record<string, string> | null {
  const regexR =
    /^(?<funct7>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<funct3>[01]{3})(?<rd>[01]{5})(?<opcode>[01]{7})$/g;
  const regexI =
    /^(?<imm>[01]{12})(?<rs1>[01]{5})(?<funct3>[01]{3})(?<rd>[01]{5})(?<opcode>[01]{7})$/g;
  const regexS =
    /^(?<imm15_5>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<funct3>[01]{3})(?<imm4_0>[01]{5})(?<opcode>[01]{7})$/g;
  const regexB =
    /^(?<immP1>[01]{7})(?<rs2>[01]{5})(?<rs1>[01]{5})(?<funct3>[01]{3})(?<immP2>[01]{5})(?<opcode>[01]{7})$/g;
  const regexU = /^(?<imm>[01]{20})(?<rd>[01]{5})(?<opcode>[01]{7})$/g;
  const regexJ = /^(?<imm>[01]{20})(?<rd>[01]{5})(?<opcode>[01]{7})$/g;

  const select = {
    R: regexR,
    I: regexI,
    S: regexS,
    B: regexB,
    U: regexU,
    J: regexJ,
  };
  const match = select[instType].exec(inputString);

  if (match && match.groups) {
    return match.groups;
  } else {
    return null;
  }
}
class AssemblerView {
  private output: HTMLElement;
  private instruction: any | undefined;

  public constructor() {
    this.output = document.getElementById("instruction-asm") as Button;
  }

  public setInstruction(instruction: any) {
    this.instruction = instruction;
    const inst = `<p class="h4">${this.instruction.asm}</p>`;
    this.output.innerHTML = inst;
  }
}

class InstructionTypeView {
  private components: Map<string, Button>;

  public constructor() {
    this.components = new Map<string, Button>();
    ["R", "I", "S", "B", "U", "J"].forEach((instType) => {
      const element = document.getElementById(
        "instruction-type-" + _.lowerCase(instType)
      ) as Button;
      this.components.set(instType, element);
    });
    this.disableAll();
  }
  private disableAll() {
    this.components.forEach((button) => {
      button.disabled = true;
    });
  }

  public setType(type: string) {
    this.components.forEach((button, name) => {
      if (name === type) {
        button.disabled = false;
      } else {
        button.disabled = true;
      }
    });
  }
}
