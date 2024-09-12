/* eslint-disable @typescript-eslint/naming-convention */

import _ from "lodash";
import {
  usesRegister,
  usesALU,
  writesRU,
  usesFunct7,
  usesFunct3,
  usesIMM,
  usesDM,
  storesNextPC,
  branchesOrJumps,
  storesMemRead,
  storesALU,
  isLUI,
  writesDM,
  isAUIPC,
} from "../utilities/instructions.js";

import { SimulatorInfo } from "./SimulatorInfo.js";
import { computePosition, flip, shift, offset } from "@floating-ui/dom";

type SVGElem = HTMLElement & SVGElement;

var paragraph = _.template(
  `<span class="m-0 p-0 lh-1">
    <p class="m-0 p-0 lh-1"><%- text %></p>
    </span>`
);

var tabular = _.template(
  `<% print('<span class="container bg-primary m-0 p-0 border-primary lh-1">'); 
      print('<table class="table table-sm table-borderless p-0 m-0 lh-1"><tbody>');
      _.forEach(pairs, function([label, value]) {  %> <tr><th scope="row"><%- label %></th><td><%- value %></td></tr> <%});
      print('</body></span>'); 
   %>`
);

function shortBinary(bin: string): string {
  const firstOne = bin.indexOf("1");
  if (firstOne !== -1) {
    return "32'b" + bin.substring(firstOne);
  } else {
    return "32'b0";
  }
}

function applyClass(comp: HTMLElement, cls: string) {
  comp.setAttributeNS(null, "class", cls);
}

/**
 * Redraws element to be on top of all the other svg elements it overlaps with.
 * @param {*} element to be moved to the top of the svg
 *
 * This is very draw.io dependant and should be checked. As element is sometimes put inside a
 * group this will only work if the group is moved.
 */
function pathOnTop(element: SVGElem) {
  const realElement = element.parentElement;
  if (realElement) {
    // const realElement = element;
    realElement.parentElement?.appendChild(realElement);
  }
}
/**
 * Installs a hover listener on element. The purpose of it is to bring the
 * element to the top when is active and hovered by the pointer.
 *
 */
function focus(element: SVGElem) {
  element.addEventListener("mousemove", () => {
    pathOnTop(element);
  });
}

function mouseHover(
  element: SVGElem,
  mmove: (arg: Event) => any,
  mout: (arg: Event) => any
) {
  element.addEventListener("mousemove", mmove);
  element.addEventListener("mouseout", mout);
}

/**
 * Visual component styling.
 *
 * @param {*} recipe defines which objects and  which styles to apply. It is an
 * array of arrays of length 2.
 *
 * If The first element of each sub array is another array, it has to contain
 * html elements. The second element is a string representing the style to be
 * applied to those elements.
 *
 * Example: [ [[e1, e2, e3], s2] ] Applies style s2 to e1, e2 and e3.
 *
 * If the first element is not an array it must be an html element. As before,
 * the second element is the style to pe applied to it.
 *
 * Example: [ [[e1 e3], s1], [e2, s1] ] Applies style s1 to e1 and e3. The
 * second item applies s1 to e2.
 */
type Styler = [HTMLElement, string] | [HTMLElement[], string];
type Stylers = Styler[];

function styleComponents(recipe: Stylers) {
  recipe.forEach(([element, style]) => {
    if (Array.isArray(element)) {
      element.forEach((e) => {
        applyClass(e, style);
      });
    } else {
      applyClass(element, style);
    }
  });
}
/**
 *
 * There is a function per every component in the CPU diagram.
 *
 * Every exported function will be executed automatically. It is the
 * responsibility of the function to install all the listeners of the object and
 * to add a listener on cpuData.stepButton when clicked. That way the listener
 * will be called every time a new instruction is executed. It is also up to the
 * installed listener to decide if the component is enabled or disabled during
 * the execution of that instruction.
 *
 */
export function CLK(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { CLKCLK: wave },
  } = cpuData.getInfo();

  const activeStyle = [
    [element, "component"],
    [wave, "connection"],
  ] as Stylers;

  styleComponents(activeStyle);
  cpuData.installTooltip(element, "bottom", paragraph({ text: "Clock" }));

  document.addEventListener("SimulatorUpdate", (e) => {
    // styleComponents(activeStyle);
    cpuData.enable("CLK");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    // does nothing on termination.
  });
}

export function PC(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { PCCLOCK: clock },
  } = cpuData.getInfo();

  const disabledStyle = [[[element, clock], "componentDisabled"]] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(element, "bottom", () => {
    const inst = cpuData.getInstruction().inst;
    return paragraph({ text: inst });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([[[element, clock], "component"]]);
    cpuData.enable("PC");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("PC");
  });
}

export function ADD4(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { ADD4WBMUX: add4WBMux },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [add4WBMux, "connectionDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([
      [element, "component"],
      [add4WBMux, "connectionDisabled"],
    ]);
    cpuData.enable("ADD4");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("ADD4");
  });
}

export function IM(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { IMADDRESSTEXT: addressText, IMINSTRUCTIONTEXT: instText },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [[addressText, instText], "inputTextDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(
    addressText,
    "top-start",
    () => {
      const inst = cpuData.getInstruction().inst;
      return paragraph({ text: inst });
    },
    "IM"
  );

  cpuData.installTooltip(
    instText,
    "bottom",
    () => {
      const { asm, type, pseudo } = cpuData.getInstruction();
      return tabular({
        pairs: [
          ["Assembler", asm],
          ["Type", type],
          ["Pseudo", pseudo],
        ],
      });
    },
    "IM"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([
      [element, "component"],
      [[addressText, instText], "inputText"],
    ]);
    cpuData.enable("IM");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("IM");
  });
}

function cuArrowTooltipText(cpuData: SimulatorInfo) {
  const instType = cpuData.instructionType();
  const result = cpuData.instructionResult();
  const fixed = [
    ["NextPCSrc", result.buMux.result],
    ["BrOp", result.bu.operation],
    ["ALUOp", result.alu.operation],
  ];
  switch (instType) {
    case "R":
      return tabular({
        pairs: fixed.concat([
          ["ALUASrc", result.alua.signal],
          ["ALUBSrc", result.alub.signal],
          ["RUWr", result.ru.writeSignal],
          ["RUDataWrSrc", result.wb.signal],
        ]),
      });
    case "I":
      return tabular({
        pairs: fixed.concat([
          ["ALUASrc", result.alua.signal],
          ["ALUBSrc", result.alub.signal],
          ["IMMSrc", result.imm.signal],
          ["RUWr", result.ru.writeSignal],
          ["RUDataWrSrc", result.wb.signal],
        ]),
      });
    case "S":
      return tabular({
        pairs: fixed.concat([
          ["ALUASrc", result.alua.signal],
          ["ALUBSrc", result.alub.signal],
          ["IMMSrc", result.imm.signal],
          ["RUWr", result.ru.writeSignal],
        ]),
      });
    case "B":
      return tabular({
        pairs: fixed.concat([
          ["ALUASrc", result.alua.signal],
          ["ALUBSrc", result.alub.signal],
          ["IMMSrc", result.imm.signal],
        ]),
      });
    case "U":
      return tabular({
        pairs: fixed.concat([
          ["ALUBSrc", result.alub.signal],
          ["IMMSrc", result.imm.signal],
          ["RUWr", result.ru.writeSignal],
          ["RUDataWrSrc", result.wb.signal],
        ]),
      });
    default:
      return tabular({
        pairs: [
          ["ALUASrc", "COMPUTE"],
          ["ALUBSrc", "COMPUTE"],
          ["IMSrc", "COMPUTE"],
          ["ALUOp", "COMPUTE"],
          ["BROp", "COMPUTE"],
          ["RUDataWrSrc", "COMPUTE"],
        ],
      });
  }
}

function styleSignals(cpuData: SimulatorInfo, instType: string, style: string) {
  const {
    cpuElements: {
      SgnALUBSrcPTH: ALUBSignal,
      SgnALUASrcPTH: ALUASignal,
      SgnRUWRPTH: RUWrSignal,
      SgnALUOPPTH: ALUOpSignal,
      SgnWBPTH: RUDataWrSrcSignal,
      SgnBUBROPPTH: BrOpSignal,
      SgnIMMSrcPTH: ImmSrcSignal,
    },
  } = cpuData.getInfo();

  const signalList = {
    R: [
      ALUBSignal,
      ALUASignal,
      RUWrSignal,
      ALUOpSignal,
      RUDataWrSrcSignal,
      BrOpSignal,
    ],
    I: [
      ALUBSignal,
      ALUASignal,
      RUWrSignal,
      ALUOpSignal,
      RUDataWrSrcSignal,
      BrOpSignal,
      ImmSrcSignal,
    ],
    S: [
      ALUBSignal,
      ALUASignal,
      RUWrSignal,
      ALUOpSignal,
      BrOpSignal,
      ImmSrcSignal,
    ],
    LUI: [
      ALUBSignal,
      RUWrSignal,
      ALUOpSignal,
      RUDataWrSrcSignal,
      BrOpSignal,
      ImmSrcSignal,
    ],
    AUIPC: [
      ALUBSignal,
      ALUASignal,
      RUWrSignal,
      ALUOpSignal,
      RUDataWrSrcSignal,
      BrOpSignal,
      ImmSrcSignal,
    ],
  };
  const instruction = cpuData.getInstruction();

  let selector =
    instType !== "U"
      ? instType
      : isAUIPC(instruction.type, instruction.opcode)
      ? "AUIPC"
      : "LUI";

  signalList[selector].forEach((signal: SVGElem) => {
    applyClass(signal, style);
  });
}

export function CU(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { CUArrow: arrow },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [arrow, "connectionDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(
    arrow,
    "left-start",
    () => {
      const { asm } = cpuData.getInstruction();
      return cuArrowTooltipText(cpuData);
    },
    "CU"
  );
  mouseHover(
    arrow as SVGElem,
    () => {
      styleSignals(cpuData, cpuData.instructionType(), "signalHover");
    },
    () => {
      styleSignals(cpuData, cpuData.instructionType(), "signal");
    }
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([
      [element, "component"],
      [arrow, "connection"],
    ]);
    cpuData.enable("CU");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("CU");
  });
}

function ruInputTooltipText(name: string, cpuData: SimulatorInfo) {
  const instruction = cpuData.getInstruction();
  const { regname, regeq, regenc } = instruction[name];
  const binEnc = instruction.encoding[name];

  return tabular({
    pairs: [
      ["Register", `${regname} (${regeq})`],
      ["Encoding", binEnc],
    ],
  });
}

function ruOutputTooltipText(name: string, cpuData: SimulatorInfo) {
  const instruction = cpuData.getInstruction();
  const result = cpuData.instructionResult().ru[name];
  const { regname, regeq, regenc } = instruction[name];
  const result10 = parseInt(result, 10);
  const result16 = result10.toString(16);
  // const binEnc = instruction.encoding[name];

  return tabular({
    pairs: [
      ["Register", `${regname} (${regeq})`],
      ["Value2", shortBinary(result)],
      ["Value10", result10.toString()],
      ["Value16", result16],
    ],
  });
}

function setRUWr(cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnRUWRVAL: ruwrSignalValue },
  } = cpuData.getInfo();
  ruwrSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().ru.writeSignal;
}

export function RU(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: {
      RUTEXTINRS1: rs1Text,
      RUTEXTINRS2: rs2Text,
      RUTEXTINRD: rdText,
      RUTEXTINDATAWR: datawrText,
      RUTEXTINWE: ruwrText,
      RUCLOCK: clock,
      SgnRUWRPTH: ruwrSignal,
      SgnRUWRVAL: ruwrSignalVal,
      RUTEXTOUTRD1: val1Text,
      RUTEXTOUTRD2: val2Text,
    },
  } = cpuData.getInfo();

  const disabledStyle = [
    [[element, clock], "componentDisabled"],
    [[rs1Text, rs2Text, rdText, datawrText, ruwrText], "inputTextDisabled"],
    [[val1Text, val2Text], "outputTextDisabled"],
    [[ruwrSignal, ruwrSignalVal], "signalDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(
    rs1Text,
    "right-end",
    () => {
      if (usesRegister("rs1", cpuData.instructionType())) {
        return ruInputTooltipText("rs1", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    rs2Text,
    "left-start",
    () => {
      if (usesRegister("rs2", cpuData.instructionType())) {
        return ruInputTooltipText("rs2", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    rdText,
    "left-end",
    () => {
      if (usesRegister("rd", cpuData.instructionType())) {
        return ruInputTooltipText("rd", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );

  cpuData.installTooltip(
    val1Text,
    "bottom-start",
    () => {
      if (usesRegister("rs1", cpuData.instructionType())) {
        return ruOutputTooltipText("rs1", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    val2Text,
    "bottom-start",
    () => {
      if (usesRegister("rs2", cpuData.instructionType())) {
        return ruOutputTooltipText("rs2", cpuData);
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );
  cpuData.installTooltip(
    datawrText,
    "left",
    () => {
      if (writesRU(cpuData.instructionType(), cpuData.instructionOpcode())) {
        const value2 = cpuData.instructionResult().ru.dataWrite;
        const value10 = parseInt(value2, 2);
        const value16 = value10.toString(16);

        return tabular({
          pairs: [
            ["Value2", shortBinary(value2)],
            ["Value10", value10.toString()],
            ["Value16", value16],
          ],
        });
      } else {
        return paragraph({ text: "Unused for this instruction" });
      }
    },
    "RU"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    setRUWr(cpuData);
    styleComponents([
      [[element, clock], "component"],
      [[rs1Text, rs2Text, rdText, datawrText, ruwrText], "inputText"],
      [[val1Text, val2Text], "outputText"],
      [[ruwrSignal, ruwrSignalVal], "signal"],
    ]);

    if (!usesRegister("rs1", instType)) {
      styleComponents([
        [rs1Text, "inputTextDisabled"],
        [val1Text, "outputTextDisabled"],
      ]);
    }
    if (!usesRegister("rs2", instType)) {
      styleComponents([
        [rs2Text, "inputTextDisabled"],
        [val2Text, "outputTextDisabled"],
      ]);
    }
    if (!usesRegister("rd", instType)) {
      styleComponents([[rdText, "inputTextDisabled"]]);
    }
    cpuData.enable("RU");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("RU");
  });
}

function immTooltipText(cpuData: SimulatorInfo) {
  const instruction = cpuData.getInstruction();
  const instType = cpuData.instructionType();
  const selectImmBits = {
    I: {
      bits: 12,
      value2: instruction.encoding.imm12,
      value10: instruction.imm12,
      value16: parseInt(instruction.encoding.imm12, 2).toString(16),
      instruction: "[31:20]",
      imm: "[11:0]",
    },
    S: {
      bits: 12,
      value2: instruction.encoding.imm12,
      value10: instruction.imm12,
      value16: parseInt(instruction.encoding.imm12, 2).toString(16),
      instruction: "[31:25], [11:7]",
      imm: "[11:0]",
    },
    B: {
      bits: 13,
      value2: instruction.encoding.imm13,
      value10: instruction.imm13,
      value16: parseInt(instruction.encoding.imm13, 2).toString(16),
      instruction: "[31:25], [11:7]",
      imm: "[12|10:5] [4:1|11]",
    },
    U: 20,
    J: 20,
  };
  const info = selectImmBits[instType];
  const immLength = `${info.bits} bits.`;
  const immValue2 = `${info.value2}.`;
  const immValue10 = `${info.value10}.`;
  const immValue16 = `${info.value16}.`;
  const instPosition = `${info.instruction} bits in instruction.`;
  const immPosition = `${info.imm} bits in immediate.`;

  return tabular({
    pairs: [
      ["Value(2)", immValue2],
      ["Value(10)", immValue10],
      ["Length", immLength],
      ["Position", instPosition],
      ["Position", immPosition],
    ],
  });
}

function setIMMSrc(cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnIMMSRCVAL: immSignalValue },
  } = cpuData.getInfo();

  immSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().imm.signal;
}

export function IMM(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnIMMSrcPTH: signal, SgnIMMSRCVAL: value },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [[signal, value], "signalDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(
    element,
    "top",
    () => {
      return immTooltipText(cpuData);
    },
    "IMM"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      styleComponents([
        [element, "component"],
        [[signal, value], "signal"],
      ]);
      cpuData.enable("IMM");
    } else {
      styleComponents(disabledStyle);
      cpuData.disable("IMM");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("IMM");
  });
}

export function ALUA(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: {
      ALUAMUXIC1: path1,
      ALUAMUXIC0: path0,
      SgnALUASrcPTH: signal,
      ALUAMUXTEXT: text,
    },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [text, "inputTextDisabled"],
    [[path0, path1], "connectionDisabled muxPathDisabled"],
    [signal, "signalDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  const path0Visible = (inst: string) => {
    return inst === "R" || inst === "I" || inst === "S";
  };
  // TODO: the value is presented in decimal.

  cpuData.installTooltip(
    path0,
    "bottom-start",
    () => {
      const value2 = cpuData.instructionResult().ru.rs1;
      return paragraph({ text: shortBinary(value2) });
    },
    "ALUA"
  );

  cpuData.installTooltip(
    path1,
    "bottom-start",
    () => {
      const value = cpuData.getInstruction().inst;
      const value2 = shortBinary(value.toString(2));
      return paragraph({ text: value2 });
    },
    "ALUA"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (isLUI(instType, instOpcode)) {
      cpuData.disable("ALUA");
    } else {
      cpuData.enable("ALUA");
    }
    if (cpuData.enabled("ALUA")) {
      styleComponents([
        [element, "component"],
        [text, "inputText"],
        [signal, "signal"],
      ]);
      if (path0Visible(instType)) {
        styleComponents([
          [path0, "connection muxPath"],
          [path1, "connectionDisabled muxPathDisabled"],
        ]);
      } else {
        styleComponents([
          [path1, "connection muxPath"],
          [path0, "connectionDisabled muxPathDisabled"],
        ]);
      }
    } else {
      styleComponents(disabledStyle);
    }
  });
  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("ALUA");
  });
}

export function ALUB(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: {
      ALUBMUXIC1: path1,
      ALUBMUXIC0: path0,
      SgnALUBSrcPTH: signal,
      ALUBMUXTEXT: text,
    },
  } = cpuData.getInfo();
  const disabledStyle = [
    [element, "componentDisabled"],
    [text, "inputTextDisabled"],
    [[path1, path0], "connectionDisabled muxPathDisabled"],
    [signal, "signalDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  const path0Visible = (inst: any) => {
    return usesRegister("rs2", inst) && inst !== "S" && inst !== "B";
    // return inst === "R" || inst === "B" || inst === "J";
  };
  cpuData.installTooltip(
    path0,
    "top-start",
    () => {
      const value = shortBinary(cpuData.instructionResult().ru.rs2);
      return paragraph({ text: value });
    },
    "ALUB"
  );
  cpuData.installTooltip(
    path1,
    "bottom-start",
    () => {
      const value = shortBinary(cpuData.instructionResult().imm.output);
      return paragraph({ text: value });
    },
    "ALUB"
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    // Always enabled for all instructions
    cpuData.enable("ALUB");
    styleComponents([
      [element, "component"],
      [text, "inputText"],
      [signal, "signal"],
    ]);
    const instType = cpuData.instructionType();
    if (path0Visible(instType)) {
      styleComponents([
        [path0, "connection muxPath"],
        [path1, "connectionDisabled muxPathDisabled"],
      ]);
    } else {
      styleComponents([
        [path1, "connection muxPath"],
        [path0, "connectionDisabled muxPathDisabled"],
      ]);
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("ALUB");
  });
}

function aluTooltipText(name: string, cpuData: SimulatorInfo) {
  const {
    alu: { a: valA, b: valB, result: valALURes },
  } = cpuData.instructionResult();
  const shortValALURes = shortBinary(valALURes);
  const shortValA = shortBinary(valA);
  const valA10 = parseInt(valA, 2);
  const valB10 = parseInt(valB, 2);
  const valALURes10 = parseInt(valALURes, 2);
  const valALURes16 = valALURes10.toString(16);

  const shortValB = shortBinary(valB);
  const data = {
    A: tabular({
      pairs: [
        ["Value", shortValA],
        ["Value10", valA10],
      ],
    }),
    B: tabular({
      pairs: [
        ["Value", shortValB],
        ["Value10", valB10],
      ],
    }),
    ALURes: tabular({
      pairs: [
        ["Value", shortValALURes],
        ["Value10", valALURes10],
        ["Value16", "0x" + valALURes16],
      ],
    }),
  };

  // !TODO if the object is to functions we can save some time by lazily
  return data[name];
}

function setALUOp(cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnALUOPVAL: aluSignalValue },
  } = cpuData.getInfo();

  aluSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().alu.operation;
}

export function ALU(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: {
      ALUTEXTINA: textA,
      ALUTEXTINB: textB,
      ALUTEXTRES: valALURes,
      SgnALUOPPTH: aluSignal,
      SgnALUOPVAL: aluSignalValue,
    },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [[textA, textB], "inputTextDisabled"],
    [valALURes, "outputTextDisabled"],
    [[aluSignal, aluSignalValue], "signalDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(
    textA,
    "right",
    () => {
      return aluTooltipText("A", cpuData);
    },
    "ALU"
  );

  cpuData.installTooltip(
    textB,
    "right",
    () => {
      return aluTooltipText("B", cpuData);
    },
    "ALU"
  );

  cpuData.installTooltip(
    valALURes,
    "top-end",
    () => {
      return aluTooltipText("ALURes", cpuData);
    },
    "ALU"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([
      [element, "component"],
      [[textA, textB], "inputText"],
      [valALURes, "outputText"],
      [[aluSignal, aluSignalValue], "signal"],
    ]);
    cpuData.enable("ALU");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("ALU");
  });
}

function setBrOp(cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnBUBROPVAL: bropSignalValue },
  } = cpuData.getInfo();
  bropSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().bu.operation;
}

export function BU(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnBUBROPPTH: signal, SgnBUBROPVAL: signalVal },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [[signal, signalVal], "signalDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(element, "top", () => {
    return paragraph({
      text: "Not in a branch operation. Next instruction in the program memory will be executed.",
    });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    // Branch unit is always enabled as it controls NextPCSrc. When in a branch
    // instruction its inputs coming from the registers will be enabled.
    setBrOp(cpuData);
    styleComponents([
      [element, "component"],
      [[signal, signalVal], "signal"],
    ]);
    cpuData.enable("BU");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
  });
}

function dmTooltipText(name: string, cpuData: SimulatorInfo) {
  const instType = cpuData.instructionType();
  const instOpcode = cpuData.instructionOpcode();
  if (name === "DataRd" && writesDM(instType, instOpcode)) {
    return paragraph({ text: "Unused for this instruction" });
  }
  if (name === "DataWr" && storesMemRead(instType, instOpcode)) {
    return paragraph({ text: "Unused for this instruction" });
  }

  const address = cpuData.instructionResult().dm.address;
  const address16 = parseInt(address, 2).toString(16);

  switch (name) {
    case "Address":
      return tabular({
        pairs: [
          ["Value2", shortBinary(address)],
          ["Value16", "0x" + address16],
        ],
      });
    case "DataWr": {
      const data = cpuData.instructionResult().dm.dataWr;
      const data10 = parseInt(data, 2).toString(10);
      const data16 = parseInt(data, 2).toString(16);
      return tabular({
        pairs: [
          ["Value2", shortBinary(data)],
          ["Value10", data10],
          ["Value16", "0x" + data16],
        ],
      });
    }
    case "DataRd": {
      const data = cpuData.instructionResult().dm.dataRd;
      const data10 = parseInt(data, 2).toString(10);
      const data16 = parseInt(data, 2).toString(16);
      return tabular({
        pairs: [
          ["Value2", shortBinary(data)],
          ["Value10", data10],
          ["Value16", "0x" + data16],
        ],
      });
    }
  }
}

function setDMWr(cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnDMWRVAL: wrSignalValue },
  } = cpuData.getInfo();

  wrSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().dm.writeSignal;
}

function setDMCtrl(cpuData: SimulatorInfo) {
  const {
    cpuElements: { SgnDMCTRLVAL: ctrlSignalValue },
  } = cpuData.getInfo();

  ctrlSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().dm.controlSignal;
}

export function DM(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: {
      DMTEXTINADDRESS: addressText,
      DMTEXTINDATAWR: datawrText,
      DMTEXTDATARD: dataRdText,
      SgnDMCTRLPTH: ctrlSignal,
      SgnDMCTRLVAL: ctrlSignalVal,
      SgnDMWRPTH: wrSignal,
      SgnDMWRVAL: wrSignalVal,
      CLKDM: clkConnection,
      MEMCLOCK: clock,
    },
  } = cpuData.getInfo();

  const disabledStyle = [
    [[element, clock], "componentDisabled"],
    [[ctrlSignal, wrSignal, ctrlSignalVal, wrSignalVal], "signalDisabled"],
    [clkConnection, "connectionDisabled"],
    [[addressText, datawrText], "inputTextDisabled"],
    [dataRdText, "outputTextDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  cpuData.installTooltip(
    addressText,
    "top",
    () => {
      return dmTooltipText("Address", cpuData);
    },
    "DM"
  );
  cpuData.installTooltip(
    datawrText,
    "top",
    () => {
      return dmTooltipText("DataWr", cpuData);
    },
    "DM"
  );
  cpuData.installTooltip(
    dataRdText,
    "top",
    () => {
      return dmTooltipText("DataRd", cpuData);
    },
    "DM"
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (writesDM(instType, instOpcode) || storesMemRead(instType, instOpcode)) {
      cpuData.enable("DM");
      styleComponents([
        [[element, clock], "component"],
        [[ctrlSignal, wrSignal, ctrlSignalVal, wrSignalVal], "signal"],
        [clkConnection, "connection"],
      ]);
      setDMWr(cpuData);
      setDMCtrl(cpuData);
      if (writesDM(instType, instOpcode)) {
        styleComponents([
          [[addressText, datawrText], "inputText"],
          [dataRdText, "outputTextDisabled"],
        ]);
      } else {
        // reads from memory
        styleComponents([
          [addressText, "inputText"],
          [datawrText, "inputTextDisabled"],
          [dataRdText, "outputText"],
        ]);
      }
    } else {
      cpuData.disable("DM");
      styleComponents(disabledStyle);
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("DM");
  });
}

export function BUMUX(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: { BUMUXIC1: path1, BUMUXIC0: path0, BUMUXTEXT: text },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [text, "inputTextDisabled"],
    [[path1, path0], "connectionDisabled muxPathDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  const path1Visible = (instType: any, instOpcode: any, branchResult: any) => {
    return branchesOrJumps(instType, instOpcode) && branchResult;
  };

  cpuData.installTooltip(path0, "top", () => {
    const value = shortBinary(cpuData.instructionResult().add4.result);
    return paragraph({ text: value });
  });
  cpuData.installTooltip(path1, "top", () => {
    const value = shortBinary(cpuData.instructionResult().alu.result);
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("BUMUX");
    styleComponents([
      [element, "component"],
      [text, "inputText"],
    ]);

    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    const branchResult = cpuData.instructionResult().bu.result;
    if (path1Visible(instType, instOpcode, parseInt(branchResult))) {
      styleComponents([
        [path1, "connection muxPath"],
        [path0, "connectionDisabled muxPathDisabled"],
      ]);
    } else {
      styleComponents([
        [path0, "connection muxPath"],
        [path1, "connectionDisabled muxPathDisabled"],
      ]);
    }
  });
  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("BUMUX");
  });
}

export function WBMUX(element: SVGElem, cpuData: SimulatorInfo) {
  const {
    cpuElements: {
      WBMUXIC00: path00,
      WBMUXIC01: path01,
      WBMUXIC10: path10,
      SgnWBPTH: signal,
      WBMUXTEXT: text,
    },
  } = cpuData.getInfo();

  const disabledStyle = [
    [element, "componentDisabled"],
    [text, "inputTextDisabled"],
    [signal, "signalDisabled"],
    [[path00, path01, path10], "connectionDisabled muxPathDisabled"],
  ] as Stylers;

  styleComponents(disabledStyle);

  const path00Visible = (inst: any, opcode: any) => {
    return storesALU(inst, opcode);
  };
  const path01Visible = (inst: any, opcode: any) => {
    return storesMemRead(inst, opcode);
  };
  const path10Visible = (inst: any, opcode: any) => {
    return storesNextPC(inst, opcode);
  };

  cpuData.installTooltip(path00, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().alu.result);
    return paragraph({ text: value });
  });

  cpuData.installTooltip(path01, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().dm.dataRd);
    return paragraph({ text: value });
  });

  cpuData.installTooltip(path10, "bottom", () => {
    const value = cpuData.instructionResult().add4.result;
    return paragraph({ text: value });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (writesRU(instType, instOpcode)) {
      cpuData.enable("WBMUX");
    } else {
      cpuData.disable("WBMUX");
    }

    if (cpuData.enabled("WBMUX")) {
      styleComponents([
        [element, "component"],
        [text, "inputText"],
        [signal, "signal"],
      ]);
      const instOC = cpuData.instructionOpcode();
      if (path00Visible(instType, instOC)) {
        styleComponents([
          [path00, "connection muxPath"],
          [[path01, path10], "connectionDisabled muxPathDisabled"],
        ]);
      } else if (path01Visible(instType, instOC)) {
        styleComponents([
          [path01, "connection muxPath"],
          [[path00, path10], "connectionDisabled muxPathDisabled"],
        ]);
      } else if (path10Visible(instType, instOC)) {
        styleComponents([
          [path10, "connection muxPath"],
          [[path00, path01], "connectionDisabled muxPathDisabled"],
        ]);
      }
    } else {
      styleComponents(disabledStyle);
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents(disabledStyle);
    cpuData.disable("WBMUX");
  });
}

// PATHS

export function CLKPC(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "right", paragraph({ text: "Clock ⇔ PC" }));
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("CLKPC");
    pathOnTop(element);
    styleComponents([[element, "connection"]]);
  });
  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("CLKPC");
  });
}

export function CLKRU(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("CLKRU");
    pathOnTop(element);
    styleComponents([[element, "connection"]]);
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("CLKRU");
  });
}

export function CLKDM(element: SVGElem, cpuData: SimulatorInfo) {
  // TODO: check the behavior of this element on click
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("CLKDM");
  });
}

export function PCIM(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["PC ⇔ IM", ""],
        ["Instruction", "0x" + inst],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([[element, "connection"]]);
    cpuData.enable("PCIM");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("PCIM");
  });
}

export function PCADD4(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  // focus(element);
  cpuData.installTooltip(element, "left", () => {
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["PC ⇔ ADD4", ""],
        ["Instruction", "0x" + inst],
      ],
    });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([[element, "connection"]]);
    cpuData.enable("PCADD4");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("PCADD4");
  });
}

export function PCALUA(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["PC ⇔ ALUA", ""],
        ["Instruction", inst],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (
      branchesOrJumps(instType, instOpcode) ||
      isAUIPC(instType, instOpcode)
    ) {
      // if (instType === "U" && !isLUI(instType, instOpcode)) {
      styleComponents([[element, "connection"]]);
      cpuData.enable("PCALUA");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("PCALUA");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("PCALUA");
  });
}

/**
 * Computes the tooltip text presented on the connections between the
 * instruction memory and the control unit.
 *
 * @param {string} connection type of data requested. Possible values are:
 * - 'opcode': information for the connection to the opcode.
 * - 'funct3': for information regarding the funct3 connection.
 * - 'funct7': for information about the funtc7 connection.
 * @param {any} cpuData simulator information.
 */
function imCUTooltipText(connection: string, cpuData: SimulatorInfo) {
  const instruction = cpuData.getInstruction();
  if (connection === "funct7" && !usesFunct7(instruction.type)) {
    return paragraph({ text: "Unused for this instruction" });
  }

  const {
    opcode,
    funct3,
    funct7,
    encoding: { funct3: funct3Bin },
  } = instruction;

  const title = _.capitalize(connection);
  const detail = {
    opcode: tabular({
      pairs: [
        [title, ""],
        ["Value(2)", opcode],
      ],
    }),
    funct3: tabular({
      pairs: [
        [title, ""],
        ["Value(2)", funct3Bin],
        ["Value(10)", funct3],
      ],
    }),

    funct7: tabular({
      pairs: [
        [title, ""],
        ["Value(2)", funct7],
      ],
    }),
  };
  return detail[connection];
}

export function IMCUOPCODE(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("opcode", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUOPCODE")) {
        cpuData.setBinaryInstruction(["opcode"]);
      }
    },
    () => {
      if (cpuData.enabled("IMCUOPCODE")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("IMCUOPCODE");
    pathOnTop(element);
    styleComponents([[element, "connection"]]);
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMCUOPCODE");
  });
}

export function IMCUFUNCT3(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("funct3", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUFUNCT3")) {
        cpuData.setBinaryInstruction(["funct3"]);
      }
    },
    () => {
      if (cpuData.enabled("IMCUFUNCT3")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesFunct3(cpuData.instructionType())) {
      styleComponents([[element, "connection"]]);
      pathOnTop(element);
      cpuData.enable("IMCUFUNCT3");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("IMCUFUNCT3");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMCUFUNCT3");
  });
}

export function IMCUFUNCT7(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("funct7", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUFUNCT7")) {
        cpuData.setBinaryInstruction(["funct7"]);
      }
    },
    () => {
      if (cpuData.enabled("IMCUFUNCT7")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (usesFunct7(instType)) {
      styleComponents([[element, "connection"]]);
      pathOnTop(element);
      cpuData.enable("IMCUFUNCT7");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("IMCUFUNCT7");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMCUFUNCT7");
  });
}

/**
 * Computes the tooltip text presented on the connections between the
 * instruction memory and the registers unit.
 *
 * @param {string} connection type of data requested. Possible values are:
 * - 'rs1': information for the connection to the rs1.
 * - 'rs2': for information regarding the rs2 connection.
 * - 'rd': for information about the rd connection.
 * @param {any} cpuData simulator information.
 */
function imRUTooltipText(connection: string, cpuData: SimulatorInfo) {
  const instruction = cpuData.getInstruction();
  if (!usesRegister(connection, instruction.type)) {
    return paragraph({ text: "Unused for this instruction" });
  }
  const value10 = instruction[connection].regenc;
  const value2 = instruction.encoding[connection];

  return tabular({
    pairs: [
      [`IM ⇔ ${connection}`, ""],
      ["Value10", value10],
      ["Value2", value2],
    ],
  });
}

export function IMRURS1(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rs1", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURS1")) {
        cpuData.setBinaryInstruction(["rs1"]);
      }
    },
    () => {
      if (cpuData.enabled("IMRURS1")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rs1", cpuData.instructionType())) {
      styleComponents([[element, "connection"]]);
      pathOnTop(element);
      cpuData.enable("IMRURS1");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("IMRURS1");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMRURS1");
  });
}

export function IMRURS2(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rs2", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURS2")) {
        cpuData.setBinaryInstruction(["rs2"]);
      }
    },
    () => {
      if (cpuData.enabled("IMRURS2")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rs2", cpuData.instructionType())) {
      styleComponents([[element, "connection"]]);
      pathOnTop(element);
      cpuData.enable("IMRURS2");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("IMRURS2");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMRURS2");
  });
}

export function IMRURDEST(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rd", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURDEST")) {
        cpuData.setBinaryInstruction(["rd"]);
      }
    },
    () => {
      if (cpuData.enabled("IMRURDEST")) {
        cpuData.setBinaryInstruction();
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesRegister("rd", cpuData.instructionType())) {
      styleComponents([[element, "connection"]]);
      pathOnTop(element);
      cpuData.enable("IMRURDEST");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("IMRURDEST");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMRURDEST");
  });
}

export function IMIMM(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  mouseHover(
    element,
    () => {
      cpuData.setBinaryInstruction(["imm"]);
    },
    () => {
      cpuData.setBinaryInstruction();
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      styleComponents([[element, "connection"]]);
      cpuData.enable("IMIMM");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("IMIMM");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMIMM");
  });
}

export function WBMUXRU(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().wb.result;
    const value10 = parseInt(value2, 2);
    const value16 = value10.toString(16);
    return tabular({
      pairs: [
        ["WBMUX ⇔ RU", ""],
        ["Value", shortBinary(value2)],
        ["Value10", value10.toString()],
        ["Value16", "0x" + value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (writesRU(cpuData.instructionType(), cpuData.instructionOpcode())) {
      styleComponents([[element, "connection"]]);
      cpuData.enable("WBMUXRU");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("WBMUXRU");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("WBMUXRU");
  });
}

export function IMMALUB(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "right", () => {
    const imm32 = cpuData.instructionResult().imm.output;
    const value2 = shortBinary(imm32);
    const value10 = parseInt(imm32, 2).toString(10);
    const value16 = parseInt(imm32, 2).toString(16);
    return tabular({
      pairs: [
        ["IMM ⇔ ALUB", ""],
        ["Value2", value2],
        ["Value10", value10],
        ["Value16", "0x" + value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      styleComponents([[element, "connection"]]);
      cpuData.enable("IMMALUB");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("IMMALUB");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("IMMALUB");
  });
}

export function RUALUA(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().ru.rs1;
    const value10 = parseInt(value2, 2).toString();

    return tabular({
      pairs: [
        ["RU ⇔ ALUA", ""],
        ["Value", shortBinary(value2)],
        ["Value10", value10],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    // if (instType !== "J" && instType !== "B") {
    if (usesRegister("rs1", instType) && instType !== "B") {
      cpuData.enable("RUALUA");
      pathOnTop(element);
      styleComponents([[element, "connection"]]);
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("RUALUA");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("RUALUA");
  });
}

export function RUALUB(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().ru.rs2;
    const value10 = parseInt(value2, 2).toString();

    return tabular({
      pairs: [
        ["RU ⇔ ALUB", ""],
        ["Value", value2],
        ["Value10", value10],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (usesRegister("rs2", instType) && !usesIMM(instType)) {
      cpuData.enable("RUALUB");
      pathOnTop(element);
      styleComponents([[element, "connection"]]);
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("RUALUB");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("RUALUB");
  });
}

export function RUDM(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().ru.rs2;
    const value10 = parseInt(value2, 2);
    const value16 = value10.toString(16);

    return tabular({
      pairs: [
        ["RU ⇔ DM", ""],
        ["Value2", shortBinary(value2)],
        ["Value10", value10.toString()],
        ["Value16", value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "S") {
      styleComponents([[element, "connection"]]);
      cpuData.enable("RUDM");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("RUDM");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("RUDM");
  });
}

export function RURS1BU(element: SVGElem, cpuData: SimulatorInfo) {
  cpuData.log("error", { m: "RURS1BU handler" });
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "right", () => {
    const value2 = cpuData.instructionResult().ru.rs1;
    const value10 = parseInt(value2, 2);
    const value16 = value10.toString(16);
    return tabular({
      pairs: [
        ["RU ⇔ BU", ""],
        ["Value2", shortBinary(value2)],
        ["Value10", value10.toString()],
        ["Value16", value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "B") {
      cpuData.enable("RURS1BU");
      styleComponents([[element, "connection"]]);
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("RURS1BU");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("RURS1BU");
  });
}

export function RURS2BU(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "right", () => {
    const value2 = cpuData.instructionResult().ru.rs2;
    const value10 = parseInt(value2, 2);
    const value16 = value10.toString(16);
    return tabular({
      pairs: [
        ["RU ⇔ BU", ""],
        ["Value2", value2],
        ["Value10", value10.toString()],
        ["Value16", value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "B") {
      cpuData.enable("RURS2BU");
      styleComponents([[element, "connection"]]);
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("RURS2BU");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("RURS2BU");
  });
}

export function ALUAALU(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = shortBinary(cpuData.instructionResult().alua.result);
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (cpuData.enabled("ALUA")) {
      cpuData.enable("ALUAALU");
      styleComponents([[element, "connection"]]);
    } else {
      cpuData.disable("ALUAALU");
      styleComponents([[element, "connectionDisabled"]]);
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ALUAALU");
  });
}

export function ALUBALU(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = shortBinary(cpuData.instructionResult().alub.result);
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("ALUBALU");
    styleComponents([[element, "connection"]]);
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ALUBALU");
  });
}

export function ALUDM(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().alu.result;
    const value10 = parseInt(value2, 2);
    const value16 = value10.toString(16);

    return tabular({
      pairs: [
        ["ALU ⇔ DM", ""],
        ["Value2", shortBinary(value2)],
        ["Value10", value10],
        ["Value16", value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "S" || cpuData.instructionOpcode() === "0000011") {
      cpuData.enable("ALUDM");
      styleComponents([[element, "connection"]]);
    } else {
      cpuData.disable("ALUDM");
      styleComponents([[element, "connectionDisabled"]]);
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ALUDM");
  });
}

export function ALUWBMUX(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().alu.result;
    const value10 = parseInt(value2, 2);

    return tabular({
      pairs: [
        ["ALU ⇔ WBMUX", ""],
        ["Value", shortBinary(value2)],
        ["Value10", value10],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (storesALU(cpuData.instructionType(), cpuData.instructionOpcode())) {
      styleComponents([[element, "connection"]]);
      cpuData.enable("ALUWBMUX");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("ALUWBMUX");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ALUWBMUX");
  });
}

export function DMWBMUX(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().dm.dataRd;
    const value10 = parseInt(value2, 2);
    const value16 = value10.toString(16);
    return tabular({
      pairs: [
        ["DM ⇔ WBMux", ""],
        ["Value2", shortBinary(value2)],
        ["Value10", value10.toString()],
        ["Value16", value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (storesMemRead(instType, instOpcode)) {
      styleComponents([[element, "connection"]]);
      cpuData.enable("DMWBMUX");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("DMWBMUX");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("DMWBMUX");
  });
}

export function ADD4WBMUX(element: SVGElem, cpuData: SimulatorInfo) {
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().add4.result;
    const value16 = parseInt(value2, 2).toString(16);
    return tabular({
      pairs: [
        ["ADD4 ⇔ WBMux", ""],
        ["Value2", value2],
        ["Value16", "0x" + value16],
      ],
    });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (storesNextPC(instType, instOpcode)) {
      cpuData.enable("ADD4WBMUX");
      styleComponents([[element, "connection"]]);
    } else {
      cpuData.disable("ADD4WBMUX");
      styleComponents([[element, "connectionDisabled"]]);
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ADD4WBMUX");
  });
}

export function BUBUMUX(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const BURes = cpuData.instructionResult().bu.result;
    return tabular({
      pairs: [
        ["BU ⇔ BUMux", ""],
        ["NextPCSrc", BURes],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([[element, "connection"]]);
    cpuData.enable("BUBUMUX");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("BUBUMUX");
  });
}

export function ALUBUMUX(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value2 = cpuData.instructionResult().alu.result;
    const value10 = parseInt(value2, 2);
    const value16 = value10.toString(16);

    return tabular({
      pairs: [
        ["ALU ⇔ BUMux", ""],
        ["Address2", shortBinary(value2)],
        ["Address10", value10.toString()],
        ["Address16", "0x" + value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (branchesOrJumps(instType, instOpcode)) {
      styleComponents([[element, "connection"]]);
      cpuData.enable("ALUBUMUX");
    } else {
      styleComponents([[element, "connectionDisabled"]]);
      cpuData.disable("ALUBUMUX");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ALUBUMUX");
  });
}

export function ADD4BUMUX(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = cpuData.instructionResult().add4.result;
    const value16 = parseInt(value, 2).toString(16);
    return tabular({
      pairs: [
        ["ADD4 ⇔ BUMux", ""],
        ["Value2", shortBinary(value)],
        ["Value16", "0x" + value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    styleComponents([[element, "connection"]]);
    pathOnTop(element);
    cpuData.enable("ADD4BUMUX");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ADD4BUMUX");
  });
}

export function BUMUXPC(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);

  cpuData.installTooltip(element, "top", () => {
    const value2 = cpuData.instructionResult().buMux.result;
    const value16 = parseInt(value2, 2).toString(16);
    return tabular({
      pairs: [
        ["NextPC ⇔ PC", ""],
        ["Address2", shortBinary(value2)],
        ["Address16", "0x" + value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("BUMUXPC");
    styleComponents([[element, "connection"]]);
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("BUMUXPC");
  });
}

export function ADD4CT(element: SVGElem, cpuData: SimulatorInfo) {
  styleComponents([[element, "connectionDisabled"]]);
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("ADD4CT");
    styleComponents([[element, "connection"]]);
  });

  document.addEventListener("SimulatorTermination", (e) => {
    styleComponents([[element, "connectionDisabled"]]);
    cpuData.disable("ADD4CT");
  });
}
