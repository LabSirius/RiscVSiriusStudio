# This part of the code is just to increment the PC to any value 
li t1, 20 # PC: 0
li t1, 20 # PC: 4
li t1, 20 # PC: 8
li t1, 20 # PC: C

main:
  jal ra, myFunction      # PC = 10, Call myFunction.
                          # 1. Sets ra = 0x10 + 4 = 0x14
                          # 2. Jumps to the address of myFunction (e.g., 0x20)

  addi t1, a0, 20 # PC: 14
  li t1, 20 # PC: 18
  
  ebreak    # PC: 1C

myFunction:
  # body of the function ...
  li t1, 20 # PC: 20
  li t1, 20 # PC: 24
  # ... result might be in a0 ...
  li a0, 42 # PC: 28
  # Now, return to the caller.
  jalr x0, 0(ra) # PC: 2C  Return from function.
                            # 1. Target address = value in ra + 0 = 0x14
                            # 2. Jumps to 0x14.
                            # 3. "Link" address (PC+4) is stored in x0, which discards it.