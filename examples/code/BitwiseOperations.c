
int main() {
   int result_and, result_or, result_xor;
   int a = 0b1010;  
   int b = 0b1100;  
   
   result_and = a & b;  // 1010 & 1100 = 1000 (8)
   result_or  = a | b;  // 1010 | 1100 = 1110 (14)
   result_xor = a ^ b;  // 1010 ^ 1100 = 0110 (6)
}
