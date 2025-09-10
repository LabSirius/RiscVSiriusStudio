main:
   li x1, -32
   li x3, 8
   li x4, 20

   sw x1, -4(sp)
   sh x3, -8(sp)
   sb x4, -12(sp)
   
   lw x5, -4(sp)
   lh x6, -8(sp)
   lb x7, -12(sp)
