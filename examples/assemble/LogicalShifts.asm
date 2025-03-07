main:
        addi    sp, sp, -32
        sw      ra, 28(sp)
        sw      s0, 24(sp)
        addi    s0, sp, 32
        li      a0, 4
        sw      a0, -20(s0)
        lw      a0, -20(s0)
        slli    a0, a0, 1
        sw      a0, -12(s0)
        lw      a0, -20(s0)
        srai    a0, a0, 1
        sw      a0, -16(s0)
        li      a0, 0
        lw      ra, 28(sp)
        lw      s0, 24(sp)
        addi    sp, sp, 32
        ret