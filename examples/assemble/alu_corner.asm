# Test Values Used:
# x1 = 0xFFFFFFFF (-1 signed, max unsigned)
# x2 = 0x00000001 (1)
# x3 = 0x00000000 (0)
# x4 = 0x80000000 (minimum 32-bit signed integer)
# x5 = 0x7FFFFFFF (maximum 32-bit signed integer)
# x6 = 31 (maximum valid shift amount)
# x7 = 32 (invalid shift amount, will be masked to 0)

# Setup test values
addi x1, x0, -1            # x1 = 0xFFFFFFFF (-1 signed, 4294967295 unsigned)
addi x2, x0, 1             # x2 = 0x00000001 (1)
addi x3, x0, 0             # x3 = 0x00000000 (0)

# Load 0x80000000 into x4
lui x4, 0x80000            # x4 = 0x80000000 (-2147483648 signed)

# Load 0x7FFFFFFF into x5
li x5, 0x7FFFFFFF          # x5 = 0x7FFFFFFF (2147483647 signed)

# Alternative loading max int into x31:
lui x31, 0x7FFF            # x31 = 0x7FFF0000 (2147418112)
addi x31, x31, -1          # x31 = 0x7FFFFFFF (2147483647)

addi x6, x0, 31            # x6 = 31
addi x7, x0, 32            # x7 = 32 (will be masked to 0 in shift instructions)

# ADD corner cases
add  x8,  x1,  x2          # x8 = 0x00000000 (0 + 1 + -1) => expected 0
add  x9,  x5,  x2          # x9 = 0x80000000 (2147483647 + 1 overflow to -2147483648)
add  x10, x4,  x1          # x10 = 0x7FFFFFFF (-2147483648 + -1 = 2147483647 due to overflow)
add  x11, x3,  x3          # x11 = 0x00000000 (0 + 0 = 0)

# SUB corner cases
sub  x12, x3,  x2          # x12 = 0xFFFFFFFF (0 - 1 = -1 signed)
sub  x13, x4,  x2          # x13 = 0x7FFFFFFF (-2147483648 - 1 = 2147483647, overflow)
sub  x14, x5,  x1          # x14 = 0x80000000 (2147483647 - (-1) = -2147483648)
sub  x15, x1,  x1          # x15 = 0x00000000 (-1 - (-1) = 0)

# MUL corner cases
mul  x16, x1,  x1          # x16 = 0x00000001 (-1 * -1 = 1)
mul  x17, x4,  x2          # x17 = 0x80000000 (-2147483648 * 1 = -2147483648)
mul  x18, x3,  x1          # x18 = 0x00000000 (0 * -1 = 0)
mul  x19, x5,  x5          # x19 = Low 32 bits of (2147483647 * 2147483647) = 0x00000001 (overflow, exact product is > 32 bits)
                            # Note: mul produces lower 32 bits, product = 0xFFFFFFFE00000001 truncated to 0x00000001

# DIV corner cases
div  x20, x4,  x1          # x20 = 0x80000000 (-2147483648 / -1 = overflow since abs(MIN_INT) > MAX_INT)
div  x21, x2,  x3          # x21 = 0xFFFFFFFF (1 / 0 = -1 per RISC-V div-by-zero behavior)
div  x22, x3,  x3          # x22 = 0xFFFFFFFF (0 / 0 = -1 per RISC-V div-by-zero behavior)
div  x23, x1,  x2          # x23 = 0xFFFFFFFF (-1 / 1 = -1)

# DIVU corner cases
divu x24, x1,  x2          # x24 = 0xFFFFFFFF (0xFFFFFFFF / 1 = 0xFFFFFFFF)
divu x25, x2,  x3          # x25 = 0xFFFFFFFF (1 / 0 = max unsigned, 0xFFFFFFFF)
divu x26, x3,  x3          # x26 = 0xFFFFFFFF (0 / 0 = max unsigned, 0xFFFFFFFF)

# REM corner cases
rem  x27, x4,  x1          # x27 = 0x00000000 (-2147483648 % -1 = 0)
rem  x28, x2,  x3          # x28 = 0x00000001 (1 % 0 = dividend = 1)
rem  x29, x3,  x3          # x29 = 0x00000000 (0 % 0 = dividend = 0)

# REMU corner cases
remu x30, x1,  x2          # x30 = 0x00000000 (0xFFFFFFFF % 1 = 0)
remu x31, x2,  x3          # x31 = 0x00000001 (1 % 0 = dividend = 1)

# SLL corner cases
sll  x8,  x2,  x6          # x8 = 0x80000000 (1 << 31 = -2147483648)
sll  x9,  x2,  x7          # x9 = 0x00000001 (1 << 32 masked to shift 0)
sll  x10, x1,  x6          # x10= 0x80000000 (0xFFFFFFFF << 31 results in 0x80000000)
sll  x11, x3,  x6          # x11= 0x00000000 (0 << 31 = 0)

# SRL corner cases
srl  x12, x1,  x6          # x12= 0x00000001 (0xFFFFFFFF >> 31 = 1)
srl  x13, x4,  x6          # x13= 0x00000001 (0x80000000 >> 31 = 1)
srl  x14, x2,  x7          # x14= 0x00000001 (1 >> 32 masked to 0, so no shift)
srl  x15, x3,  x6          # x15= 0x00000000 (0 >> 31 = 0)

# SRA corner cases
sra  x16, x1,  x6          # x16= 0xFFFFFFFF (-1 >>a 31 = -1, sign-extended)
sra  x17, x4,  x6          # x17= 0xFFFFFFFF (-2147483648 >>a 31 = -1)
sra  x18, x5,  x6          # x18= 0x00000000 (2147483647 >>a 31 = 0)
sra  x19, x2,  x7          # x19= 0x00000001 (1 >>a 32 masked to 0)

# AND corner cases
and  x20, x1,  x3          # x20= 0x00000000 (0xFFFFFFFF & 0 = 0)
and  x21, x1,  x1          # x21= 0xFFFFFFFF (x & x = x)
and  x22, x4,  x5          # x22= 0x00000000 (-2147483648 & 2147483647 = 0)

# OR corner cases
or   x23, x1,  x3          # x23= 0xFFFFFFFF (0xFFFFFFFF | 0 = 0xFFFFFFFF)
or   x24, x3,  x3          # x24= 0x00000000 (0 | 0 = 0)
or   x25, x4,  x5          # x25= 0xFFFFFFFF (-2147483648 | 2147483647 = -1)

# XOR corner cases
xor  x26, x1,  x1          # x26= 0x00000000 (x ^ x = 0)
xor  x27, x1,  x3          # x27= 0xFFFFFFFF (0xFFFFFFFF ^ 0 = 0xFFFFFFFF)
xor  x28, x4,  x5          # x28= 0xFFFFFFFF (-2147483648 ^ 2147483647 = -1)

# SLT corner cases (signed less-than)
slt  x29, x4,  x5          # x29= 1 (MIN_INT < MAX_INT)
slt  x30, x5,  x4          # x30= 0 (MAX_INT < MIN_INT)
slt  x31, x1,  x3          # x31= 1 (-1 < 0)
slt  x8,  x3,  x1          # x8 = 0 (0 < -1)
slt  x9,  x1,  x1          # x9 = 0 (x < x)

# SLTU corner cases (unsigned less-than)
sltu x10, x1,  x2          # x10= 0 (0xFFFFFFFF <u 1 = false)
sltu x11, x2,  x1          # x11= 1 (1 <u 0xFFFFFFFF = true)
sltu x12, x4,  x5          # x12= 0 (0x80000000 <u 0x7FFFFFFF = false)
sltu x13, x3,  x3          # x13= 0 (0 <u 0)

# --- Additional Test Cases ---

# ADDI corner cases
addi x14, x1, 1            # x14 = 0x00000000 (-1 + 1 = 0)
addi x15, x5, 1            # x15 = 0x80000000 (MAX_INT + 1 = MIN_INT, overflow)
addi x16, x4, -1           # x16 = 0x7FFFFFFF (MIN_INT - 1 = MAX_INT, overflow)
addi x17, x3, 0            # x17 = 0x00000000 (0 + 0 = 0)

# SLLI corner cases
slli x18, x2, 31           # x18 = 0x80000000 (1 << 31)
slli x19, x2, 0            # x19 = 0x00000001 (1 << 0)
slli x20, x1, 1            # x20 = 0xFFFFFFFE (-1 << 1 = -2)

# SRLI corner cases
srli x21, x1, 31           # x21 = 0x00000001 (0xFFFFFFFF >> 31)
srli x22, x4, 31           # x22 = 0x00000001 (0x80000000 >> 31)
srli x23, x2, 0            # x23 = 0x00000001 (1 >> 0)

# SRAI corner cases
srai x24, x1, 31           # x24 = 0xFFFFFFFF (-1 >>a 31)
srai x25, x4, 31           # x25 = 0xFFFFFFFF (MIN_INT >>a 31)
srai x26, x5, 31           # x26 = 0x00000000 (MAX_INT >>a 31)
srai x27, x2, 0            # x27 = 0x00000001 (1 >>a 0)

# ANDI corner cases
andi x28, x1, 0            # x28 = 0x00000000 (0xFFFFFFFF & 0 = 0)
andi x29, x1, -1           # x29 = 0xFFFFFFFF (0xFFFFFFFF & -1 = 0xFFFFFFFF)
andi x30, x5, 0x7FFFFFFF   # x30 = 0x7FFFFFFF (MAX_INT & MAX_INT = MAX_INT)

# ORI corner cases
ori  x8,  x1, 0            # x8 = 0xFFFFFFFF (0xFFFFFFFF | 0 = 0xFFFFFFFF)
ori  x9,  x3, 0            # x9 = 0x00000000 (0 | 0 = 0)
ori  x10, x4, 0x7FFFFFFF   # x10 = 0xFFFFFFFF (MIN_INT | MAX_INT = -1)

# XORI corner cases
xori x11, x1, 0            # x11 = 0xFFFFFFFF (0xFFFFFFFF ^ 0 = 0xFFFFFFFF)
xori x12, x1, -1           # x12 = 0x00000000 (0xFFFFFFFF ^ 0xFFFFFFFF = 0)
xori x13, x4, 0x7FFFFFFF   # x13 = 0xFFFFFFFF (MIN_INT ^ MAX_INT = -1)

# SLTI corner cases
slti x14, x4, -1           # x14 = 1 (MIN_INT < -1)
slti x15, x5, 0            # x15 = 0 (MAX_INT < 0)
slti x16, x3, 1            # x16 = 1 (0 < 1)

# SLTIU corner cases
sltiu x17, x1, 1           # x17 = 0 (0xFFFFFFFF <u 1 = false)
sltiu x18, x2, 0xFFFFFFFF  # x18 = 1 (1 <u 0xFFFFFFFF = true)
sltiu x19, x4, 0x7FFFFFFF  # x19 = 0 (0x80000000 <u 0x7FFFFFFF = false)

# More general cases
add x20, x0, x2            # x20 = 1 (Test x0 as operand)
sub x21, x0, x2            # x21 = -1 (Test x0 as operand)
mul x22, x0, x2            # x22 = 0 (Test x0 as operand)

nop                        # no effect on registers

ebreak                     # program end / breakpoint