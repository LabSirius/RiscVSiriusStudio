# ALU corner cases in RISC-V Assembly

# Test Values Used:
# x1 = 0xFFFFFFFF (-1 signed, max unsigned)
# x2 = 0x00000001 (1)
# x3 = 0x00000000 (0)
# x4 = 0x80000000 (minimum 32-bit signed integer)
# x5 = 0x7FFFFFFF (maximum 32-bit signed integer)
# x6 = 31 (maximum valid shift amount)
# x7 = 32 (invalid shift amount, should mask to 0)

# Setup test values
addi x1, x0, -1          # x1 = 0xFFFFFFFF (-1)
addi x2, x0, 1           # x2 = 1
addi x3, x0, 0           # x3 = 0

# Load 0x80000000 into x4
lui x4, 0x80000          # x4 = 0x80000000

# Load 0x7FFFFFFF into x5
# Using li pseudoinstruction to simplify loading large immediate
li x5, 0x7FFFFFFF        # x5 = max 32-bit signed int
    
# Second attempt to load 0x7FFFFFFF using lui and addi
lui x31, 0x7FFF
#addi x31, x31, 0xFFF 

addi x6, x0, 31          # x6 = 31
addi x7, x0, 32          # x7 = 32 (will be masked in shifts)
   
# ADD corner cases
add  x8,  x1,  x2        # -1 + 1 = 0
add  x9,  x5,  x2        # MAX_INT + 1 overflow
add  x10, x4,  x1        # MIN_INT + (-1) underflow
add  x11, x3,  x3        # 0 + 0 = 0

# SUB corner cases
sub  x12, x3,  x2        # 0 - 1 = -1
sub  x13, x4,  x2        # MIN_INT - 1 underflow
sub  x14, x5,  x1        # MAX_INT - (-1) overflow
sub  x15, x1,  x1        # x - x = 0

# MUL corner cases
mul  x16, x1,  x1        # (-1)*(-1) = 1
mul  x17, x4,  x2        # MIN_INT * 1
mul  x18, x3,  x1        # 0 * (-1) = 0
mul  x19, x5,  x5        # MAX_INT * MAX_INT overflow

# DIV corner cases
div  x20, x4,  x1        # MIN_INT / (-1) overflow
div  x21, x2,  x3        # 1 / 0 = -1 (division by zero)
div  x22, x3,  x3        # 0 / 0 = -1 (division by zero)
div  x23, x1,  x2        # (-1) / 1 = -1

# DIVU corner cases
divu x24, x1,  x2        # 0xFFFFFFFF / 1
divu x25, x2,  x3        # 1 / 0 = 0xFFFFFFFF (division by zero)
divu x26, x3,  x3        # 0 / 0 = 0xFFFFFFFF (division by zero)

# REM corner cases
rem  x27, x4,  x1        # MIN_INT % (-1) = 0
rem  x28, x2,  x3        # 1 % 0 = 1 (rem by zero)
rem  x29, x3,  x3        # 0 % 0 = 0

# REMU corner cases
remu x30, x1,  x2        # 0xFFFFFFFF % 1 = 0
remu x31, x2,  x3        # 1 % 0 = 1 (rem by zero)

# SLL corner cases
sll  x8,  x2,  x6        # 1 << 31 = MIN_INT
sll  x9,  x2,  x7        # 1 << 32 masked to 1 << 0 = 1
sll  x10, x1,  x6        # 0xFFFFFFFF << 31
sll  x11, x3,  x6        # 0 << 31 = 0

# SRL corner cases
srl  x12, x1,  x6        # 0xFFFFFFFF >> 31 = 1
srl  x13, x4,  x6        # MIN_INT >> 31 = 1
srl  x14, x2,  x7        # 1 >> 32 masked to 1 >> 0 = 1
srl  x15, x3,  x6        # 0 >> 31 = 0

# SRA corner cases
sra  x16, x1,  x6        # (-1) >>a 31 = -1
sra  x17, x4,  x6        # MIN_INT >>a 31 = -1
sra  x18, x5,  x6        # MAX_INT >>a 31 = 0
sra  x19, x2,  x7        # 1 >>a 32 masked to 1 >>a 0 = 1

# AND corner cases
and  x20, x1,  x3        # 0xFFFFFFFF & 0 = 0
and  x21, x1,  x1        # x & x = x
and  x22, x4,  x5        # MIN_INT & MAX_INT = 0

# OR corner cases
or   x23, x1,  x3        # 0xFFFFFFFF | 0 = 0xFFFFFFFF
or   x24, x3,  x3        # 0 | 0 = 0
or   x25, x4,  x5        # MIN_INT | MAX_INT = -1

# XOR corner cases
xor  x26, x1,  x1        # x ^ x = 0
xor  x27, x1,  x3        # 0xFFFFFFFF ^ 0 = 0xFFFFFFFF
xor  x28, x4,  x5        # MIN_INT ^ MAX_INT = -1

# SLT corner cases (signed less-than)
slt  x29, x4,  x5        # MIN_INT < MAX_INT = 1
slt  x30, x5,  x4        # MAX_INT < MIN_INT = 0
slt  x31, x1,  x3        # (-1) < 0 = 1
slt  x8,  x3,  x1        # 0 < (-1) = 0
slt  x9,  x1,  x1        # x < x = 0

# SLTU corner cases (unsigned less-than)
sltu x10, x1,  x2        # 0xFFFFFFFF <u 1 = 0
sltu x11, x2,  x1        # 1 <u 0xFFFFFFFF = 1
sltu x12, x4,  x5        # MIN_INT <u MAX_INT = 0
sltu x13, x3,  x3        # 0 <u 0 = 0

nop                      # No operation

ebreak                   # End program or breakpoint to stop execution
