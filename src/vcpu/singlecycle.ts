/**
 * A CPU instance consists of:
 * - A program memory
 * - An instruction counter
 * - A register file
 * - A data memory
 *
 * There is an execute instruction function that computes all the values of
 * every component in the simulation.
 */

import {
  getRs1,
  getRs2,
  getRd,
  writesDM,
  writesRU,
  getFunct3,
  getFunct7,
  isIArithmetic,
  isILoad,
  isIJump
} from '../utilities/instructions';

import _ from 'lodash';
import { logger } from '../utilities/logger';

class RegistersFile {
  private registers: Array<string>;
  public constructor() {
    this.registers = new Array(32).fill('00000000000000000000000000000000');
  }

  public printRegisters() {
    this.registers.forEach((val, idx) => {
      logger().info({ msg: 'PrintRegister', idx: 'x' + idx, val: val });
    });
  }

  private getIndexFromName(name: string): number {
    return parseInt(name.substring(1));
  }

  public readRegisterFromName(name: string): string {
    return this.registers[this.getIndexFromName(name)];
  }

  public readRegister(index: number): string {
    return this.registers[index];
  }

  public writeRegister(name: string, value: string) {
    this.registers[this.getIndexFromName(name)] = value;
  }

  public getRegisterData() {
    return this.registers;
  }
}

class DataMemory {
  private memory: Array<string>;
  private readonly size: number;
  public constructor(size: number) {
    this.memory = new Array(size).fill('00000000');
    this.size = size;
  }
  public write(data: Array<string>, address: number) {
    const lastAddress = address + data.length - 1;
    if (lastAddress > this.size - 1) {
      throw new Error('Data memory size exceeded.');
    }
    for (let i = 0; i < data.length; i++) {
      this.memory[address + i] = data[i];
    }
  }
  public read(address: number, length: number): Array<string> {
    const lastAddress = address + length - 1;
    if (lastAddress > this.size - 1) {
      throw new Error('Data memory size exceeded.');
    }
    let data = [] as Array<string>;
    for (let i = 0; i < length; i++) {
      data.push(this.memory[address + i]);
    }
    return data.reverse();
  }
}
export class SCCPU {
  // TODO: We need a proper type for a program representation.
  private readonly program: any[];
  private registers: RegistersFile;
  private dataMemory: DataMemory;
  /**
   * This pc indexes the program array. As so, it is not an address.
   */
  private pc: number;

  public constructor(program: any[], memSize: number) {
    this.program = program.filter((sc) => {
      return sc.kind === 'SrcInstruction';
    });
    console.log('Program to execute: ', this.program);

    this.registers = new RegistersFile();
    this.dataMemory = new DataMemory(memSize);
    this.pc = 0;
  }

  public currentInstruction() {
    // console.log('called current instruction ', this.program[this.pc]);
    return this.program[this.pc];
  }

  private currentType(): string {
    return this.currentInstruction().type;
  }

  private currentOpcode(): string {
    return this.currentInstruction().opcode;
  }

  private finished(): boolean {
    return this.pc >= this.program.length;
  }

  public nextInstruction() {
    this.pc++;
    console.log('[next] new value of PC is ', this.pc);
  }

  public jumpToInstruction(address: string) {
    this.pc = parseInt(address, 16) / 4;
    console.log('[jump] new value of PC is ', this.pc);
  }

  private computeALURes(A: string, B: string, ALUOp: string): string {
    const numA = parseInt(A, 2);
    const numB = parseInt(B, 2);
    const selector = {
      '0000': (a: number, b: number) => {
        return a + b;
      },
      '1000': (a: number, b: number) => {
        return a - b;
      },
      '0100': (a: number, b: number) => {
        return a ^ b;
      },
      '0110': (a: number, b: number) => {
        return a | b;
      },
      '0111': (a: number, b: number) => {
        return a & b;
      },
      '0001': (a: number, b: number) => {
        return a << b;
      },
      '0101': (a: number, b: number) => {
        return a >> b;
      }
    };

    const ALURes = selector[ALUOp](numA, numB) as number;
    return _.padStart((ALURes>>>0).toString(2), 32, '0');
  }

  /**
   * Computes the result of executing the current instruction.
   *
   * At this point, the result consists of an object with the following fields:
   * !TODO: document when ready
   */
  public executeInstruction() {
    console.log('execute instruction', this.currentInstruction());
    switch (this.currentType()) {
      case 'R':
        return this.executeRInstruction();
      case 'I':
        return this.executeIInstruction();
      case 'S':
        return this.executeSInstruction();
      case 'B':
        return this.executeBInstruction();
      default:
        throw new Error(
          'Unknown instruction ' + JSON.stringify(this.currentInstruction())
        );
    }
  }

  private executeRInstruction() {
    const instruction = this.currentInstruction();
    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const rs2Val = this.registers.readRegisterFromName(getRs2(instruction));
    const aluOp = getFunct7(instruction)[1] + getFunct3(instruction);
    const aluRes = this.computeALURes(rs1Val, rs2Val, aluOp);
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const add4Res16 = Number(add4Res).toString(16);
    this.registers.writeRegister(getRd(instruction), aluRes);

    return {
      RURS1Val: rs1Val,
      RURS2Val: rs2Val,
      ALUASrc: '0',
      ALUBSrc: '0',
      ALUARes: rs1Val,
      ALUBRes: rs2Val,
      A: rs1Val,
      B: rs2Val,
      ALUOp: aluOp,
      ALURes: aluRes,
      BrOp: '00XXX',
      ADD4Res: add4Res,
      BURes: '0',
      BUMUXRes: add4Res16,
      WBMUXRes: aluRes,
      RUDataWrSrc: '00',
      RUWr: '1'
    };
  }

  private executeIInstruction() {
    // debugger;
    const instruction = this.currentInstruction();
    const rs1Val = this.registers.readRegisterFromName(getRs1(instruction));
    const imm12Val = this.currentInstruction().encoding.imm12;
    const imm32Val = imm12Val.padStart(32, imm12Val.at(0));
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const add4Res16 = Number(add4Res).toString(16);

    let aluOp = undefined;
    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
        aluOp = '0' + getFunct3(instruction);
        break;
      case isILoad(this.currentType(), this.currentOpcode()):
        aluOp = '0000';
        break;
      case isIJump(this.currentType(), this.currentOpcode()):
        aluOp = '0000';
        break;
    }

    const aluRes = this.computeALURes(rs1Val, imm32Val, aluOp);
    this.registers.writeRegister(getRd(instruction), aluRes);

    let brOp = '00XXX';
    let ruDataWrSrc = undefined;
    let wbMUXRes = undefined;
    let buRes = undefined;
    let buMUXRes = undefined;

    let dmAddress = undefined;
    let dmDataRd = undefined;
    let dmWr = 'X';
    let dmCtrl: 'XXX';

    switch (true) {
      case isIArithmetic(instruction.type, instruction.opcode):
        // TODO: I have to update the parser to look for shift operations that use shamt and funct7
        ruDataWrSrc = '00';
        wbMUXRes = aluRes;
        buRes = '0';
        buMUXRes = add4Res16;
        break;
      case isILoad(this.currentType(), this.currentOpcode()):
        ruDataWrSrc = '01';
        // TODO: read from memory
        dmAddress = aluRes;
        buRes = '0';
        buMUXRes = add4Res16;
        dmWr = '0';
        dmCtrl = getFunct3(instruction);
        let value = this.readFromMemory(
          parseInt(aluRes, 2),
          parseInt(dmCtrl, 2)
        );
        dmDataRd = value;
        wbMUXRes = value;
        break;
      case isIJump(this.currentType(), this.currentOpcode()):
        brOp = '1XXXX';
        ruDataWrSrc = '10';
        wbMUXRes = add4Res;
        buRes = '1';
        buMUXRes = aluRes;
        break;
    }

    return {
      A: rs1Val,
      ADD4Res: add4Res,
      ALUARes: rs1Val,
      ALUASrc: '0',
      ALUBRes: imm32Val,
      ALUBSrc: '1',
      ALUOp: aluOp,
      ALURes: aluRes,
      B: imm32Val,
      BrOp: brOp,
      BUMUXRes: buMUXRes,
      BURes: buRes,
      DMWr: dmWr,
      DMCtrl: dmCtrl,
      DMAddress: dmAddress,
      DMDataRd: dmDataRd,
      IMMALUBVal: imm32Val,
      IMMSrc: '000',
      RUDataWrSrc: ruDataWrSrc,
      RURS1Val: rs1Val,
      RUWr: '1',
      WBMUXRes: wbMUXRes
    };
  }

  private readFromMemory(address: number, control: number): string {
    let value = '';
    switch (control) {
      case 0: {
        // lb
        console.log('reading for lb');
        const val = this.getDataMemory().read(address, 1).join('');
        value = val.padStart(32, val.at(0));
        break;
      }
      case 1: {
        // lh
        console.log('reading for lb');
        const val = this.getDataMemory().read(address, 2).join('');
        value = val.padStart(32, val.at(0));
        break;
      }
      case 2: {
        //lw
        console.log('reading for lw');
        const val = this.getDataMemory().read(address, 4);
        value = val.join('');
        break;
      }
      case 4: {
        //lbu
        console.log('reading for lb');
        const val = this.getDataMemory().read(address, 1).join('');
        value = val.padStart(32, '0');
        break;
      }
      case 5: {
        // lhu
        console.log('reading for lb');
        const val = this.getDataMemory().read(address, 2).join('');
        value = val.padStart(32, '0');
        break;
      }
    }
    return value;
  }

  private executeSInstruction() {
    const instruction = this.currentInstruction();
    const baseAddressVal = this.registers.readRegisterFromName(
      getRs1(instruction)
    );
    const value = this.registers.readRegisterFromName(getRs2(instruction));

    const offset12Val = this.currentInstruction().encoding.imm12;
    const offset32Val = offset12Val.padStart(32, offset12Val.at(0));
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const add4Res16 = Number(add4Res).toString(16);

    const aluRes = this.computeALURes(baseAddressVal, offset32Val, '0000');

    return {
      A: baseAddressVal,
      ADD4Res: add4Res,
      ALUARes: baseAddressVal,
      ALUASrc: '0',
      ALUBRes: offset32Val,
      ALUBSrc: '1',
      ALUOp: '0000',
      ALURes: aluRes,
      B: offset32Val,
      BrOp: '00XXX',
      BUMUXRes: '0',
      BURes: '0',
      DMAddress: aluRes,
      DMDataWr: value,
      DMWr: '1',
      DMCtrl: getFunct3(instruction),
      IMMALUBVal: offset32Val,
      IMMSrc: '001',
      RUDataWrSrc: 'XX',
      RURS1Val: baseAddressVal,
      RURS2Val: value,
      RUWr: '0'
    };
  }
  private executeBInstruction() {
    const instruction = this.currentInstruction();
    const add4Res = parseInt(this.currentInstruction().inst) + 4;
    const add4Res16 = Number(add4Res).toString(16);
    const funct3 = getFunct3(instruction);
    const rs1 = this.registers.readRegisterFromName(getRs1(instruction));
    const rs2 = this.registers.readRegisterFromName(getRs2(instruction));
    const rs1Int = parseInt(rs1, 2);
    const rs2Int = parseInt(rs2, 2);
    const imm13 = this.currentInstruction().encoding.imm13;
    const imm32Val = imm13.padStart(32, imm13.at(0));

    // const imm13Val = parseInt(imm13, 2);

    let condition = false;
    switch (parseInt(funct3, 2)) {
      case 0: {
        //beq
        condition = rs1Int === rs2Int;
        break;
      }
      case 1: {
        //bne
        condition = rs1Int !== rs2Int;
        break;
      }
      case 4: {
        //blt
        condition = rs1Int < rs2Int;
        break;
      }
      case 5: {
        //bge
        condition = rs1Int >= rs2Int;
        break;
      }
      case 6: {
        //bltu
        break;
      }
      case 7: {
        //bgeu
        break;
      }
    }
    const aluaRes = (this.currentInstruction().inst as number).toString(2);
    const aluaRes32 = aluaRes.padStart(32, '0');
    const aluRes = this.computeALURes(aluaRes32, imm32Val, '0000');

    return {
      A: aluaRes,
      ADD4Res: add4Res16,
      ALUARes: aluaRes32,
      ALUASrc: '1',
      ALUBRes: imm32Val,
      ALUBSrc: '1',
      ALUOp: '0000',
      ALURes: aluRes,
      B: imm32Val,
      BrOp: '01' + funct3,
      BUMUXRes: condition ? parseInt(aluRes, 2).toString(16) : add4Res16,
      BURes: condition ? '1' : '0',
      DMWr: '0',
      DMCtrl: 'XXX',
      IMMALUBVal: imm32Val,
      IMMSrc: '101',
      RURS1Val: rs1,
      RURS2Val: rs2,
      RUWr: '0'
    };
  }

  public getRegisterFile(): RegistersFile {
    return this.registers;
  }

  public getDataMemory(): DataMemory {
    return this.dataMemory;
  }

  public printInfo() {
    logger().info('CPU state');
    logger().info('Registers');
    this.registers.printRegisters();
  }
}
