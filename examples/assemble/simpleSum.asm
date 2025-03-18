main:
  addi sp, sp, -32
  sw  ra, 28(sp)
  sw  s0, 24(sp)
  addi s0, sp, 32
  addi a0, zero, 0 # li a0, 0
  sw  a0, -12(s0)
  sw  a0, -16(s0)
  addi a1, zero, 19
  sw  a1, -20(s0)
  addi a1, zero, 42 # li a1, 42
  sw  a1, -24(s0)
  lw  a1, -20(s0)
  lw  a2, -24(s0)
  add  a1, a1, a2
  sw  a1, -16(s0)
  lw  ra, 28(sp)
  lw  s0, 24(sp)
  addi sp, sp, 32
  jalr zero, x1, 0 # ret