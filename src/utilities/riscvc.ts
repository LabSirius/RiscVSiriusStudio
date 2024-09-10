import { parse } from "./riscv.js";
import { textSync } from "figlet";

export type ParserResult = {
  success: boolean;
  ir: { instructions: Array<any> | undefined; symbols: Array<any> | undefined };
  info: string;
  extra: any | undefined;
};

export function compile(inputSrc: any, inputName: any): ParserResult {
  console.log(textSync("First pass!."));
  let labelTable = {};
  try {
    parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
      firstPass: true,
    });
  } catch (obj) {
    console.error("Assembler error: ", obj);
    return {
      success: false,
      ir: { instructions: undefined, symbols: undefined },
      info: "First pass failure",
      extra: obj,
    };
  }
  console.log(textSync("Symbols:"));
  console.table(labelTable);
  console.log(textSync("Second pass!."));
  let parserOutput;
  try {
    parserOutput = parse(inputSrc, {
      grammarSource: inputName,
      symbols: labelTable,
      firstPass: false,
    });
  } catch (obj) {
    console.error("Assembler error: ", obj);
    return {
      success: false,
      ir: { instructions: undefined, symbols: undefined },
      info: "Second pass failure",
      extra: obj,
    };
  }
  console.log(textSync("Success!."));
  const result = {
    success: true,
    ir: { instructions: parserOutput as any[], symbols: labelTable as any[] },
    info: "Success",
    extra: undefined,
  };
  // console.log(JSON.stringify(result));
  return result;
}
