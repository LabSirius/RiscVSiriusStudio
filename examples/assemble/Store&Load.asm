main:
   li x1, -32
   li x2, -48
   li x3, 34

   sw x1, 3(sp)
   sh x2, 4(sp)
   sb x3, 5(sp)
   
   lw x4, 3(sp)
   lh x5, 4(sp)
   lb x6, 5(sp)
