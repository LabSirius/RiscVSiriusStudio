main:
        addi    sp, sp, -32
        sw      ra, 28(sp)
        sw      s0, 24(sp)
        addi    s0, sp, 32
        li      a0, 7
        sw      a0, -24(s0)
        li      a0, 10
        sw      a0, -28(s0)
        lw      a0, -24(s0)
        lw      a1, -28(s0)
        slt     a0, a0, a1
        sw      a0, -12(s0)
        lw      a1, -24(s0)
        lw      a0, -28(s0)
        slt     a0, a0, a1
        sw      a0, -16(s0)
        lw      a0, -24(s0)
        lw      a1, -28(s0)
        xor     a0, a0, a1
        seqz    a0, a0
        sw      a0, -20(s0)
        li      a0, 0
        lw      ra, 28(sp)
        lw      s0, 24(sp)
        addi    sp, sp, 32
        ret