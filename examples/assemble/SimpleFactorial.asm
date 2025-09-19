# factorial.asm
# Computes the factorial of n
# input: a0 = n
# output: t0 = n!

    li a0, 5        # n = 5 (you can change this value)
    li t0, 1        # result = 1
    li t1, 1        # i = 1

loop:
    bgt t1, a0, end   # if i > n, exit loop
    mul t0, t0, t1    # result *= i
    addi t1, t1, 1    # i++
    beq zero, zero, loop  # unconditional jump to loop

end:
    ebreak
    # final result is stored in t0
