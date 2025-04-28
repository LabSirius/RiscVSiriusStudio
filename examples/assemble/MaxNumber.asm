j main
max(int, int):
        addi    sp, sp, -32
        sw      ra, 28(sp)
        sw      s0, 24(sp)
        addi    s0, sp, 32
        sw      a0, -16(s0)
        sw      a1, -20(s0)
        lw      a1, -16(s0)
        lw      a0, -20(s0)
        bge     a0, a1, .LBB0_2
        j       .LBB0_1
.LBB0_1:
        lw      a0, -16(s0)
        sw      a0, -12(s0)
        j       .LBB0_3         
.LBB0_2:
        lw      a0, -20(s0)
        sw      a0, -12(s0)
        j       .LBB0_3
.LBB0_3:
        lw      a0, -12(s0)
        lw      ra, 28(sp)
        lw      s0, 24(sp)
        addi    sp, sp, 32
        ret

main:
        addi    sp, sp, -32
        sw      ra, 28(sp)
        sw      s0, 24(sp)
        addi    s0, sp, 32
        li      a0, 3
        sw      a0, -16(s0)
        li      a0, 8
        sw      a0, -20(s0)
        lw      a0, -16(s0)
        lw      a1, -20(s0)
        call    max(int, int)
        sw      a0, -12(s0)
        li      a0, 0
        lw      ra, 28(sp)
        lw      s0, 24(sp)
        addi    sp, sp, 32
        ret