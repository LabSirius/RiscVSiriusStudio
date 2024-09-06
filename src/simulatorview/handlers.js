/*eslint camelcase: "error"*/

import _ from "../../node_modules/lodash-es/lodash.js";
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

import { computePosition, flip, shift, offset } from "@floating-ui/dom";

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

function shortBinary(bin) {
  const firstOne = bin.indexOf("1");
  if (firstOne !== -1) {
    return "32'b" + bin.substring(firstOne);
  } else {
    return "32'b0";
  }
}

function applyClass(comp, cls) {
  comp.setAttributeNS(null, "class", cls);
}

/**
 * Redraws element to be on top of all the other svg elements it overlaps with.
 * @param {*} element to be moved to the top of the svg
 *
 * This is very draw.io dependant and should be checked. As element is sometimes put inside a
 * group this will only work if the group is moved.
 */
function pathOnTop(element) {
  const realElement = element.parentElement;
  // const realElement = element;
  realElement.parentElement.appendChild(realElement);
}
/**
 * Installs a hover listener on element. The purpose of it is to bring the
 * element to the top when is active and hovered by the pointer.
 *
 */
function focus(element) {
  element.addEventListener("mousemove", () => {
    pathOnTop(element);
  });
}

function mouseHover(element, mmove, mout) {
  element.addEventListener("mousemove", mmove);
  element.addEventListener("mouseout", mout);
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
export function CLK(element, cpuData) {
  const {
    cpuElements: { CLKCLK: wave },
  } = cpuData.getInfo();

  applyClass(element, "component");
  applyClass(wave, "connection");
  cpuData.installTooltip(element, "bottom", paragraph({ text: "Clock" }));
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    applyClass(wave, "connection");
    cpuData.enable("CLK");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    // does nothing on termination.
  });
}

export function PC(element, cpuData) {
  const {
    cpuElements: { PCCLOCK: clock },
  } = cpuData.getInfo();

  const components = [element, clock];
  components.forEach((e) => {
    applyClass(e, "componentDisabled");
  });

  const text = () => {
    const inst = cpuData.getInstruction().inst;
    return paragraph({ text: inst });
  };
  cpuData.installTooltip(element, "bottom", text);

  document.addEventListener("SimulatorUpdate", (e) => {
    components.forEach((e) => {
      applyClass(e, "component");
    });
    cpuData.enable("PC");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    components.forEach((e) => {
      applyClass(e, "componentDisabled");
    });
    cpuData.disable("PC");
  });
}

export function ADD4(element, cpuData) {
  const {
    cpuElements: { ADD4WBMUX: add4WBMux },
  } = cpuData.getInfo();
  applyClass(element, "componentDisabled");
  applyClass(add4WBMux, "connectionDisabled");

  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    cpuData.enable("ADD4");
    applyClass(add4WBMux, "connectionDisabled");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    cpuData.disable("ADD4");
    applyClass(add4WBMux, "connectionDisabled");
  });
}

export function IM(element, cpuData) {
  const {
    cpuElements: { IMADDRESSTEXT: addressText, IMINSTRUCTIONTEXT: instText },
  } = cpuData.getInfo();

  const inputs = [addressText, instText];
  applyClass(element, "componentDisabled");
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });

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
    applyClass(element, "component");
    inputs.forEach((e) => {
      applyClass(e, "inputText");
    });
    cpuData.enable("IM");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    inputs.forEach((e) => {
      applyClass(e, "inputTextDisabled");
    });
    cpuData.disable("IM");
  });
}

function cuArrowTooltipText(cpuData) {
  const instType = cpuData.instructionType();
  const result = cpuData.instructionResult();
  switch (instType) {
    case "R":
      return tabular({
        pairs: [
          ["ALUASrc", result.ALUASrc],
          ["ALUBSrc", result.ALUBSrc],
          ["ALUOp", result.ALUOp],
          ["BrOp", result.BrOp],
          ["RUDataWrSrc", result.RUDataWrSrc],
          ["NextPCSrc", result.BURes],
          ["RUWr", result.RUWr],
        ],
      });
    case "I":
      return tabular({
        pairs: [
          ["ALUASrc", result.ALUASrc],
          ["ALUBSrc", result.ALUBSrc],
          ["ALUOp", result.ALUOp],
          ["BrOp", result.BrOp],
          ["RUDataWrSrc", result.RUDataWrSrc],
          ["NextPCSrc", result.BURes],
          ["RUWr", result.RUWr],
          ["IMMSrc", result.IMMSrc],
        ],
      });
    case "S":
      return tabular({
        pairs: [
          ["ALUASrc", result.ALUASrc],
          ["ALUBSrc", result.ALUBSrc],
          ["ALUOp", result.ALUOp],
          ["BrOp", result.BrOp],
          ["NextPCSrc", result.BURes],
          ["RUWr", result.RUWr],
          ["IMMSrc", result.IMMSrc],
        ],
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

function styleSignals(cpuData, instType, style) {
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
  };
  signalList[instType].forEach((signal) => {
    applyClass(signal, style);
  });
}

export function CU(element, cpuData) {
  const {
    cpuElements: { CUArrow: arrow },
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  applyClass(arrow, "connectionDisabled");
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
    arrow,
    () => {
      styleSignals(cpuData, cpuData.instructionType(), "signalHover");
    },
    () => {
      styleSignals(cpuData, cpuData.instructionType(), "signal");
    }
  );

  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "component");
    applyClass(arrow, "connection");

    cpuData.enable("CU");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    applyClass(arrow, "connectionDisabled");
    cpuData.disable("CU");
  });
}

function registerTooltipText(name, type, cpuData) {
  const instruction = cpuData.getInstruction();
  const { regname, regeq, regenc } = instruction[name];
  const binEnc = instruction.encoding[name];
  const value = cpuData.instructionResult()["RU" + name.toUpperCase() + "Val"];
  const value2 = shortBinary(value);
  const value10 = parseInt(value, 2).toString(10);
  const value16 = parseInt(value, 2).toString(16);

  const data = {
    general: tabular({
      pairs: [["Register", `${regname} (${regeq})`]],
    }),
    detailed: tabular({
      pairs: [
        ["Register", `${regname} (${regeq})`],
        ["Encoding", binEnc],
      ],
    }),
    valueGeneral: tabular({
      pairs: [
        ["Register", `${regname} (${regeq})`],
        ["Value2", value2],
        ["Value10", value10],
        ["Value16", "0x" + value16],
      ],
    }),
  };
  return data[type];
}

function setRUWr(cpuData) {
  const {
    cpuElements: { SgnRUWRVAL: ruwrSignalValue },
  } = cpuData.getInfo();
  ruwrSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().RUWr;
}

export function RU(element, cpuData) {
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

  const components = [element, clock];
  const inputs = [rs1Text, rs2Text, rdText, datawrText, ruwrText];
  const outputs = [val1Text, val2Text];
  const signals = [ruwrSignal, ruwrSignalVal];

  components.forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  outputs.forEach((e) => {
    applyClass(e, "outputTextDisabled");
  });
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });

  cpuData.installTooltip(
    rs1Text,
    "right-end",
    () => {
      if (usesRegister("rs1", cpuData.instructionType())) {
        return registerTooltipText("rs1", "detailed", cpuData);
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
        return registerTooltipText("rs2", "detailed", cpuData);
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
        return registerTooltipText("rd", "detailed", cpuData);
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
        return registerTooltipText("rs1", "valueGeneral", cpuData);
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
        return registerTooltipText("rs2", "valueGeneral", cpuData);
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
        const value = shortBinary(cpuData.instructionResult().WBMUXRes);
        const value10 = parseInt(cpuData.instructionResult().WBMUXRes, 2);

        return tabular({
          pairs: [
            ["Value", value],
            ["Value10", value10],
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
    components.forEach((e) => {
      applyClass(e, "component");
    });
    inputs.forEach((e) => {
      applyClass(e, "inputText");
    });
    outputs.forEach((e) => {
      applyClass(e, "outputText");
    });
    if (!usesRegister("rs1", instType)) {
      applyClass(rs1Text, "inputTextDisabled");
      applyClass(val1Text, "outputTextDisabled");
    }
    if (!usesRegister("rs2", instType)) {
      applyClass(rs2Text, "inputTextDisabled");
      applyClass(val2Text, "outputTextDisabled");
    }
    if (!usesRegister("rd", instType)) {
      applyClass(rdText, "inputTextDisabled");
    }
    signals.forEach((e) => {
      applyClass(e, "signal");
    });
    cpuData.enable("RU");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    components.forEach((e) => {
      applyClass(e, "componentDisabled");
    });
    inputs.forEach((e) => {
      applyClass(e, "inputTextDisabled");
    });
    outputs.forEach((e) => {
      applyClass(e, "outputTextDisabled");
    });
    signals.forEach((e) => {
      applyClass(e, "signalDisabled");
    });
    cpuData.disable("RU");
  });
}

function immTooltipText(type, cpuData) {
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

function setIMMSrc(cpuData) {
  const {
    cpuElements: { SgnIMMSRCVAL: immSignalValue },
  } = cpuData.getInfo();

  immSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().IMMSrc;
}

export function IMM(element, cpuData) {
  const {
    cpuElements: { SgnIMMSrcPTH: signal, SgnIMMSRCVAL: value },
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  const signals = [signal, value];
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  cpuData.installTooltip(
    element,
    "top",
    () => {
      return immTooltipText("detailed", cpuData);
    },
    "IMM"
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      applyClass(element, "component");
      setIMMSrc(cpuData);
      signals.forEach((e) => {
        applyClass(e, "signal");
      });
      cpuData.enable("IMM");
    } else {
      applyClass(element, "componentDisabled");
      signals.forEach((e) => {
        applyClass(e, "signalDisabled");
      });
      cpuData.disable("IMM");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    signals.forEach((e) => {
      applyClass(e, "signalDisabled");
    });
    cpuData.disable("IMM");
  });
}

export function ALUA(element, cpuData) {
  const {
    cpuElements: {
      ALUAMUXIC1: path1,
      ALUAMUXIC0: path0,
      SgnALUASrcPTH: signal,
      ALUAMUXTEXT: text,
    },
  } = cpuData.getInfo();

  const paths = [path0, path1];
  applyClass(element, "componentDisabled");
  applyClass(text, "inputTextDisabled");
  paths.forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  applyClass(signal, "signalDisabled");
  const path0Visible = (inst) => {
    return inst === "R" || inst === "I" || inst === "S";
  };
  // TODO: the value is presented in decimal.
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
      applyClass(element, "component");
      applyClass(text, "inputText");
      applyClass(signal, "signal");
      if (path0Visible(instType)) {
        applyClass(path0, "connection muxPath");
        applyClass(path1, "connectionDisabled muxPathDisabled");
      } else {
        applyClass(path1, "connection muxPath");
        applyClass(path0, "connectionDisabled muxPathDisabled");
      }
    } else {
      applyClass(element, "componentDisabled");
      applyClass(text, "inputTextDisabled");
      applyClass(signal, "signalDisabled");
      paths.forEach((x) => {
        applyClass(x, "connectionDisabled muxPathDisabled");
      });
    }
  });
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    applyClass(text, "inputTextDisabled");
    applyClass(signal, "signalDisabled");
    paths.forEach((x) => {
      applyClass(x, "connectionDisabled muxPathDisabled");
    });
    cpuData.disable("ALUA");
  });
}

export function ALUB(element, cpuData) {
  const {
    cpuElements: {
      ALUBMUXIC1: path1,
      ALUBMUXIC0: path0,
      SgnALUBSrcPTH: signal,
      ALUBMUXTEXT: text,
    },
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  applyClass(text, "inputTextDisabled");
  [path1, path0].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  applyClass(signal, "signalDisabled");
  const path0Visible = (inst) => {
    return usesRegister("rs2", inst) && inst !== "S" && inst !== "B";
    // return inst === "R" || inst === "B" || inst === "J";
  };
  cpuData.installTooltip(
    path0,
    "top-start",
    () => {
      const value = shortBinary(cpuData.instructionResult().RURS2Val);
      return paragraph({ text: value });
    },
    "ALUA"
  );
  cpuData.installTooltip(
    path1,
    "bottom-start",
    () => {
      const value = shortBinary(cpuData.instructionResult().IMMALUBVal);
      return paragraph({ text: value });
    },
    "ALUA"
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    // Always enabled for all instructions
    cpuData.enable("ALUB");
    applyClass(element, "component");
    applyClass(text, "inputText");
    applyClass(signal, "signal");
    const instType = cpuData.instructionType();
    if (path0Visible(instType)) {
      applyClass(path0, "connection muxPath");
      applyClass(path1, "connectionDisabled muxPathDisabled");
    } else {
      applyClass(path1, "connection muxPath");
      applyClass(path0, "connectionDisabled muxPathDisabled");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    applyClass(text, "inputTextDisabled");
    applyClass(signal, "signalDisabled");
    [path0, path1].forEach((x) => {
      applyClass(x, "connectionDisabled muxPathDisabled");
    });
    cpuData.disable("ALUB");
  });
}

function aluTooltipText(name, cpuData) {
  const { A: valA, B: valB, ALURes: valALURes } = cpuData.instructionResult();
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

function setALUOp(cpuData) {
  const {
    cpuElements: { SgnALUOPVAL: aluSignalValue },
  } = cpuData.getInfo();

  aluSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().ALUOp;
}

export function ALU(element, cpuData) {
  const {
    cpuElements: {
      ALUTEXTINA: textA,
      ALUTEXTINB: textB,
      ALUTEXTRES: valALURes,
      SgnALUOPPTH: aluSignal,
      SgnALUOPVAL: aluSignalValue,
    },
  } = cpuData.getInfo();

  const inputs = [textA, textB];
  const signals = [aluSignal, aluSignalValue];

  applyClass(element, "componentDisabled");
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  applyClass(valALURes, "outputTextDisabled");

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
    // cpuData.log("info", { m: "At ALU", v: cpuData.result });
    // !TODO: Enabled for all components?
    cpuData.enable("ALU");
    applyClass(element, "component");
    inputs.forEach((e) => {
      applyClass(e, "inputText");
    });
    applyClass(valALURes, "outputText");
    setALUOp(cpuData);
    signals.forEach((e) => {
      applyClass(e, "signal");
    });
  });
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    inputs.forEach((e) => {
      applyClass(e, "inputTextDisabled");
    });
    signals.forEach((e) => {
      applyClass(e, "signalDisabled");
    });
    applyClass(valALURes, "outputTextDisabled");
    cpuData.disable("ALU");
  });
}

function setBrOp(cpuData) {
  const {
    cpuElements: { SgnBUBROPVAL: bropSignalValue },
  } = cpuData.getInfo();
  bropSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().BrOp;
}

export function BU(element, cpuData) {
  const {
    cpuElements: { SgnBUBROPPTH: signal, SgnBUBROPVAL: signalVal },
  } = cpuData.getInfo();
  const signals = [signal, signalVal];
  applyClass(element, "componentDisabled");
  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  cpuData.installTooltip(element, "top", () => {
    return paragraph({
      text: "Not in a branch operation. Next instruction in the program memory will be executed.",
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    // Branch unit is always enabled as it controls NextPCSrc. When in a branch
    // instruction its inputs coming from the registers will be enabled.
    cpuData.enable("BU");
    applyClass(element, "component");
    setBrOp(cpuData);
    signals.forEach((e) => {
      applyClass(e, "signal");
    });
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    signals.forEach((e) => {
      applyClass(e, "signalDisabled");
    });
  });
}

function dmTooltipText(name, cpuData) {
  const instType = cpuData.instructionType();
  const instOpcode = cpuData.instructionOpcode();
  if (name === "DataRd" && writesDM(instType, instOpcode)) {
    return paragraph({ text: "Unused for this instruction" });
  }
  if (name === "DataWr" && storesMemRead(instType, instOpcode)) {
    return paragraph({ text: "Unused for this instruction" });
  }

  const address = cpuData.instructionResult().DMAddress;
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
      const data = cpuData.instructionResult().DMDataWr;
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
      const data = cpuData.instructionResult().DMDataRd;
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

function setDMWr(cpuData) {
  const {
    cpuElements: { SgnDMWRVAL: wrSignalValue },
  } = cpuData.getInfo();

  wrSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().DMWr;
}

function setDMCtrl(cpuData) {
  const {
    cpuElements: { SgnDMCTRLVAL: ctrlSignalValue },
  } = cpuData.getInfo();

  ctrlSignalValue.getElementsByTagName("text")[0].innerHTML =
    cpuData.instructionResult().DMCtrl;
}

export function DM(element, cpuData) {
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

  const components = [element, clock];
  const connections = [clkConnection];
  const signals = [ctrlSignal, wrSignal, ctrlSignalVal, wrSignalVal];
  const inputs = [addressText, datawrText];
  const outputs = [dataRdText];

  signals.forEach((e) => {
    applyClass(e, "signalDisabled");
  });
  components.forEach((e) => {
    applyClass(e, "componentDisabled");
  });
  inputs.forEach((e) => {
    applyClass(e, "inputTextDisabled");
  });
  outputs.forEach((e) => {
    applyClass(e, "outputTextDisabled");
  });
  connections.forEach((e) => {
    applyClass(e, "connectionDisabled");
  });
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
      signals.forEach((e) => {
        applyClass(e, "signal");
      });
      components.forEach((e) => {
        applyClass(e, "component");
      });
      connections.forEach((e) => {
        applyClass(e, "connection");
      });
      setDMWr(cpuData);
      setDMCtrl(cpuData);
      signals.forEach((e) => {
        applyClass(e, "signal");
      });
      if (writesDM(instType, instOpcode)) {
        inputs.forEach((e) => {
          applyClass(e, "inputText");
        });
        outputs.forEach((e) => {
          applyClass(e, "outputTextDisabled");
        });
      } else {
        // reads from memory
        applyClass(addressText, "inputText");
        applyClass(datawrText, "inputTextDisabled");
        applyClass(dataRdText, "outputText");
      }
    } else {
      signals.forEach((e) => {
        applyClass(e, "signalDisabled");
      });
      components.forEach((e) => {
        applyClass(e, "componentDisabled");
      });
      inputs.forEach((e) => {
        applyClass(e, "inputTextDisabled");
      });
      outputs.forEach((e) => {
        applyClass(e, "outputTextDisabled");
      });
      connections.forEach((e) => {
        applyClass(e, "connectionDisabled");
      });
    }
  });
  document.addEventListener("SimulatorTermination", (e) => {
    signals.forEach((e) => {
      applyClass(e, "signalDisabled");
    });
    components.forEach((e) => {
      applyClass(e, "componentDisabled");
    });
    inputs.forEach((e) => {
      applyClass(e, "inputTextDisabled");
    });
    outputs.forEach((e) => {
      applyClass(e, "outputTextDisabled");
    });
    connections.forEach((e) => {
      applyClass(e, "connectionDisabled");
    });
    cpuData.disable("DM");
  });
}

export function BUMUX(element, cpuData) {
  const {
    cpuElements: { BUMUXIC1: path1, BUMUXIC0: path0, BUMUXTEXT: text },
  } = cpuData.getInfo();

  const connections = [path1, path0];
  applyClass(element, "componentDisabled");
  applyClass(text, "inputTextDisabled");
  connections.forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path1Visible = (instType, instOpcode, branchResult) => {
    return branchesOrJumps(instType, instOpcode) && branchResult;
  };
  cpuData.installTooltip(path0, "top", () => {
    const value = cpuData.instructionResult().ADD4Res;
    return paragraph({ text: value });
  });
  cpuData.installTooltip(path1, "top", () => {
    const value = shortBinary(cpuData.instructionResult().ALURes);
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("BUMUX");
    applyClass(element, "component");
    applyClass(text, "inputText");
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    const branchResult = cpuData.instructionResult().BURes;
    if (path1Visible(instType, instOpcode, parseInt(branchResult))) {
      applyClass(path1, "connection muxPath");
      applyClass(path0, "connectionDisabled muxPathDisabled");
    } else {
      applyClass(path0, "connection muxPath");
      applyClass(path1, "connectionDisabled muxPathDisabled");
    }
  });
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    applyClass(text, "inputTextDisabled");
    connections.forEach((x) => {
      applyClass(x, "connectionDisabled muxPathDisabled");
    });
    cpuData.disable("BUMUX");
  });
}

export function WBMUX(element, cpuData) {
  const {
    cpuElements: {
      WBMUXIC00: path00,
      WBMUXIC01: path01,
      WBMUXIC10: path10,
      SgnWBPTH: signal,
      WBMUXTEXT: text,
    },
  } = cpuData.getInfo();

  applyClass(element, "componentDisabled");
  applyClass(text, "inputTextDisabled");
  applyClass(signal, "signalDisabled");
  [path00, path01, path10].forEach((x) => {
    applyClass(x, "connectionDisabled muxPathDisabled");
  });
  const path00Visible = (inst, opcode) => {
    return storesALU(inst, opcode);
  };
  const path01Visible = (inst, opcode) => {
    return storesMemRead(inst, opcode);
  };
  const path10Visible = (inst, opcode) => {
    return storesNextPC(inst, opcode);
  };
  cpuData.installTooltip(path00, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().ALURes);
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
      applyClass(element, "component");
      applyClass(text, "inputText");
      applyClass(signal, "signal");
      const instOC = cpuData.instructionOpcode();
      if (path00Visible(instType, instOC)) {
        [path00].forEach((x) => {
          applyClass(x, "connection muxPath");
        });
        [path01, path10].forEach((x) => {
          applyClass(x, "connectionDisabled muxPathDisabled");
        });
      } else if (path01Visible(instType, instOC)) {
        [path01].forEach((x) => {
          applyClass(x, "connection muxPath");
        });
        [path00, path10].forEach((x) => {
          applyClass(x, "connectionDisabled muxPathDisabled");
        });
      } else if (path10Visible(instType, instOC)) {
        [path10].forEach((x) => {
          applyClass(x, "connection muxPath");
        });
        [path00, path01].forEach((x) => {
          applyClass(x, "connectionDisabled muxPathDisabled");
        });
      }
    } else {
      applyClass(element, "componentDisabled");
      applyClass(text, "inputTextDisabled");
      applyClass(signal, "signalDisabled");
      [path00, path01, path10].forEach((x) => {
        applyClass(x, "connectionDisabled muxPathDisabled");
      });
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "componentDisabled");
    applyClass(text, "inputTextDisabled");
    applyClass(signal, "signalDisabled");
    [path00, path01, path10].forEach((x) => {
      applyClass(x, "connectionDisabled muxPathDisabled");
    });
    cpuData.disable("WBMUX");
  });
}

// PATHS

export function CLKPC(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "right", paragraph({ text: "Clock ⇔ PC" }));
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("CLKPC");
    pathOnTop(element);
    applyClass(element, "connection");
  });
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("CLKPC");
  });
}

export function CLKRU(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("CLKRU");
    pathOnTop(element);
    applyClass(element, "connection");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("CLKRU");
  });
}

export function CLKDM(element, cpuData) {
  // TODO: check the behavior of this element on click
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("CLKDM");
  });
}

export function PCIM(element, cpuData) {
  applyClass(element, "connectionDisabled");
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
    cpuData.enable("PCIM");
    applyClass(element, "connection");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("PCIM");
  });
}

export function PCADD4(element, cpuData) {
  applyClass(element, "connectionDisabled");
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
    applyClass(element, "connection");
    cpuData.enable("PCADD4");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("PCADD4");
  });
}

export function PCALUA(element, cpuData) {
  applyClass(element, "connectionDisabled");
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
      applyClass(element, "connection");
      cpuData.enable("PCALUA");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("PCALUA");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
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
function imCUTooltipText(connection, cpuData) {
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

export function IMCUOPCODE(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("opcode", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUOPCODE")) {
        cpuData.setBinaryInstruction("opcode");
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
    applyClass(element, "connection");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("IMCUOPCODE");
  });
}

export function IMCUFUNCT3(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("funct3", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUFUNCT3")) {
        cpuData.setBinaryInstruction("funct3");
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
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMCUFUNCT3");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMCUFUNCT3");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("IMCUFUNCT3");
  });
}

export function IMCUFUNCT7(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "left", () => {
    return imCUTooltipText("funct7", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMCUFUNCT7")) {
        const html = binFormattedDisplay(cpuData, "funct7");
        cpuData.setBinaryInstruction(html, "funct7");
      }
    },
    () => {
      if (cpuData.enabled("IMCUFUNCT7")) {
        const html = currentBinInst(cpuData);
        cpuData.setBinaryInstruction(html);
      }
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (usesFunct7(instType)) {
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMCUFUNCT7");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMCUFUNCT7");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
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
function imRUTooltipText(connection, cpuData) {
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

export function IMRURS1(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rs1", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURS1")) {
        cpuData.setBinaryInstruction("rs1");
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
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMRURS1");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMRURS1");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("IMRURS1");
  });
}

export function IMRURS2(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rs2", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURS2")) {
        cpuData.setBinaryInstruction("rs2");
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
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMRURS2");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMRURS2");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("IMRURS2");
  });
}

export function IMRURDEST(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    return imRUTooltipText("rd", cpuData);
  });
  mouseHover(
    element,
    () => {
      if (cpuData.enabled("IMRURDEST")) {
        cpuData.setBinaryInstruction("rd");
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
      applyClass(element, "connection");
      pathOnTop(element);
      cpuData.enable("IMRURDEST");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMRURDEST");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("IMRURDEST");
  });
}

export function IMIMM(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  mouseHover(
    element,
    () => {
      cpuData.setBinaryInstruction("imm");
    },
    () => {
      cpuData.setBinaryInstruction();
    }
  );
  document.addEventListener("SimulatorUpdate", (e) => {
    if (usesIMM(cpuData.instructionType())) {
      applyClass(element, "connection");
      cpuData.enable("IMIMM");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMIMM");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("IMIMM");
  });
}

export function WBMUXRU(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().WBMUXRes);
    const value10 = parseInt(cpuData.instructionResult().WBMUXRes, 2);
    return tabular({
      pairs: [
        ["WBMUX ⇔ RU", ""],
        ["Value", value],
        ["Value10", value10],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (writesRU(cpuData.instructionType(), cpuData.instructionOpcode())) {
      applyClass(element, "connection");
      cpuData.enable("WBMUXRU");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("WBMUXRU");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("WBMUXRU");
  });
}

export function IMMALUB(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "right", () => {
    const imm32 = cpuData.instructionResult().IMMALUBVal;
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
      applyClass(element, "connection");
      cpuData.enable("IMMALUB");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("IMMALUB");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("IMMALUB");
  });
}

export function RUALUA(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().RURS1Val);
    const value10 = parseInt(cpuData.instructionResult().RURS1Val, 2);

    return tabular({
      pairs: [
        ["RU ⇔ ALUA", ""],
        ["Value", value],
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
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RUALUA");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("RUALUA");
  });
}

export function RUALUB(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().RURS2Val);
    const value10 = parseInt(cpuData.instructionResult().RURS2Val, 2);

    return tabular({
      pairs: [
        ["RU ⇔ ALUB", ""],
        ["Value", value],
        ["Value10", value10],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (usesRegister("rs2", instType) && !usesIMM(instType)) {
      cpuData.enable("RUALUB");
      pathOnTop(element);
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RUALUB");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("RUALUB");
  });
}

export function RUDM(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().RURS2Val);
    return tabular({
      pairs: [
        ["RU ⇔ DM", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "S") {
      applyClass(element, "connection");
      cpuData.enable("RUDM");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RUDM");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("RUDM");
  });
}

export function RURS1BU(element, cpuData) {
  cpuData.log("error", { m: "RURS1BU handler" });
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "right", () => {
    const value = shortBinary(cpuData.instructionResult().RURS1Val);
    return tabular({
      pairs: [
        ["RU ⇔ BU", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "B") {
      cpuData.enable("RURS1BU");
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RURS1BU");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("RURS1BU");
  });
}

export function RURS2BU(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "right", () => {
    const value = shortBinary(cpuData.instructionResult().RURS2Val);
    return tabular({
      pairs: [
        ["RU ⇔ BU", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "B") {
      cpuData.enable("RURS2BU");
      applyClass(element, "connection");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("RURS2BU");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("RURS2BU");
  });
}

export function ALUAALU(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = shortBinary(cpuData.instructionResult().ALUARes);
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (cpuData.enabled("ALUA")) {
      cpuData.enable("ALUAALU");
      applyClass(element, "connection");
    } else {
      cpuData.disable("ALUAALU");
      applyClass(element, "connectionDisabled");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ALUAALU");
  });
}

export function ALUBALU(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = shortBinary(cpuData.instructionResult().ALUBRes);
    return paragraph({ text: value });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("ALUBALU");
    applyClass(element, "connection");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ALUBALU");
  });
}

export function ALUDM(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().ALURes);
    return tabular({
      pairs: [
        ["ALU ⇔ DM", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    if (instType === "S" || cpuData.instructionOpcode() === "0000011") {
      cpuData.enable("ALUDM");
      applyClass(element, "connection");
    } else {
      cpuData.disable("ALUDM");
      applyClass(element, "connectionDisabled");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ALUDM");
  });
}

export function ALUWBMUX(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().ALURes);
    const value10 = parseInt(cpuData.instructionResult().ALURes, 2);

    return tabular({
      pairs: [
        ["ALU ⇔ WBMUX", ""],
        ["Value", value],
        ["Value10", value10],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    if (storesALU(cpuData.instructionType(), cpuData.instructionOpcode())) {
      applyClass(element, "connection");
      cpuData.enable("ALUWBMUX");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("ALUWBMUX");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ALUWBMUX");
  });
}

export function DMWBMUX(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().DMDataRd;
    return tabular({
      pairs: [
        ["DM ⇔ WBMux", ""],
        ["Value", value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (storesMemRead(instType, instOpcode)) {
      applyClass(element, "connection");
      cpuData.enable("DMWBMUX");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("DMWBMUX");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("DMWBMUX");
  });
}

export function ADD4WBMUX(element, cpuData) {
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = cpuData.instructionResult().ADD4Res;
    return tabular({
      pairs: [
        ["ADD4 ⇔ WBMux", ""],
        ["Value", value],
      ],
    });
  });

  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (storesNextPC(instType, instOpcode)) {
      cpuData.enable("ADD4WBMUX");
      applyClass(element, "connection");
    } else {
      cpuData.disable("ADD4WBMUX");
      applyClass(element, "connectionDisabled");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ADD4WBMUX");
  });
}

export function BUBUMUX(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const BURes = cpuData.instructionResult().BURes;
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["BU ⇔ BUMux", ""],
        ["NextPCSrc", BURes],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    cpuData.enable("BUBUMUX");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("BUBUMUX");
  });
}

export function ALUBUMUX(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "bottom", () => {
    const value = shortBinary(cpuData.instructionResult().ALURes);
    const value10 = parseInt(cpuData.instructionResult().ALURes, 2);
    const value16 = value10.toString(16);

    return tabular({
      pairs: [
        ["ALU ⇔ BUMux", ""],
        ["Address2", value],
        ["Address10", value10],
        ["Address16", "0x" + value16],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    const instType = cpuData.instructionType();
    const instOpcode = cpuData.instructionOpcode();
    if (branchesOrJumps(instType, instOpcode)) {
      applyClass(element, "connection");
      cpuData.enable("ALUBUMUX");
    } else {
      applyClass(element, "connectionDisabled");
      cpuData.disable("ALUBUMUX");
    }
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ALUBUMUX");
  });
}

export function ADD4BUMUX(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  cpuData.installTooltip(element, "top", () => {
    const value = cpuData.instructionResult().ADD4Res;
    return tabular({
      pairs: [
        ["ADD4 ⇔ BUMux", ""],
        ["Value", "0x" + value],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "connection");
    pathOnTop(element);
    cpuData.enable("ADD4BUMUX");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ADD4BUMUX");
  });
}

export function BUMUXPC(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);

  cpuData.installTooltip(element, "top", () => {
    const BUMUXRes = cpuData.instructionResult().BUMUXRes;
    const inst = cpuData.getInstruction().inst;
    return tabular({
      pairs: [
        ["NextPC ⇔ PC", ""],
        ["Address", "0x" + BUMUXRes],
      ],
    });
  });
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("BUMUXPC");
    applyClass(element, "connection");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("BUMUXPC");
  });
}

export function ADD4CT(element, cpuData) {
  applyClass(element, "connectionDisabled");
  focus(element);
  document.addEventListener("SimulatorUpdate", (e) => {
    cpuData.enable("ADD4CT");
    applyClass(element, "connection");
  });

  document.addEventListener("SimulatorTermination", (e) => {
    applyClass(element, "connectionDisabled");
    cpuData.disable("ADD4CT");
  });
}
// !LOG
// function setBinaryInstruction(cpuData, html) {
//   const {
//     cpuElements: { LOGTEXTBIN: text },
//   } = cpuData.getInfo();
//   const binText = text.getElementsByTagName("div")[2];
//   binText.innerHTML = html;
// }

function setImmInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTIMM: text },
  } = cpuData.getInfo();
  const immText = text.getElementsByTagName("text")[0];
  immText.innerHTML = html;
}

function setHexInstruction(cpuData, html) {
  const {
    cpuElements: { LOGTEXTHEX: text },
  } = cpuData.getInfo();

  const hexText = text.getElementsByTagName("div")[2];
  hexText.innerHTML = html;
}

export function LOGTEXTIMM(element, cpuData) {
  const {
    cpuElements: { LOGTEXTBIN: text },
    instruction: instruction,
  } = cpuData.getInfo();

  setImmInstruction(cpuData, "--no immediate for instruction--");
  applyClass(element, "instructionDisabled");
  document.addEventListener("SimulatorUpdate", (e) => {
    applyClass(element, "instruction");
  });
}

function LOGTEXTHEX(element, cpuData) {
  const {
    cpuElements: { LOGTEXTBIN: text },
    instruction: instruction,
  } = cpuData.getInfo();

  setHexInstruction(cpuData, "--no hex --");
  applyClass(element, "instructionDisabled");
  document.addEventListener("SimulatorUpdate", (e) => {
    const hex = instruction.encoding.hexEncoding;
    setHexInstruction(cpuData, hex);
    applyClass(element, "instruction");
  });
}
