li a0, 3  # factorial(3) 
fact:
  # arg: n in a0, returns n! in a0
  addi sp, sp, -8     # reserve stack space for 2 registers
  sw   ra, 0(sp)      # save the return address on the stack

  li   t0, 2
  blt  a0, t0, ret_one # if n < 2 (i.e., 0 or 1), result is 1

  sw   a0, 4(sp)      # save our current n on the stack
  addi a0, a0, -1     # n = n - 1
  jal  fact           # recursive call: fact(n-1)
                      # result of fact(n-1) is now in a0

  lw   t0, 4(sp)      # restore original n from stack into t0
  mul  a0, t0, a0     # a0 = n * fact(n-1)
  j    done

ret_one:
  li   a0, 1          # base case: result is 1

done:
  lw   ra, 0(sp)      # restore return address from stack
  addi sp, sp, 8      # free our stack frame
  jr   ra             # and return