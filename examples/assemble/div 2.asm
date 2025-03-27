# Integer division via repeated subtraction
# Input:  a0 = dividend, a1 = divisor
# Output: a0 = quotient

div_sub:
    li t0, 0          # t0 = quotient

div_loop:
    blt a0, a1, div_done  # while dividend < divisor: break
    sub a0, a0, a1        # dividend -= divisor
    addi t0, t0, 1        # quotient++
    jal zero, div_loop

div_done:
    mv a0, t0             # move quotient to a0 (return value)
    ret
