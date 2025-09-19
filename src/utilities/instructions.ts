/**
 * Tests if an instruction uses rs1
 * @param {*} instType the instruction type
 */
function usesRs1(instType: string) {
  switch (instType) {
    case 'U':
    case 'J':
      return false;
  }
  return true;
}

/**
 * Tests if an instruction uses rs2
 * @param {*} instType the instruction type
 */
function usesRs2(instType: string) {
  switch (instType) {
    case 'R':
    case 'S':
    case 'B':
      return true;
  }
  return false;
}

/**
 * Tests if an instruction uses rd
 * @param {*} instType the instruction type
 */
function usesRd(instType: string) {
  switch (instType) {
    case 'S':
    case 'B':
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
export function usesRegister(name: string, instType: string) {
  switch (name) {
    case 'rs1':
      return usesRs1(instType);
    case 'rs2':
      return usesRs2(instType);
    case 'rd':
      return usesRd(instType);
    default:
      throw new Error('Register name is not valid.');
  }
}

export function usedRegisters(instType: string) {
  switch (instType) {
    case 'R':
      return ['rs1', 'rs2', 'rd'];
    case 'I':
      return ['rs1', 'rd'];
    case 'S':
      return ['rs1', 'rs2'];
    case 'B':
      return ['rs1', 'rs2'];
    case 'U':
      return ['rd'];
    case 'J':
      return ['rd'];
    default:
      throw new Error('Invalid instruction type');
  }
}
/**
 * Tests if an instruction uses fuct3
 * @param {*} instType the instruction type
 *
 * Every instruction that uses rs1 also uses funct3 and vic.
 */
export function usesFunct3(instType: string) {
  return usesRs1(instType);
}

/**
 * Tests if an instruction uses funct7
 * @param {*} instType the instruction type
 */
export function usesFunct7(instType: string) {
  // TODO: some I type arithmetic operations use funct7
  return instType === 'R';
}

/**
 * Tests if an instruction uses the ALU
 * @param {*} instType the instruction type
 */
export function usesALU(instType: string) {
  switch (instType) {
    case 'R':
    case 'I':
      return true;
  }
  return false;
}

export function isIArithmetic(instType: string, instOpcode: string) {
  return instType === 'I' && instOpcode === '0010011';
}

export function isILoad(instType: string, instOpcode: string) {
  return instType === 'I' && instOpcode === '0000011';
}

export function isIJump(instType: string, instOpcode: string) {
  return instType === 'I' && instOpcode === '1100111';
}

export function isIExt(instType: string, instOpcode: string) {
  return instType === 'I' && instOpcode === '1110011';
}

export function isLUI(instType: string, instOpcode: string) {
  return instType === 'U' && instOpcode === '0110111';
}

export function isAUIPC(instType: string, instOpcode: string) {
  return instType === 'U' && instOpcode === '0010111';
}

export function usesDM(instType: string, instOpcode: string) {
  switch (true) {
    case instType === 'S':
    case isILoad(instType, instOpcode):
      return true;
  }
  return false;
}

export function storesNextPC(instType: string, instOpcode: string) {
  switch (true) {
    case instType === 'J':
    case isIJump(instType, instOpcode):
      return true;
  }
  return false;
}

export function usesIMM(instType: string) {
  return instType !== 'R';
}
/**
 * Tests if an instruction reads from the data memory
 * @param {*} instType the instruction type
 * @param {*} instOpcode the instruction opcode
 */
export function readsDM(instType: string, instOpcode: string) {
  return isILoad(instType, instOpcode);
}
/**
 * Tests if an instruction writes to the data memory
 * @param {*} instType the instruction type
 * @param {*} instOpcode the instruction opcode
 */
export function writesDM(instType: string, instOpcode: string) {
  return instType === 'S';
}
/**
 * Tests if an instruction writes to the RU
 * @param {*} instType the instruction type
 * @param {*} instOpcode the instruction opcode
 */
export function writesRU(instType: string, instOpcode: string) {
  switch (true) {
    case instType === 'R':
    case isIArithmetic(instType, instOpcode):
    case isILoad(instType, instOpcode):
    case isIJump(instType, instOpcode):
    case instType === 'J':
    case instType === 'U':
      return true;
  }
  return false;
}

export function branchesOrJumps(instType: string, instOpcode: string) {
  switch (true) {
    case instType === 'B':
    case instType === 'J':
    case isIJump(instType, instOpcode):
      return true;
  }
  return false;
}

export function storesALU(instType: string, instOpcode: string) {
  switch (true) {
    case instType === 'R':
    case isIArithmetic(instType, instOpcode):
    case instType === 'U':
      return true;
  }
  return false;
}
export function storesMemRead(instType: string, instOpcode: string) {
  return isILoad(instType, instOpcode);
}

/**
 * Returns the function type from a given opcode.
 */
export function opcodeToType(opcode: string) {
  switch (opcode) {
    case '0110011':
      return 'R';
    case '0010011':
    case '0000011':
    case '1100111':
    case '1110011':
      return 'I';
    case '0100011':
      return 'S';
    case '1100011':
      return 'B';
    case '1101111':
      return 'J';
    case '0110111':
    case '0010111':
      return 'U';
    default:
      throw new Error('Invalid opcode value');
  }
}

export function getRs1(instruction: any) {
  if (!usesRs1(instruction.type)) {
    throw new Error(
      'Instruction of type ' + instruction.type + ' does not have rs1 field.'
    );
  }
  return instruction.rs1.regeq;
}

export function getRs2(instruction: any) {
  if (!usesRs2(instruction.type)) {
    throw new Error(
      'Instruction of type ' + instruction.type + ' does not have rs2 field.'
    );
  }
  return instruction.rs2.regeq;
}

export function getRd(instruction: any) {
  if (!usesRd(instruction.type)) {
    throw new Error(
      'Instruction of type ' + instruction.type + ' does not have rd field.'
    );
  }
  return instruction.rd.regeq;
}

export function getFunct3(instruction: any): string {
  
  if (instruction.encoding?.funct3) {
    return instruction.encoding.funct3;
  }

  return "XXX";
}

export function getFunct7(instruction: any) {
  if (!usesFunct7(instruction.type)) {
    throw new Error(
      'Instruction of type ' + instruction.type + ' does not have funct7 field'
    );
  }
  return instruction.encoding.funct7;
}

export function isILogical(name: string): boolean {
    return (name === 'slli'|| name === 'srli' || name === 'srai');
  }

export function getImmFunct7(imm: string): string {
  return imm.substring(0, 8);
}