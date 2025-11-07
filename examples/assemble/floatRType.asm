.section .text
    .globl _start

_start:
    #  Preparation: create floating-point values from integers 
    li   x5,  3             # x5 = 3
    fcvt.s.w  f1, x5        # f1 = 3.0          (fcvt.s.w  : integer -> float)
    li   x6,  2             # x6 = 2
    fcvt.s.w  f2, x6        # f2 = 2.0

    #  R-type Floating-point arithmetic 
    fadd.s   f3, f1, f2     # f3 = f1 + f2   -> 5.0
    fsub.s   f4, f1, f2     # f4 = f1 - f2   -> 1.0
    fmul.s   f5, f1, f2     # f5 = f1 * f2   -> 6.0
    fdiv.s   f6, f1, f2     # f6 = f1 / f2   -> 1.5
    fsqrt.s  f7, f5         # f7 = sqrt(f5)  -> sqrt(6.0)

    #  Sign / bit-manipulation (fsgnj family) 
    fsgnj.s  f8, f1, f2     # f8 = value of f1 but with sign of f2
    fsgnjn.s f9, f1, f2     # f9 = value of f1 but with negated sign of f2
    fsgnjx.s f10,f1, f2     # f10 = f1 with sign = f1.sign XOR f2.sign

    #  Min/Max 
    fmin.s   f11, f1, f2    # f11 = min(f1, f2) -> 2.0
    fmax.s   f12, f1, f2    # f12 = max(f1, f2) -> 3.0

    # Comparisons (return integer in rd) 
    feq.s    x7, f1, f2     # x7 = (f1 == f2) ? 1 : 0   -> 0
    flt.s    x8, f2, f1     # x8 = (f2 < f1) ? 1 : 0    -> 1
    fle.s    x9, f2, f2     # x9 = (f2 <= f2) ? 1 : 0   -> 1

    # FCLASS: returns mask in integer indicating FP category 
    fclass.s x10, f1        # x10 = mask describing if f1 is NaN/Inf/0/subnormal/normal

    # Bit movements between FP and integer
    fmv.x.s  x11, f3        # x11 = bitpat(f3)  (interprets f3 bits as integer)
    li       x12, 0x40400000  # example: 3.0 bit pattern in IEEE-754 (hex)
    fmv.s.x  f13, x12       # f13 = bitpat -> interprets x12 bits as float -> approximately 3.0

    #  Conversions (various forms using R format) 
    # float -> int (with rounding; RNE by default if rm is not passed)
    fcvt.w.s      x14, f5              # x14 = (int) f5  -> conversion to int32 (with rounding)
    fcvt.wu.s     x15, f6              # x15 = (uint32) f6

    # int -> float
    li        x16, -4
    fcvt.s.w      f14, x16             # f14 = -4.0

    # conversions with rounding specification (example)
    fcvt.w.s    x17, f6, rtz           # x17 = trunc(f6) (round toward zero)

    ebreak