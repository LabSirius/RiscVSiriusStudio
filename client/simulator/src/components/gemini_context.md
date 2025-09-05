# RISC-V simulator and toolchain knowledge base

The purpose of this file is to serve as context for the AI functionality of the
simulator.

## RISCV-V concepts

### Philosophy

- RISC (Reduced Instruction Set Computer): RISC-V is characterized by a small,
  highly-optimized set of instructions.

- Open Standard: The ISA (Instruction Set Architecture) is free to use for any
  purpose.

- Modularity: The ISA is designed with a small base integer instruction set
  (RV32I or RV64I) and numerous optional extensions for features like
  multiplication, floating-point, and custom instructions.

### Registers

- 32 general purpose registers named `x0` through `x31`.
- `x0` (zero): hardwired to value 0. Writes to it are ignored.
- `pc` (program counter): holdas the address of the instruction being executed.
- ABI names: the application binary interface provides conventional names for
  registers to standarize their use in software.

| Register | ABI Name | Role                           |
| -------- | -------- | ------------------------------ |
| x0       | zero     | Hardwired zero                 |
| x1       | ra       | Return address                 |
| x2       | sp       | Stack pointer                  |
| x3       | gp       | Global pointer                 |
| x4       | tp       | Thread pointer                 |
| x5       | t0       | Temporary/Caller saved         |
| x6       | t1       | Temporary/Caller saved         |
| x7       | t2       | Temporary/Caller saved         |
| x8       | s0/fp    | Saved register/Frame pointer   |
| x9       | s1       | Saved register                 |
| x10      | a0       | Function argument/Return value |
| x11      | a1       | Function argument/Return value |
| x12      | a2       | Function argument              |
| x13      | a3       | Function argument              |
| x14      | a4       | Function argument              |
| x15      | a5       | Function argument              |
| x16      | a6       | Function argument              |
| x17      | a7       | Function argument              |
| x18      | s2       | Saved register                 |
| x19      | s3       | Saved register                 |
| x20      | s4       | Saved register                 |
| x21      | s5       | Saved register                 |
| x22      | s6       | Saved register                 |
| x23      | s7       | Saved register                 |
| x24      | s8       | Saved register                 |
| x25      | s9       | Saved register                 |
| x26      | s10      | Saved register                 |
| x27      | s11      | Saved register                 |
| x28      | t3       | Temporary/Caller saved         |
| x29      | t4       | Temporary/Caller saved         |
| x30      | t5       | Temporary/Caller saved         |
| x31      | t6       | Temporary/Caller saved         |

### Standard ISA extensions

- I: Base Integer Instruction Set (Always present)
- M: Integer Multiplication and Division
- A: Atomic Instructions
- F: Single-Precision Floating-Point
- D: Double-Precision Floating-Point
- C: Compressed Instructions (16-bit instructions for better code density)

#### RV32I

##### R type instructions

**Opcode:** `0110011` for all instructions in this table.

| Mnemonic   | `funct7`  | `funct3` | Description              | Operation                         |
| ---------- | --------- | -------- | ------------------------ | --------------------------------- |
| **`add`**  | `0000000` | `000`    | Add                      | `rd = rs1 + rs2`                  |
| **`sub`**  | `0100000` | `000`    | Subtract                 | `rd = rs1 - rs2`                  |
| **`sll`**  | `0000000` | `001`    | Shift Left Logical       | `rd = rs1 << rs2`                 |
| **`slt`**  | `0000000` | `010`    | Set Less Than (Signed)   | `rd = (rs1 < rs2) ? 1 : 0`        |
| **`sltu`** | `0000000` | `011`    | Set Less Than (Unsigned) | `rd = (rs1 < rs2) ? 1 : 0`        |
| **`xor`**  | `0000000` | `100`    | Bitwise XOR              | `rd = rs1 ^ rs2`                  |
| **`srl`**  | `0000000` | `101`    | Shift Right Logical      | `rd = rs1 >> rs2` (zero-extended) |
| **`sra`**  | `0100000` | `101`    | Shift Right Arithmetic   | `rd = rs1 >> rs2` (sign-extended) |
| **`or`**   | `0000000` | `110`    | Bitwise OR               | `rd = rs1 \| rs2`                 |
| **`and`**  | `0000000` | `111`    | Bitwise AND              | `rd = rs1 & rs2`                  |

*Note: For shift instructions, only the lower 5 bits of `rs2` are used as the
shift amount (`shamt`).*

**Format:** `[funct7 (7) | rs2 (5) | rs1 (5) | funct3 (3) | rd (5) | opcode (7)]`

##### I type instructions 

I-type instructions typically use one source register (`rs1`), a 12-bit
immediate value (`imm`), and a destination register (`rd`).
**Format:** `[imm[11:0] (12) | rs1 (5) | funct3 (3) | rd (5) | opcode (7)]`

###### 1. I-Type: Arithmetic and Logical Instructions

These instructions perform an operation between a register (`rs1`) and an
immediate value, storing the result in `rd`.

**Opcode:** `0010011`

| Mnemonic    | `funct3` | Description                        | Operation                           |
| ----------- | -------- | ---------------------------------- | ----------------------------------- |
| **`addi`**  | `000`    | Add Immediate                      | `rd = rs1 + imm`                    |
| **`slti`**  | `010`    | Set Less Than Immediate (Signed)   | `rd = (rs1 < imm) ? 1 : 0`          |
| **`sltiu`** | `011`    | Set Less Than Immediate (Unsigned) | `rd = (rs1 < imm) ? 1 : 0`          |
| **`xori`**  | `100`    | XOR Immediate                      | `rd = rs1 ^ imm`                    |
| **`ori`**   | `110`    | OR Immediate                       | `rd = rs1 \| imm`                   |
| **`andi`**  | `111`    | AND Immediate                      | `rd = rs1 & imm`                    |
| **`slli`**  | `001`    | Shift Left Logical Immediate¹      | `rd = rs1 << shamt`                 |
| **`srli`**  | `101`    | Shift Right Logical Immediate¹     | `rd = rs1 >> shamt` (zero-extended) |
| **`srai`**  | `101`    | Shift Right Arithmetic Immediate¹  | `rd = rs1 >> shamt` (sign-extended) |

¹ *For immediate shifts in RV32I, the 12-bit immediate field is repurposed. The
upper 7 bits act as `funct7` (0000000 for `srli`, 0100000 for `srai`), and the
lower 5 bits are the shift amount (`shamt`).*

###### 2. I-Type: Load Instructions

These instructions load data from memory into a register. The address is
calculated by adding an offset (`imm`) to a base address in a register (`rs1`).

**Opcode:** `0000011`

| Mnemonic  | `funct3` | Description              | Operation                                                |
| --------- | -------- | ------------------------ | -------------------------------------------------------- |
| **`lb`**  | `000`    | Load Byte (Signed)       | Load 1 byte from `rs1 + imm`, then sign-extend to `rd`.  |
| **`lh`**  | `001`    | Load Halfword (Signed)   | Load 2 bytes from `rs1 + imm`, then sign-extend to `rd`. |
| **`lw`**  | `010`    | Load Word                | Load 4 bytes from `rs1 + imm` into `rd`.                 |
| **`lbu`** | `100`    | Load Byte (Unsigned)     | Load 1 byte from `rs1 + imm`, then zero-extend to `rd`.  |
| **`lhu`** | `101`    | Load Halfword (Unsigned) | Load 2 bytes from `rs1 + imm`, then zero-extend to `rd`. |


###### 3. I-Type: Jump and Link Register

This instruction performs an indirect jump to an address computed from a
register and an offset.

**Opcode:** `1100111`

| Mnemonic   | `funct3` | Description            | Operation                                                            |
| ---------- | -------- | ---------------------- | -------------------------------------------------------------------- |
| **`jalr`** | `000`    | Jump and Link Register | Jumps to `rs1 + imm`, storing the return address (`pc + 4`) in `rd`. |

###### 4. I-Type: System Instructions

These instructions are used to interact with the execution environment (e.g., an
operating system or debugger). They are encoded as I-types but don't always use
the fields in the conventional way.

**Opcode:** `1110011`

| Mnemonic     | `funct3` | Immediate (`imm`) | Description                                                          |
| ------------ | -------- | ----------------- | -------------------------------------------------------------------- |
| **`ecall`**  | `000`    | `000000000000`    | **Environment Call**: Transfer control to the execution environment. |
| **`ebreak`** | `000`    | `000000000001`    | **Environment Breakpoint**: Transfer control to a debugger.          |

##### S type instructions

These instructions store data from a source register (`rs2`) into memory. The
memory address is calculated as `rs1 + imm`.

**Opcode:** `0100011` for all instructions in this table.

| Mnemonic | `funct3` | Description                                                                    | Operation                    |
| -------- | -------- | ------------------------------------------------------------------------------ | ---------------------------- |
| **`sb`** | `000`    | **Store Byte**: Stores the least significant byte of register `rs2` to memory. | `mem[rs1 + imm] = rs2[7:0]`  |
| **`sh`** | `001`    | **Store Halfword**: Stores the two least significant bytes of `rs2` to memory. | `mem[rs1 + imm] = rs2[15:0]` |
| **`sw`** | `010`    | **Store Word**: Stores the full 32-bit word from `rs2` to memory.              | `mem[rs1 + imm] = rs2[31:0]` |

*Note: The 12-bit signed immediate offset is split into two parts within the
S-type instruction format for encoding purposes.*

**Format:** `[imm[11:5] (7) | rs2 (5) | rs1 (5) | funct3 (3) | imm[4:0] (5) | opcode (7)]`

##### U type instructions

U-type (Upper Immediate) instructions are used to build 32-bit constants. These
instructions use a 20-bit immediate value and a destination register (`rd`).

| Mnemonic    | Opcode    | Description                                                                                                                                | Operation               |
| ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- |
| **`lui`**   | `0110111` | **Load Upper Immediate**: Loads the 20-bit immediate into the upper 20 bits of `rd` and sets the lower 12 bits to zero.                    | `rd = imm << 12`        |
| **`auipc`** | `0010111` | **Add Upper Immediate to PC**: Adds the 20-bit immediate (shifted left by 12) to the program counter (`pc`) and stores the result in `rd`. | `rd = pc + (imm << 12)` |

*Note: `lui` is fundamental for loading arbitrary 32-bit constants into
registers, often in combination with an I-type instruction like `addi`. `auipc`
is essential for position-independent code and accessing PC-relative data.*

**Format:**  `[imm[31:12] (20) | rd (5) | opcode (7)]`

##### B type instructions

These instructions compare the values in two source registers (`rs1` and `rs2`) and conditionally jump to a target address. The target address is calculated by adding a signed immediate offset to the current program counter (`pc`).

**Opcode:** `1100011` for all instructions in this table.

| Mnemonic   | `funct3` | Description                                | Operation                              |
| ---------- | -------- | ------------------------------------------ | -------------------------------------- |
| **`beq`**  | `000`    | Branch if Equal                            | `if (rs1 == rs2) pc += imm`            |
| **`bne`**  | `001`    | Branch if Not Equal                        | `if (rs1 != rs2) pc += imm`            |
| **`blt`**  | `100`    | Branch if Less Than (Signed)               | `if (rs1 < rs2) pc += imm`             |
| **`bge`**  | `101`    | Branch if Greater Than or Equal (Signed)   | `if (rs1 >= rs2) pc += imm`            |
| **`bltu`** | `110`    | Branch if Less Than (Unsigned)             | `if (rs1 < rs2) pc += imm` (unsigned)  |
| **`bgeu`** | `111`    | Branch if Greater Than or Equal (Unsigned) | `if (rs1 >= rs2) pc += imm` (unsigned) |

*Note: The 13-bit signed immediate offset is scaled by 2 and added to the PC. It can represent a jump range of -4096 to +4094 bytes.*

**Format:** `[imm[12|10:5] (7) | rs2 (5) | rs1 (5) | funct3 (3) | imm[4:1|11] (5) | opcode (7)]`


##### J type instruction

J-type instructions are used for unconditional jumps.

| Mnemonic  | Opcode    | Description                                                                                                       | Operation                |
| --------- | --------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------ |
| **`jal`** | `1101111` | **Jump and Link**: Jumps to `pc + imm` and stores the return address (`pc + 4`) in the destination register `rd`. | `rd = pc + 4; pc += imm` |

*Note: The 21-bit signed immediate offset is scaled by 2 and added to the PC, allowing for a jump range of ±1 MiB. Using `rd = x0` (zero) makes `jal` a simple unconditional jump.*

**Format:** `[imm[20|10:1|11|19:12] (20) | rd (5) | opcode (7)]`

##### Pseudo instructions

### RISC-V RV32I Pseudoinstructions

| Pseudoinstruction     | Expansion (Real Instruction)                                        | Description                                                                                                  |
| --------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `nop`                 | `addi zero, zero, 0`                                                | No operation. Does nothing.                                                                                  |
| `li rd, imm`          | `lui rd, %hi(imm)`<br>`addi rd, rd, %lo(imm)`                       | Load immediate value into a register. May expand to one or two instructions depending on the immediate size. |
| `mv rd, rs`           | `addi rd, rs, 0`                                                    | Move the value from one register to another.                                                                 |
| `not rd, rs`          | `xori rd, rs, -1`                                                   | Performs a bitwise NOT on a register.                                                                        |
| `neg rd, rs`          | `sub rd, zero, rs`                                                  | Negates the value in a register (two's complement).                                                          |
| `seqz rd, rs`         | `sltiu rd, rs, 1`                                                   | Set `rd` to 1 if `rs` is equal to zero, otherwise 0.                                                         |
| `snez rd, rs`         | `sltu rd, zero, rs`                                                 | Set `rd` to 1 if `rs` is not equal to zero, otherwise 0.                                                     |
| `sltz rd, rs`         | `slt rd, rs, zero`                                                  | Set `rd` to 1 if `rs` is less than zero, otherwise 0.                                                        |
| `sgtz rd, rs`         | `slt rd, zero, rs`                                                  | Set `rd` to 1 if `rs` is greater than zero, otherwise 0.                                                     |
| `beqz rs, offset`     | `beq rs, zero, offset`                                              | Branch if `rs` is equal to zero.                                                                             |
| `bnez rs, offset`     | `bne rs, zero, offset`                                              | Branch if `rs` is not equal to zero.                                                                         |
| `blez rs, offset`     | `bge zero, rs, offset`                                              | Branch if `rs` is less than or equal to zero.                                                                |
| `bgez rs, offset`     | `bge rs, zero, offset`                                              | Branch if `rs` is greater than or equal to zero.                                                             |
| `bltz rs, offset`     | `blt rs, zero, offset`                                              | Branch if `rs` is less than zero.                                                                            |
| `bgtz rs, offset`     | `blt zero, rs, offset`                                              | Branch if `rs` is greater than zero.                                                                         |
| `bgt rd, rs, offset`  | `blt rs, rd, offset`                                                | Branch if `rd` > `rs` (signed).                                                                              |
| `ble rd, rs, offset`  | `bge rs, rd, offset`                                                | Branch if `rd` <= `rs` (signed).                                                                             |
| `bgtu rd, rs, offset` | `bltu rs, rd, offset`                                               | Branch if `rd` > `rs` (unsigned).                                                                            |
| `bleu rd, rs, offset` | `bgeu rs, rd, offset`                                               | Branch if `rd` <= `rs` (unsigned).                                                                           |
| `j offset`            | `jal zero, offset`                                                  | Unconditional jump to a label.                                                                               |
| `jr rs`               | `jalr zero, rs, 0`                                                  | Unconditional jump to the address in a register.                                                             |
| `jalr rs`             | `jalr ra, rs, 0`                                                    | Jump to address in `rs`, saving return address to `ra`.                                                      |
| `ret`                 | `jalr zero, ra, 0`                                                  | Return from a function.                                                                                      |
| `call offset`         | `auipc ra, %pcrel_hi(offset)`<br>`jalr ra, %pcrel_lo(offset)(ra)`   | Call a function at a PC-relative offset. Expands to `jal ra, offset` for short distances.                    |
| `tail offset`         | `auipc t0, %pcrel_hi(offset)`<br>`jalr zero, %pcrel_lo(offset)(t0)` | Tail call a function. Expands to `jal zero, offset` for short distances.                                     |
| `la rd, symbol`       | `auipc rd, %pcrel_hi(symbol)`<br>`addi rd, rd, %pcrel_lo(symbol)`   | Load the address of a symbol into a register.                                                                |

## RISC-V assembly basics

## Program execution

A CPU executes a program by repeatedly performing the following steps, known as
the instruction cycle:

1. **Fetch & Update PC:** The CPU reads the next instruction from memory using
   the program counter (PC), then updates the PC to point to the following
   instruction (either sequentially or by a jump/branch).
2. **Decode:** The control unit interprets the instruction, determining the
   required operation and which registers or memory locations are involved.
3. **Execute:** The CPU performs the specified operation, such as arithmetic,
   logic, memory access, or control flow.
4. **Memory Access (if needed):** For instructions that require reading from or
   writing to memory, the CPU accesses the appropriate memory address.
5. **Write Back:** The result of the instruction is written back to a register
   or memory.

This cycle repeats for each instruction until the program finishes or the CPU is
interrupted.

## RISC-V architecture implementation

There are several distinct strategies for implementing an RV32I CPU core, each
presenting a different balance between design complexity and performance. The
most foundational of these is the single-cycle implementation. In this approach,
every instruction, regardless of its complexity, is designed to complete its
entire execution—from fetch to write-back—within a single, elongated clock
cycle. This design philosophy simplifies the control logic immensely, as it can
be implemented with purely combinational circuits without the need for state.
However, the significant drawback is that the clock period is dictated by the
longest possible instruction path (the critical path), which is typically a load
instruction (`lw`). This means that faster, simpler instructions like `addi` are
forced to take the same long duration as the slowest one, making the
single-cycle processor inherently inefficient and performant only at very low
clock speeds.

Beyond the simple single-cycle design, several more advanced implementation
strategies exist, each building upon the last to improve performance, typically
at the cost of increased design complexity.

- Multi-Cycle Implementation. A direct evolution from the single-cycle model,
  the multi-cycle implementation breaks down the execution of a single
  instruction into multiple, discrete steps (e.g., Fetch, Decode, Execute,
  Memory Access, Write-Back). Each of these steps takes one clock cycle. This
  allows the clock frequency to be much higher, as the clock period is now
  determined by the delay of the longest *stage*, not the longest *instruction*.
  Furthermore, simpler instructions can complete in fewer clock cycles than more
  complex ones (e.g., `addi` might take 3-4 cycles while `lw` takes 5),
  improving the average cycles per instruction (CPI). The main drawback is the
  need for more complex control logic, typically implemented as a finite state
  machine, to manage the state transitions between stages for each instruction.

- Pipelined Implementation. This is the foundational technique for modern
  high-performance processors. Pipelining applies an assembly-line concept to
  instruction execution, overlapping the stages of multiple instructions
  simultaneously. For example, while one instruction is in its Execute stage,
  the subsequent instruction is in its Decode stage, and the one after that is
  being Fetched. In an ideal scenario, a pipelined processor can achieve a
  throughput of one completed instruction per clock cycle (a CPI of 1), offering
  a significant performance boost over a multi-cycle design. However, this
  parallelism introduces new challenges known as "hazards" (data, structural,
  and control hazards) that occur when instructions interfere with one another.
  These must be managed with sophisticated hardware techniques like forwarding,
  stalling, and branch prediction, which adds considerable complexity to the
  datapath and control unit.

- Superscalar and Out-of-Order Execution. To push performance even further,
  superscalar processors feature multiple, redundant execution units, allowing
  them to issue and execute more than one instruction per clock cycle (achieving
  a CPI of less than 1). This is a form of instruction-level parallelism (ILP).
  To maximize the utilization of these parallel units, high-end processors often
  employ out-of-order execution (OoOE). An OoOE processor can look ahead in the
  instruction stream and execute instructions as soon as their data dependencies
  are met, rather than in the strict order they appear in the program. This
  helps to hide memory latency and keep the execution units busy, but it
  requires exceptionally complex hardware for tasks like register renaming,
  dependency checking, and ensuring results are committed in the correct program
  order to maintain architectural consistency. This represents the peak of
  modern CPU design complexity.

### Single cycle

#### Components

The CPU consists of the following modules:

1. **PC**. Implements the program counter logic. Its inputs are `NextPC` which
   is the next value for the program counter and its output is the current value
   of it.
2. **Instruction memory**. Also called *program memory*. This module stores the
   program in its binary form. Its imput is the address to be accessed (i.e. the
   output of the *PC* module) and its output is the actual instruction in 32
   bits. For normal instructions (i.e. RV32, RV64 and RV128) the memory uses 4
   bytes to store each instruction. For the compressed instruction set extension
   it uses 2 bytes per instruction.
3. **Registers unit**. This is the place where the 32 CPU registers live in. Its
   inputs come from the instruction memory (*Fetch* stage), from the *Write
   back* stage and from the *Control unit*. *rs1*, *rs2* and *rd* contain the 5
   bits wide signals that encode the respective parts of the instruction.
   *DataWr* contains the 32 bit wide data to be written on *rd*. *RUWr* signals
   whether an actual write must be performed by the *Registers unit* or not.
4. **Immediate generator**. Most of RISC-V instructions contain constant encoded
   directly in the instruction. These constants are called immediate values in
   RISC-V terminology. The immediate generator implements the logic to extract
   the constant according to the instruction type and outputs it in a 32 bit
   format (for RV32) or in 64 bits for RV64. This module is also responsible for
   sign or zero extending the value as appropriate according to the instruction
   type.
5. **Arithmetic Logic Unit (ALU)**. This moddule is part of the execution stage.
   It performs logic and arithmetic operations according to the instruction
   being executed. Its imputs *A* and *B* are two 32 bits signals that carry the
   arguments of the operation to be executed. Its output *ALURes* is a 32 bit
   output signal with the result. The width of these signals change for RV64 and
   RV128. An extra input of 5 bits named *ALUOp* comming from the control unit
   is used to select the actual operation to be performed.
6. **Branch unit**. It takes 32 bits signals from the registers unit containing
   the values to be compared. Additionally it takes *BrOp* 5 bits wide signal
   from the control unit that encodes the kind of test to be performed. The
   output of this module is a signal indicating whether a jump needs to be
   performed for the next instruction.
7. **Data memory**. This module is responsible for storing data. It is located
   at the *Memory* stage and has 3 inputs. *Address* and *DataWr* are 32 bits
   inputs containing the address to be accessed and the data to be stored. In
   case of a load operation the last one is not used. The output *DataRd* is a
   32 bits signal with the data read from the memory when executing load
   operations.
8. **Control unit**. This module is in charge of propagating the necessary
   signals to the different CPU components for them to behave accordingly for
   the execution of a given instruction. It takes the *opcode* and the *funct3*
   values from the instruction and outputs the following signals:
   | Signal          | Description                                                              |
   | --------------- | ------------------------------------------------------------------------ |
   | **RUWr**        | Whether the registers unit must write                                    |
   | **IMMSrc**      | How to perform the immediate decoding                                    |
   | **BrOp**        | Which test to perform for branching                                      |
   | **ALUASrc**     | Whether to pass the *PC* or *RS1Data* to the ALU                         |
   | **ALUBSrc**     | Whether to pass the immediate or *RS2Data* to the ALU                    |
   | **ALUOp**       | Which operation to comput at the ALU                                     |
   | **DMWr**        | Whether to write to data memory                                          |
   | **DMCtrl**      | How to perform the read or write operation                               |
   | **RUDataWrSrc** | Chooses among *ALURes*, *DataRd* or *NextPC* as the Registers unit input |

In addition to the components mentioned above there are four more simple
components in the design of the CPU. The first one is an adder that adds either
4 or 2 bytes to the current value of the *PC*. The other three are multiplexors.

The first multiplexor is controlled by the output of the branch unit. It takes
as signals *PC+4* and a new value computed by the ALU for the PC. When on a
branch or jump instruction the branch unit selects the appropriate signal.

Two other multiplexors sit behind the ALU. They are respectively controlled by
signals *ALUASrc* and *ALUBSrc*. These select the data that feed the ALU
arguments.

One last multiplexor is controlled by *RUDataWrSrc* which is a two bits signal.
This multiplexor chooses the data that will be feeded into the *registers unit*.


#### Execution

In this section we summarize the flow of execution for each instruction type for
the particural case of a sincgle cycle cpu.

##### R type instructions

R-type instructions, such as `add`, `sub`, and `and`, perform an operation using
two source registers (`rs1`, `rs2`) and write the result to a destination
register (`rd`). Let's trace the execution of the instruction `add rd, rs1, rs2`
through your single-cycle CPU design. In this model, all of the following steps
happen concurrently within a single clock cycle, but we can describe them
sequentially to understand the flow of data and control signals.

Let's use a concrete example: `add x3, x1, x2`.


###### Step 1: Instruction Fetch

1. The **PC** module outputs the memory address of the current instruction.
2. This address is sent to the **Instruction Memory**.
3. The **Instruction Memory** reads the 32-bit binary word for `add x3, x1, x2`
   and outputs it. For this instruction, the binary fields would be:
   `opcode=0110011`, `rd=00011` (x3), `funct3=000` (add/sub), `rs1=00001` (x1),
   `rs2=00010` (x2), and `funct7=0000000` (add).
4. Simultaneously, the value from the PC is also sent to an adder to calculate
   `PC + 4`, which is the default address for the next instruction.

###### Step 2: Instruction Decode & Control Signal Generation

1. The 32-bit instruction from Instruction Memory is passed to the **Control
   Unit** and the **Registers Unit**.
2. The **Control Unit** looks at the `opcode` (`0110011`). It immediately
   recognizes this as an R-type instruction and sets its output control signals
   accordingly.
3. Based on the `opcode`, `funct3`, and `funct7`, the **Control Unit** generates
   the following key signals for an `add` instruction:

  | Signal          | Value            | Reason                                                                              |
  | :-------------- | :--------------- | :---------------------------------------------------------------------------------- |
  | **RUWr**        | `1`              | An R-type instruction writes a result back to a register.                           |
  | **ALUASrc**     | `0`              | The first ALU operand must come from a register (`RS1Data`), not the PC.            |
  | **ALUBSrc**     | `0`              | The second ALU operand must come from a register (`RS2Data`), not the immediate.    |
  | **ALUOp**       | `ADD`            | The Control Unit decodes `funct3` and `funct7` to tell the ALU to perform addition. |
  | **DMWr**        | `0`              | R-type instructions do not write to data memory.                                    |
  | **RUDataWrSrc** | `ALURes`         | The data to be written to the register file comes from the ALU's result.            |
  | **BrOp**        | `X` (Don't Care) | This is not a branch instruction.                                                   |

4. The `rs1` (`00001`), `rs2` (`00010`), and `rd` (`00011`) fields from the
   instruction are sent to the address inputs of the **Registers Unit**.

###### Step 3: Register Read

1. The **Registers Unit** receives the `rs1` and `rs2` addresses.
2. It reads the 32-bit values currently stored in register `x1` and register
   `x2`.
3. These values are placed on the `RS1Data` and `RS2Data` output ports of the
   Registers Unit.

###### Step 4: Execute

1. The `RS1Data` value (from `x1`) is routed to the first input of the **ALU**.
   The multiplexor controlled by `ALUASrc` selects this path.
2. The `RS2Data` value (from `x2`) is routed to the second input of the **ALU**.
   The multiplexor controlled by `ALUBSrc` selects this path.
3. The **ALU** receives the `ALUOp` signal (`ADD`) from the Control Unit.
4. The **ALU** performs the addition: `ALURes = RS1Data + RS2Data`. The result
   is placed on its 32-bit output.

###### Step 5: Memory Access

This stage is idle for R-type instructions. The `DMWr` signal is `0`, so the
**Data Memory** is not written to. Since the `RUDataWrSrc` signal selects the
ALU result, any value that might be read from memory is ignored.

###### Step 6: Write Back

1. The result from the ALU, `ALURes`, is sent to the final multiplexor that
   chooses the data to be written back to a register.
2. The `RUDataWrSrc` signal from the Control Unit configures this multiplexor to
   pass `ALURes` through to the `DataWr` input of the **Registers Unit**.
3. The `RUWr` signal is `1` (asserted), enabling the write operation in the
   **Registers Unit**.
4. The **Registers Unit** uses the `rd` address (`00011` for `x3`) from the
   instruction to write the value from its `DataWr` input into register `x3`.
5. Finally, since this is not a branch or jump, the **PC** is updated with the
   `PC + 4` value calculated in Step 1, preparing for the next instruction
   cycle.

##### I type instructions (arithmetic/logical)

I-type instructions form a large group that includes arithmetic/logic operations
with immediate values (e.g., `addi`, `xori`), loads (e.g., `lw`), and jumps
(`jalr`). This description focuses on the **arithmetic and logical** variants.

These instructions perform an operation between a source register (`rs1`) and a
12-bit sign-extended immediate value, storing the result in a destination
register (`rd`). We will trace the execution of the instruction
`addi rd, rs1, imm` through your single-cycle CPU design.

Let's use a concrete example: `addi x5, x6, -10`.

###### Step 1: Instruction Fetch

1. The **PC** module outputs the memory address of the `addi` instruction.
2. This address is sent to the **Instruction Memory**, which reads and outputs
   the corresponding 32-bit instruction word. For `addi x5, x6, -10`, the binary
   fields would be: `opcode=0010011`, `rd=00101` (x5), `funct3=000` (addi),
   `rs1=00110` (x6), and `imm=111111110110` (the 12-bit two's complement
   representation of -10).
3. Simultaneously, the adder calculates the default next address, `PC + 4`.

###### Step 2: Instruction Decode & Control Signal Generation

1. The 32-bit instruction is passed to the **Control Unit**, the **Registers
   Unit**, and now, importantly, the **Immediate Generator**.
2. The **Immediate Generator** receives the instruction. Based on the opcode or
   a direct signal from the Control Unit (`IMMSrc`), it recognizes an I-type
   format. It extracts the 12-bit immediate (`111111110110`) from bits 31-20 and
   **sign-extends** it to a 32-bit value. The resulting 32-bit value is
   `11111111111111111111111111110110`.
3. The **Control Unit** examines the `opcode` (`0010011`). It identifies the
   instruction as an I-type arithmetic operation and sets its control signals
   accordingly.

| Signal          | Value            | Reason                                                                      |
| :-------------- | :--------------- | :-------------------------------------------------------------------------- |
| **RUWr**        | `1`              | An I-type arithmetic instruction writes a result to a register.             |
| **ALUASrc**     | `0`              | The first ALU operand is from a register (`RS1Data`).                       |
| **ALUBSrc**     | `1`              | **Key difference:** The second ALU operand is the sign-extended immediate.  |
| **ALUOp**       | `ADD`            | The Control Unit decodes `funct3` to tell the ALU to perform addition.      |
| **DMWr**        | `0`              | This instruction does not write to data memory.                             |
| **RUDataWrSrc** | `ALURes`         | The data written to the register file comes from the ALU's result.          |
| **IMMSrc**      | `I-type`         | This tells the Immediate Generator how to extract and extend the immediate. |
| **BrOp**        | `X` (Don't Care) | This is not a branch instruction.                                           |

4. The `rs1` (`00110`) and `rd` (`00101`) fields from the instruction are sent
   to the address inputs of the **Registers Unit**. The bits corresponding to
   `rs2` in other formats are part of the immediate and are not used to select a
   register.

###### Step 3: Register Read

1. The **Registers Unit** receives the `rs1` address (`00110`).
2. It reads the 32-bit value stored in register `x6` and places it on its
   `RS1Data` output port.

###### Step 4: Execute

1. The `RS1Data` value (from `x6`) is routed to the first input of the **ALU**
   (selected by the `ALUASrc=0` MUX).
2. The 32-bit sign-extended immediate value from the **Immediate Generator** is
   routed to the second input of the **ALU**. The multiplexor controlled by
   `ALUBSrc=1` selects this immediate value instead of the `RS2Data` path.
3. The **ALU** receives the `ALUOp` signal (`ADD`) from the Control Unit.
4. The **ALU** performs the operation: `ALURes = RS1Data + Immediate`. The
   result is placed on its 32-bit output.

###### Step 5: Memory Access

This stage is idle for I-type arithmetic instructions. The `DMWr` signal is `0`,
so no data is written to **Data Memory**.

###### Step 6: Write Back

1. The result from the ALU, `ALURes`, is passed through the final multiplexor
   (controlled by `RUDataWrSrc`) to the `DataWr` input of the **Registers
   Unit**.
2. The `RUWr` signal is `1`, enabling the **Registers Unit** to perform a write.
3. The **Registers Unit** uses the `rd` address (`00101` for `x5`) to write the
   value from `DataWr` into register `x5`.
4. The **PC** is updated with the `PC + 4` value, preparing the CPU to fetch the
   next instruction.

##### I type instructions (load)

Load instructions are a specific subgroup of the I-type format used to transfer
data from memory into a register. They calculate a memory address by adding an
immediate offset to a base register (`rs1`), read from that address, and place
the data into a destination register (`rd`).

We will trace the execution of `lw rd, offset(rs1)`, which is the standard
assembly syntax for loads.

Let's use a concrete example: `lw x7, 32(x8)`. This instruction means: "load the
word from the memory address calculated by `x8 + 32` and store it in register
`x7`."

###### Step 1: Instruction Fetch

1. The **PC** outputs the address of the `lw` instruction to the **Instruction
   Memory**.
2. The **Instruction Memory** reads and outputs the 32-bit instruction word for
   `lw x7, 32(x8)`. The binary fields would be: `opcode=0000011`, `rd=00111`
   (x7), `funct3=010` (lw), `rs1=01000` (x8), and `imm=000000100000` (the 12-bit
   representation of 32).
3. The `PC + 4` adder calculates the address of the next sequential instruction.

###### Step 2: Instruction Decode & Control Signal Generation

1. The 32-bit instruction is distributed to the **Control Unit**, **Registers
   Unit**, and **Immediate Generator**.
2. The **Immediate Generator** extracts the 12-bit immediate (`000000100000`)
   and sign-extends it to a 32-bit value.
3. The **Control Unit** decodes the `opcode` (`0000011`). It recognizes a load
   instruction and generates a distinct set of control signals:

| Signal          | Value            | Reason                                                                                            |
| :-------------- | :--------------- | :------------------------------------------------------------------------------------------------ |
| **RUWr**        | `1`              | Yes, we are writing the data loaded from memory into a register.                                  |
| **ALUASrc**     | `0`              | The first ALU operand is the base address from a register (`RS1Data`).                            |
| **ALUBSrc**     | `1`              | The second ALU operand is the sign-extended immediate offset.                                     |
| **ALUOp**       | `ADD`            | The ALU's sole purpose is to calculate the memory address by adding the base and offset.          |
| **DMWr**        | `0`              | This is a *load*, so we are reading from memory, not writing to it.                               |
| **DMCtrl**      | `WORD`           | Tells the Data Memory to perform a 32-bit (word) read operation.                                  |
| **RUDataWrSrc** | `DataRd`         | **Key difference:** The data written to the register comes from the **Data Memory**, not the ALU. |
| **IMMSrc**      | `I-type`         | Tells the Immediate Generator how to extract and extend the offset.                               |
| **BrOp**        | `X` (Don't Care) | This is not a branch instruction.                                                                 |

4. The `rs1` (`01000`) and `rd` (`00111`) fields are sent to the **Registers
   Unit**.

###### Step 3: Register Read

1. The **Registers Unit** receives the `rs1` address (`01000` for `x8`).
2. It reads the 32-bit value from register `x8` (the base address) and places it
   on its `RS1Data` output.

###### Step 4: Execute (Address Calculation)

1. This stage is dedicated to calculating the memory address.
2. `RS1Data` (the value from `x8`) is fed into the first input of the **ALU**.
3. The 32-bit sign-extended immediate offset (`32`) from the **Immediate
   Generator** is fed into the second input of the **ALU**.
4. The **ALU**, instructed by `ALUOp=ADD`, computes the effective memory
   address: `ALURes = RS1Data + 32`. The `ALURes` output now holds the target
   memory address.

###### Step 5: Memory Access (Data Read)

1. This stage is now fully active.
2. The address calculated by the ALU (`ALURes`) is sent to the `Address` input
   of the **Data Memory**.
3. With `DMWr=0`, the **Data Memory** performs a read operation at this address.
   The `DMCtrl` signal ensures it reads a full 32-bit word.
4. The 32-bit data retrieved from that memory location is placed on the **Data
   Memory's** `DataRd` output.

###### Step 6: Write Back

1. This is the final, critical step where the data path differs significantly
   from an arithmetic instruction.
2. The final multiplexor before the Registers Unit receives both the ALU result
   (`ALURes`, which is the address) and the memory data (`DataRd`).
3. The `RUDataWrSrc` signal from the Control Unit selects the `DataRd` input,
   directing the data fetched from memory to proceed.
4. This data is passed to the `DataWr` input of the **Registers Unit**.
5. With `RUWr=1`, the **Registers Unit** writes the data from `DataWr` into the
   destination register specified by `rd` (`x7`).
6. The **PC** is updated to `PC + 4`.

##### I type instructions (jumping)

The main I-type instruction for jumping is `jalr` (Jump and Link Register). This
powerful instruction serves two purposes simultaneously: it jumps to a new
instruction address calculated from a register and an offset, and it stores the
address of the next sequential instruction (`PC + 4`) into a destination
register. This "linking" behavior is fundamental for implementing function calls
and returns.

We will trace the execution of `jalr rd, offset(rs1)`.

Let's use a concrete example: `jalr x1, 16(x5)`. This means: "jump to the
address calculated by `x5 + 16`, and store the return address (`PC + 4`) in
register `x1` (`ra`)."

###### Step 1: Instruction Fetch

1. The **PC** outputs the address of the `jalr` instruction.
2. The **Instruction Memory** fetches the 32-bit instruction word. For
   `jalr x1, 16(x5)`, the fields would be: `opcode=1100111`, `rd=00001` (x1),
   `funct3=000`, `rs1=00101` (x5), and `imm=000000010000` (16).
3. Crucially, the adder calculates `PC + 4`. This value is not just the default
   next address; it is the **return address** that needs to be saved.

###### Step 2: Instruction Decode & Control Signal Generation

1. The 32-bit instruction is sent to the **Control Unit**, **Registers Unit**,
   and **Immediate Generator**.
2. The **Immediate Generator** extracts and sign-extends the 12-bit immediate
   offset (`16`).
3. The **Control Unit** decodes the `opcode` (`1100111`). It recognizes `jalr`
   and generates a unique set of signals to manage the instruction's dual
   actions.

| Signal          | Value            | Reason                                                                                          |
| :-------------- | :--------------- | :---------------------------------------------------------------------------------------------- |
| **RUWr**        | `1`              | Yes, we must write the return address (`PC + 4`) into register `rd`.                            |
| **ALUASrc**     | `0`              | The first ALU operand is the base address from `rs1`.                                           |
| **ALUBSrc**     | `1`              | The second ALU operand is the sign-extended immediate offset.                                   |
| **ALUOp**       | `ADD`            | The ALU's job is to calculate the target jump address (`rs1 + offset`).                         |
| **DMWr**        | `0`              | `jalr` does not interact with data memory.                                                      |
| **RUDataWrSrc** | `NextPC`         | **Key difference:** The data written to the register is the return address, which is `PC + 4`.  |
| **BrOp**        | `X` (Don't Care) | While it's a jump, it's unconditional. The control logic for the PC update is handled directly. |

4. Additionally, the Control Unit must assert a signal to force the PC to update
   from the ALU result. For this unconditional jump, it ensures the multiplexor
   for the next PC value selects the calculated address rather than `PC + 4`.
5. The `rs1` (`00101`) and `rd` (`00001`) fields are sent to the **Registers
   Unit**.

###### Step 3: Register Read

1. The **Registers Unit** receives the `rs1` address (`00101` for `x5`).
2. It reads the 32-bit value from register `x5` (the base jump address) and
   places it on its `RS1Data` output.

###### Step 4: Execute (Target Address Calculation)

1. The `RS1Data` value (from `x5`) is fed into the first input of the **ALU**.
2. The 32-bit sign-extended immediate (`16`) is fed into the second input of the
   **ALU**.
3. The **ALU**, instructed by `ALUOp=ADD`, computes the target jump address:
   `ALURes = RS1Data + 16`. The `ALURes` output now holds the address where the
   program will jump.

###### Step 5: Memory Access

This stage is completely idle for a `jalr` instruction.

###### Step 6: Write Back and PC Update

This final step is a dual-action process that occurs in the same cycle: one
action writes to the register file, and the other writes to the Program Counter.

1. **Register Write Back (Linking):**
   * The return address, calculated by the `PC + 4` adder, is routed to the
     final multiplexor before the Registers Unit.
   * The `RUDataWrSrc` signal selects the `NextPC` (`PC + 4`) input.
   * This return address is passed to the `DataWr` input of the **Registers
     Unit**.
   * With `RUWr=1`, the **Registers Unit** writes the return address into the
     destination register `rd` (`x1`).

2. **Program Counter Update (Jumping):**
   * The target jump address, calculated by the ALU (`ALURes`), is sent to the
     multiplexor that selects the next value for the PC.
   * The Control Unit's logic ensures this multiplexor selects the `ALURes`
     value.
   * On the next clock edge, the **PC** is loaded with this new target address,
     causing program execution to "jump" to that location.

##### S type instruction

S-type instructions are used to store data from a register into memory. They are
the counterpart to load instructions. A store instruction calculates a target
memory address from a base register (`rs1`) and an immediate offset, and then
writes the data from a second source register (`rs2`) to that memory location.
Store instructions do not modify any registers.

We will trace the execution of `sw rs2, offset(rs1)`.

Let's use a concrete example: `sw x9, 40(x2)`. This means: "take the 32-bit
value from register `x9` and write it to the memory address calculated by
`x2 + 40`."

###### Step 1: Instruction Fetch

1. The **PC** outputs the address of the `sw` instruction.
2. The **Instruction Memory** fetches the 32-bit instruction word. For
   `sw x9, 40(x2)`, the fields are: `opcode=0100011`, `imm[11:5]`, `rs2=01001`
   (x9), `rs1=00010` (x2), `funct3=010` (sw), and `imm[4:0]`.
3. The adder calculates the default next address, `PC + 4`.

###### Step 2: Instruction Decode & Control Signal Generation

1. The 32-bit instruction is distributed to the **Control Unit**, **Registers
   Unit**, and **Immediate Generator**.
2. The **Immediate Generator**, signaled by `IMMSrc=S-type`, reassembles the
   12-bit immediate from its two split fields in the instruction (`imm[11:5]`
   and `imm[4:0]`) and sign-extends it to a 32-bit value.
3. The **Control Unit** decodes the `opcode` (`0100011`) and recognizes a store
   instruction, generating the following specific control signals:

| Signal          | Value            | Reason                                                                                |
| :-------------- | :--------------- | :------------------------------------------------------------------------------------ |
| **RUWr**        | `0`              | **Key difference:** A store instruction does **not** write back to the register file. |
| **ALUASrc**     | `0`              | The first ALU operand is the base address from `rs1`.                                 |
| **ALUBSrc**     | `1`              | The second ALU operand is the sign-extended immediate offset.                         |
| **ALUOp**       | `ADD`            | The ALU's job is to calculate the memory address.                                     |
| **DMWr**        | `1`              | **Key difference:** We are enabling a **write** operation to the Data Memory.         |
| **DMCtrl**      | `WORD`           | Tells the Data Memory to perform a 32-bit (word) write.                               |
| **RUDataWrSrc** | `X` (Don't Care) | No data is being written to the register file, so this selection is irrelevant.       |
| **IMMSrc**      | `S-type`         | Tells the Immediate Generator how to assemble and extend the immediate.               |
| **BrOp**        | `X` (Don't Care) | This is not a branch instruction.                                                     |

4. The `rs1` (`00010`) and `rs2` (`01001`) fields are sent to the **Registers
   Unit**.

###### Step 3: Register Read

1. The **Registers Unit** receives both `rs1` and `rs2` addresses.
2. It reads the 32-bit value from register `x2` (the base address) and places it
   on its `RS1Data` output.
3. It reads the 32-bit value from register `x9` (the data to be stored) and
   places it on its `RS2Data` output.

##### Step 4: Execute (Address Calculation)

1. This stage calculates the target memory address.
2. The `RS1Data` value (from `x2`) is sent to the first input of the **ALU**.
3. The 32-bit sign-extended immediate (`40`) from the **Immediate Generator** is
   sent to the second input of the **ALU**.
4. The **ALU**, instructed by `ALUOp=ADD`, computes the effective memory
   address: `ALURes = RS1Data + 40`. The `ALURes` output now holds the address
   to write to.

###### Step 5: Memory Access (Data Write)

1. This is the primary action stage for a store instruction.
2. The address calculated by the ALU (`ALURes`) is sent to the `Address` input
   of the **Data Memory**.
3. The data to be written, which comes from the `RS2Data` output of the
   Registers Unit (the value of `x9`), is sent to the `DataWr` input of the
   **Data Memory**.
4. The `DMWr` signal from the Control Unit is `1`, enabling the memory's write
   functionality.
5. The **Data Memory** takes the 32-bit value on its `DataWr` input and stores
   it at the location specified by its `Address` input.

###### Step 6: Write Back

1. This stage is completely inactive.
2. The `RUWr` signal is `0`, so the **Registers Unit** is disabled from writing,
   and no registers are modified.
3. The **PC** is updated with the `PC + 4` value, and the CPU proceeds to the
   next instruction. 

##### B instruction type

B-type instructions are the foundation of conditional control flow in RISC-V.
Instructions like `beq` (Branch if Equal) and `bne` (Branch if Not Equal)
compare two registers (`rs1` and `rs2`). If the condition is met, program
execution jumps to a new address. If not, execution continues to the next
sequential instruction (`PC + 4`).

These instructions calculate the target jump address by adding a sign-extended
immediate offset to the current Program Counter (`PC`). They do not write to the
register file or access data memory.

Let's use a concrete example: `beq x5, x6, my_label`. This means: "If the value
in `x5` is equal to the value in `x6`, then jump to `my_label`." The assembler
converts `my_label` into a numeric offset.

###### Step 1: Instruction Fetch

1. The **PC** outputs the address of the `beq` instruction.
2. The **Instruction Memory** fetches the 32-bit instruction word.
3. Simultaneously, the adder calculates the "branch not taken" address,
   `PC + 4`.

###### Step 2: Instruction Decode & Control Signal Generation

1. The 32-bit instruction is distributed to the **Control Unit**, **Registers
   Unit**, and **Immediate Generator**.
2. The **Immediate Generator**, signaled by `IMMSrc=B-type`, reassembles the
   13-bit immediate offset from its encoded fields and sign-extends it to a
   32-bit value.
3. The **Control Unit** decodes the `opcode` (`1100011`) and recognizes a branch
   instruction. It generates a set of signals to manage the two parallel
   operations (comparison and address calculation).

| Signal          | Value            | Reason                                                                                                  |
| :-------------- | :--------------- | :------------------------------------------------------------------------------------------------------ |
| **RUWr**        | `0`              | Branch instructions never write to the register file.                                                   |
| **ALUASrc**     | `1`              | **Key difference:** The first ALU operand is the **PC**, needed to calculate the target address.        |
| **ALUBSrc**     | `1`              | The second ALU operand is the sign-extended immediate offset.                                           |
| **ALUOp**       | `ADD`            | The ALU's job is to calculate the branch target address (`PC + offset`).                                |
| **DMWr**        | `0`              | Branch instructions do not access data memory.                                                          |
| **BrOp**        | `EQ`             | **Key difference:** Tells the **Branch Unit** which comparison to perform (for `beq`, this is "Equal"). |
| **RUDataWrSrc** | `X` (Don't Care) | No data is being written to the register file.                                                          |
| **IMMSrc**      | `B-type`         | Tells the Immediate Generator how to extract and extend the immediate.                                  |

4.  The `rs1` and `rs2` fields from the instruction are sent to the **Registers
    Unit** to select the registers to be compared.

###### Step 3: Register Read

1. The **Registers Unit** receives the `rs1` and `rs2` addresses (for `x5` and
   `x6`).
2. It reads the 32-bit values from both registers and places them on its
   `RS1Data` and `RS2Data` outputs.

###### Step 4: Execute (Parallel Operations)

For a branch instruction, two critical operations happen in the execute stage at
the same time: the registers are compared, and the potential target address is
calculated.

1. **Branch Condition Test:**
   * The `RS1Data` (value from `x5`) and `RS2Data` (value from `x6`) outputs are
     fed into the **Branch Unit**.
   * The `BrOp` signal from the Control Unit (`EQ`) instructs the **Branch
     Unit** to perform an equality test (`RS1Data == RS2Data`).
   * The **Branch Unit** produces a single-bit output (let's call it
     `BranchTaken`), which will be `1` if the condition is true (`x5 == x6`) and
     `0` otherwise.

2. **Target Address Calculation:**
   * The current value of the **PC** is routed to the first input of the **ALU**
     (selected by `ALUASrc=1`).
   * The sign-extended immediate offset from the **Immediate Generator** is
     routed to the second input of the **ALU** (selected by `ALUBSrc=1`).
   * The **ALU** computes the target address for a taken branch:
     `TargetAddress = PC + Immediate`. This result is available on the `ALURes`
     output.

###### Step 5: Memory Access

This stage is completely inactive for a branch instruction.

###### Step 6: PC Selection and Update

This final stage determines the next instruction to be fetched.

1. The multiplexor that selects the next value for the PC receives its two
   inputs:
   * Input 0: The `PC + 4` value ("branch not taken" path).
   * Input 1: The `TargetAddress` calculated by the ALU ("branch taken" path).
2. The `BranchTaken` signal (the `1` or `0` result from the **Branch Unit**) is
   used as the select signal for this multiplexor.
3. If `BranchTaken` is `1`, the multiplexor selects the `TargetAddress`.
4. If `BranchTaken` is `0`, the multiplexor selects `PC + 4`.
5. On the next rising clock edge, the **PC** is updated with the selected
   address, completing the conditional branch. The register file remains
   unchanged.
 
##### J instruction type

J-type instructions are used for unconditional jumps. The primary J-type
instruction is `jal` (Jump and Link), which is the standard way to perform a
direct function call. Like `jalr`, it performs two actions: it saves a return
address and unconditionally jumps to a new location.

The key difference from `jalr` is how the target address is calculated. `jal`
uses a large 20-bit immediate offset relative to the current `PC`, allowing for
a wide jump range (±1MiB).

Let's use a concrete example: `jal ra, my_function`. This means:
"unconditionally jump to the address of `my_function`, and store the return
address (`PC + 4`) in the `ra` (return address) register."

###### Step 1: Instruction Fetch

1. The **PC** outputs the address of the `jal` instruction.
2. The **Instruction Memory** fetches the 32-bit instruction word for
   `jal ra, my_function`. The binary fields would be: `opcode=1101111`,
   `rd=00001` (ra), and a 20-bit immediate field representing the offset to
   `my_function`.
3. The `PC + 4` adder calculates the return address that must be saved.

###### Step 2: Instruction Decode & Control Signal Generation

1. The 32-bit instruction is distributed to the **Control Unit**, **Registers
   Unit**, and **Immediate Generator**.
2. The **Immediate Generator** extracts the 20-bit immediate value from its
   specific encoding in the J-type format and sign-extends it to a 32-bit
   offset.
3. The **Control Unit** decodes the `opcode` (`1101111`) and recognizes the
   `jal` instruction, generating signals for the unconditional jump and link.

| Signal          | Value            | Reason                                                                                         |
| :-------------- | :--------------- | :--------------------------------------------------------------------------------------------- |
| **RUWr**        | `1`              | A `jal` instruction must write the return address (`PC + 4`) to the destination register `rd`. |
| **ALUASrc**     | `1`              | The first ALU operand is the **PC**, which is the base for the jump address calculation.       |
| **ALUBSrc**     | `1`              | The second ALU operand is the sign-extended immediate offset.                                  |
| **ALUOp**       | `ADD`            | The ALU's job is to calculate the target address (`PC + offset`).                              |
| **DMWr**        | `0`              | `jal` does not access data memory.                                                             |
| **RUDataWrSrc** | `NextPC`         | The data written to the register is the return address, which is `PC + 4`.                     |
| **IMMSrc**      | `J-type`         | Tells the Immediate Generator how to extract and extend the immediate.                         |
| **BrOp**        | `X` (Don't Care) | This is an unconditional jump, not a conditional branch.                                       |

4. The Control Unit also asserts an unconditional "jump" signal to ensure the PC
   is updated from the ALU's result.
5. The `rd` field from the instruction is sent to the **Registers Unit**.

###### Step 3: Register Read

This stage is inactive. The J-type format does not use any source registers
(`rs1` or `rs2`), so no register reading is performed.

###### Step 4: Execute (Target Address Calculation)

1. The current value of the **PC** is routed to the first input of the **ALU**
   (selected by `ALUASrc=1`).
2. The 32-bit sign-extended immediate offset from the **Immediate Generator** is
   routed to the second input of the **ALU** (selected by `ALUBSrc=1`).
3. The **ALU** computes the target jump address:
   `TargetAddress = PC + Immediate`. This result is placed on the `ALURes`
   output.

###### Step 5: Memory Access

This stage is completely idle for a `jal` instruction.

###### Step 6: Write Back and PC Update

This final step performs the two simultaneous actions of the `jal` instruction
within the same clock cycle.

1. **Register Write Back (Linking):**
   * The return address (`PC + 4`) from the dedicated adder is sent to the final
     multiplexor before the Registers Unit.
   * The `RUDataWrSrc` signal selects the `NextPC` (`PC + 4`) input.
   * This return address is passed to the `DataWr` input of the **Registers
     Unit**.
   * With `RUWr=1` asserted, the **Registers Unit** writes this return address
     into the destination register specified by `rd` (in this case, `ra`).

2. **Program Counter Update (Jumping):**
   * The `TargetAddress` calculated by the ALU (`ALURes`) is sent to the
     multiplexor that selects the next value for the PC.
   * The Control Unit's unconditional jump logic forces this multiplexor to
     select the `TargetAddress`.
   * On the next rising clock edge, the **PC** is loaded with this new
     `TargetAddress`, causing program execution to jump to the target function.


##### U type instructions: `lui` 

U-type (Upper Immediate) instructions are fundamental for creating 32-bit
constants and PC-relative addresses. Their primary function is to load a 20-bit
immediate value into the upper 20 bits of a destination register. There are two
U-type instructions, `lui` and `auipc`, which have slightly different data
paths.

The `lui` instruction is used to build large constants. It takes a 20-bit
immediate, shifts it left by 12 bits (filling the lower 12 bits with zeros), and
writes the result to a destination register. The operation is `rd = imm << 12`.

Let's use a concrete example: `lui a0, 0x80001`. This will result in `a0`
holding the value `0x80001000`.

###### Step 1: Instruction Fetch
1. The **PC** outputs the address of the `lui` instruction.
2. The **Instruction Memory** fetches the 32-bit instruction word. The fields
   would be: `opcode=0110111`, `rd=01010` (a0), and `imm=10000000000000000001`
   (0x80001).
3. The adder calculates the default next address, `PC + 4`.

###### Step 2: Instruction Decode & Control Signal Generation
1. The 32-bit instruction is passed to the **Control Unit**, **Registers Unit**,
   and **Immediate Generator**.
2. The **Immediate Generator** extracts the 20-bit immediate (`0x80001`) and
   creates a 32-bit value by shifting it left 12 places, resulting in
   `0x80001000`.
3. The **Control Unit** decodes the `opcode` (`0110111`) and generates signals
   to pass the immediate through the ALU to the register file.

| Signal          | Value            | Reason                                                                                 |
| :-------------- | :--------------- | :------------------------------------------------------------------------------------- |
| **RUWr**        | `1`              | `lui` writes a result to the destination register.                                     |
| **ALUASrc**     | `0`              | We need a zero source. This can be accomplished by selecting `RS1Data` and using `x0`. |
| **ALUBSrc**     | `1`              | The second ALU operand is the shifted immediate from the Immediate Generator.          |
| **ALUOp**       | `ADD`            | The ALU will perform `0 + Immediate`, effectively passing the immediate through.       |
| **DMWr**        | `0`              | `lui` does not access data memory.                                                     |
| **RUDataWrSrc** | `ALURes`         | The result to be written comes from the ALU.                                           |
| **IMMSrc**      | `U-type`         | Tells the Immediate Generator how to format the immediate.                             |
| **BrOp**        | `X` (Don't Care) | Not a branch instruction.                                                              |

4. The `rd` field is sent to the **Registers Unit**. The `rs1` field, though not
   present in the U-type format, is effectively treated as `x0` to provide a
   zero input to the ALU.

###### Step 3: Register Read
This stage is effectively inactive. The control logic selects register `x0`
(zero) as the first source operand.

###### Step 4: Execute
1. The first input to the **ALU** is `0` (from register `x0`).
2. The second input to the **ALU** is the 32-bit shifted immediate
   (`0x80001000`) from the **Immediate Generator**.
3. The **ALU**, instructed by `ALUOp=ADD`, computes `ALURes = 0 + 0x80001000`.
4. The result, `0x80001000`, is placed on the `ALURes` output.

###### Step 5: Memory Access
This stage is inactive.

###### Step 6: Write Back
1. The `ALURes` value (`0x80001000`) is selected by the write-back multiplexor
   and sent to the `DataWr` input of the **Registers Unit**.
2. With `RUWr=1`, the **Registers Unit** writes this value into the destination
   register `rd` (`a0`).
3. The **PC** is updated to `PC + 4`.

##### U type instructions: `auipc`

The `auipc` instruction is used for generating PC-relative addresses, essential
for position-independent code. It takes a 20-bit immediate, shifts it left by 12
bits, adds it to the current `PC`, and writes the result to a destination
register. The operation is `rd = PC + (imm << 12)`.

Let's use an example: `auipc t0, 0x1`. If the PC is `0x2000`, this will result
in `t0` holding the value `0x2000 + 0x1000 = 0x3000`.

###### Step 1: Instruction Fetch
This step is identical to `lui`. The instruction is fetched and `PC+4` is
calculated.

###### Step 2: Instruction Decode & Control Signal Generation
1. The **Immediate Generator** extracts the 20-bit immediate (`0x1`) and creates
   a 32-bit value by shifting it left 12 places, resulting in `0x00001000`.
2. The **Control Unit** decodes the `opcode` (`0010111`) for `auipc`.

| Signal          | Value    | Reason                                                     |
| :-------------- | :------- | :--------------------------------------------------------- |
| **RUWr**        | `1`      | `auipc` writes a result to the destination register.       |
| **ALUASrc**     | `1`      | **Key difference:** The first ALU operand is the **PC**.   |
| **ALUBSrc**     | `1`      | The second ALU operand is the shifted immediate.           |
| **ALUOp**       | `ADD`    | The ALU's job is to add the PC and the immediate.          |
| **DMWr**        | `0`      | `auipc` does not access data memory.                       |
| **RUDataWrSrc** | `ALURes` | The result to be written comes from the ALU.               |
| **IMMSrc**      | `U-type` | Tells the Immediate Generator how to format the immediate. |

#### Step 3: Register Read
This stage is inactive as no source registers are used.

#### Step 4: Execute
1. The current value of the **PC** is routed to the first input of the **ALU**
   (selected by `ALUASrc=1`).
2. The 32-bit shifted immediate (`0x00001000`) is routed to the second input of
   the **ALU**.
3. The **ALU** performs the addition: `ALURes = PC + 0x00001000`.
4. The result is placed on the `ALURes` output.

#### Step 5: Memory Access
This stage is inactive.

#### Step 6: Write Back
1. The `ALURes` value (e.g., `0x3000`) is sent to the `DataWr` input of the
   **Registers Unit**.
2. With `RUWr=1`, the **Registers Unit** writes this value into the destination
   register `rd` (`t0`).
3. The **PC** is updated to `PC + 4`.

## TODO

A common point of confusion is the "64" in RV64. This number refers to the width
of the general-purpose registers and the address space (i.e., 64-bit data and
pointers), not the size of the instructions themselves. The RISC-V ISA maintains
a fixed 32-bit instruction length for its base instruction set, regardless of
whether the architecture is RV32, RV64, or RV128.

However, the standard also includes the **"C" extension for Compressed
Instructions**. When this extension is enabled, the processor can also execute
16-bit instructions. These are simply shorter, more compact encodings of the
most frequently used 32-bit base instructions, designed to improve code density.

Therefore, in a typical RV64 system that supports the "C" extension (often
denoted as RV64GC), the instructions you will find are a mix of both **32-bit**
and **16-bit** formats.

### Pipe line

