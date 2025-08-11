
## Initialize test values
addi x1, x0, 10  # x1 = 10
addi x2, x0, 20  # x2 = 20
addi x3, x0, -1  # x3 = -1
addi x4, x0, 5   # x4 = 5

## Arithmetic operations
add x5, x1, x2  # x5 = 10 + 20 = 30
sub x6, x1, x2  # x6 = 10 - 20 = -10

## Logical operations
and x7, x1, x3  # x7 = 10 & (-1) = 10
or x8, x1, x2   # x8 = 10 | 20 = 30
xor x9, x1, x2  # x9 = 10 ^ 20 = 30

## Shift operations
slli x10, x1, 2 # x10 = 10 << 2 = 40
srai x11, x3, 2 # x11 = -1 >>a 2 = -1

## Comparison operations
slti x13, x1, 0x12 # x13 = (10 < 18) ? 1 : 0
sltiu x14, x1, 0x22 # x14 = (10 <u 34) ? 1 : 0

## Multiplication and division
mul x15, x1, x2 # x15 = 10 * 20 = 200
div x16, x2, x1 # x16 = 20 / 10 = 2

## Program termination
ebreak