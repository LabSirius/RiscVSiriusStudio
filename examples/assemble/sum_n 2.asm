# sum_n.asm
# Computes the sum of the first n numbers
# input: a0 = n
# output: t0 = sum(1..n)
    li a0, 5        # n = 5
    li t0, 0        # sum = 0
    li t1, 1        # i = 1
loop:
    bgt t1, a0, end # if i > n, break
    add t0, t0, t1  # sum += i
    addi t1, t1, 1  # i++
    beq zero,zero, loop  # jump to loop
end:
    # result is in t0
