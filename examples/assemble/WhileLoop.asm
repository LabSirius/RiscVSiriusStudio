main:
        addi    sp, sp, -16
        sw      ra, 12(sp)
        sw      s0, 8(sp)
        addi    s0, sp, 16
        li      a0, 0
        sw      a0, -12(s0)
        li      a0, 10
        sw      a0, -16(s0)
        j       .LBB0_1
.LBB0_1:
        lw      a1, -16(s0)
        li      a0, 0
        bge     a0, a1, .LBB0_3
        j       .LBB0_2
.LBB0_2:
        lw      a0, -16(s0)
        addi    a0, a0, -1
        sw      a0, -16(s0)
        j       .LBB0_1
.LBB0_3:
        lw      a0, -12(s0)
        lw      ra, 12(sp)
        lw      s0, 8(sp)
        addi    sp, sp, 16
        ret