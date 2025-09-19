# sum_n.asm
# Computes the sum of the first n numbers
# input: a0 = n
# output: t0 = sum(1..n)
    li a1, 2
    li a0, 5  
    add a2, a1, a0      # n = 5
    sw a2, 0x18(zero)
    lw a3, 0x18(zero)
    ebreak # result is in t0