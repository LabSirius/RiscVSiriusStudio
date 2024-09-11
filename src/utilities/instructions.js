/**
 * Tests if an instruction uses rs1
 * @param {*} instType the instruction type
 */
function usesRs1(instType) {
  switch (instType) {
    case "U":
    case "J":
      return false;
  }
  return true;
}

/**
 * Tests if an instruction uses rs2
 * @param {*} instType the instruction type
 */
function usesRs2(instType) {
  switch (instType) {
    case "R":
    case "S":
    case "B":
      return true;
  }
  return false;
}

/**
 * Tests if an instruction uses rd
 * @param {*} instType the instruction type
 */
function usesRd(instType) {
  switch (instType) {
    case "S":
    case "B":
      return false;
  }
  return true;
}

/**
 * Tests whether register name is used during the execution of an instruction of type instType.
 * @param {string } name: name of the register in x-format i.e. x3, etc.
 * @param {*} instType: type of the instruction
 * @returns
 */
export function usesRegister(name, instType) {
  const selector = {
    rs1: usesRs1,
    rs2: usesRs2,
    rd: usesRd,
  };
  return selector[name](instType);
}

export function usedRegisters(instType) {
  const select = {
    R: ["rs1", "rs2", "rd"],
    I: ["rs1", "rd"],
    S: ["rs1", "rs2"],
    B: ["rs1", "rs2"],
    U: ["rd"],
    J: ["rd"],
  };
  return select[instType];
}
/**
 * Tests if an instruction uses fuct3
 * @param {*} instType the instruction type
 *
 * Every instruction that uses rs1 also uses funct3 and vic.
 */
export function usesFunct3(instType) {
  return usesRs1(instType);
}

/**
 * Tests if an instruction uses funct7
 * @param {*} instType the instruction type
 */
export function usesFunct7(instType) {
  // TODO: some I type arithmetic operations use funct7
  return instType === "R";
}

/**
 * Tests if an instruction uses the ALU
 * @param {*} instType the instruction type
 */
export function usesALU(instType) {
  switch (instType) {
    case "R":
    case "I":
      return true;
  }
  return false;
}

export function isIArithmetic(instType, instOpcode) {
  return instType === "I" && instOpcode === "0010011";
}

export function isILoad(instType, instOpcode) {
  return instType === "I" && instOpcode === "0000011";
}

export function isIJump(instType, instOpcode) {
  return instType === "I" && instOpcode === "1100111";
}

export function isIExt(instType, instOpcode) {
  return instType === "I" && instOpcode === "1110011";
}

export function isLUI(instType, instOpcode) {
  return instType === "U" && instOpcode === "0110111";
}

export function isAUIPC(instType, instOpcode) {
  return instType === "U" && instOpcode === "0010111";
}

export function usesDM(instType, instOpcode) {
  switch (true) {
    case instType === "S":
    case isILoad(instType, instOpcode):
      return true;
  }
  return false;
}

export function storesNextPC(instType, instOpcode) {
  switch (true) {
    case instType === "J":
    case isIJump(instType, instOpcode):
      return true;
  }
  return false;
}

export function usesIMM(instType) {
  return instType !== "R";
}

/**
 * Tests if an instruction writes to the data memory
 * @param {*} instType the instruction type
 * @param {*} instOpcode the instruction opcode
 */
export function writesDM(instType, instOpcode) {
  return instType === "S";
}
/**
 * Tests if an instruction writes to the RU
 * @param {*} instType the instruction type
 * @param {*} instOpcode the instruction opcode
 */
export function writesRU(instType, instOpcode) {
  switch (true) {
    case instType === "R":
    case isIArithmetic(instType, instOpcode):
    case isILoad(instType, instOpcode):
    case isIJump(instType, instOpcode):
    case instType === "J":
    case instType === "U":
      return true;
  }
  return false;
}

export function branchesOrJumps(instType, instOpcode) {
  switch (true) {
    case instType === "B":
    case instType === "J":
    case isIJump(instType, instOpcode):
      return true;
  }
  return false;
}

export function storesALU(instType, instOpcode) {
  switch (true) {
    case instType === "R":
    case isIArithmetic(instType, instOpcode):
    case instType === "U":
      return true;
  }
  return false;
}
export function storesMemRead(instType, instOpcode) {
  return isILoad(instType, instOpcode);
}

/**
 * Returns the function type from a given opcode.
 */
export function opcodeToType(opcode) {
  switch (opcode) {
    case "0110011":
      return "R";
    case "0010011":
    case "0000011":
    case "1100111":
    case "1110011":
      return "I";
    case "0100011":
      return "S";
    case "1100011":
      return "B";
    case "1101111":
      return "J";
    case "0110111":
    case "0010111":
      return "U";
  }
}

export function getRs1(instruction) {
  if (!usesRs1(instruction.type)) {
    throw new Error(
      "Instruction of type " + instruction.type + " does not have rs1 field."
    );
  }
  return instruction.rs1.regeq;
}

export function getRs2(instruction) {
  if (!usesRs2(instruction.type)) {
    throw new Error(
      "Instruction of type " + instruction.type + " does not have rs2 field."
    );
  }
  return instruction.rs2.regeq;
}

export function getRd(instruction) {
  if (!usesRd(instruction.type)) {
    throw new Error(
      "Instruction of type " + instruction.type + " does not have rd field."
    );
  }
  return instruction.rd.regeq;
}

export function getFunct3(instruction) {
  if (!usesFunct3(instruction.type)) {
    throw new Error(
      "Instruction of type " + instruction.type + " does not have funct3 field"
    );
  }
  return instruction.encoding.funct3;
}

export function getFunct7(instruction) {
  if (!usesFunct7(instruction.type)) {
    throw new Error(
      "Instruction of type " + instruction.type + " does not have funct7 field"
    );
  }
  return instruction.encoding.funct7;
}
