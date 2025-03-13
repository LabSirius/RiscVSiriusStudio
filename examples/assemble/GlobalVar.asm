
global_var:
   li x3, 42

get_value():
   addi    sp,sp,-16
   sw      ra,12(sp)
   sw      s0,8(sp)
   addi    s0,sp,16
   lui     a5,%hi(global_var)
   lw      a5,%lo(global_var)(a5)
   mv      a0,a5
   lw      ra,12(sp)
   lw      s0,8(sp)
   addi    sp,sp,16
   jr      ra