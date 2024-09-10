import { Command } from "commander";
import { textSync } from "figlet";
import { compile } from "./riscvc";
import { readFileSync } from "fs";

const program = new Command();

// console.log(textSync("RISCV assembler"));

program
  .version("0.0.2")
  .description("RISCV assembler")
  .option("-i, --input <filename>", "Input file")
  .option("-b, --outBinary", "Output in binary format.")
  .parse(process.argv);

const options = program.opts();

if (!options.input) {
  console.error("No input file provided");
}

console.log("Assembling ", options.input);
const fileContents = readFileSync(options.input, "utf-8").toString();

const result = compile(fileContents, options.input);

if (options.outBinary) {
  console.log("Output in binary");
  const instructions = result.ir.instructions;
  const binary = instructions?.map(
    ({ asm, inst, encoding: { binEncoding, hexEncoding } }) => {
      return {
        inst: inst,
        bin: binEncoding,
        hex: hexEncoding,
        asm: asm,
      };
    }
  );
  console.log(JSON.stringify(binary, null, 2));
}
