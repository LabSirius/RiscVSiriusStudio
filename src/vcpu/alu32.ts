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
    const ba = BigInt(a);
    const bb = BigInt(b);
    if (bb < 0 || bb > 31) {
      throw new Error('Incorrect shift value ' + bb);
    }
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
    // << produces a 32 bits integer.
    const br = ba << bb;
    return BigInt(br);
  }

  public static shiftRight(a: string, b: string): BigInt {
    const ba = BigInt(a);
    const bb = BigInt(b);
    if (bb < 0 || bb > 31) {
      throw new Error('Incorrect shift value ' + bb);
    }
    // According to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Left_shift
    // << produces a 32 bits integer.
    const br = ba >> bb;
    return BigInt(br);
  }

  public static shiftRightA(a: string, b: string): boolean {
    throw new Error('Operation is not implemented');
  }

  public static lessThan(a: string, b: string): boolean {
    const ba = BigInt(a);
    const bb = BigInt(b);
    const result = BigInt.asIntN(32, ba) < BigInt.asIntN(32, bb);
    return result;
  }

  public static lessThanU(a: string, b: string): boolean {
    throw new Error('Operation is not implemented');
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
}
