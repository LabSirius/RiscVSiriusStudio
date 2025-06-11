#!/usr/bin/env node

import * as readline from 'readline';
import { SCCPU } from '../vcpu/singlecycle';
import {
  branchesOrJumps,
  writesRU,
} from "../utilities/instructions";
import { ParserResult, InternalRepresentation } from '../utilities/riscvc';
import { error, info, warn, showBanner } from './printer';
import { intToHex } from '../utilities/conversions';
import chalk from 'chalk';
import Table from 'cli-table3';
import highlight from 'cli-highlight';

export class CPUTester {
  private cpu: SCCPU;
  private rl: readline.Interface;
  private programSize: number;
  private radix: number = 16;
  private soportedRadix = [2, 10, 16];
  private debug: boolean;
  private compiledResult: ParserResult;
  private lastResult: any;
  private ir: InternalRepresentation | undefined;
  private program: any;
  private memory: any;
  
  constructor(result: ParserResult, debug: boolean = false) {
    this.debug = debug;
    this.compiledResult = result;
    this.ir = this.compiledResult.ir;
    this.program = this.ir!.instructions;
    this.programSize = this.program.length;
    this.memory = this.ir!.memory;
    this.cpu = new SCCPU(this.program, this.memory, this.programSize);
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.showHelp();
    this.promptUser();
  }
  
  private showHelp(): void {
    showBanner();
    console.log('\n--- RISC-V CPU Tester CLI ---');
    console.log('Available commands:');
    console.log('  step                  - Execute one instruction');
    console.log('  run [n]               - Execute n instructions');
    console.log('  reg [n]               - Show register value (or all registers if n not specified)');
    console.log('  mem [addr]            - Show memory at address');
    console.log('  pc                    - Show current program counter');
    console.log('  reset                 - Reset the CPU');
    console.log('  help                  - Show this help message');
    console.log('  size                  - Show size of program');
    console.log('  radix [n]             - Change radix of values');
    console.log('  watch [ms]            - Run step-by-step with a delay in ms (default 1000)');
    console.log('  unwatch               - Stop watching');
    console.log('  result [...params]    - Show last result of the simulation');
    console.log('  inst [n]              - Show number n compiled instructions (or all instructions if n not specified)');
    console.log('  debug                 - Enable or disable debug output during execution');
    console.log('  data [...params]      - Show data uploaded for any directive');
    console.log('  directive [...params] - Show directives');
    console.log('  clear                 - Clear the console');
    console.log('  exit                  - Exit the program');
  }
  
  private promptUser(): void {
    this.rl.question('cpu> ', (input) => {
      this.processCommand(input.trim());
    });
  }
  
  private processCommand(input: string): void {
    const parts = input.split(' ');
    const command = parts[0]!.toLowerCase();
    const n = parts[1] ? parseInt(parts[1]) : NaN;
    
    try {
      switch (command) {
        case 'step':
          this.stepCPU();
          break;
        case 'run':
          this.runCPU(!isNaN(n) ? n : 10); // Default to 10 instructions
          break;
        case 'reg':
          this.showRegisters(n);
          break;
        case 'mem':
          this.showMemory(n);
          break;
        case 'pc':
          info(`Program Counter: ${this.cpu.getPC()}`);
          this.checkProgramBounds();
          break;
        case 'reset':
          this.resetCPU();
          break;
        case 'size':
          this.getSize();
          break;
        case 'radix':
          this.changeRadix(n);
          break;
        case 'watch':
          this.watchCPU(!isNaN(n) ? n : 1000); // delay en ms
          break;
        case 'unwatch':
          this.unwatchCPU();
          break;
        case 'result':
          this.showResult(parts.slice(1).flatMap(p => p.split('.')));
          break;
        case 'help':
          this.showHelp();
          break;
        case 'clear':
          this.clearConsole();
          this.showHelp();
          break;
        case "inst":
          const txt = isNaN(n) ? "Instructions" :`Instruction ${n}`;
          this.printFormattedResult(!isNaN(n) ? this.program[n] : this.program, txt);
          break;
        case "debug":
          this.debugInfo();
          break;
        case "data":
          this.showDataDirective(parts.slice(1).flatMap(p => p.split('.')));
          break;
        case "directive":
          this.showDirectives(parts.slice(1));
          break;
        case 'exit':
          this.rl.close();
          return;
        default:
          warn(`Unknown command: ${command}`);
          break;
      }
    } catch (error: any) {
      error(`Error: ${error.message}`);
    }
    
    this.promptUser();
  }
  
  private checkProgramBounds(): boolean {
    const pc = this.cpu.getPC();
    const programEndAddress = this.programSize * 4;
    
    if (pc >= programEndAddress) {
      warn('Note: Program counter is beyond the end of the program.');
      return false;
    }
    return true;
  }

  private getSize(): void {
    info(`Program size: ${this.programSize}`);
  }

  private changeRadix(radix: number): void{
    if (isNaN(radix)){
      warn("Enter a valid value for radix");
    }
    else if (this.soportedRadix.find(element => element === radix)){
      this.radix = radix;
      info("Number radix changed successfully");
    }
    else{
      error("Invalid radix, soported radix " + this.soportedRadix);
    }
  }
  
  private stepCPU(): void {
    const pc = this.cpu.getPC();

    if (!this.checkProgramBounds()) {
      warn('⚠ Warning: PC is beyond the end of the program.');
    }
    
    const instruction = this.cpu.currentInstruction();
  
    console.log(chalk.cyanBright(`\n🔧 Executing @ PC=${pc * 4}: ${instruction.asm}`));
  
    this.lastResult = this.cpu.executeInstruction();
  
    if (writesRU(instruction.type, instruction.opcode)) {
      this.cpu.getRegisterFile().writeRegister(instruction.rd.regeq, this.lastResult.wb.result);
    }
  
    if (branchesOrJumps(instruction.type, instruction.opcode)) {
      this.cpu.jumpToInstruction(this.lastResult.buMux.result);
    } else {
      this.cpu.nextInstruction();
    }
  
    this.checkProgramBounds();
  }
  
  private runCPU(count: number): void {    
    for (let i = 0; i < count; i++){
      this.stepCPU();
    }
  }

private showResult(keys: string[]): void {
  if (!this.lastResult) {
    warn("No result available. Execute at least one instruction before showing results.");
    return;
  }

  if (!keys || keys.length === 0) {
    this.printFormattedResult(this.lastResult, "result");
    return;
  }

  try {
    const result = this.traverseObject(this.lastResult, keys);
    this.printFormattedResult(result,  keys.join('.'));
  } catch (err) {
    if (err instanceof Error) {
      error(`${err.message}`);
    } else {
      error("An unknown error occurred while processing the result.");
    }
  }
}

private traverseObject(obj: Record<string, any>, keys: string[]): any {
  return keys.reduce((current, key) => {
    if (current && key in current) {
      return current[key];
    }
    throw new Error(`Key "${chalk.yellow(key)}" not found in result object.`);
  }, obj);
}

private printFormattedResult(result: any, path: string): void {
  console.log(chalk.gray(`┌─── Result path: ${chalk.italic(path)} ───`));
    
    if (result === null) {
      console.log(chalk.magenta("null"));
    } else if (result === undefined) {
      console.log(chalk.gray("undefined"));
    } else if (typeof result === 'object') {
      const jsonString = JSON.stringify(result, null, 2);
      console.log(highlight(jsonString, {
        language: 'json',
        theme: {
          string: chalk.yellow,
          number: chalk.blue,
        }
      }));
    } else {
      console.log(this.getValueWithType(result));
    }
    
    console.log(chalk.gray("└─────────────────────────────"));
  }

  private getValueWithType(value: any): string {
    const type = typeof value;
    let coloredValue;
    
    switch (type) {
      case 'string':
        coloredValue = chalk.yellow(`"${value}"`);
        break;
      case 'number':
        coloredValue = chalk.blue(value);
        break;
      case 'boolean':
        coloredValue = chalk.green(value);
        break;
      default:
        coloredValue = chalk.gray(value);
    }
    
    return `${coloredValue} ${chalk.gray(`(${type})`)}`;
  }

  private watchInterval: NodeJS.Timeout | null = null;

  private watchCPU(delay: number = 1000): void {
    
    if (this.watchInterval) {
      info("Already watching. Use 'unwatch' to stop.");
      return;
    }

    this.watchInterval = setInterval(() => {
      const pc = this.cpu.getPC();
      if (pc >= this.programSize * 4) {
        info("Program finished. Stopping watch.");
        this.unwatchCPU();
        return;
      }
      this.stepCPU();
    }, delay);

    info(`Watching program execution every ${delay} ms...`);
  }

  private unwatchCPU(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
      info("Stopped watching.");
    } else {
      info("Not currently watching.");
    }
  }
  
  private showRegisters(regNum: number): void {
    const registers = this.cpu.getRegisterFile();
    const table = new Table({
      head: ['Reg', 'Valor'],
      colWidths: [10, 30],
      style: { head: ['cyan'] }
    });
  
    if (isNaN(regNum)){
      for (let i = 0; i < 32; i++){
        const value = registers.readRegister(i);
        table.push([chalk.yellow(`x${i}`), this.formatValue(value)]);
      }
    } else {
      const value = registers.readRegister(regNum);
      table.push([chalk.yellow(`x${regNum}`), this.formatValue(value)]);
    }
  
    console.log(table.toString());
  }
  
  private formatValue(binary: string): string {
    return chalk.green(`0${this.selectPrefix()}${BigInt("0b" + binary).toString(this.radix)}`);
  }
  
  private debugInfo(): void {
    if (!this.debug){
      return;
    }
    warn("Not implemented yet");
  }
  
  private showMemory(address: number): void {
    if (isNaN(address)){
      this.showDataTable(this.cpu.getDataMemory().getMemory());
      return;
    }
    const memory = this.cpu.getDataMemory();
    const value = memory.read(address, 1);
    const binString = value.join("");
    this.showDataTable([binString], address);
  }

  private showDataTable(array: any[], address: number | undefined = undefined): void{
    const table = new Table({
      head: ["Address", "Value"],
      colWidths: [10, 30],
      style: { head: ['cyan'] }
    });
    for (let i = 0; i < array.length; i++){
      const value = array[i];
      table.push([chalk.yellow(address? `0x${intToHex(address)}` : `0x${intToHex(i)}`), this.formatValue(value)]);
    }
    console.log(table.toString());
  }

  private showDataDirective(keys: string[]): void{
    const result = this.traverseObject(this.ir!.dataTable, keys);
    this.printFormattedResult(result, `Data Table ${keys.join('.')}`);
  }

  private showDirectives(keys: string[]): void {
    if (keys.length > 1){
      error("There can only be one directive");
      return;
    }
    keys = keys.map((key) => key.startsWith(".")? key : "." + key);
    const result = this.traverseObject(this.ir!.directives, keys);
    this.printFormattedResult(result, `Data Table ${keys.join('.')}`);
  }

  private selectPrefix(): string {
    switch (this.radix) {
      case 2:
        return "b";
      case 10:
        return "";
      case 16:
        return "x";
      default:
        return "";
    }
  }
  
  private resetCPU(): void {
    this.cpu = new SCCPU(this.program, this.memory, this.programSize);
    info('CPU reset.');
  }

  private clearConsole(): void {
    try {
      const blank = '\n'.repeat(process.stdout.rows || 50);
      console.log(blank);
      readline.cursorTo(process.stdout, 0, 0);
      readline.clearScreenDown(process.stdout);
    } catch (error) {
      console.clear();
    }
  }

}