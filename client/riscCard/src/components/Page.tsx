import { useEffect } from "react";
import { useTheme } from "@/tables/components/ui/theme/theme-provider";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/tables/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/tables/components/ui/table";


const coreFormats = [
  {
    // R‑type
    cells: [
      { content: "funct7", colSpan: 7 },
      { content: "rs2", colSpan: 5 },
      { content: "rs1", colSpan: 5 },
      { content: "func3", colSpan: 3 },
      { content: "rd", colSpan: 5 },
      { content: "opcode", colSpan: 7 },
      { content: "R", colSpan: 1 },
    ],
  },
  {
    // I‑type
    cells: [
      { content: "imm[11:0]", colSpan: 12 },
      { content: "rs1", colSpan: 5 },
      { content: "funct3", colSpan: 3 },
      { content: "rd", colSpan: 5 },
      { content: "opcode", colSpan: 7 },
      { content: "I", colSpan: 1 },
    ],
  },
  {
    // S‑type
    cells: [
      { content: "imm[11:5]", colSpan: 7 },
      { content: "rs2", colSpan: 5 },
      { content: "rs1", colSpan: 5 },
      { content: "funct3", colSpan: 3 },
      { content: "imm[4:0]", colSpan: 5 },
      { content: "opcode", colSpan: 7 },
      { content: "S", colSpan: 1 },
    ],
  },
  {
    // B‑type
    cells: [
      { content: "imm[12|10:5]", colSpan: 7 },
      { content: "rs2", colSpan: 5 },
      { content: "rs1", colSpan: 5 },
      { content: "funct3", colSpan: 3 },
      { content: "imm[4:1|11]", colSpan: 5 },
      { content: "opcode", colSpan: 7 },
      { content: "B", colSpan: 1 },
    ],
  },
  {
    // U‑type
    cells: [
      { content: "imm[31:12]", colSpan: 20 },
      { content: "rd", colSpan: 5 },
      { content: "opcode", colSpan: 7 },
      { content: "U", colSpan: 1 },
    ],
  },
  {
    // J‑type
    cells: [
      { content: "imm[20|10:1|11|19:12]", colSpan: 20 },
      { content: "rd", colSpan: 5 },
      { content: "opcode", colSpan: 7 },
      { content: "J", colSpan: 1 },
    ],
  },
];

const coreHeaderCells = [
  { content: "31", colSpan: 1 },
  { content: "", colSpan: 5 },
  { content: "25", colSpan: 1 },
  { content: "24", colSpan: 1 },
  { content: "", colSpan: 3 },
  { content: "20", colSpan: 1 },
  { content: "19", colSpan: 1 },
  { content: "", colSpan: 3 },
  { content: "15", colSpan: 1 },
  { content: "14", colSpan: 1 },
  { content: "", colSpan: 1 },
  { content: "12", colSpan: 1 },
  { content: "11", colSpan: 1 },
  { content: "", colSpan: 3 },
  { content: "7", colSpan: 1 },
  { content: "6", colSpan: 1 },
  { content: "", colSpan: 5 },
  { content: "0", colSpan: 1 },
  { content: "Type", colSpan: 1 },
];

const rTypeInstructions = [
  {
    inst: "add",
    name: "ADD",
    opcode: "0110011",
    funct3: "0x0",
    funct7: "0x00",
    description: "rd = rs1 + rs2",
  },
  {
    inst: "sub",
    name: "SUB",
    opcode: "0110011",
    funct3: "0x0",
    funct7: "0x20",
    description: "rd = rs1 - rs2",
  },
  {
    inst: "xor",
    name: "XOR",
    opcode: "0110011",
    funct3: "0x4",
    funct7: "0x00",
    description: "rd = rs1 ^ rs2",
  },
  {
    inst: "or",
    name: "OR",
    opcode: "0110011",
    funct3: "0x6",
    funct7: "0x00",
    description: "rd = rs1 | rs2",
  },
  {
    inst: "and",
    name: "AND",
    opcode: "0110011",
    funct3: "0x7",
    funct7: "0x00",
    description: "rd = rs1 & rs2",
  },
  {
    inst: "sll",
    name: "Shift Left Logical",
    opcode: "0110011",
    funct3: "0x1",
    funct7: "0x00",
    description: "rd = rs1 << rs2",
  },
  {
    inst: "srl",
    name: "Shift Right Logical",
    opcode: "0110011",
    funct3: "0x5",
    funct7: "0x00",
    description: "rd = rs1 >> rs2",
  },
  {
    inst: "sra",
    name: "Shift Right Arith",
    opcode: "0110011",
    funct3: "0x5",
    funct7: "0x20",
    description: "rd = rs1 >> rs2",
  },
  {
    inst: "slt",
    name: "Set Less Than",
    opcode: "0110011",
    funct3: "0x2",
    funct7: "0x00",
    description: "rd = (rs1 < rs2) ? 1 : 0",
  },
  {
    inst: "sltu",
    name: "Set Less Than (U)",
    opcode: "0110011",
    funct3: "0x3",
    funct7: "0x00",
    description: "rd = (rs1 < rs2) ? 1 : 0",
  },
];

const iTypeArithmetic = [
  {
    inst: "addi",
    name: "ADD Immediate",
    opcode: "0010011",
    funct3: "0x0",
    funct7: "",
    description: "rd = rs1 + imm",
  },
  {
    inst: "xori",
    name: "XOR Immediate",
    opcode: "0010011",
    funct3: "0x4",
    funct7: "",
    description: "rd = rs1 ^ imm",
  },
  {
    inst: "ori",
    name: "OR Immediate",
    opcode: "0010011",
    funct3: "0x6",
    funct7: "",
    description: "rd = rs1 | imm",
  },
  {
    inst: "andi",
    name: "AND Immediate",
    opcode: "0010011",
    funct3: "0x7",
    funct7: "",
    description: "rd = rs1 & imm",
  },
  {
    inst: "slli",
    name: "Shift Left Logical Imm",
    opcode: "0010011",
    funct3: "0x1",
    funct7: "imm[5:11]=0x00",
    description: "rd = rs1 << imm[4:0]",
  },
  {
    inst: "srli",
    name: "Shift Right Logical Imm",
    opcode: "0010011",
    funct3: "0x5",
    funct7: "imm[5:11]=0x00",
    description: "rd = rs1 >> imm[4:0]",
  },
  {
    inst: "srai",
    name: "Shift Right Arith Imm",
    opcode: "0010011",
    funct3: "0x5",
    funct7: "imm[5:11]=0x20",
    description: "rd = rs1 >> imm[4:0]",
  },
  {
    inst: "slti",
    name: "Set Less Than Imm",
    opcode: "0010011",
    funct3: "0x2",
    funct7: "",
    description: "rd = (rs1 < imm) ? 1 : 0",
  },
  {
    inst: "sltiu",
    name: "Set Less Than Imm (U)",
    opcode: "0010011",
    funct3: "0x3",
    funct7: "",
    description: "rd = (rs1 < imm) ? 1 : 0",
  },
];

const iTypeLoad = [
  {
    inst: "lb",
    name: "Load Byte",
    opcode: "0000011",
    funct3: "0x0",
    description: "rd = M[rs1 + imm][7:0]",
  },
  {
    inst: "lh",
    name: "Load Half",
    opcode: "0000011",
    funct3: "0x1",
    description: "rd = M[rs1 + imm][15:0]",
  },
  {
    inst: "lw",
    name: "Load Word",
    opcode: "0000011",
    funct3: "0x2",
    description: "rd = M[rs1 + imm][31:0]",
  },
  {
    inst: "lbu",
    name: "Load Byte (U)",
    opcode: "0000011",
    funct3: "0x4",
    description: "rd = M[rs1 + imm][7:0]",
  },
  {
    inst: "lhu",
    name: "Load Half (U)",
    opcode: "0000011",
    funct3: "0x5",
    description: "rd = M[rs1 + imm][15:0]",
  },
];

const iTypeJump = [
  {
    inst: "jalr",
    name: "Jump And Link Reg",
    opcode: "1100111",
    funct3: "0x0",
    description: "rd = PC + 4; PC = rs1 + imm",
  },
];

const iTypeControl = [
  {
    inst: "ecall",
    name: "Environment call",
    opcode: "1110011",
    funct3: "0x0",
    funct7: "imm=0x0",
    description: "Transfer control to OS",
  },
  {
    inst: "ebreak",
    name: "Environment break",
    opcode: "1110011",
    funct3: "0x0",
    funct7: "imm=0x1",
    description: "Transfer control to debugger",
  },
];

// S‑type instructions
const sType = [
  {
    inst: "sb",
    name: "Store Byte",
    opcode: "0100011",
    funct3: "0x0",
    description: "M[rs1 + imm][7:0] = rs2[7:0]",
  },
  {
    inst: "sh",
    name: "Store Half",
    opcode: "0100011",
    funct3: "0x1",
    description: "M[rs1 + imm][15:0] = rs2[15:0]",
  },
  {
    inst: "sw",
    name: "Store Word",
    opcode: "0100011",
    funct3: "0x2",
    description: "M[rs1 + imm][31:0] = rs2[31:0]",
  },
];

// B‑type instructions
const bType = [
  {
    inst: "beq",
    name: "Branch ==",
    opcode: "1100011",
    funct3: "0x0",
    description: "if (rs1 == rs2) PC += imm",
  },
  {
    inst: "bne",
    name: "Branch !=",
    opcode: "1100011",
    funct3: "0x1",
    description: "if (rs1 != rs2) PC += imm",
  },
  {
    inst: "blt",
    name: "Branch <",
    opcode: "1100011",
    funct3: "0x4",
    description: "if (rs1 < rs2) PC += imm",
  },
  {
    inst: "bge",
    name: "Branch >=",
    opcode: "1100011",
    funct3: "0x5",
    description: "if (rs1 >= rs2) PC += imm",
  },
  {
    inst: "bltu",
    name: "Branch < (U)",
    opcode: "1100011",
    funct3: "0x6",
    description: "if (rs1 < rs2) PC += imm",
  },
  {
    inst: "bgeu",
    name: "Branch >= (U)",
    opcode: "1100011",
    funct3: "0x7",
    description: "if (rs1 >= rs2) PC += imm",
  },
];

// J‑type instructions
const jType = [
  {
    inst: "jal",
    name: "Jump And Link",
    opcode: "1101111",
    description: "rd = PC + 4; PC += imm",
  },
];

// U‑type instructions
const uType = [
  {
    inst: "lui",
    name: "Load Upper Imm",
    opcode: "0110111",
    description: "rd = imm << 12",
  },
  {
    inst: "auipc",
    name: "Add Upper Imm to PC",
    opcode: "0010111",
    description: "rd = PC + (imm << 12)",
  },
];

// Pseudo instructions
const pseudoInstructions = [
  {
    pseudo: "nop",
    base: "addi x0, x0, 0",
    meaning: "No operation",
  },
  {
    pseudo: "li rd, immediate",
    base: "Myriad sequences",
    meaning: "Load immediate",
  },
  {
    pseudo: "mv rd, rs",
    base: "addi rd, rs, 0",
    meaning: "Copy register",
  },
  {
    pseudo: "not rd, rs",
    base: "xori rd, rs, -1",
    meaning: "One's complement",
  },
  {
    pseudo: "neg rd, rs",
    base: "sub rd, x0, rs",
    meaning: "Two's complement",
  },
  {
    pseudo: "seqz rd, rs",
    base: "sltiu rd, rs, 1",
    meaning: "Set if = zero",
  },
  {
    pseudo: "snez rd, rs",
    base: "sltu rd, x0, rs",
    meaning: "Set if ≠ zero",
  },
  {
    pseudo: "sltz rd, rs",
    base: "slt rd, rs, x0",
    meaning: "Set if < zero",
  },
  {
    pseudo: "sgtz rd, rs",
    base: "slt rd, x0, rs",
    meaning: "Set if > zero",
  },
];


function CoreInstructionTable() {
  return (
    <Table>
      <TableCaption>Core Instruction Formats</TableCaption>
      <TableHeader>
        <TableRow>
          {coreHeaderCells.map((cell, idx) => (
            <TableHead key={idx} colSpan={cell.colSpan} className="px-2 py-1 text-xs border">
              {cell.content}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {coreFormats.map((row, idx) => (
          <TableRow key={idx}>
            {row.cells.map((cell, jdx) => (
              <TableCell key={jdx} colSpan={cell.colSpan} className="px-2 py-1 text-sm border">
                {cell.content}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

interface InstructionTableProps {
  caption: string;
  columns: string[];
  data: Array<Record<string, string>>;
}


function InstructionTable({ caption, columns, data } : InstructionTableProps) {
  return (
    <Table>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((col, idx) => (
            <TableHead key={idx} className="px-3 py-2">{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, idx) => (
          <TableRow key={idx}>
            {columns.map((col, cdx) => {
              const key = col.toLowerCase().includes("pseudo")
                ? "pseudo"
                : col.toLowerCase().includes("base")
                ? "base"
                : col.toLowerCase().includes("meaning")
                ? "meaning"
                : col.toLowerCase();
              return (
                <TableCell key={cdx} className="px-3 py-2">
                  {item[key] || ""}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


const Page = () => {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (document.body.classList.contains("vscode-light")) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, [setTheme]);

  return (
    <div className="w-full h-full p-8 space-y-8">
      <h1 className="text-5xl font-bold">RISC-V Instruction Set</h1>
      <h2 className="text-2xl font-semibold">RV32I Instructions</h2>
      <p>
        By convention,{" "}
        <span className={`px-2 py-1 ${theme === "dark" ? 'text-white bg-[#3A6973] ' : ' text-black bg-[#D1E3E7] ' } rounded`}>msb</span> means most significant bit is extended while{" "}
        <span className={`px-2 py-1  ${theme === "dark" ? 'text-white bg-[#3A6973] ' : ' text-black bg-[#D1E3E7] ' } rounded`}>zero</span> means that zero is extended.
      </p>

      <Accordion type="single" collapsible className="space-y-4">
        {/* Core Instruction Formats */}
        <AccordionItem value="core">
          <AccordionTrigger className="text-lg font-semibold">
            Core Instruction Formats
          </AccordionTrigger>
          <AccordionContent>
            <CoreInstructionTable />
          </AccordionContent>
        </AccordionItem>

        {/* R‑type instructions */}
        <AccordionItem value="rType">
          <AccordionTrigger className="text-lg font-semibold">
            R‑type Instructions
          </AccordionTrigger>
          <AccordionContent>
            <InstructionTable
              caption="R‑type Instructions"
              columns={["Inst", "Name", "Opcode", "funct3", "funct7", "Description (C)"]}
              data={rTypeInstructions}
            />
          </AccordionContent>
        </AccordionItem>

        {/* I‑type instructions */}
        <AccordionItem value="iType">
          <AccordionTrigger className="text-lg font-semibold">
            I‑type Instructions
          </AccordionTrigger>
          <AccordionContent className="space-y-6">
            <div>
              <h3 className="mb-2 text-xl font-medium">Arithmetic and Logical Instructions</h3>
              <InstructionTable
                caption="I‑type Arithmetic & Logical"
                columns={["Inst", "Name", "Opcode", "funct3", "funct7", "Description (C)"]}
                data={iTypeArithmetic}
              />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-medium">Load Instructions</h3>
              <InstructionTable
                caption="I‑type Load Instructions"
                columns={["Inst", "Name", "Opcode", "funct3", "Description (C)"]}
                data={iTypeLoad}
              />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-medium">Jump Instruction</h3>
              <InstructionTable
                caption="I‑type Jump Instruction"
                columns={["Inst", "Name", "Opcode", "funct3", "Description (C)"]}
                data={iTypeJump}
              />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-medium">Control Transfer Instructions</h3>
              <InstructionTable
                caption="I‑type Control Transfer"
                columns={["Inst", "Name", "Opcode", "funct3", "funct7", "Description (C)"]}
                data={iTypeControl}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* S‑type instructions */}
        <AccordionItem value="sType">
          <AccordionTrigger className="text-lg font-semibold">
            S‑type Instructions
          </AccordionTrigger>
          <AccordionContent>
            <InstructionTable
              caption="S‑type Instructions"
              columns={["Inst", "Name", "Opcode", "funct3", "Description (C)"]}
              data={sType}
            />
          </AccordionContent>
        </AccordionItem>

        {/* B‑type instructions */}
        <AccordionItem value="bType">
          <AccordionTrigger className="text-lg font-semibold">
            B‑type Instructions
          </AccordionTrigger>
          <AccordionContent>
            <InstructionTable
              caption="B‑type Instructions"
              columns={["Inst", "Name", "Opcode", "funct3", "Description (C)"]}
              data={bType}
            />
          </AccordionContent>
        </AccordionItem>

        {/* J‑type instructions */}
        <AccordionItem value="jType">
          <AccordionTrigger className="text-lg font-semibold">
            J‑type Instructions
          </AccordionTrigger>
          <AccordionContent>
            <InstructionTable
              caption="J‑type Instructions"
              columns={["Inst", "Name", "Opcode", "Description (C)"]}
              data={jType}
            />
          </AccordionContent>
        </AccordionItem>

        {/* U‑type instructions */}
        <AccordionItem value="uType">
          <AccordionTrigger className="text-lg font-semibold">
            U‑type Instructions
          </AccordionTrigger>
          <AccordionContent>
            <InstructionTable
              caption="U‑type Instructions"
              columns={["Inst", "Name", "Opcode", "Description (C)"]}
              data={uType}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Pseudo instructions */}
        <AccordionItem value="pseudo">
          <AccordionTrigger className="text-lg font-semibold">
            Pseudo Instructions
          </AccordionTrigger>
          <AccordionContent>
            <InstructionTable
              caption="Pseudo Instructions"
              columns={["Pseudoinstruction", "Base Instruction(s)", "Meaning"]}
              data={pseudoInstructions}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Page;
