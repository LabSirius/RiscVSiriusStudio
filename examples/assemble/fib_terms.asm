# Generate Fibonacci Terms in RISC-V Assembly
# This program calculates the first six terms of the Fibonacci sequence
#
#  Register Usage:
#  - x1: Previous Fibonacci number (F[n-1])
#  - x2: Current Fibonacci number (F[n])
#  - x3: Next Fibonacci number (F[n+1])
#  
#  Fibonacci Sequence Generated: 0, 1, 1, 2, 3, 5, 8

addi x1, x0, 0 # x1 = 0
addi x2, x0, 1 # x2 = 1

## Calculate F2 = F1 + F0 = 1 + 0 = 1
add x3, x1, x2  #x3 = x1 + x2
addi x1, x2, 0  #x1 = x2
addi x2, x3, 0  #x2 = x3

## Calculate F3 = F2 + F1 = 1 + 1 = 2
add x3, x1, x2  # x3 = x1 + x2
addi x1, x2, 0  # x1 = x2
addi x2, x3, 0  # x2 = x3

## Calculate F4 = F3 + F2 = 2 + 1 = 3
add x3, x1, x2  # x3 = x1 + x2
addi x1, x2, 0  # x1 = x2
addi x2, x3, 0  # x2 = x3

## Calculate F5 = F4 + F3 = 3 + 2 = 5
add x3, x1, x2  # x3 = x1 + x2
addi x1, x2, 0  # x1 = x2
addi x2, x3, 0  # x2 = x3

## Calculate F6 = F5 + F4 = 5 + 3 = 8
add x3, x1, x2  # x3 = x1 + x2
addi x1, x2, 0  # x1 = x2
addi x2, x3, 0  # x2 = x3

## Program termination
ebreak