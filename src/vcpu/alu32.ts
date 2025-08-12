export class ALU32 {
  public static addition(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    const br = BigInt.asIntN(32, ba) + BigInt.asIntN(32, bb);
    return BigInt.asIntN(32, br);
  }

  public static subtraction(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    const br = BigInt.asIntN(32, ba) - BigInt.asIntN(32, bb);
    return BigInt.asIntN(32, br);
  }

  public static shiftLeft(a: string, b: string): BigInt {
    const ba = Number(a);
    const bb = Number(b);
    if (bb < 0 || bb > 31) {
      throw new Error('Incorrect shift value ' + bb);
    }
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
    // << produces a 32 bits integer.
    const br = ba << bb;
    return BigInt(br);
  }

  public static shiftRight(a: string, b: string): BigInt {
    const ba = Number(a);
    const bb = Number(b);
    if (bb < 0 || bb > 31) {
      throw new Error('Incorrect shift value ' + bb);
    }
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift
    // << produces a 32 bits integer.
    const br = ba >>> bb;
    return BigInt(br);
  }

  public static shiftRightA(a: string, b: string): BigInt {
    const ba = Number(a);
    const bb = Number(b);
    if (bb < 0 || bb > 31) {
      throw new Error('Incorrect shift value ' + bb);
    }
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Right_shift
    // << produces a 32 bits integer.
    const br = ba >> bb;
    return BigInt(br);
  }

  public static lessThan(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    const result = BigInt(BigInt.asIntN(32, ba) < BigInt.asIntN(32, bb));
    return result;
  }

  public static lessThanU(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    const result = BigInt(ba < bb);
    return result;
  }

  public static xor(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
    // << produces a 32 bits integer.
    const br = ba ^ bb;
    return BigInt(br);
  }

  public static or(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
    // << produces a 32 bits integer.
    const br = ba | bb;
    return BigInt(br);
  }

  public static and(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
    // << produces a 32 bits integer.
    const br = ba & bb;
    return BigInt(br);
  }

  public static mul(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);

    const br = ba * bb;
    return BigInt.asIntN(32, br);
  }

  public static mulh(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);

    const br = ba * bb;
    return BigInt.asIntN(32, br >> 32n);
  }

  public static mulsu(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);

    const br = ba * BigInt.asUintN(32, bb);
    return BigInt.asIntN(32, br >> 32n);
  }

  public static mulu(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);

    const br = BigInt.asUintN(32, ba) * BigInt.asUintN(32, bb);
    return BigInt.asUintN(32, br >> 32n);
  }

  public static div(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);

    if (bb === 0n) {
      /*
        According to the RISC - V specification, division by zero does not cause
        an exception or trap. Instead, the behavior is explicitly defined as
        follows:

        For signed division(div), the quotient result when dividing by zero is
        all bits set to 1. In 32 - bit, this corresponds to 0xFFFFFFFF, which is
        interpreted as -1 in two's complement signed integers.
      */
      return BigInt.asIntN(32, -1n);
    } else {
      return BigInt.asIntN(32, ba) / BigInt.asIntN(32, bb);
    }
  }

  public static divu(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);

    if (bb === 0n) {
      /*
        According to the RISC - V specification, division by zero does not cause
        an exception or trap. Instead, the behavior is explicitly defined as
        follows:

        For unsigned division(divu), the quotient result when dividing by zero
        is all bits set to 1. In 32 - bit, this corresponds to 0xFFFFFFFF,
        which is interpreted as 4294967295 in unsigned integers.
      */
      return BigInt.asUintN(32, 0xFFFFFFFFn);
    } else {
      return BigInt.asUintN(32, ba) / BigInt.asUintN(32, bb);
    }
  }

  public static rem(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);

    if (bb === 0n) {
      /*
        According to the RISC - V specification, division by zero does not cause
        an exception or trap. Instead, the behavior is explicitly defined as
        follows:

        For signed remainder(rem), the remainder result when dividing by zero
        is the value of the dividend. In other words, if you attempt to compute
        a % 0, the result is simply a.
      */
      return BigInt.asIntN(32, ba);
    } else {
      return BigInt.asIntN(32, ba) % BigInt.asIntN(32, bb);
    }
  }

  public static remu(a: string, b: string): BigInt {
    const ba = Number(a);
    const bb = Number(b);

    if (bb === 0) {
      /*
        According to the RISC - V specification, division by zero does not cause
        an exception or trap. Instead, the behavior is explicitly defined as
        follows:

        For unsigned remainder(remu), the remainder result when dividing by
        zero is the value of the dividend. In other words, if you attempt to
        compute a % 0, the result is simply a.
      */
      return BigInt.asUintN(32, BigInt(ba));
    } else {
      // TODO: I would do:
      //  return BigInt.asUintN(32, BigInt(ba % bb));
      const br = (ba >>> 0) % (bb >>> 0);
      return BigInt.asUintN(32, BigInt(br));
    }
  }

}
