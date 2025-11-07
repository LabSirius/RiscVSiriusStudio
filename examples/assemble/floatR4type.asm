
# Initialize floating-point registers

li x3, 23
li x4, 24
li x5, 25

fmv.s.x f1, x3
fmv.s.x f2, x4
fmv.s.x f3, x5

# Fused Multiply-Add/Sub operations
fmadd.s  f4, f1, f2, f3     # f4 = (f1 * f2) + f3
fmsub.s  f5, f1, f2, f3     # f5 = (f1 * f2) - f3
fnmsub.s f6, f1, f2, f3     # f6 = -(f1 * f2) + f3
fnmadd.s f7, f1, f2, f3     # f7 = -(f1 * f2) - f3

# Store results back to memory
fsw  f4, 12(x1)     # Store f4 result
fsw  f5, 16(x1)     # Store f5 result
fsw  f6, 20(x1)     # Store f6 result
fsw  f7, 24(x1)     # Store f7 result